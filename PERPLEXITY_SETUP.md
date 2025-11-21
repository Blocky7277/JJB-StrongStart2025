# 🚀 Perplexity Shopping Setup - Quick Start

## ✅ Integration Complete!

Perplexity Shopping integration is ready! You just need to add your API key.

---

## 🔑 Setup Steps

### **1. Get Perplexity API Key**

1. Visit: **https://www.perplexity.ai/api-platform**
2. Sign up or log in
3. Go to **API Settings**
4. Click **"Generate API Key"**
5. Copy your API key

### **2. Add API Key**

1. Open: `src/config/perplexity.ts`
2. Replace: `YOUR_PERPLEXITY_API_KEY_HERE` with your actual key
3. Save the file

**Example:**
```typescript
export const PERPLEXITY_CONFIG = {
  API_KEY: 'pplx-abc123xyz...', // Your actual key
  API_URL: 'https://api.perplexity.ai/chat/completions',
}
```

---

## 🎯 What It Does

When users view products on Amazon:

1. **Perplexity searches** for similar products
2. **Filters by user preferences:**
   - Price range (based on average spending)
   - Quality threshold (from swipe patterns)
   - Goals (save-money, quality-first, eco-friendly)
   - Preferred categories
3. **Returns real products** with:
   - Actual prices
   - Real ratings
   - Product URLs
   - Why each is recommended

---

## 🧪 Testing

### **1. Rebuild Extension:**
```bash
npm run dev
```

### **2. Reload in Chrome:**
- Go to `chrome://extensions/`
- Find your extension
- Click **Reload**

### **3. Test on Amazon:**
1. Go to any Amazon product page
2. Click **"Add to Cart"**
3. Open **DevTools Console** (F12)
4. Look for:
   ```
   🔍 Searching Perplexity for similar products...
   ✅ Found X products from Perplexity
   ```

### **4. Check Modal:**
- You should see **real alternative products**
- With **actual prices and ratings**
- **Why recommended** explanations

---

## 📊 What You'll See

### **In Console:**
```
🔍 Searching Perplexity for similar products...
📡 Calling Perplexity API...
📡 Perplexity API response status: 200
📥 Perplexity API response received
✅ Found 5 products from Perplexity
```

### **In Modal:**
- **Better Alternatives Found** section
- Real product names
- Actual prices
- Real ratings
- Recommendation reasons

---

## ⚠️ Troubleshooting

### **Error: "API key invalid"**
- Check `src/config/perplexity.ts`
- Verify key is correct
- Make sure no extra spaces

### **Error: "Rate limit exceeded"**
- Too many requests
- Check Perplexity pricing/limits
- Consider caching results

### **No products found:**
- Check console for errors
- Verify API key is working
- Falls back to mock products automatically

### **Products seem generic:**
- Perplexity might need more specific queries
- Check user preferences are set
- Try different product categories

---

## 🔄 Fallback Behavior

If Perplexity fails:
- ✅ System continues working
- ✅ Uses mock products as fallback
- ✅ Logs error to console
- ✅ User experience not interrupted

---

## 📚 Documentation

- **Full Guide:** See `PERPLEXITY_INTEGRATION.md`
- **API Docs:** https://docs.perplexity.ai/
- **API Platform:** https://www.perplexity.ai/api-platform

---

## 🎉 Next Steps

1. ✅ Add your Perplexity API key
2. ✅ Rebuild and reload extension
3. ✅ Test on Amazon product page
4. ✅ See real product recommendations!

---

**Ready to find real alternatives! 🚀**

Your extension now uses Perplexity AI to find actual similar products that match user preferences!

