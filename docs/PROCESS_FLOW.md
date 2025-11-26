# AidChain - Complete Process Flow

This document describes the complete end-to-end process flow for how humanitarian projects are created, managed, and funded through the AidChain platform. This serves as a reference for developers to understand the system architecture and implementation requirements.

## Overview

AidChain automates the discovery of humanitarian needs from social media (X/Twitter), validates them using AI (ElizaOS), and enables transparent, milestone-based funding with identity verification.

---

## Complete Process Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AIDCHAIN PROCESS FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────┘

[1] TWEET DISCOVERY
    User tweets on AidChain X page
           │
           ▼
[2] MONITORING (Every 5 minutes)
    Backend polls tweets from the X page
           │
           ▼
[3] LIKE THRESHOLD CHECK
    Tweet has >= 15 likes?
           │
    ┌──────┴──────┐
    │ NO          │ YES
    │ (Skip)      ▼
    │      [4] ELIZAOS CONTENT ANALYSIS
    │           Send tweet content to ElizaOS
    │                  │
    │                  ▼
    │      [5] CONTENT VALIDATION
    │           Check for required elements:
    │           - Project title
    │           - Clear description
    │           - Total amount in XRP
    │           - Milestone breakdown
    │                  │
    │           ┌──────┴──────┐
    │           │ INVALID     │ VALID
    │           │ (Skip)      ▼
    │           │      [6] PROJECT DEPLOYMENT
    │           │           Backend deploys project on blockchain
    │           │                  │
    │           │                  ▼
    │           │      [7] USER NOTIFICATION
    │           │           Send DM to tweet author with:
    │           │           - Project link
    │           │           - Login instructions
    │           │                  │
    │           │                  ▼
    │           │      [7.1] WALLET CHECK
    │           │           User has wallet?
    │           │                  │
    │           │           ┌──────┴──────┐
    │           │           │ NO          │ YES
    │           │           ▼             │
    │           │    Dynamic Wallet       │
    │           │    Auto-creation        │
    │           │           │             │
    │           │           └──────┬──────┘
    │           │                  ▼
    │           │      [8] PROJECT MANAGEMENT
    │           │           Admin accesses project page:
    │           │           - Forum system
    │           │           - Add posts
    │           │           - Add files
    │           │           - Add pictures
    │           │                  │
    │           │                  ▼
    │           │      [9] KYC VERIFICATION (Self.xyz)
    │           │           Required before 1st milestone unlock
    │           │           - Verify human identity
    │           │           - zkKYC proof generated
    │           │                  │
    │           │                  ▼
    │           │      [10] FIRST MILESTONE UNLOCK
    │           │           Admin unlocks 1st milestone
    │           │           - Funds released
    │           │           - Activity begins
    │           │                  │
    │           │                  ▼
    │           │      [11] PROOF SUBMISSION
    │           │           Admin adds proof to forum:
    │           │           - Progress updates
    │           │           - Documentation
    │           │           - Photos/videos
    │           │                  │
    │           │                  ▼
    │           │      [12] FUNDER VOTE REQUEST
    │           │           Admin requests vote for next milestone
    │           │                  │
    │           │                  ▼
    │           │      [13] FUNDER VOTING
    │           │           Donors vote to approve/reject
    │           │           Weighted by contribution amount
    │           │                  │
    │           │           ┌──────┴──────┐
    │           │           │ REJECTED    │ APPROVED
    │           │           ▼             ▼
    │           │    (Funds held)   Next milestone unlocked
    │           │                         │
    │           │                  ┌──────┴──────┐
    │           │                  ▼             │
    │           │          [LOOP to Step 11]    │
    │           │          Until all milestones │
    │           │          are complete         │
    └───────────┴─────────────────────┴─────────┘
                         │
                         ▼
              [14] PROJECT COMPLETION
                   All milestones approved
                   Project marked complete
                   AID tokens distributed
```

---

## Step-by-Step Process Details

### Step 1: Tweet Discovery

**Actor:** Random User  
**Platform:** X (Twitter)  
**Action:** User tweets on AidChain's official X page with humanitarian project request

**Example Tweet:**
```
@AidChain Please help! We need funding for "Clean Water Initiative" - 
A water purification project for Village X. Total needed: 5000 XRP.
Milestones:
- M1: Equipment purchase (1500 XRP)
- M2: Installation (2000 XRP)  
- M3: Training local staff (1500 XRP)
#HumanitarianAid #AidChain
```

**Implementation Notes:**
- Tweets should include hashtags: `#HumanitarianAid`, `#AidChain`, or `#CryptoForGood`
- Clear structure helps ElizaOS parsing accuracy

