const { expect } = require("chai");
const { ethers } = require("hardhat");

async function testCreatorFees() {
    console.log("Testing Pump.fun-style creator fee system...");
    
    const [deployer, creator, trader1, trader2, treasury] = await ethers.getSigners();
    
    // Deploy contracts
    console.log("1. Deploying TrendToken...");
    const TrendToken = await ethers.getContractFactory("TrendToken");
    const trendToken = await TrendToken.deploy();
    await trendToken.deployed();
    
    console.log("2. Deploying TrendOracle...");
    const TrendOracle = await ethers.getContractFactory("TrendOracle");
    const trendOracle = await TrendOracle.deploy(deployer.address);
    await trendOracle.deployed();
    
    console.log("3. Deploying Treasury...");
    const Treasury = await ethers.getContractFactory("Treasury");
    const treasuryContract = await Treasury.deploy(
        trendToken.address, 
        trendToken.address, 
        treasury.address
    );
    await treasuryContract.deployed();
    
    console.log("4. Deploying MarketFactory...");
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    const marketFactory = await MarketFactory.deploy(
        trendToken.address,
        trendOracle.address,
        treasuryContract.address
    );
    await marketFactory.deployed();
    
    console.log("5. Creating market template...");
    await marketFactory.createMarketTemplate(
        "Standard",
        ethers.utils.parseEther("10"), // 10 tokens min collateral
        10, // 10x leverage
        50 // 0.5% fee rate
    );
    
    console.log("6. Creator creates market...");
    const marketCreationFee = await marketFactory.marketCreationFee();
    const tx = await marketFactory.connect(creator).createMarket(
        1,
        "Creator's Trend",
        1,
        { value: marketCreationFee }
    );
    const receipt = await tx.wait();
    
    // Get market details
    const market = await marketFactory.getMarketByTrend(1);
    const marketAddress = market.marketAddress;
    
    console.log(`Market created at: ${marketAddress}`);
    console.log(`Market creator: ${await marketFactory.getMarketCreator(1)}`);
    
    // Verify creator is tracked
    expect(await marketFactory.getMarketCreator(1)).to.equal(creator.address);
    
    console.log("7. Testing dynamic creator fee rates...");
    
    // Small market (< 100 ETH volume) should get 0.95% fee
    let creatorFeeRate = await marketFactory.getCreatorFeeRate(1);
    console.log(`Creator fee rate for small market: ${creatorFeeRate.toNumber() / 100}%`);
    expect(creatorFeeRate).to.equal(950); // 0.95%
    
    // Get TrendMarketV2 instance
    const TrendMarketV2 = await ethers.getContractFactory("TrendMarketV2");
    const marketContract = TrendMarketV2.attach(marketAddress);
    
    // Mint and approve collateral tokens for traders
    const collateralAmount = ethers.utils.parseEther("100");
    await trendToken.mint(trader1.address, collateralAmount);
    await trendToken.connect(trader1).approve(marketContract.address, collateralAmount);
    
    console.log("8. Trader1 opens position (creator should earn 0.95% fee)...");
    
    const creatorBalanceBefore = await ethers.provider.getBalance(creator.address);
    const treasuryBalanceBefore = await ethers.provider.getBalance(treasuryContract.address);
    
    // Calculate expected fees
    const expectedTreasuryFee = collateralAmount.mul(50).div(10000); // 0.5%
    const expectedCreatorFee = collateralAmount.mul(950).div(10000); // 0.95%
    const totalEthNeeded = expectedTreasuryFee.add(expectedCreatorFee);
    
    const tx2 = await marketContract.connect(trader1).openPosition(
        1, // marketId
        true, // isLong
        collateralAmount,
        5, // leverage
        { value: totalEthNeeded }
    );
    const receipt2 = await tx2.wait();
    
    // Check fee payments
    const creatorBalanceAfter = await ethers.provider.getBalance(creator.address);
    const treasuryBalanceAfter = await ethers.provider.getBalance(treasuryContract.address);
    
    const creatorEarnings = creatorBalanceAfter.sub(creatorBalanceBefore);
    const treasuryEarnings = treasuryBalanceAfter.sub(treasuryBalanceBefore);
    
    console.log(`Creator earnings: ${ethers.utils.formatEther(creatorEarnings)} ETH`);
    console.log(`Treasury earnings: ${ethers.utils.formatEther(treasuryEarnings)} ETH`);
    
    expect(creatorEarnings).to.equal(expectedCreatorFee);
    expect(treasuryEarnings).to.be.closeTo(expectedTreasuryFee, ethers.utils.parseEther("0.001"));
    
    console.log("9. Testing volume-based fee scaling...");
    
    // Simulate high volume to reduce creator fee rate
    const highVolume = ethers.utils.parseEther("1500"); // Above 1000 ETH threshold
    await marketFactory.updateMarketVolume(1, highVolume);
    
    // Should now get 0.05% fee (base rate)
    creatorFeeRate = await marketFactory.getCreatorFeeRate(1);
    console.log(`Creator fee rate for large market: ${creatorFeeRate.toNumber() / 100}%`);
    expect(creatorFeeRate).to.equal(500); // 0.05%
    
    console.log("10. Testing profitable trade (creator earns on PnL fees)...");
    
    // Setup second trader
    await trendToken.mint(trader2.address, collateralAmount);
    await trendToken.connect(trader2).approve(marketContract.address, collateralAmount);
    
    // Open position with new fee rate
    const newCreatorFee = collateralAmount.mul(500).div(10000); // 0.05%
    const newTreasuryFee = collateralAmount.mul(50).div(10000); // 0.5%
    const newTotalFee = newCreatorFee.add(newTreasuryFee);
    
    await marketContract.connect(trader2).openPosition(
        1,
        false, // short position
        collateralAmount,
        5,
        { value: newTotalFee }
    );
    
    // Simulate profitable close (need to send ETH for PnL fees)
    const mockPnl = ethers.utils.parseEther("20"); // 20 ETH profit
    const pnlTreasuryFee = mockPnl.mul(50).div(10000); // 0.5% of PnL
    const pnlCreatorFee = mockPnl.mul(500).div(10000); // 0.05% of PnL
    const totalPnLFees = pnlTreasuryFee.add(pnlCreatorFee);
    
    const creatorBalanceBeforeClose = await ethers.provider.getBalance(creator.address);
    
    // Close position with PnL fees
    await marketContract.connect(trader1).closePosition(1, { value: totalPnLFees });
    
    const creatorBalanceAfterClose = await ethers.provider.getBalance(creator.address);
    const closeEarnings = creatorBalanceAfterClose.sub(creatorBalanceBeforeClose);
    
    console.log(`Creator earnings from profitable close: ${ethers.utils.formatEther(closeEarnings)} ETH`);
    expect(closeEarnings).to.equal(pnlCreatorFee);
    
    console.log("✅ Creator fee system working correctly!");
    console.log(`Total creator earnings: ${ethers.utils.formatEther(creatorEarnings.add(closeEarnings))} ETH`);
    
    return {
        marketFactory,
        marketContract,
        creator,
        trader1,
        trader2
    };
}

