# 🎯 Match Score Calculation Explained

This document explains how the extension calculates match scores for products and recommendations.

---

## 📊 Two Types of Scores

The extension uses **two different scoring systems**:

1. **Product Analysis Score** - Determines if you should **Buy/Consider/Skip** the current product
2. **Recommendation Score** - Ranks **alternative products** to find better options

---

## 1️⃣ Product Analysis Score (Buy/Consider/Skip)

**Location:** `src/utils/productAnalyzer.ts` → `determineShouldBuy()`

**Purpose:** Analyzes the product you're viewing and gives a recommendation.

### **How It Works:**

Starts at **0.5 (neutral)** and adjusts based on factors:

#### **Starting Point:**
```typescript
let score = 0.5 // Neutral baseline
```

### **Scoring Factors:**

#### **1. Price Match (up to ±0.2)**
```typescript
if (product.priceNumeric <= patterns.avgLikedPrice * 1.2) {
  score += 0.2  // ✅ Within your typical price range
} else {
  score -= 0.2  // ⚠️ Above your usual spending
}
```

**Example:**
- Your average liked price: **$50**
- Product price: **$55** (within 120% = $60)
- Result: **+0.2** ✅

#### **2. Quality Threshold (up to ±0.15)**
```typescript
if (product.rating >= patterns.qualityThreshold) {
  score += 0.15  // ✅ Meets your quality standards
} else {
  score -= 0.15  // ⚠️ Below your usual quality threshold
}
```

**Example:**
- Your quality threshold: **4.5★** (from liked products)
- Product rating: **4.7★**
- Result: **+0.15** ✅

#### **3. Category Preferences (up to ±0.2)**
```typescript
if (patterns.preferredCategories.includes(product.category)) {
  score += 0.15  // ✅ You typically like this category
} else if (patterns.avoidedCategories.includes(product.category)) {
  score -= 0.2  // ⚠️ You usually skip this category
}
```

**Example:**
- Preferred categories: `["Electronics", "Home & Kitchen"]`
- Product category: `"Electronics"`
- Result: **+0.15** ✅

#### **4. Goal Alignment (up to ±0.1 per goal)**
```typescript
// Save Money Goal
if (criteria.userGoals.includes('save-money') && product.priceNumeric > 100) {
  score -= 0.1  // ⚠️ May not align with "Save Money" goal
}

// Quality First Goal
if (criteria.userGoals.includes('quality-first') && product.rating >= 4.5) {
  score += 0.1  // ✅ High quality matches your goal
}

// Eco-Friendly Goal
if (criteria.userGoals.includes('eco-friendly') && isEco) {
  score += 0.1  // ✅ Eco-friendly option
}
```

**Example:**
- Your goals: `["save-money", "quality-first"]`
- Product: $120, 4.6★
- Result: **-0.1** (price too high) + **+0.1** (high quality) = **0.0** (neutral)

### **Final Recommendation:**

```typescript
if (score >= 0.7) {
  recommendation = 'buy'      // 🟢 Strong match
} else if (score >= 0.4) {
  recommendation = 'consider'   // 🟡 Moderate match
} else {
  recommendation = 'skip'      // 🔴 Weak match
}
```

**Score is clamped between 0-1:**
```typescript
score = Math.max(0, Math.min(1, score))
```

---

## 2️⃣ Recommendation Score (Alternative Products)

**Location:** `src/services/recommendationEngine.ts` → `calculateRecommendationScore()`

**Purpose:** Scores alternative products to find better options than the current product.

### **How It Works:**

Starts at **0** and builds up based on weighted factors:

#### **Starting Point:**
```typescript
let score = 0
```

### **Scoring Formula:**

```typescript
score = (priceScore * 0.4) + (qualityScore * 0.3) + (goalScore * 0.3)
```

### **1. Price Score (40% weight)**

**Location:** `calculatePriceScore()`

#### **If Alternative is Cheaper:**
```typescript
if (product.priceNumeric < targetProduct.priceNumeric) {
  const savings = targetProduct.priceNumeric - product.priceNumeric
  const savingsPercent = savings / targetProduct.priceNumeric
  
  // Budget users love savings
  if (priceSensitivity.level === 'budget') {
    return Math.min(savingsPercent * 2, 1)  // Up to 100% score
  }
  
  // Premium users care less about price
  if (priceSensitivity.level === 'premium') {
    return savingsPercent * 0.5  // Half weight
  }
  
  // Moderate users in between
  return savingsPercent
}
```

**Example:**
- Target product: **$100**
- Alternative: **$70** (30% savings)
- User type: **Budget**
- Calculation: `0.30 * 2 = 0.60` (capped at 1.0)
- Final price score: **0.60**

#### **If Alternative is More Expensive:**
```typescript
if (priceSensitivity.willingToPayMore && product.rating >= 4.5) {
  return 0.6  // Only if user willing to pay more AND high quality
}
return 0.3  // Default lower score
```

### **2. Quality Score (30% weight)**

```typescript
if (product.rating) {
  score += (product.rating / 5) * 0.3
}
```

**Example:**
- Product rating: **4.6★**
- Calculation: `(4.6 / 5) * 0.3 = 0.276`
- Quality score: **0.276**

### **3. Goal Alignment Score (30% weight)**

**Location:** `calculateGoalAlignment()`

