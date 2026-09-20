begin;

create or replace function public.admin_save_rule(target_rule_id uuid, payload jsonb, selected_weekdays text[])
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
  saved_type text;
  saved_user_id uuid;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  if coalesce(array_length(selected_weekdays, 1), 0) = 0 then raise exception 'at least one weekday is required'; end if;
  if exists(select 1 from unnest(selected_weekdays) day where day not in ('SEG','TER','QUA','QUI','SEX','SAB','DOM')) then
    raise exception 'invalid weekday';
  end if;

  if target_rule_id is null then
    saved_type := payload ->> 'type';
    saved_user_id := (payload ->> 'user_id')::uuid;
    insert into public.rules (
      user_id, type, title, description, start_date, start_time, end_time,
      repeat_every_weeks, end_date, max_occurrences, penalty_value,
      deadline_time, requires_evidence, requires_admin_approval
    ) values (
      saved_user_id,
      saved_type,
      trim(payload ->> 'title'),
      nullif(trim(payload ->> 'description'), ''),
      (payload ->> 'start_date')::date,
      nullif(payload ->> 'start_time', '')::time,
      case when saved_type = 'commitment' then nullif(payload ->> 'end_time', '')::time else null end,
      (payload ->> 'repeat_every_weeks')::integer,
      nullif(payload ->> 'end_date', '')::date,
      nullif(payload ->> 'max_occurrences', '')::integer,
      (payload ->> 'penalty_value')::numeric,
      case when saved_type = 'activity' then nullif(payload ->> 'deadline_time', '')::time else null end,
      case when saved_type = 'activity' then coalesce((payload ->> 'requires_evidence')::boolean, false) else false end,
      case when saved_type = 'activity' then coalesce((payload ->> 'requires_admin_approval')::boolean, false) else false end
    ) returning id into saved_id;
  else
    select id, type, user_id into saved_id, saved_type, saved_user_id
    from public.rules where id = target_rule_id;
    if saved_id is null then raise exception 'rule not found'; end if;

    update public.rules set
      title = trim(payload ->> 'title'),
      description = nullif(trim(payload ->> 'description'), ''),
      start_date = (payload ->> 'start_date')::date,
      start_time = nullif(payload ->> 'start_time', '')::time,
      end_time = case when saved_type = 'commitment' then nullif(payload ->> 'end_time', '')::time else null end,
      repeat_every_weeks = (payload ->> 'repeat_every_weeks')::integer,
      end_date = nullif(payload ->> 'end_date', '')::date,
      max_occurrences = nullif(payload ->> 'max_occurrences', '')::integer,
      penalty_value = (payload ->> 'penalty_value')::numeric,
      deadline_time = case when saved_type = 'activity' then nullif(payload ->> 'deadline_time', '')::time else null end,
      requires_evidence = case when saved_type = 'activity' then coalesce((payload ->> 'requires_evidence')::boolean, false) else false end,
      requires_admin_approval = case when saved_type = 'activity' then coalesce((payload ->> 'requires_admin_approval')::boolean, false) else false end
    where id = saved_id;

    delete from public.occurrences
    where rule_id = saved_id and date >= current_date and status = 'pending';
    delete from public.rule_weekdays where rule_id = saved_id;
  end if;

  insert into public.rule_weekdays(rule_id, weekday)
  select saved_id, day from unnest(selected_weekdays) day;
  perform public.generate_rule_occurrences(saved_id);
  return saved_id;
end;
$$;

revoke all on function public.admin_save_rule(uuid, jsonb, text[]) from public;
grant execute on function public.admin_save_rule(uuid, jsonb, text[]) to authenticated;

create or replace function public.admin_set_rule_active(target_rule_id uuid, new_active boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  update public.rules set active = new_active where id = target_rule_id;
  if not found then raise exception 'rule not found'; end if;
  if new_active then
    perform public.generate_rule_occurrences(target_rule_id);
  else
    delete from public.occurrences
    where rule_id = target_rule_id and date >= current_date and status = 'pending';
  end if;
end;
$$;

revoke all on function public.admin_set_rule_active(uuid, boolean) from public;
grant execute on function public.admin_set_rule_active(uuid, boolean) to authenticated;

create or replace function public.admin_delete_reward_period(target_period_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  if exists(select 1 from public.ledger where reward_period_id = target_period_id) then
    raise exception 'reward period has ledger entries and cannot be deleted';
  end if;
  delete from public.reward_periods where id = target_period_id;
  if not found then raise exception 'reward period not found'; end if;
end;
$$;

revoke all on function public.admin_delete_reward_period(uuid) from public;
grant execute on function public.admin_delete_reward_period(uuid) to authenticated;

create or replace function public.admin_set_occurrence_status(target_occurrence_id uuid, new_status text, reason text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  item public.occurrences;
  item_type text;
  period_id uuid;
begin
  if not public.is_admin() then raise exception 'not authorized' using errcode = '42501'; end if;
  select * into item from public.occurrences where id = target_occurrence_id;
  if item is null then raise exception 'occurrence not found'; end if;
  select type into item_type from public.rules where id = item.rule_id;
  if item.status <> 'pending' then raise exception 'only pending occurrences can be changed'; end if;
  if new_status not in ('completed', 'missed', 'justified') then raise exception 'invalid occurrence status'; end if;
  if item_type = 'activity' and new_status <> 'missed' then raise exception 'invalid activity status'; end if;

  if new_status = 'missed' and item.penalty_value > 0 then
    select id into period_id from public.reward_periods
    where user_id = item.user_id and item.date between start_date and end_date
    order by start_date desc limit 1;
    if period_id is null then raise exception 'reward period not found'; end if;
    insert into public.ledger(reward_period_id, user_id, occurrence_id, value, reason)
    values (period_id, item.user_id, item.id, item.penalty_value, coalesce(nullif(left(trim(reason), 200), ''), 'Ocorrência não realizada'));
  end if;

  update public.occurrences set status = new_status where id = item.id;
end;
$$;

revoke all on function public.admin_set_occurrence_status(uuid, text, text) from public;
grant execute on function public.admin_set_occurrence_status(uuid, text, text) to authenticated;

create or replace function public.apply_occurrence_penalty(target_occurrence_id uuid, reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.admin_set_occurrence_status(target_occurrence_id, 'missed', reason);
end;
$$;

create policy photos_delete_own_draft on public.submission_photos
for delete to authenticated using (
  exists(
    select 1 from public.submissions submission
    where submission.id = submission_id
      and submission.user_id = auth.uid()
      and submission.status in ('draft', 'rejected')
  ) and public.is_active_user()
);

commit;