async function testCreatorEarningsProjection() {
    console.log("\n📈 Testing creator earnings projections...");
    
    const { marketFactory, marketContract, creator } = await testCreatorFees();
    
    // Simulate different trading volumes
    const volumes = [
        ethers.utils.parseEther("50"),   // Small market: 0.95% fee
        ethers.utils.parseEther("500"),  // Medium market: ~0.5% fee  
        ethers.utils.parseEther("2000")  // Large market: 0.05% fee
    ];
    
    for (let i = 0; i < volumes.length; i++) {
        const volume = volumes[i];
        await marketFactory.updateMarketVolume(1, volume);
        
        const feeRate = await marketFactory.getCreatorFeeRate(1);
        const dailyVolume = volume;
        const dailyEarnings = dailyVolume.mul(feeRate).div(10000);
        const monthlyEarnings = dailyEarnings.mul(30);
        
        console.log(`\nScenario ${i + 1}:`);
        console.log(`  Market volume: ${ethers.utils.formatEther(volume)} ETH`);
        console.log(`  Creator fee rate: ${feeRate.toNumber() / 100}%`);
        console.log(`  Daily earnings: ${ethers.utils.formatEther(dailyEarnings)} ETH`);
        console.log(`  Monthly earnings: ${ethers.utils.formatEther(monthlyEarnings)} ETH`);
    }
    
    console.log("\n💡 With $10M daily volume, creator earns:");
    const tenMVolume = ethers.utils.parseEther("10000000");
    const smallMarketFee = tenMVolume.mul(950).div(10000);
    console.log(`  Small market: ${ethers.utils.formatEther(smallMarketFee)} ETH per day`);
    console.log(`  ~$${ethers.utils.formatEther(smallMarketFee) * 2000} per day (assuming $2000/ETH)`);
}

if (require.main === module) {
    testCreatorFees()
        .then(() => testCreatorEarningsProjection())
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("Test failed:", error);
            process.exit(1);
        });
}

module.exports = { testCreatorFees, testCreatorEarningsProjection };
