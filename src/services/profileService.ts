import { supabase } from '../lib/supabase';
import type { Profile } from '../types/domain';

export const profileService = {
  async getCurrent(userId: string): Promise<Profile> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data as Profile;
  },
};
