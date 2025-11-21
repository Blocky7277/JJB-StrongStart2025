# 🧪 Testing Perplexity Integration

## ✅ API Key Configured!

Your Perplexity API key is set up. Let's test it!

---

## 🚀 Quick Test Steps

### **1. Rebuild Extension**

```bash
npm run dev
```

### **2. Reload Extension**

1. Go to `chrome://extensions/`
2. Find "Smart Shopping Assistant"
3. Click the **Reload** button (🔄)

### **3. Complete Onboarding** (if not done)

1. Click extension icon
2. Complete the onboarding flow:
   - Select your goals
   - Set price sensitivity
   - Swipe through 10+ products

### **4. Test on Amazon**

1. Go to **any Amazon product page**
   - Example: https://www.amazon.com/dp/B07PDHSPYD
2. Open **DevTools Console** (Press F12)
3. Click **"Add to Cart"** button
4. Watch the console for Perplexity logs

---

## 📊 What to Look For

### **In Console (F12):**

You should see these logs:

```
🔍 Searching Perplexity for similar products...
📡 Calling Perplexity API...
📡 Perplexity API response status: 200
📥 Perplexity API response received
✅ Found X products from Perplexity
```

### **In Modal:**

When the purchase analysis modal appears:

1. **Better Alternatives Found** section
2. **Real product names** (not "Alternative 1", "Alternative 2")
3. **Actual prices** (realistic, not calculated)
4. **Real ratings** (if available)
5. **Recommendation reasons** (why each product is suggested)

---

## ✅ Success Indicators

### **Working Correctly:**
- ✅ Console shows "Found X products from Perplexity"
- ✅ Modal shows real product names
- ✅ Products have realistic prices
- ✅ Products match your preferences
- ✅ Recommendation reasons are specific

### **If Using Fallback:**
- ⚠️ Console shows "Perplexity search failed"
- ⚠️ Modal shows generic "Alternative 1", "Alternative 2"
- ⚠️ Prices are calculated (80%, 120% of target)

---

## 🐛 Troubleshooting

### **Issue: "API key invalid" or 401 error**

**Check:**
- API key is correct in `src/config/perplexity.ts`
- No extra spaces or quotes
- Key starts with `pplx-`

**Fix:**
```typescript
API_KEY: 'pplx-YOUR_API_KEY_HERE' // Replace with your actual Perplexity API key
```

### **Issue: "Rate limit exceeded" or 429 error**

**Cause:**
- Too many API calls
- Free tier limit reached

**Fix:**
- Wait a few minutes
- Check Perplexity dashboard for usage
- Consider upgrading plan

### **Issue: "No products found" or empty array**

**Check Console:**
- Look for error messages
- Check if response parsing failed
- Verify API response format

**Common Causes:**
- API response format changed
- JSON parsing error
- Network issues

### **Issue: Products seem generic**

**Possible Reasons:**
- Perplexity needs more specific queries
- User preferences not set
- Product category not well-defined

**Fix:**
- Complete onboarding with more products
- Try different product categories
- Check user goals are set

---

## 🔍 Debug Mode

### **Enable Detailed Logging:**

The service already logs:
- API calls
- Response status
- Product count
- Errors

### **Check Network Tab:**

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by "perplexity"
4. Click on the request
5. Check:
   - Request payload (query)
   - Response status
   - Response body

---

## 📝 Example Test Case

### **Test Product:**
- **Title:** "Wireless Bluetooth Headphones"
- **Price:** $89.99
- **Category:** Electronics
- **Rating:** 4.6

### **User Profile:**
- **Goals:** ["save-money", "quality-first"]
- **Price Sensitivity:** moderate
- **Average Liked Price:** $50
- **Quality Threshold:** 4.5

### **Expected Perplexity Query:**
```
Find similar products to "Wireless Bluetooth Headphones" 
in Electronics category. 
Find cheaper alternatives around $50. 
Prioritize high-quality products with at least 4.5 star rating. 
Return 5 products as JSON...
```

### **Expected Results:**
- Products in Electronics category
- Prices around $50 or less
- Ratings 4.5+ stars
- Similar features (bluetooth, wireless)

---

## 🎯 Next Steps

1. ✅ **Test on multiple products**
2. ✅ **Try different categories**
3. ✅ **Check recommendation quality**
4. ✅ **Verify prices are realistic**
5. ✅ **Confirm products match goals**

---

## 💡 Pro Tips

### **Best Test Products:**
- Electronics (headphones, speakers)
- Home & Kitchen (coffee makers, blenders)
- Sports & Outdoors (fitness equipment)
- Books (well-defined categories)

### **Avoid:**
- Very specific/niche products
- Products with no clear category
- Products with unusual names

---

## 🎉 Success!

If you see:
- ✅ Real product names
- ✅ Actual prices
- ✅ Products matching your preferences
- ✅ Good recommendation reasons

**Then Perplexity is working perfectly!** 🚀

---

**Happy Testing!** 🧪

