# 🔐 Environment Variables Setup

## Overview

The extension now supports **three methods** for storing API keys (in priority order):

1. **Chrome Storage** (Most Secure) - User-managed, encrypted at rest
2. **Environment Variables** (Development) - `.env.local` file
3. **Hardcoded Fallback** (Development Only) - For quick testing

## Setup Instructions

### Option 1: Environment Variables (Recommended for Development)

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit `.env.local` and add your API keys:**
   ```env
   VITE_GEMINI_API_KEY=your_actual_gemini_key_here
   VITE_PERPLEXITY_API_KEY=your_actual_perplexity_key_here
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Chrome Storage (Recommended for Production)

The extension automatically uses Chrome storage if keys are set there. Users can manage keys via a settings UI (to be implemented).

### Option 3: Hardcoded (Development Only)

For quick testing, keys can be hardcoded in config files, but this is **NOT recommended** for production.

## How It Works

### Priority Order

When the extension needs an API key, it checks in this order:

1. **Chrome Storage** (`chrome.storage.local`)
   - Most secure
   - User-managed
   - Encrypted at rest

2. **Environment Variables** (`.env.local`)
   - Good for development
   - Not committed to Git
   - ⚠️ Note: VITE_ prefixed vars ARE exposed in the bundle

3. **Hardcoded Fallback**
   - Development only
   - Should be removed in production

### Code Example

```typescript
// Services automatically use the priority system
import { getGeminiConfig } from '@/config/gemini'

const config = await getGeminiConfig()
// Returns key from: storage > env > fallback
```

## Security Notes

### ⚠️ Important: Vite Environment Variables

**Vite exposes `VITE_*` variables to the client bundle!**

This means:
- ✅ `.env.local` is gitignored (safe)
- ⚠️ But keys ARE visible in the built extension bundle
- ✅ For production, use Chrome storage instead

### Best Practices

1. **Development:** Use `.env.local` (convenient, but visible in bundle)
2. **Production:** Use Chrome storage (most secure)
3. **Never commit:** `.env.local` is gitignored
4. **Never hardcode:** Remove hardcoded keys before production

## File Structure

```
.env.example          # Template (committed to Git)
.env.local            # Your actual keys (gitignored)
src/config/
  gemini.ts           # Uses env vars or storage
  perplexity.ts       # Uses env vars or storage
  supabase.ts         # Uses env vars or storage
src/utils/
  apiKeyStorage.ts    # Chrome storage utilities
```

## Migration

The system automatically migrates:
- Hardcoded keys → Chrome storage (on first run)
- Environment variables → Chrome storage (optional)

## Troubleshooting

### Keys not working?

1. Check `.env.local` exists and has correct format
2. Restart dev server after changing `.env.local`
3. Check browser console for warnings
4. Verify keys are correct (no extra spaces)

### Want to use Chrome storage?

```typescript
import { setApiKeys } from '@/utils/apiKeyStorage'

await setApiKeys({
  gemini: 'your-key',
  perplexity: 'your-key',
})
```

## Next Steps

- [ ] Create Settings UI for managing API keys
- [ ] Add key validation before saving
- [ ] Remove hardcoded fallbacks for production
- [ ] Add key rotation support





