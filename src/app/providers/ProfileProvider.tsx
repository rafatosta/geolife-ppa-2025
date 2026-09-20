/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { profileService } from '../../services/profileService';
import type { Profile } from '../../types/domain';
import { useAuth } from './AuthProvider';

interface ProfileContextValue { profile: Profile | null; loading: boolean; error: string | null; refresh: () => Promise<void>; }
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setProfile(null); setError(null); return; }
    setLoading(true); setError(null);
    try { setProfile(await profileService.getCurrent(user.id)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível carregar seu perfil.'); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { if (!authLoading) void refresh(); }, [authLoading, refresh]);
  const value = useMemo(() => ({ profile, loading: authLoading || loading, error, refresh }), [profile, authLoading, loading, error, refresh]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile deve ser usado dentro de ProfileProvider.');
  return value;
}
