import { useState, useEffect } from 'react'
import { UserPreferences, PriceSensitivity } from '@/types/onboarding'
import { storage } from '@/utils/storage'
import './PreferenceEditor.css'

interface PreferenceEditorProps {
  onClose: () => void
}

const GOAL_OPTIONS = [
  { id: 'save-money', title: 'Save Money', icon: '💰' },
  { id: 'quality-first', title: 'Quality First', icon: '⭐' },
  { id: 'eco-friendly', title: 'Eco-Friendly', icon: '🌱' },
  { id: 'time-saver', title: 'Save Time', icon: '⚡' },
  { id: 'avoid-clutter', title: 'Minimize Clutter', icon: '🎯' },
  { id: 'research-helper', title: 'Better Research', icon: '🔍' },
]

const PRICE_LEVELS = [
  { level: 'budget' as const, title: 'Budget Shopper', icon: '💵' },
  { level: 'moderate' as const, title: 'Value Seeker', icon: '⚖️' },
  { level: 'premium' as const, title: 'Quality Focused', icon: '✨' },
  { level: 'luxury' as const, title: 'Premium Buyer', icon: '💎' },
]

export default function PreferenceEditor({ onClose }: PreferenceEditorProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    const prefs = await storage.getPreferences()
    setPreferences(prefs)
    setLoading(false)
  }

  const toggleGoal = (goalId: string) => {
    if (!preferences) return
    
    const goals = preferences.goals.includes(goalId)
      ? preferences.goals.filter(g => g !== goalId)
      : [...preferences.goals, goalId]
    
    setPreferences({ ...preferences, goals })
  }

  const updatePriceLevel = (level: PriceSensitivity['level']) => {
    if (!preferences) return
    
    setPreferences({
      ...preferences,
      priceSensitivity: {
        ...preferences.priceSensitivity,
        level,
      }
    })
  }

  const toggleWillingToPayMore = () => {
    if (!preferences) return
    
    setPreferences({
      ...preferences,
      priceSensitivity: {
        ...preferences.priceSensitivity,
        willingToPayMore: !preferences.priceSensitivity.willingToPayMore,
      }
    })
  }

  const handleSave = async () => {
    if (!preferences) return
    
    setSaving(true)
    await storage.savePreferences(preferences)
    setSaving(false)
    onClose()
  }

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all preferences and start over?')) {
      await storage.savePreferences({
        goals: [],
        goalWeights: {},
        likedProducts: [],
        dislikedProducts: [],
        likedCategories: [],
        dislikedCategories: [],
        priceSensitivity: { level: 'moderate', willingToPayMore: false },
        categoryPreferences: [],
        completedOnboarding: false,
        onboardingDate: Date.now(),
      })
      window.location.reload()
    }
  }

  if (loading || !preferences) {
    return (
      <div className="preference-editor">
        <div className="editor-loading">Loading preferences...</div>
      </div>
    )
  }

  return (
    <div className="preference-editor">
      <div className="editor-header">
        <h2 className="editor-title">⚙️ Edit Preferences</h2>
        <button className="close-button" onClick={onClose}>✕</button>
      </div>

      <div className="editor-content">
        {/* Shopping Goals */}
        <section className="editor-section">
          <h3 className="section-title">🎯 Shopping Goals</h3>
          <div className="goals-grid">
            {GOAL_OPTIONS.map(goal => (
              <button
                key={goal.id}
                className={`goal-chip ${preferences.goals.includes(goal.id) ? 'selected' : ''}`}
                onClick={() => toggleGoal(goal.id)}
              >
                <span className="goal-chip-icon">{goal.icon}</span>
                <span className="goal-chip-text">{goal.title}</span>
                {preferences.goals.includes(goal.id) && (
                  <span className="goal-chip-check">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Price Sensitivity */}
        <section className="editor-section">
          <h3 className="section-title">💰 Budget Style</h3>
          <div className="price-options">
            {PRICE_LEVELS.map(price => (
              <button
                key={price.level}
                className={`price-option ${preferences.priceSensitivity.level === price.level ? 'selected' : ''}`}
                onClick={() => updatePriceLevel(price.level)}
              >
                <span className="price-option-icon">{price.icon}</span>
                <span className="price-option-text">{price.title}</span>
              </button>
            ))}
          </div>
          
          <label className="quality-toggle">
            <input
              type="checkbox"
              checked={preferences.priceSensitivity.willingToPayMore}
              onChange={toggleWillingToPayMore}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label-text">
              Willing to pay more for quality/eco products
            </span>
          </label>
        </section>

        {/* Stats */}
        <section className="editor-section stats-section">
          <h3 className="section-title">📊 Your Data</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{preferences.likedProducts.length}</span>
              <span className="stat-label">Products Liked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{preferences.dislikedProducts.length}</span>
              <span className="stat-label">Products Disliked</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{preferences.likedCategories.length}</span>
              <span className="stat-label">Favorite Categories</span>
            </div>
          </div>
        </section>
      </div>

      <div className="editor-footer">
        <button className="reset-button" onClick={handleReset}>
          🔄 Full Reset
        </button>
        <div className="action-buttons">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={saving || preferences.goals.length === 0}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

