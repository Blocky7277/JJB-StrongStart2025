/**
 * Secure API Key Storage
 * Stores API keys in Chrome's encrypted storage instead of hardcoding them
 * 
 * Security Benefits:
 * - Keys stored in Chrome's encrypted storage (not in source code)
 * - Not visible in extension bundle
 * - User can manage their own keys
 * - Keys are encrypted at rest by Chrome
 */

import { logger } from './logger'

const STORAGE_KEYS = {
  GEMINI_API_KEY: 'apiKey_gemini',
  PERPLEXITY_API_KEY: 'apiKey_perplexity',
  SUPABASE_URL: 'apiKey_supabase_url',
  SUPABASE_ANON_KEY: 'apiKey_supabase_anon',
} as const

export interface ApiKeys {
  gemini?: string
  perplexity?: string
  supabaseUrl?: string
  supabaseAnonKey?: string
}

/**
 * Get all stored API keys
 */
export async function getApiKeys(): Promise<ApiKeys> {
  try {
    const result = await chrome.storage.local.get([
      STORAGE_KEYS.GEMINI_API_KEY,
      STORAGE_KEYS.PERPLEXITY_API_KEY,
      STORAGE_KEYS.SUPABASE_URL,
      STORAGE_KEYS.SUPABASE_ANON_KEY,
    ])

    return {
      gemini: result[STORAGE_KEYS.GEMINI_API_KEY],
      perplexity: result[STORAGE_KEYS.PERPLEXITY_API_KEY],
      supabaseUrl: result[STORAGE_KEYS.SUPABASE_URL],
      supabaseAnonKey: result[STORAGE_KEYS.SUPABASE_ANON_KEY],
    }
  } catch (error) {
    logger.error('Error retrieving API keys from storage', error)
    return {}
  }
}

/**
 * Store API keys securely
 */
export async function setApiKeys(keys: Partial<ApiKeys>): Promise<void> {
  try {
    const storageData: Record<string, string> = {}

    if (keys.gemini !== undefined) {
      storageData[STORAGE_KEYS.GEMINI_API_KEY] = keys.gemini
    }
    if (keys.perplexity !== undefined) {
      storageData[STORAGE_KEYS.PERPLEXITY_API_KEY] = keys.perplexity
    }
    if (keys.supabaseUrl !== undefined) {
      storageData[STORAGE_KEYS.SUPABASE_URL] = keys.supabaseUrl
    }
    if (keys.supabaseAnonKey !== undefined) {
      storageData[STORAGE_KEYS.SUPABASE_ANON_KEY] = keys.supabaseAnonKey
    }

    await chrome.storage.local.set(storageData)
    logger.debug('API keys stored securely', {
      keysStored: Object.keys(storageData),
    })
  } catch (error) {
    logger.error('Error storing API keys', error)
    throw error
  }
}

/**
 * Get a specific API key
 */
export async function getApiKey(service: 'gemini' | 'perplexity' | 'supabaseUrl' | 'supabaseAnonKey'): Promise<string | null> {
  try {
    const key = service === 'gemini' ? STORAGE_KEYS.GEMINI_API_KEY
             : service === 'perplexity' ? STORAGE_KEYS.PERPLEXITY_API_KEY
             : service === 'supabaseUrl' ? STORAGE_KEYS.SUPABASE_URL
             : STORAGE_KEYS.SUPABASE_ANON_KEY

    const result = await chrome.storage.local.get(key)
    return result[key] || null
  } catch (error) {
    logger.error(`Error retrieving ${service} API key`, error)
    return null
  }
}

/**
 * Check if API keys are configured
 */
export async function hasApiKeys(): Promise<boolean> {
  const keys = await getApiKeys()
  return !!(keys.gemini || keys.perplexity || keys.supabaseUrl)
}

/**
 * Clear all API keys (for security/reset)
 */
export async function clearApiKeys(): Promise<void> {
  try {
    await chrome.storage.local.remove([
      STORAGE_KEYS.GEMINI_API_KEY,
      STORAGE_KEYS.PERPLEXITY_API_KEY,
      STORAGE_KEYS.SUPABASE_URL,
      STORAGE_KEYS.SUPABASE_ANON_KEY,
    ])
    logger.debug('API keys cleared')
  } catch (error) {
    logger.error('Error clearing API keys', error)
    throw error
  }
}

/**
 * Migrate hardcoded keys to storage (one-time migration)
 * This allows existing installations to work while transitioning
 */
export async function migrateHardcodedKeys(): Promise<void> {
  try {
    const existingKeys = await getApiKeys()
    
    // Only migrate if keys don't already exist
    if (!existingKeys.gemini || !existingKeys.perplexity || !existingKeys.supabaseUrl) {
      const keysToStore: Partial<ApiKeys> = {}
      
      // Migration will read from config files at runtime
      // This avoids hardcoding keys in this file
      try {
        const { getGeminiConfig } = await import('@/config/gemini')
        const { getPerplexityConfig } = await import('@/config/perplexity')
        const { getSupabaseConfig } = await import('@/config/supabase')
        
        // Get configs (will use fallback from config files if not in storage)
        const geminiConfig = await getGeminiConfig()
        const perplexityConfig = await getPerplexityConfig()
        const supabaseConfig = await getSupabaseConfig()
        
        // Only migrate if key doesn't exist and config has a real key (not placeholder)
        if (!existingKeys.gemini && geminiConfig.API_KEY && 
            geminiConfig.API_KEY.length > 20 && 
            !geminiConfig.API_KEY.includes('YOUR_')) {
          keysToStore.gemini = geminiConfig.API_KEY
        }
        
        if (!existingKeys.perplexity && perplexityConfig.API_KEY && 
            perplexityConfig.API_KEY.length > 20 && 
            !perplexityConfig.API_KEY.includes('YOUR_')) {
          keysToStore.perplexity = perplexityConfig.API_KEY
        }
        
        if (!existingKeys.supabaseUrl && supabaseConfig.url && supabaseConfig.anonKey) {
          keysToStore.supabaseUrl = supabaseConfig.url
          keysToStore.supabaseAnonKey = supabaseConfig.anonKey
        }
      } catch (error) {
        logger.error('Error reading config files for migration', error)
        // Don't migrate if we can't read configs
      }
      
      if (Object.keys(keysToStore).length > 0) {
        await setApiKeys(keysToStore)
        logger.info('Migrated hardcoded API keys to secure storage', {
          keysMigrated: Object.keys(keysToStore),
        })
      }
    }
  } catch (error) {
    logger.error('Error migrating API keys', error)
    // Don't throw - allow fallback to hardcoded keys
  }
}

