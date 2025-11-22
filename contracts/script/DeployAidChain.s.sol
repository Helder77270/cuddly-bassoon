// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Script.sol";
import "../src/AidChainFactory.sol";
import "../src/AidChain.sol";
import "../src/AIDToken.sol";

/**
 * @title DeployAidChain
 * @dev Deployment script for AidChain system using the factory pattern
 */
contract DeployAidChain is Script {
    
    function run() external {
        // Get deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the factory
        AidChainFactory factory = new AidChainFactory();
        console.log("AidChainFactory deployed at:", address(factory));
        
        // Deploy the complete system through factory
        (address aidTokenProxy, address aidChainProxy) = factory.deployCompleteSystem();
        
        console.log("AIDToken Proxy deployed at:", aidTokenProxy);
        console.log("AidChain Proxy deployed at:", aidChainProxy);
        
        // Get implementation addresses
        (
            address aidTokenProxyAddr,
            address aidTokenImpl,
            address aidChainProxyAddr,
            address aidChainImpl,
            uint256 timestamp
        ) = factory.getLatestDeployment();
        
        console.log("AIDToken Implementation:", aidTokenImpl);
        console.log("AidChain Implementation:", aidChainImpl);
        console.log("Deployment timestamp:", timestamp);
        
        // Stop broadcasting
        vm.stopBroadcast();
        
        // Log summary
        console.log("\n=== Deployment Summary ===");
        console.log("Factory:", address(factory));
        console.log("AIDToken Proxy:", aidTokenProxy);
        console.log("AidChain Proxy:", aidChainProxy);
        console.log("==========================\n");
    }
}
