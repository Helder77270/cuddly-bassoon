import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import { create, IPFSHTTPClient } from 'ipfs-http-client';
import axios from 'axios';
import 'dotenv/config';

import elizaService from './services/elizaService';
import twitterService from './services/twitterService';
import { HealthCheckResponse, ErrorResponse, ParsedTweetData } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Validate IPFS credentials
const IPFS_PROJECT_ID = process.env.IPFS_PROJECT_ID;
const IPFS_PROJECT_SECRET = process.env.IPFS_PROJECT_SECRET;

if (!IPFS_PROJECT_ID || !IPFS_PROJECT_SECRET) {
  console.warn('Warning: IPFS_PROJECT_ID or IPFS_PROJECT_SECRET not set. IPFS uploads will fail.');
}

// Initialize IPFS client (server-side only for security)
const ipfsClient: IPFSHTTPClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: IPFS_PROJECT_ID && IPFS_PROJECT_SECRET
      ? `Basic ${Buffer.from(`${IPFS_PROJECT_ID}:${IPFS_PROJECT_SECRET}`).toString('base64')}`
      : '',
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response<HealthCheckResponse>) => {
  res.json({ status: 'ok', service: 'AidChain Backend' });
});

// ElizaOS endpoints
app.post('/api/eliza/parse-tweet', async (req: Request<object, object, { tweetUrl: string }>, res: Response) => {
  try {
    const { tweetUrl } = req.body;
    const result = await elizaService.parseTweet(tweetUrl);
    res.json(result);
  } catch (error) {
    console.error('Error parsing tweet:', error);
    res.status(500).json({ error: 'Failed to parse tweet' } as ErrorResponse);
  }
});

app.post('/api/eliza/create-project', async (req: Request<object, object, { tweetData: ParsedTweetData }>, res: Response) => {
  try {
    const { tweetData } = req.body;
    const result = await elizaService.createProjectFromTweet(tweetData);
    res.json(result);
  } catch (error) {
    console.error('Error creating project from tweet:', error);
    res.status(500).json({ error: 'Failed to create project' } as ErrorResponse);
  }
});

// Twitter monitoring
app.post('/api/twitter/monitor', async (req: Request<object, object, { hashtags?: string[] }>, res: Response) => {
  try {
    const { hashtags } = req.body;
    twitterService.startMonitoring(hashtags);
    res.json({ success: true, message: 'Monitoring started' });
  } catch (error) {
    console.error('Error starting Twitter monitoring:', error);
    res.status(500).json({ error: 'Failed to start monitoring' } as ErrorResponse);
  }
});

// IPFS upload endpoints (secure - credentials on backend only)
app.post('/api/ipfs/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' } as ErrorResponse);
    }
    
    const added = await ipfsClient.add(req.file.buffer);
    res.json({ hash: added.path });
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    res.status(500).json({ error: 'Failed to upload to IPFS' } as ErrorResponse);
  }
});

app.post('/api/ipfs/upload-json', async (req: Request<object, object, { data: unknown }>, res: Response) => {
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'No data provided' } as ErrorResponse);
    }
    
    const jsonString = JSON.stringify(data);
    const added = await ipfsClient.add(jsonString);
    res.json({ hash: added.path });
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    res.status(500).json({ error: 'Failed to upload JSON to IPFS' } as ErrorResponse);
  }
});

// IPFS proxy endpoint
app.get('/api/ipfs/:hash', async (req: Request<{ hash: string }>, res: Response) => {
  try {
    const { hash } = req.params;
    // Proxy IPFS requests to avoid CORS issues
    const response = await axios.get(`https://ipfs.io/ipfs/${hash}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    res.status(500).json({ error: 'Failed to fetch from IPFS' } as ErrorResponse);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`AidChain Backend running on port ${PORT}`);
  console.log('ElizaOS integration active');
  console.log('Twitter monitoring ready');
});

export default app;
