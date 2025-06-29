// src/lib/supabase.ts
import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your .env file."
  );
  console.error("Using placeholder values for development.");
}

// Use placeholder values if environment variables are missing
const finalUrl = supabaseUrl || "https://placeholder.supabase.co";
const finalKey = supabaseAnonKey || "placeholder-key";

export const supabase = createClient(finalUrl, finalKey);

// --- Auth State Management ---
// This will be used by AuthContext to initialize and listen for changes

export interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const getAuthSession = async (): Promise<AuthState> => {
  try {
    // Check if we have valid Supabase configuration
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase not configured - treating as unauthenticated");
      return {
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      return {
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    }

    return {
      session,
      user: session?.user || null,
      isAuthenticated: !!session,
      isLoading: false,
    };
  } catch (error) {
    console.error("Unexpected error in getAuthSession:", error);
    return {
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  }
};

export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};
