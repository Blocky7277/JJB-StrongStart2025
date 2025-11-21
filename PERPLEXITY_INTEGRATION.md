# 🔍 Perplexity Shopping Integration Guide

This document explains how Perplexity AI is integrated to find similar products that match user preferences and goals.

---

## 🎯 What It Does

Perplexity Shopping integration uses AI to:
- **Find real similar products** on Amazon
- **Filter by user preferences** (price, quality, goals)
- **Match user goals** (save-money, quality-first, eco-friendly)
- **Consider shopping patterns** (average spending, preferred categories)
- **Return structured product data** ready for recommendations

---

## 🔑 API Key Setup

### **1. Get Perplexity API Key**

1. Visit: https://www.perplexity.ai/api-platform
2. Sign up or log in
3. Navigate to API settings
4. Generate an API key

### **2. Configure API Key**

1. Copy `src/config/perplexity.example.ts` to `src/config/perplexity.ts`
2. Replace `YOUR_PERPLEXITY_API_KEY_HERE` with your actual API key

**Current Status:** ⚠️ **API key needed** - Update `src/config/perplexity.ts`

---

## 🔄 How It Works

### **Product Search Flow:**

```
1. User views product on Amazon
   ↓
2. ProductAnalyzer.analyzeProduct() called
   ↓
3. Load user preferences and patterns
   ↓
4. Call PerplexityService.searchSimilarProducts()
   - Builds intelligent search query
   - Includes user goals, price range, quality threshold
   - Includes category preferences
   ↓
5. Perplexity AI searches the web
   - Finds similar products
   - Filters by criteria
   - Returns structured JSON
   ↓
6. Parse Perplexity response
   - Extract product data
   - Convert to Product format
   - Add recommendation reasons
   ↓
7. Return products for analysis
   - Gemini analyzes each product
   - Scores and ranks alternatives
   - Shows in modal
```

---

## 📝 Search Query Building

### **Query Components:**

The service builds comprehensive queries that include:

1. **Target Product Info:**
   - Product title
   - Category
   - Features

2. **User Goals:**
   - "save-money" → Find cheaper alternatives
   - "quality-first" → Prioritize high ratings
   - "eco-friendly" → Filter for sustainable options

3. **Price Preferences:**
   - Average liked price
   - Max price from sensitivity
   - Budget vs premium preference

4. **Quality Standards:**
   - Minimum rating threshold
   - Quality-first goal weighting

5. **Category Preferences:**
   - Preferred categories from swipe patterns
   - Avoided categories

### **Example Query:**

```
Find similar products to "Wireless Bluetooth Headphones" 
in Electronics category. 
Find cheaper alternatives around $45. 
Prioritize high-quality products with at least 4.5 star rating. 
Products should have similar features: bluetooth, noise-cancelling, wireless. 
Return a list of 5 similar products with: product name, approximate price 
in USD, rating if available, and why it's a good alternative. 
Format as a JSON array...
```

---

## 🎨 Response Format

### **Perplexity Returns:**

```json
[
  {
    "title": "Sony WH-1000XM4 Wireless Headphones",
    "price": "$349.99",
    "priceNumeric": 349.99,
    "rating": 4.8,
    "category": "Electronics",
    "features": ["bluetooth", "noise-cancelling", "wireless"],
    "whyRecommended": "Premium quality with excellent noise cancellation, matches your quality-first goal"
  },
  {
    "title": "Anker Soundcore Life Q30",
    "price": "$79.99",
    "priceNumeric": 79.99,
    "rating": 4.6,
    "category": "Electronics",
    "features": ["bluetooth", "noise-cancelling", "budget-friendly"],
    "whyRecommended": "Great value option, 30% cheaper with similar features"
  }
]
```

### **Converted to Product Format:**

```typescript
{
  id: "perplexity-0-1234567890",
  title: "Sony WH-1000XM4 Wireless Headphones",
  price: "$349.99",
  priceNumeric: 349.99,
  image: "[target product image]",
  category: "Electronics",
  rating: 4.8,
  features: ["bluetooth", "noise-cancelling", "wireless"],
  url: "[if provided by Perplexity]",
  whyRecommended: "Premium quality with excellent noise cancellation..."
}
```

---

## 🔧 Integration Points

### **1. Product Analyzer**

**Location:** `src/utils/productAnalyzer.ts`

```typescript
// Fetches similar products using Perplexity
const alternativeProducts = await PerplexityService.searchSimilarProducts(
  currentProduct,
  criteria,
  patterns
)
```

