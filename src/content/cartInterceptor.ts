/**
 * Cart Interceptor
 * Detects when user tries to add item to cart and shows recommendations first
 */

import { Product } from '@/types/onboarding'
import { ProductDetector } from './productDetector'
import { ProductAnalyzer } from '@/utils/productAnalyzer'
import { PurchaseModal } from './purchaseModal'

export class CartInterceptor {
  private modal: PurchaseModal
  private isIntercepting = false
  private allowNextClick = false
  private originalAddToCart: (() => void) | null = null

  constructor() {
    this.modal = new PurchaseModal()
    this.setupInterception()
  }

  /**
   * Setup interception for add to cart buttons
   */
  private setupInterception(): void {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.attachListeners())
    } else {
      this.attachListeners()
    }

    // Also watch for dynamic content
    this.watchForButtons()
  }

  /**
   * Attach click listeners to add to cart buttons
   */
  private attachListeners(): void {
    const addToCartSelectors = [
      '#add-to-cart-button',
      '#buy-now-button',
      'input[name="submit.add-to-cart"]',
      'input[name="submit.buy-now"]',
      '.a-button-input[aria-labelledby*="add-to-cart"]',
      '[data-action="add-to-cart"]',
    ]

    addToCartSelectors.forEach(selector => {
      const buttons = document.querySelectorAll(selector)
      buttons.forEach(button => {
        if (!button.hasAttribute('data-intercepted')) {
          this.interceptButton(button as HTMLElement)
          button.setAttribute('data-intercepted', 'true')
        }
      })
    })
  }

  /**
   * Watch for dynamically added buttons
   */
  private watchForButtons(): void {
    const observer = new MutationObserver(() => {
      this.attachListeners()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  }

  /**
   * Intercept a specific button
   */
  private interceptButton(button: HTMLElement): void {
    button.addEventListener('click', async (e) => {
      // Allow click to pass through if we've flagged it
      if (this.allowNextClick) {
        this.allowNextClick = false
        return
      }

      // Only intercept if we're on a product page
      if (!ProductDetector.isProductPage()) return

      // Prevent default action
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation()

      // Check if user has completed onboarding
      const hasPreferences = await this.checkPreferences()
      if (!hasPreferences) {
        this.showOnboardingPrompt(button)
        return
      }

      // Show analysis modal
      await this.showPurchaseAnalysis(button)
    }, true) // Use capture phase to intercept early
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
  private showOnboardingPrompt(button: HTMLElement): void {
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
          Before You Buy...
        </h2>
        <p style="margin: 0 0 1.5rem 0; color: #666; line-height: 1.5;">
          Set up your preferences first to get personalized recommendations and find better deals!
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
        ">
          Set Up Now
        </button>
        <button id="skip-btn" style="
          background: white;
          color: #666;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        ">
          Skip
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
        // Send message to open the extension popup (like clicking the icon)
        chrome.runtime.sendMessage({ action: 'openPopup' })
    })

    // Skip button - proceeds with adding to cart
    overlay.querySelector('#skip-btn')?.addEventListener('click', () => {
      overlay.remove()
      // Proceed with the original purchase action
      this.proceedWithPurchase(button)
    })

    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove()
      }
    })
  }

  /**
   * Show purchase analysis modal
   */
  private async showPurchaseAnalysis(button: HTMLElement): void {
    if (this.isIntercepting) return
    this.isIntercepting = true

    try {
      // Extract product
      const product = ProductDetector.extractProduct()
      if (!product) {
        console.error('Could not extract product')
        this.proceedWithPurchase(button)
        return
      }

      // Analyze product
      const analysis = await ProductAnalyzer.analyzeProduct(product)
      if (!analysis) {
        console.error('Could not analyze product')
        this.proceedWithPurchase(button)
        return
      }

      // Show modal with results
      this.modal.show(
        product,
        analysis.shouldBuy,
        analysis.recommendations,
        async () => {
          await this.trackPurchaseDecision(product, analysis.shouldBuy, 'proceeded')
          this.proceedWithPurchase(button)
        },
        async () => {
          await this.trackPurchaseDecision(product, analysis.shouldBuy, 'cancelled')
          this.cancelPurchase()
        },
        async (alternativeId: string) => {
          await this.trackPurchaseDecision(product, analysis.shouldBuy, 'viewed_alternative', alternativeId)
        }
      )
    } catch (error) {
      console.error('Error in purchase analysis:', error)
      this.proceedWithPurchase(button)
    } finally {
      this.isIntercepting = false
    }
  }

  /**
   * Proceed with the original purchase
   */
  private proceedWithPurchase(button: HTMLElement): void {
    // Set flag to allow next click
    this.allowNextClick = true
    
    // Trigger a click on the button
    setTimeout(() => {
      button.click()
    }, 100)
  }

  /**
   * Cancel the purchase
   */
  private cancelPurchase(): void {
    console.log('Purchase cancelled by user')
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
}
