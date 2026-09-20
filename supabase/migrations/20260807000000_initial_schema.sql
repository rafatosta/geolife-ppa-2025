begin;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected', 'blocked')),
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id) on delete set null
);

create table public.reward_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  maximum_value numeric(12,2) not null check (maximum_value >= 0),
  created_at timestamptz not null default now(),
  constraint reward_period_dates_valid check (end_date >= start_date),
  constraint reward_periods_no_duplicate unique (user_id, start_date, end_date)
);

create table public.rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('commitment', 'activity')),
  title text not null check (char_length(title) between 1 and 120),
  description text,
  start_date date not null,
  start_time time,
  end_time time,
  repeat_every_weeks integer not null default 1 check (repeat_every_weeks > 0),
  end_date date,
  max_occurrences integer check (max_occurrences > 0),
  penalty_value numeric(12,2) not null default 0 check (penalty_value >= 0),
  deadline_time time,
  requires_evidence boolean not null default false,
  requires_admin_approval boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rule_end_date_valid check (end_date is null or end_date >= start_date),
  constraint rule_times_valid check (end_time is null or start_time is null or end_time > start_time),
  constraint activity_fields_valid check (
    type = 'activity' or (deadline_time is null and requires_evidence = false and requires_admin_approval = false)
  )
);

create table public.rule_weekdays (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.rules(id) on delete cascade,
  weekday text not null check (weekday in ('SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM')),
  unique (rule_id, weekday)
);

create table public.occurrences (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.rules(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  deadline timestamptz,
  status text not null default 'pending' check (status in ('pending', 'completed', 'missed', 'justified', 'draft', 'submitted', 'awaiting_confirmation', 'approved', 'rejected')),
  penalty_value numeric(12,2) not null default 0 check (penalty_value >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rule_id, date)
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  occurrence_id uuid not null unique references public.occurrences(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'awaiting_confirmation', 'approved', 'rejected')),
  note text check (char_length(note) <= 300),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_comment text check (char_length(review_comment) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submission_photos (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create table public.ledger (
  id uuid primary key default gen_random_uuid(),
  reward_period_id uuid not null references public.reward_periods(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurrence_id uuid references public.occurrences(id) on delete restrict,
  value numeric(12,2) not null check (value > 0),
  reason text not null check (char_length(reason) between 1 and 200),
  created_at timestamptz not null default now(),
  unique (reward_period_id, occurrence_id)
);

create index occurrences_user_date_idx on public.occurrences(user_id, date);
create index submissions_status_idx on public.submissions(status, submitted_at);
create index ledger_user_created_idx on public.ledger(user_id, created_at desc);
create index profiles_status_idx on public.profiles(status, created_at);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger rules_set_updated_at before update on public.rules for each row execute function public.set_updated_at();
create trigger occurrences_set_updated_at before update on public.occurrences for each row execute function public.set_updated_at();
create trigger submissions_set_updated_at before update on public.submissions for each row execute function public.set_updated_at();

create or replace function public.validate_submission_evidence()
returns trigger language plpgsql security definer set search_path = '' as $$
declare evidence_required boolean;
begin
  if new.status = 'awaiting_confirmation' and (tg_op = 'INSERT' or old.status is distinct from new.status) then
    select r.requires_evidence into evidence_required
    from public.occurrences o join public.rules r on r.id = o.rule_id
    where o.id = new.occurrence_id and o.user_id = new.user_id and r.type = 'activity';
    if evidence_required is null then raise exception 'invalid activity occurrence'; end if;
    if evidence_required and not exists(select 1 from public.submission_photos where submission_id = new.id) then
      raise exception 'evidence is required for this activity';
    end if;
  end if;
  return new;
end;
$$;
create trigger submissions_validate_evidence before insert or update of status on public.submissions
for each row execute function public.validate_submission_evidence();

create or replace function public.sync_submission_occurrence_status()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.occurrences set status = new.status where id = new.occurrence_id;
  return new;
end;
$$;
create trigger submissions_sync_occurrence after insert or update of status on public.submissions
for each row execute function public.sync_submission_occurrence_status();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, name, avatar_url, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, 'Usuário'), '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    'user',
    'pending'
  ) on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_active_user(target_user_id uuid default auth.uid())
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = target_user_id and status = 'active');
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and status = 'active' and role = 'admin');
$$;

