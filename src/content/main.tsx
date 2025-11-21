/**
 * Content Script - Amazon Page Integration
 * Intercepts purchase attempts and shows smart recommendations
 */

import { CartInterceptor } from './cartInterceptor'

console.log('🎯 Smart Shopping Assistant - Active!')

// Initialize cart interceptor
const interceptor = new CartInterceptor()

// Expose test functions to window for easy testing
if (typeof window !== 'undefined') {
  // Use setTimeout to ensure window is fully ready
  setTimeout(() => {
    ;(window as any).testAI = async () => {
      try {
        const { testBothAIServices } = await import('@/utils/testAI')
        return await testBothAIServices()
      } catch (error) {
        console.error('Error loading testAI:', error)
        throw error
      }
    }
    
    ;(window as any).testGemini = async () => {
      try {
        const { testGeminiAnalysis } = await import('@/utils/testAI')
        return await testGeminiAnalysis()
      } catch (error) {
        console.error('Error loading testGemini:', error)
        throw error
      }
    }
    
    ;(window as any).testPerplexity = async () => {
      try {
        const { testPerplexitySearch } = await import('@/utils/testAI')
        return await testPerplexitySearch()
      } catch (error) {
        console.error('Error loading testPerplexity:', error)
        throw error
      }
    }
    
    // Manual trigger for testing
    ;(window as any).triggerModal = async () => {
      try {
        console.log('🧪 Manually triggering modal...')
        const { ProductDetector } = await import('./productDetector')
        const { ProductAnalyzer } = await import('@/utils/productAnalyzer')
        const { PurchaseModal } = await import('./purchaseModal')
        
        const product = ProductDetector.extractProduct()
        if (!product) {
          console.error('❌ Could not extract product. Make sure you\'re on a product page.')
          return
        }
        
        console.log('✅ Product extracted:', product)
        
        const analysis = await ProductAnalyzer.analyzeProduct(product)
        if (!analysis) {
          console.error('❌ Could not analyze product')
          return
        }
        
        const modal = new PurchaseModal()
        if (analysis.shouldBuy) {
          modal.show(
            product,
            analysis.shouldBuy,
            analysis.recommendations,
            () => console.log('Proceed clicked'),
            () => console.log('Cancel clicked'),
            undefined,
            analysis.insights || null
          )
        } else {
          console.error('❌ No recommendation available')
        }
        
        console.log('✅ Modal triggered!')
      } catch (error) {
        console.error('❌ Error triggering modal:', error)
      }
    }

    // Comprehensive test showing insights and related products
    ;(window as any).testFullAnalysis = async () => {
      try {
        console.log('\n' + '='.repeat(80))
        console.log('🧪 FULL ANALYSIS TEST - Insights & Related Products')
        console.log('='.repeat(80) + '\n')

        const { ProductDetector } = await import('./productDetector')
        const { ProductAnalyzer } = await import('@/utils/productAnalyzer')
        
        // Try to get product from current page, or use test product
        let product = ProductDetector.extractProduct()
        if (!product) {
          console.log('⚠️ No product on current page, using test product...\n')
          product = {
            id: 'test-product-1',
            title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
            price: '$399.99',
            priceNumeric: 399.99,
            image: 'https://example.com/image.jpg',
            category: 'Electronics',
            rating: 4.8,
            features: ['wireless', 'noise-cancelling', 'bluetooth', 'long-battery'],
          }
        }

        console.log('📦 PRODUCT BEING ANALYZED:')
        console.log('─'.repeat(80))
        console.log(`   Title: ${product.title}`)
        console.log(`   Price: ${product.price}`)
        console.log(`   Category: ${product.category}`)
        console.log(`   Rating: ${product.rating ? product.rating + '⭐' : 'N/A'}`)
        if (product.features && product.features.length > 0) {
          console.log(`   Features: ${product.features.join(', ')}`)
        }
        console.log('')

        console.log('🤖 RUNNING FULL ANALYSIS...\n')
        const analysis = await ProductAnalyzer.analyzeProduct(product)

        if (!analysis) {
          console.error('❌ Analysis failed!')
          return
        }

        // Display Insights
        console.log('\n' + '='.repeat(80))
        console.log('💡 AI-POWERED INSIGHTS (from Gemini)')
        console.log('='.repeat(80) + '\n')

        if (analysis.insights) {
          console.log('📝 SUMMARY:')
          console.log(`   ${analysis.insights.summary}\n`)

          if (analysis.insights.strengths && analysis.insights.strengths.length > 0) {
            console.log('✅ STRENGTHS:')
            analysis.insights.strengths.forEach((strength, idx) => {
              console.log(`   ${idx + 1}. ${strength}`)
            })
            console.log('')
          }

          if (analysis.insights.concerns && analysis.insights.concerns.length > 0) {
            console.log('⚠️ CONCERNS:')
            analysis.insights.concerns.forEach((concern, idx) => {
              console.log(`   ${idx + 1}. ${concern}`)
            })
            console.log('')
          }

          console.log('💰 VALUE ASSESSMENT:')
          console.log(`   ${analysis.insights.valueAssessment}\n`)

          if (analysis.insights.recommendation) {
            console.log('🎯 AI RECOMMENDATION:')
            console.log(`   ${analysis.insights.recommendation}\n`)
          }

          if (analysis.insights.alternativeConsiderations && analysis.insights.alternativeConsiderations.length > 0) {
            console.log('💭 ALTERNATIVE CONSIDERATIONS:')
            analysis.insights.alternativeConsiderations.forEach((alt, idx) => {
              console.log(`   ${idx + 1}. ${alt}`)
            })
            console.log('')
          }
        } else {
          console.log('⚠️ No insights available (Gemini may not have been called)\n')
        }

        // Display Related Products
        console.log('\n' + '='.repeat(80))
        console.log('🛍️ RELATED PRODUCTS (from Perplexity)')
        console.log('='.repeat(80) + '\n')

        if (analysis.recommendations && analysis.recommendations.length > 0) {
          console.log(`Found ${analysis.recommendations.length} alternative product(s):\n`)
          
          analysis.recommendations.forEach((rec, idx) => {
            console.log(`📦 ALTERNATIVE ${idx + 1}:`)
            console.log(`   Title: ${rec.product.title}`)
            console.log(`   Price: ${rec.product.price}`)
            if (rec.product.rating) {
              console.log(`   Rating: ${rec.product.rating}⭐`)
            }
            if (rec.product.category) {
              console.log(`   Category: ${rec.product.category}`)
            }
            console.log(`   Match Score: ${(rec.score * 100).toFixed(1)}%`)
            if (rec.savings && rec.savings > 0) {
              console.log(`   💰 Savings: $${rec.savings.toFixed(2)}`)
            }
            if (rec.reasons && rec.reasons.length > 0) {
              console.log(`   Why Recommended:`)
              rec.reasons.forEach((reason, rIdx) => {
                console.log(`      ${rIdx + 1}. ${reason}`)
              })
            }
            if (rec.product.whyRecommended) {
              console.log(`   Perplexity Note: ${rec.product.whyRecommended}`)
            }
            if (rec.product.url) {
              console.log(`   URL: ${rec.product.url}`)
            }
            console.log('')
          })
        } else {
          console.log('⚠️ No related products found (Perplexity may not have been called)\n')
        }

        // Display Match Score
        console.log('\n' + '='.repeat(80))
        console.log('📊 MATCH SCORE ANALYSIS')
        console.log('='.repeat(80) + '\n')
        
        if (analysis.shouldBuy) {
          console.log(`   Recommendation: ${analysis.shouldBuy.recommendation.toUpperCase()}`)
          console.log(`   Score: ${(analysis.shouldBuy.score * 100).toFixed(1)}%`)
          
          if ('breakdown' in analysis.shouldBuy && analysis.shouldBuy.breakdown) {
            console.log('\n   Breakdown:')
            Object.entries(analysis.shouldBuy.breakdown).forEach(([key, value]: [string, any]) => {
              console.log(`   - ${key}: ${(value.score * 100).toFixed(1)}%`)
              console.log(`     ${value.reasoning.substring(0, 100)}${value.reasoning.length > 100 ? '...' : ''}`)
            })
          }
          
          if ('confidence' in analysis.shouldBuy && analysis.shouldBuy.confidence) {
            console.log(`\n   Confidence: ${(analysis.shouldBuy.confidence * 100).toFixed(1)}%`)
          }
          console.log('')

          // Display Reasons
          if (analysis.shouldBuy.reasons && analysis.shouldBuy.reasons.length > 0) {
            console.log('📋 REASONS:')
            analysis.shouldBuy.reasons.forEach((reason, idx) => {
              console.log(`   ${idx + 1}. ${reason}`)
            })
            console.log('')
          }
        } else {
          console.log('⚠️ No match score available\n')
        }

        console.log('='.repeat(80))
        console.log('✅ FULL ANALYSIS COMPLETE!')
        console.log('='.repeat(80) + '\n')

        return {
          product,
          insights: analysis.insights,
          recommendations: analysis.recommendations,
          matchScore: analysis.shouldBuy
        }
      } catch (error) {
        console.error('\n❌ Test Failed:', error)
        if (error instanceof Error) {
          console.error('   Error:', error.message)
          console.error('   Stack:', error.stack)
        }
        return null
      }
    }
    
    // Quick test with sample product (works anywhere, not just Amazon)
    ;(window as any).quickTest = async () => {
      try {
        console.log('\n' + '='.repeat(80))
        console.log('⚡ QUICK TEST - Sample Product Analysis')
        console.log('='.repeat(80) + '\n')

        const { ProductAnalyzer } = await import('@/utils/productAnalyzer')
        const { storage } = await import('@/utils/storage')
        
        // Check if user has preferences
        const preferences = await storage.getPreferences()
        if (!preferences || !preferences.completedOnboarding) {
          console.log('⚠️ No user preferences found. Using default test product...\n')
        }

        // Sample test product
        const testProduct = {
          id: 'test-123',
          title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
          price: '$399.99',
          priceNumeric: 399.99,
          image: 'https://example.com/image.jpg',
          category: 'Electronics',
          rating: 4.8,
          features: ['wireless', 'noise-cancelling', 'bluetooth', '30-hour battery'],
        }

        console.log('📦 TEST PRODUCT:')
        console.log(`   ${testProduct.title}`)
        console.log(`   Price: ${testProduct.price}`)
        console.log(`   Rating: ${testProduct.rating}⭐\n`)

        console.log('🤖 Running analysis...\n')
        const analysis = await ProductAnalyzer.analyzeProduct(testProduct)

        if (!analysis) {
          console.error('❌ Analysis failed!')
          return
        }

        // Show Insights
        if (analysis.insights) {
          console.log('💡 INSIGHTS (Gemini):')
          console.log('─'.repeat(80))
          console.log(`Summary: ${analysis.insights.summary}\n`)
          if (analysis.insights.strengths?.length) {
            console.log('Strengths:')
            analysis.insights.strengths.forEach(s => console.log(`  ✅ ${s}`))
            console.log('')
          }
          if (analysis.insights.concerns?.length) {
            console.log('Concerns:')
            analysis.insights.concerns.forEach(c => console.log(`  ⚠️ ${c}`))
            console.log('')
          }
          console.log(`Value: ${analysis.insights.valueAssessment}\n`)
        }

        // Show Related Products
        if (analysis.recommendations?.length) {
          console.log('🛍️ RELATED PRODUCTS (Perplexity):')
          console.log('─'.repeat(80))
          analysis.recommendations.slice(0, 3).forEach((rec, idx) => {
            console.log(`\n${idx + 1}. ${rec.product.title}`)
            console.log(`   Price: ${rec.product.price}`)
            console.log(`   Match: ${(rec.score * 100).toFixed(1)}%`)
            if (rec.savings) console.log(`   💰 Save: $${rec.savings.toFixed(2)}`)
            if (rec.reasons?.length) {
              console.log(`   Why: ${rec.reasons[0]}`)
            }
          })
          console.log('')
        }

        // Show Recommendation
        if (analysis.shouldBuy) {
          console.log('📊 RECOMMENDATION:')
          console.log('─'.repeat(80))
          console.log(`   ${analysis.shouldBuy.recommendation.toUpperCase()} - ${(analysis.shouldBuy.score * 100).toFixed(1)}% match`)
          if (analysis.shouldBuy.reasons?.length) {
            console.log(`\n   Reasons:`)
            analysis.shouldBuy.reasons.slice(0, 3).forEach((r, idx) => {
              console.log(`   ${idx + 1}. ${r}`)
            })
          }
        }

        console.log('\n' + '='.repeat(80))
        console.log('✅ Test Complete!')
        console.log('='.repeat(80) + '\n')

        return analysis
      } catch (error) {
        console.error('❌ Test failed:', error)
        return null
      }
    }

    console.log('🧪 Test functions available:')
    console.log('   - window.quickTest() - Quick test with sample product (works anywhere!)')
    console.log('   - window.testFullAnalysis() - Full analysis (needs Amazon product page)')
    console.log('   - window.testAI() - Test both services')
    console.log('   - window.testGemini() - Test Gemini only')
    console.log('   - window.testPerplexity() - Test Perplexity only')
    console.log('   - window.triggerModal() - Manually trigger purchase modal')
  }, 100)
}

