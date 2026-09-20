export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'active' | 'rejected' | 'blocked';
export type RuleType = 'commitment' | 'activity';
export type CommitmentStatus = 'pending' | 'completed' | 'missed' | 'justified';
export type ActivityStatus =
  | 'pending'
  | 'draft'
  | 'submitted'
  | 'awaiting_confirmation'
  | 'approved'
  | 'rejected'
  | 'missed';
export type OccurrenceStatus = CommitmentStatus | ActivityStatus;
export type Weekday = 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SAB' | 'DOM';

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export interface Rule {
  id: string;
  user_id: string;
  type: RuleType;
  title: string;
  description: string | null;
  start_date: string;
  start_time: string | null;
  end_time: string | null;
  repeat_every_weeks: number;
  end_date: string | null;
  max_occurrences: number | null;
  penalty_value: number;
  deadline_time: string | null;
  requires_evidence: boolean;
  requires_admin_approval: boolean;
  active: boolean;
  weekdays?: Weekday[];
  profile?: Pick<Profile, 'name' | 'email'>;
}

export interface RuleInput {
  user_id: string;
  type: RuleType;
  title: string;
  description: string;
  start_date: string;
  start_time: string | null;
  end_time: string | null;
  repeat_every_weeks: number;
  end_date: string | null;
  max_occurrences: number | null;
  penalty_value: number;
  deadline_time: string | null;
  requires_evidence: boolean;
  requires_admin_approval: boolean;
  weekdays: Weekday[];
}

export interface RewardPeriod {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  maximum_value: number;
  created_at: string;
  profile?: Pick<Profile, 'name' | 'email'>;
}

export interface Occurrence {
  id: string;
  rule_id: string;
  user_id: string;
  date: string;
  deadline: string | null;
  status: OccurrenceStatus;
  penalty_value: number;
  rule: Pick<Rule, 'title' | 'description' | 'type' | 'start_time' | 'end_time' | 'deadline_time' | 'requires_evidence'>;
  profile?: Pick<Profile, 'name' | 'email'>;
}

export interface RewardSummary {
  period_id: string | null;
  maximum_value: number;
  discount_total: number;
  current_value: number;
  percentage: number;
}

export interface LedgerEntry {
  id: string;
  occurrence_id: string | null;
  value: number;
  reason: string;
  created_at: string;
}

export interface SubmissionPhoto {
  id: string;
  storage_path: string;
  signed_url?: string;
}

export interface Submission {
  id: string;
  occurrence_id: string;
  user_id: string;
  status: ActivityStatus;
  note: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  review_comment: string | null;
  photos: SubmissionPhoto[];
  occurrence?: Occurrence;
  profile?: Pick<Profile, 'name' | 'avatar_url'>;
}
