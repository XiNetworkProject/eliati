-- =====================================================
-- TABLE ADMIN_CREDENTIALS
-- Authentification mail + mot de passe + code confidentiel
-- =====================================================

create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  secret_code_hash text,
  secret_code_set_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists idx_admin_credentials_email on public.admin_credentials(email);

alter table public.admin_credentials enable row level security;

drop policy if exists "Enable all for admin_credentials" on public.admin_credentials;
create policy "Enable all for admin_credentials"
on public.admin_credentials
for all
using (true)
with check (true);

comment on table public.admin_credentials is 'Identifiants chiffrés pour l’accès administrateur EliAti.';
