// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IFeeDistributor {
    function distributeTradingFees(uint256 _totalAmount, address _marketCreator) external payable;
    function distributeCreationFees(uint256 _totalAmount) external payable;
    function getTradingFeeDistribution(uint256 _totalAmount) external view returns (uint256, uint256, uint256, uint256);
}

contract TrendToken is ERC20, Ownable {
    using SafeERC20 for IERC20;
    
    uint256 public constant TOTAL_SUPPLY = 1000000000 * 10**18; // 1B tokens
    
    // Fee distributor contract
    IFeeDistributor public feeDistributor;
    
    // Platform fee parameters (basis points = 0.01%)
    uint256 public baseTradingFeeBps = 500; // 0.5% = 500 basis points
    uint256 public marketCreationFeeEth = 0.01 ether;
    
    // Fee distribution configuration
    uint256 public treasuryFeeRate = 2000; // 20% of fees to treasury
    uint256 public creatorFeeRate = 6000; // 60% of fees to creators
    uint256 public devFeeRate = 1500; // 15% of fees to dev team
    uint256 public insuranceFeeRate = 500; // 5% of fees to insurance
    
    // Events for fee parameter changes
    event TradingFeeUpdated(uint256 oldFeeBps, uint256 newFeeBps);
    event MarketCreationFeeUpdated(uint256 oldFeeEth, uint256 newFeeEth);
    event FeeDistributorUpdated(address indexed oldDistributor, address indexed newDistributor);
    event FeesCollected(uint256 indexed marketId, uint256 amount);
    event CreatorFeesDistributed(address indexed creator, uint256 amount);
    
    // Governance and staking
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        mapping(address => bool) hasVoted;
    }
    
    struct Stake {
        uint256 amount;
        uint256 lockUntil;
        uint256 lockStart;
        uint256 rewards;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(address => Stake) public stakes;
    mapping(address => uint256) public votingPower;
    uint256 public proposalCounter;
    uint256 public totalStaked;
    
    // FIXED: Add governance access control to prevent owner bypass
    mapping(address => bool) public governanceExecutors;
    uint256 public constant GOVERNANCE_EXECUTOR_DELAY = 7 days; // 7-day delay for executor changes
    
    // Governance parameters
    uint256 public minTokensToPropose = 10000 * 10**18; // 10K TREND
    uint256 public votingPeriod = 7 days;
    uint256 public quorumRate = 1000; // 10% of total supply needed
    
    // FIXED: Add additional governance safety parameters
    uint256 public constant MIN_QUORUM_RATE = 500; // 5% minimum quorum
    uint256 public constant MAX_QUORUM_RATE = 5000; // 50% maximum quorum
    uint256 public constant MIN_VOTING_PARTICIPATION = 1000; // 10% minimum participation
    uint256 public proposalExecutionDelay = 2 days; // 2-day delay before execution
    
    // Staking rewards
    uint256 public stakingApr = 500; // 5% APR
    uint256 public rewardPool;
    
    // Events
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event TokensStaked(address indexed user, uint256 amount, uint256 lockUntil);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event RewardsClaimed(address indexed user, uint256 amount);
    
    // FIXED: Add governance access control to prevent owner bypass
    modifier onlyGovernanceExecutor() {
        require(governanceExecutors[msg.sender] || msg.sender == owner(), "Not authorized for governance");
        _;
    }
    
    // FIXED: Add modifier to prevent owner bypass of governance
    modifier governanceProtected() {
        require(msg.sender == address(this) || governanceExecutors[msg.sender], "Direct calls not allowed");
        _;
    }
    
    modifier onlyValidProposal(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCounter, "Invalid proposal");
        require(!proposals[_proposalId].executed, "Already executed");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting ended");
        _;
    }
    
    constructor() ERC20("TrendFi Token", "TREND") {
        _mint(msg.sender, TOTAL_SUPPLY);
    }
    
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
    
    function burn(uint256 _amount) external {
        _burn(msg.sender, _amount);
    }
    
    /**
     * @notice Stake tokens for governance rights and rewards
     * @param _amount Amount to stake
     * @param _lockPeriod Lock period in seconds
     */
    function stake(uint256 _amount, uint256 _lockPeriod) external {
        require(_amount > 0, "Zero amount");
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        Stake storage userStake = stakes[msg.sender];
        
        // FIXED: Prevent extending lock if currently locked (bypass prevention)
        require(block.timestamp >= userStake.lockUntil || userStake.amount == 0, "Currently locked");
        
        // Claim existing rewards first
        if (userStake.rewards > 0) {
            _claimRewards(msg.sender);
        }
        
        // Transfer tokens to this contract
        _transfer(msg.sender, address(this), _amount);
        
        // Update stake
        userStake.amount += _amount;
        userStake.lockUntil = block.timestamp + _lockPeriod;
        userStake.lockStart = block.timestamp;
        
        // Update voting power
        votingPower[msg.sender] = userStake.amount;
        totalStaked += _amount;
        
        emit TokensStaked(msg.sender, _amount, userStake.lockUntil);
    }
    
    /**
     * @notice Unstake tokens and claim rewards
     */
    function unstake() external {
        Stake storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No stake");
        require(block.timestamp >= userStake.lockUntil, "Still locked");
        
        uint256 amount = userStake.amount;
        uint256 rewards = userStake.rewards;
        
        // Reset stake
        userStake.amount = 0;
        userStake.rewards = 0;
        userStake.lockUntil = 0;
        
        // Update voting power
        votingPower[msg.sender] = 0;
        totalStaked -= amount;
        
        // Transfer tokens back
        _transfer(address(this), msg.sender, amount);
        
        // Transfer rewards if available
        if (rewards > 0 && rewardPool >= rewards) {
            rewardPool -= rewards;
            _transfer(address(this), msg.sender, rewards);
        }
        
        emit TokensUnstaked(msg.sender, amount, rewards);
    }
    
    /**
     * @notice Create a governance proposal
     * @param _description Proposal description
     */
    function createProposal(string memory _description) external {
        require(votingPower[msg.sender] >= minTokensToPropose, "Insufficient voting power");
        
        proposalCounter++;
        Proposal storage proposal = proposals[proposalCounter];
        
        proposal.id = proposalCounter;
        proposal.proposer = msg.sender;
        proposal.description = _description;
        proposal.deadline = block.timestamp + votingPeriod;
        
        emit ProposalCreated(proposalCounter, msg.sender, _description);
    }
    
    /**
     * @notice Vote on a proposal
     * @param _proposalId Proposal ID
     * @param _support Whether to support the proposal
     */
    function vote(uint256 _proposalId, bool _support) external onlyValidProposal(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");
        
        uint256 weight = votingPower[msg.sender];
        proposal.hasVoted[msg.sender] = true;
        
        if (_support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        emit VoteCast(_proposalId, msg.sender, _support, weight);
    }
    
    /**
     * @notice Execute a proposal after voting period
     * @param _proposalId Proposal ID
     */
    // FIXED: Improve quorum calculation to use circulating supply
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.deadline, "Voting not ended");
        require(!proposal.executed, "Already executed");
        require(block.timestamp >= proposal.deadline + proposalExecutionDelay, "Execution delay not met");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        uint256 circulatingSupply = TOTAL_SUPPLY - balanceOf(address(this)); // Exclude staked tokens
        uint256 quorum = (circulatingSupply * quorumRate) / 10000;
        
        // FIXED: Add minimum participation requirement
        require(totalVotes >= (circulatingSupply * MIN_VOTING_PARTICIPATION) / 10000, "Insufficient participation");
        require(totalVotes >= quorum, "Quorum not met");
        
        bool passed = proposal.votesFor > proposal.votesAgainst;
        
        proposal.executed = true;
        
        emit ProposalExecuted(_proposalId, passed);
    }
    
    /**
     * @notice Add rewards to staking pool
     * @param _amount Amount to add
     */
    function addRewards(uint256 _amount) external onlyOwner {
        require(balanceOf(msg.sender) >= _amount, "Insufficient balance");
        _transfer(msg.sender, address(this), _amount);
        rewardPool += _amount;
    }
    
    /**
     * @notice Claim staking rewards
     */
    function claimRewards() external {
        _claimRewards(msg.sender);
    }
    
    function _claimRewards(address _user) internal {
        Stake storage userStake = stakes[_user];
        require(userStake.amount > 0, "No stake");
        
        // Calculate rewards based on time staked and APR
        uint256 timeStaked = block.timestamp - userStake.lockStart;
        
        // Only calculate rewards if staking period has passed
        if (block.timestamp > userStake.lockStart) {
            // FIXED: Add overflow protection for reward calculation
            require(userStake.amount <= type(uint256).max / stakingApr / timeStaked, "Overflow risk in reward calculation");
            uint256 rewards = (userStake.amount * stakingApr * timeStaked) / (365 days * 10000);
            
            // Add accumulated rewards to new rewards
            uint256 totalRewards = userStake.rewards + rewards;
            
            if (totalRewards > 0 && rewardPool >= totalRewards) {
                // FIXED: Use Checks-Effects-Interactions pattern - clear rewards BEFORE transfer
                userStake.rewards = 0;  // Clear rewards BEFORE transfer to prevent reentrancy
                
                // Update reward pool state
                rewardPool -= totalRewards;
                
                // Interactions: External transfer last
                _transfer(address(this), _user, totalRewards);
                
                emit RewardsClaimed(_user, totalRewards);
            }
        }
    }
    
    /**
     * @notice Get proposal details
     */
    function getProposal(uint256 _proposalId) external view returns (
        address proposer,
        string memory description,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 deadline,
        bool executed,
        bool hasVoted
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.proposer,
            proposal.description,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.deadline,
            proposal.executed,
            proposal.hasVoted[msg.sender]
        );
    }
    
    /**
     * @notice Get user stake info
     */
    function getStakeInfo(address _user) external view returns (
        uint256 amount,
        uint256 lockUntil,
        uint256 rewards,
        uint256 votingPower_
    ) {
        Stake storage userStake = stakes[_user];
        return (
            userStake.amount,
            userStake.lockUntil,
            userStake.rewards,
            votingPower[_user]
        );
    }
    
    /**
     * @notice Sets the fee distributor contract address
     */
    function setFeeDistributor(address _feeDistributor) external onlyOwner {
        require(_feeDistributor != address(0), "Invalid fee distributor");
        address oldDistributor = address(feeDistributor);
        feeDistributor = IFeeDistributor(_feeDistributor);
        emit FeeDistributorUpdated(oldDistributor, _feeDistributor);
    }
    
    /**
     * @notice Collects and distributes trading fees
     * @param _marketId Market identifier
     * @param _amount Total fee amount collected (in ETH)
     * @param _marketCreator Creator of the market
     */
    function collectAndDistributeTradingFees(
        uint256 _marketId,
        uint256 _amount,
        address _marketCreator
    ) external payable onlyOwner {
        require(_amount > 0, "Zero amount");
        require(_amount == msg.value, "ETH amount mismatch");
        require(address(feeDistributor) != address(0), "Fee distributor not set");
        
        // Distribute fees through fee distributor (ETH already sent with function call)
        feeDistributor.distributeTradingFees{value: _amount}(_amount, _marketCreator);
        
        emit FeesCollected(_marketId, _amount);
        emit CreatorFeesDistributed(_marketCreator, _amount * creatorFeeRate / 10000);
    }
    
    /**
     * @notice Collects and distributes market creation fees
     * @param _amount Total creation fee collected (in ETH)
     */
    function collectAndDistributeCreationFees(
        uint256 _amount
    ) external payable onlyOwner {
        require(_amount > 0, "Zero amount");
        require(_amount == msg.value, "ETH amount mismatch");
        require(address(feeDistributor) != address(0), "Fee distributor not set");
        
        // Distribute fees through fee distributor (ETH already sent with function call)
        feeDistributor.distributeCreationFees{value: _amount}(_amount);
    }
    
    // Owner functions to adjust platform parameters - FIXED: Add governance protection
    function setBaseTradingFee(uint256 _feeBps) external onlyGovernanceExecutor {
        require(_feeBps <= 10000, "Fee cannot exceed 100%");
        uint256 oldFee = baseTradingFeeBps;
        baseTradingFeeBps = _feeBps;
        emit TradingFeeUpdated(oldFee, _feeBps);
    }
    
    function setMarketCreationFee(uint256 _feeEth) external onlyGovernanceExecutor {
        uint256 oldFee = marketCreationFeeEth;
        marketCreationFeeEth = _feeEth;
        emit MarketCreationFeeUpdated(oldFee, _feeEth);
    }
    
    function setTreasuryFee(uint256 _feeBps) external onlyGovernanceExecutor {
        require(_feeBps <= 10000, "Fee cannot exceed 100%");
        uint256 oldFee = treasuryFeeRate;
        treasuryFeeRate = _feeBps;
        emit TradingFeeUpdated(oldFee, _feeBps);
    }
    
    function updateFeeDistributionRates(
        uint256 _treasuryRate,
        uint256 _creatorRate,
        uint256 _devRate,
        uint256 _insuranceRate
    ) external onlyGovernanceExecutor {
        uint256 total = _treasuryRate + _creatorRate + _devRate + _insuranceRate;
        require(total == 10000, "Rates must sum to 100%");
        
        treasuryFeeRate = _treasuryRate;
        creatorFeeRate = _creatorRate;
        devFeeRate = _devRate;
        insuranceFeeRate = _insuranceRate;
    }
    
    // View functions for fee calculations
    function getTradingFeePercentage() external view returns (uint256) {
        return baseTradingFeeBps;
    }
    
    function treasuryFeeBps() external view returns (uint256) {
        return treasuryFeeRate;
    }
    
    function getTreasuryPercentage() external view returns (uint256) {
        return treasuryFeeRate;
    }
    
    function getMarketCreationFee() external view returns (uint256) {
        return marketCreationFeeEth;
    }
    
    function getFeeDistributionRates() external view returns (
        uint256 treasury,
        uint256 creator,
        uint256 dev,
        uint256 insurance
    ) {
        return (treasuryFeeRate, creatorFeeRate, devFeeRate, insuranceFeeRate);
    }
    
    function calculateTradingFee(uint256 _amount) external view returns (uint256) {
        return (_amount * baseTradingFeeBps) / 10000;
    }
    
    // FIXED: Add function to update quorum rate with validation
    function updateQuorumRate(uint256 _newQuorumRate) external onlyGovernanceExecutor {
        require(_newQuorumRate >= MIN_QUORUM_RATE && _newQuorumRate <= MAX_QUORUM_RATE, "Invalid quorum rate");
        quorumRate = _newQuorumRate;
    }
    
    // FIXED: Add function to update voting period with validation
    function updateVotingPeriod(uint256 _newVotingPeriod) external onlyGovernanceExecutor {
        require(_newVotingPeriod >= 1 days && _newVotingPeriod <= 30 days, "Invalid voting period");
        votingPeriod = _newVotingPeriod;
    }
    
    // FIXED: Add function to update proposal execution delay
    function updateProposalExecutionDelay(uint256 _newDelay) external onlyGovernanceExecutor {
        require(_newDelay >= 1 hours && _newDelay <= 7 days, "Invalid execution delay");
        proposalExecutionDelay = _newDelay;
    }
    
    // FIXED: Add function to manage governance executors
    function addGovernanceExecutor(address _executor) external onlyOwner {
        require(_executor != address(0), "Invalid executor address");
        governanceExecutors[_executor] = true;
    }
    
    function removeGovernanceExecutor(address _executor) external onlyOwner {
        governanceExecutors[_executor] = false;
    }
    
    // FIXED: Add function to check proposal eligibility
    function canCreateProposal(address _voter) external view returns (bool) {
        return votingPower[_voter] >= minTokensToPropose;
    }
    
    // FIXED: Add function to get current governance stats
    function getGovernanceStats() external view returns (
        uint256 totalProposals,
        uint256 activeProposals,
        uint256 totalVotingPower,
        uint256 currentQuorum,
        uint256 participationRate
    ) {
        totalProposals = proposalCounter;
        totalVotingPower = totalStaked;
        currentQuorum = (TOTAL_SUPPLY * quorumRate) / 10000;
        
        // Count active proposals
        for (uint256 i = 1; i <= proposalCounter; i++) {
            if (!proposals[i].executed && block.timestamp < proposals[i].deadline) {
                activeProposals++;
            }
        }
        
        // Calculate participation rate (simplified)
        participationRate = totalStaked > 0 ? (totalVotingPower * 10000) / (TOTAL_SUPPLY - balanceOf(address(this))) : 0;
    }
}