---

### Step 2: Backend Tweet Monitoring

**Actor:** AidChain Backend Service  
**Frequency:** Every 5 minutes  
**Action:** Polls X API for new tweets on AidChain's page

**Technical Implementation:**
```typescript
// backend/src/services/twitterService.ts
class TwitterMonitorService {
  private POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes in ms
  private LIKE_THRESHOLD = 15;
  
  async startMonitoring() {
    setInterval(async () => {
      const tweets = await this.fetchRecentTweets();
      for (const tweet of tweets) {
        if (tweet.public_metrics.like_count >= this.LIKE_THRESHOLD) {
          await this.processHighEngagementTweet(tweet);
        }
      }
    }, this.POLLING_INTERVAL);
  }
}
```

**Configuration:**
- `POLLING_INTERVAL`: 5 minutes (configurable)
- `LIKE_THRESHOLD`: 15 likes (configurable)

---

### Step 3: Like Threshold Check

**Actor:** Backend Service  
**Threshold:** 15 likes (configurable)  
**Action:** Filter tweets based on engagement level

**Purpose:**
- Ensures community validation before processing
- Reduces spam and low-quality requests
- Prioritizes genuine humanitarian needs

**Implementation:**
```typescript
if (tweet.public_metrics.like_count >= LIKE_THRESHOLD) {
  await sendToElizaOS(tweet);
}
```

---

### Step 4: ElizaOS Content Analysis

**Actor:** ElizaOS (AI Service)  
**Action:** Analyze tweet content for project viability

**ElizaOS Responsibilities:**
1. Parse natural language content
2. Extract structured data
3. Validate humanitarian purpose
4. Assess credibility

**API Endpoint:** `POST /api/eliza/parse-tweet`

**Request:**
```json
{
  "tweetUrl": "https://twitter.com/user/status/123456789",
  "tweetContent": "Full tweet text...",
  "metrics": {
    "likes": 25,
    "retweets": 10
  }
}
```

---

### Step 5: Content Validation

**Actor:** ElizaOS  
**Required Elements:**

| Element | Description | Example |
|---------|-------------|---------|
| **Project Title** | Clear, descriptive name | "Clean Water Initiative" |
| **Description** | Detailed explanation of the project | "Water purification for Village X..." |
| **Total Amount (XRP)** | Total funding needed in XRP | 5000 XRP |
| **Milestones** | Breakdown of project phases with amounts | M1: 1500 XRP, M2: 2000 XRP, M3: 1500 XRP |

**Validation Response:**
```json
{
  "isValid": true,
  "parsedData": {
    "title": "Clean Water Initiative",
    "description": "Water purification project for Village X",
    "totalAmount": "5000",
    "currency": "XRP",
    "milestones": [
      { "name": "Equipment purchase", "amount": "1500" },
      { "name": "Installation", "amount": "2000" },
      { "name": "Training local staff", "amount": "1500" }
    ],
    "category": "water",
    "location": "Village X"
  },
  "credibilityScore": 0.85
}
```

**Rejection Criteria:**
- Missing project title
- Vague or unclear description
- No funding amount specified
- No milestone breakdown
- Suspected spam/fraud
- Non-humanitarian purpose

---

### Step 6: Project Deployment

**Actor:** AidChain Backend  
**Action:** Deploy project to blockchain

**Technical Flow:**
```typescript
// backend/src/services/projectDeploymentService.ts
async function deployProject(parsedData: ParsedProjectData) {
  // 1. Upload metadata to IPFS
  const ipfsHash = await ipfsService.uploadJSON({
    ...parsedData,
    source: 'twitter',
    autoCreated: true,
    createdAt: new Date().toISOString()
  });
  
  // 2. Create project on blockchain
  const tx = await aidChainContract.createProject(
    parsedData.title,
    parsedData.description,
    ipfsHash,
    ethers.parseEther(parsedData.totalAmount)
  );
  
  // 3. Create milestones
  for (const milestone of parsedData.milestones) {
    await aidChainContract.createMilestone(
      projectId,
      milestone.name,
      ethers.parseEther(milestone.amount),
      VOTING_DURATION
    );
  }
  
  return { projectId, txHash: tx.hash };
}
```

---

### Step 7: User Notification via DM

**Actor:** Backend Service  
**Platform:** X Direct Message  
**Action:** Send project link and login instructions

