import { useEffect, useState } from 'react'
import './OnboardingComplete.css'

interface OnboardingCompleteProps {
  selectedGoals: string[]
  onComplete: () => void
}

export default function OnboardingComplete({ selectedGoals, onComplete }: OnboardingCompleteProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    setTimeout(() => setShowContent(true), 300)
  }, [])

  return (
    <div className="onboarding-complete">
      <div className={`complete-content ${showContent ? 'show' : ''}`}>
        <div className="complete-animation">
          <div className="success-checkmark">
            <div className="check-icon">
              <span className="icon-line line-tip"></span>
              <span className="icon-line line-long"></span>
              <div className="icon-circle"></div>
              <div className="icon-fix"></div>
            </div>
          </div>
        </div>

        <h1 className="complete-title">You're All Set! 🎉</h1>
        <p className="complete-description">
          Great job! We've learned your preferences and shopping goals.
          Now you're ready to make smarter purchase decisions on Amazon.
        </p>

        <div className="complete-summary">
          <h3 className="summary-title">Your Shopping Profile</h3>
          <div className="goal-badges">
            {selectedGoals.map((goal) => (
              <span key={goal} className="goal-badge">
                {formatGoalName(goal)}
              </span>
            ))}
          </div>
        </div>

        <div className="next-steps">
          <h3 className="steps-title">How We'll Help You Shop Smarter</h3>
          <div className="step-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Browse Amazon</h4>
                <p>Visit any product page - we'll analyze it instantly</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Get Personalized Recommendations</h4>
                <p>See better alternatives that match your goals and budget</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Make Informed Decisions</h4>
                <p>Get a "Buy/Consider/Skip" recommendation based on your preferences</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Save Money & Time</h4>
                <p>Find more cost-effective options that align with your values</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="data-collection-info">
          <h4 className="info-title">🔒 Your Data is Secure</h4>
          <p className="info-text">
            All your preferences are stored locally on your device. We never share or sell your data.
          </p>
        </div>

        <button className="complete-button" onClick={onComplete}>
          Let's Go Shopping!
          <span className="button-sparkle">✨</span>
        </button>

        <p className="complete-footer">
          💡 <strong>Quick Tip:</strong> Pin this extension to your toolbar for easy access while shopping!
        </p>
      </div>
    </div>
  )
}

function formatGoalName(goalId: string): string {
  const goalNames: Record<string, string> = {
    'save-money': '💰 Save Money',
    'quality-first': '⭐ Quality First',
    'eco-friendly': '🌱 Eco-Friendly',
    'time-saver': '⚡ Time Saver',
    'avoid-clutter': '🎯 Minimize Clutter',
    'research-helper': '🔍 Research Helper',
  }
  return goalNames[goalId] || goalId
}

