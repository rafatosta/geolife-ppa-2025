import { supabase } from '../lib/supabase';
import type { Occurrence } from '../types/domain';

export const agendaService = {
  async list(from: string, to: string): Promise<Occurrence[]> {
    const { data, error } = await supabase
      .from('occurrences')
      .select('*, rule:rules(title, description, type, start_time, end_time, deadline_time, requires_evidence), profile:profiles(name, email)')
      .gte('date', from).lte('date', to).order('date').order('deadline');
    if (error) throw error;
    return data as Occurrence[];
  },
  async get(id: string): Promise<Occurrence> {
    const { data, error } = await supabase.from('occurrences').select('*, rule:rules(title, description, type, start_time, end_time, deadline_time, requires_evidence), profile:profiles(name, email)').eq('id', id).single();
    if (error) throw error;
    return data as Occurrence;
  },
  async completeCommitment(id: string): Promise<void> {
    const { error } = await supabase.rpc('complete_own_commitment', { target_occurrence_id: id });
    if (error) throw error;
  },
};
