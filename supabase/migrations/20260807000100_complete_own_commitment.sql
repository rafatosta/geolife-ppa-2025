begin;

create or replace function public.complete_own_commitment(target_occurrence_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  completed_id uuid;
begin
  update public.occurrences as occurrence
  set status = 'completed'
  from public.rules as rule
  where occurrence.id = target_occurrence_id
    and occurrence.rule_id = rule.id
    and occurrence.user_id = auth.uid()
    and public.is_active_user()
    and rule.type = 'commitment'
    and occurrence.status = 'pending'
  returning occurrence.id into completed_id;

  if completed_id is null then
    raise exception 'pending commitment not found or not authorized' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.complete_own_commitment(uuid) from public;
grant execute on function public.complete_own_commitment(uuid) to authenticated;

commit;
