# ⚡ Quick Console Test

## 🚀 Run This Right Now!

After rebuilding, open your browser console (F12) and run:

```javascript
window.quickTest()
```

This will test with a sample product and show you:
- ✅ Insights from Gemini
- ✅ Related products from Perplexity
- ✅ Match score and recommendation

## 📋 What You'll See

```
================================================================================
⚡ QUICK TEST - Sample Product Analysis
================================================================================

📦 TEST PRODUCT:
   Sony WH-1000XM5 Wireless Noise Cancelling Headphones
   Price: $399.99
   Rating: 4.8⭐

🤖 Running analysis...

💡 INSIGHTS (Gemini):
────────────────────────────────────────────────────────────────────────────────
Summary: [AI-generated analysis of the product]

Strengths:
  ✅ Industry-leading noise cancellation
  ✅ Excellent battery life
  ✅ Premium build quality

Concerns:
  ⚠️ Premium price point
  ⚠️ May be overkill for casual users

Value: [AI assessment of value]

🛍️ RELATED PRODUCTS (Perplexity):
────────────────────────────────────────────────────────────────────────────────

1. Bose QuietComfort 45 Wireless Headphones
   Price: $329.99
   Match: 85.2%
   💰 Save: $70.00
   Why: Similar features at lower price point

2. [More products...]

📊 RECOMMENDATION:
────────────────────────────────────────────────────────────────────────────────
   CONSIDER - 72.5% match

   Reasons:
   1. Good product but check alternatives
   2. Price is above average spending
   3. Quality meets standards

================================================================================
✅ Test Complete!
================================================================================
```

## 🎯 Other Test Commands

```javascript
// Quick test (works anywhere)
window.quickTest()

// Full analysis (needs Amazon product page)
window.testFullAnalysis()

// Test both AI services
window.testAI()

// Test Gemini only
window.testGemini()

// Test Perplexity only
window.testPerplexity()
```

## ✅ Expected Results

If everything works, you should see:
- ✅ Insights with summary, strengths, concerns, value assessment
- ✅ At least 1-3 related products from Perplexity
- ✅ Match score and recommendation
- ✅ Reasons for the recommendation

If you see errors, check:
- API keys are configured (`src/config/gemini.ts` and `src/config/perplexity.ts`)
- You've completed onboarding
- Network connection is working


