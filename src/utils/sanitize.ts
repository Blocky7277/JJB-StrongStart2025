/**
 * XSS Protection Utilities
 * Sanitizes user-generated content before rendering
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML string to prevent XSS attacks
 */
export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: basic sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '')
      .replace(/javascript:/gi, '')
  }

  // Client-side: use DOMPurify
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['class', 'style'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Escape HTML entities
 */
export function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Safe text content (prefer over innerHTML)
 */
export function safeTextContent(text: string | null | undefined, maxLength = 1000): string {
  if (!text) return ''
  
  // Basic sanitization
  let safe = String(text)
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
  
  if (safe.length > maxLength) {
    safe = safe.substring(0, maxLength) + '...'
  }
  
  return safe
}





