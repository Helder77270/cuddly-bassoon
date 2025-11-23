// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Test} from "forge-std/Test.sol";
import {AidChainFactory} from "../src/AidChainFactory.sol";
import {AidChain} from "../src/AidChain.sol";
import {AidToken} from "../src/AidToken.sol";

/**
 * @title AidChainTest
 * @dev Test suite for AidChain contract functionality (single-project-per-contract model)
 */
contract AidChainTest is Test {
    AidChainFactory public factory;
    AidChain public aidChain;
    AidToken public aidToken;
    
    address public factoryOwner;
    address public projectCreator;
    address public donor1;
    address public donor2;
    
    uint256 constant INITIAL_BALANCE = 100 ether;
    
    function setUp() public {
        factoryOwner = address(this);
        projectCreator = makeAddr("projectCreator");
        donor1 = makeAddr("donor1");
        donor2 = makeAddr("donor2");
        
        // Deploy factory
        factory = new AidChainFactory();
        
        // Deploy complete system for a project
        (address tokenProxy, address chainProxy) = factory.deployCompleteSystem(
            projectCreator,
            "Medical Supplies for Village",
            "Providing medical supplies to remote village",
            "QmTest123",
            10 ether
        );
        
        aidToken = AidToken(tokenProxy);
        aidChain = AidChain(payable(chainProxy));
        
        // Fund test accounts
        vm.deal(donor1, INITIAL_BALANCE);
        vm.deal(donor2, INITIAL_BALANCE);
    }
    
    // ===== Project Initialization Tests =====
    
    function test_ProjectInitialization() public view {
        AidChain.Project memory project = aidChain.getProject();
        
        assertEq(project.id, 1, "Project ID should be 1");
        assertEq(project.creator, projectCreator, "Creator should match");
        assertEq(project.name, "Medical Supplies for Village", "Name should match");
        assertEq(project.fundingGoal, 10 ether, "Funding goal should match");
        assertEq(project.fundsRaised, 0, "Funds raised should be 0");
        assertTrue(project.active, "Project should be active");
        assertFalse(project.zkKycVerified, "Project should not be verified initially");
    }
    
    function test_ProjectCreatorIsOwner() public view {
        assertEq(aidChain.owner(), projectCreator, "Project creator should be owner");
    }
    
    // ===== zkKYC Verification Tests =====
    
    function test_verifyZkKyc() public {
        // Verify zkKYC
        aidChain.verifyZkKyc();
        
        AidChain.Project memory project = aidChain.getProject();
        assertTrue(project.zkKycVerified, "Project should be verified");
        
        // Check that creator received verification reward
        uint256 expectedReward = aidChain.VERIFICATION_REWARD() * 10**18;
        assertEq(aidToken.balanceOf(projectCreator), expectedReward, "Creator should receive verification tokens");
    }
    
    function test_RevertWhen_VerifyAlreadyVerified() public {
        aidChain.verifyZkKyc();
        
        vm.expectRevert(abi.encodeWithSelector(AidChain.ProjectAlreadyVerified.selector, 1));
        aidChain.verifyZkKyc();
    }
    
    // ===== Funding Tests =====
    
    function test_FundProject() public {
        // Verify project first
        aidChain.verifyZkKyc();
        
        // Fund project
        uint256 donationAmount = 1 ether;
        vm.prank(donor1);
        aidChain.fundProject{value: donationAmount}();
        
        AidChain.Project memory project = aidChain.getProject();
        assertEq(project.fundsRaised, donationAmount, "Funds raised should match donation");
        
        // Check donor reputation
        assertEq(aidChain.donorReputation(donor1), donationAmount, "Donor reputation should increase");
        
        // Check AID token reward
        uint256 expectedReward = (donationAmount * aidChain.DONATION_REWARD_MULTIPLIER()) / 1 ether;
        assertEq(aidToken.balanceOf(donor1), expectedReward * 10**18, "Donor should receive AID tokens");
    }
    
    function test_RevertWhen_FundUnverifiedProject() public {
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.ProjectNotVerified.selector));
        aidChain.fundProject{value: 1 ether}();
    }
    
    function test_RevertWhen_FundWithZeroAmount() public {
        aidChain.verifyZkKyc();
        
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.DonationMustBePositive.selector));
        aidChain.fundProject{value: 0}();
    }
    
    function test_MultipleDonations() public {
        aidChain.verifyZkKyc();
        
        vm.prank(donor1);
        aidChain.fundProject{value: 1 ether}();
        
        vm.prank(donor2);
        aidChain.fundProject{value: 2 ether}();
        
        AidChain.Project memory project = aidChain.getProject();
        assertEq(project.fundsRaised, 3 ether, "Total funds should be 3 ether");
    }
    
    // ===== Milestone Tests =====
    
    function test_CreateMilestone() public {
        // Create milestone as project creator
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone(
            "First milestone",
            2 ether,
            7 days
        );
        
        assertEq(milestoneId, 1, "First milestone should have ID 1");
        assertEq(aidChain.milestoneCount(), 1, "Milestone count should be 1");
        
        AidChain.Milestone memory milestone = aidChain.getMilestone(milestoneId);
        
        assertEq(milestone.id, 1);
        assertEq(milestone.projectId, 1);
        assertEq(milestone.description, "First milestone");
        assertEq(milestone.fundingAmount, 2 ether);
        assertFalse(milestone.completed);
        assertFalse(milestone.approved);
        assertTrue(milestone.votingDeadline > block.timestamp);
    }
    
    function test_RevertWhen_NonCreatorCreatesMilestone() public {
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.NotProjectCreator.selector, donor1));
        aidChain.createMilestone("Milestone", 2 ether, 7 days);
    }
    
    function test_SubmitMilestoneProof() public {
        // Create milestone
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        // Submit proof (only anchors, doesn't finalize)
        vm.prank(projectCreator);
        vm.expectEmit(true, false, false, true);
        emit AidChain.MilestoneProofSubmitted(milestoneId, "QmProof123", block.timestamp);
        aidChain.submitMilestoneProof(milestoneId, "QmProof123");
        
        AidChain.Milestone memory milestone = aidChain.getMilestone(milestoneId);
        assertEq(milestone.proofIpfsHash, "QmProof123");
        assertFalse(milestone.completed, "Should not be completed yet (only anchored)");
    }
    
    function test_FinalizeMilestone() public {
        // Create milestone
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        // Submit proof
        vm.prank(projectCreator);
        aidChain.submitMilestoneProof(milestoneId, "QmProof123");
        
        // Finalize milestone
        vm.prank(projectCreator);
        vm.expectEmit(true, false, false, true);
        emit AidChain.MilestoneFinalized(milestoneId, block.timestamp);
        aidChain.finalizeMilestone(milestoneId);
        
        AidChain.Milestone memory milestone = aidChain.getMilestone(milestoneId);
        assertTrue(milestone.completed, "Should be completed after finalization");
    }
    
    function test_RevertWhen_NonCreatorSubmitsProof() public {
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.NotProjectCreator.selector, donor1));
        aidChain.submitMilestoneProof(milestoneId, "QmProof");
    }
    
    function test_RevertWhen_FinalizingAlreadyCompletedMilestone() public {
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        vm.prank(projectCreator);
        aidChain.finalizeMilestone(milestoneId);
        
        vm.prank(projectCreator);
        vm.expectRevert(abi.encodeWithSelector(AidChain.MilestoneAlreadyCompleted.selector, milestoneId));
        aidChain.finalizeMilestone(milestoneId);
    }
    
    function test_VoteOnMilestone() public {
        // Verify and fund project
        aidChain.verifyZkKyc();
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        vm.prank(donor1);
        aidChain.fundProject{value: 5 ether}();
        
        // Submit proof and finalize
        vm.prank(projectCreator);
        aidChain.submitMilestoneProof(milestoneId, "QmProof");
        
        vm.prank(projectCreator);
        aidChain.finalizeMilestone(milestoneId);
        
        // Vote on milestone
        vm.prank(donor1);
        aidChain.voteOnMilestone(milestoneId, true);
        
        AidChain.Milestone memory milestone = aidChain.getMilestone(milestoneId);
        assertEq(milestone.votesFor, 5 ether, "Votes should match donation amount");
        assertTrue(milestone.approved, "Milestone should be approved when votes for > votes against");
    }
    
    function test_RevertWhen_VotingBeforeCompletion() public {
        aidChain.verifyZkKyc();
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        vm.prank(donor1);
        aidChain.fundProject{value: 5 ether}();
        
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.MilestoneNotCompleted.selector, milestoneId));
        aidChain.voteOnMilestone(milestoneId, true);
    }
    
    function test_RevertWhen_NonDonorVotes() public {
        aidChain.verifyZkKyc();
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        vm.prank(projectCreator);
        aidChain.finalizeMilestone(milestoneId);
        
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.NotADonor.selector, donor1));
        aidChain.voteOnMilestone(milestoneId, true);
    }
    
    function test_RevertWhen_VotingTwice() public {
        aidChain.verifyZkKyc();
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        vm.prank(donor1);
        aidChain.fundProject{value: 5 ether}();
        
        vm.prank(projectCreator);
        aidChain.finalizeMilestone(milestoneId);
        
        vm.prank(donor1);
        aidChain.voteOnMilestone(milestoneId, true);
        
        // Since milestone was auto-approved, trying to vote again should fail with MilestoneAlreadyApproved
        vm.prank(donor1);
        vm.expectRevert(abi.encodeWithSelector(AidChain.MilestoneAlreadyApproved.selector, milestoneId));
        aidChain.voteOnMilestone(milestoneId, false);
    }
    
    function test_MilestoneApprovalAndFundRelease() public {
        aidChain.verifyZkKyc();
        
        // Fund project
        vm.prank(donor1);
        aidChain.fundProject{value: 5 ether}();
        
        // Create milestone
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone("Milestone", 2 ether, 7 days);
        
        // Finalize milestone
        vm.prank(projectCreator);
        aidChain.finalizeMilestone(milestoneId);
        
        // Check creator balance and token balance before
        uint256 balanceBefore = projectCreator.balance;
        uint256 tokenBalanceBefore = aidToken.balanceOf(projectCreator);
        
        // Vote to approve (triggers auto-approval)
        vm.prank(donor1);
        aidChain.voteOnMilestone(milestoneId, true);
        
        // Check funds were released
        uint256 balanceAfter = projectCreator.balance;
        assertEq(balanceAfter - balanceBefore, 2 ether, "Creator should receive milestone funds");
        
        // Check reputation boost
        AidChain.Project memory project = aidChain.getProject();
        assertEq(project.reputationScore, aidChain.MILESTONE_REPUTATION_BOOST());
        
        // Check milestone completion reward (added to existing verification reward if any)
        uint256 expectedReward = aidChain.MILESTONE_COMPLETION_REWARD() * 10**18;
        uint256 tokenBalanceAfter = aidToken.balanceOf(projectCreator);
        assertEq(tokenBalanceAfter - tokenBalanceBefore, expectedReward, "Creator should receive milestone reward");
    }
    
    // ===== View Function Tests =====
    
    function test_GetDonorHistory() public {
        aidChain.verifyZkKyc();
        
        vm.prank(donor1);
        aidChain.fundProject{value: 1 ether}();
        
        vm.prank(donor1);
        aidChain.fundProject{value: 2 ether}();
        
        AidChain.Donation[] memory history = aidChain.getDonorHistory(donor1);
        assertEq(history.length, 2, "Should have 2 donations");
        assertEq(history[0].amount, 1 ether);
        assertEq(history[1].amount, 2 ether);
        assertEq(history[0].projectId, 1);
    }
    
    function test_GetProjectMilestones() public {
        vm.prank(projectCreator);
        aidChain.createMilestone("M1", 2 ether, 7 days);
        
        vm.prank(projectCreator);
        aidChain.createMilestone("M2", 3 ether, 7 days);
        
        uint256[] memory milestones = aidChain.getProjectMilestones();
        assertEq(milestones.length, 2, "Should have 2 milestones");
        assertEq(milestones[0], 1);
        assertEq(milestones[1], 2);
    }
    
    function test_GetDonorReputation() public {
        aidChain.verifyZkKyc();
        
        vm.prank(donor1);
        aidChain.fundProject{value: 3 ether}();
        
        assertEq(aidChain.getDonorReputation(donor1), 3 ether);
    }
}
