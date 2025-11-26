# AidChain - Decentralized Humanitarian Funding Protocol

AidChain is a revolutionary blockchain-based platform built on Ripple Accelar that enables transparent, milestone-based funding for humanitarian projects worldwide.

## 🌟 Features

- **zkKYC Identity Verification**: Secure identity verification using Self Protocol's zero-knowledge proof technology
- **Milestone-Based Funding**: Funds released only when project milestones are approved by donors
- **Weighted Voting System**: Donors vote on milestone completion with voting power proportional to their contribution
- **AID Reputation Token**: Earn AID tokens for donations and successful project completions
- **Impact Leaderboard**: Track and recognize top donors and most impactful projects
- **ElizaOS Integration**: Automatically parse humanitarian aid requests from tweets
- **IPFS Storage**: Decentralized storage for project documentation and milestone proofs
- **Dynamic Wallet Integration**: Easy login and wallet creation via Dynamics

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Smart Contracts (Axelar EVM - Upgradeable UUPS Proxies)
    ├─ AidChainFactory (Deployment & Management)
    ├─ AIDToken Proxy → AIDToken Implementation
    └─ AidChain Proxy → AidChain Implementation
    ↓
Services:
  - Self Protocol (zkKYC)
  - ElizaOS (Tweet parsing)
  - Dynamic Labs (Wallet management)
  - IPFS (Storage)
```

### Smart Contract Architecture

The contracts use an upgradeable architecture:
- **UUPS Proxy Pattern**: All main contracts are upgradeable
- **Factory Pattern**: Centralized deployment and management
- **Separation of Concerns**: Token, main protocol, and factory are separate
- **Access Control**: Owner-based upgrades and administrative functions

## 📁 Project Structure

```
cuddly-bassoon/
├── contracts/              # Smart contracts (Solidity)
│   ├── src/               # Contract source files
│   ├── test/              # Contract tests
│   └── scripts/           # Deployment scripts
├── frontend/              # React frontend (TypeScript)
│   ├── src/
│   │   ├── components/    # React components (.tsx)
│   │   ├── pages/         # Page components (.tsx)
│   │   ├── services/      # API and blockchain services (.ts)
│   │   ├── types/         # TypeScript type definitions
│   │   └── contracts/     # Contract ABIs
│   └── public/            # Static assets
├── backend/               # Backend services (TypeScript)
│   ├── src/
│   │   ├── services/      # ElizaOS, Twitter integration (.ts)
│   │   ├── types/         # TypeScript type definitions
│   │   └── index.ts       # Main entry point
│   └── dist/              # Compiled JavaScript output
└── docs/                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- MetaMask or compatible Web3 wallet
- Accelar testnet tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Helder77270/cuddly-bassoon.git
   cd cuddly-bassoon
   ```

2. **Install smart contract dependencies**
   ```bash
   cd contracts
   # Install Foundry if not already installed
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   # Install contract dependencies
   forge install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy smart contracts**
   ```bash
   # Compile contracts
   forge build

   # Run tests
   forge test

   # Deploy to local network (start Anvil first)
   anvil  # In a separate terminal
   forge script script/DeployAidChain.s.sol --rpc-url http://localhost:8545 --broadcast

   # Deploy to Axelar testnet
   forge script script/DeployAidChain.s.sol --rpc-url $RPC_URL --broadcast --verify
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Edit .env with contract addresses from deployment
   ```

5. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   cp .env.example .env
   # Edit .env with API keys and contract addresses
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Configuration

### Frontend (.env)
```env
VITE_AIDCHAIN_ADDRESS=0x...
VITE_AIDTOKEN_ADDRESS=0x...
VITE_DYNAMIC_ENV_ID=your_dynamic_id
VITE_IPFS_PROJECT_ID=your_ipfs_project_id
VITE_IPFS_PROJECT_SECRET=your_ipfs_secret
```

### Backend (.env)
```env
PORT=3001
ACCELAR_RPC_URL=https://rpc-testnet.accelar.io
TWITTER_BEARER_TOKEN=your_token
OPENAI_API_KEY=your_key
```

### Contracts (.env)
```env
ACCELAR_RPC_URL=https://rpc-testnet.accelar.io
PRIVATE_KEY=your_private_key
```

## 📖 Usage

### For Project Creators

1. **Connect Wallet**: Use the "Connect Wallet" button in the navbar
2. **Verify Identity**: Complete zkKYC verification through Self Protocol
3. **Create Project**: Fill in project details, upload documentation to IPFS
4. **Create Milestones**: Define project milestones with funding amounts
5. **Submit Proofs**: Upload proof of milestone completion
6. **Receive Funds**: Get funds released after donor approval

### For Donors

1. **Connect Wallet**: Connect your Web3 wallet
2. **Browse Projects**: Explore verified humanitarian projects
3. **Donate**: Support projects with ETH
4. **Vote on Milestones**: Approve or reject milestone completions
5. **Earn AID Tokens**: Receive reputation tokens for donations
6. **Track Impact**: View your donation history and impact on the leaderboard

### For Automated Project Creation

1. **Tweet with Hashtags**: Tweet humanitarian needs with #HumanitarianAid or #AidChain
2. **ElizaOS Parses**: Backend automatically parses tweet content
3. **Project Created**: System extracts project details and creates proposal
4. **zkKYC Required**: Project creator still needs identity verification

## 🔄 Complete Process Flow

> 📖 For detailed technical documentation, see [docs/PROCESS_FLOW.md](docs/PROCESS_FLOW.md)