**DM Template:**
```
🎉 Great news! Your humanitarian project request has been approved!

Project: "Clean Water Initiative"
Status: Live on AidChain

🔗 Access your project: https://app.aidchain.io/project/{projectId}

To manage your project:
1. Click the link above
2. Connect your wallet (or create one)
3. Complete identity verification
4. Start receiving donations!

Questions? Reply to this message.
```

**Technical Implementation:**
```typescript
// backend/src/services/twitterService.ts
async function notifyProjectCreator(
  twitterUserId: string, 
  projectId: string,
  projectTitle: string
) {
  const projectUrl = `${APP_URL}/project/${projectId}`;
  
  await twitterClient.v2.sendDm(twitterUserId, {
    text: generateNotificationMessage(projectTitle, projectUrl)
  });
}
```

---

### Step 7.1: Wallet Creation (Dynamic)

**Actor:** New User  
**Service:** Dynamic Labs  
**Action:** Auto-create wallet for users without one

**Flow:**
1. User clicks project link
2. Frontend detects no connected wallet
3. Dynamic SDK presents login options:
   - Email login (creates embedded wallet)
   - Social login (Google, Twitter, etc.)
   - Existing wallet (MetaMask, WalletConnect)

**Implementation:**
```typescript
// frontend/src/App.tsx
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';

<DynamicContextProvider
  settings={{
    environmentId: 'your-dynamic-id',
    walletConnectors: [EthereumWalletConnectors],
    eventsCallbacks: {
      onAuthSuccess: async (args) => {
        // User authenticated, wallet ready
        await linkProjectToUser(projectId, args.user.walletAddress);
      }
    }
  }}
>
  <App />
</DynamicContextProvider>
```

**Benefits:**
- No crypto knowledge required
- Seamless onboarding
- Secure wallet management
- Social recovery options

---

### Step 8: Project Management (Admin Forum)

**Actor:** Project Admin (Original Tweet Author)  
**Features:**

| Feature | Description |
|---------|-------------|
| **Forum Posts** | Create updates, announcements, and progress reports |
| **File Uploads** | Attach documents (PDFs, spreadsheets, etc.) |
| **Image Gallery** | Upload photos of project progress |
| **Video Links** | Embed video updates |
| **Comments** | Interact with donors |

**Frontend Implementation:**
```typescript
// frontend/src/pages/ProjectAdmin.tsx
interface ProjectAdminFeatures {
  createPost: (content: string, attachments: File[]) => Promise<void>;
  uploadFiles: (files: File[]) => Promise<string[]>;
  uploadImages: (images: File[]) => Promise<string[]>;
  getForumPosts: () => Promise<ForumPost[]>;
  replyToComment: (postId: string, reply: string) => Promise<void>;
}
```

**Data Storage:**
- Posts and content metadata: IPFS
- File attachments: IPFS
- References: On-chain via IPFS hashes

---

### Step 9: KYC Verification (Self.xyz)

**Actor:** Project Admin  
**Service:** Self Protocol (Self.xyz)  
**Requirement:** Must complete before first milestone unlock

**Purpose:**
- Verify admin is a real human
- Prevent fraud and abuse
- Comply with regulations
- Build donor trust

**zkKYC Benefits:**
- Zero-knowledge proofs
- Privacy preserved
- Only verification status stored on-chain
- No personal data exposed

**Verification Flow:**
```
1. Admin initiates KYC
   └─► Frontend calls Self Protocol API
   
2. Self Protocol verification
   └─► User provides identity documents
   └─► Biometric verification
   
3. zkProof generation
   └─► Self Protocol creates zero-knowledge proof
   
4. On-chain verification
   └─► Smart contract records verified status
   └─► No personal data stored
```

**Implementation:**
```typescript
// frontend/src/services/selfProtocol.ts
async function initiateKYC(walletAddress: string) {
  const response = await selfProtocolAPI.initiateVerification({
    address: walletAddress,
    scope: ['identity', 'liveness'],
    callback: `${APP_URL}/kyc/callback`
  });
  
  return response.verificationUrl;
}

async function onKYCComplete(proof: ZKProof) {
  // Submit proof to smart contract
  await aidChainContract.verifyZKKYC(projectId, proof);
}
```

---

### Step 10: First Milestone Unlock

**Actor:** System/Admin  
**Prerequisite:** KYC verification complete  
**Action:** Release first milestone funds

**Process:**
1. System verifies KYC status on-chain
2. Admin requests first milestone unlock
3. Smart contract releases funds to admin wallet
4. Project activity officially begins

