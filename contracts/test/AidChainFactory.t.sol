// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "../src/AidChainFactory.sol";
import "../src/AidChain.sol";
import "../src/AIDToken.sol";

/**
 * @title AidChainFactoryTest
 * @dev Test suite for AidChainFactory contract
 */
contract AidChainFactoryTest is Test {
    AidChainFactory public factory;
    address public owner;
    address public user1;
    address public user2;
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
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
        
        // Then deploy AidChain
        (address chainProxy, address implementation) = factory.deployAidChain(tokenProxy);
        
        assertTrue(chainProxy != address(0), "Proxy should be deployed");
        assertTrue(implementation != address(0), "Implementation should be deployed");
        assertTrue(factory.isDeployedByFactory(chainProxy), "Should be marked as deployed by factory");
        
        // Verify AidChain setup
        AidChain chain = AidChain(chainProxy);
        assertEq(address(chain.aidToken()), tokenProxy, "AidToken address should match");
    }
    
    function test_DeployCompleteSystem() public {
        (address tokenProxy, address chainProxy) = factory.deployCompleteSystem();
        
        assertTrue(tokenProxy != address(0), "Token proxy should be deployed");
        assertTrue(chainProxy != address(0), "Chain proxy should be deployed");
        
        // Verify linking
        AIDToken token = AIDToken(tokenProxy);
        AidChain chain = AidChain(chainProxy);
        
        assertEq(address(chain.aidToken()), tokenProxy, "AidChain should reference correct token");
        assertEq(token.aidChainContract(), chainProxy, "Token should reference correct chain");
        
        // Verify ownership transfer
        assertEq(token.owner(), owner, "Token owner should be factory owner");
        assertEq(chain.owner(), owner, "Chain owner should be factory owner");
    }
    
    function test_GetDeploymentCount() public {
        assertEq(factory.getDeploymentCount(), 0, "Should start with 0 deployments");
        
        factory.deployCompleteSystem();
        assertEq(factory.getDeploymentCount(), 1, "Should have 1 deployment");
        
        factory.deployCompleteSystem();
        assertEq(factory.getDeploymentCount(), 2, "Should have 2 deployments");
    }
    
    function test_GetLatestDeployment() public {
        factory.deployCompleteSystem();
        
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
        vm.prank(user1);
        vm.expectRevert();
        factory.deployAIDToken();
        
        vm.prank(user1);
        vm.expectRevert();
        factory.deployCompleteSystem();
    }
    
    function test_RevertWhen_DeployAidChainWithInvalidToken() public {
        vm.expectRevert("Invalid AIDToken address");
        factory.deployAidChain(address(0));
    }
    
    function test_RevertWhen_GetLatestDeploymentWithNoDeployments() public {
        vm.expectRevert("No deployments yet");
        factory.getLatestDeployment();
    }
}