revoke all on function public.is_active_user(uuid) from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_active_user(uuid), public.is_admin() to authenticated;

create or replace function public.admin_set_profile_status(target_user_id uuid, new_status text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  if new_status not in ('pending', 'active', 'rejected', 'blocked') then raise exception 'invalid status'; end if;
  if target_user_id = auth.uid() and new_status <> 'active' then raise exception 'an admin cannot deactivate their own account'; end if;
  update public.profiles set
    status = new_status,
    approved_at = case when new_status = 'active' then now() else approved_at end,
    approved_by = case when new_status = 'active' then auth.uid() else approved_by end
  where id = target_user_id;
end;
$$;
revoke all on function public.admin_set_profile_status(uuid, text) from public;
grant execute on function public.admin_set_profile_status(uuid, text) to authenticated;

create or replace function public.review_submission(target_submission_id uuid, approve boolean, comment text default '')
returns void language plpgsql security definer set search_path = '' as $$
declare target_occurrence uuid;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update public.submissions set
    status = case when approve then 'approved' else 'rejected' end,
    reviewed_at = now(), reviewed_by = auth.uid(), review_comment = nullif(left(comment, 300), '')
  where id = target_submission_id and status = 'awaiting_confirmation'
  returning occurrence_id into target_occurrence;
  if target_occurrence is null then raise exception 'submission is not awaiting review'; end if;
  update public.occurrences set status = case when approve then 'approved' else 'rejected' end where id = target_occurrence;
end;
$$;
revoke all on function public.review_submission(uuid, boolean, text) from public;
grant execute on function public.review_submission(uuid, boolean, text) to authenticated;

create or replace function public.current_reward_summary()
returns jsonb language sql stable security definer set search_path = '' as $$
  with current_period as (
    select rp.id, rp.maximum_value
    from public.reward_periods rp
    where rp.user_id = auth.uid() and public.is_active_user() and current_date between rp.start_date and rp.end_date
    order by rp.start_date desc limit 1
  ), totals as (
    select cp.id, cp.maximum_value, coalesce(sum(l.value), 0)::numeric as discount_total
    from current_period cp left join public.ledger l on l.reward_period_id = cp.id
    group by cp.id, cp.maximum_value
  )
  select coalesce((select jsonb_build_object(
    'period_id', id, 'maximum_value', maximum_value, 'discount_total', discount_total,
    'current_value', greatest(maximum_value - discount_total, 0),
    'percentage', case when maximum_value = 0 then 0 else round(greatest(maximum_value - discount_total, 0) / maximum_value * 100) end
  ) from totals), jsonb_build_object('period_id', null, 'maximum_value', 0, 'discount_total', 0, 'current_value', 0, 'percentage', 0));
$$;
revoke all on function public.current_reward_summary() from public;
grant execute on function public.current_reward_summary() to authenticated;

create or replace function public.apply_occurrence_penalty(target_occurrence_id uuid, reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare item public.occurrences; period_id uuid;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  select * into item from public.occurrences where id = target_occurrence_id;
  if item is null then raise exception 'occurrence not found'; end if;
  select id into period_id from public.reward_periods where user_id = item.user_id and item.date between start_date and end_date order by start_date desc limit 1;
  if period_id is null then raise exception 'reward period not found'; end if;
  update public.occurrences set status = 'missed' where id = target_occurrence_id;
  if item.penalty_value > 0 then
    insert into public.ledger(reward_period_id, user_id, occurrence_id, value, reason)
    values (period_id, item.user_id, item.id, item.penalty_value, left(reason, 200)) on conflict (reward_period_id, occurrence_id) do nothing;
  end if;
end;
$$;
revoke all on function public.apply_occurrence_penalty(uuid, text) from public;
grant execute on function public.apply_occurrence_penalty(uuid, text) to authenticated;

create or replace function public.generate_rule_occurrences(target_rule_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  item public.rules;
  candidate date;
  final_date date;
  weekday_code text;
  eligible_count integer := 0;
  inserted_count integer := 0;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  select * into item from public.rules where id = target_rule_id;
  if item is null then raise exception 'rule not found'; end if;
  final_date := least(coalesce(item.end_date, item.start_date + 365), item.start_date + 730);
  candidate := item.start_date;
  while candidate <= final_date loop
    weekday_code := (array['SEG','TER','QUA','QUI','SEX','SAB','DOM'])[extract(isodow from candidate)::integer];
    if ((candidate - item.start_date) / 7) % item.repeat_every_weeks = 0
       and exists(select 1 from public.rule_weekdays w where w.rule_id = item.id and w.weekday = weekday_code) then
      eligible_count := eligible_count + 1;
      if item.max_occurrences is not null and eligible_count > item.max_occurrences then exit; end if;
      insert into public.occurrences(rule_id, user_id, date, deadline, status, penalty_value)
      values (
        item.id, item.user_id, candidate,
        case when item.type = 'activity' and item.deadline_time is not null
          then (candidate + item.deadline_time) at time zone current_setting('TIMEZONE') else null end,
        'pending', item.penalty_value
      ) on conflict (rule_id, date) do nothing;
      if found then inserted_count := inserted_count + 1; end if;
    end if;
    candidate := candidate + 1;
  end loop;
  return inserted_count;
end;
$$;
revoke all on function public.generate_rule_occurrences(uuid) from public;
grant execute on function public.generate_rule_occurrences(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.reward_periods enable row level security;
alter table public.rules enable row level security;
alter table public.rule_weekdays enable row level security;
alter table public.occurrences enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_photos enable row level security;
alter table public.ledger enable row level security;

create policy profiles_read_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_admin_all on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy periods_read_own on public.reward_periods for select to authenticated using (user_id = auth.uid() and public.is_active_user());
create policy periods_admin_all on public.reward_periods for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy rules_read_own on public.rules for select to authenticated using (user_id = auth.uid() and public.is_active_user());
create policy rules_admin_all on public.rules for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy weekdays_read_own on public.rule_weekdays for select to authenticated using (exists(select 1 from public.rules r where r.id = rule_id and r.user_id = auth.uid()) and public.is_active_user());
create policy weekdays_admin_all on public.rule_weekdays for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy occurrences_read_own on public.occurrences for select to authenticated using (user_id = auth.uid() and public.is_active_user());
create policy occurrences_admin_all on public.occurrences for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy submissions_read_own on public.submissions for select to authenticated using (user_id = auth.uid() and public.is_active_user());
create policy submissions_insert_own on public.submissions for insert to authenticated with check (user_id = auth.uid() and public.is_active_user() and status in ('draft', 'awaiting_confirmation'));
create policy submissions_update_own on public.submissions for update to authenticated using (user_id = auth.uid() and public.is_active_user() and status in ('draft', 'rejected')) with check (user_id = auth.uid() and status in ('draft', 'awaiting_confirmation'));
create policy submissions_admin_all on public.submissions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy photos_read_own on public.submission_photos for select to authenticated using (exists(select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid()) and public.is_active_user());
create policy photos_insert_own on public.submission_photos for insert to authenticated with check (exists(select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid() and s.status in ('draft', 'awaiting_confirmation')) and public.is_active_user());
create policy photos_admin_read on public.submission_photos for select to authenticated using (public.is_admin());
create policy ledger_read_own on public.ledger for select to authenticated using (user_id = auth.uid() and public.is_active_user());
create policy ledger_admin_all on public.ledger for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('activity-evidence', 'activity-evidence', false, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy evidence_read_own on storage.objects for select to authenticated using (
  bucket_id = 'activity-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_user()
);
create policy evidence_insert_own on storage.objects for insert to authenticated with check (
  bucket_id = 'activity-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_user()
);
create policy evidence_delete_own_draft on storage.objects for delete to authenticated using (
  bucket_id = 'activity-evidence' and (storage.foldername(name))[1] = auth.uid()::text and public.is_active_user()
  and exists (
    select 1 from public.submission_photos photo
    join public.submissions submission on submission.id = photo.submission_id
    where photo.storage_path = name and submission.user_id = auth.uid() and submission.status in ('draft', 'rejected')
  )
);
create policy evidence_admin_read on storage.objects for select to authenticated using (
  bucket_id = 'activity-evidence' and public.is_admin()
);

commit;
