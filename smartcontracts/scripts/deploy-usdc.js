async function main() {
  console.log("Deploying TrendFi contracts with USDC...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy MockUSDC (for testing - replace with real USDC on mainnet)
  console.log("Deploying MockUSDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdcToken = await MockUSDC.deploy(ethers.parseUnits("1000000", 6)); // 1M USDC
  await usdcToken.deployed();
  console.log("USDC Token deployed to:", usdcToken.address);

  // Deploy TrendOracle
  console.log("Deploying TrendOracle...");
  const oracleAddress = "0x" + "0".repeat(40); // Placeholder oracle address
  const TrendOracle = await ethers.getContractFactory("TrendOracle");
  const trendOracle = await TrendOracle.deploy(oracleAddress);
  await trendOracle.deployed();
  console.log("TrendOracle deployed to:", trendOracle.address);

  // Deploy Treasury
  console.log("Deploying Treasury...");
  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy(usdcToken.address, deployer.address);
  await treasury.deployed();
  console.log("Treasury deployed to:", treasury.address);

  // Deploy MarketFactory
  console.log("Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const marketFactory = await MarketFactory.deploy(usdcToken.address, trendOracle.address, treasury.address);
  await marketFactory.deployed();
  console.log("MarketFactory deployed to:", marketFactory.address);

  // Deploy RiskManager
  console.log("Deploying RiskManager...");
  const RiskManager = await ethers.getContractFactory("RiskManager");
  const riskManager = await RiskManager.deploy();
  await riskManager.deployed();
  console.log("RiskManager deployed to:", riskManager.address);

  // Deploy TrendMarketV2 (example market)
  console.log("Deploying TrendMarketV2...");
  const TrendMarketV2 = await ethers.getContractFactory("TrendMarketV2");
  const trendMarket = await TrendMarketV2.deploy(
    usdcToken.address,
    trendOracle.address,
    riskManager.address,
    treasury.address,
    marketFactory.address
  );
  await trendMarket.deployed();
  console.log("TrendMarketV2 deployed to:", trendMarket.address);

  // Deploy TrendFi (basic contract)
  console.log("Deploying TrendFi...");
  const TrendFi = await ethers.getContractFactory("TrendFi");
  const trendFi = await TrendFi.deploy();
  await trendFi.deployed();
  console.log("TrendFi deployed to:", trendFi.address);

  console.log("\n=== Deployment Summary ===");
  console.log("USDC Token:", usdcToken.address);
  console.log("TrendOracle:", trendOracle.address);
  console.log("Treasury:", treasury.address);
  console.log("MarketFactory:", marketFactory.address);
  console.log("RiskManager:", riskManager.address);
  console.log("TrendMarketV2:", trendMarket.address);
  console.log("TrendFi:", trendFi.address);
  console.log("Oracle Address (update this):", oracleAddress);
  
  console.log("\n=== USDC Configuration ===");
  console.log("Primary payment token: USDC");
  console.log("USDC decimals: 6");
  console.log("Initial USDC supply: 1,000,000 USDC");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
