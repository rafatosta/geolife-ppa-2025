-- Dados de desenvolvimento sem credenciais ou usuários fictícios em auth.users.
-- O bloco usa os dois primeiros usuários já autenticados no projeto local:
-- o primeiro como administrador e o segundo como usuário ativo.
do $$
declare admin_id uuid; user_id uuid; period_id uuid; aula_id uuid; atividade_id uuid;
begin
  select id into admin_id from auth.users order by created_at limit 1;
  select id into user_id from auth.users where id <> admin_id order by created_at limit 1;
  if admin_id is null then raise notice 'Seed ignorado: autentique ao menos um usuário primeiro.'; return; end if;

  update public.profiles set role = 'admin', status = 'active', approved_at = now(), approved_by = id where id = admin_id;
  if user_id is null then raise notice 'Admin ativado; autentique um segundo usuário para dados de exemplo.'; return; end if;
  update public.profiles set status = 'active', approved_at = now(), approved_by = admin_id where id = user_id;

  insert into public.reward_periods(user_id, start_date, end_date, maximum_value)
  values (user_id, date_trunc('month', current_date)::date, (date_trunc('month', current_date) + interval '1 month - 1 day')::date, 300)
  on conflict (user_id, start_date, end_date) do update set maximum_value = excluded.maximum_value returning id into period_id;

  insert into public.rules(user_id, type, title, start_date, start_time, end_time, penalty_value)
  values (user_id, 'commitment', 'Aula', current_date, '07:30', '12:00', 10) returning id into aula_id;
  insert into public.rule_weekdays(rule_id, weekday) values (aula_id, 'SEG'), (aula_id, 'TER'), (aula_id, 'QUA'), (aula_id, 'QUI'), (aula_id, 'SEX');
  insert into public.occurrences(rule_id, user_id, date, status, penalty_value) values (aula_id, user_id, current_date, 'completed', 10);

  insert into public.rules(user_id, type, title, start_date, deadline_time, penalty_value, requires_evidence, requires_admin_approval)
  values (user_id, 'activity', 'Atividade de Português', current_date, '21:00', 5, true, true) returning id into atividade_id;
  insert into public.rule_weekdays(rule_id, weekday) values (atividade_id, case extract(isodow from current_date)::int when 1 then 'SEG' when 2 then 'TER' when 3 then 'QUA' when 4 then 'QUI' when 5 then 'SEX' when 6 then 'SAB' else 'DOM' end);
  insert into public.occurrences(rule_id, user_id, date, deadline, status, penalty_value)
  values (atividade_id, user_id, current_date, (current_date + time '21:00') at time zone 'America/Bahia', 'pending', 5);
end $$;
