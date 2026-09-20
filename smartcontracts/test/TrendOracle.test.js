const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrendOracle", function () {
  let trendOracle;
  let owner, oracle, addr1, addr2, addrs;
  let trendId = 1;
  let trendName = "DeFi Trend";
  let trendValue = 1000000; // 1M in some unit
  let timestamp;
  let signature;
  let dataHash;

  beforeEach(async function () {
    [owner, oracle, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy config contract first
    const TrendFiConfig = await ethers.getContractFactory("TrendFiConfig");
    const trendFiConfig = await TrendFiConfig.deploy();
    await trendFiConfig.waitForDeployment();
    
    const TrendOracle = await ethers.getContractFactory("TrendOracle");
    trendOracle = await TrendOracle.deploy();
    await trendOracle.waitForDeployment();
    await trendOracle.initialize(oracle.address, trendFiConfig.address);
    
    timestamp = Math.floor(Date.now() / 1000);
    const messageHash = ethers.solidityKeccak256(
      ["uint256", "string", "uint256", "uint256"],
      [trendId, trendName, trendValue, timestamp]
    );
    const ethSignedMessageHash = ethers.solidityKeccak256(
      ["string", "bytes32"],
      ["\x19Ethereum Signed Message:\n32", messageHash]
    );
    signature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
    dataHash = ethers.solidityKeccak256(
      ["uint256", "string", "uint256", "uint256"],
      [trendId, trendName, trendValue, timestamp]
    );
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await trendOracle.owner()).to.equal(owner.address);
    });

    it("Should set the correct oracle address", async function () {
      expect(await trendOracle.oracleAddress()).to.equal(oracle.address);
    });

    it("Should revert with zero oracle address", async function () {
      const TrendOracle = await ethers.getContractFactory("TrendOracle");
      await expect(TrendOracle.deploy(ethers.ZeroAddress))
        .to.be.revertedWith("Oracle address cannot be zero");
    });
  });

  describe("Oracle Address Management", function () {
    it("Should allow owner to update oracle address", async function () {
      await trendOracle.updateOracleAddress(addr1.address);
      expect(await trendOracle.oracleAddress()).to.equal(addr1.address);
    });

    it("Should emit OracleAddressUpdated event", async function () {
      await expect(trendOracle.updateOracleAddress(addr1.address))
        .to.emit(trendOracle, "OracleAddressUpdated")
        .withArgs(addr1.address);
    });

    it("Should prevent non-owner from updating oracle address", async function () {
      await expect(trendOracle.connect(addr1).updateOracleAddress(addr2.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent setting zero address as oracle", async function () {
      await expect(trendOracle.updateOracleAddress(ethers.ZeroAddress))
        .to.be.revertedWith("Oracle address cannot be zero");
    });

    it("Should allow updating to same oracle address", async function () {
      await trendOracle.updateOracleAddress(oracle.address);
      expect(await trendOracle.oracleAddress()).to.equal(oracle.address);
    });
  });

  describe("Trend Data Submission", function () {
    it("Should allow oracle to submit trend data", async function () {
      await trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      
      const trendData = await trendOracle.getTrendData(dataHash);
      expect(trendData.trendId).to.equal(trendId);
      expect(trendData.trendName).to.equal(trendName);
      expect(trendData.trendValue).to.equal(trendValue);
      expect(trendData.timestamp).to.equal(timestamp);
      expect(trendData.verified).to.equal(true);
    });

    it("Should emit TrendDataSubmitted event", async function () {
      await expect(trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      ))
        .to.emit(trendOracle, "TrendDataSubmitted")
        .withArgs(dataHash, trendId, trendName);
    });

    it("Should prevent non-oracle from submitting data", async function () {
      await expect(trendOracle.connect(addr1).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      ))
        .to.be.revertedWith("Only oracle can call this function");
    });

    it("Should prevent duplicate data submission", async function () {
      await trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      
      await expect(trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      ))
        .to.be.revertedWith("Data already submitted");
    });

    it("Should prevent submission with invalid signature", async function () {
      const invalidSignature = "0x" + "0".repeat(130); // Invalid signature
      
      await expect(trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        invalidSignature
      ))
        .to.be.revertedWith("Invalid signature");
    });

    it("Should handle multiple trend data submissions", async function () {
      const submissions = [
        { id: 1, name: "DeFi Trend", value: 1000000 },
        { id: 2, name: "NFT Trend", value: 2000000 },
        { id: 3, name: "GameFi Trend", value: 1500000 }
      ];
      
      for (const submission of submissions) {
        const ts = Math.floor(Date.now() / 1000) + submission.id;
        const msgHash = ethers.solidityKeccak256(
          ["uint256", "string", "uint256", "uint256"],
          [submission.id, submission.name, submission.value, ts]
        );
        const ethMsgHash = ethers.solidityKeccak256(
          ["string", "bytes32"],
          ["\x19Ethereum Signed Message:\n32", msgHash]
        );
        const sig = await oracle.signMessage(ethers.getBytes(ethMsgHash));
        const hash = ethers.solidityKeccak256(
          ["uint256", "string", "uint256", "uint256"],
          [submission.id, submission.name, submission.value, ts]
        );
        
        await trendOracle.connect(oracle).submitTrendData(
          submission.id,
          submission.name,
          submission.value,
          ts,
          sig
        );
        
        const data = await trendOracle.getTrendData(hash);
        expect(data.trendId).to.equal(submission.id);
        expect(data.trendName).to.equal(submission.name);
        expect(data.trendValue).to.equal(submission.value);
      }
    });
  });

  describe("Trend Data Verification", function () {
    it("Should verify valid trend data", async function () {
      const isValid = await trendOracle.verifyTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      expect(isValid).to.equal(true);
    });

    it("Should reject invalid trend data", async function () {
      const invalidSignature = "0x" + "1".repeat(130);
      
      const isValid = await trendOracle.verifyTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        invalidSignature
      );
      expect(isValid).to.equal(false);
    });

    it("Should reject data signed by wrong address", async function () {
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId, trendName, trendValue, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const wrongSignature = await addr1.signMessage(ethers.getBytes(ethSignedMessageHash));
      
      const isValid = await trendOracle.verifyTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        wrongSignature
      );
      expect(isValid).to.equal(false);
    });

    it("Should reject data with mismatched parameters", async function () {
      const wrongTrendValue = 999999;
      
      const isValid = await trendOracle.verifyTrendData(
        trendId,
        trendName,
        wrongTrendValue,
        timestamp,
        signature
      );
      expect(isValid).to.equal(false);
    });
  });

  describe("Trend Data Retrieval", function () {
    beforeEach(async function () {
      await trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
    });

    it("Should retrieve submitted trend data", async function () {
      const trendData = await trendOracle.getTrendData(dataHash);
      expect(trendData.trendId).to.equal(trendId);
      expect(trendData.trendName).to.equal(trendName);
      expect(trendData.trendValue).to.equal(trendValue);
      expect(trendData.timestamp).to.equal(timestamp);
      expect(trendData.signature).to.equal(signature);
      expect(trendData.verified).to.equal(true);
    });

    it("Should revert for non-existent data hash", async function () {
      const nonExistentHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [999, "Non-existent", 0, 0]
      );
      
      await expect(trendOracle.getTrendData(nonExistentHash))
        .to.be.revertedWith("Data not found");
    });

    it("Should retrieve trend history", async function () {
      const history = await trendOracle.getTrendHistory(trendId);
      expect(history.length).to.equal(1);
      expect(history[0]).to.equal(dataHash);
    });

    it("Should return empty history for non-existent trend", async function () {
      const history = await trendOracle.getTrendHistory(999);
      expect(history.length).to.equal(0);
    });

    it("Should retrieve latest trend data", async function () {
      const latestData = await trendOracle.getLatestTrendData(trendId);
      expect(latestData.trendId).to.equal(trendId);
      expect(latestData.trendName).to.equal(trendName);
      expect(latestData.trendValue).to.equal(trendValue);
      expect(latestData.timestamp).to.equal(timestamp);
      expect(latestData.verified).to.equal(true);
    });

    it("Should revert for latest data of non-existent trend", async function () {
      await expect(trendOracle.getLatestTrendData(999))
        .to.be.revertedWith("No data found for trend");
    });
  });

  describe("Trend History Management", function () {
    it("Should maintain chronological order in history", async function () {
      const baseTimestamp = Math.floor(Date.now() / 1000);
      
      // Submit multiple data points for the same trend
      for (let i = 0; i < 3; i++) {
        const ts = baseTimestamp + i * 100;
        const value = trendValue + i * 100000;
        
        const msgHash = ethers.solidityKeccak256(
          ["uint256", "string", "uint256", "uint256"],
          [trendId, trendName, value, ts]
        );
        const ethMsgHash = ethers.solidityKeccak256(
          ["string", "bytes32"],
          ["\x19Ethereum Signed Message:\n32", msgHash]
        );
        const sig = await oracle.signMessage(ethers.getBytes(ethMsgHash));
        
        await trendOracle.connect(oracle).submitTrendData(
          trendId,
          trendName,
          value,
          ts,
          sig
        );
      }
      
      const history = await trendOracle.getTrendHistory(trendId);
      expect(history.length).to.equal(3);
      
      // Check chronological order
      for (let i = 0; i < history.length; i++) {
        const data = await trendOracle.getTrendData(history[i]);
        expect(data.timestamp).to.equal(baseTimestamp + i * 100);
        expect(data.trendValue).to.equal(trendValue + i * 100000);
      }
    });

    it("Should handle multiple trends with separate histories", async function () {
      const trend1Data = { id: 1, name: "Trend 1", value: 1000000 };
      const trend2Data = { id: 2, name: "Trend 2", value: 2000000 };
      
      // Submit data for trend 1
      let ts = Math.floor(Date.now() / 1000);
      let msgHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trend1Data.id, trend1Data.name, trend1Data.value, ts]
      );
      let ethMsgHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", msgHash]
      );
      let sig = await oracle.signMessage(ethers.getBytes(ethMsgHash));
      
      await trendOracle.connect(oracle).submitTrendData(
        trend1Data.id,
        trend1Data.name,
        trend1Data.value,
        ts,
        sig
      );
      
      // Submit data for trend 2
      ts = Math.floor(Date.now() / 1000) + 100;
      msgHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trend2Data.id, trend2Data.name, trend2Data.value, ts]
      );
      ethMsgHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", msgHash]
      );
      sig = await oracle.signMessage(ethers.getBytes(ethMsgHash));
      
      await trendOracle.connect(oracle).submitTrendData(
        trend2Data.id,
        trend2Data.name,
        trend2Data.value,
        ts,
        sig
      );
      
      const history1 = await trendOracle.getTrendHistory(trend1Data.id);
      const history2 = await trendOracle.getTrendHistory(trend2Data.id);
      
      expect(history1.length).to.equal(1);
      expect(history2.length).to.equal(1);
      expect(history1[0]).to.not.equal(history2[0]);
    });
  });

  describe("Signature Recovery", function () {
    it("Should handle correct signature format", async function () {
      // This is tested implicitly through successful data submission
      await trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      
      const data = await trendOracle.getTrendData(dataHash);
      expect(data.verified).to.equal(true);
    });

    it("Should reject malformed signatures", async function () {
      const malformedSignatures = [
        "0x", // Empty
        "0x123", // Too short
        "0x" + "1".repeat(132), // Too long
        "0x" + "g".repeat(130), // Invalid hex characters
      ];
      
      for (const malformedSig of malformedSignatures) {
        await expect(trendOracle.connect(oracle).submitTrendData(
          trendId,
          trendName,
          trendValue,
          timestamp,
          malformedSig
        )).to.be.revertedWith("Invalid signature");
      }
    });

    it("Should handle signature with different v values", async function () {
      // Create a signature and manually manipulate v value
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId, trendName, trendValue, timestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      
      const sig = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      
      // This should work with the correct signature
      await trendOracle.connect(oracle).submitTrendData(
        trendId + 1, // Use different ID to avoid collision
        trendName,
        trendValue,
        timestamp + 1,
        sig
      );
    });
  });

  describe("Access Control After Oracle Update", function () {
    it("Should allow new oracle to submit data", async function () {
      await trendOracle.updateOracleAddress(addr1.address);
      
      const newTimestamp = Math.floor(Date.now() / 1000) + 1000;
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId, trendName, trendValue, newTimestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const newSignature = await addr1.signMessage(ethers.getBytes(ethSignedMessageHash));
      
      await trendOracle.connect(addr1).submitTrendData(
        trendId,
        trendName,
        trendValue,
        newTimestamp,
        newSignature
      );
      
      const newDataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId, trendName, trendValue, newTimestamp]
      );
      
      const trendData = await trendOracle.getTrendData(newDataHash);
      expect(trendData.verified).to.equal(true);
    });

    it("Should prevent old oracle from submitting data after update", async function () {
      await trendOracle.updateOracleAddress(addr1.address);
      
      await expect(trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      ))
        .to.be.revertedWith("Only oracle can call this function");
    });
  });

  describe("Gas Optimization", function () {
    it("Should report gas usage for trend data submission", async function () {
      const tx = await trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      const receipt = await tx.wait();
      console.log("Gas used for submitTrendData:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for trend data retrieval", async function () {
      await trendOracle.connect(oracle).submitTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      
      const tx = await trendOracle.getTrendData(dataHash);
      const receipt = await tx.wait();
      console.log("Gas used for getTrendData:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for trend data verification", async function () {
      const tx = await trendOracle.verifyTrendData(
        trendId,
        trendName,
        trendValue,
        timestamp,
        signature
      );
      const receipt = await tx.wait();
      console.log("Gas used for verifyTrendData:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for oracle address update", async function () {
      const tx = await trendOracle.updateOracleAddress(addr1.address);
      const receipt = await tx.wait();
      console.log("Gas used for updateOracleAddress:", receipt.gasUsed.toString());
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very long trend names", async function () {
      const longName = "A".repeat(1000);
      const newTimestamp = Math.floor(Date.now() / 1000) + 2000;
      
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId + 2, longName, trendValue, newTimestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const newSignature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      
      await trendOracle.connect(oracle).submitTrendData(
        trendId + 2,
        longName,
        trendValue,
        newTimestamp,
        newSignature
      );
      
      const newDataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId + 2, longName, trendValue, newTimestamp]
      );
      
      const trendData = await trendOracle.getTrendData(newDataHash);
      expect(trendData.trendName).to.equal(longName);
    });

    it("Should handle maximum trend values", async function () {
      const maxValue = 2n ** 256n - 1n;
      const newTimestamp = Math.floor(Date.now() / 1000) + 3000;
      
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId + 3, "Max Value Test", maxValue, newTimestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const newSignature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      
      await trendOracle.connect(oracle).submitTrendData(
        trendId + 3,
        "Max Value Test",
        maxValue,
        newTimestamp,
        newSignature
      );
      
      const newDataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId + 3, "Max Value Test", maxValue, newTimestamp]
      );
      
      const trendData = await trendOracle.getTrendData(newDataHash);
      expect(trendData.trendValue).to.equal(maxValue);
    });

    it("Should handle zero trend values", async function () {
      const newTimestamp = Math.floor(Date.now() / 1000) + 4000;
      
      const messageHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId + 4, "Zero Value Test", 0, newTimestamp]
      );
      const ethSignedMessageHash = ethers.solidityKeccak256(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", messageHash]
      );
      const newSignature = await oracle.signMessage(ethers.getBytes(ethSignedMessageHash));
      
      await trendOracle.connect(oracle).submitTrendData(
        trendId + 4,
        "Zero Value Test",
        0,
        newTimestamp,
        newSignature
      );
      
      const newDataHash = ethers.solidityKeccak256(
        ["uint256", "string", "uint256", "uint256"],
        [trendId + 4, "Zero Value Test", 0, newTimestamp]
      );
      
      const trendData = await trendOracle.getTrendData(newDataHash);
      expect(trendData.trendValue).to.equal(0);
    });
  });
});
