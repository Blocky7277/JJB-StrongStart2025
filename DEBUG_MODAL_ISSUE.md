# 🐛 Debugging Modal Not Appearing

## Quick Fix Steps

### **1. Check Console Logs**

When you click "Add to Cart", you should see these logs in order:

```
🛒 Add to Cart button clicked!
📍 Is product page: true
🛑 Intercepting add to cart...
👤 Has preferences: true/false
🔍 Extracting product data...
✅ Product extracted: {...}
🤖 Analyzing product with AI...
✅ Product Analysis Complete: {...}
📱 Showing modal...
✅ Modal shown successfully
```

### **2. Common Issues**

#### **Issue: "No add-to-cart buttons found"**

**Solution:**
- Amazon may have changed button selectors
- Check console for: `⚠️ No add-to-cart buttons found`
- Try manual trigger: `await window.triggerModal()`

#### **Issue: "Not a product page"**

**Solution:**
- Make sure URL contains `/dp/` or `/gp/product/`
- Example: `https://www.amazon.com/dp/B07PDHSPYD`

#### **Issue: "User hasn't completed onboarding"**

**Solution:**
- Complete onboarding first
- Click extension icon
- Go through all steps

#### **Issue: "Could not extract product"**

**Solution:**
- Product selectors may need updating
- Try manual trigger to test: `await window.triggerModal()`
- Check if title and price are visible on page

#### **Issue: "Could not analyze product"**

**Solution:**
- Check if preferences are saved
- Verify API keys are set
- Check console for API errors

---

## Manual Testing

### **Test Modal Directly:**

1. Go to any Amazon product page
2. Open Console (F12)
3. Run:
   ```javascript
   await window.triggerModal()
   ```

This will:
- Extract product from page
- Analyze with AI
- Show modal directly

### **Test Button Detection:**

```javascript
// Check if buttons are found
const buttons = document.querySelectorAll('#add-to-cart-button')
console.log('Found buttons:', buttons.length)

// Check if intercepted
const intercepted = document.querySelectorAll('[data-intercepted="true"]')
console.log('Intercepted buttons:', intercepted.length)
```

### **Test Product Extraction:**

```javascript
// Import and test
const { ProductDetector } = await import(chrome.runtime.getURL('src/content/productDetector.ts'))
const product = ProductDetector.extractProduct()
console.log('Extracted product:', product)
```

---

## Debug Checklist

- [ ] Extension is loaded (check console for "🎯 Smart Shopping Assistant - Active!")
- [ ] On product page (URL has `/dp/` or `/gp/product/`)
- [ ] Onboarding completed
- [ ] Buttons found (check console for "✅ Intercepted X buttons")
- [ ] Click detected (check console for "🛒 Add to Cart button clicked!")
- [ ] Product extracted (check console for "✅ Product extracted")
- [ ] Analysis complete (check console for "✅ Product Analysis Complete")
- [ ] Modal shown (check console for "✅ Modal shown successfully")

---

## Force Modal to Show

If nothing works, try this in console:

```javascript
// Force show modal with test data
const { PurchaseModal } = await import(chrome.runtime.getURL('src/content/purchaseModal.ts'))
const modal = new PurchaseModal()

modal.show(
  {
    id: 'test',
    title: 'Test Product',
    price: '$99.99',
    priceNumeric: 99.99,
    image: '📦',
    category: 'Electronics',
    rating: 4.5
  },
  {
    recommendation: 'consider',
    reasons: ['Test reason 1', 'Test reason 2'],
    score: 0.65
  },
  [],
  () => console.log('Proceed'),
  () => console.log('Cancel')
)
```

---

## Still Not Working?

1. **Check Network Tab:**
   - Look for failed API calls
   - Check CORS errors
   - Verify API keys

2. **Check Elements Tab:**
   - Look for modal overlay
   - Check z-index (should be 9999999)
   - Verify modal HTML is added

3. **Check Console Errors:**
   - Look for red errors
   - Check stack traces
   - Verify imports are working

---

**Need more help?** Check the console logs and share the error messages!

