# How to Run the Chrome Extension

## Quick Start Guide

### Step 1: Open Chrome Extensions Page

1. Open Google Chrome
2. Type in the address bar: `chrome://extensions/`
3. Press Enter

### Step 2: Enable Developer Mode

1. Look at the top-right corner of the Extensions page
2. Find the toggle switch labeled **"Developer mode"**
3. Click it to turn it ON (it should turn blue)

### Step 3: Load Your Extension

1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. A file dialog will open
3. Navigate to this folder:
   ```
   C:\Users\ugoch\OneDrive\Desktop\strong_start_project\JJB-StrongStart2025\dist
   ```
4. Click the **"Select Folder"** button

### Step 4: Find the Extension

After loading, you should see your extension appear on the Extensions page with:
- Name: "crxjs-project"
- A logo icon
- An "Enabled" toggle (make sure it's ON)

### Step 5: Open the Extension Popup

**Option A - From the Toolbar:**
1. Look at the top-right of Chrome (next to the address bar)
2. You might see your extension icon directly, or click the puzzle piece icon 🧩
3. Find your extension in the list
4. Click the pin icon 📌 to pin it to the toolbar
5. Click the extension icon to open the popup

**Option B - From the Extensions Page:**
1. On the `chrome://extensions/` page
2. Find your extension
3. Click the "Details" button
4. Look for "Inspect views" section
5. Click the link to open the popup

### Step 6: Experience the Onboarding! 🎉

The onboarding will start automatically when you open the popup for the first time.

---

## Troubleshooting

### Problem: Extension doesn't appear after loading
**Solution:** Make sure you selected the `dist` folder, not the project root folder.

### Problem: Extension shows errors
**Solution:** 
1. Make sure the dev server is running: `npm run dev`
2. Check the Errors section on the Extensions page
3. Click "Reload" (circular arrow) button on the extension card

### Problem: Can't find the extension icon
**Solution:**
1. Click the puzzle piece icon 🧩 in Chrome toolbar
2. Your extension should be listed there
3. Click the pin icon to make it permanently visible

### Problem: Want to see the onboarding again
**Solution:** 
1. Open the extension popup
2. Click the "Settings" button (⚙️)
3. This will restart the onboarding flow

---

## What You'll See

### 1. Welcome Screen
- Purple gradient background
- Extension introduction
- "Get Started" button

### 2. Goal Selection
- 6 interactive goal cards
- Select your shopping priorities
- Must select at least 1 goal

### 3. Swipe Products (Tinder-style!)
- 8 product cards
- Swipe right = Like
- Swipe left = Pass
- Or use the buttons below

### 4. Completion
- Success animation
- Your selected goals summary
- Next steps guide

---

## Pro Tips

✅ The dev server must be running (`npm run dev`)
✅ Keep the Extensions page open to see any errors
✅ Click "Reload" on the extension card after making code changes
✅ Use Chrome DevTools to debug (right-click popup → Inspect)

Enjoy your Smart Shopping Assistant! 🎯✨

