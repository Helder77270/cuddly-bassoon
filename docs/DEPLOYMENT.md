# AidChain Deployment Guide

This guide provides step-by-step instructions for deploying the AidChain platform.

## Prerequisites

Before deploying, ensure you have:

- Node.js v18+ installed
- npm or yarn package manager
- MetaMask wallet with Accelar testnet tokens
- Access to the following services:
  - Infura or Pinata account (for IPFS)
  - Dynamic Labs account (for wallet authentication)
  - Self Protocol API access (for zkKYC)
  - Twitter Developer account (optional, for ElizaOS)
  - OpenAI API key (optional, for ElizaOS)

## Step 1: Clone and Setup

```bash
git clone https://github.com/Helder77270/cuddly-bassoon.git
cd cuddly-bassoon
```

## Step 2: Smart Contract Deployment

### 2.1 Install Dependencies
```bash
cd contracts
npm install
```

### 2.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
```env
ACCELAR_RPC_URL=https://rpc-testnet.accelar.io
PRIVATE_KEY=your_deployer_private_key_here
```

### 2.3 Compile Contracts
```bash
npm run compile
```

### 2.4 Deploy to Accelar Testnet
```bash
npm run deploy:testnet
```

**Important:** Save the contract addresses from the deployment output:
- AID Token Address: `0x...`
- AidChain Contract Address: `0x...`

You'll need these for frontend and backend configuration.

## Step 3: Backend Service Setup

### 3.1 Install Dependencies
```bash
cd ../backend
npm install
```

### 3.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=3001

# Contract Addresses (from Step 2.4)
AIDCHAIN_ADDRESS=0x...
AIDTOKEN_ADDRESS=0x...

# Accelar Network
ACCELAR_RPC_URL=https://rpc-testnet.accelar.io
PRIVATE_KEY=your_private_key

# Twitter API (Optional - for ElizaOS)
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret

# OpenAI (Optional - for ElizaOS AI parsing)
OPENAI_API_KEY=your_openai_api_key

# IPFS
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret

# Self Protocol
SELF_PROTOCOL_API_KEY=your_self_protocol_api_key
```

### 3.3 Start Backend Server
```bash
npm run dev
```

The backend should now be running on `http://localhost:3001`

## Step 4: Frontend Deployment

### 4.1 Install Dependencies
```bash
cd ../frontend
npm install
```

### 4.2 Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Contract Addresses (from Step 2.4)
VITE_AIDCHAIN_ADDRESS=0x...
VITE_AIDTOKEN_ADDRESS=0x...

# Dynamic Labs (Wallet Authentication)
VITE_DYNAMIC_ENV_ID=your_dynamic_environment_id

# IPFS Configuration
VITE_IPFS_PROJECT_ID=your_infura_project_id
VITE_IPFS_PROJECT_SECRET=your_infura_project_secret
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Self Protocol
VITE_SELF_PROTOCOL_API=https://api.selfprotocol.io
VITE_SELF_PROTOCOL_API_KEY=your_self_protocol_api_key

# Backend API
VITE_BACKEND_API=http://localhost:3001
```

### 4.3 Development Server
```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000`

### 4.4 Production Build
```bash
npm run build
```

The production build will be in the `dist/` directory.

## Step 5: Service Configuration

### 5.1 Dynamic Labs Setup

1. Go to [Dynamic Labs Dashboard](https://app.dynamic.xyz/)
2. Create a new project
3. Add Accelar network to supported chains
4. Copy your Environment ID to frontend `.env`
5. Configure wallet connectors (MetaMask, WalletConnect, etc.)

### 5.2 IPFS Setup (Infura)

1. Go to [Infura](https://infura.io/)
2. Create an IPFS project
3. Copy Project ID and Project Secret
4. Add to frontend and backend `.env` files

### 5.3 Self Protocol Setup

1. Contact Self Protocol for API access
2. Obtain API key
3. Add to configuration files
4. Follow their documentation for zkKYC integration

### 5.4 Twitter API Setup (Optional)

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Generate Bearer Token and API credentials
4. Add to backend `.env`

### 5.5 OpenAI Setup (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create API key
3. Add to backend `.env`

## Step 6: Verification

### 6.1 Test Smart Contracts
```bash
cd contracts
npm test
```

### 6.2 Test Backend
```bash
cd backend
curl http://localhost:3001/health
# Should return: {"status":"ok","service":"AidChain Backend"}
```

### 6.3 Test Frontend
- Open browser to `http://localhost:3000`
- Connect wallet
- Try creating a test project