console.log('✅ Add to Cart interception enabled')
console.log('💡 Try adding a product to cart to see recommendations!')

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'

function extractProductData() {
  const data = {
    title: '',
    price: '',
    description: '',
    timestamp: Date.now()
  };

  const titleSelectors = [
    '#productTitle',
    '#title',
    '.product-title-word-break'
  ];
  
  for (const selector of titleSelectors) {
    const titleEl = document.querySelector(selector);
    if (titleEl) {
      data.title = titleEl.textContent.trim();
      break;
    }
  }

  const priceSelectors = [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.a-price-whole',
    '#corePriceDisplay_desktop_feature_div .a-offscreen'
  ];
  
  for (const selector of priceSelectors) {
    const priceEl = document.querySelector(selector);
    if (priceEl) {
      data.price = priceEl.textContent.trim();
      break;
    }
  }

  const descSelectors = [
    '#feature-bullets ul',
    '#productDescription p',
    '.a-unordered-list.a-vertical.a-spacing-mini'
  ];
  
  for (const selector of descSelectors) {
    const descEl = document.querySelector(selector);
    if (descEl) {
      data.description = descEl.textContent.trim().substring(0, 500); // Limit length
      break;
    }
  }

  return data;
}

function isProductPage() {
  return window.location.pathname.includes('/dp/') || 
         window.location.pathname.includes('/gp/product/');
}

