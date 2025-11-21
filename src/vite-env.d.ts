/// <reference types="vite/client" />

/**
 * Environment Variable Type Definitions
 * These are loaded from .env.local at build time
 */
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY?: string
  readonly VITE_PERPLEXITY_API_KEY?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}





