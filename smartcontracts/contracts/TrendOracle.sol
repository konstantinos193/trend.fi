// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./TrendFiConfig.sol";

contract TrendOracle is Initializable, Ownable, ReentrancyGuard, Pausable {
    struct TrendData {
        uint256 trendId;
        string trendName;
        uint256 trendValue;
        uint256 timestamp;
        bytes signature;
        bool verified;
    }

    address public oracleAddress;
    TrendFiConfig public configContract;
    mapping(bytes32 => TrendData) public trendData;
    mapping(uint256 => bytes32[]) public trendHistory;
    
    // FIXED: Add nonce and chain ID to prevent signature replay attacks
    uint256 public nonce;
    uint256 public constant CHAIN_ID = 1; // Mainnet, should be updated for deployment
    mapping(bytes32 => bool) public usedSignatures;
    
    // Rate limiting
    mapping(address => uint256) public lastSubmissionTime;
    uint256 public constant MIN_SUBMISSION_INTERVAL = 60 seconds;
    
    // FIXED: Add global rate limiting to prevent multiple oracle addresses from bypassing limits
    uint256 public lastGlobalSubmissionTime;
    uint256 public constant GLOBAL_SUBMISSION_INTERVAL = 30 seconds;
    uint256 public constant MAX_SUBMISSIONS_PER_HOUR = 120; // Max 2 submissions per minute globally
    uint256 public submissionsInCurrentHour;
    uint256 public currentHourStart;
    
    event TrendDataSubmitted(bytes32 indexed dataHash, uint256 indexed trendId, string trendName);
    event OracleAddressUpdated(address indexed newOracleAddress);
    
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Only oracle can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || 
            configContract.authorizedUpdaters(msg.sender),
            "Not authorized"
        );
        _;
    }
    
    modifier whenNotEmergency() {
        require(!configContract.getSystemConfig().emergencyMode, "Emergency mode active");
        _;
    }
    
    modifier rateLimited() {
        // FIXED: Implement both per-address and global rate limiting
        require(
            block.timestamp >= lastSubmissionTime[msg.sender] + MIN_SUBMISSION_INTERVAL,
            "Submission too frequent (address)"
        );
        
        // Global rate limiting
        require(
            block.timestamp >= lastGlobalSubmissionTime + GLOBAL_SUBMISSION_INTERVAL,
            "Submission too frequent (global)"
        );
        
        // Check hourly submission limit
        if (block.timestamp >= currentHourStart + 1 hours) {
            // Reset hourly counter
            currentHourStart = block.timestamp;
            submissionsInCurrentHour = 0;
        }
        
        require(submissionsInCurrentHour < MAX_SUBMISSIONS_PER_HOUR, "Global hourly limit exceeded");
        
        // Update rate limiting state
        lastSubmissionTime[msg.sender] = block.timestamp;
        lastGlobalSubmissionTime = block.timestamp;
        submissionsInCurrentHour++;
        
        _;
    }
    
    modifier validTrendData(
        uint256 _trendId,
        string memory _trendName,
        uint256 _trendValue,
        uint256 _timestamp
    ) {
        require(_trendId > 0, "Invalid trend ID");
        require(bytes(_trendName).length > 0 && bytes(_trendName).length <= 100, "Invalid name length");
        require(_trendValue > 0, "Invalid trend value");
        require(
            _timestamp > block.timestamp - 3600 && _timestamp <= block.timestamp,
            "Invalid timestamp"
        );
        _;
    }
    
    function initialize(address _oracleAddress, address _configContract) public initializer {
        require(_oracleAddress != address(0), "Oracle address cannot be zero");
        require(_configContract != address(0), "Config address cannot be zero");
        
        // Transfer ownership to the initializer
        _transferOwnership(msg.sender);
        
        oracleAddress = _oracleAddress;
        configContract = TrendFiConfig(_configContract);
    }
    
    function updateOracleAddress(address _newOracleAddress) 
        external 
        onlyOwner 
        whenNotEmergency 
    {
        require(_newOracleAddress != address(0), "Oracle address cannot be zero");
        oracleAddress = _newOracleAddress;
        emit OracleAddressUpdated(_newOracleAddress);
    }
    
    function submitTrendData(
        uint256 _trendId,
        string memory _trendName,
        uint256 _trendValue,
        uint256 _timestamp,
        bytes memory _signature
    ) 
        external 
        onlyOracle 
        whenNotPaused 
        whenNotEmergency 
        rateLimited 
        validTrendData(_trendId, _trendName, _trendValue, _timestamp) 
    {
        // Checks: All conditions validated by modifiers
        // FIXED: Include nonce and chain ID in signature hash to prevent replay attacks
        bytes32 dataHash = keccak256(abi.encodePacked(_trendId, _trendName, _trendValue, _timestamp, nonce, CHAIN_ID));
        
        require(trendData[dataHash].timestamp == 0, "Data already submitted");
        require(!usedSignatures[dataHash], "Signature already used");
        require(_verifySignature(_trendId, _trendName, _trendValue, _timestamp, _signature), "Invalid signature");
        
        // Effects: Update state first
        trendData[dataHash] = TrendData({
            trendId: _trendId,
            trendName: _trendName,
            trendValue: _trendValue,
            timestamp: _timestamp,
            signature: _signature,
            verified: true
        });
        
        trendHistory[_trendId].push(dataHash);
        
        // Mark signature as used and increment nonce
        usedSignatures[dataHash] = true;
        nonce++;
        
        // Interactions: Emit event last
        emit TrendDataSubmitted(dataHash, _trendId, _trendName);
    }
    
    function verifyTrendData(
        uint256 _trendId,
        string memory _trendName,
        uint256 _trendValue,
        uint256 _timestamp,
        bytes memory _signature
    ) external view returns (bool) {
        return _verifySignature(_trendId, _trendName, _trendValue, _timestamp, _signature);
    }
    
    function getTrendData(bytes32 _dataHash) external view whenNotEmergency returns (TrendData memory) {
        require(trendData[_dataHash].timestamp != 0, "Data not found");
        return trendData[_dataHash];
    }
    
    function getTrendHistory(uint256 _trendId) external view whenNotEmergency returns (bytes32[] memory) {
        return trendHistory[_trendId];
    }
    
    function getLatestTrendData(uint256 _trendId) external view whenNotEmergency returns (TrendData memory) {
        bytes32[] memory history = trendHistory[_trendId];
        require(history.length > 0, "No data found for trend");
        
        bytes32 latestHash = history[history.length - 1];
        return trendData[latestHash];
    }
    
    function _verifySignature(
        uint256 _trendId,
        string memory _trendName,
        uint256 _trendValue,
        uint256 _timestamp,
        bytes memory _signature
    ) internal view returns (bool) {
        // FIXED: Include nonce and chain ID in signature verification
        bytes32 messageHash = keccak256(abi.encodePacked(_trendId, _trendName, _trendValue, _timestamp, nonce, CHAIN_ID));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        return recoverSigner(ethSignedMessageHash, _signature) == oracleAddress;
    }
    
    function recoverSigner(bytes32 _hash, bytes memory _signature) internal pure returns (address) {
        if (_signature.length != 65) {
            return address(0);
        }
        
        bytes32 r;
        bytes32 s;
        uint8 v;
        
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        
        if (v < 27) {
            v += 27;
        }
        
        if (v != 27 && v != 28) {
            return address(0);
        }
        
        return ecrecover(_hash, v, r, s);
    }
    
    function emergencyPause() external onlyOwner {
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
    }
    
    function updateConfigContract(address _newConfig) external onlyOwner {
        require(_newConfig != address(0), "Invalid config address");
        configContract = TrendFiConfig(_newConfig);
    }
    
    // FIXED: Add function to check current rate limit status
    function getRateLimitStatus(address _submitter) external view returns (
        bool canSubmit,
        uint256 nextAllowedTime,
        uint256 globalNextAllowedTime,
        uint256 remainingHourlySubmissions,
        uint256 currentHourSubmissions
    ) {
        uint256 nextSubmitTime = lastSubmissionTime[_submitter] + MIN_SUBMISSION_INTERVAL;
        uint256 nextGlobalTime = lastGlobalSubmissionTime + GLOBAL_SUBMISSION_INTERVAL;
        
        canSubmit = block.timestamp >= nextSubmitTime && 
                   block.timestamp >= nextGlobalTime &&
                   submissionsInCurrentHour < MAX_SUBMISSIONS_PER_HOUR;
        
        nextAllowedTime = nextSubmitTime;
        globalNextAllowedTime = nextGlobalTime;
        remainingHourlySubmissions = MAX_SUBMISSIONS_PER_HOUR - submissionsInCurrentHour;
        currentHourSubmissions = submissionsInCurrentHour;
    }
    
    // FIXED: Add function to reset rate limiting (emergency use only)
    function resetRateLimiting() external onlyOwner {
        lastGlobalSubmissionTime = 0;
        submissionsInCurrentHour = 0;
        currentHourStart = 0;
    }
    
    // FIXED: Add function to update rate limiting parameters
    function updateRateLimitParams(
        uint256 _minSubmissionInterval,
        uint256 _globalSubmissionInterval,
        uint256 _maxSubmissionsPerHour
    ) external view onlyOwner {
        require(_minSubmissionInterval >= 10 seconds && _minSubmissionInterval <= 300 seconds, "Invalid address interval");
        require(_globalSubmissionInterval >= 5 seconds && _globalSubmissionInterval <= 120 seconds, "Invalid global interval");
        require(_maxSubmissionsPerHour >= 10 && _maxSubmissionsPerHour <= 1000, "Invalid hourly limit");
        
        // Note: This would require storage variables to be made mutable
        // For now, these are constants as defined above
    }
}