function sendProductData(data: any) {
  console.log('Amazon Product Data:', data);
  
  // Send message with error handling (page might be in bfcache)
  try {
    chrome.runtime.sendMessage({
      type: 'PRODUCT_DATA',
      data: data
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Silently ignore - page might be in bfcache
        console.log('Could not send product data (page may be cached):', chrome.runtime.lastError.message)
      }
    })
  } catch (error) {
    // Silently ignore - page might be cached
    console.log('Message send failed (page may be cached)')
  }
  
  chrome.storage.local.set({ productData: data });
}

if (isProductPage()) {
  setTimeout(() => {
    const data = extractProductData();
    sendProductData(data);
  }, 1000); // Wait for page to load
}

// Track selected configuration to detect actual changes
let lastConfig = {
  asin: new URLSearchParams(window.location.search).get('th') || '',
  selectedOptions: getSelectedOptions()
};

function getSelectedOptions() {
  const options = {};
  // Get all selected variation options
  document.querySelectorAll('#twister .selection').forEach(el => {
    const label = el.querySelector('.a-dropdown-label')?.textContent.trim();
    if (label) options[el.id] = label;
  });
  
  // Also check for button-style selectors (like color swatches)
  document.querySelectorAll('#twister [class*="selected"]').forEach(el => {
    const name = el.getAttribute('data-dp-url') || el.getAttribute('title');
    if (name) options[name] = true;
  });
  
  return options;
}

