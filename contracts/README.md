# AidChain Smart Contracts

This directory contains the Solidity smart contracts for the AidChain decentralized humanitarian funding protocol, built using Foundry.

## Overview

AidChain uses an upgradeable architecture with UUPS proxy pattern and a factory contract for easy deployment and management. The system consists of:

- **AIDToken**: ERC20 reputation token (upgradeable)
- **AidChain**: Main protocol contract (upgradeable)
- **AidChainFactory**: Factory for deploying and managing upgradeable proxies

## Architecture

### Upgradeable Pattern
All contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern from OpenZeppelin:
- Implementation contracts are deployed separately
- Proxy contracts delegate calls to implementations
- Upgrades can be performed by authorized owners
- Storage layout is preserved across upgrades

### Factory Pattern
The `AidChainFactory` contract:
- Deploys implementation contracts
- Creates proxy contracts for each implementation
- Manages deployments and tracks all deployed instances
- Ensures proper initialization and ownership transfer

## Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Solidity ^0.8.22

## Installation

1. **Install Foundry** (if not already installed):
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Install dependencies**:
   ```bash
   forge install
   ```

## Building

Compile the contracts:

```bash
forge build
```

## Testing

Run all tests:

```bash
forge test
```

Run tests with verbosity:

```bash
forge test -vv
```

Run specific test:

```bash
forge test --match-test test_FundProject
```

Run tests with gas report:

```bash
forge test --gas-report
```

## Deployment

### Local Deployment

1. Start a local Anvil node:
   ```bash
   anvil
   ```

2. Deploy the contracts:
   ```bash
   forge script script/DeployAidChain.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

### Testnet/Mainnet Deployment

1. Set up your environment variables in `.env`:
   ```env
   PRIVATE_KEY=your_private_key
   RPC_URL=your_rpc_url
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

2. Deploy:
   ```bash
   forge script script/DeployAidChain.s.sol --rpc-url $RPC_URL --broadcast --verify
   ```

## Contract Addresses

After deployment, the factory and proxy addresses will be logged. Save these for frontend integration.

## Upgrading Contracts

To upgrade a contract:

1. Deploy new implementation:
   ```solidity
   AidChain newImpl = new AidChain();
   ```

2. Upgrade proxy (as owner):
   ```solidity
   AidChain(proxyAddress).upgradeToAndCall(address(newImpl), "");
   ```

## Key Features

### Project Management
- Create humanitarian projects with funding goals
- zkKYC verification for project creators
- IPFS integration for project documentation

### Milestone-Based Funding
- Create milestones for projects
- Submit proof of milestone completion
- Weighted voting by donors
- Automatic fund release upon approval

### Reputation System
- AID token rewards for:
  - zkKYC verification (100 AID)
  - Milestone completion (50 AID)
  - Donations (1 AID per 0.001 ETH)
- Donor reputation tracking
- Project reputation scores

## Security

- ReentrancyGuard protection on all value transfers
- Access control via Ownable pattern
- UUPS upgradeable pattern for future improvements
- Comprehensive test coverage (23 tests)

## Contract Functions

### AidChain.sol

**Project Functions:**
- `createProject(name, description, ipfsHash, fundingGoal)`: Create a new project
- `verifyZKKYC(projectId)`: Verify project creator identity
- `fundProject(projectId)`: Donate to a project

**Milestone Functions:**
- `createMilestone(projectId, description, amount, duration)`: Create milestone
- `submitMilestoneProof(milestoneId, ipfsHash)`: Submit completion proof
- `voteOnMilestone(milestoneId, approve)`: Vote on milestone

**View Functions:**
- `getProject(projectId)`: Get project details
- `getMilestone(milestoneId)`: Get milestone details
- `getDonorHistory(address)`: Get donation history
- `getDonorReputation(address)`: Get reputation score

### AIDToken.sol

**Functions:**
- `mint(to, amount)`: Mint tokens (restricted)
- `setAidChainContract(address)`: Set authorized minter

### AidChainFactory.sol

**Deployment Functions:**
- `deployAIDToken()`: Deploy AIDToken with proxy
- `deployAidChain(tokenAddress)`: Deploy AidChain with proxy
- `deployCompleteSystem()`: Deploy both contracts

**View Functions:**
- `getDeploymentCount()`: Get total deployments
- `getDeployment(index)`: Get deployment by index
- `getLatestDeployment()`: Get latest deployment

## Testing Structure

```
test/
├── AidChainFactory.t.sol   # Factory contract tests (8 tests)
└── AidChain.t.sol           # Main protocol tests (15 tests)
```

Test coverage includes:
- Contract deployment
- Project creation and management
- zkKYC verification
- Funding and donations
- Milestone creation and voting
- Reputation system
- Access control
- Edge cases and reverts

## Gas Optimization

The contracts are optimized for gas efficiency:
- Optimizer enabled with 200 runs
- Efficient storage layout
- Minimal external calls
- Batch operations where possible

## Development

### Adding New Features

1. Update the implementation contract
2. Add tests for new functionality
3. Run tests: `forge test`
4. Deploy new implementation
5. Upgrade proxy contracts

### Running Linter

```bash
forge fmt
```

### Generate Documentation

```bash
forge doc
```

## Migration from Hardhat

This project was migrated from Hardhat to Foundry with the following improvements:
- Faster compilation and testing
- Native Solidity testing framework
- Better gas reporting
- Upgradeable pattern with UUPS proxies
- Factory pattern for easy deployment

## License

MIT

## Support

For issues and questions, please open an issue in the GitHub repository.
