// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "../src/AidChainFactory.sol";
import "../src/AidChain.sol";
import "../src/AIDToken.sol";

/**
 * @title AidChainTest
 * @dev Test suite for AidChain contract functionality
 */
contract AidChainTest is Test {
    AidChainFactory public factory;
    AidChain public aidChain;
    AIDToken public aidToken;
    
    address public owner;
    address public projectCreator;
    address public donor1;
    address public donor2;
    
    uint256 constant INITIAL_BALANCE = 100 ether;
    
    function setUp() public {
        owner = address(this);
        projectCreator = makeAddr("projectCreator");
        donor1 = makeAddr("donor1");
        donor2 = makeAddr("donor2");
        
        // Deploy factory and complete system
        factory = new AidChainFactory();
        (address tokenProxy, address chainProxy) = factory.deployCompleteSystem();
        
        aidToken = AIDToken(tokenProxy);
        aidChain = AidChain(payable(chainProxy));
        
        // Fund test accounts
        vm.deal(donor1, INITIAL_BALANCE);
        vm.deal(donor2, INITIAL_BALANCE);
    }
    
    // ===== Project Creation Tests =====
    
    function test_CreateProject() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject(
            "Medical Supplies for Village",
            "Providing medical supplies to remote village",
            "QmTest123",
            10 ether
        );
        
        assertEq(projectId, 1, "First project should have ID 1");
        assertEq(aidChain.projectCount(), 1, "Project count should be 1");
        
        (
            uint256 id,
            address creator,
            string memory name,
            ,
            ,
            uint256 fundingGoal,
            uint256 fundsRaised,
            ,
            bool active,
            ,
        ) = aidChain.projects(projectId);
        
        assertEq(id, 1);
        assertEq(creator, projectCreator);
        assertEq(name, "Medical Supplies for Village");
        assertEq(fundingGoal, 10 ether);
        assertEq(fundsRaised, 0);
        assertTrue(active);
    }
    
    function test_RevertWhen_CreateProjectWithEmptyName() public {
        vm.prank(projectCreator);
        vm.expectRevert("Name cannot be empty");
        aidChain.createProject("", "Description", "QmTest", 10 ether);
    }
    
    function test_RevertWhen_CreateProjectWithZeroFunding() public {
        vm.prank(projectCreator);
        vm.expectRevert("Funding goal must be positive");
        aidChain.createProject("Project", "Description", "QmTest", 0);
    }
    
    // ===== zkKYC Verification Tests =====
    
    function test_VerifyZKKYC() public {
        // Create project
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        // Verify zkKYC
        aidChain.verifyZKKYC(projectId);
        
        (,,,,,,,,, bool zkKYCVerified,) = aidChain.projects(projectId);
        assertTrue(zkKYCVerified, "Project should be verified");
        
        // Check that creator received verification reward
        uint256 expectedReward = aidChain.VERIFICATION_REWARD() * 10**18;
        assertEq(aidToken.balanceOf(projectCreator), expectedReward, "Creator should receive verification tokens");
    }
    
    function test_RevertWhen_VerifyAlreadyVerified() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        aidChain.verifyZKKYC(projectId);
        
        vm.expectRevert("Already verified");
        aidChain.verifyZKKYC(projectId);
    }
    
    // ===== Funding Tests =====
    
    function test_FundProject() public {
        // Create and verify project
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        aidChain.verifyZKKYC(projectId);
        
        // Fund project
        uint256 donationAmount = 1 ether;
        vm.prank(donor1);
        aidChain.fundProject{value: donationAmount}(projectId);
        
        (,,,,,, uint256 fundsRaised,,,,) = aidChain.projects(projectId);
        assertEq(fundsRaised, donationAmount, "Funds raised should match donation");
        
        // Check donor reputation
        assertEq(aidChain.donorReputation(donor1), donationAmount, "Donor reputation should increase");
        
        // Check AID token reward
        uint256 expectedReward = (donationAmount * aidChain.DONATION_REWARD_MULTIPLIER()) / 1 ether;
        assertEq(aidToken.balanceOf(donor1), expectedReward * 10**18, "Donor should receive AID tokens");
    }
    
    function test_RevertWhen_FundUnverifiedProject() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        vm.prank(donor1);
        vm.expectRevert("Project creator not verified");
        aidChain.fundProject{value: 1 ether}(projectId);
    }
    
    function test_RevertWhen_FundWithZeroAmount() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        aidChain.verifyZKKYC(projectId);
        
        vm.prank(donor1);
        vm.expectRevert("Donation must be positive");
        aidChain.fundProject{value: 0}(projectId);
    }
    
    // ===== Milestone Tests =====
    
    function test_CreateMilestone() public {
        // Setup project
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        // Create milestone
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone(
            projectId,
            "First milestone",
            2 ether,
            7 days
        );
        
        assertEq(milestoneId, 1, "First milestone should have ID 1");
        assertEq(aidChain.milestoneCount(), 1, "Milestone count should be 1");
        
        (
            uint256 id,
            uint256 projId,
            string memory description,
            uint256 fundingAmount,
            ,
            bool completed,
            bool approved,
            ,
            ,
            uint256 votingDeadline
        ) = aidChain.milestones(milestoneId);
        
        assertEq(id, 1);
        assertEq(projId, projectId);
        assertEq(description, "First milestone");
        assertEq(fundingAmount, 2 ether);
        assertFalse(completed);
        assertFalse(approved);
        assertTrue(votingDeadline > block.timestamp);
    }
    
    function test_RevertWhen_NonCreatorCreatesMilestone() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        vm.prank(donor1);
        vm.expectRevert("Only project creator can create milestones");
        aidChain.createMilestone(projectId, "Milestone", 2 ether, 7 days);
    }
    
    function test_SubmitMilestoneProof() public {
        // Setup
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone(projectId, "Milestone", 2 ether, 7 days);
        
        // Submit proof
        vm.prank(projectCreator);
        aidChain.submitMilestoneProof(milestoneId, "QmProof123");
        
        (,,,, string memory proofHash, bool completed,,,,) = aidChain.milestones(milestoneId);
        assertEq(proofHash, "QmProof123");
        assertTrue(completed);
    }
    
    function test_VoteOnMilestone() public {
        // Setup project and milestone
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        aidChain.verifyZKKYC(projectId);
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone(projectId, "Milestone", 2 ether, 7 days);
        
        // Fund project
        vm.prank(donor1);
        aidChain.fundProject{value: 5 ether}(projectId);
        
        // Submit proof
        vm.prank(projectCreator);
        aidChain.submitMilestoneProof(milestoneId, "QmProof");
        
        // Vote on milestone
        vm.prank(donor1);
        aidChain.voteOnMilestone(milestoneId, true);
        
        (,,,,,, bool approved, uint256 votesFor,,) = aidChain.milestones(milestoneId);
        assertEq(votesFor, 5 ether, "Votes should match donation amount");
        assertTrue(approved, "Milestone should be approved when votes for > votes against");
    }
    
    function test_RevertWhen_NonDonorVotes() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        aidChain.verifyZKKYC(projectId);
        
        vm.prank(projectCreator);
        uint256 milestoneId = aidChain.createMilestone(projectId, "Milestone", 2 ether, 7 days);
        
        vm.prank(projectCreator);
        aidChain.submitMilestoneProof(milestoneId, "QmProof");
        
        vm.prank(donor1);
        vm.expectRevert("Must be a donor to vote");
        aidChain.voteOnMilestone(milestoneId, true);
    }
    
    // ===== View Function Tests =====
    
    function test_GetDonorHistory() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        aidChain.verifyZKKYC(projectId);
        
        vm.prank(donor1);
        aidChain.fundProject{value: 1 ether}(projectId);
        
        vm.prank(donor1);
        aidChain.fundProject{value: 2 ether}(projectId);
        
        AidChain.Donation[] memory history = aidChain.getDonorHistory(donor1);
        assertEq(history.length, 2, "Should have 2 donations");
        assertEq(history[0].amount, 1 ether);
        assertEq(history[1].amount, 2 ether);
    }
    
    function test_GetProjectMilestones() public {
        vm.prank(projectCreator);
        uint256 projectId = aidChain.createProject("Project", "Desc", "QmTest", 10 ether);
        
        vm.prank(projectCreator);
        aidChain.createMilestone(projectId, "M1", 2 ether, 7 days);
        
        vm.prank(projectCreator);
        aidChain.createMilestone(projectId, "M2", 3 ether, 7 days);
        
        uint256[] memory milestones = aidChain.getProjectMilestones(projectId);
        assertEq(milestones.length, 2, "Should have 2 milestones");
        assertEq(milestones[0], 1);
        assertEq(milestones[1], 2);
    }
}
