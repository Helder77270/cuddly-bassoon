# AidChain System Architecture

## Overview

AidChain is a decentralized humanitarian funding protocol built on Ripple Accelar that combines blockchain technology, zkKYC verification, AI-powered project creation, and decentralized storage.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Browser    │  │  MetaMask    │  │   Mobile     │        │
│  │   (React)    │  │   Wallet     │  │     App      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Dynamic Labs (Dynamics)                      │ │
│  │  - Wallet Connection                                      │ │
│  │  - Multi-wallet Support (MetaMask, WalletConnect, etc)   │ │
│  │  - Session Management                                     │ │
│  └──────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Frontend    │  │   Backend     │  │   Blockchain  │
│   Service     │  │   Service     │  │   Service     │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CORE SERVICES                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  1. Smart Contracts (Accelar EVM)                        │ │
│  │     ├── AidChain.sol (Main Protocol)                     │ │
│  │     ├── AIDToken.sol (Reputation Token)                  │ │
│  │     └── Upgradeable Proxy Pattern                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  2. Self Protocol Integration (zkKYC)                    │ │
│  │     ├── Identity Verification                            │ │
│  │     ├── Zero-Knowledge Proofs                            │ │
│  │     └── Privacy-Preserving KYC                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  3. ElizaOS Integration (AI Processing)                  │ │
│  │     ├── Tweet Parsing                                    │ │
│  │     ├── Natural Language Processing                      │ │
│  │     ├── Automated Project Creation                       │ │
│  │     └── Credibility Analysis                             │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  4. IPFS Storage                                         │ │
│  │     ├── Project Documentation                            │ │
│  │     ├── Milestone Proofs                                 │ │
│  │     ├── Media Files                                      │ │
│  │     └── Metadata Storage                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Twitter    │  │    OpenAI    │  │   Infura     │        │
│  │     API      │  │     API      │  │    IPFS      │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Layer (React + Vite)

**Technologies:**
- React 18
- Vite (Build tool)
- TailwindCSS (Styling)
- ethers.js v6 (Blockchain interaction)
- React Router (Navigation)
- Zustand (State management)

**Key Components:**
- `Navbar` - Navigation and wallet connection
- `ProjectCard` - Display project information
- `Home` - List all projects
- `CreateProject` - Project creation form
- `ProjectDetails` - Detailed project view with donations
- `Leaderboard` - Impact ranking display
- `Profile` - User donation history

**Services:**
- `blockchain.js` - Smart contract interactions
- `ipfs.js` - Decentralized storage
- `selfProtocol.js` - zkKYC verification

### 2. Backend Layer (Node.js + Express)

**Technologies:**
- Node.js
- Express
- Twitter API v2
- OpenAI API
- Axios

**Services:**
- `elizaService.js` - AI-powered tweet parsing
- `twitterService.js` - Twitter monitoring and integration

**Endpoints:**
- `/api/eliza/parse-tweet` - Parse humanitarian tweets
- `/api/eliza/create-project` - Create project from tweet
- `/api/twitter/monitor` - Start Twitter monitoring
- `/api/ipfs/:hash` - IPFS proxy

### 3. Smart Contracts (Solidity 0.8.19)

**Contracts:**

#### AidChain.sol
Main protocol contract handling:
- Project creation and management
- Funding operations
- Milestone creation and voting
- Reputation tracking
- Fund release mechanisms

**Key Functions:**
- `createProject()` - Create new humanitarian project
- `fundProject()` - Donate to projects
- `verifyZKKYC()` - Verify project creator
- `createMilestone()` - Define project milestones
- `voteOnMilestone()` - Weighted voting on completion
- `submitMilestoneProof()` - Submit proof of work

#### AIDToken.sol
ERC20 reputation token that:
- Rewards donors proportionally
- Rewards successful project creators
- Provides voting weight
- Tracks impact metrics

### 4. Identity Verification (Self Protocol)

**zkKYC Features:**
- Zero-knowledge proof verification
- Privacy-preserving identity checks
- On-chain verification records
- Compliance with regulations
- Fraud prevention

**Workflow:**
1. User initiates verification
2. Provides identity documents
3. Self Protocol generates zkProof
4. Proof submitted on-chain
5. Project creator status verified

### 5. AI Integration (ElizaOS)

**Capabilities:**
- Parse tweets for humanitarian needs
- Extract structured data (location, amount, category)
- Analyze project credibility
- Generate recommendations
- Automate project creation

**Workflow:**
1. Monitor Twitter for hashtags
2. Parse tweet content using AI
3. Extract project details
4. Create project proposal
5. Notify potential creator

### 6. Decentralized Storage (IPFS)

**Stored Data:**
- Project documentation
- Images and videos
- Milestone proofs
- Progress reports
- Impact assessments

**Benefits:**
- Tamper-proof storage
- Permanent availability
- Censorship resistance
- Cost-effective
- Decentralized access

## Data Flow

### Project Creation Flow

