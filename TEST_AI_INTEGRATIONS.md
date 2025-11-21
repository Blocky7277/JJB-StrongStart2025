# 🧪 Testing AI Integrations Guide

Complete guide to test both Gemini AI and Perplexity Shopping integrations.

---

## 🚀 Quick Test (Easiest Method)

### **From Browser Console on Amazon:**

1. **Go to any Amazon product page**
2. **Open DevTools** (Press F12)
3. **Go to Console tab**
4. **Run one of these commands:**

```javascript
// Test both AI services
await window.testAI()

// Test only Gemini
await window.testGemini()

// Test only Perplexity
await window.testPerplexity()
```

---

## 📋 Step-by-Step Testing

### **Prerequisites:**

1. ✅ **Complete Onboarding**
   - Click extension icon
   - Select goals
   - Set price sensitivity
   - Swipe through 10+ products

2. ✅ **Rebuild Extension**
   ```bash
   npm run dev
   ```

3. ✅ **Reload Extension**
   - Go to `chrome://extensions/`
   - Click Reload button

---

## 🧪 Test 1: Gemini AI Analysis

### **What It Tests:**
- Match score calculation
- Product insights generation
- Recommendation reasoning

### **How to Test:**

**Option A: From Console**
```javascript
await window.testGemini()
```

**Option B: Manual Test**
1. Go to Amazon product page
2. Click "Add to Cart"
3. Check console for Gemini logs:
   ```
   🤖 Calling Gemini for match score analysis...
   ✅ Gemini match score received: {...}
   🤖 Calling Gemini for product insights...
   ✅ Gemini insights received: {...}
   ```

### **Expected Output:**

```
🧪 Testing Gemini AI Analysis...

📦 Test Product:
   Title: Sony WH-1000XM5 Wireless Noise Cancelling Headphones
   Price: $399.99
   Category: Electronics
   Rating: 4.8⭐

👤 User Profile:
   Goals: save-money, quality-first
   Price Sensitivity: moderate
   Average Liked Price: $50.00
   Quality Threshold: 4.5⭐

🔍 Test 1: Gemini Match Score Analysis
✅ Match Score Result:
   Score: 65.0%
   Recommendation: CONSIDER
   Confidence: 85.0%
   Reasons: 4 reasons found

   Breakdown:
   - price: 45.0%
     Product is $399.99, which is significantly above your typical...
   - quality: 90.0%
     Rating of 4.8 exceeds your 4.5 threshold...
   - goals: 70.0%
     Strong alignment with 'quality-first' goal...
   - category: 80.0%
     You typically like Electronics products...

🔍 Test 2: Gemini Product Insights
✅ Insights Result:
   Summary: This premium headphone is a solid match for your preferences...
   Strengths: 3 found
   Concerns: 2 found
   Value Assessment: Good value proposition considering...
```

### **Success Indicators:**
- ✅ Score calculated (0-100%)
- ✅ Recommendation provided (buy/consider/skip)
- ✅ Breakdown with reasoning
- ✅ Insights generated
- ✅ No errors in console

---

## 🧪 Test 2: Perplexity Product Search

### **What It Tests:**
- Product search functionality
- Preference filtering
- Real product discovery

### **How to Test:**

**Option A: From Console**
```javascript
await window.testPerplexity()
```

**Option B: Manual Test**
1. Go to Amazon product page
2. Click "Add to Cart"
3. Check console for Perplexity logs:
   ```
   🔍 Searching for similar products with Perplexity...
   🔍 Searching Perplexity for similar products...
   📡 Calling Perplexity API...
   ✅ Found 5 products from Perplexity
   ```

### **Expected Output:**

