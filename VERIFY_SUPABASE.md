# ✅ Verify Supabase Integration

## 🎯 Quick Verification Checklist

Since you've integrated the database, let's verify everything is working!

---

## 📋 Step-by-Step Verification

### **1. Check Extension Console** (Browser DevTools)

Open the extension popup and check console for:

✅ **Good Signs:**
```
✅ Preferences synced to Supabase
✅ Swipe decision synced to Supabase
✅ 15 swipe decisions synced to Supabase
✅ Purchase attempt tracked in Supabase
```

❌ **If you see errors:**
```
❌ Error syncing preferences: ...
❌ Error creating user: ...
```

**Fix:** Check Supabase tables exist and API key is correct

---

### **2. Check Supabase Dashboard**

Go to: https://xxfuvulwhkwjmjzoojqw.supabase.co

#### **A. Verify Tables Exist:**
1. Click **Table Editor** (left sidebar)
2. Should see 5 tables:
   - ✅ `users`
   - ✅ `user_preferences`
   - ✅ `swipe_decisions`
   - ✅ `purchase_attempts`
   - ✅ `product_reviews`

#### **B. Check Data Flow:**

**After completing onboarding:**
1. Open `users` table → Should have 1 row
2. Open `user_preferences` table → Should have your goals/budget
3. Open `swipe_decisions` table → Should have 10-50 rows

**After clicking "Add to Cart" on Amazon:**
1. Open `purchase_attempts` table → Should have entries
2. Check `user_decision` column → Should show 'proceeded' or 'cancelled'

---

### **3. Test Data Sync**

#### **Test 1: Onboarding Sync**
```
1. Reset extension (Settings → Full Reset)
2. Complete onboarding (10+ swipes)
3. Check Supabase → swipe_decisions table
4. Should see 10+ rows with your swipe data
```

#### **Test 2: Purchase Tracking**
```
1. Go to Amazon product page
2. Click "Add to Cart"
3. Modal appears
4. Click "Add to Cart Anyway" or "View Alternatives"
5. Check Supabase → purchase_attempts table
6. Should see 1 new row with product data
```

#### **Test 3: Preferences Sync**
```
1. Open extension → Settings
2. Change a goal or budget level
3. Click "Save Changes"
4. Check Supabase → user_preferences table
5. Should see updated_at timestamp changed
```

---

## 🔍 What to Look For in Supabase

### **users Table:**
```json
{
  "extension_user_id": "user_1699824000_abc123",
  "created_at": "2024-11-12T10:00:00Z",
  "updated_at": "2024-11-12T10:00:00Z"
}
```

### **user_preferences Table:**
```json
{
  "user_id": "user_1699824000_abc123",
  "goals": ["save-money", "quality-first"],
  "goal_weights": {"save-money": 1.0, "quality-first": 1.0},
  "price_sensitivity": {
    "level": "moderate",
    "maxPrice": 150,
    "willingToPayMore": true
  },
  "category_preferences": [
    {
      "category": "Home",
      "interest": "high",
      "averagePricePoint": 32.50
    }
  ]
}
```

### **swipe_decisions Table:**
```json
{
  "user_id": "user_1699824000_abc123",
  "product_id": "prod-2",
  "decision": "like",
  "product_data": {
    "id": "prod-2",
    "title": "Organic Cotton T-Shirt",
    "price": "$24.99",
    "priceNumeric": 24.99,
    "category": "Clothing",
    "rating": 4.8
  },
  "timestamp": 1699824000000
}
```

### **purchase_attempts Table:**
```json
{
  "user_id": "user_1699824000_abc123",
  "product_id": "B07PDHSPYD",
  "recommendation": "consider",
  "score": 0.68,
  "user_decision": "viewed_alternative",
  "alternative_selected": "alt-123",
  "product_data": {
    "title": "Wireless Headphones",
    "priceNumeric": 89.99
  }
}
```

---

## 🐛 Troubleshooting

### **Problem: No data in Supabase**

