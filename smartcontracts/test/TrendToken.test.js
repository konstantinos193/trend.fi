const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("TrendToken", function () {
  let trendToken;
  let owner, addr1, addr2, addrs;
  const TOTAL_SUPPLY = ethers.parseUnits("1000000000", 18); // 1B tokens
  const MINT_AMOUNT = ethers.parseUnits("1000", 18);
  const BURN_AMOUNT = ethers.parseUnits("500", 18);

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const TrendToken = await ethers.getContractFactory("TrendToken");
    trendToken = await TrendToken.deploy();
    await trendToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await trendToken.owner()).to.equal(owner.address);
    });

    it("Should set correct token name", async function () {
      expect(await trendToken.name()).to.equal("TrendFi Token");
    });

    it("Should set correct token symbol", async function () {
      expect(await trendToken.symbol()).to.equal("TREND");
    });

    it("Should mint total supply to owner", async function () {
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY);
      expect(await trendToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should have correct decimals", async function () {
      expect(await trendToken.decimals()).to.equal(18);
    });
  });

  describe("ERC20 Basic Functionality", function () {
    it("Should transfer tokens between accounts", async function () {
      await trendToken.transfer(addr1.address, MINT_AMOUNT);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
      expect(await trendToken.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY - MINT_AMOUNT);
    });

    it("Should approve and transferFrom tokens", async function () {
      await trendToken.approve(addr1.address, MINT_AMOUNT);
      await trendToken.connect(addr1).transferFrom(owner.address, addr2.address, MINT_AMOUNT);
      
      expect(await trendToken.balanceOf(addr2.address)).to.equal(MINT_AMOUNT);
      expect(await trendToken.allowance(owner.address, addr1.address)).to.equal(0);
    });

    it("Should fail transfer with insufficient balance", async function () {
      await expect(trendToken.connect(addr1).transfer(addr2.address, MINT_AMOUNT))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should fail transferFrom with insufficient allowance", async function () {
      await expect(trendToken.connect(addr1).transferFrom(owner.address, addr2.address, MINT_AMOUNT))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should emit Transfer event on transfer", async function () {
      await expect(trendToken.transfer(addr1.address, MINT_AMOUNT))
        .to.emit(trendToken, "Transfer")
        .withArgs(owner.address, addr1.address, MINT_AMOUNT);
    });

    it("Should emit Approval event on approve", async function () {
      await expect(trendToken.approve(addr1.address, MINT_AMOUNT))
        .to.emit(trendToken, "Approval")
        .withArgs(owner.address, addr1.address, MINT_AMOUNT);
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      await trendToken.mint(addr1.address, MINT_AMOUNT);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY + MINT_AMOUNT);
    });

    it("Should emit Transfer event on mint", async function () {
      await expect(trendToken.mint(addr1.address, MINT_AMOUNT))
        .to.emit(trendToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, MINT_AMOUNT);
    });

    it("Should prevent non-owner from minting", async function () {
      await expect(trendToken.connect(addr1).mint(addr2.address, MINT_AMOUNT))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should handle minting to zero address with revert", async function () {
      await expect(trendToken.mint(ethers.ZeroAddress, MINT_AMOUNT))
        .to.be.revertedWith("ERC20: mint to the zero address");
    });

    it("Should handle multiple mints correctly", async function () {
      await trendToken.mint(addr1.address, MINT_AMOUNT);
      await trendToken.mint(addr2.address, MINT_AMOUNT * 2n);
      
      expect(await trendToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
      expect(await trendToken.balanceOf(addr2.address)).to.equal(MINT_AMOUNT * 2n);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY + MINT_AMOUNT * 3n);
    });

    it("Should handle minting zero tokens", async function () {
      await trendToken.mint(addr1.address, 0);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(0);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await trendToken.transfer(addr1.address, MINT_AMOUNT);
    });

    it("Should allow user to burn their own tokens", async function () {
      await trendToken.connect(addr1).burn(BURN_AMOUNT);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY - BURN_AMOUNT);
    });

    it("Should emit Transfer event on burn", async function () {
      await expect(trendToken.connect(addr1).burn(BURN_AMOUNT))
        .to.emit(trendToken, "Transfer")
        .withArgs(addr1.address, ethers.ZeroAddress, BURN_AMOUNT);
    });

    it("Should prevent burning more tokens than balance", async function () {
      await expect(trendToken.connect(addr1).burn(MINT_AMOUNT + 1n))
        .to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("Should allow burning all tokens", async function () {
      await trendToken.connect(addr1).burn(MINT_AMOUNT);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(0);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY - MINT_AMOUNT);
    });

    it("Should handle burning zero tokens", async function () {
      await trendToken.connect(addr1).burn(0);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should allow multiple users to burn tokens", async function () {
      await trendToken.transfer(addr2.address, MINT_AMOUNT);
      
      await trendToken.connect(addr1).burn(BURN_AMOUNT);
      await trendToken.connect(addr2).burn(BURN_AMOUNT / 2n);
      
      expect(await trendToken.balanceOf(addr1.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT);
      expect(await trendToken.balanceOf(addr2.address)).to.equal(MINT_AMOUNT - BURN_AMOUNT / 2n);
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY - (BURN_AMOUNT * 3n) / 2n);
    });
  });

  describe("Access Control", function () {
    it("Should allow owner to transfer ownership", async function () {
      await trendToken.transferOwnership(addr1.address);
      expect(await trendToken.owner()).to.equal(addr1.address);
    });

    it("Should prevent old owner from minting after ownership transfer", async function () {
      await trendToken.transferOwnership(addr1.address);
      await expect(trendToken.mint(addr2.address, MINT_AMOUNT))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow new owner to mint after ownership transfer", async function () {
      await trendToken.transferOwnership(addr1.address);
      await trendToken.connect(addr1).mint(addr2.address, MINT_AMOUNT);
      
      expect(await trendToken.balanceOf(addr2.address)).to.equal(MINT_AMOUNT);
    });

    it("Should prevent renouncing ownership if not owner", async function () {
      await expect(trendToken.connect(addr1).renounceOwnership())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to renounce ownership", async function () {
      await trendToken.renounceOwnership();
      expect(await trendToken.owner()).to.equal(ethers.ZeroAddress);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle maximum uint256 values", async function () {
      const maxUint256 = 2n ** 256n - 1n;
      
      // Should handle large approvals
      await trendToken.approve(addr1.address, maxUint256);
      expect(await trendToken.allowance(owner.address, addr1.address)).to.equal(maxUint256);
    });

    it("Should handle transfers to self", async function () {
      const initialBalance = await trendToken.balanceOf(owner.address);
      await trendToken.transfer(owner.address, MINT_AMOUNT);
      expect(await trendToken.balanceOf(owner.address)).to.equal(initialBalance);
    });

    it("Should handle zero address transfers", async function () {
      await expect(trendToken.transfer(ethers.ZeroAddress, MINT_AMOUNT))
        .to.be.revertedWith("ERC20: transfer to the zero address");
    });

    it("Should handle zero address approvals", async function () {
      await expect(trendToken.approve(ethers.ZeroAddress, MINT_AMOUNT))
        .to.be.revertedWith("ERC20: approve to the zero address");
    });

    it("Should handle increasing and decreasing allowances", async function () {
      await trendToken.approve(addr1.address, MINT_AMOUNT);
      
      // Increase allowance
      await trendToken.increaseAllowance(addr1.address, MINT_AMOUNT);
      expect(await trendToken.allowance(owner.address, addr1.address)).to.equal(MINT_AMOUNT * 2n);
      
      // Decrease allowance
      await trendToken.decreaseAllowance(addr1.address, MINT_AMOUNT);
      expect(await trendToken.allowance(owner.address, addr1.address)).to.equal(MINT_AMOUNT);
    });

    it("Should prevent decreasing allowance below zero", async function () {
      await trendToken.approve(addr1.address, MINT_AMOUNT);
      await expect(trendToken.decreaseAllowance(addr1.address, MINT_AMOUNT + 1n))
        .to.be.revertedWith("ERC20: decreased allowance below zero");
    });
  });

  describe("Gas Optimization", function () {
    it("Should report gas usage for transfer", async function () {
      const tx = await trendToken.transfer(addr1.address, MINT_AMOUNT);
      const receipt = await tx.wait();
      console.log("Gas used for transfer:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for mint", async function () {
      const tx = await trendToken.mint(addr1.address, MINT_AMOUNT);
      const receipt = await tx.wait();
      console.log("Gas used for mint:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for burn", async function () {
      await trendToken.transfer(addr1.address, MINT_AMOUNT);
      const tx = await trendToken.connect(addr1).burn(BURN_AMOUNT);
      const receipt = await tx.wait();
      console.log("Gas used for burn:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for approve", async function () {
      const tx = await trendToken.approve(addr1.address, MINT_AMOUNT);
      const receipt = await tx.wait();
      console.log("Gas used for approve:", receipt.gasUsed.toString());
    });

    it("Should report gas usage for transferFrom", async function () {
      await trendToken.approve(addr1.address, MINT_AMOUNT);
      const tx = await trendToken.connect(addr1).transferFrom(owner.address, addr2.address, MINT_AMOUNT);
      const receipt = await tx.wait();
      console.log("Gas used for transferFrom:", receipt.gasUsed.toString());
    });
  });

  describe("Batch Operations", function () {
    it("Should handle multiple transfers in sequence", async function () {
      const recipients = [addr1, addr2, addrs[0], addrs[1], addrs[2]];
      const transferAmount = MINT_AMOUNT / 5n;
      
      for (let i = 0; i < recipients.length; i++) {
        await trendToken.transfer(recipients[i].address, transferAmount);
      }
      
      for (let i = 0; i < recipients.length; i++) {
        expect(await trendToken.balanceOf(recipients[i].address)).to.equal(transferAmount);
      }
    });

    it("Should handle multiple mints in sequence", async function () {
      const recipients = [addr1, addr2, addrs[0], addrs[1], addrs[2]];
      
      for (let i = 0; i < recipients.length; i++) {
        await trendToken.mint(recipients[i].address, MINT_AMOUNT);
      }
      
      for (let i = 0; i < recipients.length; i++) {
        expect(await trendToken.balanceOf(recipients[i].address)).to.equal(MINT_AMOUNT);
      }
      
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY + MINT_AMOUNT * BigInt(recipients.length));
    });

    it("Should handle multiple burns from different users", async function () {
      const users = [addr1, addr2, addrs[0]];
      const burnAmount = MINT_AMOUNT / 4n;
      
      // Distribute tokens to users
      for (const user of users) {
        await trendToken.transfer(user.address, MINT_AMOUNT);
      }
      
      // Burn tokens from each user
      for (const user of users) {
        await trendToken.connect(user).burn(burnAmount);
      }
      
      for (const user of users) {
        expect(await trendToken.balanceOf(user.address)).to.equal(MINT_AMOUNT - burnAmount);
      }
      
      expect(await trendToken.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount * BigInt(users.length));
    });
  });

  describe("Constants", function () {
    it("Should have correct TOTAL_SUPPLY constant", async function () {
      expect(await trendToken.TOTAL_SUPPLY()).to.equal(TOTAL_SUPPLY);
    });

    it("Should match deployed total supply with constant", async function () {
      expect(await trendToken.totalSupply()).to.equal(await trendToken.TOTAL_SUPPLY());
    });
  });

  describe("Fee Parameters", function () {
    it("Should have correct initial fee values", async function () {
      expect(await trendToken.baseTradingFeeBps()).to.equal(500); // 0.5%
      expect(await trendToken.treasuryFeeRate()).to.equal(2000); // 20%
      expect(await trendToken.marketCreationFeeEth()).to.equal(ethers.parseEther("0.01"));
    });

    it("Should allow owner to adjust base trading fee", async function () {
      const newFee = 1000; // 1%
      await expect(trendToken.setBaseTradingFee(newFee))
        .to.emit(trendToken, "TradingFeeUpdated")
        .withArgs(500, newFee);
      
      expect(await trendToken.baseTradingFeeBps()).to.equal(newFee);
    });

    it("Should allow owner to adjust market creation fee", async function () {
      const newFee = ethers.parseEther("0.02");
      await expect(trendToken.setMarketCreationFee(newFee))
        .to.emit(trendToken, "MarketCreationFeeUpdated")
        .withArgs(ethers.parseEther("0.01"), newFee);
      
      expect(await trendToken.marketCreationFeeEth()).to.equal(newFee);
    });

    it("Should prevent non-owner from adjusting fees", async function () {
      await expect(trendToken.connect(addr1).setBaseTradingFee(1000))
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(trendToken.connect(addr1).setMarketCreationFee(ethers.parseEther("0.02")))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent setting trading fee above 100%", async function () {
      await expect(trendToken.setBaseTradingFee(10001))
        .to.be.revertedWith("Fee cannot exceed 100%");
    });

    it("Should allow setting fees to zero", async function () {
      await trendToken.setBaseTradingFee(0);
      expect(await trendToken.baseTradingFeeBps()).to.equal(0);
    });

    it("Should provide view functions for fee calculations", async function () {
      expect(await trendToken.getTradingFeePercentage()).to.equal(500);
      expect(await trendToken.getMarketCreationFee()).to.equal(ethers.parseEther("0.01"));
    });
    it("Should provide fee breakdown correctly", async function () {
      const amount = ethers.parseEther("100");
      const [totalFee, treasuryAmount, creatorAmount, devAmount, insuranceAmount] = 
        await trendToken.getFeeBreakdown(amount);
      
      expect(totalFee).to.equal(amount * 500n / 10000n);
      expect(treasuryAmount).to.equal(totalFee * 2000n / 10000n);
      expect(creatorAmount).to.equal(totalFee * 6000n / 10000n);
      expect(devAmount).to.equal(totalFee * 1500n / 10000n);
      expect(insuranceAmount).to.equal(totalFee * 500n / 10000n);
    });
  });

  describe("Staking", function () {
    const STAKE_AMOUNT = ethers.parseUnits("1000", 18);
    const LOCK_PERIOD = 30 * 24 * 60 * 60; // 30 days

    it("Should allow users to stake tokens", async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, LOCK_PERIOD);
      
      const stakeInfo = await trendToken.getStakeInfo(addr1.address);
      expect(stakeInfo.amount).to.equal(STAKE_AMOUNT);
      expect(stakeInfo.votingPower_).to.equal(STAKE_AMOUNT);
      expect(stakeInfo.lockUntil).to.be.gt(0);
    });

    it("Should emit TokensStaked event", async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT);
      await expect(trendToken.connect(addr1).stake(STAKE_AMOUNT, LOCK_PERIOD))
        .to.emit(trendToken, "TokensStaked")
        .withArgs(addr1.address, STAKE_AMOUNT, anyValue);
    });

    it("Should prevent staking zero amount", async function () {
      await expect(trendToken.connect(addr1).stake(0, LOCK_PERIOD))
        .to.be.revertedWith("Zero amount");
    });

    it("Should prevent staking with insufficient balance", async function () {
      await expect(trendToken.connect(addr1).stake(STAKE_AMOUNT, LOCK_PERIOD))
        .to.be.revertedWith("Insufficient balance");
    });

    it("Should allow users to unstake after lock period", async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, 1); // 1 second lock
      
      // Move time forward
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine");
      
      await expect(trendToken.connect(addr1).unstake())
        .to.emit(trendToken, "TokensUnstaked")
        .withArgs(addr1.address, STAKE_AMOUNT, anyValue);
      
      const stakeInfo = await trendToken.getStakeInfo(addr1.address);
      expect(stakeInfo.amount).to.equal(0);
      expect(stakeInfo.votingPower_).to.equal(0);
    });

    it("Should prevent unstaking before lock period", async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, LOCK_PERIOD);
      
      await expect(trendToken.connect(addr1).unstake())
        .to.be.revertedWith("Still locked");
    });

    it("Should prevent unstaking with no stake", async function () {
      await expect(trendToken.connect(addr1).unstake())
        .to.be.revertedWith("No stake");
    });

    it("Should allow adding to existing stake", async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT * 2n);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, LOCK_PERIOD);
      
      const stakeInfoBefore = await trendToken.getStakeInfo(addr1.address);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, LOCK_PERIOD);
      
      const stakeInfoAfter = await trendToken.getStakeInfo(addr1.address);
      expect(stakeInfoAfter.amount).to.equal(stakeInfoBefore.amount + STAKE_AMOUNT);
      expect(stakeInfoAfter.votingPower_).to.equal(stakeInfoAfter.amount);
    });
  });

  describe("Governance", function () {
    const MIN_TOKENS_TO_PROPOSE = ethers.parseUnits("10000", 18);
    const STAKE_AMOUNT = MIN_TOKENS_TO_PROPOSE;

    beforeEach(async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, 365 * 24 * 60 * 60); // 1 year lock
    });

    it("Should allow staked users to create proposals", async function () {
      const description = "Test proposal";
      await expect(trendToken.connect(addr1).createProposal(description))
        .to.emit(trendToken, "ProposalCreated")
        .withArgs(1, addr1.address, description);
    });

    it("Should prevent non-staked users from creating proposals", async function () {
      await expect(trendToken.connect(addr2).createProposal("Test proposal"))
        .to.be.revertedWith("Insufficient voting power");
    });

    it("Should prevent users with insufficient stake from creating proposals", async function () {
      await trendToken.transfer(addr2.address, MIN_TOKENS_TO_PROPOSE - 1n);
      await trendToken.connect(addr2).stake(MIN_TOKENS_TO_PROPOSE - 1n, 365 * 24 * 60 * 60);
      
      await expect(trendToken.connect(addr2).createProposal("Test proposal"))
        .to.be.revertedWith("Insufficient voting power");
    });

    it("Should allow voting on active proposals", async function () {
      await trendToken.connect(addr1).createProposal("Test proposal");
      
      await expect(trendToken.connect(addr1).vote(1, true))
        .to.emit(trendToken, "VoteCast")
        .withArgs(1, addr1.address, true, STAKE_AMOUNT);
    });

    it("Should prevent voting on non-existent proposals", async function () {
      await expect(trendToken.connect(addr1).vote(999, true))
        .to.be.revertedWith("Invalid proposal");
    });

    it("Should prevent double voting", async function () {
      await trendToken.connect(addr1).createProposal("Test proposal");
      await trendToken.connect(addr1).vote(1, true);
      
      await expect(trendToken.connect(addr1).vote(1, false))
        .to.be.revertedWith("Already voted");
    });

    it("Should prevent voting without voting power", async function () {
      await trendToken.connect(addr1).createProposal("Test proposal");
      await expect(trendToken.connect(addr2).vote(1, true))
        .to.be.revertedWith("No voting power");
    });

    it("Should allow executing proposals after voting period", async function () {
      await trendToken.connect(addr1).createProposal("Test proposal");
      await trendToken.connect(addr1).vote(1, true);
      
      // Move time forward past voting period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]); // 7 days + 1 second
      await ethers.provider.send("evm_mine");
      
      await expect(trendToken.executeProposal(1))
        .to.emit(trendToken, "ProposalExecuted")
        .withArgs(1, anyValue); // Use anyValue since the result depends on quorum
    });

    it("Should prevent executing proposals before voting period", async function () {
      await trendToken.connect(addr1).createProposal("Test proposal");
      
      await expect(trendToken.executeProposal(1))
        .to.be.revertedWith("Voting not ended");
    });

    it("Should prevent executing already executed proposals", async function () {
      await trendToken.connect(addr1).createProposal("Test proposal");
      await trendToken.connect(addr1).vote(1, true);
      
      // Move time forward past voting period
      await ethers.provider.send("evm_increaseTime", [7 * 24 * 60 * 60 + 1]);
      await ethers.provider.send("evm_mine");
      
      await trendToken.executeProposal(1);
      
      await expect(trendToken.executeProposal(1))
        .to.be.revertedWith("Already executed");
    });

    it("Should provide proposal details", async function () {
      const description = "Test proposal";
      await trendToken.connect(addr1).createProposal(description);
      
      const proposal = await trendToken.getProposal(1);
      expect(proposal.proposer).to.equal(addr1.address);
      expect(proposal.description).to.equal(description);
      expect(proposal.votesFor).to.equal(0);
      expect(proposal.votesAgainst).to.equal(0);
      expect(proposal.executed).to.be.false;
      expect(proposal.hasVoted).to.be.false;
    });
  });

  describe("Fee Distribution", function () {
    let mockFeeDistributor;
    const MARKET_ID = 1;
    const FEE_AMOUNT = ethers.parseEther("1");

    beforeEach(async function () {
      const MockFeeDistributor = await ethers.getContractFactory("MockFeeDistributor");
      mockFeeDistributor = await MockFeeDistributor.deploy();
      await mockFeeDistributor.waitForDeployment();
      
      await trendToken.setFeeDistributor(await mockFeeDistributor.getAddress());
    });

    it("Should allow owner to set fee distributor", async function () {
      await expect(trendToken.setFeeDistributor(await mockFeeDistributor.getAddress()))
        .to.emit(trendToken, "FeeDistributorUpdated")
        .withArgs(anyValue, await mockFeeDistributor.getAddress());
    });

    it("Should prevent setting zero address as fee distributor", async function () {
      await expect(trendToken.setFeeDistributor(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid fee distributor");
    });

    it("Should allow collecting and distributing trading fees", async function () {
      await expect(trendToken.collectAndDistributeTradingFees(MARKET_ID, FEE_AMOUNT, addr2.address, { value: FEE_AMOUNT }))
        .to.emit(trendToken, "FeesCollected")
        .withArgs(MARKET_ID, FEE_AMOUNT);
    });

    it("Should prevent fee collection without fee distributor set", async function () {
      const TrendToken = await ethers.getContractFactory("TrendToken");
      const tokenWithoutDistributor = await TrendToken.deploy();
      await tokenWithoutDistributor.waitForDeployment();
      
      await expect(tokenWithoutDistributor.collectAndDistributeTradingFees(MARKET_ID, FEE_AMOUNT, addr2.address, { value: FEE_AMOUNT }))
        .to.be.revertedWith("Fee distributor not set");
    });

    it("Should prevent collecting zero amount fees", async function () {
      await expect(trendToken.collectAndDistributeTradingFees(MARKET_ID, 0, addr2.address))
        .to.be.revertedWith("Zero amount");
    });
  });

  describe("Rewards System", function () {
    const REWARD_AMOUNT = ethers.parseEther("100");
    const STAKE_AMOUNT = ethers.parseUnits("1000", 18);

    beforeEach(async function () {
      await trendToken.transfer(addr1.address, STAKE_AMOUNT);
      await trendToken.connect(addr1).stake(STAKE_AMOUNT, 365 * 24 * 60 * 60);
    });

    it("Should allow owner to add rewards to pool", async function () {
      await trendToken.addRewards(REWARD_AMOUNT);
      // Check reward pool increased (would need to add getter for rewardPool)
    });

    it("Should prevent adding rewards with insufficient balance", async function () {
      await expect(trendToken.connect(addr1).addRewards(REWARD_AMOUNT))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow users to claim rewards", async function () {
      await trendToken.addRewards(REWARD_AMOUNT);
      
      // Move time forward to accumulate rewards
      await ethers.provider.send("evm_increaseTime", [30 * 24 * 60 * 60]); // 30 days
      await ethers.provider.send("evm_mine");
      
      await expect(trendToken.connect(addr1).claimRewards())
        .to.emit(trendToken, "RewardsClaimed")
        .withArgs(addr1.address, anyValue);
    });

    it("Should prevent claiming rewards without stake", async function () {
      await expect(trendToken.connect(addr2).claimRewards())
        .to.be.revertedWith("No stake");
    });
  });

  describe("View Functions", function () {
    it("Should return correct fee distribution rates", async function () {
      const [treasury, creator, dev, insurance] = await trendToken.getFeeDistributionRates();
      expect(treasury).to.equal(2000);
      expect(creator).to.equal(6000);
      expect(dev).to.equal(1500);
      expect(insurance).to.equal(500);
    });

    it("Should calculate trading fee correctly", async function () {
      const amount = ethers.parseEther("100");
      const expectedFee = amount * 500n / 10000n; // 0.5%
      expect(await trendToken.calculateTradingFee(amount)).to.equal(expectedFee);
    });

    it("Should provide complete fee breakdown", async function () {
      const amount = ethers.parseEther("100");
      const breakdown = await trendToken.getFeeBreakdown(amount);
      
      expect(breakdown.totalFee).to.be.gt(0);
      expect(breakdown.treasuryAmount).to.be.gt(0);
      expect(breakdown.creatorAmount).to.be.gt(0);
      expect(breakdown.devAmount).to.be.gt(0);
      expect(breakdown.insuranceAmount).to.be.gt(0);
      
      // Verify the breakdown sums correctly
      const sum = breakdown.treasuryAmount + breakdown.creatorAmount + breakdown.devAmount + breakdown.insuranceAmount;
      expect(sum).to.equal(breakdown.totalFee);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle large numbers correctly", async function () {
      const largeAmount = ethers.parseUnits("1000000000", 18); // 1B tokens
      await trendToken.mint(addr1.address, largeAmount);
      expect(await trendToken.balanceOf(addr1.address)).to.equal(largeAmount);
    });

    it("Should handle multiple fee distribution updates", async function () {
      await trendToken.updateFeeDistributionRates(3000, 4000, 2000, 1000);
      
      const [treasury, creator, dev, insurance] = await trendToken.getFeeDistributionRates();
      expect(treasury).to.equal(3000);
      expect(creator).to.equal(4000);
      expect(dev).to.equal(2000);
      expect(insurance).to.equal(1000);
    });

    it("Should prevent invalid fee distribution rates", async function () {
      await expect(trendToken.updateFeeDistributionRates(3000, 4000, 2000, 1001))
        .to.be.revertedWith("Rates must sum to 100%");
    });

    it("Should handle proposal creation with empty description", async function () {
      await trendToken.transfer(addr1.address, ethers.parseUnits("10000", 18));
      await trendToken.connect(addr1).stake(ethers.parseUnits("10000", 18), 365 * 24 * 60 * 60);
      
      await trendToken.connect(addr1).createProposal("");
      
      const proposal = await trendToken.getProposal(1);
      expect(proposal.description).to.equal("");
    });
  });
});

// Mock contract for testing fee distribution
class MockFeeDistributor {
  async deploy() {
    // This would be a proper mock contract in a real test setup
    return { address: ethers.ZeroAddress };
  }
}
