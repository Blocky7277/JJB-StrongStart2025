import { Product, ProductRecommendation } from '@/types/onboarding'
import { safeTextContent, escapeHTML } from '@/utils/sanitize'
import { logger } from '@/utils/logger'

export class PurchaseModal {
  private overlay: HTMLDivElement | null = null
  private isOpen = false
  private closeHandlers: Array<() => void> = []
  private lastShownAt: number = 0

  show(
    product: Product,
    recommendation: { recommendation: string; reasons: string[]; score: number; breakdown?: any; confidence?: number },
    alternatives: ProductRecommendation[],
    onProceed: () => void,
    onCancel: () => void,
    onAlternativeClick?: (alternativeId: string) => void,
    insights?: { summary: string; strengths: string[]; concerns: string[]; valueAssessment: string; recommendation: string; alternativeConsiderations: string[] } | null,
    onRating?: (rating: number) => void
  ): void {
    // ... (Previous validations and HTML building code remains exactly the same) ...
    
    // 1. BUILD: Create the new element
    const newOverlay = document.createElement('div');
    newOverlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75); z-index: 9999999;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Build complete HTML template with star rating
    if (!recommendation) {
      logger.error('PurchaseModal: Missing recommendation data');
      return;
    }

    const { recommendation: rec, reasons, score } = recommendation;
    const badgeConfig = this.getBadgeConfig(rec);
    
    // Sanitize all user-generated content
    const safeTitle = escapeHTML(safeTextContent(product.title, 200));
    const safePrice = escapeHTML(safeTextContent(product.price, 50));
    const safeReasons = reasons.map(r => escapeHTML(safeTextContent(r, 500)));
    const safeInsightsSummary = insights ? escapeHTML(safeTextContent(insights.summary, 500)) : '';
    
