import { useState } from 'react'
import { SwipeDecision, PriceSensitivity } from '@/types/onboarding'
import { storage } from '@/utils/storage'
import GoalSelection from './GoalSelection'
import PriceSensitivityComponent from './PriceSensitivity'
import SwipeProducts from './SwipeProducts'
import OnboardingComplete from './OnboardingComplete'
import './OnboardingFlow.css'

type OnboardingStep = 'welcome' | 'goals' | 'price' | 'swipe' | 'complete'

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [, setGoalWeights] = useState<Record<string, number>>({})

  const handleWelcomeContinue = () => {
    setCurrentStep('goals')
  }

  const handleGoalsComplete = async (goals: string[], weights: Record<string, number>) => {
    setSelectedGoals(goals)
    setGoalWeights(weights)
    await storage.updateGoals(goals, weights)
    setCurrentStep('price')
  }

  const handlePriceComplete = async (priceSensitivity: PriceSensitivity) => {
    await storage.updatePriceSensitivity(priceSensitivity)
    setCurrentStep('swipe')
  }

  const handleSwipeComplete = async (decisions: SwipeDecision[]) => {
    // Save all swipe decisions
    for (const decision of decisions) {
      await storage.addSwipeDecision(decision)
    }
    setCurrentStep('complete')
  }

  const handleOnboardingComplete = async () => {
    await storage.completeOnboarding()
    onComplete()
  }

  return (
    <div className="onboarding-flow">
      {currentStep === 'welcome' && <WelcomeScreen onContinue={handleWelcomeContinue} />}
      {currentStep === 'goals' && <GoalSelection onComplete={handleGoalsComplete} />}
      {currentStep === 'price' && <PriceSensitivityComponent onComplete={handlePriceComplete} />}
      {currentStep === 'swipe' && <SwipeProducts onComplete={handleSwipeComplete} />}
      {currentStep === 'complete' && (
        <OnboardingComplete
          selectedGoals={selectedGoals}
          onComplete={handleOnboardingComplete}
        />
      )}
    </div>
  )
}

interface WelcomeScreenProps {
  onContinue: () => void
}

function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-icon">🎯</div>
        <h1 className="welcome-title">Welcome to Smart Shopping Assistant</h1>
        <p className="welcome-description">
          Your AI-powered companion for making better purchase decisions on Amazon.
          We'll help you avoid impulse buys and find products that truly match your needs.
        </p>
        
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <div className="feature-content">
              <h3>Save Money</h3>
              <p>Get smart recommendations based on your preferences</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <div className="feature-content">
              <h3>Buy Smarter</h3>
              <p>Make informed decisions with AI-powered insights</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <div className="feature-content">
              <h3>Save Time</h3>
              <p>Quick analysis of products as you browse</p>
            </div>
          </div>
        </div>

        <button className="welcome-button" onClick={onContinue}>
          Get Started
          <span className="button-arrow">→</span>
        </button>

        <p className="welcome-footer">Takes less than 2 minutes to set up</p>
      </div>
    </div>
  )
}

