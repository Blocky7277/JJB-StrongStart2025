/**
 * Input Validation Schemas
 * Uses Zod for runtime type checking and validation
 */

import { z } from 'zod'

// Product validation schema
export const ProductSchema = z.object({
  id: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  price: z.string().regex(/^\$?\d+\.?\d{0,2}$/),
  priceNumeric: z.number().min(0).max(1000000),
  image: z.string().url().or(z.string().max(10)), // Allow emoji fallback
  category: z.string().min(1).max(100),
  rating: z.number().min(0).max(5).optional(),
  features: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  whyRecommended: z.string().max(1000).optional(),
})

export type ValidatedProduct = z.infer<typeof ProductSchema>

// User preferences validation
export const PriceSensitivitySchema = z.object({
  level: z.enum(['budget', 'moderate', 'premium', 'luxury']),
  maxPrice: z.number().min(0).optional(),
  willingToPayMore: z.boolean(),
})

export const CategoryPreferenceSchema = z.object({
  category: z.string().min(1).max(100),
  interest: z.enum(['high', 'medium', 'low']),
  averagePricePoint: z.number().min(0),
})

export const UserPreferencesSchema = z.object({
  goals: z.array(z.string()),
  goalWeights: z.record(z.string(), z.number().min(0).max(10)),
  likedProducts: z.array(ProductSchema),
  dislikedProducts: z.array(ProductSchema),
  likedCategories: z.array(z.string()),
  dislikedCategories: z.array(z.string()),
  priceSensitivity: PriceSensitivitySchema,
  categoryPreferences: z.array(CategoryPreferenceSchema),
  completedOnboarding: z.boolean(),
  onboardingDate: z.number(),
})

// Recommendation criteria validation
export const RecommendationCriteriaSchema = z.object({
  userGoals: z.array(z.string()),
  goalWeights: z.record(z.string(), z.number()),
  priceSensitivity: PriceSensitivitySchema,
  likedProducts: z.array(ProductSchema),
  preferredCategories: z.array(z.string()),
})

// API response validation
export const GeminiMatchScoreSchema = z.object({
  score: z.number().min(0).max(1),
  recommendation: z.enum(['buy', 'consider', 'skip']),
  reasons: z.array(z.string().max(500)),
  confidence: z.number().min(0).max(1).optional(),
  breakdown: z.object({
    price: z.object({
      score: z.number().min(0).max(1),
      reasoning: z.string().max(1000),
    }),
    quality: z.object({
      score: z.number().min(0).max(1),
      reasoning: z.string().max(1000),
    }),
    goals: z.object({
      score: z.number().min(0).max(1),
      reasoning: z.string().max(1000),
    }),
    category: z.object({
      score: z.number().min(0).max(1),
      reasoning: z.string().max(1000),
    }),
  }).optional(),
})

export const ProductInsightsSchema = z.object({
  summary: z.string().min(10).max(1000),
  strengths: z.array(z.string().max(500)),
  concerns: z.array(z.string().max(500)),
  valueAssessment: z.string().min(10).max(1000),
  recommendation: z.string().min(10).max(1000),
  alternativeConsiderations: z.array(z.string().max(500)),
})

/**
 * Validate and sanitize product data
 */
export function validateProduct(data: unknown): ValidatedProduct {
  return ProductSchema.parse(data)
}

/**
 * Validate product with safe fallback
 */
export function safeValidateProduct(data: unknown): ValidatedProduct | null {
  try {
    return ProductSchema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Product validation failed:', error.errors)
    }
    return null
  }
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove null bytes and control characters
  let sanitized = input
    .replace(/\0/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }
  
  return sanitized
}





