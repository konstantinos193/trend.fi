// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./TrendFiConfig.sol";

contract TrendFi is Ownable, ReentrancyGuard, Pausable {
    struct Trend {
        string name;
        string description;
        uint256 createdAt;
        bool active;
    }

    TrendFiConfig public configContract;
    
    mapping(uint256 => Trend) public trends;
    uint256 public trendCounter;
    
    event TrendCreated(uint256 indexed trendId, string name, string description, address indexed creator, uint256 createdAt);
    event TrendUpdated(uint256 indexed trendId, bool active);
    
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
    
    modifier validTrendData(string memory _name, string memory _description) {
        require(bytes(_name).length > 0 && bytes(_name).length <= 100, "Invalid name length");
        require(bytes(_description).length > 0 && bytes(_description).length <= 1000, "Invalid description length");
        _;
    }
    
    constructor(address _configContract) {
        require(_configContract != address(0), "Invalid config address");
        configContract = TrendFiConfig(_configContract);
        trendCounter = 0;
    }
    
    function createTrend(string memory _name, string memory _description) 
        external 
        onlyAuthorized 
        whenNotPaused 
        whenNotEmergency 
        validTrendData(_name, _description)
    {
        // Checks: All conditions validated by modifiers
        
        // Effects: Update state first
        trendCounter++;
        trends[trendCounter] = Trend({
            name: _name,
            description: _description,
            createdAt: block.timestamp,
            active: true
        });
        
        // Interactions: Emit event last
        emit TrendCreated(trendCounter, _name, _description, msg.sender, block.timestamp);
    }
    
    function updateTrendStatus(uint256 _trendId, bool _active) 
        external 
        onlyAuthorized 
        whenNotEmergency 
    {
        // Checks: Validate input
        require(_trendId > 0 && _trendId <= trendCounter, "Invalid trend ID");
        require(trends[_trendId].active != _active, "No status change");
        
        // Effects: Update state
        trends[_trendId].active = _active;
        
        // Interactions: Emit event
        emit TrendUpdated(_trendId, _active);
    }
    
    function getTrend(uint256 _trendId) external view whenNotEmergency returns (Trend memory) {
        require(_trendId > 0 && _trendId <= trendCounter, "Invalid trend ID");
        return trends[_trendId];
    }
    
    function getAllTrends() external view whenNotEmergency returns (Trend[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= trendCounter; i++) {
            if (trends[i].active) {
                activeCount++;
            }
        }
        
        Trend[] memory activeTrends = new Trend[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= trendCounter; i++) {
            if (trends[i].active) {
                activeTrends[index] = trends[i];
                index++;
            }
        }
        return activeTrends;
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
}
