async function main() {
  console.log("Deploying TrendFi contracts...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy TrendToken
  console.log("Deploying TrendToken...");
  const TrendToken = await ethers.getContractFactory("TrendToken");
  const trendToken = await TrendToken.deploy();
  await trendToken.deployed();
  console.log("TrendToken deployed to:", trendToken.address);

  // Deploy TrendOracle
  console.log("Deploying TrendOracle...");
  const oracleAddress = "0x" + "0".repeat(40); // Placeholder oracle address
  const TrendOracle = await ethers.getContractFactory("TrendOracle");
  const trendOracle = await TrendOracle.deploy(oracleAddress);
  await trendOracle.deployed();
  console.log("TrendOracle deployed to:", trendOracle.address);

  // Deploy TrendMarket
  console.log("Deploying TrendMarket...");
  const TrendMarket = await ethers.getContractFactory("TrendMarket");
  const trendMarket = await TrendMarket.deploy(trendToken.address, trendOracle.address);
  await trendMarket.deployed();
  console.log("TrendMarket deployed to:", trendMarket.address);

  // Deploy TrendFi (basic contract)
  console.log("Deploying TrendFi...");
  const TrendFi = await ethers.getContractFactory("TrendFi");
  const trendFi = await TrendFi.deploy();
  await trendFi.deployed();
  console.log("TrendFi deployed to:", trendFi.address);

  console.log("\n=== Deployment Summary ===");
  console.log("TrendToken:", trendToken.address);
  console.log("TrendOracle:", trendOracle.address);
  console.log("TrendMarket:", trendMarket.address);
  console.log("TrendFi:", trendFi.address);
  console.log("Oracle Address (update this):", oracleAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
