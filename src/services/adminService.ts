import { supabase } from '../lib/supabase';
import type { OccurrenceStatus, Profile, RewardPeriod, Rule, RuleInput, Submission, UserStatus, Weekday } from '../types/domain';
import { storageService } from './storageService';

export const adminService = {
  async listRules(): Promise<Rule[]> {
    const { data, error } = await supabase.from('rules').select('*, rule_weekdays(weekday), profile:profiles(name, email)').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as (Rule & { rule_weekdays: { weekday: Weekday }[] })[]).map(({ rule_weekdays, ...rule }) => ({ ...rule, weekdays: rule_weekdays.map((item) => item.weekday) }));
  },
  async saveRule(input: RuleInput, ruleId: string | null = null) {
    const { weekdays, ...payload } = input;
    const { data, error } = await supabase.rpc('admin_save_rule', {
      target_rule_id: ruleId,
      payload,
      selected_weekdays: weekdays,
    });
    if (error) throw error;
    return data as string;
  },
  async setRuleActive(ruleId: string, active: boolean) {
    const { error } = await supabase.rpc('admin_set_rule_active', { target_rule_id: ruleId, new_active: active });
    if (error) throw error;
  },
  async listRewardPeriods(): Promise<RewardPeriod[]> {
    const { data, error } = await supabase.from('reward_periods').select('*, profile:profiles(name, email)').order('start_date', { ascending: false });
    if (error) throw error;
    return data as RewardPeriod[];
  },
  async saveRewardPeriod(input: { user_id: string; start_date: string; end_date: string; maximum_value: number }, periodId: string | null = null) {
    const query = periodId
      ? supabase.from('reward_periods').update(input).eq('id', periodId)
      : supabase.from('reward_periods').insert(input);
    const { error } = await query;
    if (error) throw error;
  },
  async deleteRewardPeriod(periodId: string) {
    const { error } = await supabase.rpc('admin_delete_reward_period', { target_period_id: periodId });
    if (error) throw error;
  },
  async listUsers(status?: UserStatus): Promise<Profile[]> {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    return data as Profile[];
  },
  async setUserStatus(userId: string, status: UserStatus) {
    const { error } = await supabase.rpc('admin_set_profile_status', { target_user_id: userId, new_status: status });
    if (error) throw error;
  },
  async pendingSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase.from('submissions').select('*, photos:submission_photos(*), occurrence:occurrences(*, rule:rules(*)), profile:profiles!submissions_user_id_fkey(name, avatar_url)').eq('status', 'awaiting_confirmation').order('submitted_at');
    if (error) throw error;
    const submissions = data as Submission[];
    return Promise.all(submissions.map(async (submission) => ({
      ...submission,
      photos: await Promise.all(submission.photos.map(async (photo) => ({
        ...photo,
        signed_url: await storageService.signedUrl(photo.storage_path),
      }))),
    })));
  },
  async reviewSubmission(submissionId: string, approved: boolean, comment = '') {
    const { error } = await supabase.rpc('review_submission', { target_submission_id: submissionId, approve: approved, comment });
    if (error) throw error;
  },
  async setOccurrenceStatus(occurrenceId: string, status: Extract<OccurrenceStatus, 'completed' | 'missed' | 'justified'>, reason = '') {
    const { error } = await supabase.rpc('admin_set_occurrence_status', {
      target_occurrence_id: occurrenceId,
      new_status: status,
      reason,
    });
    if (error) throw error;
  },
};
