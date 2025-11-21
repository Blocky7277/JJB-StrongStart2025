/**
 * Product Analyzer
 * Uses collected onboarding data to analyze products and provide recommendations
 * Now powered by Gemini AI for intelligent analysis
 */

import { storage } from './storage'
import { RecommendationEngine } from '@/services/recommendationEngine'
import { GeminiService } from '@/services/geminiService'
import { PerplexityService } from '@/services/perplexityService'
import { Product } from '@/types/onboarding'

export class ProductAnalyzer {
  /**
   * Analyze a product the user is viewing and provide recommendations
   */
  static async analyzeProduct(currentProduct: Product) {
    const criteria = await storage.getRecommendationCriteria()
    
    if (!criteria) {
      console.log('No user preferences found. Complete onboarding first.')
      return null
    }

    // Fetch similar products using Perplexity AI
    let alternativeProducts: Product[] = []
    try {
      console.log('🔍 Searching for similar products with Perplexity...')
      console.log('   Product:', currentProduct.title)
      console.log('   Category:', currentProduct.category)
      const userPreferences = await storage.getPreferences()
      if (userPreferences) {
        const patterns = RecommendationEngine.analyzeSwipePatterns(userPreferences)
        alternativeProducts = await PerplexityService.searchSimilarProducts(
          currentProduct,
          criteria,
          patterns
        )
        if (alternativeProducts.length > 0) {
          console.log(`✅ Found ${alternativeProducts.length} products from Perplexity`)
          alternativeProducts.forEach((p, idx) => {
            console.log(`   ${idx + 1}. ${p.title} - ${p.price}`)
          })
        } else {
          console.warn('⚠️ Perplexity returned 0 products')
        }
      }
    } catch (error) {
      console.error('❌ Perplexity search failed:', error)
      if (error instanceof Error) {
        console.error('   Error message:', error.message)
        console.error('   Stack:', error.stack)
      } 
    }
    
    // Fallback to mock products if Perplexity returns nothing
    if (alternativeProducts.length === 0) {
      console.log('📦 Using fallback mock products (Perplexity not available or returned no results)')
      alternativeProducts = await this.fetchSimilarProducts(currentProduct)
      console.log(`   Generated ${alternativeProducts.length} mock alternatives`)
    }

    // Find better alternatives
    const recommendations = RecommendationEngine.findBetterAlternatives(
      currentProduct,
      alternativeProducts,
      criteria
    )

    // Analyze user patterns
    const userPreferences = await storage.getPreferences()
    if (userPreferences) {
      const patterns = RecommendationEngine.analyzeSwipePatterns(userPreferences)
      
      // Use Gemini for AI-powered match score analysis
      let shouldBuy
      let usingGemini = false
      try {
        console.log('🤖 Calling Gemini for match score analysis...')
        console.log('   Product:', currentProduct.title)
        console.log('   Price:', currentProduct.price)
        const geminiAnalysis = await GeminiService.analyzeMatchScore(
          currentProduct,
          criteria,
          patterns
        )
        usingGemini = true
        console.log('✅ Gemini match score received:')
        console.log('   Recommendation:', geminiAnalysis.recommendation)
        console.log('   Score:', (geminiAnalysis.score * 100).toFixed(1) + '%')
        console.log('   Confidence:', geminiAnalysis.confidence ? (geminiAnalysis.confidence * 100).toFixed(1) + '%' : 'N/A')
        console.log('   Reasons:', geminiAnalysis.reasons.length)
        shouldBuy = {
          recommendation: geminiAnalysis.recommendation,
          reasons: geminiAnalysis.reasons,
          score: geminiAnalysis.score,
          confidence: geminiAnalysis.confidence,
          breakdown: geminiAnalysis.breakdown,
        }
      } catch (error) {
        console.error('❌ Gemini analysis failed:', error)
        if (error instanceof Error) {
          console.error('   Error message:', error.message)
          console.error('   Stack:', error.stack)
        }
        console.log('📊 Using fallback rule-based analysis')
        // Fallback to rule-based analysis
        shouldBuy = this.determineShouldBuy(currentProduct, criteria, patterns)
      }
      
      if (!usingGemini) {
        console.warn('⚠️ Using fallback analysis (not AI-powered). Check Gemini API key and configuration.')
      }
      
      // Use Gemini for alternative analysis if available
      let aiRecommendations = recommendations
      try {
        if (alternativeProducts.length > 0) {
          console.log('🤖 Calling Gemini for alternative analysis...')
          const geminiAlternatives = await GeminiService.analyzeAlternatives(
            currentProduct,
            alternativeProducts,
            criteria
          )
          console.log(`✅ Gemini analyzed ${geminiAlternatives.length} alternatives`)
          // Convert Gemini results to ProductRecommendation format
          aiRecommendations = geminiAlternatives.map((alt) => ({
            product: alt.product,
            score: alt.score,
            reasons: alt.reasons,
            savings: alt.savings,
          }))
        }
      } catch (error) {
        console.warn('⚠️ Gemini alternative analysis failed, using rule-based recommendations:', error)
        // Keep original recommendations from RecommendationEngine
      }
      
      console.log(`📊 Final recommendations: ${aiRecommendations.length} alternatives`)
      aiRecommendations.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.product.title} - ${rec.product.price} (${(rec.score * 100).toFixed(1)}% match)`)
      })
      
      // Generate insights - this may fail, but we'll handle it
      let insights = null
      try {
        insights = await this.generateInsights(currentProduct, criteria, patterns, alternativeProducts)
        console.log('📊 Generated insights successfully')
      } catch (error) {
        console.error('❌ Insights generation failed completely:', error)
        // Continue without insights - modal will still show other analysis
        insights = null
      }
      
      return {
        currentProduct,
        recommendations: aiRecommendations,
        userPatterns: patterns,
        shouldBuy,
        insights,
      }
    }

    // Even without userPreferences, we can still provide basic analysis
    return {
      currentProduct,
      recommendations,
      shouldBuy: null,
      insights: null, // No insights without user preferences
    }
  }

  /**
   * Determine if user should buy this product based on their preferences
   */
  private static determineShouldBuy(
    product: Product,
    criteria: any,
    patterns: any
  ): {
    recommendation: 'buy' | 'consider' | 'skip'
    reasons: string[]
    score: number
  } {
    const reasons: string[] = []
    let score = 0.5 // Start neutral

    // Check price against user's typical spending
    if (patterns.avgLikedPrice > 0) {
      if (product.priceNumeric <= patterns.avgLikedPrice * 1.2) {
        score += 0.2
        reasons.push('✅ Within your typical price range')
      } else {
        score -= 0.2
        reasons.push('⚠️ Above your usual spending')
      }
    }

    // Check quality threshold
    if (product.rating) {
      if (product.rating >= patterns.qualityThreshold) {
        score += 0.15
        reasons.push('✅ Meets your quality standards')
      } else {
        score -= 0.15
        reasons.push('⚠️ Below your usual quality threshold')
      }
    }

    // Check category preferences
    if (patterns.preferredCategories.includes(product.category)) {
      score += 0.15
      reasons.push(`✅ You typically like ${product.category} items`)
    } else if (patterns.avoidedCategories.includes(product.category)) {
      score -= 0.2
      reasons.push(`⚠️ You usually skip ${product.category} items`)
    }

    // Check goal alignment
    if (criteria.userGoals.includes('save-money') && product.priceNumeric > 100) {
      score -= 0.1
      reasons.push('⚠️ May not align with "Save Money" goal')
    }

    if (criteria.userGoals.includes('quality-first') && product.rating && product.rating >= 4.5) {
      score += 0.1
      reasons.push('✅ High quality matches your goal')
    }

    if (criteria.userGoals.includes('eco-friendly')) {
      const isEco = product.title.toLowerCase().includes('eco') ||
                    product.title.toLowerCase().includes('organic') ||
                    product.title.toLowerCase().includes('sustainable')
      if (isEco) {
        score += 0.1
        reasons.push('✅ Eco-friendly option')
      }
    }

    // Determine recommendation
    let recommendation: 'buy' | 'consider' | 'skip'
    if (score >= 0.7) {
      recommendation = 'buy'
    } else if (score >= 0.4) {
      recommendation = 'consider'
    } else {
      recommendation = 'skip'
    }

    return {
      recommendation,
      reasons,
      score: Math.max(0, Math.min(1, score)), // Clamp between 0-1
    }
  }

  /**
   * Fetch similar products (mock for demo - replace with real API call)
   */
  private static async fetchSimilarProducts(product: Product): Promise<Product[]> {
    // In production, this would call Amazon Product Advertising API
    // or scrape Amazon pages for similar products
    
    // Generate more realistic product names based on the target product
    const baseName = product.title.split(' ').slice(0, 3).join(' ') // Get first few words
    
    // For demo, return sample similar products with more realistic names
    return [
      {
        id: 'alt-1',
        title: `${baseName} - Budget-Friendly Option`,
        price: `$${(product.priceNumeric * 0.7).toFixed(2)}`,
        priceNumeric: product.priceNumeric * 0.7,
        image: product.image,
        category: product.category,
        rating: Math.max(4.0, (product.rating || 4.0) - 0.3),
        features: ['budget-friendly', 'good-value'],
      },
      {
        id: 'alt-2',
        title: `${baseName} - Premium Edition`,
        price: `$${(product.priceNumeric * 1.2).toFixed(2)}`,
        priceNumeric: product.priceNumeric * 1.2,
        image: product.image,
        category: product.category,
        rating: Math.min(5.0, (product.rating || 4.5) + 0.3),
        features: ['premium', 'high-quality'],
      },
      {
        id: 'alt-3',
        title: `${baseName} - Eco-Friendly Version`,
        price: `$${(product.priceNumeric * 0.9).toFixed(2)}`,
        priceNumeric: product.priceNumeric * 0.9,
        image: product.image,
        category: product.category,
        rating: product.rating || 4.5,
        features: ['eco-friendly', 'sustainable', 'organic'],
      },
    ]
  }

  /**
   * Generate AI-powered product insights
   */
  private static async generateInsights(
    product: Product,
    criteria: any,
    patterns: any,
    alternatives: Product[]
  ) {
    try {
      console.log('🤖 Calling Gemini for product insights...')
      console.log('   Product:', product.title)
      console.log('   Criteria:', JSON.stringify(criteria, null, 2))
      console.log('   Patterns:', JSON.stringify(patterns, null, 2))
      console.log('   Alternatives count:', alternatives.length)
      
      const insights = await GeminiService.generateProductInsights(
        product,
        criteria,
        patterns,
        alternatives
      )
      
      console.log('✅ Gemini insights received:', {
        hasSummary: !!insights?.summary,
        strengthsCount: insights?.strengths?.length || 0,
        concernsCount: insights?.concerns?.length || 0,
        hasValueAssessment: !!insights?.valueAssessment,
        hasRecommendation: !!insights?.recommendation,
        fullInsights: insights
      })
      
      // Validate insights structure
      if (!insights || typeof insights !== 'object') {
        throw new Error('Invalid insights structure received from Gemini')
      }
      
      if (!insights.summary || !insights.strengths || !insights.concerns) {
        console.warn('⚠️ Insights missing required fields:', insights)
        throw new Error('Insights missing required fields')
      }
      
      return insights
    } catch (error) {
      console.error('❌ Failed to generate Gemini insights:', error)
      if (error instanceof Error) {
        console.error('   Error message:', error.message)
        console.error('   Error stack:', error.stack)
      }
      // Re-throw to let caller handle - don't use fallback
      throw error
    }
  }


  /**
   * Get a summary of user preferences for display
   */
  static async getUserPreferenceSummary() {
    const preferences = await storage.getPreferences()
    if (!preferences) return null

    const patterns = RecommendationEngine.analyzeSwipePatterns(preferences)

    return {
      goals: preferences.goals,
      priceSensitivity: preferences.priceSensitivity.level,
      avgPriceRange: patterns.avgLikedPrice,
      favoriteCategories: patterns.preferredCategories,
      qualityThreshold: patterns.qualityThreshold,
      totalProducts: preferences.likedProducts.length + preferences.dislikedProducts.length,
      likeRate: (preferences.likedProducts.length / 
                (preferences.likedProducts.length + preferences.dislikedProducts.length)) * 100,
    }
  }
}

// Example usage:
// const analysis = await ProductAnalyzer.analyzeProduct(currentProduct)
// console.log(analysis.recommendations)
// console.log(analysis.shouldBuy)

