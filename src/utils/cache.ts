/**
 * API Response Cache
 * Reduces redundant API calls by caching responses
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class Cache {
  private storage = new Map<string, CacheEntry<any>>()
  private defaultTTL = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.storage.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.storage.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Store data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.storage.set(key, {
      data,
      timestamp: now,
      expiresAt,
    })
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove specific cache entry
   */
  delete(key: string): void {
    this.storage.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.storage.clear()
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.storage.entries()) {
      if (now > entry.expiresAt) {
        this.storage.delete(key)
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now()
    let valid = 0
    let expired = 0

    for (const entry of this.storage.values()) {
      if (now > entry.expiresAt) {
        expired++
      } else {
        valid++
      }
    }

    return {
      total: this.storage.size,
      valid,
      expired,
    }
  }
}

export const cache = new Cache()

// Cleanup expired entries every hour
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 60 * 60 * 1000)
}





