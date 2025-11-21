/**
 * Gemini AI Service
 * Handles all AI-powered analysis using Google's Gemini API
 */

import { GEMINI_CONFIG } from '@/config/gemini'
import { Product, UserPreferences, RecommendationCriteria } from '@/types/onboarding'

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

interface MatchScoreAnalysis {
  score: number
  recommendation: 'buy' | 'consider' | 'skip'
  reasons: string[]
  confidence: number
  breakdown: {
    price: { score: number; reasoning: string }
    quality: { score: number; reasoning: string }
    goals: { score: number; reasoning: string }
    category: { score: number; reasoning: string }
  }
}

interface ProductInsights {
  summary: string
  strengths: string[]
  concerns: string[]
  valueAssessment: string
  recommendation: string
  alternativeConsiderations: string[]
}

interface RecommendationAnalysis {
  product: Product
  score: number
  reasons: string[]
  comparison: string
  savings?: number
}

/**
 * Call Gemini API with a prompt and 5-minute timeout protection
 */
async function callGemini(prompt: string): Promise<string> {
  try {
    console.log('📡 Calling Gemini API...', {
      url: GEMINI_CONFIG.API_URL,
      keyLength: GEMINI_CONFIG.API_KEY.length,
      promptLength: prompt.length
    })

    // Create timeout promise (5 minutes for Gemini API)
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Gemini API timeout after 5 minutes')), 300000)
    )

    // Create fetch promise
    const fetchPromise = fetch(
      `${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    )

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise])

    console.log('📡 Gemini API response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      })
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data: GeminiResponse = await response.json()
    console.log('📥 Gemini API response data:', data)
    
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('❌ No text in Gemini response:', data)
      throw new Error('No response text from Gemini API')
    }

    console.log('✅ Gemini API response text length:', text.length)
    return text
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }
    throw error
  }
}

/**
 * Parse JSON response from Gemini, handling markdown code blocks
 */
function parseJSONResponse(response: string): any {
  console.log('🔍 Parsing JSON response, length:', response.length)
  console.log('🔍 First 200 chars:', response.substring(0, 200))
  
  // Remove markdown code blocks if present
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  
  // Remove any leading/trailing whitespace or newlines
  cleaned = cleaned.trim()
  
  try {
    const parsed = JSON.parse(cleaned)
    console.log('✅ Successfully parsed JSON')
    return parsed
  } catch (error) {
    console.error('❌ JSON parse error:', error)
    console.error('❌ Attempted to parse:', cleaned.substring(0, 500))
    
    // If JSON parsing fails, try to extract JSON from the response
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        console.log('🔄 Trying to extract JSON from response...')
        const extracted = JSON.parse(jsonMatch[0])
        console.log('✅ Successfully extracted and parsed JSON')
        return extracted
      } catch (extractError) {
        console.error('❌ Failed to parse extracted JSON:', extractError)
        throw new Error(`Could not parse JSON from Gemini response: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    throw new Error(`Could not parse JSON from Gemini response. Original error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate comprehensive match score analysis using Gemini
 */
export async function analyzeMatchScore(
  product: Product,
  criteria: RecommendationCriteria,
  userPatterns: {
    avgLikedPrice: number
    avgDislikedPrice: number
    preferredCategories: string[]
    avoidedCategories: string[]
    qualityThreshold: number
  }
): Promise<MatchScoreAnalysis> {
  const prompt = `You are a personal shopping assistant helping analyze whether a product matches YOUR preferences.

## YOUR PROFILE:
- Your Goals: ${JSON.stringify(criteria.userGoals)}
- Goal Weights: ${JSON.stringify(criteria.goalWeights)}
- Your Price Sensitivity: ${criteria.priceSensitivity.level} (max: $${criteria.priceSensitivity.maxPrice})
- You're Willing to Pay More for Quality: ${criteria.priceSensitivity.willingToPayMore}

## YOUR SHOPPING PATTERNS (from your past behavior):
- Your Average Liked Price: $${userPatterns.avgLikedPrice.toFixed(2)}
- Your Average Disliked Price: $${userPatterns.avgDislikedPrice.toFixed(2)}
- Your Preferred Categories: ${userPatterns.preferredCategories.join(', ') || 'None'}
- Categories You Avoid: ${userPatterns.avoidedCategories.join(', ') || 'None'}
- Your Quality Threshold: ${userPatterns.qualityThreshold.toFixed(1)} stars

## PRODUCT YOU'RE CONSIDERING:
- Title: ${product.title}
- Price: $${product.priceNumeric.toFixed(2)}
- Category: ${product.category}
- Rating: ${product.rating ? product.rating.toFixed(1) + ' stars' : 'No rating'}
- Features: ${product.features?.join(', ') || 'None'}

## YOUR TASK:
Analyze this product against YOUR profile and provide a comprehensive match score analysis. Write as if speaking directly to the user using "you" and "your".

Consider:
1. **Price Match** (40% weight): Compare price to YOUR typical spending and price sensitivity
2. **Quality Assessment** (30% weight): Compare rating to YOUR quality threshold
3. **Goal Alignment** (30% weight): How well does this product match YOUR stated goals?
4. **Category Preference**: Do YOU typically like/dislike this category?

## OUTPUT FORMAT (JSON only, no markdown):
{
  "score": 0.0-1.0,
  "recommendation": "buy" | "consider" | "skip",
  "reasons": ["reason1", "reason2", "reason3"],
  "confidence": 0.0-1.0,
  "breakdown": {
    "price": {
      "score": 0.0-1.0,
      "reasoning": "Detailed explanation of price analysis"
    },
    "quality": {
      "score": 0.0-1.0,
      "reasoning": "Detailed explanation of quality assessment"
    },
    "goals": {
      "score": 0.0-1.0,
      "reasoning": "Detailed explanation of goal alignment"
    },
    "category": {
      "score": 0.0-1.0,
      "reasoning": "Detailed explanation of category preference"
    }
  }
}

## SCORING GUIDELINES:
- Score 0.7-1.0 = "buy" (strong match, highly recommended)
- Score 0.4-0.69 = "consider" (moderate match, worth thinking about)
- Score 0.0-0.39 = "skip" (weak match, not recommended)

Be specific in your reasoning. Consider YOUR past behavior patterns, not just stated preferences. Write in second person (use "you", "your", "you're" instead of "the user", "user's", "they", "their").

Respond with ONLY valid JSON, no additional text.`

  const response = await callGemini(prompt)
  return parseJSONResponse(response)
}

/**
 * Generate comprehensive product insights using Gemini
 */
export async function generateProductInsights(
  product: Product,
  criteria: RecommendationCriteria,
  userPatterns: any,
  alternatives: Product[]
): Promise<ProductInsights> {
  const prompt = `You are a personal shopping advisor providing personalized product insights. Write as if speaking directly to the user using "you" and "your".

## YOUR PROFILE:
- Your Goals: ${JSON.stringify(criteria.userGoals)}
- Your Price Sensitivity: ${criteria.priceSensitivity.level}
- Your Preferred Categories: ${userPatterns.preferredCategories.join(', ') || 'None'}

## PRODUCT YOU'RE CONSIDERING:
- Title: ${product.title}
- Price: $${product.priceNumeric.toFixed(2)}
- Category: ${product.category}
- Rating: ${product.rating ? product.rating.toFixed(1) + ' stars' : 'No rating'}
- Features: ${product.features?.join(', ') || 'None'}

## AVAILABLE ALTERNATIVES:
${alternatives.map((alt, i) => `
${i + 1}. ${alt.title}
   - Price: $${alt.priceNumeric.toFixed(2)}
   - Rating: ${alt.rating ? alt.rating.toFixed(1) + ' stars' : 'No rating'}
   - Category: ${alt.category}
`).join('')}

## YOUR TASK:
Provide comprehensive, personalized insights about this product. Write directly to the user using "you" and "your". Be conversational, helpful, and specific.

## OUTPUT FORMAT (JSON only):
{
  "summary": "2-3 sentence overview of the product and its fit for YOU (use 'you' and 'your')",
  "strengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "valueAssessment": "Detailed assessment of value proposition for YOU (2-3 sentences, use 'you' and 'your')",
  "recommendation": "Personalized recommendation with specific reasoning for YOU (2-3 sentences, use 'you' and 'your')",
  "alternativeConsiderations": ["consideration1", "consideration2"]
}

Be specific, actionable, and reference YOUR goals and preferences. Use natural, conversational language. Always use second person ("you", "your", "you're") instead of third person ("the user", "user's", "they", "their").

Respond with ONLY valid JSON, no additional text.`

  const response = await callGemini(prompt)
  return parseJSONResponse(response)
}

/**
 * Analyze and rank alternative products using Gemini
 */
export async function analyzeAlternatives(
  targetProduct: Product,
  alternatives: Product[],
  criteria: RecommendationCriteria
): Promise<RecommendationAnalysis[]> {
  const prompt = `You are a personal product comparison assistant helping YOU find the best alternative products. Write as if speaking directly to the user using "you" and "your".

## YOUR PROFILE:
- Your Goals: ${JSON.stringify(criteria.userGoals)}
- Your Goal Weights: ${JSON.stringify(criteria.goalWeights)}
- Your Price Sensitivity: ${criteria.priceSensitivity.level}
- Your Max Price: $${criteria.priceSensitivity.maxPrice}

## TARGET PRODUCT (what YOU are considering):
- Title: ${targetProduct.title}
- Price: $${targetProduct.priceNumeric.toFixed(2)}
- Category: ${targetProduct.category}
- Rating: ${targetProduct.rating ? targetProduct.rating.toFixed(1) + ' stars' : 'No rating'}

## ALTERNATIVE PRODUCTS TO ANALYZE:
${alternatives.map((alt, i) => `
${i + 1}. ${alt.title}
   - Price: $${alt.priceNumeric.toFixed(2)}
   - Category: ${alt.category}
   - Rating: ${alt.rating ? alt.rating.toFixed(1) + ' stars' : 'No rating'}
   - Features: ${alt.features?.join(', ') || 'None'}
`).join('')}

## YOUR TASK:
For each alternative, calculate a recommendation score (0.0-1.0) and provide detailed analysis. Use the EXACT product title from the alternatives list above - do not create generic names.

Consider:
1. **Price Advantage** (40%): How much cheaper/better value for YOU?
2. **Quality Comparison** (30%): Better/worse quality than target for YOU?
3. **Goal Alignment** (30%): How well does it match YOUR goals?

## OUTPUT FORMAT (JSON array):
[
  {
    "product": {
      "title": "EXACT product title from the alternatives list above - use the real product name, not generic names",
      "priceNumeric": 0.0,
      "category": "category",
      "rating": 0.0
    },
    "score": 0.0-1.0,
    "reasons": ["reason1 for YOU", "reason2 for YOU", "reason3 for YOU"],
    "comparison": "Detailed comparison to target product for YOU (2-3 sentences, use 'you' and 'your')",
    "savings": 0.0 (if cheaper, otherwise omit)
  }
]

IMPORTANT: Use the EXACT product titles from the alternatives list above. Do NOT create generic names like "General Alternative 1" or "Budget Option". Use the real product names provided.

Rank by score (highest first). Only include products with score > 0.5. Maximum 5 products.

Be specific about why each alternative is better/worse for YOU. Reference YOUR goals explicitly. Use second person ("you", "your") instead of third person.

Respond with ONLY valid JSON array, no additional text.`

  const response = await callGemini(prompt)
  const results = parseJSONResponse(response)
  
  // Map back to full Product objects - preserve original product data
  return results.map((result: any) => {
    // Try to find matching product by title (exact match or contains)
    let fullProduct = alternatives.find(
      (alt) => alt.title === result.product.title || alt.id === result.product.id
    )
    
    // If no exact match, try partial title match (in case Gemini modified the name slightly)
    if (!fullProduct && result.product.title) {
      fullProduct = alternatives.find(
        (alt) => alt.title.toLowerCase().includes(result.product.title.toLowerCase().substring(0, 20)) ||
                 result.product.title.toLowerCase().includes(alt.title.toLowerCase().substring(0, 20))
      )
    }
    
    // Always use the original product from alternatives list to preserve real names
    if (fullProduct) {
      return {
        ...result,
        product: fullProduct, // Use original product with real name
        reasons: result.reasons || [],
        comparison: result.comparison || '',
        savings: result.savings,
      }
    }
    
    // Fallback: use result but ensure we have a real product name
    return {
      ...result,
      product: {
        ...result.product,
        // Keep original title if it looks like a real product name
        title: result.product.title && !result.product.title.includes('Alternative') 
          ? result.product.title 
          : alternatives[0]?.title || result.product.title, // Use first alternative's name as fallback
      },
    }
  }).sort((a: RecommendationAnalysis, b: RecommendationAnalysis) => b.score - a.score)
}

/**
 * Generate personalized shopping insights from user data
 */
export async function generatePersonalizedInsights(
  preferences: UserPreferences,
  recentDecisions: any[]
): Promise<string> {
  const prompt = `You are a personal shopping advisor analyzing a user's shopping behavior to provide insights.

## USER PREFERENCES:
- Goals: ${JSON.stringify(preferences.goals)}
- Goal Weights: ${JSON.stringify(preferences.goalWeights)}
- Price Sensitivity: ${preferences.priceSensitivity.level}
- Liked Products: ${preferences.likedProducts.length} items
- Disliked Products: ${preferences.dislikedProducts.length} items

## RECENT ACTIVITY:
${recentDecisions.length > 0 ? recentDecisions.map((d, i) => `
${i + 1}. ${d.product?.title || 'Product'} - ${d.decision} (${new Date(d.timestamp).toLocaleDateString()})
`).join('') : 'No recent activity'}

## YOUR TASK:
Analyze the user's shopping patterns and provide personalized insights and recommendations.

Generate a comprehensive analysis (3-4 paragraphs) covering:
1. Shopping patterns you've noticed
2. Strengths in their decision-making
3. Areas for improvement or consideration
4. Personalized recommendations for smarter shopping

Be conversational, helpful, and specific. Reference actual products and patterns from their data.

Respond with plain text (no JSON, no markdown), just the analysis.`

  return await callGemini(prompt)
}

export const GeminiService = {
  analyzeMatchScore,
  generateProductInsights,
  analyzeAlternatives,
  generatePersonalizedInsights,
}

