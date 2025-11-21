/**
 * Supabase Sync Service
 * Syncs all user data to Supabase for LLM analysis and insights
 * 
 * Features:
 * - Improved error handling with retry logic
 * - Rate limiting to prevent quota exhaustion
 * - Proper logging instead of console statements
 */

import { supabase } from '@/config/supabase'
import { UserPreferences, SwipeDecision, Product } from '@/types/onboarding'
import { logger } from '@/utils/logger'
import { supabaseRateLimiter, RateLimitError } from '@/utils/rateLimiter'
import { safeAsync, withRetry, isRetryableError } from '@/utils/errorHandler'

export class SupabaseSync {
  private static userId: string | null = null

  /**
   * Initialize user and get/create user ID
   */
  static async initializeUser(): Promise<string> {
    if (this.userId) return this.userId

    // Get or create extension user ID
    const result = await chrome.storage.local.get('extensionUserId')
    
    if (result.extensionUserId) {
      this.userId = result.extensionUserId
    } else {
      // Generate unique user ID
      this.userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await chrome.storage.local.set({ extensionUserId: this.userId })
    }

    // Ensure user exists in Supabase
    await this.ensureUserExists(this.userId)

    return this.userId
  }

  /**
   * Ensure user record exists in Supabase
   */
  private static async ensureUserExists(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .upsert({
        extension_user_id: userId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'extension_user_id'
      })

    if (error) {
      logger.error('Error creating user in Supabase', error)
      throw error
    }
  }

  /**
   * Sync user preferences to Supabase
   */
  static async syncPreferences(preferences: UserPreferences): Promise<void> {
    return safeAsync(async () => {
      // Check rate limit
      try {
        await supabaseRateLimiter.check('supabase-sync')
      } catch (error) {
        if (error instanceof RateLimitError) {
          logger.warn('Rate limit exceeded for Supabase sync', { waitTime: error.waitTime })
          return // Fail silently for analytics
        }
      }

      const userId = await this.initializeUser()

      const { error } = await withRetry(
        () => supabase
          .from('user_preferences')
          .upsert({
            user_id: userId,
            goals: preferences.goals,
            goal_weights: preferences.goalWeights,
            price_sensitivity: preferences.priceSensitivity,
            category_preferences: preferences.categoryPreferences,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          }),
        {
          maxRetries: 2,
          retryDelay: 500,
          retryable: isRetryableError,
        }
      )

      if (error) {
        logger.error('Error syncing preferences to Supabase', error)
        throw error
      } else {
        logger.debug('Preferences synced to Supabase', { userId })
      }
    }, undefined, 'Failed to sync preferences') as Promise<void>
  }

  /**
   * Sync swipe decision to Supabase
   */
  static async syncSwipeDecision(decision: SwipeDecision): Promise<void> {
    try {
      const userId = await this.initializeUser()

      const { error } = await supabase
        .from('swipe_decisions')
        .insert({
          user_id: userId,
          product_id: decision.productId,
          product_data: decision.product,
          decision: decision.decision,
          timestamp: decision.timestamp,
        })

      if (error) {
        logger.error('Error syncing swipe decision to Supabase', error)
        throw error
      } else {
        logger.debug('Swipe decision synced to Supabase', { userId, productId: decision.productId })
      }
    } catch (error) {
      logger.error('Error in syncSwipeDecision', error)
      // Fail silently - analytics shouldn't break user flow
    }
  }

  /**
   * Sync all swipe decisions at once (bulk upload)
   */
  static async syncAllSwipeDecisions(decisions: SwipeDecision[]): Promise<void> {
    try {
      const userId = await this.initializeUser()

      const records = decisions.map(decision => ({
        user_id: userId,
        product_id: decision.productId,
        product_data: decision.product,
        decision: decision.decision,
        timestamp: decision.timestamp,
      }))

      const { error } = await supabase
        .from('swipe_decisions')
        .insert(records)

      if (error) {
        logger.error('Error syncing swipe decisions to Supabase', error)
        throw error
      } else {
        logger.debug(`${decisions.length} swipe decisions synced to Supabase`, { userId })
      }
    } catch (error) {
      logger.error('Error in syncAllSwipeDecisions', error)
      // Fail silently - analytics shouldn't break user flow
    }
  }

