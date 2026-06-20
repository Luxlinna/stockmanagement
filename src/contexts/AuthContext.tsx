import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type UserRole = 'admin' | 'staff' | 'viewer';

// Slim local types — no @supabase/supabase-js dependency
export interface AppUser {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export interface AppSession {
  access_token: string;
  user: AppUser;
}

export type { UserRole };

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  profile: { full_name: string; email: string; role: UserRole; phone: string | null } | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isViewer: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role?: UserRole, phone?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<AppSession | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; email: string; role: UserRole; phone: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, role, phone')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as { full_name: string; email: string; role: UserRole; phone: string | null });
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      const appSession = s as AppSession | null;
      setSession(appSession);
      setUser(appSession?.user ?? null);
      if (appSession?.user) {
        fetchProfile(appSession.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      const appSession = s as AppSession | null;
      setSession(appSession);
      setUser(appSession?.user ?? null);
      if (appSession?.user) {
        fetchProfile(appSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'staff', phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    if (!error && data.user) {
      const u = data.user as AppUser;
      await supabase.from('profiles').upsert({
        id: u.id,
        email,
        full_name: fullName,
        role,
        phone: phone || null,
      }, { onConflict: 'id' });
      await supabase.from('notification_settings').upsert({
        user_id: u.id,
        email_enabled: true,
        sms_enabled: false,
        in_app_enabled: true,
        browser_push_enabled: true,
        category_thresholds: { Electronics: 5, Furniture: 3, Lighting: 4, 'Smart Home': 5, Accessories: 10 },
      }, { onConflict: 'user_id' });
      await fetchProfile(u.id);
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff';
  const isViewer = profile?.role === 'viewer';

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, isAdmin, isStaff, isViewer, signIn, signUp, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
