/**
 * AI Integration Test Utility
 * Tests both Gemini and Perplexity integrations
 */

import { GeminiService } from '@/services/geminiService'
import { PerplexityService } from '@/services/perplexityService'
import { storage } from './storage'
import { RecommendationEngine } from '@/services/recommendationEngine'
import { Product } from '@/types/onboarding'

/**
 * Test Gemini AI Analysis
 */
export async function testGeminiAnalysis() {
  console.log('🧪 Testing Gemini AI Analysis...\n')

  try {
    // Get user preferences
    const preferences = await storage.getPreferences()
    if (!preferences || !preferences.completedOnboarding) {
      console.error('❌ Please complete onboarding first!')
      return false
    }

    const criteria = await storage.getRecommendationCriteria()
    if (!criteria) {
      console.error('❌ No recommendation criteria found!')
      return false
    }

    const patterns = RecommendationEngine.analyzeSwipePatterns(preferences)

    // Test product
    const testProduct: Product = {
      id: 'test-product-1',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      price: '$399.99',
      priceNumeric: 399.99,
      image: 'https://example.com/image.jpg',
      category: 'Electronics',
      rating: 4.8,
      features: ['wireless', 'noise-cancelling', 'bluetooth', 'long-battery'],
    }

    console.log('📦 Test Product:')
    console.log(`   Title: ${testProduct.title}`)
    console.log(`   Price: ${testProduct.price}`)
    console.log(`   Category: ${testProduct.category}`)
    console.log(`   Rating: ${testProduct.rating}⭐\n`)

    console.log('👤 User Profile:')
    console.log(`   Goals: ${criteria.userGoals.join(', ')}`)
    console.log(`   Price Sensitivity: ${criteria.priceSensitivity.level}`)
    console.log(`   Average Liked Price: $${patterns.avgLikedPrice.toFixed(2)}`)
    console.log(`   Quality Threshold: ${patterns.qualityThreshold.toFixed(1)}⭐`)
    console.log(`   Preferred Categories: ${patterns.preferredCategories.join(', ') || 'None'}\n`)

    // Test 1: Match Score Analysis
    console.log('🔍 Test 1: Gemini Match Score Analysis')
    console.log('─'.repeat(50))
    const matchScore = await GeminiService.analyzeMatchScore(
      testProduct,
      criteria,
      patterns
    )

    console.log('✅ Match Score Result:')
    console.log(`   Score: ${(matchScore.score * 100).toFixed(1)}%`)
    console.log(`   Recommendation: ${matchScore.recommendation.toUpperCase()}`)
    console.log(`   Confidence: ${(matchScore.confidence * 100).toFixed(1)}%`)
    console.log(`   Reasons: ${matchScore.reasons.length} reasons found\n`)

    console.log('   Breakdown:')
    Object.entries(matchScore.breakdown).forEach(([key, value]: [string, any]) => {
      console.log(`   - ${key}: ${(value.score * 100).toFixed(1)}%`)
      console.log(`     ${value.reasoning.substring(0, 80)}...`)
    })
    console.log('')

    // Test 2: Product Insights
    console.log('🔍 Test 2: Gemini Product Insights')
    console.log('─'.repeat(50))
    const insights = await GeminiService.generateProductInsights(
      testProduct,
      criteria,
      patterns,
      [] // No alternatives for this test
    )

    console.log('✅ Insights Result:')
    console.log(`   Summary: ${insights.summary.substring(0, 100)}...`)
    console.log(`   Strengths: ${insights.strengths.length} found`)
    console.log(`   Concerns: ${insights.concerns.length} found`)
    console.log(`   Value Assessment: ${insights.valueAssessment.substring(0, 100)}...`)
    console.log('')

    return true
  } catch (error) {
    console.error('❌ Gemini Test Failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
    }
    return false
  }
}

/**
 * Test Perplexity Product Search
 */
export async function testPerplexitySearch() {
  console.log('🧪 Testing Perplexity Product Search...\n')

  try {
    // Get user preferences
    const preferences = await storage.getPreferences()
    if (!preferences || !preferences.completedOnboarding) {
      console.error('❌ Please complete onboarding first!')
      return false
    }

    const criteria = await storage.getRecommendationCriteria()
    if (!criteria) {
      console.error('❌ No recommendation criteria found!')
      return false
    }

    const patterns = RecommendationEngine.analyzeSwipePatterns(preferences)

    // Test product
    const testProduct: Product = {
      id: 'test-product-1',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
      price: '$399.99',
      priceNumeric: 399.99,
      image: 'https://example.com/image.jpg',
      category: 'Electronics',
      rating: 4.8,
      features: ['wireless', 'noise-cancelling', 'bluetooth'],
    }

    console.log('📦 Searching for similar products to:')
    console.log(`   ${testProduct.title}`)
    console.log(`   Price: ${testProduct.price}`)
    console.log(`   Category: ${testProduct.category}\n`)

    console.log('👤 Filtering by:')
    console.log(`   Goals: ${criteria.userGoals.join(', ')}`)
    console.log(`   Price Range: ~$${patterns.avgLikedPrice.toFixed(0)}`)
    console.log(`   Quality: ${patterns.qualityThreshold.toFixed(1)}⭐+\n`)

    // Test Perplexity Search
    console.log('🔍 Calling Perplexity API...')
    const products = await PerplexityService.searchSimilarProducts(
      testProduct,
      criteria,
      patterns
    )

    console.log(`✅ Found ${products.length} products from Perplexity\n`)

    if (products.length === 0) {
      console.warn('⚠️ No products found. Check:')
      console.warn('   - API key is correct')
      console.warn('   - Network connection')
      console.warn('   - API rate limits')
      return false
    }

    console.log('📋 Products Found:')
    products.forEach((product, index) => {
      console.log(`\n   ${index + 1}. ${product.title}`)
      console.log(`      Price: ${product.price}`)
      console.log(`      Category: ${product.category}`)
      if (product.rating) {
        console.log(`      Rating: ${product.rating}⭐`)
      }
      if (product.whyRecommended) {
        console.log(`      Why: ${product.whyRecommended.substring(0, 80)}...`)
      }
      if (product.url) {
        console.log(`      URL: ${product.url}`)
      }
    })

    console.log('')
    return true
  } catch (error) {
    console.error('❌ Perplexity Test Failed:', error)
    if (error instanceof Error) {
      console.error('   Error:', error.message)
      console.error('   Stack:', error.stack)
    }
    return false
  }
}

/**
 * Test both AI services together
 */
export async function testBothAIServices() {
  console.log('🚀 Testing Both AI Services\n')
  console.log('='.repeat(60))
  console.log('')

  const geminiResult = await testGeminiAnalysis()
  console.log('')
  console.log('='.repeat(60))
  console.log('')

  const perplexityResult = await testPerplexitySearch()
  console.log('')
  console.log('='.repeat(60))
  console.log('')

  console.log('📊 Test Summary:')
  console.log(`   Gemini AI: ${geminiResult ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`   Perplexity: ${perplexityResult ? '✅ PASSED' : '❌ FAILED'}`)
  console.log('')

  if (geminiResult && perplexityResult) {
    console.log('🎉 All tests passed! Both AI services are working correctly.')
  } else {
    console.log('⚠️ Some tests failed. Check the errors above.')
  }

  return { gemini: geminiResult, perplexity: perplexityResult }
}

/**
 * Quick test from browser console
 */
export async function quickTest() {
  console.log('⚡ Quick AI Test\n')
  const results = await testBothAIServices()
  return results
}

