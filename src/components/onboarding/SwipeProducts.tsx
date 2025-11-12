import { useState, useRef } from 'react'
import { Product, SwipeDecision } from '@/types/onboarding'
import { TRAINING_PRODUCTS } from '@/data/trainingProducts'
import './SwipeProducts.css'

interface SwipeProductsProps {
  onComplete: (decisions: SwipeDecision[]) => void
}

export default function SwipeProducts({ onComplete }: SwipeProductsProps) {
  const [products] = useState<Product[]>(TRAINING_PRODUCTS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [decisions, setDecisions] = useState<SwipeDecision[]>([])
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [showExitOption, setShowExitOption] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentProduct = products[currentIndex]
  const progress = ((currentIndex + 1) / products.length) * 100
  const canExit = currentIndex >= 10 // Show exit option after 10 products

  const handleSwipe = (direction: 'like' | 'dislike') => {
    if (!currentProduct) return

    // Create swipe decision with full product data
    const swipeDecision: SwipeDecision = {
      productId: currentProduct.id,
      product: currentProduct,
      decision: direction,
      timestamp: Date.now(),
    }

    setDecisions([...decisions, swipeDecision])
    setSwipeDirection(direction === 'like' ? 'right' : 'left')

    setTimeout(() => {
      if (currentIndex < products.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSwipeDirection(null)
        setDragOffset({ x: 0, y: 0 })
        
        // Show exit option after 10 products
        if (currentIndex + 1 === 10) {
          setShowExitOption(true)
        }
      } else {
        onComplete([...decisions, swipeDecision])
      }
    }, 300)
  }

  const handleExit = () => {
    if (currentIndex >= 10) {
      onComplete(decisions)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    
    // Reduced threshold from 100 to 50 for more responsive swiping
    if (Math.abs(dragOffset.x) > 50) {
      if (dragOffset.x > 0) {
        handleSwipe('like')
      } else {
        handleSwipe('dislike')
      }
    } else {
      setDragOffset({ x: 0, y: 0 })
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setStartPos({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - startPos.x
    const deltaY = touch.clientY - startPos.y
    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    
    // Reduced threshold from 100 to 50 for more responsive swiping
    if (Math.abs(dragOffset.x) > 50) {
      if (dragOffset.x > 0) {
        handleSwipe('like')
      } else {
        handleSwipe('dislike')
      }
    } else {
      setDragOffset({ x: 0, y: 0 })
    }
  }

  const rotation = dragOffset.x * 0.1
  const opacity = 1 - Math.abs(dragOffset.x) / 300

  if (!currentProduct) {
    return null
  }

  return (
    <div className="swipe-products">
      <div className="swipe-header">
        <h1 className="swipe-title">Train Your Preferences</h1>
        <p className="swipe-subtitle">
          {currentIndex < 10 
            ? `Swipe right on products you'd buy, left on products you'd skip`
            : `Great job! You can continue or exit anytime`
          }
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-text">
          {currentIndex + 1} of {products.length}
          {currentIndex < 10 && ` • ${10 - currentIndex} more to unlock exit`}
        </p>
        {canExit && showExitOption && (
          <button className="exit-button" onClick={handleExit}>
            <span className="exit-icon">✓</span>
            <span>Exit Training ({decisions.length} products rated)</span>
          </button>
        )}
      </div>

      <div className="swipe-container">
        <div className="swipe-indicators">
          <div className={`swipe-indicator nope ${dragOffset.x < -50 ? 'active' : ''}`}>
            <span className="indicator-icon">✕</span>
            <span className="indicator-text">PASS</span>
          </div>
          <div className={`swipe-indicator like ${dragOffset.x > 50 ? 'active' : ''}`}>
            <span className="indicator-icon">♥</span>
            <span className="indicator-text">LIKE</span>
          </div>
        </div>

        <div
          ref={cardRef}
          className={`product-card ${swipeDirection ? `swipe-${swipeDirection}` : ''}`}
          style={{
            transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
            opacity: isDragging ? opacity : 1,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="product-image">
            <span className="product-emoji">{currentProduct.image}</span>
          </div>
          <div className="product-details">
            <h2 className="product-title">{currentProduct.title}</h2>
            <div className="product-meta">
              <span className="product-category">{currentProduct.category}</span>
              <span className="product-rating">
                ⭐ {currentProduct.rating}
              </span>
            </div>
            <p className="product-price">{currentProduct.price}</p>
          </div>
        </div>

        {/* Preview next card */}
        {currentIndex < products.length - 1 && (
          <div className="product-card next-card">
            <div className="product-image">
              <span className="product-emoji">{products[currentIndex + 1].image}</span>
            </div>
            <div className="product-details">
              <h2 className="product-title">{products[currentIndex + 1].title}</h2>
            </div>
          </div>
        )}
      </div>

      <div className="swipe-actions">
        <button
          className="swipe-button dislike"
          onClick={() => handleSwipe('dislike')}
        >
          <span className="button-icon">✕</span>
          <span className="button-label">Pass</span>
        </button>
        <button
          className="swipe-button like"
          onClick={() => handleSwipe('like')}
        >
          <span className="button-icon">♥</span>
          <span className="button-label">Like</span>
        </button>
      </div>

      <p className="swipe-hint">💡 Drag the card or use the buttons below</p>
    </div>
  )
}