### **2. Fallback Behavior**

If Perplexity fails or returns no results:
- Falls back to mock products
- Logs warning to console
- Doesn't break user experience

---

## 🎯 User Preference Matching

### **Price Sensitivity:**

```typescript
// Budget users
if (criteria.userGoals.includes('save-money')) {
  query += "Find cheaper alternatives around $45"
}

// Premium users
if (criteria.priceSensitivity.level === 'premium') {
  query += "Find high-quality options, price is less important"
}
```

### **Quality Standards:**

```typescript
if (criteria.userGoals.includes('quality-first')) {
  query += "Prioritize high-quality products with at least 4.5 star rating"
}
```

### **Eco-Friendly:**

```typescript
if (criteria.userGoals.includes('eco-friendly')) {
  query += "Prioritize eco-friendly, organic, or sustainable options"
}
```

### **Category Preferences:**

```typescript
if (patterns.preferredCategories.length > 0) {
  query += `In categories: ${patterns.preferredCategories.join(', ')}`
}
```

---

## 🚀 Usage Examples

### **Basic Usage:**

```typescript
import { PerplexityService } from '@/services/perplexityService'

const products = await PerplexityService.searchSimilarProducts(
  targetProduct,
  criteria,
  userPatterns
)
```

### **Search by Criteria:**

```typescript
const products = await PerplexityService.searchProductsByCriteria(
  criteria,
  patterns,
  "wireless headphones"
)
```

---

## ⚠️ Error Handling

### **Common Errors:**

1. **API Key Invalid:**
   ```
   Error: Perplexity API error: 401 - Unauthorized
   ```
   **Fix:** Check API key in `src/config/perplexity.ts`

2. **Rate Limit:**
   ```
   Error: Perplexity API error: 429 - Rate limit exceeded
   ```
   **Fix:** Implement rate limiting or upgrade plan

3. **Parse Error:**
   ```
   Error: Error parsing Perplexity response
   ```
   **Fix:** Parser handles markdown, but logs error for debugging

### **Fallback Behavior:**

```typescript
try {
  products = await PerplexityService.searchSimilarProducts(...)
} catch (error) {
  console.warn('Perplexity failed, using fallback')
  products = await fetchSimilarProducts(...) // Mock products
}
```

---

## 📊 Performance

### **Response Times:**
- Perplexity API call: ~2-4 seconds
- Parsing response: <100ms
- Total: ~2-4 seconds

### **Caching:**
Consider implementing caching for:
- Same product searches (cache for 1 hour)
- User preference queries (cache for session)

---

## 🔒 Security

✅ **API Key Security:**
- Stored in gitignored file
- Never committed to version control
- Use environment variables in production

✅ **Data Privacy:**
- Only product data sent to Perplexity
- User preferences anonymized
- No personal information shared

---

## 🎯 Benefits

### **Real Product Discovery:**
- ✅ Finds actual products on Amazon
- ✅ Real prices and ratings
- ✅ Current availability

### **Smart Filtering:**
- ✅ Matches user goals
- ✅ Respects price sensitivity
- ✅ Considers quality standards
- ✅ Uses category preferences

### **Personalized:**
- ✅ Based on swipe patterns
- ✅ Considers average spending
- ✅ Aligns with stated goals

---

## 📚 API Documentation

- **Perplexity API Docs:** https://docs.perplexity.ai/
- **API Platform:** https://www.perplexity.ai/api-platform
- **Pricing:** Check Perplexity website for current pricing

---

## 🧪 Testing

### **Test Search:**

```typescript
// In browser console on Amazon product page
const product = {
  id: 'test',
  title: 'Wireless Headphones',
  price: '$89.99',
  priceNumeric: 89.99,
  image: '',
  category: 'Electronics',
  rating: 4.6
}

const criteria = await storage.getRecommendationCriteria()
const patterns = { avgLikedPrice: 50, preferredCategories: ['Electronics'], qualityThreshold: 4.5 }

const results = await PerplexityService.searchSimilarProducts(product, criteria, patterns)
console.log('Found products:', results)
```

---

## 🎉 Result

**Before:**
- Mock products with fake data
- No real alternatives
- Limited personalization

**After:**
- Real products from Perplexity
- Actual prices and ratings
- Smart filtering by preferences
- Personalized recommendations

---

Made with ❤️ and 🔍 Perplexity AI

