# 🤖 Gemini AI Integration Guide

This document explains how Gemini AI is integrated into the Smart Shopping Assistant for intelligent product analysis and recommendations.

---

## 🔑 API Key Setup

### **1. Configuration File**

The API key is stored in `src/config/gemini.ts` (gitignored for security).

**To set up:**
1. Copy `src/config/gemini.example.ts` to `src/config/gemini.ts`
2. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key

**Current API Key:** Already configured ✅

### **2. Security**

- ✅ `src/config/gemini.ts` is in `.gitignore`
- ✅ Never commit API keys to version control
- ✅ Use environment variables in production

---

## 🎯 What Gemini Does

Gemini AI powers three main features:

### **1. Match Score Analysis** 
**Location:** `src/services/geminiService.ts` → `analyzeMatchScore()`

Analyzes how well a product matches user preferences and provides:
- **Score** (0.0-1.0): Overall match quality
- **Recommendation**: "buy", "consider", or "skip"
- **Reasons**: Human-readable explanations
- **Confidence**: How confident the AI is
- **Breakdown**: Detailed scores for price, quality, goals, category

### **2. Product Insights**
**Location:** `src/services/geminiService.ts` → `generateProductInsights()`

Provides comprehensive, personalized insights:
- **Summary**: Overview of product fit
- **Strengths**: What's good about it
- **Concerns**: Potential issues
- **Value Assessment**: Is it worth the price?
- **Recommendation**: Personalized advice
- **Alternative Considerations**: Things to think about

### **3. Alternative Product Analysis**
**Location:** `src/services/geminiService.ts` → `analyzeAlternatives()`

Analyzes and ranks alternative products:
- **Score** (0.0-1.0): How good is this alternative?
- **Reasons**: Why it's better/worse
- **Comparison**: Detailed comparison to target product
- **Savings**: Cost difference if cheaper

---

## 📝 Prompt Engineering

### **Match Score Prompt Structure:**

```
1. User Profile Section
   - Goals and weights
   - Price sensitivity
   - Willingness to pay more

2. Shopping Patterns Section
   - Average liked/disliked prices
   - Preferred/avoided categories
   - Quality threshold

3. Product Information Section
   - Title, price, category
   - Rating, features

4. Task Instructions
   - What to analyze
   - How to score
   - Output format

5. Scoring Guidelines
   - Thresholds for buy/consider/skip
   - Weight distribution
```

### **Key Prompt Features:**

✅ **Comprehensive Context**: Full user profile and patterns  
✅ **Structured Output**: JSON format for easy parsing  
✅ **Specific Instructions**: Clear scoring guidelines  
✅ **Behavioral Analysis**: Considers past behavior, not just stated preferences  
✅ **Detailed Reasoning**: Explains every score component  

---

## 🔄 Integration Flow

### **Product Analysis Flow:**

```
1. User views product on Amazon
   ↓
2. ProductAnalyzer.analyzeProduct() called
   ↓
3. Load user preferences and patterns
   ↓
4. Fetch alternative products
   ↓
5. Call GeminiService.analyzeMatchScore()
   - Generates comprehensive prompt
   - Calls Gemini API
   - Parses JSON response
   ↓
6. Call GeminiService.analyzeAlternatives()
   - Analyzes each alternative
   - Ranks by score
   ↓
7. Call GeminiService.generateProductInsights()
   - Creates personalized summary
   ↓
8. Return complete analysis with:
   - Match score (from Gemini)
   - Recommendations (from Gemini)
   - Insights (from Gemini)
   - Fallback to rule-based if Gemini fails
```

### **Error Handling:**

```typescript
try {
  // Use Gemini AI
  const analysis = await GeminiService.analyzeMatchScore(...)
} catch (error) {
  // Fallback to rule-based analysis
  console.warn('Gemini failed, using fallback')
  const analysis = determineShouldBuy(...) // Original logic
}
```

---

## 📊 Response Format

### **Match Score Response:**

```json
{
  "score": 0.75,
  "recommendation": "buy",
  "reasons": [
    "✅ Within your typical price range",
    "✅ Meets your quality standards",
    "✅ Aligns with your 'Save Money' goal"
  ],
  "confidence": 0.85,
  "breakdown": {
    "price": {
      "score": 0.8,
      "reasoning": "Product is $45, which is within your typical $50 range..."
    },
    "quality": {
      "score": 0.9,
      "reasoning": "Rating of 4.7 exceeds your 4.5 threshold..."
    },
    "goals": {
      "score": 0.7,
      "reasoning": "Strong alignment with 'save-money' goal..."
    },
    "category": {
      "score": 0.8,
      "reasoning": "You typically like Electronics products..."
    }
  }
}
```

### **Product Insights Response:**

```json
{
  "summary": "This wireless headphone is a solid match for your preferences...",
  "strengths": [
    "Excellent value at $45",
    "High quality rating (4.7 stars)",
    "Matches your preferred Electronics category"
  ],
  "concerns": [
    "Slightly above your average spending",
    "No eco-friendly certification"
  ],
  "valueAssessment": "Good value proposition considering your budget-conscious goals...",
  "recommendation": "I recommend considering this product. While it's slightly above your typical price, the quality and category alignment make it worth the extra cost...",
  "alternativeConsiderations": [
    "Check for similar products in your preferred price range",
    "Consider waiting for a sale if price is a concern"
  ]
}
```

---

## 🎨 Prompt Examples

### **Example 1: Budget-Conscious User**

**User Profile:**
- Goals: ["save-money" (weight: 2.0)]
- Price Sensitivity: "budget"
- Average Liked Price: $30
- Preferred Categories: ["Electronics"]