    newOverlay.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-content { background: white; border-radius: 24px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
        .modal-header { background: linear-gradient(135deg, ${badgeConfig.gradient}); padding: 2rem; text-align: center; color: white; border-radius: 24px 24px 0 0; }
        .modal-body { padding: 2rem; }
        .star-rating { display: flex; justify-content: center; gap: 0.5rem; margin: 1rem 0; }
        .star-button { background: none; border: none; font-size: 2rem; cursor: pointer; opacity: 0.3; transition: all 0.2s ease; padding: 0.25rem; }
        .star-button:hover { transform: scale(1.2); opacity: 0.6; }
        .star-button.active { opacity: 1; }
        .rating-text { text-align: center; margin-top: 0.5rem; font-size: 0.875rem; color: #666; }
      </style>
      <div class="modal-content">
        <div class="modal-header" style="position: relative;">
          <button id="modal-close-x" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255, 255, 255, 0.2); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; font-weight: bold;">✕</button>
          <div style="font-size: 1.5rem; margin-bottom: 1rem;">${badgeConfig.emoji} ${badgeConfig.text}</div>
          <h2 style="margin:0; font-size: 1.75rem;">Purchase Analysis</h2>
        </div>
        <div class="modal-body">
          <div style="background: #f8f9fa; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="margin:0 0 0.5rem 0;">${safeTitle}</h3>
            <div style="font-size: 1.5rem; font-weight: 700; color: #667eea;">${safePrice}</div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <div style="margin-bottom: 0.5rem; font-weight: 600; color: #666;">Match Score</div>
            <div style="width: 100%; height: 12px; background: #e5e7eb; border-radius: 6px; overflow: hidden;">
              <div style="height: 100%; background: ${badgeConfig.color}; width: ${score * 100}%;"></div>
            </div>
            <div style="text-align: center; margin-top: 0.5rem; color: ${badgeConfig.color}; font-weight: 600;">${Math.round(score * 100)}% match</div>
          </div>

          ${insights ? `
            <div style="background: #f0f9ff; border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">🤖 AI Insights</h3>
              <p style="color: #1e3a8a;">${safeInsightsSummary}</p>
            </div>
          ` : ''}

          <div style="margin-bottom: 1.5rem;">
            <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">📊 Analysis</h3>
            ${safeReasons.map(r => `<div style="background: #f3f4f6; padding: 0.75rem; border-radius: 10px; margin-bottom: 0.5rem;">${r}</div>`).join('')}
          </div>

          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem; text-align: center;">
            <div style="font-size: 1rem; font-weight: 600; color: #1a1a1a; margin-bottom: 1rem;">⭐ How much do you like this product?</div>
            <div class="star-rating" id="star-rating">
              <button class="star-button" data-rating="1">⭐</button>
              <button class="star-button" data-rating="2">⭐</button>
              <button class="star-button" data-rating="3">⭐</button>
              <button class="star-button" data-rating="4">⭐</button>
              <button class="star-button" data-rating="5">⭐</button>
            </div>
            <div class="rating-text" id="rating-text">Tap a star to rate</div>
          </div>

          ${alternatives && alternatives.length > 0 ? `
            <div style="margin-bottom: 1.5rem;">
              <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem;">💡 Better Alternatives (${alternatives.length})</h3>
              ${alternatives.slice(0, 3).map((alt, idx) => {
                const safeAltTitle = escapeHTML(safeTextContent(alt.product.title, 200));
                const safeAltPrice = escapeHTML(safeTextContent(alt.product.price, 50));
                const safeAltReasons = alt.reasons.slice(0, 2).map(r => escapeHTML(safeTextContent(r, 200))).join(' • ');
                const safeAltId = escapeHTML(safeTextContent(alt.product.id || String(idx), 100));
                const safeAltUrl = alt.product.url ? escapeHTML(safeTextContent(alt.product.url, 500)) : '';
                return `
                <div class="alternative-card" data-alt-id="${safeAltId}" data-alt-url="${safeAltUrl}" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 16px; padding: 1.25rem; margin-bottom: 1rem; cursor: pointer; transition: all 0.3s ease; border: 2px solid transparent;">
                  ${alt.savings ? `<div style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; display: inline-block;">💰 Save $${alt.savings.toFixed(2)}</div>` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div style="font-weight: 600; color: #1a1a1a; font-size: 1rem; flex: 1;">${safeAltTitle}</div>
                    <div style="font-size: 1.25rem; font-weight: 700; color: #10b981; margin-left: 1rem;">${safeAltPrice}</div>
                  </div>
                  <div style="font-size: 0.875rem; color: #666; line-height: 1.5;">
                    ${safeAltReasons}
                  </div>
                  <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #667eea; font-weight: 600;">${(alt.score * 100).toFixed(0)}% match</div>
                </div>
              `;
              }).join('')}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem;">
            <button id="view-alternatives-btn" style="padding: 1rem; border-radius: 12px; background: white; border: 2px solid #e5e7eb; cursor: pointer; font-weight: 600;" ${!alternatives || alternatives.length === 0 ? 'disabled' : ''}>View Alternatives</button>
            <button id="proceed-btn" style="padding: 1rem; border-radius: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; cursor: pointer; font-weight: 600;">Close</button>
          </div>
        </div>
      </div>
    `

    // 2. SWAP
    if (this.overlay) {
      // Pass isUserAction: false, but since we are replacing it intentionally, 
      // we might want to skip the check or just allow the replacement.
      this.remove({ isUserAction: true }); // Treat replacement as a valid action
    }

    this.overlay = newOverlay;
    this.isOpen = true;
    this.lastShownAt = Date.now();
    document.body.appendChild(this.overlay);

    // 3. EVENT LISTENERS (Updated to identify User Actions)

    // X Close Button (top right)
    const closeXBtn = this.overlay.querySelector('#modal-close-x');
    if (closeXBtn) {
      closeXBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        logger.debug('Close button clicked');
        // ✅ Flag as user action
        this.remove({ isUserAction: true });
        onCancel();
      });
      
      // Hover effect for X button
      closeXBtn.addEventListener('mouseenter', () => {
        (closeXBtn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
        (closeXBtn as HTMLElement).style.transform = 'scale(1.1)';
      });
      closeXBtn.addEventListener('mouseleave', () => {
        (closeXBtn as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
        (closeXBtn as HTMLElement).style.transform = 'scale(1)';
      });
    }

    // REMOVED: Background click to close - now only X button closes the modal

    // Close / Proceed Button
    const proceedBtn = this.overlay.querySelector('#proceed-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // ✅ Flag as user action
            this.remove({ isUserAction: true });
            onProceed();
        });
    }

    // View Alternatives Button
    const viewAlternativesBtn = this.overlay.querySelector('#view-alternatives-btn');
    if (viewAlternativesBtn) {
        viewAlternativesBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            if (alternatives && alternatives.length > 0) {
              logger.debug('View Alternatives clicked', { 
                alternativesCount: alternatives.length,
                alternatives: alternatives.map(alt => ({
                  title: alt.product.title,
                  id: alt.product.id,
                  url: alt.product.url,
                  hasUrl: !!alt.product.url,
                  hasId: !!alt.product.id
                }))
              });
              
              const urlsToOpen: Array<{url: string, title: string, index: number}> = [];
              
              // First, prepare all URLs to open
              alternatives.forEach((alt, idx) => {
                let urlToOpen: string | null = null;
                
                // Priority 1: Use direct URL if available
                if (alt.product.url && (alt.product.url.startsWith('http://') || alt.product.url.startsWith('https://'))) {
                  urlToOpen = alt.product.url;
                  logger.debug(`Will open via direct URL: ${alt.product.title}`, { index: idx + 1 });
                } 
                // Priority 2: Try Amazon ASIN (starts with B and is 10 chars)
                else if (alt.product.id && alt.product.id.startsWith('B') && alt.product.id.length === 10) {
                  urlToOpen = `https://www.amazon.com/dp/${alt.product.id}`;
                  logger.debug(`Will open via Amazon ASIN: ${alt.product.title}`, { index: idx + 1 });
                }
                // Priority 3: Extract ASIN from ID if it contains one
                else if (alt.product.id) {
                  // Try to extract ASIN pattern (B followed by 9 alphanumeric)
                  const asinMatch = alt.product.id.match(/B[A-Z0-9]{9}/);
                  if (asinMatch) {
                    urlToOpen = `https://www.amazon.com/dp/${asinMatch[0]}`;
                    logger.debug(`Will open via extracted ASIN: ${alt.product.title}`, { index: idx + 1 });
                  }
                }
                
                // Priority 4: Fallback to Amazon search if no URL found
                if (!urlToOpen) {
                  // Search Amazon for the product title
                  const searchQuery = encodeURIComponent(alt.product.title);
                  urlToOpen = `https://www.amazon.com/s?k=${searchQuery}`;
                  logger.debug(`Will open via Amazon search: ${alt.product.title}`, { index: idx + 1 });
                }
                
                if (urlToOpen) {
                  urlsToOpen.push({ url: urlToOpen, title: alt.product.title, index: idx });
                }
                
                // Track that user viewed this alternative
                if (onAlternativeClick && alt.product.id) {
                  onAlternativeClick(alt.product.id);
                }
              });
              
              logger.debug(`Prepared ${urlsToOpen.length} URLs to open`, { total: alternatives.length });
              
              if (urlsToOpen.length === 0) {
                logger.warn('No URLs could be generated for alternatives');
                alert(`Unable to generate URLs for alternative products.\n\nFound ${alternatives.length} alternatives but they don't have valid URLs or product IDs.\n\nYou can still rate this product or close the modal with the X button.`);
                return; // Don't close modal - let user decide
              }
              
              // Now open all URLs with staggered timing to avoid popup blockers
              let openedCount = 0;
              const totalUrls = urlsToOpen.length;
              
              urlsToOpen.forEach((item, idx) => {
                setTimeout(() => {
                  try {
                    logger.debug(`Opening tab ${idx + 1}/${totalUrls}`, { title: item.title, url: item.url });
                    const newWindow = window.open(item.url, '_blank');
                    if (newWindow) {
                      openedCount++;
                      logger.debug(`Successfully opened tab ${idx + 1}/${totalUrls}`);
                    } else {
                      logger.warn(`Popup blocked for tab ${idx + 1}/${totalUrls}`);
                    }
                  } catch (error) {
                    logger.error(`Error opening tab ${idx + 1}/${totalUrls}`, error);
                  }
                  
                  // After all tabs have been attempted, show summary but KEEP modal open
                  if (idx === urlsToOpen.length - 1) {
                    setTimeout(() => {
                      logger.debug(`Summary: Opened ${openedCount} out of ${urlsToOpen.length} alternative tabs`);
                      
                      if (openedCount === 0 && urlsToOpen.length > 0) {
                        logger.warn('No tabs opened - popup blocker may be active');
                        const productList = alternatives.slice(0, 3).map(a => `• ${a.product.title}`).join('\n');
                        alert(`Popup blocker may be preventing new tabs.\n\nPlease allow popups for this site, or manually search Amazon for:\n\n${productList}`);
                      } else if (openedCount > 0) {
                        logger.debug(`Successfully opened ${openedCount} alternative tabs`);
                        logger.debug('Modal remains open - user can still rate the product or close it with the X button');
                      }
                      
                      // DO NOT close modal - let user rate the product or close manually with X button
                    }, 500); // Give extra time for last tab to open
                  }
                }, idx * 200); // Stagger opens (200ms between each to avoid popup blocker)
              });
            } else {
              logger.warn('No alternatives available to view');
              alert('No alternatives are available for this product.');
            }
        });
    }

    // Star Rating Functionality
    let currentRating = 0;
    const ratingLabels = ['', '😞 Not for me', '😐 It\'s okay', '🙂 Pretty good', '😊 Really like it', '🤩 Love it!'];
    const starButtons = this.overlay.querySelectorAll('.star-button');
    const ratingText = this.overlay.querySelector('#rating-text') as HTMLElement;
    
    starButtons.forEach((button) => {
      const starBtn = button as HTMLElement;
      const starRating = parseInt(starBtn.getAttribute('data-rating') || '0');
      
      starBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentRating = starRating;
        
        // Update star display
        starButtons.forEach((btn, idx) => {
          const btnEl = btn as HTMLElement;
          if (idx < starRating) {
            btnEl.classList.add('active');
          } else {
            btnEl.classList.remove('active');
          }
        });
        
        // Update text
        if (ratingText) {
          ratingText.textContent = ratingLabels[starRating];
        }
        
        // Save rating to Supabase
        if (onRating) {
          logger.debug('User rated product', { rating: starRating, stars: '⭐'.repeat(starRating) });
          onRating(starRating);
        }
      });
      
      // Hover effect
      starBtn.addEventListener('mouseenter', () => {
        starButtons.forEach((btn, idx) => {
          const btnEl = btn as HTMLElement;
          if (idx < starRating) {
            btnEl.style.opacity = '1';
          } else {
            btnEl.style.opacity = '0.3';
          }
        });
      });
      
      starBtn.addEventListener('mouseleave', () => {
        starButtons.forEach((btn, idx) => {
          const btnEl = btn as HTMLElement;
          if (idx < currentRating) {
            btnEl.style.opacity = '1';
          } else {
            btnEl.style.opacity = '0.3';
          }
        });
      });
    });

    // Alternative Cards
    this.overlay.querySelectorAll('.alternative-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const altUrl = target.getAttribute('data-alt-url');
        const altId = target.getAttribute('data-alt-id');
        
        if (altUrl) {
          window.open(altUrl, '_blank');
        } else if (altId && altId.startsWith('B')) {
          window.open(`https://www.amazon.com/dp/${altId}`, '_blank');
        }
        
        if (onAlternativeClick && altId) {
          onAlternativeClick(altId);
        }
        
        // DO NOT close modal - let user rate the product or close manually with X button
        logger.debug('Alternative opened - modal remains open for rating');
      });
    });
    
    // Escape Key
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && this.isOpen) {
        // ✅ Flag as user action
        this.remove({ isUserAction: true });
        onCancel();
      }
    };
    document.addEventListener('keydown', escapeHandler);
    this.closeHandlers.push(() => document.removeEventListener('keydown', escapeHandler));
  }

  /**
   * Updated remove method handles "User Actions" vs "System Errors"
   */
  remove(options?: { isUserAction?: boolean }): void {
    const { isUserAction = false } = options || {};

    // Capture stack logic (keep for debugging if you want)
    const stack = new Error().stack
    const caller = stack?.split('\n')[2]?.trim() || 'unknown'
    
    // 🚨 CRITICAL PROTECTION LOGIC 🚨
    // Only alert if:
    // 1. It is NOT a user action (it's a system removal)
    // 2. AND it happened too fast (< 5 seconds, lowered from 10s)
    if (!isUserAction && this.lastShownAt && Date.now() - this.lastShownAt < 5000) {
       logger.error('CRITICAL: Modal closed automatically too quickly!', {
         message: 'This implies a crash or race condition.',
         caller
       });
       
       // Block removal if it looks like an error handler is trying to close it
       if (caller.includes('error') || caller.includes('catch')) {
           logger.warn('Blocking removal to preserve error state for user.');
           return; 
       }
    }

    if (!this.isOpen || !this.overlay) return;

    // Cleanup handlers
    this.closeHandlers.forEach(h => h());
    this.closeHandlers = [];

    // Remove from DOM
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    
    this.overlay = null;
    this.isOpen = false;
    this.lastShownAt = 0;
  }

  private getBadgeConfig(recommendation: string) {
    switch (recommendation) {
      case 'buy':
        return { emoji: '✅', text: 'GOOD BUY', color: '#10b981', gradient: '#10b981 0%, #059669 100%' };
      case 'consider':
        return { emoji: '🤔', text: 'CONSIDER', color: '#f59e0b', gradient: '#f59e0b 0%, #d97706 100%' };
      case 'skip':
        return { emoji: '⚠️', text: 'SKIP', color: '#ef4444', gradient: '#ef4444 0%, #dc2626 100%' };
      default:
        return { emoji: '🤔', text: 'REVIEW', color: '#667eea', gradient: '#667eea 0%, #764ba2 100%' };
    }
  }
}