// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AidChain.sol";
import "./AIDToken.sol";

/**
 * @title AidChainFactory
 * @dev Factory contract for deploying and managing upgradeable AidChain and AIDToken proxies
 */
contract AidChainFactory is Ownable {
    
    // Events
    event AIDTokenDeployed(address indexed proxy, address indexed implementation);
    event AidChainDeployed(address indexed proxy, address indexed implementation, address indexed aidToken);
    event ImplementationUpgraded(address indexed proxy, address indexed newImplementation);
    
    // Deployed contracts tracking
    struct Deployment {
        address aidTokenProxy;
        address aidTokenImplementation;
        address aidChainProxy;
        address aidChainImplementation;
        uint256 timestamp;
    }
    
    Deployment[] public deployments;
    mapping(address => bool) public isDeployedByFactory;
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Deploy a new AIDToken with upgradeable proxy
     * @return proxy The address of the deployed proxy
     * @return implementation The address of the implementation contract
     */
    function deployAIDToken() public onlyOwner returns (address proxy, address implementation) {
        // Deploy implementation
        AIDToken aidTokenImpl = new AIDToken();
        implementation = address(aidTokenImpl);
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            AIDToken.initialize.selector
        );
        ERC1967Proxy aidTokenProxy = new ERC1967Proxy(implementation, initData);
        proxy = address(aidTokenProxy);
        
        // Mark as deployed by factory
        isDeployedByFactory[proxy] = true;
        
        emit AIDTokenDeployed(proxy, implementation);
    }
    
    /**
     * @dev Deploy a new AidChain with upgradeable proxy
     * @param _aidTokenAddress The address of the AIDToken contract
     * @return proxy The address of the deployed proxy
     * @return implementation The address of the implementation contract
     */
    function deployAidChain(address _aidTokenAddress) public onlyOwner returns (address proxy, address implementation) {
        require(_aidTokenAddress != address(0), "Invalid AIDToken address");
        
        // Deploy implementation
        AidChain aidChainImpl = new AidChain();
        implementation = address(aidChainImpl);
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            AidChain.initialize.selector,
            _aidTokenAddress
        );
        ERC1967Proxy aidChainProxy = new ERC1967Proxy(implementation, initData);
        proxy = address(aidChainProxy);
        
        // Mark as deployed by factory
        isDeployedByFactory[proxy] = true;
        
        emit AidChainDeployed(proxy, implementation, _aidTokenAddress);
    }
    
    /**
     * @dev Deploy complete AidChain system (AIDToken + AidChain)
     * @return aidTokenProxy The address of the AIDToken proxy
     * @return aidChainProxy The address of the AidChain proxy
     */
    function deployCompleteSystem() external onlyOwner returns (
        address aidTokenProxy,
        address aidChainProxy
    ) {
        // Deploy AIDToken
        address aidTokenImpl;
        (aidTokenProxy, aidTokenImpl) = deployAIDToken();
        
        // Deploy AidChain
        address aidChainImpl;
        (aidChainProxy, aidChainImpl) = deployAidChain(aidTokenProxy);
        
        // Set AidChain as authorized minter on AIDToken
        AIDToken(aidTokenProxy).setAidChainContract(aidChainProxy);
        
        // Transfer ownership of contracts to factory owner
        AIDToken(aidTokenProxy).transferOwnership(owner());
        AidChain(aidChainProxy).transferOwnership(owner());
        
        // Record deployment
        deployments.push(Deployment({
            aidTokenProxy: aidTokenProxy,
            aidTokenImplementation: aidTokenImpl,
            aidChainProxy: aidChainProxy,
            aidChainImplementation: aidChainImpl,
            timestamp: block.timestamp
        }));
        
        return (aidTokenProxy, aidChainProxy);
    }
    
    /**
     * @dev Get the number of deployments
     */
    function getDeploymentCount() external view returns (uint256) {
        return deployments.length;
    }
    
    /**
     * @dev Get deployment details by index
     */
    function getDeployment(uint256 index) external view returns (
        address aidTokenProxy,
        address aidTokenImplementation,
        address aidChainProxy,
        address aidChainImplementation,
        uint256 timestamp
    ) {
        require(index < deployments.length, "Invalid deployment index");
        Deployment memory deployment = deployments[index];
        return (
            deployment.aidTokenProxy,
            deployment.aidTokenImplementation,
            deployment.aidChainProxy,
            deployment.aidChainImplementation,
            deployment.timestamp
        );
    }
    
    /**
     * @dev Get the latest deployment
     */
    function getLatestDeployment() external view returns (
        address aidTokenProxy,
        address aidTokenImplementation,
        address aidChainProxy,
        address aidChainImplementation,
        uint256 timestamp
    ) {
        require(deployments.length > 0, "No deployments yet");
        Deployment memory deployment = deployments[deployments.length - 1];
        return (
            deployment.aidTokenProxy,
            deployment.aidTokenImplementation,
            deployment.aidChainProxy,
            deployment.aidChainImplementation,
            deployment.timestamp
        );
    }
}
