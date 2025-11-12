import { UserPreferences, SwipeDecision, Product, PriceSensitivity } from '@/types/onboarding'

const STORAGE_KEYS = {
  PREFERENCES: 'userPreferences',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
}

export const storage = {
  async getPreferences(): Promise<UserPreferences | null> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.PREFERENCES)
    return result[STORAGE_KEYS.PREFERENCES] || null
  },

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await chrome.storage.local.set({
      [STORAGE_KEYS.PREFERENCES]: preferences,
    })
  },

  async updateGoals(goals: string[], goalWeights: Record<string, number> = {}): Promise<void> {
    const preferences = await this.getPreferences()
    const updated: UserPreferences = {
      ...preferences,
      goals,
      goalWeights,
      likedProducts: preferences?.likedProducts || [],
      dislikedProducts: preferences?.dislikedProducts || [],
      likedCategories: preferences?.likedCategories || [],
      dislikedCategories: preferences?.dislikedCategories || [],
      priceSensitivity: preferences?.priceSensitivity || {
        level: 'moderate',
        willingToPayMore: false,
      },
      categoryPreferences: preferences?.categoryPreferences || [],
      completedOnboarding: preferences?.completedOnboarding || false,
      onboardingDate: preferences?.onboardingDate || Date.now(),
    }
    await this.savePreferences(updated)
  },

  async updatePriceSensitivity(priceSensitivity: PriceSensitivity): Promise<void> {
    const preferences = await this.getPreferences()
    const updated: UserPreferences = {
      ...preferences,
      goals: preferences?.goals || [],
      goalWeights: preferences?.goalWeights || {},
      likedProducts: preferences?.likedProducts || [],
      dislikedProducts: preferences?.dislikedProducts || [],
      likedCategories: preferences?.likedCategories || [],
      dislikedCategories: preferences?.dislikedCategories || [],
      priceSensitivity,
      categoryPreferences: preferences?.categoryPreferences || [],
      completedOnboarding: preferences?.completedOnboarding || false,
      onboardingDate: preferences?.onboardingDate || Date.now(),
    }
    await this.savePreferences(updated)
  },

  async addSwipeDecision(decision: SwipeDecision): Promise<void> {
    const preferences = await this.getPreferences()
    const { product, decision: swipeDecision } = decision

    const updated: UserPreferences = {
      goals: preferences?.goals || [],
      goalWeights: preferences?.goalWeights || {},
      likedProducts: preferences?.likedProducts || [],
      dislikedProducts: preferences?.dislikedProducts || [],
      likedCategories: preferences?.likedCategories || [],
      dislikedCategories: preferences?.dislikedCategories || [],
      priceSensitivity: preferences?.priceSensitivity || {
        level: 'moderate',
        willingToPayMore: false,
      },
      categoryPreferences: preferences?.categoryPreferences || [],
      completedOnboarding: preferences?.completedOnboarding || false,
      onboardingDate: preferences?.onboardingDate || Date.now(),
    }

    if (swipeDecision === 'like') {
      updated.likedProducts.push(product)
      // Track liked categories
      if (!updated.likedCategories.includes(product.category)) {
        updated.likedCategories.push(product.category)
      }
    } else {
      updated.dislikedProducts.push(product)
      // Track disliked categories
      if (!updated.dislikedCategories.includes(product.category)) {
        updated.dislikedCategories.push(product.category)
      }
    }

    // Update category preferences
    this.updateCategoryPreferences(updated, product, swipeDecision)

    await this.savePreferences(updated)
  },

  updateCategoryPreferences(
    preferences: UserPreferences,
    product: Product,
    decision: 'like' | 'dislike'
  ): void {
    const categoryIndex = preferences.categoryPreferences.findIndex(
      (cp) => cp.category === product.category
    )

    if (categoryIndex >= 0) {
      const pref = preferences.categoryPreferences[categoryIndex]
      // Update interest level based on decision
      if (decision === 'like') {
        pref.interest = pref.interest === 'low' ? 'medium' : 'high'
        // Update average price point
        const count = preferences.likedProducts.filter(
          (p) => p.category === product.category
        ).length
        pref.averagePricePoint =
          (pref.averagePricePoint * (count - 1) + product.priceNumeric) / count
      } else {
        pref.interest = pref.interest === 'high' ? 'medium' : 'low'
      }
    } else {
      // Add new category preference
      preferences.categoryPreferences.push({
        category: product.category,
        interest: decision === 'like' ? 'high' : 'low',
        averagePricePoint: product.priceNumeric,
      })
    }
  },

  async completeOnboarding(): Promise<void> {
    const preferences = await this.getPreferences()
    const updated: UserPreferences = {
      ...preferences,
      goals: preferences?.goals || [],
      goalWeights: preferences?.goalWeights || {},
      likedProducts: preferences?.likedProducts || [],
      dislikedProducts: preferences?.dislikedProducts || [],
      likedCategories: preferences?.likedCategories || [],
      dislikedCategories: preferences?.dislikedCategories || [],
      priceSensitivity: preferences?.priceSensitivity || {
        level: 'moderate',
        willingToPayMore: false,
      },
      categoryPreferences: preferences?.categoryPreferences || [],
      completedOnboarding: true,
      onboardingDate: Date.now(),
    }
    await this.savePreferences(updated)
  },

  async isOnboardingCompleted(): Promise<boolean> {
    const preferences = await this.getPreferences()
    return preferences?.completedOnboarding || false
  },

  async getRecommendationCriteria() {
    const preferences = await this.getPreferences()
    if (!preferences) return null

    return {
      userGoals: preferences.goals,
      goalWeights: preferences.goalWeights,
      priceSensitivity: preferences.priceSensitivity,
      likedProducts: preferences.likedProducts,
      preferredCategories: preferences.likedCategories,
    }
  },
}