  /**
   * Track purchase attempt and user decision
   */
  static async trackPurchaseAttempt(
    product: Product,
    recommendation: string,
    score: number,
    userDecision: 'proceeded' | 'cancelled' | 'viewed_alternative',
    alternativeSelected?: string
  ): Promise<void> {
    try {
      const userId = await this.initializeUser()

      const { error } = await supabase
        .from('purchase_attempts')
        .insert({
          user_id: userId,
          product_id: product.id,
          product_data: product,
          recommendation,
          score,
          user_decision: userDecision,
          alternative_selected: alternativeSelected || null,
          timestamp: Date.now(),
        })

      if (error) {
        logger.error('Error tracking purchase attempt in Supabase', error)
        throw error
      } else {
        logger.debug('Purchase attempt tracked in Supabase', { userId, productId: product.id })
      }
    } catch (error) {
      logger.error('Error in trackPurchaseAttempt', error)
      // Fail silently - analytics shouldn't break user flow
    }
  }

  /**
   * Save product review
   */
  static async saveProductReview(
    product: Product,
    rating: number,
    reviewText: string | null,
    wouldRecommend: boolean
  ): Promise<void> {
    try {
      const userId = await this.initializeUser()

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: userId,
          product_id: product.id,
          product_data: product,
          rating,
          review_text: reviewText,
          would_recommend: wouldRecommend,
        })

      if (error) {
        logger.error('Error saving review to Supabase', error)
        throw error
      } else {
        logger.debug('Review saved to Supabase', { userId, productId: product.id, rating })
      }
    } catch (error) {
      logger.error('Error in saveProductReview', error)
      // Fail silently - analytics shouldn't break user flow
    }
  }

  /**
   * Fetch user's complete data for LLM analysis
   */
  static async fetchUserDataForLLM(): Promise<any> {
    try {
      const userId = await this.initializeUser()

      // Fetch all data in parallel
      const [prefsResult, swipesResult, purchasesResult, reviewsResult] = await Promise.all([
        supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('swipe_decisions').select('*').eq('user_id', userId),
        supabase.from('purchase_attempts').select('*').eq('user_id', userId),
        supabase.from('product_reviews').select('*').eq('user_id', userId),
      ])

      return {
        userId,
        preferences: prefsResult.data,
        swipeDecisions: swipesResult.data || [],
        purchaseAttempts: purchasesResult.data || [],
        reviews: reviewsResult.data || [],
        totalDataPoints: (swipesResult.data?.length || 0) + 
                        (purchasesResult.data?.length || 0) + 
                        (reviewsResult.data?.length || 0),
      }
    } catch (error) {
      logger.error('Error fetching data for LLM from Supabase', error)
      return null
    }
  }

  /**
   * Generate LLM prompt with all user data
   */
  static async generateLLMPrompt(): Promise<string> {
    const data = await this.fetchUserDataForLLM()
    
    if (!data) return 'No data available'

    return `
Analyze this user's shopping behavior and provide insights:

USER PREFERENCES:
- Goals: ${data.preferences?.goals.join(', ')}
- Budget Style: ${data.preferences?.price_sensitivity.level}
- Willing to pay more for quality: ${data.preferences?.price_sensitivity.willingToPayMore}

SWIPE TRAINING DATA (${data.swipeDecisions.length} products):
Liked Products:
${data.swipeDecisions
  .filter((d: any) => d.decision === 'like')
  .map((d: any) => `- ${d.product_data.title} ($${d.product_data.priceNumeric}) - ${d.product_data.category}`)
  .join('\n')}

Disliked Products:
${data.swipeDecisions
  .filter((d: any) => d.decision === 'dislike')
  .map((d: any) => `- ${d.product_data.title} ($${d.product_data.priceNumeric}) - ${d.product_data.category}`)
  .join('\n')}

PURCHASE ATTEMPTS (${data.purchaseAttempts.length}):
${data.purchaseAttempts
  .map((p: any) => `- ${p.product_data.title} ($${p.product_data.priceNumeric}) - ${p.recommendation.toUpperCase()} - User: ${p.user_decision}`)
  .join('\n')}

PRODUCT REVIEWS (${data.reviews.length}):
${data.reviews
  .map((r: any) => `- ${r.product_data.title} - Rating: ${r.rating}/5 - Would recommend: ${r.would_recommend}`)
  .join('\n')}

Please provide:
1. Shopping personality analysis
2. Spending patterns and trends
3. Category preferences insights
4. Recommendations for better product matches
5. Potential savings opportunities
`
  }
}

