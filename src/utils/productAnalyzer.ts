/**
 * Product Analyzer
 * Uses collected onboarding data to analyze products and provide recommendations
 */

import { storage } from './storage'
import { RecommendationEngine } from '@/services/recommendationEngine'
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

    // In a real app, you'd fetch similar products from Amazon API
    // For demo, we'll use sample products
    const alternativeProducts = await this.fetchSimilarProducts(currentProduct)

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
      
      return {
        currentProduct,
        recommendations,
        userPatterns: patterns,
        shouldBuy: this.determineShouldBuy(currentProduct, criteria, patterns),
      }
    }

    return {
      currentProduct,
      recommendations,
      shouldBuy: null,
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
    
    // For demo, return sample similar products
    return [
      {
        id: 'alt-1',
        title: `${product.category} Alternative 1 - Budget Option`,
        price: `$${(product.priceNumeric * 0.7).toFixed(2)}`,
        priceNumeric: product.priceNumeric * 0.7,
        image: product.image,
        category: product.category,
        rating: Math.max(4.0, (product.rating || 4.0) - 0.3),
        features: ['budget-friendly', 'good-value'],
      },
      {
        id: 'alt-2',
        title: `${product.category} Alternative 2 - Premium Quality`,
        price: `$${(product.priceNumeric * 1.2).toFixed(2)}`,
        priceNumeric: product.priceNumeric * 1.2,
        image: product.image,
        category: product.category,
        rating: Math.min(5.0, (product.rating || 4.5) + 0.3),
        features: ['premium', 'high-quality'],
      },
      {
        id: 'alt-3',
        title: `${product.category} Alternative 3 - Eco-Friendly`,
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