```typescript
let alignmentScore = 0

// Save Money Goal
if (goals.includes('save-money')) {
  const weight = criteria.goalWeights['save-money'] || 1
  const priceScore = product.priceNumeric < 50 ? 0.8 : 0.4
  alignmentScore += priceScore * weight
}

// Quality First Goal
if (goals.includes('quality-first')) {
  const weight = criteria.goalWeights['quality-first'] || 1
  const qualityScore = product.rating ? (product.rating / 5) : 0.5
  alignmentScore += qualityScore * weight
}

// Eco-Friendly Goal
if (goals.includes('eco-friendly')) {
  const weight = criteria.goalWeights['eco-friendly'] || 1
  const isEco = product.title.includes('eco') || 
                product.title.includes('organic')
  alignmentScore += (isEco ? 0.9 : 0.3) * weight
}

// Normalize by number of goals
return goals.length > 0 ? alignmentScore / goals.length : 0.5
```

**Example:**
- Goals: `["save-money" (weight: 1.5), "quality-first" (weight: 1.0)]`
- Product: $45, 4.7★
- Save Money: `0.8 * 1.5 = 1.2`
- Quality First: `(4.7/5) * 1.0 = 0.94`
- Total: `(1.2 + 0.94) / 2 = 1.07` (normalized)
- Goal score: **1.07** (but normalized, so effectively **0.535**)

### **Final Recommendation Score:**

```typescript
score = (priceScore * 0.4) + (qualityScore * 0.3) + (goalScore * 0.3)
```

**Example Calculation:**
```
Price Score:    0.60 * 0.4 = 0.24
Quality Score:  0.276 * 0.3 = 0.083
Goal Score:     0.535 * 0.3 = 0.161
─────────────────────────────────
Total Score:    0.484 (48.4%)
```

**Minimum Threshold:**
```typescript
if (score > 0.5) {
  // Only recommend if score is decent
  recommendations.push({ product, score, ... })
}
```

**Sorting:**
```typescript
// Sort by score (highest first) and return top 5
return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
```

---

## 📈 Complete Example

### **Scenario:**
- **User Profile:**
  - Goals: `["save-money" (weight: 1.5), "quality-first" (weight: 1.0)]`
  - Price sensitivity: `budget`
  - Average liked price: `$50`
  - Quality threshold: `4.5★`
  - Preferred categories: `["Electronics"]`

- **Current Product:**
  - Title: "Premium Wireless Headphones"
  - Price: `$89.99`
  - Rating: `4.6★`
  - Category: `"Electronics"`

### **1. Product Analysis Score:**

```
Starting: 0.5

Price Check:
  $89.99 > $50 * 1.2 ($60) → -0.2
  Result: 0.3

Quality Check:
  4.6★ >= 4.5★ → +0.15
  Result: 0.45

Category Check:
  "Electronics" in preferred → +0.15
  Result: 0.60

Goal Check:
  "save-money" + price > $100? No, but $89.99 is high → -0.05
  "quality-first" + 4.6★ >= 4.5★ → +0.1
  Result: 0.65

Final Score: 0.65
Recommendation: "consider" (0.4 <= 0.65 < 0.7)
```

### **2. Alternative Product Score:**

**Alternative: Budget Headphones - $59.99, 4.4★**

```
Price Score:
  Savings: $89.99 - $59.99 = $30 (33.3%)
  Budget user: 0.333 * 2 = 0.666
  Price Score: 0.666 * 0.4 = 0.266

Quality Score:
  (4.4 / 5) * 0.3 = 0.264
  Quality Score: 0.264 * 0.3 = 0.079

Goal Score:
  Save Money: 0.8 * 1.5 = 1.2
  Quality First: (4.4/5) * 1.0 = 0.88
  Average: (1.2 + 0.88) / 2 = 1.04
  Goal Score: 1.04 * 0.3 = 0.312

Total Score:
  0.266 + 0.079 + 0.312 = 0.657 (65.7%)
  
Result: ✅ Recommended (score > 0.5)
```

---

## 🔧 Customization

### **Adjusting Weights:**

You can modify the weights in `recommendationEngine.ts`:

```typescript
// Current weights
score += priceScore * 0.4      // 40% price
score += qualityScore * 0.3    // 30% quality
score += goalScore * 0.3       // 30% goals

// Example: Make quality more important
score += priceScore * 0.3      // 30% price
score += qualityScore * 0.5    // 50% quality
score += goalScore * 0.2       // 20% goals
```

### **Adjusting Thresholds:**

```typescript
// Current thresholds
if (score >= 0.7) recommendation = 'buy'
if (score >= 0.4) recommendation = 'consider'
else recommendation = 'skip'

// Make recommendations more strict
if (score >= 0.8) recommendation = 'buy'
if (score >= 0.5) recommendation = 'consider'
else recommendation = 'skip'
```

---

## 📊 Score Ranges

### **Product Analysis Score:**
- **0.0 - 0.39:** 🔴 **Skip** - Poor match
- **0.4 - 0.69:** 🟡 **Consider** - Moderate match
- **0.7 - 1.0:** 🟢 **Buy** - Strong match

### **Recommendation Score:**
- **0.0 - 0.5:** ❌ Not recommended
- **0.5 - 0.7:** ⚠️ Decent alternative
- **0.7 - 0.9:** ✅ Good alternative
- **0.9 - 1.0:** ⭐ Excellent alternative

---

## 🎯 Key Takeaways

1. **Product Analysis** uses a **baseline of 0.5** and adjusts up/down
2. **Recommendation Score** starts at **0** and builds up
3. **Price sensitivity** heavily influences price scoring
4. **Goal weights** allow users to prioritize certain goals
5. **Category preferences** learned from swipe patterns
6. **Quality threshold** based on average rating of liked products

---

## 🔍 Debugging Scores

To see scores in action, check the browser console:

```javascript
// In content script
const analysis = await ProductAnalyzer.analyzeProduct(currentProduct)
console.log('Buy/Consider/Skip:', analysis.shouldBuy)
console.log('Alternatives:', analysis.recommendations)
```

---

Made with ❤️ for transparent AI recommendations

