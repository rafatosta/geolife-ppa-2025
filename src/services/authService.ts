import { isSupabaseConfigured, supabase } from '../lib/supabase';

function ensureConfigured() {
  if (!isSupabaseConfigured) throw new Error('Configure as variáveis do Supabase antes de continuar.');
}

export const authService = {
  async signIn(email: string, password: string) {
    ensureConfigured();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signUp(name: string, email: string, password: string) {
    ensureConfigured();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    });
    if (error) throw error;
    return { confirmationRequired: data.session === null };
  },
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