function hasConfigChanged() {
  const currentAsin = new URLSearchParams(window.location.search).get('th') || '';
  const currentOptions = getSelectedOptions();
  
  // Check if ASIN changed (actual product variant change)
  if (currentAsin !== lastConfig.asin && currentAsin !== '') {
    lastConfig.asin = currentAsin;
    lastConfig.selectedOptions = currentOptions;
    return true;
  }
  
  // Check if selected options changed (not just hovered)
  const currentKeys = Object.keys(currentOptions);
  const lastKeys = Object.keys(lastConfig.selectedOptions);
  
  if (currentKeys.length !== lastKeys.length) {
    lastConfig.selectedOptions = currentOptions;
    return true;
  }
  
  for (const key of currentKeys) {
    if (currentOptions[key] !== lastConfig.selectedOptions[key]) {
      lastConfig.selectedOptions = currentOptions;
      return true;
    }
  }
  
  return false;
}

// Monitor for configuration changes using MutationObserver
const observer = new MutationObserver((mutations) => {
  // Only check if there are significant changes, not just hover effects
  const relevantChange = mutations.some(mutation => {
    const target = mutation.target;
    // Focus on actual selection changes, not hover previews
    return (target.id?.includes('price') || 
           target.id?.includes('title') ||
           target.className?.includes('price')) &&
           mutation.addedNodes.length > 0;
  });

  if (relevantChange && isProductPage()) {
    // Debounce and verify actual config change
    clearTimeout(window.amazonExtractorTimeout);
    window.amazonExtractorTimeout = setTimeout(() => {
      if (hasConfigChanged()) {
        const data = extractProductData();
        sendProductData(data);
      }
    }, 800); // Longer delay to let hover effects settle
  }
});

// Start observing
if (isProductPage()) {
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id']
  });
}

// Listen for URL changes (for single-page navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (isProductPage()) {
      setTimeout(() => {
        const data = extractProductData();
        sendProductData(data);
      }, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });
