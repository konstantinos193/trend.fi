const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying TrendFi smart contracts with best practices...");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()));
    
    // 1. Deploy TrendFiConfig first
    const TrendFiConfig = await ethers.getContractFactory("TrendFiConfig");
    const configContract = await TrendFiConfig.deploy();
    await configContract.deployed();
    console.log("TrendFiConfig deployed to:", configContract.address);
    
    // 2. Deploy TrendFiProxyFactory for upgradeable contracts
    const TrendFiProxyFactory = await ethers.getContractFactory("TrendFiProxyFactory");
    const proxyFactory = await TrendFiProxyFactory.deploy(deployer.address);
    await proxyFactory.deployed();
    console.log("TrendFiProxyFactory deployed to:", proxyFactory.address);
    
    // 3. Deploy TrendFi implementation
    const TrendFi = await ethers.getContractFactory("TrendFi");
    const trendFiImpl = await TrendFi.deploy();
    await trendFiImpl.deployed();
    console.log("TrendFi implementation deployed to:", trendFiImpl.address);
    
    // 4. Deploy TrendFi proxy
    const trendFiProxy = await proxyFactory.createProxy(
        trendFiImpl.address,
        TrendFi.interface.encodeFunctionData("initialize", [configContract.address])
    );
    console.log("TrendFi proxy deployed to:", trendFiProxy);
    
    // 5. Deploy TrendOracle implementation
    const TrendOracle = await ethers.getContractFactory("TrendOracle");
    const trendOracleImpl = await TrendOracle.deploy();
    await trendOracleImpl.deployed();
    console.log("TrendOracle implementation deployed to:", trendOracleImpl.address);
    
    // 6. Deploy TrendOracle proxy
    const oracleAddress = deployer.address; // For testing, use deployer as oracle
    const trendOracleProxy = await proxyFactory.createProxy(
        trendOracleImpl.address,
        TrendOracle.interface.encodeFunctionData("initialize", [oracleAddress, configContract.address])
    );
    console.log("TrendOracle proxy deployed to:", trendOracleProxy);
    
    // 7. Deploy TrendMarket (non-upgradeable for simplicity)
    // In production, you might want this to be upgradeable too
    const mockERC20 = await ethers.getContractFactory("MockERC20");
    const collateralToken = await mockERC20.deploy("USDC", "USDC");
    await collateralToken.deployed();
    console.log("Mock USDC deployed to:", collateralToken.address);
    
    const TrendMarket = await ethers.getContractFactory("TrendMarket");
    const trendMarket = await TrendMarket.deploy(
        collateralToken.address,
        trendOracleProxy,
        configContract.address
    );
    await trendMarket.deployed();
    console.log("TrendMarket deployed to:", trendMarket.address);
    
    // 8. Setup initial configuration
    console.log("Setting up initial configuration...");
    
    // Authorize deployer as oracle
    await configContract.authorizeOracle("primary_oracle", true);
    console.log("Authorized primary oracle");
    
    // Authorize deployer as updater
    await configContract.authorizeUpdater(deployer.address, true);
    console.log("Authorized deployer as updater");
    
    // 9. Verify deployments
    console.log("\\nDeployment Summary:");
    console.log("==================");
    console.log("TrendFiConfig:", configContract.address);
    console.log("TrendFiProxyFactory:", proxyFactory.address);
    console.log("TrendFi Proxy:", trendFiProxy);
    console.log("TrendOracle Proxy:", trendOracleProxy);
    console.log("TrendMarket:", trendMarket.address);
    console.log("Mock USDC:", collateralToken.address);
    
    // 10. Save deployment addresses
    const deploymentInfo = {
        config: configContract.address,
        proxyFactory: proxyFactory.address,
        trendFiProxy: trendFiProxy,
        trendOracleProxy: trendOracleProxy,
        trendMarket: trendMarket.address,
        collateralToken: collateralToken.address,
        deployer: deployer.address,
        network: network.name,
        timestamp: new Date().toISOString()
    };
    
    const fs = require("fs");
    fs.writeFileSync(
        `deployments/${network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\\nDeployment saved to deployments/" + network.name + ".json");
    
    // 11. Verify contract interactions
    const trendFi = await ethers.getContractAt("TrendFi", trendFiProxy);
    const trendOracle = await ethers.getContractAt("TrendOracle", trendOracleProxy);
    
    console.log("\\nVerifying contract interactions...");
    console.log("TrendFi config address:", await trendFi.configContract());
    console.log("TrendOracle config address:", await trendOracle.configContract());
    console.log("TrendMarket oracle address:", await trendMarket.trendOracle());
    
    console.log("\\nDeployment completed successfully! 🎉");
}

// Mock ERC20 for testing
const MockERC20Source = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**6); // 1M tokens with 6 decimals
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
}
`;

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
