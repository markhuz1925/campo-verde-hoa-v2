// src/lib/supabase.ts
import { createClient, type Session, type User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. Please check your .env file."
  );
  // In a real app, you might want to throw an error or display a message to the user.
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Auth State Management ---
// This will be used by AuthContext to initialize and listen for changes

export interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const getAuthSession = async (): Promise<AuthState> => {
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
};

export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void
) => {
  return supabase.auth.onAuthStateChange(callback);
};
