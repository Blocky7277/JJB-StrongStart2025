import {
  Product,
  UserPreferences,
  ProductRecommendation,
  RecommendationCriteria,
} from '@/types/onboarding'

/**
 * Recommendation Engine
 * Analyzes user preferences and finds better alternatives for products
 */
export class RecommendationEngine {
  /**
   * Find similar products that are more cost-effective or better aligned with user goals
   */
  static findBetterAlternatives(
    targetProduct: Product,
    allProducts: Product[],
    criteria: RecommendationCriteria
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = []

    for (const product of allProducts) {
      // Skip the same product
      if (product.id === targetProduct.id) continue

      // Check if it's in the same category or similar
      const isSimilar = this.calculateSimilarity(targetProduct, product)
      if (isSimilar < 0.3) continue // Not similar enough

      const score = this.calculateRecommendationScore(
        product,
        targetProduct,
        criteria
      )

      const reasons = this.generateReasons(
        product,
        targetProduct,
        criteria
      )

      const savings = this.calculateSavings(product, targetProduct)

      if (score > 0.5) {
        // Only recommend if score is decent
        recommendations.push({
          product,
          score,
          reasons,
          savings: savings > 0 ? savings : undefined,
          betterMatch: this.getBetterMatches(product, targetProduct, criteria),
        })
      }
    }

    // Sort by score (highest first)
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
  }

  /**
   * Calculate how similar two products are (0-1 scale)
   */
  private static calculateSimilarity(product1: Product, product2: Product): number {
    let similarity = 0

    // Same category = high similarity
    if (product1.category === product2.category) {
      similarity += 0.6
    }

    // Similar price range
    const priceDiff = Math.abs(product1.priceNumeric - product2.priceNumeric)
    const avgPrice = (product1.priceNumeric + product2.priceNumeric) / 2
    const priceSimiliarity = 1 - Math.min(priceDiff / avgPrice, 1)
    similarity += priceSimiliarity * 0.3

    // Similar rating
    if (product1.rating && product2.rating) {
      const ratingDiff = Math.abs(product1.rating - product2.rating)
      similarity += (1 - ratingDiff / 5) * 0.1
    }

    return similarity
  }

  /**
   * Calculate recommendation score based on user criteria
   */
  private static calculateRecommendationScore(
    product: Product,
    targetProduct: Product,
    criteria: RecommendationCriteria
  ): number {
    let score = 0

    // Price score based on user's price sensitivity
    const priceScore = this.calculatePriceScore(product, targetProduct, criteria)
    score += priceScore * 0.4

    // Quality score (rating)
    if (product.rating) {
      score += (product.rating / 5) * 0.3
    }

    // Goal alignment score
    const goalScore = this.calculateGoalAlignment(product, criteria)
    score += goalScore * 0.3

    return score
  }

  /**
   * Calculate price score based on user's price sensitivity
   */
  private static calculatePriceScore(
    product: Product,
    targetProduct: Product,
    criteria: RecommendationCriteria
  ): number {
    const { priceSensitivity } = criteria

    // If cheaper, that's generally good
    if (product.priceNumeric < targetProduct.priceNumeric) {
      const savings = targetProduct.priceNumeric - product.priceNumeric
      const savingsPercent = savings / targetProduct.priceNumeric

      // Budget users love savings
      if (priceSensitivity.level === 'budget') {
        return Math.min(savingsPercent * 2, 1)
      }
      // Premium users care less about price
      if (priceSensitivity.level === 'premium' || priceSensitivity.level === 'luxury') {
        return savingsPercent * 0.5
      }
      // Moderate users in between
      return savingsPercent
    }

    // If more expensive, only good if user is willing to pay more for quality
    if (priceSensitivity.willingToPayMore && product.rating && product.rating >= 4.5) {
      return 0.6
    }

    return 0.3
  }

