const { OpenAI } = require('openai')

/**
 * ElizaOS Service
 * Simulates ElizaOS integration for parsing tweets and automatically creating projects
 */
class ElizaService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  /**
   * Parse a tweet to extract humanitarian project information
   */
  async parseTweet(tweetUrl) {
    try {
      // In production, this would fetch the actual tweet
      // For now, we'll simulate the parsing
      
      const tweetContent = "We need urgent help to provide clean water to 5,000 families in rural Kenya. Estimated cost: 10 ETH. #HumanitarianAid #CleanWater"
      
      // Use AI to extract structured data from the tweet
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that extracts structured humanitarian project information from tweets. 
            Extract the following fields if available: project name, description, funding goal, location, category.
            Return the result as a JSON object.`
          },
          {
            role: "user",
            content: `Parse this tweet: "${tweetContent}"`
          }
        ],
        temperature: 0.3
      })

      const parsedData = JSON.parse(completion.choices[0].message.content)
      
      return {
        success: true,
        data: {
          name: parsedData.name || 'Humanitarian Project',
          description: parsedData.description || tweetContent,
          fundingGoal: parsedData.fundingGoal || '10',
          location: parsedData.location || 'Unknown',
          category: parsedData.category || 'humanitarian',
          source: tweetUrl,
          parsedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Error in parseTweet:', error)
      
      // Fallback to basic parsing
      return {
        success: true,
        data: {
          name: 'Clean Water Project',
          description: 'Provide clean water to communities in need',
          fundingGoal: '10',
          location: 'Kenya',
          category: 'water',
          source: tweetUrl,
          parsedAt: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Create a project from parsed tweet data
   */
  async createProjectFromTweet(tweetData) {
    try {
      // This would integrate with the blockchain service
      // to automatically create a project from the parsed tweet data
      
      const projectData = {
        name: tweetData.name,
        description: tweetData.description,
        fundingGoal: tweetData.fundingGoal,
        metadata: {
          location: tweetData.location,
          category: tweetData.category,
          source: tweetData.source,
          autoCreated: true,
          createdAt: new Date().toISOString()
        }
      }

      return {
        success: true,
        project: projectData,
        message: 'Project data prepared for blockchain submission'
      }
    } catch (error) {
      console.error('Error in createProjectFromTweet:', error)
      throw error
    }
  }

  /**
   * Analyze project sentiment and credibility
   */
  async analyzeProjectCredibility(projectDescription) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI that analyzes humanitarian project descriptions for credibility and sentiment. Rate credibility from 0-100 and provide a brief analysis."
          },
          {
            role: "user",
            content: `Analyze this project: "${projectDescription}"`
          }
        ],
        temperature: 0.3
      })

      return {
        success: true,
        analysis: completion.choices[0].message.content
      }
    } catch (error) {
      console.error('Error in analyzeProjectCredibility:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Generate project recommendations
   */
  async generateRecommendations(userDonationHistory) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI that recommends humanitarian projects based on user donation history. Provide personalized recommendations."
          },
          {
            role: "user",
            content: `User donation history: ${JSON.stringify(userDonationHistory)}`
          }
        ],
        temperature: 0.7
      })

      return {
        success: true,
        recommendations: completion.choices[0].message.content
      }
    } catch (error) {
      console.error('Error in generateRecommendations:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

module.exports = new ElizaService()
