import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a hash or query parameter that looks like an auth response
    // This helps prevent a race condition where getSession returns null before
    // the auth client has processed the redirect
    const isAuthRedirect = 
      window.location.hash.includes('access_token') || 
      window.location.search.includes('code=');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Error getting session:", error);
      }
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
      } else if (!isAuthRedirect) {
        // Only set loading to false if we're not waiting for an auth redirect
        setLoading(false);
      }
      // If isAuthRedirect is true, we wait for onAuthStateChange
      // But we should add a fallback timeout just in case
    });

    // Fallback timeout to ensure we don't hang indefinitely
    if (isAuthRedirect) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 5000); // 5 second timeout
      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    }

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
