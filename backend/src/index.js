const express = require('express')
const cors = require('cors')
require('dotenv').config()

const elizaService = require('./services/elizaService')
const twitterService = require('./services/twitterService')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AidChain Backend' })
})

// ElizaOS endpoints
app.post('/api/eliza/parse-tweet', async (req, res) => {
  try {
    const { tweetUrl } = req.body
    const result = await elizaService.parseTweet(tweetUrl)
    res.json(result)
  } catch (error) {
    console.error('Error parsing tweet:', error)
    res.status(500).json({ error: 'Failed to parse tweet' })
  }
})

app.post('/api/eliza/create-project', async (req, res) => {
  try {
    const { tweetData } = req.body
    const result = await elizaService.createProjectFromTweet(tweetData)
    res.json(result)
  } catch (error) {
    console.error('Error creating project from tweet:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
})

// Twitter monitoring
app.post('/api/twitter/monitor', async (req, res) => {
  try {
    const { hashtags } = req.body
    twitterService.startMonitoring(hashtags)
    res.json({ success: true, message: 'Monitoring started' })
  } catch (error) {
    console.error('Error starting Twitter monitoring:', error)
    res.status(500).json({ error: 'Failed to start monitoring' })
  }
})

// IPFS proxy endpoints
app.get('/api/ipfs/:hash', async (req, res) => {
  try {
    const { hash } = req.params
    // Proxy IPFS requests to avoid CORS issues
    const axios = require('axios')
    const response = await axios.get(`https://ipfs.io/ipfs/${hash}`)
    res.json(response.data)
  } catch (error) {
    console.error('Error fetching from IPFS:', error)
    res.status(500).json({ error: 'Failed to fetch from IPFS' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`AidChain Backend running on port ${PORT}`)
  console.log('ElizaOS integration active')
  console.log('Twitter monitoring ready')
})

module.exports = app
