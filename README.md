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
Smart Contracts (Accelar EVM)
    ↓
Services:
  - Self Protocol (zkKYC)
  - ElizaOS (Tweet parsing)
  - Dynamics (Wallet management)
  - IPFS (Storage)
```

## 📁 Project Structure

```
cuddly-bassoon/
├── contracts/              # Smart contracts (Solidity)
│   ├── src/               # Contract source files
│   ├── test/              # Contract tests
│   └── scripts/           # Deployment scripts
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API and blockchain services
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/               # Backend services
│   ├── src/
│   │   ├── services/      # ElizaOS, Twitter integration
│   │   └── routes/        # API routes
│   └── utils/
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
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy smart contracts**
   ```bash
   # Compile contracts
   npm run compile

   # Deploy to local network
   npm run deploy:local

   # Deploy to Accelar testnet
   npm run deploy:testnet
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

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
npm test
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
```javascript
import selfProtocolService from './services/selfProtocol'

// Initiate verification
const result = await selfProtocolService.initiateVerification(address, userInfo)

// Submit proof
await selfProtocolService.submitProof(address, proof)
```

### ElizaOS (Tweet Parsing)
```javascript
// Backend service
const parsedData = await elizaService.parseTweet(tweetUrl)
const project = await elizaService.createProjectFromTweet(parsedData)
```

### IPFS
```javascript
import ipfsService from './services/ipfs'

// Upload project data
const { metadataHash } = await ipfsService.uploadProjectData(data, files)

// Retrieve data
const metadata = await ipfsService.getFile(hash)
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
- Vite
- TailwindCSS
- ethers.js v6
- Dynamic Labs SDK
- React Router
- Zustand (State Management)

**Smart Contracts:**
- Solidity 0.8.19
- Hardhat
- OpenZeppelin Contracts
- Accelar EVM

**Backend:**
- Node.js
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