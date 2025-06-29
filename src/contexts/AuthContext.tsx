// src/contexts/AuthContext.tsx
import { type Session, type User } from "@supabase/supabase-js";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getAuthSession, onAuthStateChange, supabase } from "../lib/supabase"; // Adjust path as needed

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase not configured - using mock auth (not authenticated)");
      // Immediately set as not authenticated if Supabase isn't configured
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const initializeAuth = async () => {
      try {
        const { session, user } = await getAuthSession();
        setSession(session);
        setUser(user);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        // If auth fails, assume not authenticated and stop loading
        setSession(null);
        setUser(null);
        setIsLoading(false);
      }
    };

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn("Auth initialization timeout - assuming not authenticated");
      setSession(null);
      setUser(null);
      setIsLoading(false);
    }, 2000); // Reduced to 2 seconds

    initializeAuth().then(() => {
      clearTimeout(loadingTimeout);
    }).catch(() => {
      clearTimeout(loadingTimeout);
      setSession(null);
      setUser(null);
      setIsLoading(false);
    });

    // Listen for auth state changes from Supabase..
    let subscription: any;
    try {
      const {
        data: { subscription: sub },
      } = onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
        clearTimeout(loadingTimeout);
      });
      subscription = sub;
    } catch (error) {
      console.error("Failed to set up auth state listener:", error);
      clearTimeout(loadingTimeout);
      setSession(null);
      setUser(null);
      setIsLoading(false);
    }

    return () => {
      clearTimeout(loadingTimeout);
      if (subscription) {
        subscription.unsubscribe(); // Cleanup subscription on unmount
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);
    return { user: data.user, error };
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setIsLoading(false);
    return { user: data.user, error };
  };

  const signOut = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsLoading(false);
    return { error };
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