```
User → Connect Wallet (Dynamics)
  ↓
User → Complete zkKYC (Self Protocol)
  ↓
User → Fill Project Form
  ↓
Frontend → Upload Files to IPFS
  ↓
IPFS → Return Content Hash
  ↓
Frontend → Call createProject() on Smart Contract
  ↓
Smart Contract → Emit ProjectCreated Event
  ↓
Frontend → Call verifyZKKYC() on Smart Contract
  ↓
Smart Contract → Mint AID Tokens to Creator
  ↓
User → Project Live & Fundraising
```

### Donation Flow

```
Donor → Connect Wallet
  ↓
Donor → Select Project
  ↓
Donor → Enter Donation Amount
  ↓
Frontend → Call fundProject() with ETH
  ↓
Smart Contract → Record Donation
  ↓
Smart Contract → Update Project Funds
  ↓
Smart Contract → Mint AID Tokens to Donor
  ↓
Smart Contract → Update Donor Reputation
  ↓
Frontend → Update UI & Show Success
```

### Milestone Approval Flow

```
Creator → Complete Milestone Work
  ↓
Creator → Upload Proof to IPFS
  ↓
Creator → Call submitMilestoneProof()
  ↓
Smart Contract → Mark Milestone Complete
  ↓
Smart Contract → Open for Voting
  ↓
Donors → Review Proof from IPFS
  ↓
Donors → Call voteOnMilestone()
  ↓
Smart Contract → Calculate Weighted Votes
  ↓
Smart Contract → Auto-Approve if Threshold Met
  ↓
Smart Contract → Release Funds to Creator
  ↓
Smart Contract → Update Reputation Scores
```

### ElizaOS Auto-Creation Flow

```
User → Tweet Humanitarian Need
  ↓
Twitter → Webhook/Stream to Backend
  ↓
Backend → ElizaOS Parse Tweet
  ↓
ElizaOS → Extract Structured Data
  ↓
Backend → Generate Project Proposal
  ↓
Backend → Notify Original Tweeter
  ↓
User → Claim Project & Complete zkKYC
  ↓
System → Create Project on Blockchain
```

## Security Considerations

### Smart Contract Security
- OpenZeppelin battle-tested libraries
- ReentrancyGuard on fund transfers
- Access control on sensitive functions
- Upgradeable proxy pattern
- Audited code (recommended)

### Data Security
- Environment variables for secrets
- HTTPS/TLS for all communications
- Encrypted wallet connections
- IPFS content addressing (immutable)
- Rate limiting on API endpoints

### Identity Security
- zkKYC preserves privacy
- On-chain verification only
- No personal data on blockchain
- Self Protocol handles sensitive data
- Compliant with privacy regulations

## Scalability

### Layer 2 Approach
- Accelar EVM for lower gas costs
- Batch transactions where possible
- Off-chain computation (ElizaOS)
- IPFS for large data
- Event-driven updates

### Future Optimizations
- State channels for micro-donations
- Sidechains for specific regions
- ZK-Rollups for privacy
- GraphQL for efficient queries
- CDN for frontend assets

## Monitoring & Analytics

### Metrics Tracked
- Total funds raised
- Number of projects
- Donation count and volume
- Milestone completion rate
- User growth
- Geographic distribution
- Category breakdown

### Tools
- Blockchain explorers
- The Graph for indexing
- Google Analytics
- Custom dashboards
- Alert systems

## Disaster Recovery

### Backup Strategy
- Smart contracts immutable
- IPFS data redundantly stored
- Backend database backups
- Configuration backups
- Private key security

### Failover Plan
- Multiple RPC endpoints
- IPFS gateway redundancy
- Backend service replication
- CDN for frontend
- Emergency pause mechanism

## Future Enhancements

1. **Mobile Apps** (React Native)
2. **Multi-chain Support** (Ethereum, Polygon, etc.)
3. **DAO Governance** for protocol upgrades
4. **Advanced Analytics** dashboard
5. **Fiat On/Off Ramps** for accessibility
6. **IoT Integration** for impact verification
7. **NFT Badges** for top donors
8. **Quadratic Funding** mechanisms
9. **Grant Matching** programs
10. **API for Third-party** integrations

---

## Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|---------------|---------|
| Frontend | Smart Contracts | Read/Write blockchain data |
| Frontend | Backend API | ElizaOS features |
| Frontend | IPFS | Upload/retrieve files |
| Frontend | Dynamics | Wallet authentication |
| Backend | Twitter API | Monitor tweets |
| Backend | OpenAI | Parse/analyze content |
| Backend | Smart Contracts | Auto-create projects |
| Smart Contracts | AID Token | Mint rewards |
| Smart Contracts | Self Protocol | Verify identity |
| IPFS | All Layers | Store/retrieve data |

---

This architecture ensures:
- ✅ Decentralization
- ✅ Security
- ✅ Scalability
- ✅ User Privacy
- ✅ Transparency
- ✅ Automation
- ✅ Global Accessibility
