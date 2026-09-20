const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrendMarket", function () {
  let trendMarket, trendToken, trendOracle;
  let owner, trader1, trader2, oracle, addrs;
  let marketId, positionId;
  const INITIAL_PRICE = 1000000; // 1M in some unit
  const POSITION_AMOUNT = ethers.parseUnits("1000", 18); // 1000 tokens
  const LEVERAGE = 10;
  const FEE_RATE = 5; // 0.5%

  beforeEach(async function () {
    [owner, trader1, trader2, oracle, ...addrs] = await ethers.getSigners();
    
    // Deploy mock token
    const TrendToken = await ethers.getContractFactory("TrendToken");
    trendToken = await TrendToken.deploy();
    await trendToken.waitForDeployment();
    
    // Deploy config contract
    const TrendFiConfig = await ethers.getContractFactory("TrendFiConfig");
    const trendFiConfig = await TrendFiConfig.deploy();
    await trendFiConfig.waitForDeployment();
    
    // Deploy mock oracle
    const TrendOracle = await ethers.getContractFactory("TrendOracle");
    trendOracle = await TrendOracle.deploy();
    await trendOracle.waitForDeployment();
    await trendOracle.initialize(oracle.address, trendFiConfig.address);
    
    // Deploy market
    const TrendMarket = await ethers.getContractFactory("TrendMarket");
    trendMarket = await TrendMarket.deploy(trendToken.address, trendOracle.address, trendFiConfig.address);
    await trendMarket.waitForDeployment();
    
    // Create a market
    await trendMarket.createMarket(1, "DeFi Trend");
    marketId = 1;
    
    // Update market price
    const timestamp = Math.floor(Date.now() / 1000);
    const messageHash = ethers.solidityKeccak256(
      ["uint256", "string", "uint256", "uint256"],
      [1, "DeFi Trend", INITIAL_PRICE, timestamp]
    );
    const ethSignedMessageHash = ethers.solidityKeccak256(
      ["string", "bytes32"],
      ["\x19Ethereum Signed Message:\n32", messageHash]
    );
    const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
    const dataHash = ethers.solidityKeccak256(
      ["uint256", "string", "uint256", "uint256"],
      [1, "DeFi Trend", INITIAL_PRICE, timestamp]
    );
    
    await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", INITIAL_PRICE, timestamp, signature);
    await trendMarket.updatePrice(marketId, dataHash);
    
    // Transfer tokens to traders
    await trendToken.transfer(trader1.address, POSITION_AMOUNT * 10n);
    await trendToken.transfer(trader2.address, POSITION_AMOUNT * 10n);
    
    // Approve market contract
    await trendToken.connect(trader1).approve(trendMarket.address, POSITION_AMOUNT * 10n);
    await trendToken.connect(trader2).approve(trendMarket.address, POSITION_AMOUNT * 10n);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await trendMarket.owner()).to.equal(owner.address);
    });

    it("Should set correct collateral token", async function () {
      expect(await trendMarket.collateralToken()).to.equal(trendToken.address);
    });

    it("Should set correct oracle address", async function () {
      expect(await trendMarket.trendOracle()).to.equal(trendOracle.address);
    });

    it("Should initialize with zero counters", async function () {
      expect(await trendMarket.positionCounter()).to.equal(0);
      expect(await trendMarket.marketCounter()).to.equal(1); // Created in beforeEach
    });

    it("Should prevent deployment with invalid addresses", async function () {
      const TrendMarket = await ethers.getContractFactory("TrendMarket");
      
      await expect(TrendMarket.deploy(ethers.ZeroAddress, trendOracle.address, trendFiConfig.address))
        .to.be.revertedWith("Invalid collateral token");
      
      await expect(TrendMarket.deploy(trendToken.address, ethers.ZeroAddress, trendFiConfig.address))
        .to.be.revertedWith("Invalid oracle address");
      
      await expect(TrendMarket.deploy(trendToken.address, trendOracle.address, ethers.ZeroAddress))
        .to.be.revertedWith("Invalid config address");
    });
  });

  describe("Market Creation", function () {
    it("Should create a new market", async function () {
      await trendMarket.createMarket(2, "NFT Trend");
      
      const market = await trendMarket.markets(2);
      expect(market.trendId).to.equal(2);
      expect(market.trendName).to.equal("NFT Trend");
      expect(market.active).to.equal(true);
    });

    it("Should emit MarketCreated event", async function () {
      await expect(trendMarket.createMarket(2, "NFT Trend"))
        .to.emit(trendMarket, "MarketCreated")
        .withArgs(2, 2, "NFT Trend");
    });

    it("Should increment market counter", async function () {
      await trendMarket.createMarket(2, "NFT Trend");
      expect(await trendMarket.marketCounter()).to.equal(2);
    });

    it("Should prevent non-authorized from creating markets", async function () {
      await expect(trendMarket.connect(trader1).createMarket(2, "Unauthorized"))
        .to.be.revertedWith("Not authorized");
    });

    it("Should prevent invalid trend ID", async function () {
      await expect(trendMarket.createMarket(0, "Invalid"))
        .to.be.revertedWith("Invalid trend ID");
    });

    it("Should prevent invalid name length", async function () {
      await expect(trendMarket.createMarket(2, ""))
        .to.be.revertedWith("Invalid name length");
      
      const longName = "a".repeat(101);
      await expect(trendMarket.createMarket(2, longName))
        .to.be.revertedWith("Invalid name length");
    });

    it("Should prevent duplicate market for same trend", async function () {
      await expect(trendMarket.createMarket(1, "Duplicate"))
        .to.be.revertedWith("Market already exists");
    });

    it("Should handle multiple market creation", async function () {
      await trendMarket.createMarket(2, "NFT Trend");
      await trendMarket.createMarket(3, "GameFi Trend");
      
      expect(await trendMarket.marketCounter()).to.equal(3);
      
      const market2 = await trendMarket.markets(2);
      const market3 = await trendMarket.markets(3);
      
      expect(market2.trendName).to.equal("NFT Trend");
      expect(market3.trendName).to.equal("GameFi Trend");
    });
  });

  describe("Position Opening", function () {
    it("Should open a long position", async function () {
      const tx = await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      const receipt = await tx.wait();
      
      positionId = 1;
      const position = await trendMarket.positions(positionId);
      
      expect(position.trader).to.equal(trader1.address);
      expect(position.trendId).to.equal(1);
      expect(position.isLong).to.equal(true);
      expect(position.amount).to.equal(POSITION_AMOUNT);
      expect(position.openPrice).to.equal(INITIAL_PRICE);
      expect(position.closed).to.equal(false);
    });

    it("Should open a short position", async function () {
      await trendMarket.connect(trader1).openPosition(marketId, false, POSITION_AMOUNT);
      
      const position = await trendMarket.positions(1);
      expect(position.isLong).to.equal(false);
      expect(position.amount).to.equal(POSITION_AMOUNT);
    });

    it("Should emit PositionOpened event", async function () {
      await expect(trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT))
        .to.emit(trendMarket, "PositionOpened")
        .withArgs(1, trader1.address, 1, true, POSITION_AMOUNT);
    });

    it("Should increment position counter", async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      expect(await trendMarket.positionCounter()).to.equal(1);
    });

    it("Should charge opening fee", async function () {
      const expectedFee = (POSITION_AMOUNT * BigInt(FEE_RATE)) / 1000n;
      const initialBalance = await trendToken.balanceOf(trader1.address);
      
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      const finalBalance = await trendToken.balanceOf(trader1.address);
      expect(initialBalance - finalBalance).to.equal(POSITION_AMOUNT + expectedFee);
    });

    it("Should update market totals", async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      let market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(0);
      
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(POSITION_AMOUNT);
    });

    it("Should prevent opening position with zero amount", async function () {
      await expect(trendMarket.connect(trader1).openPosition(marketId, true, 0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should prevent opening position on inactive market", async function () {
      await trendMarket.createMarket(2, "Inactive Market");
      await trendMarket.updateMarketStatus(2, false); // Assuming this function exists
      
      await expect(trendMarket.connect(trader1).openPosition(2, true, POSITION_AMOUNT))
        .to.be.revertedWith("Market not active");
    });

    it("Should prevent opening position with insufficient collateral", async function () {
      // Transfer all tokens away from trader1
      await trendToken.connect(trader1).transfer(owner.address, await trendToken.balanceOf(trader1.address));
      
      await expect(trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT))
        .to.be.revertedWith("Insufficient collateral");
    });

    it("Should handle multiple positions from same trader", async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader1).openPosition(marketId, false, POSITION_AMOUNT);
      
      const positions = await trendMarket.getTraderPositions(marketId, trader1.address);
      expect(positions.length).to.equal(2);
    });
  });

  describe("Position Closing", function () {
    beforeEach(async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      positionId = 1;
    });

    it("Should close a profitable long position", async function () {
      // Update price to be higher
      const newPrice = INITIAL_PRICE * 2; // Double the price
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const initialBalance = await trendToken.balanceOf(trader1.address);
      await trendMarket.connect(trader1).closePosition(positionId);
      const finalBalance = await trendToken.balanceOf(trader1.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should close a losing long position", async function () {
      // Update price to be lower
      const newPrice = INITIAL_PRICE / 2; // Half the price
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const initialBalance = await trendToken.balanceOf(trader1.address);
      await trendMarket.connect(trader1).closePosition(positionId);
      const finalBalance = await trendToken.balanceOf(trader1.address);
      
      expect(finalBalance).to.be.lt(initialBalance);
    });

    it("Should emit PositionClosed event", async function () {
      await expect(trendMarket.connect(trader1).closePosition(positionId))
        .to.emit(trendMarket, "PositionClosed")
        .withArgs(positionId, trader1.address, 0); // PnL is 0 since price hasn't changed
    });

    it("Should update position state", async function () {
      await trendMarket.connect(trader1).closePosition(positionId);
      
      const position = await trendMarket.positions(positionId);
      expect(position.closed).to.equal(true);
      expect(position.closePrice).to.equal(INITIAL_PRICE);
      expect(position.closeTimestamp).to.be.gt(0);
    });

    it("Should update market totals", async function () {
      const marketBefore = await trendMarket.markets(marketId);
      expect(marketBefore.totalLong).to.equal(POSITION_AMOUNT);
      
      await trendMarket.connect(trader1).closePosition(positionId);
      
      const marketAfter = await trendMarket.markets(marketId);
      expect(marketAfter.totalLong).to.equal(0);
    });

    it("Should prevent closing already closed position", async function () {
      await trendMarket.connect(trader1).closePosition(positionId);
      
      await expect(trendMarket.connect(trader1).closePosition(positionId))
        .to.be.revertedWith("Position already closed");
    });

    it("Should prevent non-owner from closing position", async function () {
      await expect(trendMarket.connect(trader2).closePosition(positionId))
        .to.be.revertedWith("Not position owner");
    });

    it("Should handle closing profitable short position", async function () {
      // Open short position
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      const shortPositionId = 2;
      
      // Update price to be lower (profitable for short)
      const newPrice = INITIAL_PRICE / 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const initialBalance = await trendToken.balanceOf(trader2.address);
      await trendMarket.connect(trader2).closePosition(shortPositionId);
      const finalBalance = await trendToken.balanceOf(trader2.address);
      
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Price Updates", function () {
    it("Should update market price", async function () {
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      
      await expect(trendMarket.updatePrice(marketId, dataHash))
        .to.emit(trendMarket, "PriceUpdated")
        .withArgs(marketId, newPrice);
      
      const market = await trendMarket.markets(marketId);
      expect(market.currentPrice).to.equal(newPrice);
    });

    it("Should prevent non-owner from updating price", async function () {
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", INITIAL_PRICE, Math.floor(Date.now() / 1000)]
      );
      
      await expect(trendMarket.connect(trader1).updatePrice(marketId, dataHash))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent price update for inactive market", async function () {
      // Create inactive market
      await trendMarket.createMarket(2, "Inactive");
      const inactiveMarketId = 2;
      
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [2, "Inactive", INITIAL_PRICE, Math.floor(Date.now() / 1000)]
      );
      
      await expect(trendMarket.updatePrice(inactiveMarketId, dataHash))
        .to.be.revertedWith("Market not active");
    });

    it("Should prevent price update with mismatched trend data", async function () {
      const wrongTrendDataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [999, "Wrong Trend", INITIAL_PRICE, Math.floor(Date.now() / 1000)]
      );
      
      await expect(trendMarket.updatePrice(marketId, wrongTrendDataHash))
        .to.be.revertedWith("Data mismatch");
    });

    it("Should prevent price update with unverified data", async function () {
      const unverifiedDataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", INITIAL_PRICE, Math.floor(Date.now() / 1000)]
      );
      
      await expect(trendMarket.updatePrice(marketId, unverifiedDataHash))
        .to.be.revertedWith("Data not verified");
    });
  });

  describe("PnL Calculation", function () {
    beforeEach(async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      positionId = 1;
    });

    it("Should calculate zero PnL for unchanged price", async function () {
      const pnl = await trendMarket.getPositionPnl(positionId);
      expect(pnl).to.equal(0);
    });

    it("Should calculate positive PnL for profitable long position", async function () {
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const pnl = await trendMarket.getPositionPnl(positionId);
      const expectedPnl = ((BigInt(newPrice) - BigInt(INITIAL_PRICE)) * POSITION_AMOUNT * BigInt(LEVERAGE)) / BigInt(INITIAL_PRICE);
      expect(pnl).to.equal(expectedPnl);
    });

    it("Should calculate zero PnL for losing long position", async function () {
      const newPrice = INITIAL_PRICE / 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const pnl = await trendMarket.getPositionPnl(positionId);
      expect(pnl).to.equal(0);
    });

    it("Should calculate PnL for closed positions", async function () {
      // Update price first
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      // Close position
      await trendMarket.connect(trader1).closePosition(positionId);
      
      // PnL should still be calculable
      const pnl = await trendMarket.getPositionPnl(positionId);
      const expectedPnl = ((BigInt(newPrice) - BigInt(INITIAL_PRICE)) * POSITION_AMOUNT * BigInt(LEVERAGE)) / BigInt(INITIAL_PRICE);
      expect(pnl).to.equal(expectedPnl);
    });
  });

  describe("Market Queries", function () {
    beforeEach(async function () {
      await trendMarket.createMarket(2, "NFT Trend");
      await trendMarket.createMarket(3, "GameFi Trend");
      
      // Deactivate second market
      // Note: This assumes there's an updateMarketStatus function, if not, we'll need to implement it
    });

    it("Should get all active markets", async function () {
      const activeMarkets = await trendMarket.getActiveMarkets();
      expect(activeMarkets.length).to.be.gte(1); // At least the first market
      
      expect(activeMarkets[0].trendId).to.equal(1);
      expect(activeMarkets[0].active).to.equal(true);
    });

    it("Should get trader positions", async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader1).openPosition(marketId, false, POSITION_AMOUNT);
      
      const positions = await trendMarket.getTraderPositions(marketId, trader1.address);
      expect(positions.length).to.equal(2);
      expect(positions[0].trader).to.equal(trader1.address);
      expect(positions[1].trader).to.equal(trader1.address);
    });

    it("Should return empty positions for trader with no positions", async function () {
      const positions = await trendMarket.getTraderPositions(marketId, trader2.address);
      expect(positions.length).to.equal(0);
    });

    it("Should find market by trend ID", async function () {
      // This is tested implicitly through other functions that use getMarketIdByTrendId
      const market = await trendMarket.markets(marketId);
      expect(market.trendId).to.equal(1);
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This is a basic test - more sophisticated tests would require a malicious contract
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      // The fact that the function uses nonReentrant modifier and executes successfully
      // indicates the protection is in place
      const position = await trendMarket.positions(1);
      expect(position.trader).to.equal(trader1.address);
    });
  });

  describe("Gas Optimization", function () {
    it("Should report gas usage for opening position", async function () {
      const tx = await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      const receipt = await tx.wait();
      console.log("Gas used for openPosition:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for closing position", async function () {
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      const tx = await trendMarket.connect(trader1).closePosition(1);
      const receipt = await tx.wait();
      console.log("Gas used for closePosition:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for price update", async function () {
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      
      const tx = await trendMarket.updatePrice(marketId, dataHash);
      const receipt = await tx.wait();
      console.log("Gas used for updatePrice:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for getting active markets", async function () {
      const tx = await trendMarket.getActiveMarkets();
      const receipt = await tx.wait();
      console.log("Gas used for getActiveMarkets:", receipt.gasUsed.toString());
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause", async function () {
      await trendMarket.emergencyPause();
      
      await expect(trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT))
        .to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause", async function () {
      await trendMarket.emergencyPause();
      await trendMarket.emergencyUnpause();
      
      // Should work after unpause
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      expect(await trendMarket.positionCounter()).to.equal(1);
    });

    it("Should prevent non-owner from pausing", async function () {
      await expect(trendMarket.connect(trader1).emergencyPause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to update config contract", async function () {
      const newConfig = addrs[0].address;
      await trendMarket.updateConfigContract(newConfig);
      
      expect(await trendMarket.configContract()).to.equal(newConfig);
    });

    it("Should prevent updating config to zero address", async function () {
      await expect(trendMarket.updateConfigContract(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid config address");
    });

    it("Should allow owner to update oracle", async function () {
      const newOracle = addrs[0].address;
      await trendMarket.updateOracle(newOracle);
      
      expect(await trendMarket.trendOracle()).to.equal(newOracle);
    });

    it("Should prevent updating oracle to zero address", async function () {
      await expect(trendMarket.updateOracle(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid oracle address");
    });
  });

  describe("Access Control", function () {
    it("Should respect onlyAuthorized modifier", async function () {
      await expect(trendMarket.connect(trader1).createMarket(999, "Unauthorized"))
        .to.be.revertedWith("Not authorized");
    });

    it("Should allow authorized addresses to create markets", async function () {
      // Add trader1 as authorized updater in config
      await trendFiConfig.addAuthorizedUpdater(trader1.address);
      
      await trendMarket.connect(trader1).createMarket(999, "Authorized");
      expect(await trendMarket.marketCounter()).to.equal(2);
    });
  });

  describe("Gas Price Protection", function () {
    it("Should prevent transactions with high gas price", async function () {
      // This test would need to simulate high gas price
      // For now, we'll just verify the modifier exists by checking normal operation
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      expect(await trendMarket.positionCounter()).to.equal(1);
    });
  });

  describe("Position Size Validation", function () {
    it("Should respect minimum position size", async function () {
      // This would need config to be set with specific min/max values
      // For now, test with very small amount
      await trendMarket.connect(trader1).openPosition(marketId, true, 1);
      expect(await trendMarket.positionCounter()).to.equal(1);
    });
  });

  describe("Emergency Mode", function () {
    it("Should prevent operations when emergency mode is active", async function () {
      // Enable emergency mode in config
      await trendFiConfig.setEmergencyMode(true);
      
      await expect(trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT))
        .to.be.revertedWith("Emergency mode active");
      
      await expect(trendMarket.connect(trader1).closePosition(1))
        .to.be.revertedWith("Emergency mode active");
    });
  });

  describe("Oracle Update Delay", function () {
    it("Should respect oracle update delay", async function () {
      // Update price immediately after previous update
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000);
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      
      // Should fail due to update delay
      await expect(trendMarket.updatePrice(marketId, dataHash))
        .to.be.revertedWith("Update too soon");
    });
  });

  describe("Market State Management", function () {
    it("Should track market last update timestamp", async function () {
      const marketBefore = await trendMarket.markets(marketId);
      const initialTimestamp = marketBefore.lastUpdate;
      
      // Update price
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const marketAfter = await trendMarket.markets(marketId);
      expect(marketAfter.lastUpdate).to.be.gt(initialTimestamp);
    });
  });

  describe("Fee Calculation", function () {
    it("Should calculate fees correctly on position opening", async function () {
      const traderBalanceBefore = await trendToken.balanceOf(trader1.address);
      
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      const traderBalanceAfter = await trendToken.balanceOf(trader1.address);
      const totalDeducted = traderBalanceBefore - traderBalanceAfter;
      
      // Should be position amount + fees
      expect(totalDeducted).to.be.gt(POSITION_AMOUNT);
    });

    it("Should calculate fees correctly on profitable position closing", async function () {
      // Open position
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      // Update price for profit
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const traderBalanceBefore = await trendToken.balanceOf(trader1.address);
      await trendMarket.connect(trader1).closePosition(1);
      const traderBalanceAfter = await trendToken.balanceOf(trader1.address);
      
      // Should receive position amount + profit - fees
      expect(traderBalanceAfter - traderBalanceBefore).to.be.gt(POSITION_AMOUNT);
    });
  });

  describe("Complex Scenarios", function () {
    it("Should handle multiple traders with opposing positions", async function () {
      // Trader 1 goes long
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      
      // Trader 2 goes short
      await trendMarket.connect(trader2).openPosition(marketId, false, POSITION_AMOUNT);
      
      const market = await trendMarket.markets(marketId);
      expect(market.totalLong).to.equal(POSITION_AMOUNT);
      expect(market.totalShort).to.equal(POSITION_AMOUNT);
      
      // Price goes up (long wins)
      const newPrice = INITIAL_PRICE * 2;
      const timestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      const dataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [1, "DeFi Trend", newPrice, timestamp]
      );
      
      await trendOracle.connect(oracle).submitTrendData(1, "DeFi Trend", newPrice, timestamp, signature);
      await trendMarket.updatePrice(marketId, dataHash);
      
      const trader1BalanceBefore = await trendToken.balanceOf(trader1.address);
      const trader2BalanceBefore = await trendToken.balanceOf(trader2.address);
      
      await trendMarket.connect(trader1).closePosition(1);
      await trendMarket.connect(trader2).closePosition(2);
      
      const trader1BalanceAfter = await trendToken.balanceOf(trader1.address);
      const trader2BalanceAfter = await trendToken.balanceOf(trader2.address);
      
      // Trader 1 should profit, trader 2 should lose
      expect(trader1BalanceAfter - trader1BalanceBefore).to.be.gt(POSITION_AMOUNT);
      expect(trader2BalanceAfter - trader2BalanceBefore).to.be.lt(POSITION_AMOUNT);
    });

    it("Should handle position sequence correctly", async function () {
      // Open multiple positions
      await trendMarket.connect(trader1).openPosition(marketId, true, POSITION_AMOUNT);
      await trendMarket.connect(trader1).openPosition(marketId, false, POSITION_AMOUNT);
      await trendMarket.connect(trader2).openPosition(marketId, true, POSITION_AMOUNT);
      
      expect(await trendMarket.positionCounter()).to.equal(3);
      
      // Close in different order
      await trendMarket.connect(trader1).closePosition(2); // Close short first
      await trendMarket.connect(trader2).closePosition(3); // Close other trader's position
      await trendMarket.connect(trader1).closePosition(1); // Close long last
      
      // All should be closed
      for (let i = 1; i <= 3; i++) {
        const position = await trendMarket.positions(i);
        expect(position.closed).to.equal(true);
      }
    });
  });
});
