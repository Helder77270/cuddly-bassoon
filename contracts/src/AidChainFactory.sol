// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AidChain} from "./AidChain.sol";
import {AidToken} from "./AidToken.sol";

/**
 * @title AidChainFactory
 * @dev Factory contract for deploying and managing upgradeable AidChain and AidToken proxies
 */
contract AidChainFactory is Ownable {
    
    // Events
    event AidTokenDeployed(address indexed proxy, address indexed implementation);
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
     * @dev Deploy a new AidToken with upgradeable proxy
     * @return proxy The address of the deployed proxy
     * @return implementation The address of the implementation contract
     */
    function deployAidToken() public onlyOwner returns (address proxy, address implementation) {
        // Deploy implementation
        AidToken aidTokenImpl = new AidToken();
        implementation = address(aidTokenImpl);
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            AidToken.initialize.selector
        );
        ERC1967Proxy aidTokenProxy = new ERC1967Proxy(implementation, initData);
        proxy = address(aidTokenProxy);
        
        // Mark as deployed by factory
        isDeployedByFactory[proxy] = true;
        
        emit AidTokenDeployed(proxy, implementation);
    }
    
    /**
     * @dev Deploy a new AidChain with upgradeable proxy (single project)
     * @param _aidTokenAddress The address of the AidToken contract
     * @param _creator The project creator (will own the contract)
     * @param _name Project name
     * @param _description Project description
     * @param _ipfsHash IPFS hash for project media
     * @param _fundingGoal Funding goal in wei
     * @return proxy The address of the deployed proxy
     * @return implementation The address of the implementation contract
     */
    function deployAidChain(
        address _aidTokenAddress,
        address _creator,
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        uint256 _fundingGoal
    ) public onlyOwner returns (address proxy, address implementation) {
        require(_aidTokenAddress != address(0), "Invalid AidToken address");
        require(_creator != address(0), "Invalid creator address");
        
        // Deploy implementation
        AidChain aidChainImpl = new AidChain();
        implementation = address(aidChainImpl);
        
        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(
            AidChain.initialize.selector,
            _aidTokenAddress,
            _creator,
            _name,
            _description,
            _ipfsHash,
            _fundingGoal
        );
        ERC1967Proxy aidChainProxy = new ERC1967Proxy(implementation, initData);
        proxy = address(aidChainProxy);
        
        // Mark as deployed by factory
        isDeployedByFactory[proxy] = true;
        
        emit AidChainDeployed(proxy, implementation, _aidTokenAddress);
    }
    
    /**
     * @dev Deploy complete AidChain system (AIDToken + AidChain) for a single project
     * @param _creator The project creator
     * @param _name Project name
     * @param _description Project description
     * @param _ipfsHash IPFS hash for project media
     * @param _fundingGoal Funding goal in wei
     * @return aidTokenProxy The address of the AIDToken proxy
     * @return aidChainProxy The address of the AidChain proxy
     */
    function deployCompleteSystem(
        address _creator,
        string memory _name,
        string memory _description,
        string memory _ipfsHash,
        uint256 _fundingGoal
    ) external onlyOwner returns (
        address aidTokenProxy,
        address aidChainProxy
    ) {
        // Deploy AidToken
        address aidTokenImpl;
        (aidTokenProxy, aidTokenImpl) = deployAidToken();
        
        // Deploy AidChain for this specific project
        address aidChainImpl;
        (aidChainProxy, aidChainImpl) = deployAidChain(
            aidTokenProxy,
            _creator,
            _name,
            _description,
            _ipfsHash,
            _fundingGoal
        );
        
        // Set AidChain as authorized minter on AidToken
        AidToken(aidTokenProxy).setAidChainContract(aidChainProxy);
        
        // Note: Project creator (_creator) is already the owner of the AidChain contract
        // Transfer AidToken ownership to factory owner for management
        AidToken(aidTokenProxy).transferOwnership(owner());
        
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
