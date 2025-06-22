/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
  // Add other VITE_ prefixed variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
