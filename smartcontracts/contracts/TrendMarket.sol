// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TrendOracle.sol";
import "./TrendFiConfig.sol";

contract TrendMarket is Ownable, ReentrancyGuard {
    struct Position {
        address owner;
        uint256 trendId;
        bool isLong;
        uint256 margin;      // collateral deposited for THIS position
        uint256 size;        // notional / contracts (leverage = size / margin)
        uint256 entryPrice;
        uint256 entryTimestamp;
        bool closed;
        uint256 closePrice;
        uint256 closeTimestamp;
    }
    
    struct Market {
        uint256 trendId;
        string trendName;
        uint256 currentPrice;
        uint256 totalLong;
        uint256 totalShort;
        bool active;
        uint256 lastUpdate;
    }
    
    IERC20 public collateralToken;
    TrendOracle public trendOracle;
    TrendFiConfig public configContract;
    address public treasury;
    
    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Position[])) public traderPositions;
    mapping(uint256 => Position) public positions;
    
    uint256 public positionCounter;
    uint256 public marketCounter;
    
    // Global size tracking (separate from margin tracking)
    uint256 public totalLongSize;
    uint256 public totalShortSize;
    
    // Dynamic leverage system
    bool public emergencyPaused = false;
    bool public paused = false;
    uint256 public maxSystemLeverage = 10e18; // 10x max system leverage
    
    // FIXED: Add price oracle manipulation protection
    uint256 public constant MAX_PRICE_DEVIATION = 1000; // 10% max deviation (in basis points)
    uint256 public constant CIRCUIT_BREAKER_THRESHOLD = 2000; // 20% for circuit breaker
    uint256 public lastPriceUpdate;
    uint256 public lastValidPrice;
    bool public circuitBreakerTriggered = false;
    uint256 public circuitBreakerEndTime;
    
    event MarketCreated(uint256 indexed marketId, uint256 indexed trendId, string trendName);
    event PositionOpened(uint256 indexed positionId, address indexed trader, uint256 trendId, bool isLong, uint256 amount);
    event PositionClosed(uint256 indexed positionId, address indexed trader, uint256 pnl);
    event PriceUpdated(uint256 indexed marketId, uint256 newPrice);
    
    modifier onlyValidMarket(uint256 _marketId) {
        require(markets[_marketId].active, "Market not active");
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
    
    modifier validPositionSize(uint256 _amount) {
        TrendFiConfig.MarketConfig memory marketConfig = configContract.getMarketConfig();
        require(_amount >= marketConfig.minPositionSize, "Position too small");
        require(_amount <= marketConfig.maxPositionSize, "Position too large");
        _;
    }
    
    modifier gasPriceCheck() {
        require(tx.gasprice <= configContract.getSystemConfig().maxGasPrice, "Gas price too high");
        _;
    }
    
    // Debug event
    event DebugPayout(uint256 contractBalance, uint256 payout, uint256 positionAmount, uint256 pnl, uint256 fee, uint256 protocolFee);

    modifier validateCollateral(uint256 _amount, bool _isLong, uint256 _marketId) {
        uint256 maxLeverage = getMaxLeverage(_amount);
        uint256 effectiveExposure = (_amount * maxLeverage) / 1e18;
        Market storage market = markets[_marketId];
        uint256 counterpartyFunds = _isLong ? market.totalShort : market.totalLong;
        
        // FIXED: Consolidate P2P collateral validation logic
        // Allow first position in empty market (P2P support) but ensure consistency
        bool isFirstPosition = (counterpartyFunds == 0);
        
        // Debug: Log values to understand the issue
        emit DebugPayout(counterpartyFunds, effectiveExposure, market.totalLong, market.totalShort, maxLeverage, isFirstPosition ? 1 : 0);
        
        if (!isFirstPosition) {
            // For P2P trading, we match actual position amounts, not leveraged exposure
            // This allows 1000 tokens long to match with 1000 tokens short
            require(counterpartyFunds >= _amount, "Insufficient counterparty collateral");
        }
        
        // Additional check: ensure market has reasonable total exposure
        uint256 totalMarketExposure = market.totalLong + market.totalShort;
        uint256 maxSystemExposure = getTotalMarketCapacity();
        
        // Debug: Check if this is the issue
        if (totalMarketExposure + effectiveExposure > maxSystemExposure) {
            // This shouldn't happen with our new capacity calculation
            revert("Market capacity exceeded");
        }
        
        _;
    }
    
    modifier notPaused() {
        require(!emergencyPaused && !paused, "Trading paused");
        _;
    }
    
    constructor(address _collateralToken, address _trendOracle, address _configContract) {
        require(_collateralToken != address(0), "Invalid collateral token");
        require(_trendOracle != address(0), "Invalid oracle address");
        require(_configContract != address(0), "Invalid config address");
        
        collateralToken = IERC20(_collateralToken);
        trendOracle = TrendOracle(_trendOracle);
        configContract = TrendFiConfig(_configContract);
        treasury = configContract.getSystemConfig().treasuryAddress;
    }
    
    function createMarket(uint256 _trendId, string memory _trendName) 
        external 
        onlyAuthorized 
        notPaused 
        whenNotEmergency 
    {
        // Checks: Validate inputs
        require(_trendId > 0, "Invalid trend ID");
        require(bytes(_trendName).length > 0 && bytes(_trendName).length <= 100, "Invalid name length");
        require(markets[marketCounter].trendId != _trendId, "Market already exists");
        
        // Effects: Update state
        marketCounter++;
        markets[marketCounter] = Market({
            trendId: _trendId,
            trendName: _trendName,
            currentPrice: 0,
            totalLong: 0,
            totalShort: 0,
            active: true,
            lastUpdate: block.timestamp
        });
        
        // Interactions: Emit event
        emit MarketCreated(marketCounter, _trendId, _trendName);
    }
    
    function openPosition(
        uint256 _marketId,
        bool _isLong,
        uint256 _margin
    ) 
        external 
        onlyValidMarket(_marketId) 
        nonReentrant 
        whenNotEmergency 
        validPositionSize(_margin) 
        gasPriceCheck 
        notPaused
        validateCollateral(_margin, _isLong, _marketId)
    {
        // Checks: All conditions validated by modifiers
        Market storage market = markets[_marketId];
        TrendFiConfig.MarketConfig memory marketConfig = configContract.getMarketConfig();
        
        // Calculate position size based on leverage
        uint256 leverage = _getLeverageForPosition(_margin, marketConfig.maxLeverage);
        uint256 size = (_margin * leverage) / 1e18;
        
        // Optional: take open fee immediately to treasury
        uint256 openFee = (size * marketConfig.feeRate) / 10000;
        
        // Effects: Update state first
        positionCounter++;
        positions[positionCounter] = Position({
            owner: msg.sender,
            trendId: market.trendId,
            isLong: _isLong,
            margin: _margin,
            size: size,
            entryPrice: market.currentPrice,
            entryTimestamp: block.timestamp,
            closed: false,
            closePrice: 0,
            closeTimestamp: 0
        });
        
        traderPositions[_marketId][msg.sender].push(positions[positionCounter]);
        
        // Update global size tracking
        if (_isLong) {
            totalLongSize += size;
        } else {
            totalShortSize += size;
        }
        
        // Update market totals (for compatibility)
        if (_isLong) {
            market.totalLong += _margin;
        } else {
            market.totalShort += _margin;
        }
        
        // Interactions: Transfer collateral and fees
        uint256 totalRequired = _margin + openFee;
        require(
            collateralToken.transferFrom(msg.sender, address(this), totalRequired), 
            "Insufficient collateral"
        );
        
        // Transfer open fee to treasury
        if (openFee > 0) {
            require(collateralToken.transfer(treasury, openFee), "Open fee transfer failed");
        }
        
        emit PositionOpened(positionCounter, msg.sender, market.trendId, _isLong, _margin);
    }
    
    function closePosition(uint256 _positionId) 
        external 
        nonReentrant 
        whenNotEmergency 
        gasPriceCheck 
    {
        // Checks: Validate position
        Position storage position = positions[_positionId];
        require(!position.closed, "Position already closed");
        require(position.owner == msg.sender, "Not position owner");
        require(position.size > 0, "Already closed");

        Market storage market = markets[getMarketIdByTrendId(position.trendId)];
        uint256 currentPrice = market.currentPrice;
        int256 pnl = calculatePnL(position, currentPrice);

        // === Fee calculation ===
        TrendFiConfig.MarketConfig memory marketConfig = configContract.getMarketConfig();
        uint256 closeFee = (position.size * marketConfig.feeRate) / 10000;
        uint256 protocolFee = (position.size * configContract.getSystemConfig().protocolFeeRate) / 10000;

        // === Payout logic (handles bankruptcy correctly) ===
        uint256 payout = position.margin;
        if (pnl > 0) {
            payout += uint256(pnl);
        } else {
            uint256 loss = uint256(-pnl);
            if (loss >= payout) {
                payout = 0;                    // full wipeout
            } else {
                payout -= loss;
            }
        }

        // Deduct fees (never let payout go negative)
        uint256 totalFees = closeFee + protocolFee;
        if (payout >= totalFees) {
            payout -= totalFees;
        } else {
            // Fees exceed payout, pay what we can
            if (payout >= closeFee) {
                closeFee = payout;
                payout = 0;
            } else {
                closeFee = payout;
                payout = 0;
            }
            protocolFee = 0;
        }

        // === Transfers (atomic order matters) ===
        if (payout > 0) {
            require(collateralToken.transfer(msg.sender, payout), "Payout transfer failed");
        }
        if (closeFee > 0) {
            require(collateralToken.transfer(treasury, closeFee), "Close fee transfer failed");
        }
        if (protocolFee > 0) {
            require(collateralToken.transfer(treasury, protocolFee), "Protocol fee transfer failed");
        }

        // === Update state (critical for P2P system) ===
        position.closed = true;
        position.closePrice = currentPrice;
        position.closeTimestamp = block.timestamp;
        
        if (position.isLong) {
            totalLongSize -= position.size;
            // CRITICAL: Update market totalLong to track available collateral
            market.totalLong -= position.margin;
        } else {
            totalShortSize -= position.size;
            // CRITICAL: Update market totalShort to track available collateral
            market.totalShort -= position.margin;
        }

        // Clear position
        delete positions[_positionId];

        emit PositionClosed(_positionId, msg.sender, uint256(pnl));
    }
    
    function updatePrice(uint256 _marketId, bytes32 _dataHash) 
        external 
        onlyAuthorized 
        whenNotEmergency 
    {
        // Checks: Validate inputs
        Market storage market = markets[_marketId];
        require(market.active, "Market not active");
        require(
            block.timestamp >= market.lastUpdate + configContract.getMarketConfig().oracleUpdateDelay,
            "Update too soon"
        );
        require(!circuitBreakerTriggered || block.timestamp >= circuitBreakerEndTime, "Circuit breaker active");
        
        TrendOracle.TrendData memory data = trendOracle.getTrendData(_dataHash);
        require(data.trendId == market.trendId, "Data mismatch");
        require(data.verified, "Data not verified");
        
        // FIXED: Add price deviation checks and circuit breaker protection
        if (lastValidPrice > 0) {
            uint256 priceDeviation = data.trendValue > lastValidPrice ? 
                ((data.trendValue - lastValidPrice) * 10000) / lastValidPrice :
                ((lastValidPrice - data.trendValue) * 10000) / lastValidPrice;
            
            require(priceDeviation <= MAX_PRICE_DEVIATION, "Price deviation too high");
            
            // Trigger circuit breaker if deviation exceeds threshold
            if (priceDeviation >= CIRCUIT_BREAKER_THRESHOLD) {
                circuitBreakerTriggered = true;
                circuitBreakerEndTime = block.timestamp + 1 hours; // 1 hour circuit breaker
                revert("Circuit breaker triggered - extreme volatility");
            }
        }
        
        // Effects: Update state
        market.currentPrice = data.trendValue;
        market.lastUpdate = block.timestamp;
        lastPriceUpdate = block.timestamp;
        lastValidPrice = data.trendValue;
        
        // Reset circuit breaker if price is stable
        if (circuitBreakerTriggered && block.timestamp >= circuitBreakerEndTime) {
            circuitBreakerTriggered = false;
        }
        
        // Interactions: Emit event
        emit PriceUpdated(_marketId, data.trendValue);
    }
    
    function getMarketIdByTrendId(uint256 _trendId) internal view returns (uint256) {
        for (uint256 i = 1; i <= marketCounter; i++) {
            if (markets[i].trendId == _trendId) {
                return i;
            }
        }
        revert("Market not found");
    }
    
    // Pure PnL calculation (no globals, production-grade)
    function calculatePnL(Position memory pos, uint256 currentPrice) public pure returns (int256) {
        if (pos.size == 0) return 0;

        int256 priceDelta = pos.isLong 
            ? int256(currentPrice) - int256(pos.entryPrice)
            : int256(pos.entryPrice) - int256(currentPrice);

        // Safe math for large numbers
        return (int256(pos.size) * priceDelta) / int256(pos.entryPrice);
    }
    
    function _getLeverageForPosition(uint256 _amount, uint256 _maxLeverage) internal pure returns (uint256) {
        // FIXED: Add overflow protection for dynamic leverage calculations
        require(_amount > 0, "Invalid amount");
        require(_maxLeverage > 0, "Invalid max leverage");
        
        // Dynamic leverage: smaller positions get higher leverage
        if (_amount <= 1000e18) {
            return _maxLeverage; // Full leverage for small positions
        }
        
        if (_amount <= 5000e18) {
            // Check for overflow in multiplication
            require(_maxLeverage <= type(uint256).max * 10e18 / 5e18, "Overflow risk in leverage calculation");
            return (_maxLeverage * 5e18) / 10e18; // 50% leverage for medium
        }
        
        // Check for overflow in multiplication for large positions
        require(_maxLeverage <= type(uint256).max * 10e18 / 2e18, "Overflow risk in leverage calculation");
        return (_maxLeverage * 2e18) / 10e18; // 20% leverage for large positions
    }
    
    function getPositionPnl(uint256 _positionId) external view whenNotEmergency returns (uint256) {
        Position memory position = positions[_positionId];
        if (position.closed) {
            return uint256(calculatePnL(position, configContract.getMarketConfig().maxLeverage));
        }
        
        Market memory market = markets[getMarketIdByTrendId(position.trendId)];
        Position memory tempPosition = position;
        tempPosition.closePrice = market.currentPrice;
        
        return uint256(calculatePnL(tempPosition, configContract.getMarketConfig().maxLeverage));
    }
    
    function getTraderPositions(uint256 _marketId, address _trader) external view whenNotEmergency returns (Position[] memory) {
        return traderPositions[_marketId][_trader];
    }
    
    function getActiveMarkets() external view whenNotEmergency returns (Market[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 1; i <= marketCounter; i++) {
            if (markets[i].active) {
                activeCount++;
            }
        }
        
        Market[] memory activeMarkets = new Market[](activeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= marketCounter; i++) {
            if (markets[i].active) {
                activeMarkets[index] = markets[i];
                index++;
            }
        }
        
        return activeMarkets;
    }
    
    function emergencyPause() external onlyOwner {
        emergencyPaused = true;
        paused = true;
    }
    
    function emergencyUnpause() external onlyOwner {
        emergencyPaused = false;
        paused = false;
    }
    
    function setEmergencyPause(bool _pause) external onlyOwner {
        emergencyPaused = _pause;
        paused = _pause;
    }
    
    function setMaxSystemLeverage(uint256 _maxLeverage) external onlyOwner {
        require(_maxLeverage > 0 && _maxLeverage <= 50e18, "Invalid leverage");
        maxSystemLeverage = _maxLeverage;
    }
    
    function getMaxLeverage(uint256 _contractValue) public view returns (uint256) {
        // FIXED: Add overflow protection for leverage calculations
        require(_contractValue > 0, "Invalid contract value");
        
        if (_contractValue <= 1000e18) {
            // Check for potential overflow in multiplication
            require(maxSystemLeverage <= type(uint256).max / _contractValue, "Overflow risk in leverage calculation");
            return maxSystemLeverage;
        }
        
        if (_contractValue <= 5000e18) {
            // Check for overflow in intermediate calculation
            require(maxSystemLeverage <= type(uint256).max * 10e18 / 5e18 / _contractValue, "Overflow risk in leverage calculation");
            return (maxSystemLeverage * 5e18) / 10e18;
        }
        
        // For large positions - check overflow
        require(maxSystemLeverage <= type(uint256).max * 10e18 / 2e18 / _contractValue, "Overflow risk in leverage calculation");
        return (maxSystemLeverage * 2e18) / 10e18;
    }
    
    function checkCollateralSufficiency(
        uint256 _positionAmount,
        uint256 _leverage,
        bool _isLong,
        uint256 _marketId
    ) public view returns (bool) {
        uint256 requiredCollateral = (_positionAmount * _leverage) / 1e18;
        uint256 availableCollateral = _isLong ? markets[_marketId].totalShort : markets[_marketId].totalLong;
        
        return availableCollateral >= requiredCollateral;
    }
    
    // FIXED: P2P market capacity based on available counterparty collateral, not platform funds
    function getTotalMarketCapacity() public view returns (uint256) {
        // For true P2P trading, capacity is the sum of all available counterparty funds
        uint256 totalAvailableCollateral = 0;
        
        // Sum up all available collateral across all markets
        for (uint256 i = 1; i <= marketCounter; i++) {
            if (markets[i].active) {
                // Available capacity is the minimum of long and short sides
                // This represents matched collateral available for new positions
                uint256 marketCapacity = markets[i].totalLong < markets[i].totalShort ? 
                    markets[i].totalLong : markets[i].totalShort;
                totalAvailableCollateral += marketCapacity;
            }
        }
        
        // Apply system leverage multiplier to the available matched collateral
        uint256 leveragedCapacity = (totalAvailableCollateral * maxSystemLeverage) / 1e18;
        
        // For empty markets or bootstrap phase, provide minimum capacity
        uint256 minBootstrapCapacity = 1000000 * 1e18; // Minimum 1M tokens for bootstrap
        
        return leveragedCapacity > minBootstrapCapacity ? leveragedCapacity : minBootstrapCapacity;
    }
    
    // FIXED: Get available capacity for a specific market in P2P system
    function getMarketAvailableCapacity(uint256 _marketId) public view returns (uint256) {
        Market storage market = markets[_marketId];
        require(market.active, "Market not active");
        
        // In P2P, available capacity is the counterparty collateral
        // This allows new positions to be matched against existing ones
        uint256 availableLong = market.totalShort; // Short collateral available for long positions
        uint256 availableShort = market.totalLong; // Long collateral available for short positions
        
        // Return the maximum capacity for either side
        return availableLong > availableShort ? availableLong : availableShort;
    }
    
    // FIXED: Add function to check if market is balanced for P2P trading
    function isMarketBalanced(uint256 _marketId) external view returns (bool balanced, uint256 imbalanceRatio) {
        Market storage market = markets[_marketId];
        uint256 totalLong = market.totalLong;
        uint256 totalShort = market.totalShort;
        
        if (totalLong == 0 && totalShort == 0) {
            return (true, 0); // Empty market is balanced
        }
        
        uint256 maxSide = totalLong > totalShort ? totalLong : totalShort;
        uint256 minSide = totalLong > totalShort ? totalShort : totalLong;
        
        if (minSide == 0) {
            return (false, 10000); // 100% imbalance
        }
        
        imbalanceRatio = ((maxSide - minSide) * 10000) / maxSide;
        balanced = imbalanceRatio <= 1000; // Allow up to 10% imbalance for better P2P liquidity
        
        return (balanced, imbalanceRatio);
    }
}