## Step 7: Production Deployment

### 7.1 Frontend (Vercel/Netlify)

**Vercel:**
```bash
npm install -g vercel
cd frontend
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod
```

### 7.2 Backend (Heroku/Railway)

**Heroku:**
```bash
heroku create aidchain-backend
cd backend
git push heroku main
```

**Railway:**
1. Connect GitHub repository
2. Select backend directory
3. Configure environment variables
4. Deploy

### 7.3 Update Frontend Configuration

After deploying backend, update frontend `.env`:
```env
VITE_BACKEND_API=https://your-backend-url.com
```

Rebuild and redeploy frontend.

## Step 8: Post-Deployment

### 8.1 Initialize Twitter Monitoring
```bash
curl -X POST http://your-backend-url.com/api/twitter/monitor \
  -H "Content-Type: application/json" \
  -d '{"hashtags": ["#HumanitarianAid", "#AidChain"]}'
```

### 8.2 Verify Contract on Explorer
```bash
cd contracts
npx hardhat verify --network accelarTestnet DEPLOYED_CONTRACT_ADDRESS
```

### 8.3 Test End-to-End Flow
1. Connect wallet
2. Complete zkKYC verification
3. Create a test project
4. Make a donation
5. Create and approve a milestone
6. Check leaderboard

## Troubleshooting

### Issue: Cannot connect to Accelar network
**Solution:** Ensure MetaMask has Accelar testnet configured:
- Network Name: Accelar Testnet
- RPC URL: https://rpc-testnet.accelar.io
- Chain ID: (Check Accelar documentation)
- Currency Symbol: ETH

### Issue: IPFS upload fails
**Solution:** 
- Verify Infura credentials
- Check IPFS project is active
- Ensure proper authorization headers

### Issue: Transaction fails
**Solution:**
- Check you have enough testnet tokens
- Verify contract addresses are correct
- Check gas price settings

### Issue: Frontend can't connect to contracts
**Solution:**
- Verify contract addresses in `.env`
- Ensure ABI files are correct
- Check wallet is connected to correct network

## Security Checklist

Before production:
- [ ] Change all default passwords and keys
- [ ] Use hardware wallet for deployment
- [ ] Enable contract verification
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting
- [ ] Enable CORS properly
- [ ] Use environment variables for all secrets
- [ ] Set up backup systems
- [ ] Enable logging
- [ ] Test emergency shutdown procedures

## Monitoring

### Recommended Tools
- **Smart Contracts:** Tenderly, Etherscan
- **Backend:** New Relic, DataDog
- **Frontend:** Vercel Analytics, Google Analytics
- **Uptime:** UptimeRobot, Pingdom

### Key Metrics to Monitor
- Transaction success rate
- Average gas costs
- API response times
- User activity
- Error rates
- Contract balance

## Maintenance

### Regular Tasks
- Monitor contract balance
- Check for failed transactions
- Review error logs
- Update dependencies
- Backup database (if applicable)
- Review user feedback

### Updates
- Test updates on testnet first
- Use upgradeable proxy patterns for contracts
- Maintain changelog
- Communicate changes to users

## Support

For deployment support:
- Email: devops@aidchain.io
- Discord: [AidChain Community](https://discord.gg/aidchain)
- Documentation: https://docs.aidchain.io

## Next Steps

After successful deployment:
1. Add your dApp to Accelar ecosystem list
2. Submit for audit (recommended)
3. Create tutorial videos
4. Launch marketing campaign
5. Engage with humanitarian organizations
6. Build community on social media

---

Congratulations! Your AidChain platform is now deployed and ready to change the world! 🎉
