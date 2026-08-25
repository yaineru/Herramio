-- Herramio SaaS foundation: profiles, plans, subscriptions, entitlements
-- (derived from plans), teams/workspaces, invitations, favorites, usage
-- tracking, and webhook idempotency.
--
-- Design notes:
-- * "entitlements" are not a separate table — they're columns on `plans`
--   (ads_enabled, higher_limits, premium_tools, teams_enabled,
--   max_team_members). A 3-plan system doesn't need a many-to-many
--   features table; the plan row IS the entitlement set. The app-code
--   separation the product spec asks for ("what plan" vs "what can they
--   do") lives in TypeScript (getEntitlements(planId)), not in extra
--   tables.
-- * A subscription belongs to exactly one of {user, workspace} — a CHECK
--   constraint enforces that, so personal Pro and Team billing share one
--   table instead of two near-identical ones.
-- * usage is tracked per (owner, tool, day) as a running counter, not one
--   row per action — cheap to write, cheap to query, no unbounded growth.

-- ============================================================
-- extensions
-- ============================================================
create extension if not exists moddatetime with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- ============================================================
-- profiles
-- ============================================================
-- One row per auth.users row, created automatically by the trigger below.
-- Holds only what the app needs beyond what Supabase Auth already stores
-- (email, password hash, etc. stay in auth.users, which we never touch
-- directly from application code).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  -- Which tool the user was on when they signed up, for "which tool drives
  -- registrations" analytics. Free text matching a registry tool id;
  -- intentionally not a foreign key since the tool registry lives in code,
  -- not in the database.
  signup_source_tool text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user, auto-created on signup.';

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

-- Auto-create a profile row whenever a new auth user is created.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, signup_source_tool)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'signup_source_tool'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policies for regular users: rows are created by the
-- trigger (security definer) and removed via auth.users cascade — a user
-- should never be able to create or delete a profiles row directly.

-- ============================================================
-- plans
-- ============================================================
-- Single source of truth for pricing + entitlements. Change a price or
-- flip a feature flag here; no code deploy required for that part.
-- NOTE: this table's shape below is what was actually applied to the live
-- project (kept as-is deliberately — never edit an already-applied
-- migration). It has since been reshaped by 0003_pricing_and_entitlements_rework.sql
-- (multi-interval pricing, jsonb metadata, per-interval provider price
-- ids) — read that file for the current shape; this one is history.
create table public.plans (
  id text primary key, -- 'free' | 'pro' | 'team'
  name text not null,
  description text not null default '',
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'usd',
  billing_interval text not null default 'month' check (billing_interval in ('month', 'year')),
  -- Entitlements (see module comment above for why these live here).
  ads_enabled boolean not null default true,
  higher_limits boolean not null default false,
  premium_tools boolean not null default false,
  teams_enabled boolean not null default false,
  max_team_members integer, -- null = not applicable (free/pro)
  -- Payment provider linkage — kept separate from the internal plan id so
  -- prices/products can change on the provider side without touching the
  -- app's plan identifiers or any code that references plan_id.
  provider text, -- 'stripe', null for the free plan (no provider object)
  provider_product_id text,
  provider_price_id text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is 'Central pricing + entitlements config. Editable without a code deploy.';

create trigger set_plans_updated_at
  before update on public.plans
  for each row execute function extensions.moddatetime(updated_at);

alter table public.plans enable row level security;

-- Plans are public reference data (the pricing page needs them for
-- anonymous visitors) — readable by anyone, writable by no one through the
-- API (changes go through the Supabase dashboard/SQL, deliberately not
-- exposed as a user-facing mutation).
create policy "plans_select_all"
  on public.plans for select
  using (true);

-- ============================================================
-- workspaces (teams)
-- ============================================================
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index workspaces_owner_id_idx on public.workspaces (owner_id);

create trigger set_workspaces_updated_at
  before update on public.workspaces
  for each row execute function extensions.moddatetime(updated_at);

-- ============================================================
-- workspace_members
-- ============================================================
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

-- Helper used by RLS policies below: is the current user a member (any
-- role) / the owner of a given workspace? SECURITY DEFINER + a fixed
-- search_path so it can read workspace_members regardless of the caller's
-- own RLS visibility into that table (avoids recursive-policy issues).
create function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid()
  );
$$;

create function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id and user_id = auth.uid() and role = 'owner'
  );
$$;

alter table public.workspaces enable row level security;

create policy "workspaces_select_member"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "workspaces_update_owner"
  on public.workspaces for update
  using (public.is_workspace_owner(id))
  with check (public.is_workspace_owner(id));

-- Workspace creation and member/invitation management go through server
-- actions using the service-role client (createAdminClient), not direct
-- client inserts — creating a workspace atomically creates its owner
-- membership row, which a single RLS-gated insert can't express cleanly.
-- No insert policy here is intentional: the anon/authenticated role simply
-- cannot create workspace rows directly.

alter table public.workspace_members enable row level security;

create policy "workspace_members_select_member"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "workspace_members_delete_owner_or_self"
  on public.workspace_members for delete
  using (public.is_workspace_owner(workspace_id) or user_id = auth.uid());