  /**
   * Calculate how well a product aligns with user goals
   */
  private static calculateGoalAlignment(
    product: Product,
    criteria: RecommendationCriteria
  ): number {
    let alignmentScore = 0
    const goals = criteria.userGoals

    // Save money goal
    if (goals.includes('save-money')) {
      const weight = criteria.goalWeights['save-money'] || 1
      // Lower price = better alignment
      const priceScore = product.priceNumeric < 50 ? 0.8 : 0.4
      alignmentScore += priceScore * weight
    }

    // Quality first goal
    if (goals.includes('quality-first')) {
      const weight = criteria.goalWeights['quality-first'] || 1
      const qualityScore = product.rating ? (product.rating / 5) : 0.5
      alignmentScore += qualityScore * weight
    }

    // Eco-friendly goal
    if (goals.includes('eco-friendly')) {
      const weight = criteria.goalWeights['eco-friendly'] || 1
      // Check if product has eco-friendly indicators
      const isEco = product.title.toLowerCase().includes('eco') ||
                    product.title.toLowerCase().includes('organic') ||
                    product.title.toLowerCase().includes('sustainable')
      alignmentScore += (isEco ? 0.9 : 0.3) * weight
    }

    // Normalize by number of goals
    return goals.length > 0 ? alignmentScore / goals.length : 0.5
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private static generateReasons(
    product: Product,
    targetProduct: Product,
    criteria: RecommendationCriteria
  ): string[] {
    const reasons: string[] = []

    // Savings reason
    const savings = this.calculateSavings(product, targetProduct)
    if (savings > 0) {
      const savingsPercent = ((savings / targetProduct.priceNumeric) * 100).toFixed(0)
      reasons.push(`💰 Save ${savingsPercent}% ($${savings.toFixed(2)})`)
    }

    // Better rating
    if (product.rating && targetProduct.rating && product.rating > targetProduct.rating) {
      reasons.push(`⭐ Higher rated (${product.rating} vs ${targetProduct.rating})`)
    }

    // Goal alignment
    if (criteria.userGoals.includes('save-money') && product.priceNumeric < targetProduct.priceNumeric) {
      reasons.push(`🎯 Aligns with your "Save Money" goal`)
    }

    if (criteria.userGoals.includes('quality-first') && product.rating && product.rating >= 4.5) {
      reasons.push(`✨ High quality (${product.rating}⭐)`)
    }

    if (criteria.userGoals.includes('eco-friendly')) {
      const isEco = product.title.toLowerCase().includes('eco') ||
                    product.title.toLowerCase().includes('organic') ||
                    product.title.toLowerCase().includes('sustainable')
      if (isEco) {
        reasons.push(`🌱 Eco-friendly option`)
      }
    }

    // Same category
    if (product.category === targetProduct.category) {
      reasons.push(`📦 Same category (${product.category})`)
    }

    return reasons.slice(0, 4) // Max 4 reasons
  }

  /**
   * Calculate savings amount
   */
  private static calculateSavings(product: Product, targetProduct: Product): number {
    return targetProduct.priceNumeric - product.priceNumeric
  }

  /**
   * Get which goals this product matches better than the target
   */
  private static getBetterMatches(
    product: Product,
    targetProduct: Product,
    criteria: RecommendationCriteria
  ): string[] | undefined {
    const betterMatches: string[] = []

    if (
      criteria.userGoals.includes('save-money') &&
      product.priceNumeric < targetProduct.priceNumeric
    ) {
      betterMatches.push('save-money')
    }

    if (
      criteria.userGoals.includes('quality-first') &&
      product.rating &&
      targetProduct.rating &&
      product.rating > targetProduct.rating
    ) {
      betterMatches.push('quality-first')
    }

    return betterMatches.length > 0 ? betterMatches : undefined
  }

  /**
   * Analyze user's swipe patterns to understand preferences
   */
  static analyzeSwipePatterns(preferences: UserPreferences) {
    const analysis = {
      avgLikedPrice: 0,
      avgDislikedPrice: 0,
      preferredCategories: [] as string[],
      avoidedCategories: [] as string[],
      qualityThreshold: 0,
    }

    // Calculate average prices
    if (preferences.likedProducts.length > 0) {
      analysis.avgLikedPrice =
        preferences.likedProducts.reduce((sum, p) => sum + p.priceNumeric, 0) /
        preferences.likedProducts.length
    }

    if (preferences.dislikedProducts.length > 0) {
      analysis.avgDislikedPrice =
        preferences.dislikedProducts.reduce((sum, p) => sum + p.priceNumeric, 0) /
        preferences.dislikedProducts.length
    }

    // Find preferred categories
    const categoryLikes: Record<string, number> = {}
    const categoryDislikes: Record<string, number> = {}

    preferences.likedProducts.forEach((p) => {
      categoryLikes[p.category] = (categoryLikes[p.category] || 0) + 1
    })

    preferences.dislikedProducts.forEach((p) => {
      categoryDislikes[p.category] = (categoryDislikes[p.category] || 0) + 1
    })

    analysis.preferredCategories = Object.entries(categoryLikes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)

    analysis.avoidedCategories = Object.entries(categoryDislikes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category)

    // Calculate quality threshold
    const likedRatings = preferences.likedProducts
      .map((p) => p.rating)
      .filter((r): r is number => r !== undefined)

    if (likedRatings.length > 0) {
      analysis.qualityThreshold =
        likedRatings.reduce((sum, r) => sum + r, 0) / likedRatings.length
    }

    return analysis
  }
}

