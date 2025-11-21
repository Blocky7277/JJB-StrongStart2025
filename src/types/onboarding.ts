export interface UserGoal {
  id: string
  title: string
  description: string
  icon: string
  selected: boolean
  weight: number // Priority weight for recommendations
}

export interface Product {
  id: string
  title: string
  price: string
  priceNumeric: number
  image: string
  category: string
  rating?: number
  features?: string[] // Key features for matching
  url?: string // Product URL for alternatives
  whyRecommended?: string // Reason from Perplexity why this product is recommended
}

export interface SwipeDecision {
  productId: string
  product: Product // Store full product data
  decision: 'like' | 'dislike'
  timestamp: number
  swipeSpeed?: number // How quickly they decided
  hesitation?: boolean // Did they drag back and forth
}

export interface PriceSensitivity {
  level: 'budget' | 'moderate' | 'premium' | 'luxury'
  maxPrice?: number
  willingToPayMore: boolean // For quality/eco products
}

export interface CategoryPreference {
  category: string
  interest: 'high' | 'medium' | 'low'
  averagePricePoint: number
}

export interface OnboardingState {
  completed: boolean
  currentStep: number
  selectedGoals: string[]
  swipeDecisions: SwipeDecision[]
  priceSensitivity?: PriceSensitivity
  categoryPreferences: CategoryPreference[]
}

export interface UserPreferences {
  goals: string[]
  goalWeights: Record<string, number> // How much each goal matters
  likedProducts: Product[]
  dislikedProducts: Product[]
  likedCategories: string[]
  dislikedCategories: string[]
  priceSensitivity: PriceSensitivity
  categoryPreferences: CategoryPreference[]
  completedOnboarding: boolean
  onboardingDate: number
}

export interface RecommendationCriteria {
  userGoals: string[]
  goalWeights: Record<string, number>
  priceSensitivity: PriceSensitivity
  likedProducts: Product[]
  preferredCategories: string[]
}

export interface ProductRecommendation {
  product: Product
  score: number
  reasons: string[]
  savings?: number // If cheaper than similar liked products
  betterMatch?: string[] // Which goals it matches better
}