**Smart Contract:**
```solidity
function unlockFirstMilestone(uint256 projectId) external {
    Project storage project = projects[projectId];
    require(project.zkKYCVerified, "KYC not completed");
    require(msg.sender == project.creator, "Not project creator");
    
    Milestone storage milestone = milestones[project.milestoneIds[0]];
    require(!milestone.approved, "Already unlocked");
    
    milestone.approved = true;
    
    // Transfer funds
    payable(project.creator).transfer(milestone.fundingAmount);
    
    emit MilestoneUnlocked(projectId, 0, milestone.fundingAmount);
}
```

---

### Step 11: Proof Submission

**Actor:** Project Admin  
**Action:** Add progress evidence to forum

**Required Proof Types:**

| Type | Description | Format |
|------|-------------|--------|
| **Progress Updates** | Written descriptions of work done | Text/Markdown |
| **Documentation** | Receipts, invoices, contracts | PDF, Images |
| **Photos** | Visual evidence of progress | JPEG, PNG |
| **Videos** | Video updates and evidence | Links (YouTube, etc.) |
| **Third-party Verification** | External validation | Documents, Letters |

**IPFS Upload:**
```typescript
async function submitMilestoneProof(
  milestoneId: string,
  description: string,
  files: File[]
) {
  // Upload files to IPFS
  const fileHashes = await Promise.all(
    files.map(file => ipfsService.uploadFile(file))
  );
  
  // Create proof metadata
  const proofData = {
    milestoneId,
    description,
    files: fileHashes,
    submittedAt: new Date().toISOString()
  };
  
  const proofHash = await ipfsService.uploadJSON(proofData);
  
  // Submit to blockchain
  await aidChainContract.submitMilestoneProof(milestoneId, proofHash);
}
```

---

### Step 12: Funder Vote Request

**Actor:** Project Admin  
**Action:** Request donor vote for next milestone

**Process:**
1. Admin adds sufficient proof to forum
2. Admin clicks "Request Vote" button
3. Smart contract opens voting period
4. All donors are notified

**Implementation:**
```solidity
function requestMilestoneVote(uint256 milestoneId) external {
    Milestone storage milestone = milestones[milestoneId];
    require(msg.sender == projects[milestone.projectId].creator, "Not creator");
    require(bytes(milestone.proofIPFSHash).length > 0, "No proof submitted");
    require(!milestone.votingOpen, "Voting already open");
    
    milestone.votingOpen = true;
    milestone.votingDeadline = block.timestamp + VOTING_DURATION;
    
    emit VotingOpened(milestoneId, milestone.votingDeadline);
}
```

---

### Step 13: Funder Voting

**Actor:** Donors/Funders  
**Mechanism:** Weighted voting by contribution amount

**Voting Rules:**
- Vote weight = Donation amount to project
- Approval threshold: 50% of total votes (configurable)
- Voting period: 7 days (configurable)
- One vote per address per milestone

**Voting Options:**
- ✅ **Approve**: Satisfied with proof, release funds
- ❌ **Reject**: Insufficient proof, hold funds

**Smart Contract:**
```solidity
function voteOnMilestone(uint256 milestoneId, bool approve) external {
    Milestone storage milestone = milestones[milestoneId];
    require(milestone.votingOpen, "Voting not open");
    require(block.timestamp < milestone.votingDeadline, "Voting ended");
    require(!hasVoted[milestoneId][msg.sender], "Already voted");
    
    uint256 voteWeight = getDonorContribution(milestone.projectId, msg.sender);
    require(voteWeight > 0, "Not a donor");
    
    hasVoted[milestoneId][msg.sender] = true;
    
    if (approve) {
        milestone.votesFor += voteWeight;
    } else {
        milestone.votesAgainst += voteWeight;
    }
    
    emit VoteCast(milestoneId, msg.sender, approve, voteWeight);
    
    // Auto-finalize if threshold reached
    _checkAndFinalizeMilestone(milestoneId);
}
```

**Vote Finalization:**
```solidity
function _checkAndFinalizeMilestone(uint256 milestoneId) internal {
    Milestone storage milestone = milestones[milestoneId];
    uint256 totalVotes = milestone.votesFor + milestone.votesAgainst;
    uint256 totalDonations = projects[milestone.projectId].fundsRaised;
    
    // Check if enough participation (>50% of donors voted)
    if (totalVotes >= totalDonations / 2) {
        // Check if approved (>50% positive votes)
        if (milestone.votesFor > milestone.votesAgainst) {
            milestone.approved = true;
            payable(projects[milestone.projectId].creator)
                .transfer(milestone.fundingAmount);
            emit MilestoneApproved(milestoneId);
        } else {
            milestone.rejected = true;
            emit MilestoneRejected(milestoneId);
        }
    }
}
```