The AidChain platform operates through the following automated process:

```
1. TWEET DISCOVERY
   └─► User tweets on AidChain's X page with project request

2. BACKEND MONITORING (Every 5 minutes)
   └─► System polls for new tweets

3. ENGAGEMENT CHECK
   └─► Tweet reaches 15+ likes threshold

4. ELIZAOS ANALYSIS
   └─► AI validates content contains:
       • Project title
       • Clear description
       • Total amount in XRP
       • Milestone breakdown

5. PROJECT DEPLOYMENT
   └─► Backend deploys project to blockchain

6. USER NOTIFICATION
   └─► DM sent to tweet author with project link

7. WALLET SETUP
   └─► User logs in via Dynamic Wallet
       (auto-created if needed)

8. PROJECT MANAGEMENT
   └─► Admin accesses forum to add:
       • Posts and updates
       • Files and documents
       • Pictures and media

9. KYC VERIFICATION (Self.xyz)
   └─► Required before first milestone unlock
       • Verify human identity
       • zkKYC proof generated

10. FIRST MILESTONE UNLOCK
    └─► Admin unlocks initial funds to start activity

11. PROOF SUBMISSION
    └─► Admin documents progress with evidence

12. VOTE REQUEST
    └─► Admin requests funder vote for next milestone

13. FUNDER VOTING
    └─► Donors vote (weighted by contribution)
        • Approve: Funds released
        • Reject: Funds held

14. LOOP UNTIL COMPLETION
    └─► Steps 11-13 repeat for each milestone
```

### Key Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Tweet Monitoring** | Discover humanitarian needs | Twitter API |
| **Content Analysis** | Validate project requests | ElizaOS (AI) |
| **Wallet Management** | Easy user onboarding | Dynamic Labs |
| **Identity Verification** | Ensure human verification | Self.xyz (zkKYC) |
| **Fund Management** | Milestone-based releases | Smart Contracts |
| **Voting System** | Democratic fund approval | Weighted voting |

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test
# Or with verbosity
forge test -vv
# Or with gas report
forge test --gas-report
```

### Frontend
```bash
cd frontend
npm run test
```

### Backend
```bash
cd backend
npm run test
```

## 🔐 Security Features

- **zkKYC Verification**: Zero-knowledge proof identity verification
- **Milestone-Based Release**: Funds locked until milestone approval
- **Weighted Voting**: Democratic fund release through donor voting
- **ReentrancyGuard**: Protection against reentrancy attacks
- **IPFS Storage**: Decentralized, tamper-proof documentation storage

## 🎯 Smart Contract Functions

### AidChain.sol

#### Project Management
- `createProject(name, description, ipfsHash, fundingGoal)`: Create new project
- `verifyZKKYC(projectId)`: Verify project creator identity
- `getProject(projectId)`: Get project details

#### Funding
- `fundProject(projectId)`: Donate to a project
- `getDonorHistory(address)`: Get donation history
- `getDonorReputation(address)`: Get donor reputation score

#### Milestones
- `createMilestone(projectId, description, amount, duration)`: Create milestone
- `submitMilestoneProof(milestoneId, ipfsHash)`: Submit proof
- `voteOnMilestone(milestoneId, approve)`: Vote on milestone
- `getMilestone(milestoneId)`: Get milestone details

#### AID Token
- `mint(address, amount)`: Mint reputation tokens
- `balanceOf(address)`: Get AID token balance

## 🌐 Integration Guide

### Self Protocol (zkKYC)
```typescript
import selfProtocolService from './services/selfProtocol';

// Initiate verification
const result = await selfProtocolService.initiateVerification(address, userInfo);

// Submit proof
await selfProtocolService.submitProof(address, proof);
```

### ElizaOS (Tweet Parsing)
```typescript
// Backend service
const parsedData = await elizaService.parseTweet(tweetUrl);
const project = await elizaService.createProjectFromTweet(parsedData.data);
```

### IPFS
```typescript
import ipfsService from './services/ipfs';

// Upload project data
const { metadataHash } = await ipfsService.uploadProjectData(data, files);

// Retrieve data
const metadata = await ipfsService.getFile<IPFSMetadata>(hash);
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Ripple Accelar**: Blockchain infrastructure
- **Self Protocol**: zkKYC verification technology
- **ElizaOS**: AI-powered tweet parsing
- **Dynamic Labs**: Wallet authentication
- **IPFS**: Decentralized storage

## 📞 Support

For support, email support@aidchain.io or join our Discord community.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-chain support
- [ ] DAO governance for protocol upgrades
- [ ] Advanced analytics dashboard
- [ ] Integration with more humanitarian organizations
- [ ] Fiat on/off ramp
- [ ] Impact verification through IoT devices

## 📊 Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- TailwindCSS
- ethers.js v6
- Dynamic Labs SDK
- React Router
- Zustand (State Management)

**Smart Contracts:**
- Solidity 0.8.22
- Foundry
- OpenZeppelin Contracts (Upgradeable)
- UUPS Proxy Pattern
- Factory Pattern
- Axelar EVM

**Backend:**
- Node.js
- TypeScript
- Express
- Twitter API v2
- OpenAI API
- Axios

**Storage & Identity:**
- IPFS (via Infura)
- Self Protocol (zkKYC)

## 🔗 Links

- [Website](https://aidchain.io)
- [Documentation](https://docs.aidchain.io)
- [Twitter](https://twitter.com/aidchain)
- [Discord](https://discord.gg/aidchain)

---

Built with ❤️ for humanitarian causes worldwide