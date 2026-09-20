const { expect } = require("chai");
const { ethers } = require("hardhat");

async function testEthFees() {
    console.log("Testing ETH-only fee system...");
    
    const [deployer, trader, treasury] = await ethers.getSigners();
    
    // Deploy contracts
    console.log("1. Deploying TrendToken...");
    const TrendToken = await ethers.getContractFactory("TrendToken");
    const trendToken = await TrendToken.deploy();
    await trendToken.deployed();
    
    console.log("2. Deploying TrendOracle...");
    const TrendOracle = await ethers.getContractFactory("TrendOracle");
    const trendOracle = await TrendOracle.deploy(deployer.address);
    await trendOracle.deployed();
    
    console.log("3. Deploying RiskManager...");
    const RiskManager = await ethers.getContractFactory("RiskManager");
    const riskManager = await RiskManager.deploy();
    await riskManager.deployed();
    
    console.log("4. Deploying Treasury...");
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasuryContract = await Treasury.deploy(
        trendToken.address, 
        trendToken.address, 
        treasury.address
    );
    await treasuryContract.deployed();
    
    console.log("5. Deploying MarketFactory...");
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    const marketFactory = await MarketFactory.deploy(
        trendToken.address,
        trendOracle.address,
        treasuryContract.address
    );
    await marketFactory.deployed();
    
    console.log("6. Creating market template...");
    await marketFactory.createMarketTemplate(
        "Standard",
        ethers.utils.parseEther("10"), // 10 tokens min collateral
        10, // 10x leverage
        50 // 0.5% fee rate
    );
    
    console.log("7. Creating market with ETH fee...");
    const marketCreationFee = await marketFactory.marketCreationFee();
    const tx = await marketFactory.createMarket(
        1,
        "Test Trend",
        1,
        { value: marketCreationFee }
    );
    const receipt = await tx.wait();
    
    // Check ETH was transferred to treasury
    const treasuryBalance = await ethers.provider.getBalance(treasuryContract.address);
    const expectedProtocolFee = marketCreationFee.mul(200).div(1000); // 20% of fee
    
    console.log(`Treasury ETH balance: ${ethers.utils.formatEther(treasuryBalance)} ETH`);
    console.log(`Expected protocol fee: ${ethers.utils.formatEther(expectedProtocolFee)} ETH`);
    
    expect(treasuryBalance).to.equal(expectedProtocolFee);
    
    console.log("8. Testing ETH fee distribution...");
    const ethTreasuryBalance = await treasuryContract.getEthTreasuryBalance();
    const ethStakingRewards = await treasuryContract.getEthStakingRewards();
    const ethBuybackAmount = await treasuryContract.getEthBuybackAmount();
    const ethDevelopmentFund = await treasuryContract.getEthDevelopmentFund();
    
    console.log(`ETH Treasury: ${ethers.utils.formatEther(ethTreasuryBalance)} ETH`);
    console.log(`ETH Staking: ${ethers.utils.formatEther(ethStakingRewards)} ETH`);
    console.log(`ETH Buyback: ${ethers.utils.formatEther(ethBuybackAmount)} ETH`);
    console.log(`ETH Development: ${ethers.utils.formatEther(ethDevelopmentFund)} ETH`);
    
    // Verify distribution (40% treasury, 30% staking, 20% buyback, 10% development)
    expect(ethTreasuryBalance).to.equal(expectedProtocolFee.mul(4000).div(10000));
    expect(ethStakingRewards).to.equal(expectedProtocolFee.mul(3000).div(10000));
    expect(ethBuybackAmount).to.equal(expectedProtocolFee.mul(2000).div(10000));
    expect(ethDevelopmentFund).to.equal(expectedProtocolFee.mul(1000).div(10000));
    
    console.log("✅ ETH fee system working correctly!");
    
    return {
        trendToken,
        marketFactory,
        treasuryContract,
        riskManager
    };
}

// Test position opening with ETH fees
async function testPositionFees() {
    console.log("\nTesting position opening/closing with ETH fees...");
    
    const { trendToken, marketFactory, treasuryContract, riskManager } = await testEthFees();
    const [deployer, trader] = await ethers.getSigners();
    
    // Get market address
    const market = await marketFactory.getMarketByTrend(1);
    const TrendMarketV2 = await ethers.getContractFactory("TrendMarketV2");
    const marketContract = TrendMarketV2.attach(market.marketAddress);
    
    // Mint and approve collateral tokens for trader
    const collateralAmount = ethers.utils.parseEther("100");
    await trendToken.mint(trader.address, collateralAmount);
    await trendToken.connect(trader).approve(marketContract.address, collateralAmount);
    
    // Calculate ETH fee for opening position
    const ethFee = collateralAmount.mul(50).div(10000); // 0.5% fee
    console.log(`ETH fee for opening: ${ethers.utils.formatEther(ethFee)} ETH`);
    
    // Open position with ETH fee
    const treasuryBalanceBefore = await ethers.provider.getBalance(treasuryContract.address);
    
    const tx = await marketContract.connect(trader).openPosition(
        1, // marketId
        true, // isLong
        collateralAmount,
        5, // leverage
        { value: ethFee }
    );
    await tx.wait();
    
    const treasuryBalanceAfter = await ethers.provider.getBalance(treasuryContract.address);
    const ethFeesCollected = treasuryBalanceAfter.sub(treasuryBalanceBefore);
    
    console.log(`ETH fees collected: ${ethers.utils.formatEther(ethFeesCollected)} ETH`);
    expect(ethFeesCollected).to.equal(ethFee);
    
    console.log("✅ Position ETH fees working correctly!");
}

if (require.main === module) {
    testEthFees()
        .then(() => testPositionFees())
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("Test failed:", error);
            process.exit(1);
        });
}

module.exports = { testEthFees, testPositionFees };
