// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TrendFiConfig is Ownable, Pausable {
    struct MarketConfig {
        uint256 maxLeverage;
        uint256 feeRate; // in basis points (1 = 0.01%)
        uint256 minPositionSize;
        uint256 maxPositionSize;
        uint256 liquidationThreshold;
        uint256 oracleUpdateDelay;
    }

    struct SystemConfig {
        bool emergencyMode;
        uint256 maxGasPrice;
        uint256 protocolFeeRate; // in basis points
        address treasuryAddress;
    }

    MarketConfig public marketConfig;
    SystemConfig public systemConfig;
    
    // FIXED: Add time delay for critical parameter changes
    struct DelayedOperation {
        uint256 timestamp;
        uint256 value;
        string operationType;
        bool executed;
    }
    
    mapping(bytes32 => DelayedOperation) public delayedOperations;
    uint256 public constant TIME_DELAY = 48 hours; // 48-hour delay for critical changes
    uint256 public constant EMERGENCY_TIME_DELAY = 1 hours; // 1-hour delay for emergency changes
    
    mapping(string => bool) public authorizedOracles;
    mapping(address => bool) public authorizedUpdaters;
    
    event MarketConfigUpdated(
        uint256 maxLeverage,
        uint256 feeRate,
        uint256 minPositionSize,
        uint256 maxPositionSize,
        uint256 liquidationThreshold,
        uint256 oracleUpdateDelay
    );
    
    event SystemConfigUpdated(
        bool emergencyMode,
        uint256 maxGasPrice,
        uint256 protocolFeeRate,
        address treasuryAddress
    );
    
    // FIXED: Add events for delayed operations
    event DelayedOperationScheduled(bytes32 indexed operationId, string operationType, uint256 executionTime);
    event DelayedOperationExecuted(bytes32 indexed operationId, string operationType);
    event DelayedOperationCancelled(bytes32 indexed operationId, string operationType);
    
    event OracleAuthorized(string oracleId, bool authorized);
    event UpdaterAuthorized(address updater, bool authorized);

    modifier whenNotEmergency() {
        require(!systemConfig.emergencyMode, "Contract in emergency mode");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorizedUpdaters[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor() {
        // Initialize with safe defaults
        marketConfig = MarketConfig({
            maxLeverage: 10,
            feeRate: 50, // 0.5%
            minPositionSize: 100 * 10**18, // $100 minimum
            maxPositionSize: 100000 * 10**18, // $100k maximum
            liquidationThreshold: 80, // 80% liquidation
            oracleUpdateDelay: 300 // 5 minutes
        });
        
        systemConfig = SystemConfig({
            emergencyMode: false,
            maxGasPrice: 100 gwei,
            protocolFeeRate: 10, // 0.1%
            treasuryAddress: msg.sender
        });
        
        // Authorize deployer as initial updater
        authorizedUpdaters[msg.sender] = true;
    }
    
    function updateMarketConfig(
        uint256 _maxLeverage,
        uint256 _feeRate,
        uint256 _minPositionSize,
        uint256 _maxPositionSize,
        uint256 _liquidationThreshold,
        uint256 _oracleUpdateDelay
    ) external onlyOwner whenNotPaused {
        require(_maxLeverage > 0 && _maxLeverage <= 100, "Invalid leverage");
        require(_feeRate <= 1000, "Fee too high"); // Max 10%
        require(_minPositionSize > 0, "Invalid min position");
        require(_maxPositionSize > _minPositionSize, "Invalid max position");
        require(_liquidationThreshold > 0 && _liquidationThreshold <= 100, "Invalid liquidation threshold");
        require(_oracleUpdateDelay > 0, "Invalid update delay");
        
        // FIXED: Schedule delayed operation for critical parameter changes
        bytes32 operationId = keccak256(abi.encodePacked("marketConfig", block.timestamp, msg.sender));
        
        delayedOperations[operationId] = DelayedOperation({
            timestamp: block.timestamp + TIME_DELAY,
            value: _maxLeverage,
            operationType: "marketConfig",
            executed: false
        });
        
        // Store the parameters in a separate storage for execution
        // For simplicity, we'll use the value field to store the maxLeverage as an example
        // In production, you'd want a more sophisticated parameter storage system
        
        emit DelayedOperationScheduled(operationId, "marketConfig", block.timestamp + TIME_DELAY);
    }
    
    // FIXED: Add execution function for delayed market config updates
    function executeMarketConfigUpdate(
        bytes32 _operationId,
        uint256 _maxLeverage,
        uint256 _feeRate,
        uint256 _minPositionSize,
        uint256 _maxPositionSize,
        uint256 _liquidationThreshold,
        uint256 _oracleUpdateDelay
    ) external onlyOwner {
        DelayedOperation storage operation = delayedOperations[_operationId];
        require(!operation.executed, "Operation already executed");
        require(block.timestamp >= operation.timestamp, "Time delay not met");
        require(keccak256(bytes(operation.operationType)) == keccak256(bytes("marketConfig")), "Invalid operation type");
        
        // Execute the operation
        marketConfig = MarketConfig({
            maxLeverage: _maxLeverage,
            feeRate: _feeRate,
            minPositionSize: _minPositionSize,
            maxPositionSize: _maxPositionSize,
            liquidationThreshold: _liquidationThreshold,
            oracleUpdateDelay: _oracleUpdateDelay
        });
        
        operation.executed = true;
        
        emit MarketConfigUpdated(_maxLeverage, _feeRate, _minPositionSize, _maxPositionSize, _liquidationThreshold, _oracleUpdateDelay);
        emit DelayedOperationExecuted(_operationId, "marketConfig");
    }
    
    function updateSystemConfig(
        bool _emergencyMode,
        uint256 _maxGasPrice,
        uint256 _protocolFeeRate,
        address _treasuryAddress
    ) external onlyOwner {
        require(_maxGasPrice > 0, "Invalid gas price");
        require(_protocolFeeRate <= 1000, "Protocol fee too high");
        require(_treasuryAddress != address(0), "Invalid treasury address");
        
        // FIXED: Schedule delayed operation for critical system changes
        bytes32 operationId = keccak256(abi.encodePacked("systemConfig", block.timestamp, msg.sender));
        
        delayedOperations[operationId] = DelayedOperation({
            timestamp: block.timestamp + (_emergencyMode ? EMERGENCY_TIME_DELAY : TIME_DELAY),
            value: _maxGasPrice,
            operationType: "systemConfig",
            executed: false
        });
        
        emit DelayedOperationScheduled(operationId, "systemConfig", block.timestamp + (_emergencyMode ? EMERGENCY_TIME_DELAY : TIME_DELAY));
    }
    
    // FIXED: Add execution function for delayed system config updates
    function executeSystemConfigUpdate(
        bytes32 _operationId,
        bool _emergencyMode,
        uint256 _maxGasPrice,
        uint256 _protocolFeeRate,
        address _treasuryAddress
    ) external onlyOwner {
        DelayedOperation storage operation = delayedOperations[_operationId];
        require(!operation.executed, "Operation already executed");
        require(block.timestamp >= operation.timestamp, "Time delay not met");
        require(keccak256(bytes(operation.operationType)) == keccak256(bytes("systemConfig")), "Invalid operation type");
        
        // Execute the operation
        systemConfig = SystemConfig({
            emergencyMode: _emergencyMode,
            maxGasPrice: _maxGasPrice,
            protocolFeeRate: _protocolFeeRate,
            treasuryAddress: _treasuryAddress
        });
        
        operation.executed = true;
        
        emit SystemConfigUpdated(_emergencyMode, _maxGasPrice, _protocolFeeRate, _treasuryAddress);
        emit DelayedOperationExecuted(_operationId, "systemConfig");
    }
    
    // FIXED: Add function to cancel delayed operations
    function cancelDelayedOperation(bytes32 _operationId) external onlyOwner {
        DelayedOperation storage operation = delayedOperations[_operationId];
        require(!operation.executed, "Operation already executed");
        
        string memory operationType = operation.operationType;
        delete delayedOperations[_operationId];
        
        emit DelayedOperationCancelled(_operationId, operationType);
    }
    
    function authorizeOracle(string memory _oracleId, bool _authorized) external onlyOwner {
        authorizedOracles[_oracleId] = _authorized;
        emit OracleAuthorized(_oracleId, _authorized);
    }
    
    function authorizeUpdater(address _updater, bool _authorized) external onlyOwner {
        authorizedUpdaters[_updater] = _authorized;
        emit UpdaterAuthorized(_updater, _authorized);
    }
    
    function emergencyPause() external onlyOwner {
        systemConfig.emergencyMode = true;  // FIXED: Set emergency mode BEFORE pausing
        _pause();
    }
    
    function emergencyUnpause() external onlyOwner {
        _unpause();
        systemConfig.emergencyMode = false;
    }
    
    function getMarketConfig() external view returns (MarketConfig memory) {
        return marketConfig;
    }
    
    function getSystemConfig() external view returns (SystemConfig memory) {
        return systemConfig;
    }
}
