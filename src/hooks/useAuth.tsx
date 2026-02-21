import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: { id: string; full_name: string | null; phone: string | null; assigned_advisor_id: string | null; active_package?: string | null; last_seen?: string | null } | null;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: unknown }>;
  signIn: (email: string, password: string) => Promise<{ data: { user: User | null; session: Session | null }; error: unknown }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string; full_name: string | null; phone: string | null; assigned_advisor_id: string | null; is_suspended?: boolean; active_package?: string | null; last_seen?: string | null } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const updateLastSeen = async () => {
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString() } as any)
        .eq("user_id", user.id);
    };

    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, assigned_advisor_id, is_suspended, active_package, last_seen")
      .eq("user_id", userId)
      .single();

    if (data) {
      if ((data as any).is_suspended) {
        // If they are suspended, sign them out immediately
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        return;
      }
      setProfile(data as any);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
