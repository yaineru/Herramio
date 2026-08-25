-- A minimal, Postgres-backed rate limiter for the auth Server Actions
-- (signup/login/password-reset) — the realistic abuse vectors for this
-- app (credential stuffing, mass fake signups, reset-email bombing).
-- Deliberately not applied to the 129 tool pages: they're 100%
-- client-side with no server cost to protect (see MONETIZATION.md), so a
-- request-count limit there would just be friction with nothing real
-- behind it. No new dependency (Redis/Upstash) — this project's traffic
-- doesn't remotely justify one yet, and Postgres already has to be up for
-- the app to function at all.

create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

-- Read pattern is always "count recent rows for one bucket" — a
-- composite index on exactly that shape.
create index rate_limit_events_bucket_created_idx on public.rate_limit_events (bucket, created_at desc);

comment on table public.rate_limit_events is
  'Sliding-window rate-limit ledger for auth Server Actions. Written only via check_and_record_rate_limit(); never queried directly by the app.';

alter table public.rate_limit_events enable row level security;
-- No policies: only the service-role client (bypasses RLS) ever touches
-- this table, via the function below. RLS enabled + zero policies =
-- default-deny for anon/authenticated, matching webhook_events.

create function public.check_and_record_rate_limit(p_bucket text, p_max_events integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.rate_limit_events
  where bucket = p_bucket
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max_events then
    return false;
  end if;

  insert into public.rate_limit_events (bucket) values (p_bucket);
  return true;
end;
$$;

comment on function public.check_and_record_rate_limit is
  'Atomically checks a sliding-window rate limit and records this attempt if allowed. Returns false when the caller should be blocked. SECURITY DEFINER so it can write despite RLS; EXECUTE is revoked from anon/authenticated below — only the service-role client calls this (auth Server Actions run server-side).';

revoke execute on function public.check_and_record_rate_limit(text, integer, integer) from public, anon, authenticated;
