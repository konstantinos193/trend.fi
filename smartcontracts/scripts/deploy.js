async function main() {
  console.log("Deploying TrendFi contract...");

  const TrendFi = await ethers.getContractFactory("TrendFi");
  const trendFi = await TrendFi.deploy();

  await trendFi.deployed();

  console.log(`TrendFi deployed to: ${trendFi.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
