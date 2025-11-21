/**
 * Rate Limiter
 * Prevents excessive API calls by limiting requests per time window
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

class RateLimiter {
  private requests = new Map<string, number[]>()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  /**
   * Check if request is allowed and record it
   */
  async check(key: string): Promise<boolean> {
    const now = Date.now()
    const windowStart = now - this.config.windowMs

    // Get or create request history for this key
    let requestTimes = this.requests.get(key) || []
    
    // Remove old requests outside the window
    requestTimes = requestTimes.filter(time => time > windowStart)
    
    // Check if we've exceeded the limit
    if (requestTimes.length >= this.config.maxRequests) {
      const oldestRequest = requestTimes[0]
      const waitTime = oldestRequest + this.config.windowMs - now
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000)} seconds.`,
        waitTime
      )
    }

    // Record this request
    requestTimes.push(now)
    this.requests.set(key, requestTimes)

    return true
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string): number {
    const now = Date.now()
    const windowStart = now - this.config.windowMs
    const requestTimes = this.requests.get(key) || []
    const validRequests = requestTimes.filter(time => time > windowStart).length
    
    return Math.max(0, this.config.maxRequests - validRequests)
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear()
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public waitTime: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

// Default rate limiter configurations
export const geminiRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
})

export const perplexityRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
})

export const supabaseRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
})