```
🧪 Testing Perplexity Product Search...

📦 Searching for similar products to:
   Sony WH-1000XM5 Wireless Noise Cancelling Headphones
   Price: $399.99
   Category: Electronics

👤 Filtering by:
   Goals: save-money, quality-first
   Price Range: ~$50
   Quality: 4.5⭐+

🔍 Calling Perplexity API...
✅ Found 5 products from Perplexity

📋 Products Found:

   1. Anker Soundcore Life Q30
      Price: $79.99
      Category: Electronics
      Rating: 4.6⭐
      Why: Great value option, 30% cheaper with similar features...

   2. Bose QuietComfort 45
      Price: $329.99
      Category: Electronics
      Rating: 4.7⭐
      Why: Premium quality with excellent noise cancellation...

   ...
```

### **Success Indicators:**
- ✅ Products found (5+ products)
- ✅ Real product names (not "Alternative 1")
- ✅ Realistic prices
- ✅ Actual ratings
- ✅ Recommendation reasons
- ✅ Products match preferences

---

## 🧪 Test 3: Combined Test

### **Test Both Services Together:**

```javascript
await window.testAI()
```

### **Expected Output:**

```
🚀 Testing Both AI Services

============================================================

🧪 Testing Gemini AI Analysis...
[Gemini test output...]

============================================================

🧪 Testing Perplexity Product Search...
[Perplexity test output...]

============================================================

📊 Test Summary:
   Gemini AI: ✅ PASSED
   Perplexity: ✅ PASSED

🎉 All tests passed! Both AI services are working correctly.
```

---

## 🐛 Troubleshooting

### **Gemini Test Fails:**

**Error: "API key invalid"**
- Check `src/config/gemini.ts`
- Verify key is correct
- No extra spaces

**Error: "No response text"**
- Check network connection
- Verify API endpoint
- Check rate limits

**Error: "JSON parse error"**
- Gemini response format changed
- Check console for actual response
- Parser handles markdown automatically

### **Perplexity Test Fails:**

**Error: "401 Unauthorized"**
- Check `src/config/perplexity.ts`
- Verify API key starts with `pplx-`
- No extra spaces

**Error: "429 Rate limit"**
- Too many requests
- Wait a few minutes
- Check Perplexity dashboard

**Error: "No products found"**
- Check API response in Network tab
- Verify query is being built correctly
- Check user preferences are set

**Products seem generic:**
- Perplexity needs more context
- Try different product categories
- Ensure onboarding is complete

---

## 📊 What to Check

### **Gemini Analysis:**
- [ ] Match score is calculated (0-100%)
- [ ] Recommendation is provided (buy/consider/skip)
- [ ] Score breakdown shows all components
- [ ] Reasoning is detailed and specific
- [ ] Insights include summary, strengths, concerns
- [ ] Confidence level is shown

### **Perplexity Search:**
- [ ] Real product names (not generic)
- [ ] Actual prices (not calculated)
- [ ] Real ratings (when available)
- [ ] Products match user preferences
- [ ] Recommendation reasons are specific
- [ ] Products are in same/similar category

---

## 🎯 Real-World Test

### **Test on Actual Amazon Product:**

1. **Go to:** https://www.amazon.com/dp/B07PDHSPYD (or any product)

2. **Open Console** (F12)

3. **Click "Add to Cart"**

4. **Check Modal:**
   - Should show Gemini insights
   - Should show Perplexity products
   - Should have score breakdown
   - Should have recommendation reasons

5. **Check Console:**
   - Gemini logs
   - Perplexity logs
   - No errors

---

## ✅ Success Checklist

- [ ] Gemini match score works
- [ ] Gemini insights generated
- [ ] Perplexity finds real products
- [ ] Products match preferences
- [ ] Modal displays all information
- [ ] No errors in console
- [ ] Fallback works if API fails

---

## 🎉 You're Done!

If all tests pass:
- ✅ Gemini AI is analyzing products correctly
- ✅ Perplexity is finding real alternatives
- ✅ Both services are integrated properly
- ✅ Extension is ready for use!

---

**Happy Testing!** 🧪🚀