---

### Step 14: Loop Until Completion

**Process Repeat:**
After each milestone approval, the cycle continues:

```
Step 11 (Proof) → Step 12 (Vote Request) → Step 13 (Voting) → 
    ↓ (If approved)
Next Milestone → Step 11...
    ↓ (All complete)
Project Completion
```

**Project Completion:**
```solidity
function completeProject(uint256 projectId) external {
    Project storage project = projects[projectId];
    require(_allMilestonesApproved(projectId), "Not all milestones approved");
    
    project.completed = true;
    project.completedAt = block.timestamp;
    
    // Mint bonus AID tokens to creator
    aidToken.mint(project.creator, PROJECT_COMPLETION_REWARD);
    
    emit ProjectCompleted(projectId);
}
```

---

## Implementation Checklist

### Backend Components

- [ ] **Twitter Monitoring Service**
  - [ ] 5-minute polling interval
  - [ ] Like threshold check (15 likes)
  - [ ] Tweet content extraction
  - [ ] DM notification system

- [ ] **ElizaOS Integration**
  - [ ] Tweet parsing endpoint
  - [ ] Content validation logic
  - [ ] Project data extraction
  - [ ] Credibility scoring

- [ ] **Project Deployment Service**
  - [ ] IPFS metadata upload
  - [ ] Blockchain project creation
  - [ ] Milestone creation
  - [ ] User linking

### Frontend Components

- [ ] **Dynamic Wallet Integration**
  - [ ] Login/signup flow
  - [ ] Embedded wallet creation
  - [ ] Social login options

- [ ] **Project Admin Dashboard**
  - [ ] Forum system
  - [ ] Post creation
  - [ ] File upload
  - [ ] Image gallery
  - [ ] Comment system

- [ ] **KYC Integration (Self.xyz)**
  - [ ] Verification initiation
  - [ ] zkProof submission
  - [ ] Status display

- [ ] **Voting Interface**
  - [ ] Vote request button
  - [ ] Voter interface
  - [ ] Results display

### Smart Contract Components

- [ ] **Project Management**
  - [ ] Auto-creation from backend
  - [ ] Milestone management
  - [ ] Fund locking

- [ ] **KYC Verification**
  - [ ] zkKYC proof storage
  - [ ] First milestone unlock gate

- [ ] **Voting System**
  - [ ] Weighted voting
  - [ ] Vote counting
  - [ ] Auto-finalization

---

## Configuration Parameters

| Parameter | Default Value | Description |
|-----------|---------------|-------------|
| `POLLING_INTERVAL` | 5 minutes | Twitter monitoring frequency |
| `LIKE_THRESHOLD` | 15 | Minimum likes to process tweet |
| `VOTING_DURATION` | 7 days | Time window for milestone voting |
| `APPROVAL_THRESHOLD` | 50% | Votes needed to approve |
| `MIN_PARTICIPATION` | 50% | Minimum voter participation |

---

## Error Handling

### Tweet Processing Errors

| Error | Cause | Action |
|-------|-------|--------|
| `INVALID_CONTENT` | Missing required fields | Skip tweet, log for review |
| `DUPLICATE_PROJECT` | Similar project exists | Notify user, suggest merge |
| `SPAM_DETECTED` | Suspicious pattern | Block user, flag for review |

### Blockchain Errors

| Error | Cause | Action |
|-------|-------|--------|
| `INSUFFICIENT_FUNDS` | Not enough for gas | Retry with backend wallet |
| `CONTRACT_REVERT` | Invalid state | Log error, notify admin |
| `KYC_NOT_COMPLETE` | Missing verification | Block milestone unlock |

---

## Security Considerations

1. **Tweet Verification**: Verify tweet authenticity before processing
2. **Rate Limiting**: Prevent spam attacks on endpoints
3. **Admin Verification**: Only verified admins can manage projects
4. **Fund Protection**: Funds locked until milestone approval
5. **Privacy**: zkKYC ensures no personal data exposure

---

## Future Enhancements

1. **Multi-language Support**: Parse tweets in multiple languages
2. **AI Fraud Detection**: Enhanced content analysis
3. **Partial Milestone Approval**: Allow partial fund release
4. **Dispute Resolution**: Arbitration for rejected milestones
5. **Recurring Projects**: Support for ongoing humanitarian efforts

---

## Support

For implementation questions:
- Documentation: https://docs.aidchain.io
- Discord: https://discord.gg/aidchain
- Email: dev@aidchain.io

---

*Last Updated: November 2025*
