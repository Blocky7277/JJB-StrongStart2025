import { useState, useEffect } from 'react'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import PreferenceEditor from '@/components/settings/PreferenceEditor'
import { storage } from '@/utils/storage'
import './App.css'

export default function App() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await storage.isOnboardingCompleted()
      setIsOnboardingComplete(completed)
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setIsOnboardingComplete(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true)
  }

  const handleGoToAmazon = () => {
    chrome.tabs.create({ url: 'https://www.amazon.com' })
    // Close popup after opening Amazon so user sees the new tab
    window.close()
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />
  }

  if (showSettings) {
    return <PreferenceEditor onClose={handleCloseSettings} />
  }

  return (
    <div className="app-main">
      <header className="app-header">
        <h1 className="app-title">Smart Shopping Assistant</h1>
        <p className="app-subtitle">Your AI-powered Amazon companion</p>
      </header>

      <div className="app-content">
        <div className="welcome-message">
          <div className="welcome-icon">🎯</div>
          <h2>Ready to Shop Smarter!</h2>
          <p>Click "Go to Amazon" below to start shopping. You can access this extension anytime by clicking the icon in your toolbar!</p>
        </div>
        
        <div className="how-it-works">
          <h3 className="works-title">🔄 How It Works</h3>
          <div className="works-steps">
            <div className="works-step">
              <span className="step-emoji">1️⃣</span>
              <p>Click "Go to Amazon" to browse products</p>
            </div>
            <div className="works-step">
              <span className="step-emoji">2️⃣</span>
              <p>Find a product you're interested in</p>
            </div>
            <div className="works-step">
              <span className="step-emoji">3️⃣</span>
              <p>Click this extension icon again for recommendations</p>
            </div>
          </div>
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-info">
              <h3>0</h3>
              <p>Products Analyzed</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <h3>0</h3>
              <p>Smart Decisions</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button primary" onClick={handleGoToAmazon}>
            <span className="button-icon">🔍</span>
            <span>Go to Amazon</span>
          </button>
          <button className="action-button secondary" onClick={handleOpenSettings}>
            <span className="button-icon">⚙️</span>
            <span>Settings</span>
          </button>
        </div>

        <div className="tips-section">
          <h3 className="tips-title">💡 Pro Tips</h3>
          <ul className="tips-list">
            <li>Pin this extension to your toolbar for quick access</li>
            <li>Open the extension while viewing any Amazon product</li>
            <li>We'll show you better alternatives based on your preferences</li>
          </ul>
        </div>
      </div>

      <footer className="app-footer">
        <p>Made with ❤️ for smarter shopping</p>
      </footer>
    </div>
  )
}
