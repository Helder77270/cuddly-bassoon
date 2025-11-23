// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title AidToken
 * @dev AID Reputation Token (ERC20) - Upgradeable
 */
contract AidToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    address public aidChainContract;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize() public initializer {
        __ERC20_init("AID Reputation Token", "AID");
        __Ownable_init(msg.sender);
    }
    
    function setAidChainContract(address _aidChainContract) external onlyOwner {
        aidChainContract = _aidChainContract;
    }
    
    function mint(address to, uint256 amount) external {
        require(msg.sender == aidChainContract || msg.sender == owner(), "Not authorized");
        _mint(to, amount);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}
