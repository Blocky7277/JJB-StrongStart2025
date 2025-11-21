/**
 * Perplexity Shopping Service
 * Uses Perplexity AI to find similar products that match user preferences and goals
 */

import { PERPLEXITY_CONFIG } from '@/config/perplexity'
import { Product, RecommendationCriteria } from '@/types/onboarding'

interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
  usage?: {
    total_tokens: number
  }
}

/**
 * Search for similar products using Perplexity AI
 */
export async function searchSimilarProducts(
  targetProduct: Product,
  criteria: RecommendationCriteria,
  userPatterns: {
    avgLikedPrice: number
    preferredCategories: string[]
    qualityThreshold: number
  }
): Promise<Product[]> {
  try {
    console.log('🔍 Searching Perplexity for similar products...')

    // Build search query based on user preferences
    const searchQuery = buildProductSearchQuery(targetProduct, criteria, userPatterns)

    // Call Perplexity API
    const response = await callPerplexityAPI(searchQuery)

    // Parse response to extract products
    const products = parsePerplexityResponse(response, targetProduct)

    console.log(`✅ Found ${products.length} similar products from Perplexity`)
    return products
  } catch (error) {
    console.error('❌ Perplexity search failed:', error)
    // Return empty array on error - fallback to mock products
    return []
  }
}

/**
 * Build a comprehensive search query for Perplexity
 */
function buildProductSearchQuery(
  product: Product,
  criteria: RecommendationCriteria,
  patterns: any
): string {
  const priceRange = patterns.avgLikedPrice > 0 
    ? `around $${patterns.avgLikedPrice.toFixed(0)}` 
    : `under $${criteria.priceSensitivity.maxPrice}`
  
  const qualityFilter = patterns.qualityThreshold > 0
    ? `with at least ${patterns.qualityThreshold.toFixed(1)} star rating`
    : 'with good reviews'

  const categoryFilter = patterns.preferredCategories.length > 0
    ? `in ${patterns.preferredCategories.join(' or ')} category`
    : `in ${product.category} category`

  // Build comprehensive query
  let query = `Find similar products to "${product.title}" `
  
  // Add category
  query += `${categoryFilter}. `
  
  // Add price preference
  if (criteria.userGoals.includes('save-money')) {
    query += `Find cheaper alternatives ${priceRange}. `
  } else if (criteria.priceSensitivity.level === 'premium') {
    query += `Find high-quality options, price is less important. `
  } else {
    query += `Find options ${priceRange}. `
  }
  
  // Add quality preference
  if (criteria.userGoals.includes('quality-first')) {
    query += `Prioritize high-quality products ${qualityFilter}. `
  }
  
  // Add eco-friendly preference
  if (criteria.userGoals.includes('eco-friendly')) {
    query += `Prioritize eco-friendly, organic, or sustainable options. `
  }
  
  // Add specific features if available
  if (product.features && product.features.length > 0) {
    query += `Products should have similar features: ${product.features.slice(0, 3).join(', ')}. `
  }
  
  // Request structured output
  query += `Return a list of 5 similar products with: product name, approximate price in USD, rating if available, and why it's a good alternative. Format as a JSON array with fields: title, price, priceNumeric, rating, category, features (array), and whyRecommended (string).`

  return query
}

/**
 * Call Perplexity API with timeout protection
 */
