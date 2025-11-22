// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AidChain
 * @dev Main contract for the decentralized humanitarian funding protocol
 */
contract AidChain is ReentrancyGuard, Ownable {
    
    // AID Reputation Token
    AIDToken public aidToken;
    
    // Project structure
    struct Project {
        uint256 id;
        address creator;
        string name;
        string description;
        string ipfsHash; // IPFS hash for media and documents
        uint256 fundingGoal;
        uint256 fundsRaised;
        uint256 createdAt;
        bool active;
        bool zkKYCVerified;
        uint256 reputationScore;
    }
    
    // Milestone structure
    struct Milestone {
        uint256 id;
        uint256 projectId;
        string description;
        uint256 fundingAmount;
        string proofIPFSHash;
        bool completed;
        bool approved;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 votingDeadline;
    }
    
    // Donation structure
    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
        uint256 projectId;
    }
    
    // State variables
    uint256 public projectCount;
    uint256 public milestoneCount;
    mapping(uint256 => Project) public projects;
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => uint256[]) public projectMilestones;
    mapping(address => uint256) public donorReputation;
    mapping(uint256 => mapping(address => bool)) public milestoneVotes;
    mapping(uint256 => mapping(address => uint256)) public projectDonations;
    mapping(address => Donation[]) public donorHistory;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed creator, string name, uint256 fundingGoal);
    event ProjectFunded(uint256 indexed projectId, address indexed donor, uint256 amount);
    event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed projectId, string description);
    event MilestoneVoted(uint256 indexed milestoneId, address indexed voter, bool vote, uint256 weight);
    event MilestoneApproved(uint256 indexed milestoneId, uint256 indexed projectId);
    event FundsReleased(uint256 indexed projectId, uint256 indexed milestoneId, uint256 amount);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event ZKKYCVerified(uint256 indexed projectId, address indexed creator);
    
    constructor(address _aidTokenAddress) {
        aidToken = AIDToken(_aidTokenAddress);
    }
    
    /**
     * @dev Create a new humanitarian project
     */
    function createProject(
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        uint256 _fundingGoal
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(_fundingGoal > 0, "Funding goal must be positive");
        
        projectCount++;
        
        projects[projectCount] = Project({
            id: projectCount,
            creator: msg.sender,
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            fundingGoal: _fundingGoal,
            fundsRaised: 0,
            createdAt: block.timestamp,
            active: true,
            zkKYCVerified: false,
            reputationScore: 0
        });
        
        emit ProjectCreated(projectCount, msg.sender, _name, _fundingGoal);
        return projectCount;
    }
    
    /**
     * @dev Verify zkKYC for a project creator
     */
    function verifyZKKYC(uint256 _projectId) external {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(!project.zkKYCVerified, "Already verified");
        
        // In production, this would verify zkKYC proof from Self Protocol
        // For now, we'll use a simple verification mechanism
        project.zkKYCVerified = true;
        
        // Award reputation tokens for verification
        aidToken.mint(project.creator, 100 * 10**18);
        
        emit ZKKYCVerified(_projectId, project.creator);
    }
    
    /**
     * @dev Fund a project
     */
    function fundProject(uint256 _projectId) external payable nonReentrant {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        require(msg.value > 0, "Donation must be positive");
        
        Project storage project = projects[_projectId];
        require(project.active, "Project is not active");
        require(project.zkKYCVerified, "Project creator not verified");
        
        project.fundsRaised += msg.value;
        projectDonations[_projectId][msg.sender] += msg.value;
        
        // Record donation history
        donorHistory[msg.sender].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            projectId: _projectId
        }));
        
        // Update donor reputation
        donorReputation[msg.sender] += msg.value;
        
        // Award AID tokens to donor (1 AID per 0.001 ETH donated)
        uint256 aidReward = (msg.value * 1000) / 1 ether;
        if (aidReward > 0) {
            aidToken.mint(msg.sender, aidReward * 10**18);
        }
        
        emit ProjectFunded(_projectId, msg.sender, msg.value);
        emit ReputationUpdated(msg.sender, donorReputation[msg.sender]);
    }
    
    /**
     * @dev Create a milestone for a project
     */
    function createMilestone(
        uint256 _projectId,
        string memory _description,
        uint256 _fundingAmount,
        uint256 _votingDuration
    ) external returns (uint256) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        Project storage project = projects[_projectId];
        require(msg.sender == project.creator, "Only project creator can create milestones");
        require(project.active, "Project is not active");
        
        milestoneCount++;
        
        milestones[milestoneCount] = Milestone({
            id: milestoneCount,
            projectId: _projectId,
            description: _description,
            fundingAmount: _fundingAmount,
            proofIPFSHash: "",
            completed: false,
            approved: false,
            votesFor: 0,
            votesAgainst: 0,
            votingDeadline: block.timestamp + _votingDuration
        });
        
        projectMilestones[_projectId].push(milestoneCount);
        
        emit MilestoneCreated(milestoneCount, _projectId, _description);
        return milestoneCount;
    }
    
    /**
     * @dev Submit proof of milestone completion
     */
    function submitMilestoneProof(uint256 _milestoneId, string memory _proofIPFSHash) external {
        require(_milestoneId > 0 && _milestoneId <= milestoneCount, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        Project storage project = projects[milestone.projectId];
        require(msg.sender == project.creator, "Only project creator can submit proof");
        require(!milestone.completed, "Milestone already completed");
        
        milestone.proofIPFSHash = _proofIPFSHash;
        milestone.completed = true;
    }
    
    /**
     * @dev Vote on milestone completion (weighted by donation amount)
     */
    function voteOnMilestone(uint256 _milestoneId, bool _approve) external {
        require(_milestoneId > 0 && _milestoneId <= milestoneCount, "Invalid milestone ID");
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.completed, "Milestone not completed yet");
        require(!milestone.approved, "Milestone already approved");
        require(block.timestamp < milestone.votingDeadline, "Voting period ended");
        require(!milestoneVotes[_milestoneId][msg.sender], "Already voted");
        
        // Calculate voting weight based on donation amount
        uint256 weight = projectDonations[milestone.projectId][msg.sender];
        require(weight > 0, "Must be a donor to vote");
        
        milestoneVotes[_milestoneId][msg.sender] = true;
        
        if (_approve) {
            milestone.votesFor += weight;
        } else {
            milestone.votesAgainst += weight;
        }
        
        emit MilestoneVoted(_milestoneId, msg.sender, _approve, weight);
        
        // Auto-approve if enough votes
        if (milestone.votesFor > milestone.votesAgainst) {
            approveMilestone(_milestoneId);
        }
    }
    
    /**
     * @dev Approve milestone and release funds
     */
    function approveMilestone(uint256 _milestoneId) internal {
        Milestone storage milestone = milestones[_milestoneId];
        require(!milestone.approved, "Already approved");
        
        milestone.approved = true;
        
        // Release funds to project creator
        Project storage project = projects[milestone.projectId];
        uint256 releaseAmount = milestone.fundingAmount;
        
        if (releaseAmount > address(this).balance) {
            releaseAmount = address(this).balance;
        }
        
        if (releaseAmount > 0) {
            payable(project.creator).transfer(releaseAmount);
            
            // Update project reputation
            project.reputationScore += 10;
            
            // Award AID tokens to project creator
            aidToken.mint(project.creator, 50 * 10**18);
        }
        
        emit MilestoneApproved(_milestoneId, milestone.projectId);
        emit FundsReleased(milestone.projectId, _milestoneId, releaseAmount);
    }
    
    /**
     * @dev Get project details
     */
    function getProject(uint256 _projectId) external view returns (Project memory) {
        require(_projectId > 0 && _projectId <= projectCount, "Invalid project ID");
        return projects[_projectId];
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 _milestoneId) external view returns (Milestone memory) {
        require(_milestoneId > 0 && _milestoneId <= milestoneCount, "Invalid milestone ID");
        return milestones[_milestoneId];
    }
    
    /**
     * @dev Get milestones for a project
     */
    function getProjectMilestones(uint256 _projectId) external view returns (uint256[] memory) {
        return projectMilestones[_projectId];
    }
    
    /**
     * @dev Get donor history
     */
    function getDonorHistory(address _donor) external view returns (Donation[] memory) {
        return donorHistory[_donor];
    }
    
    /**
     * @dev Get top donors (simplified leaderboard)
     */
    function getDonorReputation(address _donor) external view returns (uint256) {
        return donorReputation[_donor];
    }
}

/**
 * @title AIDToken
 * @dev AID Reputation Token (ERC20)
 */
contract AIDToken is ERC20, Ownable {
    address public aidChainContract;
    
    constructor() ERC20("AID Reputation Token", "AID") {}
    
    function setAidChainContract(address _aidChainContract) external onlyOwner {
        aidChainContract = _aidChainContract;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == aidChainContract || msg.sender == owner(), "Not authorized");
        _mint(to, amount);
    }
}
