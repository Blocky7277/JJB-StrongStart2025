/**
 * Cart Interceptor
 * Shows a floating icon on product pages that opens analysis when clicked
 */

import { Product } from '@/types/onboarding'
import { ProductDetector } from './productDetector'
import { ProductAnalyzer } from '@/utils/productAnalyzer'
import { PurchaseModal } from './purchaseModal'

export class CartInterceptor {
  private modal: PurchaseModal
  private floatingIcon: HTMLElement | null = null
  private isAnalyzing = false

  constructor() {
    this.modal = new PurchaseModal()
    this.init()
  }

  /**
   * Initialize the floating icon
   */
  private init(): void {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.checkAndShowIcon())
    } else {
      this.checkAndShowIcon()
    }

    // Watch for navigation changes (SPA support)
    this.watchForPageChanges()
  }

  /**
   * Check if we're on a product page and show icon
   */
  private checkAndShowIcon(): void {
    if (ProductDetector.isProductPage()) {
      this.showFloatingIcon()
    } else {
      this.hideFloatingIcon()
    }
  }

  /**
   * Watch for page changes
   */
  private watchForPageChanges(): void {
    let lastUrl = location.href
    
    const observer = new MutationObserver(() => {
      const url = location.href
      if (url !== lastUrl) {
        lastUrl = url
        this.checkAndShowIcon()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  /**
   * Create and show the floating icon
   */
  private showFloatingIcon(): void {
    // Don't create duplicate icons
    if (this.floatingIcon) return

    this.floatingIcon = document.createElement('div')
    this.floatingIcon.id = 'smart-shopper-float'
    this.floatingIcon.style.cssText = `
      position: fixed;
      top: 156px;
      right: 24px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      cursor: pointer;
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      animation: fadeInUp 0.5s ease;
    `

    this.floatingIcon.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        <path d="M12 2v4M12 10v4" stroke-width="2.5"></path>
      </svg>
      <style>
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        #smart-shopper-float:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 30px rgba(102, 126, 234, 0.5);
        }
        #smart-shopper-float:active {
          transform: scale(0.95);
        }
      </style>
    `

    // Add click handler
    this.floatingIcon.addEventListener('click', () => this.handleIconClick())

    // Add to page
    document.body.appendChild(this.floatingIcon)
  }

  /**
   * Hide the floating icon
   */
  private hideFloatingIcon(): void {
    if (this.floatingIcon) {
      this.floatingIcon.remove()
      this.floatingIcon = null
    }
  }

  /**
   * Handle icon click
   */
  private async handleIconClick(): Promise<void> {
    if (this.isAnalyzing) return

    // Check if user has completed onboarding
    const hasPreferences = await this.checkPreferences()
    if (!hasPreferences) {
      this.showOnboardingPrompt()
      return
    }

    // Show analysis
    await this.showPurchaseAnalysis()
  }

  /**
   * Check if user has preferences
   */
  private async checkPreferences(): Promise<boolean> {
    return new Promise((resolve) => {
      chrome.storage.local.get('userPreferences', (data) => {
        resolve(!!data.userPreferences?.completedOnboarding)
      })
    })
  }

  /**
   * Show onboarding prompt
   */
  private showOnboardingPrompt(): void {
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    `

    overlay.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 2rem;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🎯</div>
        <h2 style="margin: 0 0 1rem 0; color: #1a1a1a; font-size: 1.5rem;">
          Get Smart Shopping Insights
        </h2>
        <p style="margin: 0 0 1.5rem 0; color: #666; line-height: 1.5;">
          Set up your preferences to get personalized recommendations and find better deals!
        </p>
        <button id="setup-btn" style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.5rem;
          font-size: 1rem;
        ">
          Set Up Now
        </button>
        <button id="close-btn" style="
          background: white;
          color: #666;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
        ">
          Close
        </button>
      </div>
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      </style>
    `

    document.body.appendChild(overlay)

    // Setup button - opens extension popup
    overlay.querySelector('#setup-btn')?.addEventListener('click', () => {
      overlay.remove()
      chrome.runtime.sendMessage({ action: 'openPopup' })
    })

    // Close button
    overlay.querySelector('#close-btn')?.addEventListener('click', () => {
      overlay.remove()
    })

    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove()
      }
    })
  }

  /**
   * Show purchase analysis popup
   */
  private async showPurchaseAnalysis(): Promise<void> {
    if (this.isAnalyzing) return
    this.isAnalyzing = true

    try {
      // Extract product
      const product = ProductDetector.extractProduct()
      if (!product) {
        console.error('Could not extract product')
        this.showError('Unable to analyze this product')
        return
      }

      // Show loading state
      this.showLoading()

      // Analyze product
      const analysis = await ProductAnalyzer.analyzeProduct(product)
      
      // Remove loading screen
      this.hideLoading()
      
      if (!analysis) {
        console.error('Could not analyze product')
        this.showError('Unable to complete analysis')
        return
      }

      // Show modal with results
      this.modal.show(
        product,
        analysis.shouldBuy,
        analysis.recommendations,
        async () => {
          await this.trackPurchaseDecision(product, analysis.shouldBuy, 'proceeded')
        },
        async () => {
          await this.trackPurchaseDecision(product, analysis.shouldBuy, 'cancelled')
        },
        async (alternativeId: string) => {
          await this.trackPurchaseDecision(product, analysis.shouldBuy, 'viewed_alternative', alternativeId)
        }
      )
    } catch (error) {
      console.error('Error in purchase analysis:', error)
      this.hideLoading()
      this.showError('An error occurred during analysis')
    } finally {
      this.isAnalyzing = false
    }
  }

  /**
   * Show loading state
   */
  private showLoading(): void {
    const loading = document.createElement('div')
    loading.id = 'smart-shopper-loading'
    loading.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000000;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    loading.innerHTML = `
      <div style="
        background: white;
        border-radius: 20px;
        padding: 2rem;
        text-align: center;
      ">
        <div class="spinner" style="
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="margin: 0; color: #666;">Analyzing product...</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `

    document.body.appendChild(loading)

    // Auto-remove after 30 seconds (timeout protection)
    setTimeout(() => {
      this.hideLoading()
    }, 30000)
  }

  /**
   * Hide loading state
   */
  private hideLoading(): void {
    const loading = document.getElementById('smart-shopper-loading')
    loading?.remove()
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    // Remove loading if present
    document.getElementById('smart-shopper-loading')?.remove()

    const error = document.createElement('div')
    error.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      background: #ef4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
      z-index: 10000001;
      animation: slideInRight 0.3s ease;
    `

    error.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 1.25rem;">⚠️</span>
        <span>${message}</span>
      </div>
      <style>
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
    `

    document.body.appendChild(error)

    // Auto-remove after 3 seconds
    setTimeout(() => error.remove(), 3000)
  }

  /**
   * Track purchase decision in Supabase
   */
  private async trackPurchaseDecision(
    product: Product,
    recommendation: { recommendation: string; score: number },
    userDecision: 'proceeded' | 'cancelled' | 'viewed_alternative',
    alternativeId?: string
  ): Promise<void> {
    try {
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
    }
  }

  /**
   * Cleanup - call this when extension is disabled/unloaded
   */
  public destroy(): void {
    this.hideFloatingIcon()
    document.getElementById('smart-shopper-loading')?.remove()
  }
}
