import { supabase } from '../lib/supabase';
import type { LedgerEntry, RewardSummary } from '../types/domain';

export const rewardService = {
  async summary(): Promise<RewardSummary> {
    const { data, error } = await supabase.rpc('current_reward_summary');
    if (error) throw error;
    return data as RewardSummary;
  },
  async history(): Promise<LedgerEntry[]> {
    const { data, error } = await supabase.from('ledger').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as LedgerEntry[];
  },
};
