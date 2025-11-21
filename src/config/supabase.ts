/**
 * Supabase Configuration
 * Connects to Supabase database for storing user data and insights
 * 
 * Uses Chrome storage for secure configuration
 */

import { createClient } from '@supabase/supabase-js'
import { getApiKey } from '@/utils/apiKeyStorage'
import { logger } from '@/utils/logger'

// Fallback for development only
const FALLBACK_URL = 'https://xxfuvulwhkwjmjzoojqw.supabase.co'
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZnV2dWx3aGt3am1qem9vanF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NzM3MTIsImV4cCI6MjA3ODU0OTcxMn0.b9NpkelKmbc8oG99cB_YTp4DKYTKrmgqori7gpK_N6s'

// Default client (uses fallback)
export const supabase = createClient(FALLBACK_URL, FALLBACK_ANON_KEY)

/**
 * Get Supabase configuration from Chrome storage
 * Falls back to hardcoded config if not configured
 */
export async function getSupabaseConfig(): Promise<{ url: string; anonKey: string }> {
  const storedUrl = await getApiKey('supabaseUrl')
  const storedKey = await getApiKey('supabaseAnonKey')
  
  if (storedUrl && storedKey) {
    return {
      url: storedUrl,
      anonKey: storedKey,
    }
  }
  
  // Fallback for development
  logger.debug('Using fallback Supabase config. Configure in settings for production.')
  return {
    url: FALLBACK_URL,
    anonKey: FALLBACK_ANON_KEY,
  }
}

/**
 * Create Supabase client with current configuration
 */
export async function createSupabaseClient() {
  const config = await getSupabaseConfig()
  return createClient(config.url, config.anonKey)
}

// Type-safe database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          extension_user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          extension_user_id: string
        }
        Update: {
          id?: string
          updated_at?: string
          extension_user_id?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          goals: string[]
          goal_weights: Record<string, number>
          price_sensitivity: any
          category_preferences: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goals: string[]
          goal_weights: Record<string, number>
          price_sensitivity: any
          category_preferences?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          goals?: string[]
          goal_weights?: Record<string, number>
          price_sensitivity?: any
          category_preferences?: any[]
          updated_at?: string
        }
      }
      swipe_decisions: {
        Row: {
          id: string
          user_id: string
          product_id: string
          product_data: any
          decision: 'like' | 'dislike'
          timestamp: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          product_data: any
          decision: 'like' | 'dislike'
          timestamp: number
          created_at?: string
        }
        Update: {
          decision?: 'like' | 'dislike'
        }
      }
      purchase_attempts: {
        Row: {
          id: string
          user_id: string
          product_id: string
          product_data: any
          recommendation: string
          score: number
          user_decision: 'proceeded' | 'cancelled' | 'viewed_alternative'
          alternative_selected: string | null
          timestamp: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          product_data: any
          recommendation: string
          score: number
          user_decision: 'proceeded' | 'cancelled' | 'viewed_alternative'
          alternative_selected?: string | null
          timestamp: number
          created_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          product_data: any
          rating: number
          review_text: string | null
          would_recommend: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          product_data: any
          rating: number
          review_text?: string | null
          would_recommend: boolean
          created_at?: string
        }
      }
    }
  }
}

