-- The repository's original enum contains broad areas, while the deployed
-- database already uses text. Both paths converge on exact course names.
drop view if exists public.student_profiles;

alter table public.profiles
  alter column course type text using course::text;

alter table public.profiles
  alter column shift type text using shift::text;

alter table public.profiles
  add column modality text not null default 'Presencial'
    check (modality in ('Presencial', 'EAD')),
  add column study_subjects text[] not null default '{}'
    check (cardinality(study_subjects) <= 8);

-- Direct table access is limited to the owner. The directory view below
-- exposes only profile data and reveals contact details after mutual consent.
drop policy if exists "Perfis são visíveis para todos os usuários autenticados" on public.profiles;
drop policy if exists "Perfis são visíveis para todos os usuários logados" on public.profiles;
drop policy if exists "Usuários podem atualizar seus próprios perfis" on public.profiles;

create policy "Usuários leem o próprio perfil"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Usuários atualizam o próprio perfil"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check (
  (select auth.uid()) = id
  and institutional_email = (select auth.jwt() ->> 'email')
);

-- This view intentionally runs with its owner's rights so authenticated
-- students can discover one another while the underlying table stays private.
-- The user identity is checked by auth.uid() within the view itself.
create or replace view public.student_profiles
with (security_barrier = true)
as
select
  p.id,
  p.full_name,
  p.course,
  p.shift,
  p.main_goal,
  p.specific_goal,
  p.top_skills,
  p.specific_skills,
  p.partner_needs,
  p.availability_hours,
  p.consent_lgpd,
  p.feedback,
  p.created_at,
  p.updated_at,
  case
    when p.id = (select auth.uid()) or exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and ((c.sender_id = (select auth.uid()) and c.receiver_id = p.id)
          or (c.receiver_id = (select auth.uid()) and c.sender_id = p.id))
    ) then p.whatsapp
    else null
  end as whatsapp,
  case
    when p.id = (select auth.uid()) or exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and ((c.sender_id = (select auth.uid()) and c.receiver_id = p.id)
          or (c.receiver_id = (select auth.uid()) and c.sender_id = p.id))
    ) then p.institutional_email
    else null
  end as institutional_email,
  p.modality,
  p.study_subjects
from public.profiles p
where (select auth.uid()) is not null;

revoke all on public.student_profiles from anon;
grant select on public.student_profiles to authenticated;
grant select, update on public.profiles to authenticated;
