/**
 * API Key Manager Component
 * Allows users to securely manage their API keys in Chrome storage
 */

import { useState, useEffect } from 'react'
import { getApiKeys, setApiKeys, clearApiKeys } from '@/utils/apiKeyStorage'
import { logger } from '@/utils/logger'
import './ApiKeyManager.css'

interface ApiKeyManagerProps {
  onClose?: () => void
}

export default function ApiKeyManager({ onClose }: ApiKeyManagerProps) {
  const [keys, setKeys] = useState({
    gemini: '',
    perplexity: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
  })
  const [savedKeys, setSavedKeys] = useState({
    gemini: false,
    perplexity: false,
    supabaseUrl: false,
    supabaseAnonKey: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    try {
      const stored = await getApiKeys()
      setKeys({
        gemini: stored.gemini || '',
        perplexity: stored.perplexity || '',
        supabaseUrl: stored.supabaseUrl || '',
        supabaseAnonKey: stored.supabaseAnonKey || '',
      })
      setSavedKeys({
        gemini: !!stored.gemini,
        perplexity: !!stored.perplexity,
        supabaseUrl: !!stored.supabaseUrl,
        supabaseAnonKey: !!stored.supabaseAnonKey,
      })
    } catch (error) {
      logger.error('Error loading API keys', error)
      setMessage({ type: 'error', text: 'Failed to load API keys' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (keyType: keyof typeof keys) => {
    if (!keys[keyType].trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      await setApiKeys({ [keyType]: keys[keyType].trim() })
      setSavedKeys(prev => ({ ...prev, [keyType]: true }))
      setMessage({ type: 'success', text: `${keyType} API key saved successfully!` })
      logger.debug(`Saved ${keyType} API key`)
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      logger.error(`Error saving ${keyType} API key`, error)
      setMessage({ type: 'error', text: `Failed to save ${keyType} API key` })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setMessage(null)

    try {
      await setApiKeys(keys)
      setSavedKeys({
        gemini: !!keys.gemini,
        perplexity: !!keys.perplexity,
        supabaseUrl: !!keys.supabaseUrl,
        supabaseAnonKey: !!keys.supabaseAnonKey,
      })
      setMessage({ type: 'success', text: 'All API keys saved successfully!' })
      logger.debug('Saved all API keys')
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      logger.error('Error saving API keys', error)
      setMessage({ type: 'error', text: 'Failed to save API keys' })
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all API keys? This will disable all AI features.')) {
      return
    }

    try {
      await clearApiKeys()
      setKeys({
        gemini: '',
        perplexity: '',
        supabaseUrl: '',
        supabaseAnonKey: '',
      })
      setSavedKeys({
        gemini: false,
        perplexity: false,
        supabaseUrl: false,
        supabaseAnonKey: false,
      })
      setMessage({ type: 'success', text: 'All API keys cleared' })
      logger.debug('Cleared all API keys')
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      logger.error('Error clearing API keys', error)
      setMessage({ type: 'error', text: 'Failed to clear API keys' })
    }
  }

  if (loading) {
    return (
      <div className="api-key-manager">
        <div className="api-key-loading">Loading API keys...</div>
      </div>
    )
  }

  return (
    <div className="api-key-manager">
      <div className="api-key-header">
        <h2>🔐 API Key Management</h2>
        <p className="api-key-subtitle">
          Your API keys are stored securely in Chrome's encrypted storage.
          They are never exposed in the extension bundle or sent to external servers.
        </p>
        {onClose && (
          <button className="api-key-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {message && (
        <div className={`api-key-message api-key-message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="api-key-list">
        {/* Gemini API Key */}
        <div className="api-key-item">
          <div className="api-key-label">
            <label htmlFor="gemini-key">Gemini API Key</label>
            <span className="api-key-status">
              {savedKeys.gemini ? '✅ Saved' : '⚠️ Not configured'}
            </span>
          </div>
          <div className="api-key-input-group">
            <input
              id="gemini-key"
              type="password"
              value={keys.gemini}
              onChange={(e) => setKeys(prev => ({ ...prev, gemini: e.target.value }))}
              placeholder="Enter your Gemini API key"
              className="api-key-input"
            />
            <button
              onClick={() => handleSave('gemini')}
              disabled={saving || !keys.gemini.trim()}
              className="api-key-save-btn"
            >
              Save
            </button>
          </div>
          <a
            href="https://makersuite.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="api-key-link"
          >
            Get your Gemini API key →
          </a>
        </div>

        {/* Perplexity API Key */}
        <div className="api-key-item">
          <div className="api-key-label">
            <label htmlFor="perplexity-key">Perplexity API Key</label>
            <span className="api-key-status">
              {savedKeys.perplexity ? '✅ Saved' : '⚠️ Not configured'}
            </span>
          </div>
          <div className="api-key-input-group">
            <input
              id="perplexity-key"
              type="password"
              value={keys.perplexity}
              onChange={(e) => setKeys(prev => ({ ...prev, perplexity: e.target.value }))}
              placeholder="Enter your Perplexity API key"
              className="api-key-input"
            />
            <button
              onClick={() => handleSave('perplexity')}
              disabled={saving || !keys.perplexity.trim()}
              className="api-key-save-btn"
            >
              Save
            </button>
          </div>
          <a
            href="https://www.perplexity.ai/api-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="api-key-link"
          >
            Get your Perplexity API key →
          </a>
        </div>

        {/* Supabase URL */}
        <div className="api-key-item">
          <div className="api-key-label">
            <label htmlFor="supabase-url">Supabase URL</label>
            <span className="api-key-status">
              {savedKeys.supabaseUrl ? '✅ Saved' : '⚠️ Not configured'}
            </span>
          </div>
          <div className="api-key-input-group">
            <input
              id="supabase-url"
              type="text"
              value={keys.supabaseUrl}
              onChange={(e) => setKeys(prev => ({ ...prev, supabaseUrl: e.target.value }))}
              placeholder="https://your-project.supabase.co"
              className="api-key-input"
            />
            <button
              onClick={() => handleSave('supabaseUrl')}
              disabled={saving || !keys.supabaseUrl.trim()}
              className="api-key-save-btn"
            >
              Save
            </button>
          </div>
        </div>

        {/* Supabase Anon Key */}
        <div className="api-key-item">
          <div className="api-key-label">
            <label htmlFor="supabase-key">Supabase Anon Key</label>
            <span className="api-key-status">
              {savedKeys.supabaseAnonKey ? '✅ Saved' : '⚠️ Not configured'}
            </span>
          </div>
          <div className="api-key-input-group">
            <input
              id="supabase-key"
              type="password"
              value={keys.supabaseAnonKey}
              onChange={(e) => setKeys(prev => ({ ...prev, supabaseAnonKey: e.target.value }))}
              placeholder="Enter your Supabase anon key"
              className="api-key-input"
            />
            <button
              onClick={() => handleSave('supabaseAnonKey')}
              disabled={saving || !keys.supabaseAnonKey.trim()}
              className="api-key-save-btn"
            >
              Save
            </button>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="api-key-link"
          >
            Get your Supabase keys →
          </a>
        </div>
      </div>

      <div className="api-key-actions">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="api-key-save-all-btn"
        >
          Save All Keys
        </button>
        <button
          onClick={handleClear}
          disabled={saving}
          className="api-key-clear-btn"
        >
          Clear All Keys
        </button>
      </div>
    </div>
  )
}





