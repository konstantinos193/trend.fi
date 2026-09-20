const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Peer-to-Peer Trading (Zero Capital)", function () {
  let trendMarket, trendToken, trendOracle, trendFiConfig, treasury;
  let owner, trader1, trader2, trader3;
  let marketId;
  const POSITION_AMOUNT = ethers.parseUnits("1000", 18);

  beforeEach(async function () {
    [owner, trader1, trader2, trader3] = await ethers.getSigners();
    
    // Deploy config first (needed by other contracts)
    const TrendFiConfig = await ethers.getContractFactory("TrendFiConfig");
    trendFiConfig = await TrendFiConfig.deploy();
    await trendFiConfig.waitForDeployment();
    
    // Deploy token (your existing TrendToken)
    const TrendToken = await ethers.getContractFactory("TrendToken");
    trendToken = await TrendToken.deploy();
    await trendToken.waitForDeployment();
    
    // Deploy oracle as proxy (needs initialization)
    const TrendOracle = await ethers.getContractFactory("TrendOracle");
    trendOracle = await TrendOracle.deploy();
    await trendOracle.waitForDeployment();
    
    // Initialize oracle BEFORE using it
    await trendOracle.initialize(owner.address, await trendFiConfig.getAddress());
    
    // Set treasury address (using owner as treasury for test)
    treasury = owner;
    
    // Authorize owner to update prices
    await trendFiConfig.authorizeUpdater(owner.address, true);
    
    // Verify oracle is properly initialized
    const oracleOwner = await trendOracle.owner();
    console.log("Oracle owner after init:", oracleOwner);
    
    // Deploy P2P market
    const TrendMarket = await ethers.getContractFactory("TrendMarket");
    trendMarket = await TrendMarket.deploy(
      await trendToken.getAddress(),
      await trendOracle.getAddress(),
      await trendFiConfig.getAddress()
    );
    await trendMarket.waitForDeployment();
    
    // Set normal leverage for P2P test (should work with fixed capacity calculation)
    await trendMarket.setMaxSystemLeverage(ethers.parseEther("10"));
    
    // Setup market
    await trendMarket.createMarket(1, "Test Trend");
    marketId = 1;
    
    // Fast forward time to satisfy oracle update delay (300 seconds = 5 minutes)
    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine");
    
    // Set initial price
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = 0; // Initial nonce is 0
    const chainId = 1; // Matches CHAIN_ID constant in contract
    const messageHash = ethers.solidityPackedKeccak256(
      ["uint256", "string", "uint256", "uint256", "uint256", "uint256"],
      [1, "Test Trend", 1000000, timestamp, nonce, chainId]
    );
    const signature = await owner.signMessage(ethers.getBytes(messageHash));
    const dataHash = ethers.solidityPackedKeccak256(
      ["uint256", "string", "uint256", "uint256", "uint256", "uint256"],
      [1, "Test Trend", 1000000, timestamp, nonce, chainId]
    );
    
    await trendOracle.submitTrendData(1, "Test Trend", 1000000, timestamp, signature);
    await trendMarket.updatePrice(marketId, dataHash);
    
    // Fund traders (they bring their own money)
    await trendToken.transfer(trader1.address, POSITION_AMOUNT * 10n);
    await trendToken.transfer(trader2.address, POSITION_AMOUNT * 10n);
    await trendToken.transfer(trader3.address, POSITION_AMOUNT * 10n);
    
    // Approvals
    await trendToken.connect(trader1).approve(await trendMarket.getAddress(), POSITION_AMOUNT * 10n);
    await trendToken.connect(trader2).approve(await trendMarket.getAddress(), POSITION_AMOUNT * 10n);
    await trendToken.connect(trader3).approve(await trendMarket.getAddress(), POSITION_AMOUNT * 10n);
  });

  describe("Zero Capital Peer-to-Peer Trading", function () {
    it("Should match long and short positions with zero platform capital", async function () {
      console.log("=== P2P Trading Test ===");
      
      // Initial state - platform has zero tokens
      const platformBalance = await trendToken.balanceOf(await trendMarket.getAddress());
      console.log("Platform initial balance:", platformBalance.toString());
      expect(platformBalance).to.equal(0);
      
      // Test dynamic leverage system
      const maxLeverage = await trendMarket.getMaxLeverage(POSITION_AMOUNT);
      console.log("Max leverage for position amount:", maxLeverage.toString());
      
      // Debug: Check market config
      const marketConfig = await trendFiConfig.getMarketConfig();
      console.log("Market config:", {
        minPositionSize: marketConfig.minPositionSize.toString(),
        maxPositionSize: marketConfig.maxPositionSize.toString(),
        feeRate: marketConfig.feeRate.toString()
      });
      
      // Debug: Check system config
      const systemConfig = await trendFiConfig.getSystemConfig();
      console.log("System config:", {
        emergencyMode: systemConfig.emergencyMode,
        maxGasPrice: systemConfig.maxGasPrice.toString(),
        protocolFeeRate: systemConfig.protocolFeeRate.toString()
      });
      
      // Debug: Check market state before opening
      const marketBefore = await trendMarket.markets(marketId);
      console.log("Market before:", {
        totalLong: marketBefore.totalLong.toString(),
        totalShort: marketBefore.totalShort.toString(),
        active: marketBefore.active
      });
      
      try {
        // Trader 1 opens long position
        console.log("Attempting to open long position...");
        await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
        console.log("Long position opened successfully!");
      } catch (error) {
        console.log("Failed to open long position:", error.message);
        throw error;
      }
      
      // Trader 2 opens short position (perfect match!)
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      // Check market state
      const market = await trendMarket.markets(marketId);
      console.log("Total long positions:", market.totalLong.toString());
      console.log("Total short positions:", market.totalShort.toString());
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(POSITION_AMOUNT);
      
      // Platform still has zero tokens (only fees)
      const afterOpenBalance = await trendToken.balanceOf(await trendMarket.getAddress());
      console.log("Platform balance after opens:", afterOpenBalance.toString());
      
      // Create price movement (10% increase to keep PnL manageable)
      const newPrice = 1100000;
      
      // Fast forward time to satisfy oracle rate limit (60 seconds)
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");
      
      // Also need to satisfy market update delay
      await ethers.provider.send("evm_increaseTime", [301]);
      await ethers.provider.send("evm_mine");
      
      // Get current timestamp after time advancement
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Need to get current nonce from contract since it was incremented after first submission
      const currentNonce = await trendOracle.nonce();
      const chainId = 1; // Matches CHAIN_ID constant in contract
      
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "string", "uint256", "uint256", "uint256", "uint256"],
        [1, "Test Trend", newPrice, timestamp, currentNonce, chainId]
      );
      const signature = await owner.signMessage(ethers.getBytes(messageHash));
      const dataHash = ethers.solidityPackedKeccak256(
        ["uint256", "string", "uint256", "uint256", "uint256", "uint256"],
        [1, "Test Trend", newPrice, timestamp, currentNonce, chainId]
      );
      
      await trendOracle.submitTrendData(1, "Test Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      // Close positions
      const trader1Before = await trendToken.balanceOf(trader1.address);
      const trader2Before = await trendToken.balanceOf(trader2.address);
      
      // Check contract balance before closing
      const contractBalanceBefore = await trendToken.balanceOf(await trendMarket.getAddress());
      console.log("Contract balance before closing:", contractBalanceBefore.toString());
      
      // Debug: Calculate expected payouts for clean P2P system
      const positionAmount = POSITION_AMOUNT;
      const expectedPnl = positionAmount * 1000n / 10000n; // 10% of 1000 = 100
      const expectedFee = expectedPnl * 50n / 10000n; // 0.5% of 100 = 0.5
      const expectedProtocolFee = expectedPnl * 10n / 10000n; // 0.1% of 100 = 0.1
      const expectedProfitablePayout = positionAmount + expectedPnl - expectedFee - expectedProtocolFee; // 1000 + 100 - 0.5 - 0.1 = 1099.4
      const expectedLosingPayout = positionAmount; // 1000 (no fees on losses)
      console.log("Expected profitable payout:", expectedProfitablePayout.toString());
      console.log("Expected losing payout:", expectedLosingPayout.toString());
      
      // Check contract balance before closing (should be 2000 tokens, no fees deposited)
      console.log("Contract balance before closing:", contractBalanceBefore.toString());
      
      try {
        await trendMarket.connect(trader1).closePosition(1); // Long profit
      } catch (error) {
        console.log("Failed to close position 1:", error.message);
        throw error;
      }
      
      // Debug: Check contract balance after first close
      const contractBalanceAfterFirst = await trendToken.balanceOf(await trendMarket.getAddress());
      console.log("Contract balance after first close:", contractBalanceAfterFirst.toString());
      
      try {
        await trendMarket.connect(trader2).closePosition(2); // Short loss
      } catch (error) {
        console.log("Failed to close position 2:", error.message);
        throw error;
      }
      
      const trader1After = await trendToken.balanceOf(trader1.address);
      const trader2After = await trendToken.balanceOf(trader2.address);
      
      console.log("Trader1 before:", trader1Before.toString());
      console.log("Trader1 after:", trader1After.toString());
      console.log("Trader2 before:", trader2Before.toString());
      console.log("Trader2 after:", trader2After.toString());
      console.log("Trader1 (long) profit:", trader1After - trader1Before);
      console.log("Trader2 (short) returned:", trader2After - trader2Before);
      
      // Verify clean P2P results
      expect(trader1After).to.be.gt(trader1Before); // Profitable position gained
      expect(trader2After).to.be.closeTo(trader2Before, ethers.parseUnits("1", 15)); // Losing position got full collateral back (within small tolerance)
      
      // Verify treasury received fees
      const treasuryBalance = await trendToken.balanceOf(treasury.address);
      expect(treasuryBalance).to.be.gt(0); // Should have received fees from profitable position
      
      // Verify contract is empty (all collateral returned)
      const finalContractBalance = await trendToken.balanceOf(await trendMarket.getAddress());
      expect(finalContractBalance).to.be.eq(0);
      
      // Platform only collected fees (should be in treasury, not contract)
      console.log("Contract final balance (should be 0):", finalContractBalance.toString());
    });

    it("Should allow first position in empty market", async function () {
      // First position should be allowed in empty market (bootstrap support)
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      // Second position on opposite side should also be allowed
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      const market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(POSITION_AMOUNT);
    });

    it("Should prevent unbalanced positions after bootstrap", async function () {
      // Open balanced positions first
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      // Now try to open unbalanced position (should fail)
      await expect(trendMarket.connect(trader3).openPosition(marketId, true, POSITION_AMOUNT * 2n))
        .to.be.revertedWith("Insufficient counterparty collateral");
    });

    it("Should prevent excessive leverage exposure", async function () {
      // Open a small position first
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      // Try to open a large position that would exceed available collateral
      const largeAmount = ethers.parseUnits("10000", 18);
      await expect(
        trendMarket.connect(trader2).openPosition(marketId, false, largeAmount)
      ).to.be.revertedWith("Insufficient counterparty collateral");
    });

    it("Should test dynamic leverage system", async function () {
      // Test different position sizes get different leverage
      const smallAmount = ethers.parseUnits("500", 18);
      const mediumAmount = ethers.parseUnits("3000", 18);
      const largeAmount = ethers.parseUnits("10000", 18);
      
      const smallLeverage = await trendMarket.getMaxLeverage(smallAmount);
      const mediumLeverage = await trendMarket.getMaxLeverage(mediumAmount);
      const largeLeverage = await trendMarket.getMaxLeverage(largeAmount);
      
      console.log("Small position leverage:", smallLeverage.toString());
      console.log("Medium position leverage:", mediumLeverage.toString());
      console.log("Large position leverage:", largeLeverage.toString());
      
      // Small positions should get higher leverage
      expect(smallLeverage).to.be.gt(mediumLeverage);
      expect(mediumLeverage).to.be.gt(largeLeverage);
    });

    it("Should test emergency controls", async function () {
      // Test emergency pause
      await trendMarket.setEmergencyPause(true);
      
      await expect(
        trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT)
      ).to.be.revertedWith("Trading paused");
      
      // Unpause and test normal operation
      await trendMarket.setEmergencyPause(false);
      
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      const market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(POSITION_AMOUNT);
    });

    it("Should handle multiple traders on each side", async function () {
      // Multiple longs
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader3).openPosition(marketId, true, POSITION_AMOUNT);
      
      // Multiple shorts
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      // Should work perfectly balanced
      const market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT * 2n);
      expect(market.totalShort).to.equal(POSITION_AMOUNT * 2n);
    });
  });

  describe("Business Model Validation", function () {
    it("Should generate revenue from fees without capital", async function () {
      // Open matched positions
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      // Create price movement for fees
      // Use smaller price increase to avoid leverage issues
      const newPrice = 1100000; // Only 10% increase to keep PnL manageable
      
      // Fast forward time to satisfy oracle rate limit (60 seconds)
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");
      
      // Also need to satisfy market update delay
      await ethers.provider.send("evm_increaseTime", [301]);
      await ethers.provider.send("evm_mine");
      
      // Get current timestamp after time advancement
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Need to get current nonce from contract (incremented twice now)
      const currentNonce = await trendOracle.nonce();
      const chainId = 1; // Matches CHAIN_ID constant in contract
      
      const messageHash = ethers.solidityPackedKeccak256(
        ["uint256", "string", "uint256", "uint256", "uint256", "uint256"],
        [1, "Test Trend", newPrice, timestamp, currentNonce, chainId]
      );
      const signature = await owner.signMessage(ethers.getBytes(messageHash));
      const dataHash = ethers.solidityPackedKeccak256(
        ["uint256", "string", "uint256", "uint256", "uint256", "uint256"],
        [1, "Test Trend", newPrice, timestamp, currentNonce, chainId]
      );
      
      await trendOracle.submitTrendData(1, "Test Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      // Close positions
      await trendMarket.connect(trader1).closePosition(1);
      await trendMarket.connect(trader2).closePosition(2);
      
      // Platform earned fees
      const platformRevenue = await trendToken.balanceOf(await trendMarket.getAddress());
      console.log("Platform fee revenue:", platformRevenue.toString());
      expect(platformRevenue).to.be.gt(0);
    });

    it("Should test collateral sufficiency check", async function () {
      // Open initial positions
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      // Test collateral sufficiency function
      const isSufficient = await trendMarket.checkCollateralSufficiency(
        POSITION_AMOUNT,
        await trendMarket.getMaxLeverage(POSITION_AMOUNT),
        true,
        marketId
      );
      
      console.log("Collateral sufficiency check:", isSufficient);
      expect(isSufficient).to.be.true;
      
      // Test with insufficient collateral
      const largeAmount = ethers.parseUnits("5000", 18);
      const isNotSufficient = await trendMarket.checkCollateralSufficiency(
        largeAmount,
        await trendMarket.getMaxLeverage(largeAmount),
        true,
        marketId
      );
      
      expect(isNotSufficient).to.be.false;
    });

    it("Should test system leverage configuration", async function () {
      // Test default system leverage
      const defaultLeverage = await trendMarket.maxSystemLeverage();
      console.log("Default system leverage:", defaultLeverage.toString());
      expect(defaultLeverage).to.equal(ethers.parseUnits("10", 18));
      
      // Test updating system leverage
      await trendMarket.setMaxSystemLeverage(ethers.parseUnits("5", 18));
      const newLeverage = await trendMarket.maxSystemLeverage();
      expect(newLeverage).to.equal(ethers.parseUnits("5", 18));
      
      // Reset to original
      await trendMarket.setMaxSystemLeverage(ethers.parseUnits("10", 18));
    });

    it("Should test emergency pause functions", async function () {
      // Test emergencyPause function
      await trendMarket.emergencyPause();
      
      await expect(
        trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT)
      ).to.be.revertedWith("Trading paused");
      
      // Test emergencyUnpause function
      await trendMarket.emergencyUnpause();
      
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      const market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(POSITION_AMOUNT);
    });

    it("Should test config and oracle updates", async function () {
      // Test config contract update
      const newConfigAddress = trader3.address;
      await trendMarket.updateConfigContract(newConfigAddress);
      
      // Test oracle update
      const newOracleAddress = trader2.address;
      await trendMarket.updateOracle(newOracleAddress);
      
      // Verify updates (these will fail if contracts don't exist at those addresses)
      // In real implementation, you'd deploy new contracts first
    });

    it("Should validate position size limits", async function () {
      // Test very small position (should get full leverage)
      const smallAmount = ethers.parseUnits("100", 18);
      const smallLeverage = await trendMarket.getMaxLeverage(smallAmount);
      expect(smallLeverage).to.equal(await trendMarket.maxSystemLeverage());
      
      // Test medium position (should get reduced leverage)
      const mediumAmount = ethers.parseUnits("3000", 18);
      const mediumLeverage = await trendMarket.getMaxLeverage(mediumAmount);
      expect(mediumLeverage).to.be.lt(await trendMarket.maxSystemLeverage());
      
      // Test large position (should get minimum leverage)
      const largeAmount = ethers.parseUnits("10000", 18);
      const largeLeverage = await trendMarket.getMaxLeverage(largeAmount);
      expect(largeLeverage).to.be.lt(mediumLeverage);
      
      console.log("Leverage progression:");
      console.log("Small (100):", smallLeverage.toString());
      console.log("Medium (3000):", mediumLeverage.toString());
      console.log("Large (10000):", largeLeverage.toString());
    });

    it("Should test leverage edge cases", async function () {
      // Test boundary conditions
      const boundary1 = ethers.parseUnits("1000", 18); // Exactly at first threshold
      const boundary2 = ethers.parseUnits("5000", 18); // Exactly at second threshold
      
      const leverage1 = await trendMarket.getMaxLeverage(boundary1);
      const leverage2 = await trendMarket.getMaxLeverage(boundary2);
      
      expect(leverage1).to.equal(await trendMarket.maxSystemLeverage()); // Should get full leverage
      expect(leverage2).to.equal((await trendMarket.maxSystemLeverage() * 5n) / 10n); // Should get 50% leverage
      
      // Test invalid leverage setting
      await expect(
        trendMarket.setMaxSystemLeverage(0)
      ).to.be.revertedWith("Invalid leverage");
      
      await expect(
        trendMarket.setMaxSystemLeverage(ethers.parseUnits("51", 18))
      ).to.be.revertedWith("Invalid leverage");
    });

    it("Should test market capacity calculation", async function () {
      // Test empty market capacity (should return bootstrap capacity)
      const emptyCapacity = await trendMarket.getTotalMarketCapacity();
      console.log("Empty market capacity:", emptyCapacity.toString());
      expect(emptyCapacity).to.be.gt(0);
      
      // Test specific market capacity
      const marketCapacity = await trendMarket.getMarketAvailableCapacity(marketId);
      console.log("Market capacity (empty):", marketCapacity.toString());
      expect(marketCapacity).to.equal(0); // Empty market has 0 capacity
      
      // Open some positions
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      // Check capacity after positions
      const newMarketCapacity = await trendMarket.getMarketAvailableCapacity(marketId);
      console.log("Market capacity (balanced):", newMarketCapacity.toString());
      expect(newMarketCapacity).to.equal(POSITION_AMOUNT); // Should match the smaller side
    });

    it("Should test validateCollateral modifier behavior", async function () {
      // Open initial position to provide counterparty collateral
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      // Test that validateCollateral properly checks exposure with new capacity calculation
      const excessiveAmount = ethers.parseUnits("15000", 18); // Too large for available collateral
      
      await expect(
        trendMarket.connect(trader2).openPosition(marketId, false, excessiveAmount)
      ).to.be.revertedWith("Insufficient counterparty collateral");
      
      // Test that reasonable amounts work
      const reasonableAmount = ethers.parseUnits("500", 18);
      await trendMarket.connect(trader3).openPosition(marketId, false, reasonableAmount);
      
      const market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(reasonableAmount);
    });
  });
});