**Product:**
- Title: "Premium Wireless Headphones"
- Price: $89.99
- Rating: 4.6 stars
- Category: "Electronics"

**Gemini Analysis:**
```
Score: 0.45 (consider)
Reasoning: "While this is in your preferred Electronics category and has excellent quality, 
the price of $89.99 is significantly above your typical $30 spending. This conflicts with 
your strong 'save-money' goal (weight: 2.0). Consider waiting for a sale or looking for 
budget alternatives."
```

### **Example 2: Quality-First User**

**User Profile:**
- Goals: ["quality-first" (weight: 1.5)]
- Price Sensitivity: "premium"
- Quality Threshold: 4.5 stars
- Willing to Pay More: true

**Product:**
- Title: "High-End Wireless Headphones"
- Price: $149.99
- Rating: 4.8 stars
- Category: "Electronics"

**Gemini Analysis:**
```
Score: 0.85 (buy)
Reasoning: "Excellent match! The 4.8-star rating exceeds your 4.5 threshold, and you've 
indicated willingness to pay more for quality. This strongly aligns with your 'quality-first' 
goal. The premium price is justified by the exceptional quality."
```

---

## 🔧 Customization

### **Adjusting Prompt Weights:**

Edit the prompt in `geminiService.ts`:

```typescript
// Current weights in prompt
"Consider:
1. **Price Match** (40% weight)
2. **Quality Assessment** (30% weight)
3. **Goal Alignment** (30% weight)
4. **Category Preference**"

// Change to emphasize quality more
"Consider:
1. **Price Match** (30% weight)
2. **Quality Assessment** (50% weight)
3. **Goal Alignment** (20% weight)
4. **Category Preference**"
```

### **Changing Model:**

```typescript
// In src/config/gemini.ts
export const GEMINI_CONFIG = {
  API_KEY: 'your-key',
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  // Change model:
  // 'gemini-pro' - Standard model
  // 'gemini-pro-vision' - For image analysis
}
```

---

## 🚀 Usage Examples

### **In Product Analyzer:**

```typescript
import { ProductAnalyzer } from '@/utils/productAnalyzer'

const product = {
  id: 'prod-123',
  title: 'Wireless Headphones',
  price: '$89.99',
  priceNumeric: 89.99,
  category: 'Electronics',
  rating: 4.6
}

const analysis = await ProductAnalyzer.analyzeProduct(product)

console.log(analysis.shouldBuy)
// {
//   recommendation: 'consider',
//   score: 0.65,
//   reasons: [...],
//   breakdown: {...}
// }

console.log(analysis.insights)
// {
//   summary: "...",
//   strengths: [...],
//   concerns: [...],
//   recommendation: "..."
// }
```

### **Direct Gemini Service:**

```typescript
import { GeminiService } from '@/services/geminiService'

// Analyze match score
const matchScore = await GeminiService.analyzeMatchScore(
  product,
  criteria,
  userPatterns
)

// Generate insights
const insights = await GeminiService.generateProductInsights(
  product,
  criteria,
  userPatterns,
  alternatives
)

// Analyze alternatives
const alternatives = await GeminiService.analyzeAlternatives(
  targetProduct,
  alternativeProducts,
  criteria
)
```

---

## ⚠️ Error Handling

### **Common Errors:**

1. **API Key Invalid:**
   ```
   Error: Gemini API error: 401 - Invalid API key
   ```
   **Fix:** Check API key in `src/config/gemini.ts`

2. **Rate Limit Exceeded:**
   ```
   Error: Gemini API error: 429 - Rate limit exceeded
   ```
   **Fix:** Implement rate limiting or upgrade API quota

3. **JSON Parse Error:**
   ```
   Error: Could not parse JSON from Gemini response
   ```
   **Fix:** Gemini sometimes adds markdown, parser handles this automatically

### **Fallback Behavior:**

If Gemini fails, the system automatically falls back to rule-based analysis:

```typescript
try {
  // Try Gemini first
  return await GeminiService.analyzeMatchScore(...)
} catch (error) {
  // Fallback to original logic
  return determineShouldBuy(...)
}
```

---

## 📈 Performance

### **Response Times:**
- Match Score Analysis: ~1-2 seconds
- Product Insights: ~1-2 seconds
- Alternative Analysis: ~2-3 seconds (depends on number of alternatives)

### **Caching:**
Consider implementing caching for:
- User preferences (already cached in Chrome storage)
- Product analysis results (cache for same product)
- Alternative recommendations (cache for same target product)

---

## 🔒 Privacy & Security

✅ **API Key Security:**
- Stored in gitignored file
- Never committed to version control
- Use environment variables in production

✅ **Data Privacy:**
- Only product data sent to Gemini (no personal info)
- User preferences anonymized
- No tracking or storage of API calls

✅ **Error Handling:**
- Graceful fallback if API fails
- No user data exposed in errors

---

## 🎯 Best Practices

1. **Prompt Engineering:**
   - Be specific about output format
   - Include all relevant context
   - Provide clear scoring guidelines

2. **Error Handling:**
   - Always have fallback logic
   - Log errors for debugging
   - Don't break user experience

3. **Performance:**
   - Cache results when possible
   - Batch requests if needed
   - Show loading states

4. **User Experience:**
   - Show AI insights clearly
   - Explain why recommendations were made
   - Allow users to override AI suggestions

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Prompt Engineering Guide](https://ai.google.dev/docs/prompt_intro)
- [API Key Management](https://ai.google.dev/settings)

---

Made with ❤️ and 🤖 AI