**Check:**
1. ✅ Tables created? (Run SQL schema)
2. ✅ Extension reloaded? (chrome://extensions/)
3. ✅ Console errors? (Check browser DevTools)
4. ✅ API key correct? (Check src/config/supabase.ts)

**Solution:**
```bash
# Rebuild extension
npm run dev

# Reload in Chrome
chrome://extensions/ → Reload button

# Check console for errors
F12 → Console tab
```

---

### **Problem: "Error creating user"**

**Cause:** User table might not exist or RLS blocking

**Fix:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM users LIMIT 1;

-- If error, recreate table:
-- Copy databaseSchema.sql and run again
```

---

### **Problem: Data syncs but doesn't appear**

**Check:**
1. ✅ Right table? (users vs user_preferences)
2. ✅ Right user_id? (Check extension_user_id matches)
3. ✅ Filters applied? (Clear any table filters)

**Solution:**
```sql
-- Check all data
SELECT * FROM users;
SELECT * FROM user_preferences;
SELECT COUNT(*) FROM swipe_decisions;
```

---

## ✅ Success Indicators

### **Everything Working:**
- ✅ Console shows "synced to Supabase" messages
- ✅ Supabase tables have data
- ✅ User ID appears in all tables
- ✅ Swipe decisions match your onboarding
- ✅ Purchase attempts tracked correctly

### **Data Quality:**
- ✅ Product data is complete (title, price, category)
- ✅ Timestamps are recent
- ✅ Decisions are 'like' or 'dislike'
- ✅ Scores are between 0-1

---

## 🧪 Quick Test Script

Run this in browser console on any page:

```javascript
// Test Supabase connection
import { supabase } from './src/config/supabase'

// Check connection
const { data, error } = await supabase
  .from('users')
  .select('count')

console.log('Connection:', error ? '❌ Failed' : '✅ Working')
console.log('Data:', data)
```

---

## 📊 Expected Data Volume

### **After Onboarding:**
- `users`: 1 row
- `user_preferences`: 1 row
- `swipe_decisions`: 10-50 rows (depending on exit point)

### **After Shopping:**
- `purchase_attempts`: 1 row per "Add to Cart" click
- `product_reviews`: 0-5 rows (if reviews submitted)

### **Total per User:**
- Minimum: 12 rows (1 user + 1 pref + 10 swipes)
- Average: 30-40 rows
- Active: 50-100+ rows

---

## 🎯 Next Steps After Verification

### **1. Test LLM Integration:**
```typescript
import { SupabaseSync } from '@/services/supabaseSync'

// Generate LLM prompt
const prompt = await SupabaseSync.generateLLMPrompt()
console.log(prompt)

// Get user data
const data = await SupabaseSync.fetchUserDataForLLM()
console.log('Total data points:', data.totalDataPoints)
```

### **2. Generate Insights:**
```typescript
import { LLMService } from '@/services/llmService'

// Get AI insights
const insights = await LLMService.generateInsights()
console.log(insights.personality)
console.log(insights.recommendations)
```

### **3. Build Dashboard:**
- Show user their data
- Display insights
- Show savings opportunities
- Category preferences visualization

---

## 📈 Monitoring

### **Check Daily:**
- New users created
- Swipe decisions count
- Purchase attempts
- Review submissions

### **Query Examples:**
```sql
-- Total users
SELECT COUNT(*) FROM users;

-- Average swipes per user
SELECT AVG(swipe_count) FROM (
  SELECT user_id, COUNT(*) as swipe_count
  FROM swipe_decisions
  GROUP BY user_id
) sub;

-- Most liked categories
SELECT 
  product_data->>'category' as category,
  COUNT(*) as likes
FROM swipe_decisions
WHERE decision = 'like'
GROUP BY category
ORDER BY likes DESC;
```

---

## ✅ Verification Complete!

If you see data in Supabase tables, **everything is working!** 🎉

**Your extension now:**
- ✅ Collects rich user data
- ✅ Syncs to Supabase automatically
- ✅ Ready for LLM analysis
- ✅ Tracks all purchase decisions
- ✅ Stores product reviews

**Next:** Connect to your LLM API and generate insights! 🤖

---

Made with ❤️ for data-driven insights



