-- Progresso das fases. Rode no SQL Editor do Supabase.

create table if not exists public.puzzle_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  puzzle_id integer not null,
  best_time_ms integer not null check (best_time_ms >= 0),
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, puzzle_id)
);

create index if not exists puzzle_progress_user_id_idx
  on public.puzzle_progress (user_id);

alter table public.puzzle_progress enable row level security;

create policy "puzzle_progress_select_own"
  on public.puzzle_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "puzzle_progress_insert_own"
  on public.puzzle_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "puzzle_progress_update_own"
  on public.puzzle_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists puzzle_progress_set_updated_at on public.puzzle_progress;
create trigger puzzle_progress_set_updated_at
  before update on public.puzzle_progress
  for each row
  execute function public.set_updated_at();

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  hide_tutorial boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
drop policy if exists "user_preferences_insert_own" on public.user_preferences;
drop policy if exists "user_preferences_update_own" on public.user_preferences;

create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row
  execute function public.set_updated_at();

-- Direito de remover anúncios. O app só lê. Quem grava é a função verify-purchase.
create table if not exists public.user_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ads_removed boolean not null default false,
  product_id text,
  purchase_token text,
  order_id text,
  platform text not null default 'android',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_entitlements_purchase_token_idx
  on public.user_entitlements (purchase_token);

alter table public.user_entitlements enable row level security;

drop policy if exists "user_entitlements_select_own" on public.user_entitlements;

create policy "user_entitlements_select_own"
  on public.user_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists user_entitlements_set_updated_at on public.user_entitlements;
create trigger user_entitlements_set_updated_at
  before update on public.user_entitlements
  for each row
  execute function public.set_updated_at();

-- Nickname público do ranking. O e-mail continua só em auth.users.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_nickname_format check (
    char_length(nickname) between 3 and 16
    and nickname ~ '^[[:alnum:]_]{3,16}$'
  )
);

create unique index if not exists profiles_nickname_lower_idx
  on public.profiles (lower(nickname));

create index if not exists puzzle_progress_puzzle_time_idx
  on public.puzzle_progress (puzzle_id, best_time_ms);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Se o cadastro já mandou o nickname nos metadados, grava o perfil
-- mesmo quando a sessão só nasce depois da confirmação do e-mail.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  nick text := nullif(btrim(coalesce(new.raw_user_meta_data->>'nickname', '')), '');
begin
  if nick is null then
    return new;
  end if;
  begin
    insert into public.profiles (user_id, nickname)
    values (new.id, nick)
    on conflict (user_id) do nothing;
  exception
    when unique_violation or check_violation then
      null;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- security definer: o ranking lê tempos de todo mundo, mas só devolve nickname.
create or replace function public.leaderboard_players()
returns table (
  nickname text,
  completed_count integer,
  total_best_ms bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.nickname,
    count(pp.puzzle_id)::integer,
    coalesce(sum(pp.best_time_ms), 0)::bigint
  from public.profiles p
  left join public.puzzle_progress pp on pp.user_id = p.user_id
  group by p.user_id, p.nickname
  order by count(pp.puzzle_id) desc, coalesce(sum(pp.best_time_ms), 0) asc, lower(p.nickname) asc
  limit 100;
$$;

create or replace function public.leaderboard_phase_times(phase_id integer)
returns table (
  nickname text,
  best_time_ms integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.nickname,
    pp.best_time_ms
  from public.puzzle_progress pp
  join public.profiles p on p.user_id = pp.user_id
  where pp.puzzle_id = phase_id
  order by pp.best_time_ms asc, lower(p.nickname) asc
  limit 50;
$$;

revoke all on function public.leaderboard_players() from public;
revoke all on function public.leaderboard_phase_times(integer) from public;
grant execute on function public.leaderboard_players() to anon, authenticated;
grant execute on function public.leaderboard_phase_times(integer) to anon, authenticated;
