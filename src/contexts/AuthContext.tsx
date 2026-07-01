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

export type Permissions = Record<string, boolean>;

interface AuthContextType {
  user: AppUser | null;
  session: AppSession | null;
  profile: { full_name: string; email: string; role: UserRole; phone: string | null } | null;
  permissions: Permissions | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isViewer: boolean;
  canAccess: (key: string) => boolean;
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
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser: AppUser) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, role, phone')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!error && data) {
      const p = data as { full_name: string; email: string; role: UserRole; phone: string | null };
      setProfile(p);
      await loadPermissions(p.role);
      return;
    }

    // No profile row — use user_metadata as display fallback (signUp creates the real row)
    const meta = authUser.user_metadata ?? {};
    const role = ((meta.role as UserRole) || 'viewer') as UserRole;
    setProfile({
      full_name: (meta.full_name as string) || authUser.email || 'User',
      email: authUser.email,
      role,
      phone: (meta.phone as string | null) || null,
    });
    await loadPermissions(role);
  };

  const loadPermissions = async (roleId: string) => {
    try {
      const token = localStorage.getItem('sm_access_token');
      const res = await fetch(`/roles/${roleId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const { data } = await res.json();
      setPermissions(data?.permissions ?? null);
    } catch {
      setPermissions(null);
    }
  };

  useEffect(() => {
    // onAuthStateChange fires INITIAL_SESSION immediately on mount, so getSession() is redundant
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      const appSession = s as AppSession | null;
      setSession(appSession);
      setUser(appSession?.user ?? null);
      if (appSession?.user) {
        fetchProfile(appSession.user as AppUser).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setPermissions(null);
        setLoading(false);
      }
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }).then(({ error }) => ({ error }));

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = 'staff', phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role, phone: phone || null } },
    });

    if (!error && data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        role,
        phone: phone || null,
      }, { onConflict: 'id', ignoreDuplicates: true });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPermissions(null);
    setUser(null);
    setSession(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'admin' || profile?.role === 'staff';
  const isViewer = profile?.role === 'viewer';
  const canAccess = (key: string) => permissions === null || permissions[key] !== false;

  return (
    <AuthContext.Provider
      value={{ user, session, profile, permissions, loading, isAdmin, isStaff, isViewer, canAccess, signIn, signUp, signOut, refreshProfile }}
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
