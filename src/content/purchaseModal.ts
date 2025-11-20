/**
 * Purchase Modal
 * Shows analysis and recommendations before purchase
 */

import { Product, ProductRecommendation } from '@/types/onboarding'

export class PurchaseModal {
  private overlay: HTMLDivElement | null = null

  /**
   * Show the purchase decision modal
   */
  show(
    product: Product,
    recommendation: { recommendation: string; reasons: string[]; score: number },
    alternatives: ProductRecommendation[],
    onProceed: () => void,
    onCancel: () => void,
    onAlternativeClick?: (alternativeId: string) => void,
    onRating?: (rating: number) => void
  ): void {
    this.remove() // Remove any existing modal

    const { recommendation: rec, reasons, score } = recommendation

    const badgeConfig = this.getBadgeConfig(rec)

    this.overlay = document.createElement('div')
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `

    this.overlay.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        
        .modal-content {
          background: white;
          border-radius: 24px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          background: linear-gradient(135deg, ${badgeConfig.gradient});
          color: white;
          padding: 2rem;
          border-radius: 24px 24px 0 0;
          text-align: center;
        }

        .modal-badge {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          backdrop-filter: blur(10px);
        }

        .modal-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
        }

        .modal-body {
          padding: 2rem;
        }

        .product-info {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .product-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
        }

        .product-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .score-section {
          margin-bottom: 1.5rem;
        }

        .score-label {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .score-bar {
          width: 100%;
          height: 12px;
          background: #e5e7eb;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }

        .score-fill {
          height: 100%;
          background: ${badgeConfig.color};
          width: ${score * 100}%;
          transition: width 1s ease;
          position: relative;
        }

        .score-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .score-text {
          text-align: center;
          margin-top: 0.5rem;
          font-weight: 600;
          color: ${badgeConfig.color};
          font-size: 1.125rem;
        }

        .reasons-section {
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 1rem 0;
        }

        .reason-item {
          background: #f3f4f6;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-section {
          margin-bottom: 1.5rem;
          text-align: center;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 16px;
        }

        .rating-label {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 1rem;
        }

        .star-rating {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
        }

        .star-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          transition: transform 0.2s ease;
        }

        .star-button:hover {
          transform: scale(1.15);
        }

        .star-button:active {
          transform: scale(0.95);
        }

        .star-button svg {
          display: block;
        }

        .rating-text {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: #666;
          font-weight: 500;
        }

        .alternatives-section {
          margin-bottom: 1.5rem;
        }

        .alternative-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .alternative-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          border-color: #667eea;
        }

        .alt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .alt-title {
          font-weight: 600;
          color: #1a1a1a;
          font-size: 1rem;
          flex: 1;
        }

        .alt-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #10b981;
          margin-left: 1rem;
        }

        .alt-savings {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .alt-reasons {
          font-size: 0.875rem;
          color: #666;
          line-height: 1.5;
        }

        .modal-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          padding: 0 2rem 2rem 2rem;
        }

        .action-btn {
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .btn-proceed {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-cancel {
          background: white;
          color: #666;
          border: 2px solid #e5e7eb;
        }

        .btn-cancel:hover {
          border-color: #cbd5e1;
        }
      </style>

      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-badge">${badgeConfig.emoji} ${badgeConfig.text}</div>
          <h2 class="modal-title">Purchase Analysis</h2>
        </div>

        <div class="modal-body">
          <div class="product-info">
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">${product.price}</div>
          </div>

          <div class="score-section">
            <div class="score-label">Match Score</div>
            <div class="score-bar">
              <div class="score-fill"></div>
            </div>
            <div class="score-text">${Math.round(score * 100)}% match with your preferences</div>
          </div>

          <div class="reasons-section">
            <h3 class="section-title">📊 Analysis</h3>
            ${reasons.map(reason => `
              <div class="reason-item">${reason}</div>
            `).join('')}
          </div>

          <div class="rating-section">
            <div class="rating-label">How much do you like this product?</div>
            <div class="star-rating" id="star-rating">
              <button class="star-button" data-rating="1">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
              <button class="star-button" data-rating="2">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
              <button class="star-button" data-rating="3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
              <button class="star-button" data-rating="4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
              <button class="star-button" data-rating="5">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            </div>
            <div class="rating-text" id="rating-text">Tap a star to rate</div>
          </div>

          ${alternatives.length > 0 ? `
            <div class="alternatives-section">
              <h3 class="section-title">💡 Better Alternatives Found</h3>
              ${alternatives.slice(0, 3).map(alt => `
                <div class="alternative-card" data-alt-id="${alt.product.id}">
                  ${alt.savings ? `
                    <div class="alt-savings">💰 Save $${alt.savings.toFixed(2)}</div>
                  ` : ''}
                  <div class="alt-header">
                    <div class="alt-title">${alt.product.title}</div>
                    <div class="alt-price">${alt.product.price}</div>
                  </div>
                  <div class="alt-reasons">
                    ${alt.reasons.slice(0, 3).join(' • ')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="modal-actions">
          <button class="action-btn btn-cancel" id="cancel-btn">
            View Alternatives
          </button>
          <button class="action-btn btn-proceed" id="proceed-btn">
            Close
          </button>
        </div>
      </div>
    `

    document.body.appendChild(this.overlay)

    // Star rating functionality
    const starButtons = this.overlay.querySelectorAll('.star-button')
    const ratingText = this.overlay.querySelector('#rating-text')
    let currentRating = 0
    let hoverRating = 0

    const ratingLabels = [
      '',
      '😞 Not for me',
      '😐 It\'s okay',
      '🙂 Pretty good',
      '😊 Really like it',
      '🤩 Love it!'
    ]

    const updateStars = (rating: number) => {
      starButtons.forEach((button) => {
        const star = button as HTMLElement
        const starRating = parseInt(star.getAttribute('data-rating') || '0')
        const svg = star.querySelector('svg')
        
        if (svg) {
          if (starRating <= rating) {
            svg.setAttribute('fill', '#fbbf24')
          } else {
            svg.setAttribute('fill', 'none')
          }
        }
      })
    }

    starButtons.forEach(button => {
      button.addEventListener('click', () => {
        const rating = parseInt(button.getAttribute('data-rating') || '0')
        currentRating = rating
        updateStars(rating)

        // Update text
        if (ratingText) {
          ratingText.textContent = ratingLabels[rating]
        }

        // Call callback
        if (onRating) {
          onRating(rating)
        }
      })

      // Hover effect
      button.addEventListener('mouseenter', () => {
        const rating = parseInt(button.getAttribute('data-rating') || '0')
        hoverRating = rating
        updateStars(rating)
      })

      button.addEventListener('mouseleave', () => {
        hoverRating = 0
        updateStars(currentRating)
      })
    })

    // Add event listeners
    this.overlay.querySelector('#proceed-btn')?.addEventListener('click', () => {
      this.remove()
      onProceed()
    })

    this.overlay.querySelector('#cancel-btn')?.addEventListener('click', () => {
      this.remove()
      onCancel()
    })

    // Alternative cards
    this.overlay.querySelectorAll('.alternative-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement
        const altId = target.getAttribute('data-alt-id')
        console.log('User clicked alternative:', altId)
        
        if (altId && onAlternativeClick) {
          onAlternativeClick(altId)
        }
        
        // In production: open alternative product page
        // window.open(`https://amazon.com/dp/${altId}`, '_blank')
      })
    })

    // Close on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.remove()
        onCancel()
      }
    })

    // Close on Escape key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.remove()
        onCancel()
        document.removeEventListener('keydown', escapeHandler)
      }
    }
    document.addEventListener('keydown', escapeHandler)
  }

  /**
   * Remove the modal
   */
  remove(): void {
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
  }

  /**
   * Get badge configuration based on recommendation
   */
  private getBadgeConfig(recommendation: string) {
    switch (recommendation) {
      case 'buy':
        return {
          emoji: '✅',
          text: 'GOOD BUY',
          color: '#10b981',
          gradient: '#10b981 0%, #059669 100%',
        }
      case 'consider':
        return {
          emoji: '🤔',
          text: 'CONSIDER',
          color: '#f59e0b',
          gradient: '#f59e0b 0%, #d97706 100%',
        }
      case 'skip':
        return {
          emoji: '⚠️',
          text: 'SKIP',
          color: '#ef4444',
          gradient: '#ef4444 0%, #dc2626 100%',
        }
      default:
        return {
          emoji: '🤔',
          text: 'REVIEW',
          color: '#667eea',
          gradient: '#667eea 0%, #764ba2 100%',
        }
    }
  }
}
