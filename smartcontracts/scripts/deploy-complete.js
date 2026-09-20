async function main() {
  console.log("Deploying complete TrendFi ecosystem...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy TrendToken
  console.log("\n1. Deploying TrendToken...");
  const TrendToken = await ethers.getContractFactory("TrendToken");
  const trendToken = await TrendToken.deploy();
  await trendToken.deployed();
  console.log("TrendToken deployed to:", trendToken.address);

  // Deploy TrendOracle
  console.log("\n2. Deploying TrendOracle...");
  const oracleAddress = deployer.address; // Use deployer as oracle for testing
  const TrendOracle = await ethers.getContractFactory("TrendOracle");
  const trendOracle = await TrendOracle.deploy(oracleAddress);
  await trendOracle.deployed();
  console.log("TrendOracle deployed to:", trendOracle.address);

  // Deploy Treasury
  console.log("\n3. Deploying Treasury...");
  const developmentFund = deployer.address;
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(trendToken.address, trendToken.address, developmentFund);
  await treasury.deployed();
  console.log("Treasury deployed to:", treasury.address);

  // Deploy RiskManager
  console.log("\n4. Deploying RiskManager...");
  const RiskManager = await ethers.getContractFactory("RiskManager");
  const riskManager = await RiskManager.deploy();
  await riskManager.deployed();
  console.log("RiskManager deployed to:", riskManager.address);

  // Deploy LimitOrderBook
  console.log("\n5. Deploying LimitOrderBook...");
  const LimitOrderBook = await ethers.getContractFactory("LimitOrderBook");
  const limitOrderBook = await LimitOrderBook.deploy(trendToken.address);
  await limitOrderBook.deployed();
  console.log("LimitOrderBook deployed to:", limitOrderBook.address);

  // Deploy MarketFactory
  console.log("\n6. Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(
    trendToken.address,
    trendOracle.address,
    treasury.address
  );
  await marketFactory.deployed();
  console.log("MarketFactory deployed to:", marketFactory.address);

  // Deploy TrendMarketV2
  console.log("\n7. Deploying TrendMarketV2...");
  const TrendMarketV2 = await ethers.getContractFactory("TrendMarketV2");
  const trendMarketV2 = await TrendMarketV2.deploy(
    trendToken.address,
    trendOracle.address,
    riskManager.address,
    treasury.address
  );
  await trendMarketV2.deployed();
  console.log("TrendMarketV2 deployed to:", trendMarketV2.address);

  // Deploy basic TrendFi (for compatibility)
  console.log("\n8. Deploying TrendFi (basic)...");
  const TrendFi = await ethers.getContractFactory("TrendFi");
  const trendFi = await TrendFi.deploy();
  await trendFi.deployed();
  console.log("TrendFi deployed to:", trendFi.address);

  // Setup contracts
  console.log("\n9. Setting up contracts...");

  // Set MarketFactory in TrendMarketV2
  console.log("Setting MarketFactory in TrendMarketV2...");
  await trendMarketV2.setMarketFactory(marketFactory.address);

  // Set risk parameters for market
  console.log("Setting risk parameters...");
  await riskManager.setMarketRiskParams(
    1, // marketId
    ethers.parseEther("100000"), // maxPositionSize
    20, // maxLeverage
    100, // maintenanceMargin (10%)
    50, // liquidationFee (0.5%)
    true, // circuitBreakerEnabled
    ethers.parseEther("1000000") // circuitBreakerThreshold
  );

  // Create a sample market
  console.log("\n10. Creating sample market...");
  const tx = await marketFactory.createMarket(
    1, // trendId
    "AI Agents",
    1 // templateId (default template)
  );
  const receipt = await tx.wait();
  
  // Find the market address from the event
  const marketCreatedEvent = receipt.events?.find(e => e.event === 'MarketCreated');
  const marketAddress = marketCreatedEvent?.args?.marketAddress;
  console.log("Sample market created at:", marketAddress);

  // Fund treasury with some tokens
  console.log("\n11. Funding Treasury...");
  await trendToken.transfer(treasury.address, ethers.parseEther("100000"));
  console.log("Transferred 100,000 TREND tokens to Treasury");

  console.log("\n=== Deployment Complete ===");
  console.log("TrendToken:", trendToken.address);
  console.log("TrendOracle:", trendOracle.address);
  console.log("Treasury:", treasury.address);
  console.log("RiskManager:", riskManager.address);
  console.log("LimitOrderBook:", limitOrderBook.address);
  console.log("MarketFactory:", marketFactory.address);
  console.log("TrendMarketV2:", trendMarketV2.address);
  console.log("TrendFi (basic):", trendFi.address);
  console.log("Sample Market:", marketAddress);
  console.log("Oracle Address:", oracleAddress);

  console.log("\n=== Configuration ===");
  console.log("Network: localhost (Hardhat)");
  console.log("Chain ID: 1337");
  console.log("Deployer:", deployer.address);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend .env.local with contract addresses");
  console.log("2. Start backend API server");
  console.log("3. Test contract interactions");
  console.log("4. Create additional markets as needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
