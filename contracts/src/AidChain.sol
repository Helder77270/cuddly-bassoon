// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
// Note: OpenZeppelin v5 ReentrancyGuard is safe for upgradeable contracts
// It uses a dedicated storage slot and doesn't need initialization
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {AidToken} from "./AidToken.sol";

/**
 * @title AidChain
 * @dev Main contract for the decentralized humanitarian funding protocol - Upgradeable
 */
contract AidChain is Initializable, ReentrancyGuard, OwnableUpgradeable, UUPSUpgradeable {
    
    // AID Reputation Token
    AidToken public aidToken;
    
    // Constants for reward calculations
    uint256 public constant VERIFICATION_REWARD = 100; // AID tokens for zkKYC verification
    uint256 public constant MILESTONE_COMPLETION_REWARD = 50; // AID tokens for milestone completion
    uint256 public constant DONATION_REWARD_MULTIPLIER = 1000; // 1 AID per 0.001 ETH donated
    uint256 public constant MILESTONE_REPUTATION_BOOST = 10; // Reputation points per milestone
    
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
        bool zkKycVerified;
        uint256 reputationScore;
    }
    
    // Milestone structure
    struct Milestone {
        uint256 id;
        uint256 projectId;
        string description;
        uint256 fundingAmount;
        string proofIpfsHash;
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
    // This contract represents a single project. `project` holds that project's data.
    Project public project;
    uint256 public milestoneCount;
    mapping(uint256 => Milestone) public milestones;
    uint256[] public projectMilestones;
    mapping(address => uint256) public donorReputation;
    mapping(uint256 => mapping(address => bool)) public milestoneVotes;
    mapping(address => uint256) public projectDonations;
    mapping(address => Donation[]) public donorHistory;
    
    // Events
    event ProjectCreated(uint256 indexed projectId, address indexed creator, string name, uint256 fundingGoal);
    event ProjectFunded(uint256 indexed projectId, address indexed donor, uint256 amount);
    event MilestoneCreated(uint256 indexed milestoneId, uint256 indexed projectId, string description);
    event MilestoneVoted(uint256 indexed milestoneId, address indexed voter, bool vote, uint256 weight);
    event MilestoneApproved(uint256 indexed milestoneId, uint256 indexed projectId);
    event FundsReleased(uint256 indexed projectId, uint256 indexed milestoneId, uint256 amount);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event zkKycVerified(uint256 indexed projectId, address indexed creator);
    event MilestoneProofSubmitted(uint256 indexed milestoneId, string proofIpfsHash, uint256 timestamp);
    event MilestoneFinalized(uint256 indexed milestoneId, uint256 timestamp);

    // Typed errors
    error InvalidMilestoneId(uint256 milestoneId);
    error NotProjectCreator(address sender);
    error MilestoneAlreadyCompleted(uint256 milestoneId);
    error MilestoneNotCompleted(uint256 milestoneId);
    error MilestoneAlreadyApproved(uint256 milestoneId);
    error VotingPeriodEnded(uint256 milestoneId);
    error AlreadyVoted(uint256 milestoneId, address voter);
    error NotADonor(address voter);
    error DonationMustBePositive();
    error ProjectNotActive();
    error ProjectNotVerified();
    error ProjectAlreadyVerified(uint256 projectId);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the AidChain contract for a single project.
     * The `_creator` is the project owner and will be set as the contract owner.
     */
    function initialize(
        address _aidTokenAddress,
        address _creator,
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        uint256 _fundingGoal
    ) public initializer {
        __Ownable_init(_creator);
        aidToken = AidToken(_aidTokenAddress);

        project = Project({
            id: 1,
            creator: _creator,
            name: _name,
            description: _description,
            ipfsHash: _ipfsHash,
            fundingGoal: _fundingGoal,
            fundsRaised: 0,
            createdAt: block.timestamp,
            active: true,
            zkKycVerified: false,
            reputationScore: 0
        });

        emit ProjectCreated(1, _creator, _name, _fundingGoal);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    /**
     * @dev Create a new humanitarian project
     */
    // Project creation is done at `initialize` time. Each AidChain equals one project.
    
    /**
     * @dev Verify zkKYC for a project creator
     */
    function verifyZkKyc() external {
        if (project.zkKycVerified) revert ProjectAlreadyVerified(project.id);

        // In production, this would verify zkKYC proof from Self Protocol
        // For now, we'll use a simple verification mechanism
        project.zkKycVerified = true;

        // Award reputation tokens for verification
        aidToken.mint(project.creator, VERIFICATION_REWARD * 10**18);

        emit zkKycVerified(project.id, project.creator);
    }
    
    /**
     * @dev Fund a project
     */
    function fundProject() external payable nonReentrant {
        if (msg.value == 0) revert DonationMustBePositive();
        if (!project.active) revert ProjectNotActive();
        if (!project.zkKycVerified) revert ProjectNotVerified();

        project.fundsRaised += msg.value;
        projectDonations[msg.sender] += msg.value;

        // Record donation history
        donorHistory[msg.sender].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            projectId: project.id
        }));

        // Update donor reputation
        donorReputation[msg.sender] += msg.value;

        // Award AID tokens to donor (1 AID per 0.001 ETH donated)
        uint256 aidReward = (msg.value * DONATION_REWARD_MULTIPLIER) / 1 ether;
        if (aidReward > 0) {
            aidToken.mint(msg.sender, aidReward * 10**18);
        }

        emit ProjectFunded(project.id, msg.sender, msg.value);
        emit ReputationUpdated(msg.sender, donorReputation[msg.sender]);
    }
    
    /**
     * @dev Create a milestone for a project
     */
    function createMilestone(
        string memory _description,
        uint256 _fundingAmount,
        uint256 _votingDuration
    ) external returns (uint256) {
        if (msg.sender != project.creator) revert NotProjectCreator(msg.sender);
        if (!project.active) revert ProjectNotActive();

        milestoneCount++;

        milestones[milestoneCount] = Milestone({
            id: milestoneCount,
            projectId: project.id,
            description: _description,
            fundingAmount: _fundingAmount,
            proofIpfsHash: "",
            completed: false,
            approved: false,
            votesFor: 0,
            votesAgainst: 0,
            votingDeadline: block.timestamp + _votingDuration
        });

        projectMilestones.push(milestoneCount);

        emit MilestoneCreated(milestoneCount, project.id, _description);
        return milestoneCount;
    }
    
    /**
     * @dev Submit proof of milestone completion
     */
    function submitMilestoneProof(uint256 _milestoneId, string memory _proofIpfsHash) external {
        // This function now anchors a proof (IPFS hash) and optionally finalizes the milestone.
        // To avoid emitting many state changes for every off-chain update, callers can emit anchors
        // and only finalize when ready. For backward compatibility we provide a simple anchor-and-finalize API.
        if (_milestoneId == 0 || _milestoneId > milestoneCount) revert InvalidMilestoneId(_milestoneId);
        Milestone storage milestone = milestones[_milestoneId];
        Project storage p = project;
        if (msg.sender != p.creator) revert NotProjectCreator(msg.sender);
        if (milestone.completed) revert MilestoneAlreadyCompleted(_milestoneId);

        // Update the stored last-proof anchor (cheap) and emit an event for indexing more proofs off-chain.
        milestone.proofIpfsHash = _proofIpfsHash;
        emit MilestoneProofSubmitted(_milestoneId, _proofIpfsHash, block.timestamp);

        // If the creator wants to mark the milestone as completed in the same tx, they can call
        // `finalizeMilestone` (separate call) or we can support a boolean finalize flag in future.
    }
    
    /**
     * @dev Vote on milestone completion (weighted by donation amount)
     */
    function voteOnMilestone(uint256 _milestoneId, bool _approve) external {
        if (_milestoneId == 0 || _milestoneId > milestoneCount) revert InvalidMilestoneId(_milestoneId);
        Milestone storage milestone = milestones[_milestoneId];
        if (!milestone.completed) revert MilestoneNotCompleted(_milestoneId);
        if (milestone.approved) revert MilestoneAlreadyApproved(_milestoneId);
        if (block.timestamp >= milestone.votingDeadline) revert VotingPeriodEnded(_milestoneId);
        if (milestoneVotes[_milestoneId][msg.sender]) revert AlreadyVoted(_milestoneId, msg.sender);
        
        // Calculate voting weight based on donation amount (donations to this contract/project)
        uint256 weight = projectDonations[msg.sender];
        if (weight == 0) revert NotADonor(msg.sender);
        
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
        if (milestone.approved) revert MilestoneAlreadyApproved(_milestoneId);
        
        milestone.approved = true;
        
        // Release funds to project creator
        Project storage p = project;
        uint256 releaseAmount = milestone.fundingAmount;
        
        if (releaseAmount > address(this).balance) {
            releaseAmount = address(this).balance;
        }
        
        if (releaseAmount > 0) {
            payable(p.creator).transfer(releaseAmount);

            // Update project reputation
            p.reputationScore += MILESTONE_REPUTATION_BOOST;

            // Award AID tokens to project creator
            aidToken.mint(p.creator, MILESTONE_COMPLETION_REWARD * 10**18);
        }
        
        emit MilestoneApproved(_milestoneId, milestone.projectId);
        emit FundsReleased(milestone.projectId, _milestoneId, releaseAmount);
    }

    /**
     * @dev Finalize a milestone (mark completed). Separate from anchoring proofs to reduce
     * frequent state changes — creators can anchor many proofs off-chain and then call this
     * to mark the milestone completed when ready.
     */
    function finalizeMilestone(uint256 _milestoneId) external {
        if (_milestoneId == 0 || _milestoneId > milestoneCount) revert InvalidMilestoneId(_milestoneId);
        Milestone storage milestone = milestones[_milestoneId];
        if (msg.sender != project.creator) revert NotProjectCreator(msg.sender);
        if (milestone.completed) revert MilestoneAlreadyCompleted(_milestoneId);

        milestone.completed = true;
        emit MilestoneFinalized(_milestoneId, block.timestamp);
    }
    
    /**
     * @dev Get project details
     */
    function getProject() external view returns (Project memory) {
        return project;
    }
    
    /**
     * @dev Get milestone details
     */
    function getMilestone(uint256 _milestoneId) external view returns (Milestone memory) {
        if (_milestoneId == 0 || _milestoneId > milestoneCount) revert InvalidMilestoneId(_milestoneId);
        return milestones[_milestoneId];
    }
    
    /**
     * @dev Get milestones for a project
     */
    function getProjectMilestones() external view returns (uint256[] memory) {
        return projectMilestones;
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
