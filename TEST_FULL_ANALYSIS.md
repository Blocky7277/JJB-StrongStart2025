# 🧪 Test Full Analysis - Insights & Related Products

## 🎯 What This Does

This test function shows you **exactly** what data you're getting from:
1. **Gemini AI** - Product insights, analysis, recommendations
2. **Perplexity** - Related/alternative products

## 🚀 How to Use

### Step 1: Open Amazon Product Page
Go to any Amazon product page (or stay on the current page)

### Step 2: Open Browser Console
Press `F12` or right-click → "Inspect" → "Console" tab

### Step 3: Run the Test
Type this in the console:
```javascript
window.testFullAnalysis()
```

Press Enter and wait for the results!

## 📊 What You'll See

The test will display:

### 1. **Product Information**
```
📦 PRODUCT BEING ANALYZED:
   Title: Sony WH-1000XM5 Wireless Noise Cancelling Headphones
   Price: $399.99
   Category: Electronics
   Rating: 4.8⭐
   Features: wireless, noise-cancelling, bluetooth, long-battery
```

### 2. **AI-Powered Insights (from Gemini)**
```
💡 AI-POWERED INSIGHTS
   📝 SUMMARY: [Full analysis summary]
   ✅ STRENGTHS: [List of product strengths]
   ⚠️ CONCERNS: [List of concerns]
   💰 VALUE ASSESSMENT: [Is it worth the price?]
   🎯 AI RECOMMENDATION: [Buy/Consider/Skip with reasoning]
```

### 3. **Related Products (from Perplexity)**
```
🛍️ RELATED PRODUCTS
   📦 ALTERNATIVE 1:
      Title: [Product name]
      Price: [Price]
      Rating: [Rating]⭐
      Match Score: [X]%
      💰 Savings: $[X]
      Why Recommended: [Reasons]
      URL: [Product link]
```

### 4. **Match Score Analysis**
```
📊 MATCH SCORE ANALYSIS
   Recommendation: BUY/CONSIDER/SKIP
   Score: [X]%
   Breakdown: [Detailed scoring by category]
   Confidence: [X]%
```

## 🎯 Example Output

```
================================================================================
🧪 FULL ANALYSIS TEST - Insights & Related Products
================================================================================

📦 PRODUCT BEING ANALYZED:
────────────────────────────────────────────────────────────────────────────────
   Title: Sony WH-1000XM5 Wireless Noise Cancelling Headphones
   Price: $399.99
   Category: Electronics
   Rating: 4.8⭐
   Features: wireless, noise-cancelling, bluetooth, long-battery

🤖 RUNNING FULL ANALYSIS...

================================================================================
💡 AI-POWERED INSIGHTS (from Gemini)
================================================================================

📝 SUMMARY:
   The Sony WH-1000XM5 headphones are premium wireless headphones with 
   excellent noise cancellation and sound quality...

✅ STRENGTHS:
   1. Industry-leading noise cancellation technology
   2. Excellent battery life (30+ hours)
   3. High-quality build and comfort
   4. Great sound quality for the price

⚠️ CONCERNS:
   1. Premium price point may be above your usual spending
   2. Consider if you need all the advanced features

💰 VALUE ASSESSMENT:
   While expensive, these headphones offer excellent value for audiophiles...

🎯 AI RECOMMENDATION:
   CONSIDER - Good product but check if cheaper alternatives meet your needs

================================================================================
🛍️ RELATED PRODUCTS (from Perplexity)
================================================================================

Found 3 alternative product(s):

📦 ALTERNATIVE 1:
   Title: Bose QuietComfort 45 Wireless Headphones
   Price: $329.99
   Rating: 4.7⭐
   Category: Electronics
   Match Score: 85.2%
   💰 Savings: $70.00
   Why Recommended:
      1. Similar features at lower price
      2. Excellent noise cancellation
      3. Better value for money
   URL: https://amazon.com/dp/...

📦 ALTERNATIVE 2:
   ...
```

## 🔍 Troubleshooting

### If you see "No insights available":
- Gemini API might not be configured
- Check `src/config/gemini.ts` has your API key
- Check browser console for API errors

### If you see "No related products found":
- Perplexity API might not be configured
- Check `src/config/perplexity.ts` has your API key
- Check browser console for API errors

### If test fails completely:
- Make sure you've completed onboarding
- Check that you're on an Amazon product page (or it will use test product)
- Check browser console for detailed error messages

## 💡 Tips

1. **Use on Real Products**: The test works best on actual Amazon product pages
2. **Check Console Logs**: Look for detailed API call logs
3. **Compare Results**: Run multiple times to see consistency
4. **Test Different Products**: Try with different price ranges and categories

## 🎯 Quick Commands

```javascript
// Full analysis (recommended)
window.testFullAnalysis()

// Just test Gemini
window.testGemini()

// Just test Perplexity
window.testPerplexity()

// Test both services
window.testAI()

// Trigger the modal (shows everything in UI)
window.triggerModal()
```

## ✅ Expected Results

You should see:
- ✅ Detailed insights from Gemini
- ✅ Multiple related products from Perplexity
- ✅ Match scores and recommendations
- ✅ Savings calculations
- ✅ URLs to alternative products

If all of these appear, both AI services are working perfectly! 🎉


