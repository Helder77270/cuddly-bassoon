// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "../src/AidChainFactory.sol";
import "../src/AidChain.sol";
import "../src/AIDToken.sol";

/**
 * @title AidChainFactoryTest
 * @dev Test suite for AidChainFactory contract (single-project-per-contract model)
 */
contract AidChainFactoryTest is Test {
    AidChainFactory public factory;
    address public owner;
    address public projectCreator1;
    address public projectCreator2;
    
    function setUp() public {
        owner = address(this);
        projectCreator1 = makeAddr("projectCreator1");
        projectCreator2 = makeAddr("projectCreator2");
        
        // Deploy factory
        factory = new AidChainFactory();
    }
    
    function test_DeployAIDToken() public {
        (address proxy, address implementation) = factory.deployAIDToken();
        
        assertTrue(proxy != address(0), "Proxy should be deployed");
        assertTrue(implementation != address(0), "Implementation should be deployed");
        assertTrue(factory.isDeployedByFactory(proxy), "Should be marked as deployed by factory");
        
        // Verify token properties
        AIDToken token = AIDToken(proxy);
        assertEq(token.name(), "AID Reputation Token");
        assertEq(token.symbol(), "AID");
    }
    
    function test_DeployAidChain() public {
        // First deploy AIDToken
        (address tokenProxy,) = factory.deployAIDToken();
        
        // Then deploy AidChain for a specific project
        (address chainProxy, address implementation) = factory.deployAidChain(
            tokenProxy,
            projectCreator1,
            "Medical Supplies",
            "Providing medical supplies",
            "QmTest123",
            10 ether
        );
        
        assertTrue(chainProxy != address(0), "Proxy should be deployed");
        assertTrue(implementation != address(0), "Implementation should be deployed");
        assertTrue(factory.isDeployedByFactory(chainProxy), "Should be marked as deployed by factory");
        
        // Verify AidChain setup
        AidChain chain = AidChain(chainProxy);
        assertEq(address(chain.aidToken()), tokenProxy, "AidToken address should match");
        assertEq(chain.owner(), projectCreator1, "Project creator should be owner");
        
        // Verify project data
        AidChain.Project memory project = chain.getProject();
        assertEq(project.creator, projectCreator1);
        assertEq(project.name, "Medical Supplies");
        assertEq(project.fundingGoal, 10 ether);
    }
    
    function test_DeployCompleteSystem() public {
        (address tokenProxy, address chainProxy) = factory.deployCompleteSystem(
            projectCreator1,
            "Water Project",
            "Clean water for village",
            "QmWater123",
            5 ether
        );
        
        assertTrue(tokenProxy != address(0), "Token proxy should be deployed");
        assertTrue(chainProxy != address(0), "Chain proxy should be deployed");
        
        // Verify linking
        AIDToken token = AIDToken(tokenProxy);
        AidChain chain = AidChain(chainProxy);
        
        assertEq(address(chain.aidToken()), tokenProxy, "AidChain should reference correct token");
        assertEq(token.aidChainContract(), chainProxy, "Token should reference correct chain");
        
        // Verify ownership
        assertEq(token.owner(), owner, "Token owner should be factory owner");
        assertEq(chain.owner(), projectCreator1, "Chain owner should be project creator");
        
        // Verify project
        AidChain.Project memory project = chain.getProject();
        assertEq(project.name, "Water Project");
        assertEq(project.fundingGoal, 5 ether);
    }
    
    function test_DeployMultipleProjects() public {
        // Deploy first project
        (address token1, address chain1) = factory.deployCompleteSystem(
            projectCreator1,
            "Project 1",
            "Description 1",
            "QmHash1",
            10 ether
        );
        
        // Deploy second project (each project gets its own AidChain contract)
        (address token2, address chain2) = factory.deployCompleteSystem(
            projectCreator2,
            "Project 2",
            "Description 2",
            "QmHash2",
            20 ether
        );
        
        // Each project should have separate contracts
        assertTrue(chain1 != chain2, "Each project should have its own AidChain contract");
        
        // Verify each project
        AidChain.Project memory project1 = AidChain(chain1).getProject();
        AidChain.Project memory project2 = AidChain(chain2).getProject();
        
        assertEq(project1.creator, projectCreator1);
        assertEq(project2.creator, projectCreator2);
        assertEq(project1.name, "Project 1");
        assertEq(project2.name, "Project 2");
    }
    
    function test_GetDeploymentCount() public {
        assertEq(factory.getDeploymentCount(), 0, "Should start with 0 deployments");
        
        factory.deployCompleteSystem(
            projectCreator1,
            "Project",
            "Desc",
            "QmHash",
            10 ether
        );
        assertEq(factory.getDeploymentCount(), 1, "Should have 1 deployment");
        
        factory.deployCompleteSystem(
            projectCreator2,
            "Project 2",
            "Desc 2",
            "QmHash2",
            20 ether
        );
        assertEq(factory.getDeploymentCount(), 2, "Should have 2 deployments");
    }
    
    function test_GetLatestDeployment() public {
        factory.deployCompleteSystem(
            projectCreator1,
            "Project",
            "Desc",
            "QmHash",
            10 ether
        );
        
        (
            address tokenProxy,
            address tokenImpl,
            address chainProxy,
            address chainImpl,
            uint256 timestamp
        ) = factory.getLatestDeployment();
        
        assertTrue(tokenProxy != address(0), "Token proxy should exist");
        assertTrue(tokenImpl != address(0), "Token impl should exist");
        assertTrue(chainProxy != address(0), "Chain proxy should exist");
        assertTrue(chainImpl != address(0), "Chain impl should exist");
        assertTrue(timestamp > 0, "Timestamp should be set");
    }
    
    function test_RevertWhen_NonOwnerDeploys() public {
        vm.prank(projectCreator1);
        vm.expectRevert();
        factory.deployAIDToken();
        
        vm.prank(projectCreator1);
        vm.expectRevert();
        factory.deployCompleteSystem(
            projectCreator1,
            "Project",
            "Desc",
            "QmHash",
            10 ether
        );
    }
    
    function test_RevertWhen_DeployAidChainWithInvalidToken() public {
        vm.expectRevert("Invalid AIDToken address");
        factory.deployAidChain(
            address(0),
            projectCreator1,
            "Project",
            "Desc",
            "QmHash",
            10 ether
        );
    }
    
    function test_RevertWhen_DeployAidChainWithInvalidCreator() public {
        (address tokenProxy,) = factory.deployAIDToken();
        
        vm.expectRevert("Invalid creator address");
        factory.deployAidChain(
            tokenProxy,
            address(0),
            "Project",
            "Desc",
            "QmHash",
            10 ether
        );
    }
    
    function test_RevertWhen_GetLatestDeploymentWithNoDeployments() public {
        vm.expectRevert("No deployments yet");
        factory.getLatestDeployment();
    }
}
