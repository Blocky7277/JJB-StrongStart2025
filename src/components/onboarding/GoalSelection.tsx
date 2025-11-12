import { useState } from 'react'
import { UserGoal } from '@/types/onboarding'
import './GoalSelection.css'

const AVAILABLE_GOALS: UserGoal[] = [
  {
    id: 'save-money',
    title: 'Save Money',
    description: 'Find the best deals and avoid impulse purchases',
    icon: '💰',
    selected: false,
    weight: 1.0,
  },
  {
    id: 'quality-first',
    title: 'Quality First',
    description: 'Prioritize high-quality products with good reviews',
    icon: '⭐',
    selected: false,
    weight: 1.0,
  },
  {
    id: 'eco-friendly',
    title: 'Eco-Friendly',
    description: 'Choose sustainable and environmentally conscious products',
    icon: '🌱',
    selected: false,
    weight: 1.0,
  },
  {
    id: 'time-saver',
    title: 'Save Time',
    description: 'Quick decisions with smart recommendations',
    icon: '⚡',
    selected: false,
    weight: 0.8,
  },
  {
    id: 'avoid-clutter',
    title: 'Minimize Clutter',
    description: 'Buy only what you really need',
    icon: '🎯',
    selected: false,
    weight: 0.9,
  },
  {
    id: 'research-helper',
    title: 'Better Research',
    description: 'Make informed decisions with detailed comparisons',
    icon: '🔍',
    selected: false,
    weight: 0.7,
  },
]

interface GoalSelectionProps {
  onComplete: (selectedGoals: string[], goalWeights: Record<string, number>) => void
}

export default function GoalSelection({ onComplete }: GoalSelectionProps) {
  const [goals, setGoals] = useState<UserGoal[]>(AVAILABLE_GOALS)
  const [isAnimating, setIsAnimating] = useState(false)

  const toggleGoal = (goalId: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId ? { ...goal, selected: !goal.selected } : goal
      )
    )
  }

  const handleContinue = () => {
    const selectedGoalIds = goals.filter((g) => g.selected).map((g) => g.id)
    if (selectedGoalIds.length === 0) {
      alert('Please select at least one goal to continue')
      return
    }
    
    // Create goal weights object
    const goalWeights: Record<string, number> = {}
    goals.filter((g) => g.selected).forEach((g) => {
      goalWeights[g.id] = g.weight
    })
    
    setIsAnimating(true)
    setTimeout(() => {
      onComplete(selectedGoalIds, goalWeights)
    }, 300)
  }

  const selectedCount = goals.filter((g) => g.selected).length

  return (
    <div className={`goal-selection ${isAnimating ? 'fade-out' : 'fade-in'}`}>
      <div className="goal-header">
        <h1 className="goal-title">What are your shopping goals?</h1>
        <p className="goal-subtitle">
          Select all that apply. We'll help you make better purchase decisions.
        </p>
      </div>

      <div className="goals-grid">
        {goals.map((goal) => (
          <button
            key={goal.id}
            className={`goal-card ${goal.selected ? 'selected' : ''}`}
            onClick={() => toggleGoal(goal.id)}
          >
            <div className="goal-icon">{goal.icon}</div>
            <h3 className="goal-card-title">{goal.title}</h3>
            <p className="goal-card-description">{goal.description}</p>
            <div className="goal-check">
              {goal.selected && <span className="checkmark">✓</span>}
            </div>
          </button>
        ))}
      </div>

      <div className="goal-footer">
        <div className="selected-indicator">
          {selectedCount > 0 && (
            <span className="pulse">{selectedCount} goal{selectedCount !== 1 ? 's' : ''} selected</span>
          )}
        </div>
        <button
          className="continue-button"
          onClick={handleContinue}
          disabled={selectedCount === 0}
        >
          Continue
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  )
}