-- ============================================================
-- subscriptions
-- ============================================================
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  -- Exactly one of user_id / workspace_id is set (checked below): a
  -- personal Pro subscription belongs to a user, a Team subscription
  -- belongs to a workspace.
  user_id uuid references auth.users (id) on delete cascade,
  workspace_id uuid references public.workspaces (id) on delete cascade,
  plan_id text not null references public.plans (id),
  status text not null default 'incomplete'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid')),
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text unique,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_owner_check check (
    (user_id is not null and workspace_id is null) or
    (user_id is null and workspace_id is not null)
  )
);

create unique index subscriptions_user_id_active_idx
  on public.subscriptions (user_id)
  where user_id is not null and status in ('trialing', 'active', 'past_due');

create unique index subscriptions_workspace_id_active_idx
  on public.subscriptions (workspace_id)
  where workspace_id is not null and status in ('trialing', 'active', 'past_due');

create index subscriptions_provider_subscription_id_idx on public.subscriptions (provider_subscription_id);

create trigger set_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function extensions.moddatetime(updated_at);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (
    user_id = auth.uid()
    or (workspace_id is not null and public.is_workspace_member(workspace_id))
  );

-- No insert/update/delete policy for the authenticated role: billing state
-- is only ever written by the webhook handler through the service-role
-- client, after the payment provider confirms the event. This is what
-- makes "a user can't set plan=pro from DevTools" true at the database
-- level, not just in the UI.

-- ============================================================
-- tool_usage
-- ============================================================
-- A running per-day counter, not one row per action. owner_type/owner_id
-- is a lightweight polymorphic reference (user or workspace) since a
-- proper FK can't span two tables — validity of owner_id is enforced by
-- application code (server actions), which always writes it from a value
-- it already looked up (the current user's id or their workspace's id).
create table public.tool_usage (
  id bigint generated always as identity primary key,
  owner_type text not null check (owner_type in ('user', 'workspace')),
  owner_id uuid not null,
  tool_id text not null,
  usage_date date not null default current_date,
  count integer not null default 0 check (count >= 0),
  updated_at timestamptz not null default now(),
  unique (owner_type, owner_id, tool_id, usage_date)
);

create index tool_usage_owner_idx on public.tool_usage (owner_type, owner_id, usage_date);
create index tool_usage_tool_id_idx on public.tool_usage (tool_id, usage_date);

alter table public.tool_usage enable row level security;

create policy "tool_usage_select_own"
  on public.tool_usage for select
  using (
    (owner_type = 'user' and owner_id = auth.uid())
    or (owner_type = 'workspace' and public.is_workspace_member(owner_id))
  );

-- Writes go through a SECURITY DEFINER function (below), not direct
-- inserts, so the increment is atomic (no read-then-write race between
-- two tabs of the same user) and so anonymous/free usage that doesn't map
-- to a signed-in owner never gets recorded at all.
create function public.increment_tool_usage(p_owner_type text, p_owner_id uuid, p_tool_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_owner_type = 'user' and p_owner_id <> auth.uid() then
    raise exception 'not authorized';
  end if;
  if p_owner_type = 'workspace' and not public.is_workspace_member(p_owner_id) then
    raise exception 'not authorized';
  end if;

  insert into public.tool_usage (owner_type, owner_id, tool_id, usage_date, count)
  values (p_owner_type, p_owner_id, p_tool_id, current_date, 1)
  on conflict (owner_type, owner_id, tool_id, usage_date)
  do update set count = tool_usage.count + 1, updated_at = now()
  returning count into v_count;

  return v_count;
end;
$$;

-- ============================================================
-- favorites
-- ============================================================
-- Cross-device favorites for signed-in users. The anonymous/localStorage
-- favorites system (src/lib/favorites.ts) is untouched and keeps working
-- for logged-out visitors — this table only ever gets read/written for an
-- authenticated user, as an added benefit of having an account.
create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  tool_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, tool_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own"
  on public.favorites for select
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites for delete
  using (user_id = auth.uid());

-- ============================================================
-- workspace_invitations
-- ============================================================
create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner', 'member')),
  -- Random, unguessable token — never the invitation's primary key, so the
  -- acceptance URL doesn't leak workspace_id/email through the id itself.
  token text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  invited_by uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now()
);

create index workspace_invitations_workspace_id_idx on public.workspace_invitations (workspace_id);
create index workspace_invitations_token_idx on public.workspace_invitations (token) where status = 'pending';

alter table public.workspace_invitations enable row level security;

create policy "workspace_invitations_select_owner"
  on public.workspace_invitations for select
  using (public.is_workspace_owner(workspace_id));

-- Creating/accepting/revoking invitations goes through server actions
-- (service-role client) so token generation, expiry checks, and the
-- "insert membership + mark invitation accepted" pair happen atomically —
-- no direct insert/update policy is exposed to the client.

-- ============================================================
-- webhook_events
-- ============================================================
-- Idempotency guard for payment-provider webhooks. The handler tries to
-- insert the provider's event id first; a conflict means this exact event
-- was already processed, so it returns 200 without doing anything twice.
create table public.webhook_events (
  provider text not null,
  event_id text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  primary key (provider, event_id)
);

comment on table public.webhook_events is 'Idempotency ledger for payment webhooks — insert-before-process.';

-- No RLS needed: this table is never queried through the anon/authenticated
-- API, only written by the webhook route via the service-role client.
alter table public.webhook_events enable row level security;
-- (RLS enabled with zero policies = default-deny for anon/authenticated,
-- which is exactly what we want; the service-role key bypasses RLS.)
