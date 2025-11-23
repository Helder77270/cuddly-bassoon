// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Script, console} from "forge-std/Script.sol";
import {AidChainFactory} from "../src/AidChainFactory.sol";

/**
 * @title DeployAidChain
 * @dev Deployment script for AidChain system using the factory pattern
 */
contract DeployAidChain is Script {
    
    function run() external {
        // Get deployment private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Get project parameters (or use defaults for testing)
        address projectCreator = vm.envOr("PROJECT_CREATOR", msg.sender);
        string memory projectName = vm.envOr("PROJECT_NAME", string("Humanitarian Aid Project"));
        string memory projectDescription = vm.envOr("PROJECT_DESCRIPTION", string("Decentralized humanitarian funding project"));
        string memory projectIpfs = vm.envOr("PROJECT_IPFS", string("QmDefaultIPFSHash"));
        uint256 fundingGoal = vm.envOr("FUNDING_GOAL", uint256(10 ether));
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy the factory
        AidChainFactory factory = new AidChainFactory();
        console.log("AidChainFactory deployed at:", address(factory));
        
        // Deploy the complete system through factory for this project
        (address aidTokenProxy, address aidChainProxy) = factory.deployCompleteSystem(
            projectCreator,
            projectName,
            projectDescription,
            projectIpfs,
            fundingGoal
        );
        
        console.log("AIDToken Proxy deployed at:", aidTokenProxy);
        console.log("AidChain Proxy deployed at:", aidChainProxy);
        console.log("Project Creator:", projectCreator);
        
        // Get implementation addresses
        (
            ,
            address aidTokenImpl,
            ,
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
        console.log("Project:", projectName);
        console.log("Funding Goal:", fundingGoal);
        console.log("==========================\n");
    }
}
