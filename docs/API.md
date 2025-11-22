# AidChain API Documentation

This document describes the AidChain backend API endpoints and blockchain interaction methods.

## Base URL

**Development:** `http://localhost:3001`
**Production:** `https://api.aidchain.io`

## Authentication

Most endpoints don't require authentication. Blockchain interactions require a connected wallet.

## API Endpoints

### Health Check

Check if the backend service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "service": "AidChain Backend"
}
```

---

### ElizaOS - Parse Tweet

Parse a tweet to extract humanitarian project information.

**Endpoint:** `POST /api/eliza/parse-tweet`

**Request Body:**
```json
{
  "tweetUrl": "https://twitter.com/user/status/123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Clean Water Project",
    "description": "Provide clean water to communities in need",
    "fundingGoal": "10",
    "location": "Kenya",
    "category": "water",
    "source": "https://twitter.com/user/status/123456789",
    "parsedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### ElizaOS - Create Project from Tweet

Create a project from parsed tweet data.

**Endpoint:** `POST /api/eliza/create-project`

**Request Body:**
```json
{
  "tweetData": {
    "name": "Clean Water Project",
    "description": "Provide clean water to communities",
    "fundingGoal": "10",
    "location": "Kenya",
    "category": "water"
  }
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "name": "Clean Water Project",
    "description": "Provide clean water to communities",
    "fundingGoal": "10",
    "metadata": {
      "location": "Kenya",
      "category": "water",
      "autoCreated": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  },
  "message": "Project data prepared for blockchain submission"
}
```

---

### Twitter - Start Monitoring

Start monitoring Twitter for humanitarian aid hashtags.

**Endpoint:** `POST /api/twitter/monitor`

**Request Body:**
```json
{
  "hashtags": ["#HumanitarianAid", "#AidChain", "#CryptoForGood"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Monitoring started"
}
```

---

### IPFS Proxy

Proxy IPFS requests to avoid CORS issues.

**Endpoint:** `GET /api/ipfs/:hash`

**Parameters:**
- `hash` - IPFS content hash

**Response:**
Returns the content from IPFS as JSON.

---

## Blockchain Service Methods

These methods are available in the frontend `blockchain.js` service.

### Initialize Connection

```javascript
await blockchainService.initialize()
```

Initializes connection to the blockchain and smart contracts.

---

### Create Project

```javascript
const receipt = await blockchainService.createProject(
  name,           // string
  description,    // string
  ipfsHash,       // string
  fundingGoal     // number (in ETH)
)
```

**Returns:** Transaction receipt

---

### Verify zkKYC

```javascript
const success = await blockchainService.verifyZKKYC(projectId)
```

**Parameters:**
- `projectId` - uint256

**Returns:** boolean

---

### Fund Project

```javascript
const success = await blockchainService.fundProject(
  projectId,  // uint256
  amount      // number (in ETH)
)
```

**Returns:** boolean

---

### Get Project

```javascript
const project = await blockchainService.getProject(projectId)
```

**Returns:**
```javascript
{
  id: "1",
  creator: "0x...",
  name: "Project Name",
  description: "Project Description",
  ipfsHash: "QmXxx...",
  fundingGoal: "10.0",
  fundsRaised: "2.5",
  createdAt: Date,
  active: true,
  zkKYCVerified: true,
  reputationScore: "25"
}
```

---

### Get Project Count

```javascript
const count = await blockchainService.getProjectCount()
```

**Returns:** number

---

### Create Milestone

```javascript
const success = await blockchainService.createMilestone(
  projectId,        // uint256
  description,      // string
  fundingAmount,    // number (in ETH)
  votingDuration    // number (in seconds)
)
```

**Returns:** boolean

---

### Submit Milestone Proof

```javascript
const success = await blockchainService.submitMilestoneProof(
  milestoneId,     // uint256
  proofIPFSHash    // string
)
```

**Returns:** boolean

---

### Vote on Milestone

```javascript
const success = await blockchainService.voteOnMilestone(
  milestoneId,  // uint256
  approve       // boolean
)
```

**Returns:** boolean

---

### Get Project Milestones

```javascript
const milestoneIds = await blockchainService.getProjectMilestones(projectId)
```

**Returns:** Array of milestone IDs

---

### Get Milestone

```javascript
const milestone = await blockchainService.getMilestone(milestoneId)
```

**Returns:**
```javascript
{
  id: "1",
  projectId: "1",
  description: "Milestone Description",
  fundingAmount: "2.5",
  proofIPFSHash: "QmXxx...",
  completed: true,
  approved: false,
  votesFor: "1.5",
  votesAgainst: "0.5",
  votingDeadline: Date
}
```

---

### Get Donor History

```javascript
const history = await blockchainService.getDonorHistory(address)
```

**Returns:**
```javascript
[
  {
    donor: "0x...",
    amount: "1.0",
    timestamp: Date,
    projectId: "1"
  }
]
```

---

### Get Donor Reputation

```javascript
const reputation = await blockchainService.getDonorReputation(address)
```

**Returns:** string (ETH amount)

---

### Get AID Token Balance

```javascript
const balance = await blockchainService.getAIDBalance(address)
```

**Returns:** string (AID token amount)

---

## IPFS Service Methods

### Upload File

```javascript
const hash = await ipfsService.uploadFile(file)
```

**Returns:** IPFS hash

---

### Upload JSON

```javascript
const hash = await ipfsService.uploadJSON(data)
```

**Returns:** IPFS hash

---

### Get File

```javascript
const data = await ipfsService.getFile(hash)
```

**Returns:** File content

---

### Get Gateway URL

```javascript
const url = ipfsService.getGatewayURL(hash)
```

**Returns:** Full IPFS gateway URL

---

### Upload Project Data

```javascript
const { metadataHash, metadata } = await ipfsService.uploadProjectData(
  projectData,  // object
  files         // array of File objects
)
```

**Returns:**
```javascript
{
  metadataHash: "QmXxx...",
  metadata: {
    ...projectData,
    files: [
      {
        name: "document.pdf",
        hash: "QmYyy...",
        url: "https://ipfs.io/ipfs/QmYyy..."
      }
    ],
    timestamp: "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Upload Milestone Proof

```javascript
const { proofHash, proofData } = await ipfsService.uploadMilestoneProof(
  milestoneData,  // object
  files           // array of File objects
)
```

**Returns:** Similar to uploadProjectData

---

## Self Protocol Service Methods

### Initiate Verification

```javascript
const result = await selfProtocolService.initiateVerification(
  address,   // wallet address
  userInfo   // user information object
)
```

---

### Submit Proof

```javascript
const result = await selfProtocolService.submitProof(
  address,  // wallet address
  proof     // zkKYC proof object
)
```

---

### Get Verification Status

```javascript
const status = await selfProtocolService.getVerificationStatus(address)
```

---

### Mock Verification (Development Only)

```javascript
const result = await selfProtocolService.mockVerification(address)
```

**Returns:**
```javascript
{
  success: true,
  verified: true,
  address: "0x...",
  timestamp: 1234567890,
  message: "Mock verification successful"
}
```

---

## Error Codes

### Backend Errors

- `500` - Internal server error
- `400` - Bad request
- `404` - Resource not found

### Blockchain Errors

- `"execution reverted"` - Contract execution failed
- `"insufficient funds"` - Not enough ETH in wallet
- `"user rejected"` - User rejected transaction
- `"network error"` - Network connectivity issue

---

## Rate Limits

**Development:** No rate limits
**Production:** 
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## WebSocket Events (Future)

Future versions will support WebSocket connections for real-time updates:

```javascript
// Subscribe to project updates
socket.emit('subscribe:project', { projectId: 1 })

// Listen for funding events
socket.on('project:funded', (data) => {
  console.log('New donation:', data)
})

// Listen for milestone events
socket.on('milestone:approved', (data) => {
  console.log('Milestone approved:', data)
})
```

---

## SDK Examples

### Creating a Project

```javascript
import { blockchainService, ipfsService } from './services'

async function createProject(projectData, files) {
  // 1. Upload to IPFS
  const { metadataHash } = await ipfsService.uploadProjectData(
    projectData, 
    files
  )
  
  // 2. Create on blockchain
  const receipt = await blockchainService.createProject(
    projectData.name,
    projectData.description,
    metadataHash,
    projectData.fundingGoal
  )
  
  // 3. Get project ID from event
  const event = receipt.logs.find(log => log.eventName === 'ProjectCreated')
  const projectId = event.args.projectId
  
  // 4. Verify zkKYC
  await blockchainService.verifyZKKYC(projectId)
  
  return projectId
}
```

---

### Making a Donation

```javascript
async function donateToProject(projectId, amount) {
  const success = await blockchainService.fundProject(projectId, amount)
  if (success) {
    console.log('Donation successful!')
    // User will receive AID tokens automatically
  }
}
```

---

### Voting on Milestone

```javascript
async function voteOnMilestone(milestoneId, approve) {
  // Check if user is a donor
  const project = await blockchainService.getProject(projectId)
  const myAddress = await signer.getAddress()
  
  // Vote
  const success = await blockchainService.voteOnMilestone(
    milestoneId, 
    approve
  )
  
  return success
}
```

---

## Support

For API support:
- Email: api@aidchain.io
- Documentation: https://docs.aidchain.io
- Discord: https://discord.gg/aidchain
