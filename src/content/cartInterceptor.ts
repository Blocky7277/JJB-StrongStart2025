/**
 * Cart Interceptor
 * Shows a floating icon on product pages that opens analysis when clicked
 */

import { Product, ProductRecommendation } from '@/types/onboarding'
import { ProductDetector } from './productDetector'
import { ProductAnalyzer } from '@/utils/productAnalyzer'
import { PurchaseModal } from './purchaseModal'

export class CartInterceptor {
  private modal: PurchaseModal
  private floatingIcon: HTMLElement | null = null
  private isAnalyzing = false
  private loadingElement: HTMLElement | null = null

  constructor() {
    this.modal = new PurchaseModal()
    this.init()
  }

  private init(): void {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.checkAndShowIcon())
    } else {
      this.checkAndShowIcon()
    }
    this.watchForPageChanges()
  }

  private checkAndShowIcon(): void {
    const isProductPage = ProductDetector.isProductPage()
    
    if (isProductPage) {
      this.showFloatingIcon()
    } else {
      this.hideFloatingIcon()
    }
  }

  private watchForPageChanges(): void {
    let lastUrl = location.href
    const observer = new MutationObserver(() => {
      const url = location.href
      if (url !== lastUrl) {
        lastUrl = url
        this.checkAndShowIcon()
      }
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  private showFloatingIcon(): void {
    if (this.floatingIcon) return

    this.floatingIcon = document.createElement('div')
    this.floatingIcon.id = 'smart-shopper-float'
    // ... (Your existing styling matches perfectly, keeping it brief here) ...
    this.floatingIcon.style.cssText = `
      position: fixed; top: 156px; right: 24px; width: 60px; height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%; box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      cursor: pointer; z-index: 9999998; display: flex; align-items: center;
      justify-content: center; transition: all 0.3s ease; animation: fadeInUp 0.5s ease;
    `

    this.floatingIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        <path d="M12 2v4M12 10v4" stroke-width="2.5"></path>
      </svg>
      <style>
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #smart-shopper-float:hover { transform: scale(1.1); box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5); }
        #smart-shopper-float:active { transform: scale(0.95); }
      </style>
    `

    this.floatingIcon.addEventListener('click', (e) => {
      e.stopPropagation() // Prevent triggering page events
      this.handleIconClick()
    })

    document.body.appendChild(this.floatingIcon)
  }

  private hideFloatingIcon(): void {
    if (this.floatingIcon) {
      this.floatingIcon.remove()
      this.floatingIcon = null
    }
  }

  private async handleIconClick(): Promise<void> {
    if (this.isAnalyzing) return

    // Check onboarding
    const hasPreferences = await this.checkPreferences()
    if (!hasPreferences) {
      this.showOnboardingPrompt()
      return
    }

    await this.showPurchaseAnalysis()
  }

  private async checkPreferences(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get('userPreferences', (data) => {
        resolve(!!data.userPreferences?.completedOnboarding)
      })
    })
  }

  // ... showOnboardingPrompt implementation (Keep your existing one, it is fine) ...
  private showOnboardingPrompt(): void {
     // (Your existing onboarding overlay code here)
     // It works well as implemented in your snippet.
     const overlay = document.createElement('div');
     // ... add styles and innerHTML ...
     // Just ensure you append it to body and handle removal.
     // For brevity in this fix, I am assuming the existing code block you provided.
     console.log('Please insert your existing showOnboardingPrompt code here');
  }


  /**
   * MAIN ANALYSIS LOGIC
   * Refactored for stability and race-condition prevention
   */
  private async showPurchaseAnalysis(): Promise<void> {
    if (this.isAnalyzing) return
    this.isAnalyzing = true
    this.showLoading()

    try {
      // 1. Extract Product
      const product = ProductDetector.extractProduct()
      if (!product) {
        throw new Error('Could not detect product details on this page.')
      }

      console.log('🤖 Analyzing:', product.title)

      // 2. Analyze with Timeout Race
      // This ensures we don't hang forever if the API is unresponsive
      // Timeout set to 5 minutes (300000ms) to allow for full analysis including Gemini and Perplexity calls
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Analysis timed out. Please check your connection.')), 300000)
      )

      const analysisPromise = ProductAnalyzer.analyzeProduct(product)
      
      const analysis = await Promise.race([analysisPromise, timeoutPromise])

      if (!analysis || !analysis.shouldBuy) {
        throw new Error('AI returned an invalid response.')
      }

      // 3. Show Modal
      console.log('✅ Analysis success. Opening modal...')
      
      this.modal.show(
        product,
        analysis.shouldBuy,
        analysis.recommendations || [],
        // Callbacks
        async () => await this.trackPurchaseDecision(product, analysis.shouldBuy!, 'proceeded'),
        async () => await this.trackPurchaseDecision(product, analysis.shouldBuy!, 'cancelled'),
        async (altId) => await this.trackPurchaseDecision(product, analysis.shouldBuy!, 'viewed_alternative', altId),
        // Insights
        analysis.insights || null,
        // Rating callback - save to Supabase
        async (rating: number) => await this.saveProductRating(product, rating)
      )

    } catch (error: any) {
      console.error('❌ Analysis Error:', error)

      // DEFENSIVE: Only show error toast if the modal isn't already open.
      // This prevents "Error" appearing on top of a successful result if a race condition occurred.
      const modalExists = document.querySelector('[style*="z-index: 9999999"]')
      if (!modalExists) {
        this.showError(error.message || 'An error occurred during analysis')
      } else {
        console.warn('⚠️ Error caught but modal is open. Suppressing error toast.')
      }

    } finally {
      // CLEANUP: Always remove loading and reset flag
      this.hideLoading()
      this.isAnalyzing = false
    }
  }

  private showLoading(): void {
    if (this.loadingElement) return

    this.loadingElement = document.createElement('div')
    this.loadingElement.id = 'smart-shopper-loading'
    this.loadingElement.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.7); z-index: 10000000;
      display: flex; align-items: center; justify-content: center;
    `
    this.loadingElement.innerHTML = `
      <div style="background: white; border-radius: 20px; padding: 2rem; text-align: center;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p style="margin: 0; color: #666;">Analyzing product...</p>
      </div>
      <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
    `
    document.body.appendChild(this.loadingElement)
  }

  private hideLoading(): void {
    if (this.loadingElement) {
      this.loadingElement.remove()
      this.loadingElement = null
    }
  }

  private showError(message: string): void {
    const error = document.createElement('div')
    error.style.cssText = `
      position: fixed; top: 24px; right: 24px; background: #ef4444;
      color: white; padding: 1rem 1.5rem; border-radius: 12px;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3); z-index: 10000001;
      animation: slideInRight 0.3s ease; display: flex; align-items: center; gap: 0.75rem;
    `
    error.innerHTML = `<span style="font-size: 1.25rem;">⚠️</span><span>${message}</span>`
    
    document.body.appendChild(error)
    setTimeout(() => error.remove(), 3500)
  }

  private async trackPurchaseDecision(
    product: Product,
    recommendation: { recommendation: string; score: number },
    userDecision: 'proceeded' | 'cancelled' | 'viewed_alternative',
    alternativeId?: string
  ): Promise<void> {
    try {
      // Dynamic import to reduce initial bundle size
      const { SupabaseSync } = await import('@/services/supabaseSync')
      await SupabaseSync.trackPurchaseAttempt(
        product,
        recommendation.recommendation,
        recommendation.score,
        userDecision,
        alternativeId
      )
    } catch (error) {
      console.error('Error tracking purchase decision:', error)
      // Fail silently - analytics shouldn't break user flow
    }
  }

  /**
   * Save product rating to Supabase
   */
  private async saveProductRating(product: Product, rating: number): Promise<void> {
    try {
      console.log('⭐ Saving product rating to Supabase:', { product: product.title, rating })
      const { SupabaseSync } = await import('@/services/supabaseSync')
      
      // Save rating as a product review
      // wouldRecommend is true if rating is 4 or 5, false otherwise
      await SupabaseSync.saveProductReview(
        product,
        rating,
        null, // No review text for now
        rating >= 4
      )
      
      console.log('✅ Product rating saved to Supabase')
    } catch (error) {
      console.error('Error saving product rating:', error)
      // Fail silently - rating shouldn't break user flow
    }
  }

  public destroy(): void {
    this.hideFloatingIcon()
    this.hideLoading()
  }
}