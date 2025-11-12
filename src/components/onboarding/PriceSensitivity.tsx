import { useState } from 'react'
import { PriceSensitivity as PriceSensitivityType } from '@/types/onboarding'
import './PriceSensitivity.css'

interface PriceSensitivityProps {
  onComplete: (sensitivity: PriceSensitivityType) => void
}

const PRICE_LEVELS = [
  {
    level: 'budget' as const,
    title: 'Budget Shopper',
    description: 'I look for the best deals and lowest prices',
    icon: '💵',
    maxPrice: 50,
    color: '#10b981',
  },
  {
    level: 'moderate' as const,
    title: 'Value Seeker',
    description: 'I balance price and quality',
    icon: '⚖️',
    maxPrice: 150,
    color: '#3b82f6',
  },
  {
    level: 'premium' as const,
    title: 'Quality Focused',
    description: 'I prioritize quality over price',
    icon: '✨',
    maxPrice: 300,
    color: '#8b5cf6',
  },
  {
    level: 'luxury' as const,
    title: 'Premium Buyer',
    description: 'I want the best, regardless of price',
    icon: '💎',
    maxPrice: undefined,
    color: '#f59e0b',
  },
]

export default function PriceSensitivity({ onComplete }: PriceSensitivityProps) {
  const [selectedLevel, setSelectedLevel] = useState<
    'budget' | 'moderate' | 'premium' | 'luxury' | null
  >(null)
  const [willingToPayMore, setWillingToPayMore] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleContinue = () => {
    if (!selectedLevel) {
      alert('Please select a price level to continue')
      return
    }

    const selected = PRICE_LEVELS.find((l) => l.level === selectedLevel)!

    setIsAnimating(true)
    setTimeout(() => {
      onComplete({
        level: selectedLevel,
        maxPrice: selected.maxPrice,
        willingToPayMore,
      })
    }, 300)
  }

  return (
    <div className={`price-sensitivity ${isAnimating ? 'fade-out' : 'fade-in'}`}>
      <div className="price-header">
        <h1 className="price-title">What's Your Budget Style?</h1>
        <p className="price-subtitle">
          Help us find products in your price range and match your spending preferences
        </p>
      </div>

      <div className="price-levels">
        {PRICE_LEVELS.map((level) => (
          <button
            key={level.level}
            className={`price-card ${selectedLevel === level.level ? 'selected' : ''}`}
            style={{
              borderColor: selectedLevel === level.level ? level.color : undefined,
            }}
            onClick={() => setSelectedLevel(level.level)}
          >
            <div className="price-icon">{level.icon}</div>
            <h3 className="price-card-title">{level.title}</h3>
            <p className="price-card-description">{level.description}</p>
            {level.maxPrice && (
              <div className="price-range">
                <span className="price-label">Typical max:</span>
                <span className="price-value">${level.maxPrice}</span>
              </div>
            )}
            <div className="price-check">
              {selectedLevel === level.level && (
                <span className="checkmark" style={{ backgroundColor: level.color }}>
                  ✓
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedLevel && (
        <div className="quality-option">
          <label className="quality-toggle">
            <input
              type="checkbox"
              checked={willingToPayMore}
              onChange={(e) => setWillingToPayMore(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <div className="toggle-label">
              <h4>💡 Quality Over Price</h4>
              <p>I'm willing to pay more for high-quality or eco-friendly products</p>
            </div>
          </label>
        </div>
      )}

      <div className="price-footer">
        <button
          className="continue-button"
          onClick={handleContinue}
          disabled={!selectedLevel}
        >
          Continue
          <span className="arrow">→</span>
        </button>
        <p className="price-note">💡 We'll use this to show you the most relevant products</p>
      </div>
    </div>
  )
}