async function callPerplexityAPI(query: string): Promise<string> {
  try {
    console.log('📡 Calling Perplexity API...', { queryLength: query.length })

    // Create timeout promise (30 seconds for Perplexity - increased to allow for full response)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Perplexity API timeout after 30 seconds')), 30000)
    )

    // Create fetch promise
    const fetchPromise = fetch(PERPLEXITY_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_CONFIG.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Updated from deprecated llama-3.1-sonar-large-128k-online
        messages: [
          {
            role: 'system',
            content: 'You are a shopping assistant that finds similar products. Always return valid JSON arrays with product information. Include real product names, realistic prices, and ratings when available.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise])

    console.log('📡 Perplexity API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Perplexity API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`)
    }

    const data: PerplexityResponse = await response.json()
    console.log('📥 Perplexity API response received')
    
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in Perplexity response')
    }

    return content
  } catch (error) {
    console.error('❌ Error calling Perplexity API:', error)
    throw error
  }
}

/**
 * Parse Perplexity response into Product objects
 * Handles incomplete/truncated JSON responses gracefully
 */
function parsePerplexityResponse(response: string, targetProduct: Product): Product[] {
  try {
    console.log('🔍 Parsing Perplexity response, length:', response.length)
    console.log('   Preview:', response.substring(0, 300) + (response.length > 300 ? '...' : ''))
    
    // Extract JSON from response (might have markdown code blocks)
    let jsonText = response.trim()
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Try to find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    // Try to parse the JSON
    let products: any[]
    try {
      products = JSON.parse(jsonText)
    } catch (parseError) {
      console.warn('⚠️ Initial JSON parse failed, attempting to fix truncated JSON...')
      console.warn('   Error:', parseError instanceof Error ? parseError.message : String(parseError))
      
      // Try to extract valid JSON from truncated response
      // Find the last complete object in the array
      let fixedJson = jsonText
      
      // Try to find and close incomplete objects/arrays
      // Count brackets to find where JSON might be valid
      let openBrackets = 0
      let lastValidIndex = -1
      
      for (let i = 0; i < jsonText.length; i++) {
        if (jsonText[i] === '[') openBrackets++
        if (jsonText[i] === ']') openBrackets--
        
        // If we have a complete array structure, this might be valid
        if (openBrackets === 0 && i > 0) {
          lastValidIndex = i
        }
      }
      
      // Try to extract valid JSON up to the last complete object
      if (lastValidIndex > 0) {
        // Find the last complete object before truncation
        const lastCompleteObject = jsonText.lastIndexOf('},', lastValidIndex)
        if (lastCompleteObject > 0) {
          fixedJson = jsonText.substring(0, lastCompleteObject + 1) + ']'
          console.log('   Attempting to fix by extracting up to last complete object')
        } else {
          // Try to close the array properly
          fixedJson = jsonText.replace(/,\s*$/, '') + ']'
          console.log('   Attempting to fix by closing array')
        }
      } else {
        // Last resort: try to extract just the first complete objects
        const firstObjects = jsonText.match(/\[[\s\S]*?\}(?:\s*,\s*\{[\s\S]*?\})*/)
        if (firstObjects) {
          fixedJson = firstObjects[0] + ']'
          console.log('   Attempting to fix by extracting first complete objects')
        }
      }
      
      try {
        products = JSON.parse(fixedJson)
        console.log('✅ Successfully parsed fixed JSON')
      } catch (fixError) {
        console.error('❌ Failed to fix JSON, returning empty array')
        console.error('   Original error:', parseError)
        console.error('   Fix attempt error:', fixError)
        return [] // Return empty array instead of crashing
      }
    }

    if (!Array.isArray(products)) {
      throw new Error('Perplexity response is not an array')
    }

    // Convert to Product format
    return products.map((item: any, index: number) => {
      // Extract price numeric value
      let priceNumeric = targetProduct.priceNumeric * 0.8 // Default to 80% of target
      if (item.priceNumeric) {
        priceNumeric = parseFloat(item.priceNumeric)
      } else if (item.price) {
        // Extract number from price string like "$45.99" or "45.99"
        const priceMatch = item.price.toString().match(/(\d+\.?\d*)/)
        if (priceMatch) {
          priceNumeric = parseFloat(priceMatch[1])
        }
      }

      // Format price string
      const priceString = item.price || `$${priceNumeric.toFixed(2)}`

      return {
        id: `perplexity-${index}-${Date.now()}`,
        title: item.title || item.name || 'Similar Product',
        price: priceString,
        priceNumeric: priceNumeric,
        image: item.image || targetProduct.image, // Use target product image as fallback
        category: item.category || targetProduct.category,
        rating: item.rating ? parseFloat(item.rating) : (targetProduct.rating || 4.0),
        features: item.features || [],
        url: item.url || item.link || undefined,
        whyRecommended: item.whyRecommended || item.reason || 'Similar product matching your preferences',
      } as Product & { whyRecommended?: string }
    }).filter((p: Product) => p.title && p.title !== 'Similar Product')
  } catch (error) {
    console.error('❌ Error parsing Perplexity response:', error)
    console.error('Response text:', response.substring(0, 500))
    return []
  }
}

/**
 * Search for products matching specific criteria
 */
export async function searchProductsByCriteria(
  criteria: RecommendationCriteria,
  patterns: any,
  searchTerm?: string
): Promise<Product[]> {
  try {
    let query = 'Find products on Amazon that match these criteria: '
    
    // Add goals
    if (criteria.userGoals.includes('save-money')) {
      query += `Budget-friendly options under $${criteria.priceSensitivity.maxPrice}. `
    }
    
    if (criteria.userGoals.includes('quality-first')) {
      query += `High-quality products with 4.5+ star ratings. `
    }
    
    if (criteria.userGoals.includes('eco-friendly')) {
      query += `Eco-friendly, organic, or sustainable products. `
    }
    
    // Add category preferences
    if (patterns.preferredCategories.length > 0) {
      query += `In categories: ${patterns.preferredCategories.join(', ')}. `
    }
    
    // Add search term if provided
    if (searchTerm) {
      query += `Related to: ${searchTerm}. `
    }
    
    query += `Return 5 products as JSON array with: title, price, priceNumeric, rating, category, features, and url.`

    const response = await callPerplexityAPI(query)
    const products = parsePerplexityResponse(response, {
      id: 'search',
      title: searchTerm || 'Product',
      price: '$0',
      priceNumeric: patterns.avgLikedPrice || 50,
      image: '',
      category: patterns.preferredCategories[0] || 'General',
    } as Product)

    return products
  } catch (error) {
    console.error('❌ Perplexity criteria search failed:', error)
    return []
  }
}

export const PerplexityService = {
  searchSimilarProducts,
  searchProductsByCriteria,
}

