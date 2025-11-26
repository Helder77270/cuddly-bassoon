import { TwitterApi, TweetV2 } from 'twitter-api-v2';
import elizaService from './elizaService';
import { Tweet, CreateProjectResult } from '../types';

/**
 * Twitter Service
 * Monitors Twitter for humanitarian aid requests and automatically creates projects
 */
class TwitterService {
  private client: TwitterApi | null = null;
  private isMonitoring: boolean = false;
  private monitoredHashtags: string[] = [];
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (process.env.TWITTER_BEARER_TOKEN) {
      this.client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
    }
  }

  /**
   * Start monitoring Twitter for specific hashtags
   */
  async startMonitoring(hashtags: string[] = ['#HumanitarianAid', '#AidChain', '#CryptoForGood']): Promise<void> {
    if (!this.client) {
      console.warn('Twitter client not initialized. Set TWITTER_BEARER_TOKEN in .env');
      return;
    }

    if (this.isMonitoring) {
      console.log('Already monitoring Twitter');
      return;
    }

    this.monitoredHashtags = hashtags;
    this.isMonitoring = true;

    console.log(`Started monitoring Twitter for hashtags: ${hashtags.join(', ')}`);

    // In production, this would use Twitter's streaming API
    // For now, we'll simulate periodic checks
    this.monitorInterval = setInterval(async () => {
      await this.checkForNewTweets();
    }, 60000); // Check every minute
  }

  /**
   * Stop monitoring Twitter
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      this.isMonitoring = false;
      console.log('Stopped monitoring Twitter');
    }
  }

  /**
   * Check for new tweets with monitored hashtags
   */
  async checkForNewTweets(): Promise<void> {
    try {
      // In production, this would actually query Twitter API
      // For now, we'll simulate finding tweets
      console.log('Checking for new humanitarian aid tweets...');

      // Simulate finding a tweet
      const simulatedTweets: Tweet[] = [
        {
          id: '1234567890',
          text: 'We need help providing medical supplies to 1000 families in Haiti. Goal: 5 ETH #HumanitarianAid',
          author: 'humanitarian_org',
          created_at: new Date().toISOString()
        }
      ];

      for (const tweet of simulatedTweets) {
        await this.processHumanitarianTweet(tweet);
      }
    } catch (error) {
      console.error('Error checking tweets:', error);
    }
  }

  /**
   * Process a humanitarian tweet and create a project
   */
  async processHumanitarianTweet(tweet: Tweet): Promise<CreateProjectResult | undefined> {
    try {
      console.log(`Processing tweet: ${tweet.id}`);

      // Parse tweet using ElizaOS
      const tweetUrl = `https://twitter.com/${tweet.author}/status/${tweet.id}`;
      const parsedData = await elizaService.parseTweet(tweetUrl);

      if (parsedData.success) {
        // Create project from parsed data
        const projectData = await elizaService.createProjectFromTweet(parsedData.data);

        console.log('Auto-created project from tweet:', projectData);

        // In production, this would trigger blockchain transaction
        // to create the project on-chain

        return projectData;
      }
    } catch (error) {
      console.error('Error processing tweet:', error);
    }
    return undefined;
  }

  /**
   * Search tweets by keyword
   */
  async searchTweets(query: string, maxResults: number = 10): Promise<TweetV2[]> {
    if (!this.client) {
      throw new Error('Twitter client not initialized');
    }

    try {
      const tweets = await this.client.v2.search(query, {
        max_results: maxResults,
        'tweet.fields': ['created_at', 'author_id', 'text']
      });

      return tweets.data?.data || [];
    } catch (error) {
      console.error('Error searching tweets:', error);
      return [];
    }
  }

  /**
   * Get tweet by ID
   */
  async getTweetById(tweetId: string): Promise<TweetV2 | null> {
    if (!this.client) {
      throw new Error('Twitter client not initialized');
    }

    try {
      const tweet = await this.client.v2.singleTweet(tweetId, {
        'tweet.fields': ['created_at', 'author_id', 'text']
      });

      return tweet.data;
    } catch (error) {
      console.error('Error getting tweet:', error);
      return null;
    }
  }
}

export default new TwitterService();
