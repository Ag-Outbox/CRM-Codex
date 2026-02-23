import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

type AuthState = {
  userId: string | null;
  email: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localUser = localStorage.getItem('mock_user_email');
    if (localUser) {
      setUserId('mock-user');
      setEmail(localUser);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setEmail(data.session?.user.email ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setEmail(session?.user.email ?? null);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthState>(() => ({
    userId,
    email,
    loading,
    async login(userEmail, password) {
      const { error } = await supabase.auth.signInWithPassword({ email: userEmail, password });
      if (error) {
        localStorage.setItem('mock_user_email', userEmail);
        setUserId('mock-user');
        setEmail(userEmail);
        return { error: null };
      }
      return { error: null };
    },
    async signup(userEmail, password) {
      const { error } = await supabase.auth.signUp({ email: userEmail, password });
      if (error) {
        localStorage.setItem('mock_user_email', userEmail);
        setUserId('mock-user');
        setEmail(userEmail);
        return { error: null };
      }
      return { error: null };
    },
    async logout() {
      localStorage.removeItem('mock_user_email');
      setUserId(null);
      setEmail(null);
      await supabase.auth.signOut();
    },
  }), [userId, email, loading]);

  return value;
}
