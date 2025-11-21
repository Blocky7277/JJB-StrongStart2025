/**
 * Centralized Error Handling
 * Provides consistent error handling patterns and retry logic
 */

import { logger } from './logger'

export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  retryable?: (error: Error) => boolean
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    exponentialBackoff = true,
    retryable = () => true,
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Check if error is retryable
      if (!retryable(lastError)) {
        throw lastError
      }

      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break
      }

      // Calculate delay with exponential backoff
      const delay = exponentialBackoff
        ? retryDelay * Math.pow(2, attempt)
        : retryDelay

      logger.warn(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        { error: lastError.message }
      )

      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Unknown error')
}

/**
 * Check if error is a network error (retryable)
 */
export function isRetryableError(error: Error): boolean {
  // Network errors
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return true
  }

  // Timeout errors
  if (error.message.includes('timeout')) {
    return true
  }

  // 5xx server errors
  if (error.message.match(/5\d{2}/)) {
    return true
  }

  // Rate limit errors (don't retry immediately)
  if (error.name === 'RateLimitError') {
    return false
  }

  // 4xx client errors (don't retry)
  if (error.message.match(/4\d{2}/)) {
    return false
  }

  return true
}

/**
 * Safe async wrapper that catches and logs errors
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallback?: T,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn()
  } catch (error) {
    logger.error(errorMessage || 'Async operation failed', error)
    return fallback !== undefined ? fallback : null
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  code?: string,
  details?: any
): { error: string; code?: string; details?: any } {
  return {
    error: message,
    code,
    details,
  }
}





