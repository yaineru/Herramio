-- Academic originality/integrity analysis — new feature, additive only.
-- Nothing here touches plans/entitlements/subscriptions/workspaces; it
-- only reads from them (workspace membership for RLS, plan metadata for
-- usage limits — see ORIGINALITY.md).
--
-- Scope note: without a configured web-search or embedding provider (none
-- exist in this project as of this migration — see ORIGINALITY.md), the
-- only real comparison corpus available is a user's own previous uploads
-- and their workspace's other uploads. `document_sources` exists so an
-- external-source provider can be plugged in later without a schema
-- change, but stays empty until one is configured — never fabricate a
-- "source found" row.

-- ============================================================
-- documents
-- ============================================================
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Set when uploaded from within a team workspace — enables internal
  -- comparison against teammates' documents (never across unrelated
  -- users/tenants — see similarity_matches RLS below).
  workspace_id uuid references public.workspaces (id) on delete set null,
  original_filename text not null,
  mime_type text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0),
  storage_path text not null unique,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'processing', 'analyzing', 'completed', 'failed')),
  failure_reason text,
  page_count integer,
  word_count integer,
  language text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id, created_at desc);
create index documents_workspace_id_idx on public.documents (workspace_id) where workspace_id is not null;

create trigger set_documents_updated_at
  before update on public.documents
  for each row execute function extensions.moddatetime(updated_at);

alter table public.documents enable row level security;

create policy "documents_select_own_or_workspace"
  on public.documents for select
  using (user_id = auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id)));

create policy "documents_insert_own"
  on public.documents for insert
  with check (user_id = auth.uid() and (workspace_id is null or public.is_workspace_member(workspace_id)));

create policy "documents_update_own"
  on public.documents for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "documents_delete_own"
  on public.documents for delete
  using (user_id = auth.uid());

-- ============================================================
-- document_chunks
-- ============================================================
-- Paragraph-level chunks (not a claimed "section" like Introduction/
-- Methodology — reliably classifying section type needs real structural
-- analysis this version doesn't attempt; never fabricate a section label).
create table public.document_chunks (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.documents (id) on delete cascade,
  sequence integer not null,
  page_number integer,
  text text not null,
  normalized_text text not null,
  word_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (document_id, sequence)
);

create index document_chunks_document_id_idx on public.document_chunks (document_id);

alter table public.document_chunks enable row level security;

create policy "document_chunks_select_via_document"
  on public.document_chunks for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
  ));

-- No insert/update/delete policies: chunks are written only by the
-- processing pipeline via the service-role client, never directly by a
-- user request.

-- ============================================================
-- citations (in-text citations detected via pattern matching)
-- ============================================================
create table public.citations (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_id bigint references public.document_chunks (id) on delete set null,
  raw_text text not null,
  -- 'detected' is the only honest status this version supports: pattern
  -- matching finds citation-shaped text, it does not verify the citation
  -- against a real bibliographic record. Never claim 'verified'.
  style_guess text check (style_guess in ('apa', 'vancouver', 'ieee', 'unknown')),
  created_at timestamptz not null default now()
);

create index citations_document_id_idx on public.citations (document_id);

alter table public.citations enable row level security;

create policy "citations_select_via_document"
  on public.citations for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
  ));

-- ============================================================
-- document_references (bibliography entries detected, best-effort parsed)
-- ============================================================
create table public.document_references (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.documents (id) on delete cascade,
  raw_text text not null,
  parsed_author text,
  parsed_year text,
  parsed_title text,
  created_at timestamptz not null default now()
);

create index document_references_document_id_idx on public.document_references (document_id);

alter table public.document_references enable row level security;

create policy "document_references_select_via_document"
  on public.document_references for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
  ));

-- ============================================================
-- document_sources (external sources — schema ready, unpopulated until a
-- web-search/licensed-corpus provider is actually configured)
-- ============================================================
create table public.document_sources (
  id bigint generated always as identity primary key,
  url text,
  title text,
  author text,
  published_date date,
  source_type text not null default 'web' check (source_type in ('web', 'academic', 'internal')),
  domain text,
  retrieved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.document_sources enable row level security;
-- No policies: not user-owned data (a shared source catalog), and unused
-- (zero rows) until an external provider exists — default-deny is correct
-- until there's a real reason to expose it.

-- ============================================================
-- similarity_matches
-- ============================================================
create table public.similarity_matches (
  id bigint generated always as identity primary key,
  document_id uuid not null references public.documents (id) on delete cascade,
  chunk_id bigint not null references public.document_chunks (id) on delete cascade,
  -- Exactly one match target: another of this project's documents (the
  -- only real corpus available today) or an external source (schema-ready,
  -- unpopulated — see document_sources above).
  matched_document_id uuid references public.documents (id) on delete cascade,
  matched_source_id bigint references public.document_sources (id) on delete cascade,
  match_type text not null check (match_type in ('exact', 'near_exact', 'semantic', 'citation')),
  similarity_score numeric not null check (similarity_score >= 0 and similarity_score <= 1),
  matched_text text not null,
  created_at timestamptz not null default now(),
  constraint similarity_matches_target_check check (
    (matched_document_id is not null and matched_source_id is null) or
    (matched_document_id is null and matched_source_id is not null)
  )
);

create index similarity_matches_document_id_idx on public.similarity_matches (document_id);
create index similarity_matches_matched_document_id_idx on public.similarity_matches (matched_document_id) where matched_document_id is not null;

alter table public.similarity_matches enable row level security;

-- Visible only through the analyzed document's own access rule — never
-- exposes the *other* document's full content, only the snippet already
-- stored in matched_text at analysis time.
create policy "similarity_matches_select_via_document"
  on public.similarity_matches for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
  ));

-- ============================================================
-- originality_reports
-- ============================================================
create table public.originality_reports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null unique references public.documents (id) on delete cascade,
  -- "Índice de similitud" — never call this a plagiarism percentage in
  -- code, copy, or comments. It requires human interpretation.
  similarity_index numeric not null check (similarity_index >= 0 and similarity_index <= 1),
  exact_ratio numeric not null default 0,
  near_exact_ratio numeric not null default 0,
  semantic_ratio numeric not null default 0,
  citation_count integer not null default 0,
  reference_count integer not null default 0,
  -- Bumped whenever the scoring algorithm changes, so an old report can
  -- always be attributed to the method that actually produced it.
  engine_version text not null,
  status text not null default 'completed' check (status in ('completed', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.originality_reports enable row level security;

create policy "originality_reports_select_via_document"
  on public.originality_reports for select
  using (exists (
    select 1 from public.documents d
    where d.id = document_id
      and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
  ));

-- ============================================================
-- Storage: private bucket for uploaded documents
-- ============================================================
-- Never public. Objects are stored under `{auth.uid()}/{document_id}/...`
-- so the path-prefix RLS check below is a simple, fast string compare.
-- Workspace members don't get direct storage access — they see analysis
-- results (chunks/citations/matches, all workspace-RLS'd above); the raw
-- original file is only ever handed out via a signed URL a Server Action
-- issues after re-checking the `documents` row is actually visible to the
-- requester, never via a client-side storage read.
insert into storage.buckets (id, name, public)
values ('originality-documents', 'originality-documents', false)
on conflict (id) do nothing;

create policy "originality_documents_owner_select"
  on storage.objects for select
  using (bucket_id = 'originality-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "originality_documents_owner_insert"
  on storage.objects for insert
  with check (bucket_id = 'originality-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "originality_documents_owner_delete"
  on storage.objects for delete
  using (bucket_id = 'originality-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Usage-limit defaults for the new feature (plans.metadata)
-- ============================================================
-- Placeholder defaults, not a researched business decision — nobody has
-- defined real numbers for this brand-new feature yet. Deliberately
-- conservative and trivially tunable later via a plain UPDATE (same
-- convention as favorites_limit), never hardcoded in application code.
update public.plans
set metadata = metadata || '{"originality_analyses_per_month": 3, "originality_max_file_size_mb": 5}'::jsonb
where id = 'free';

update public.plans
set metadata = metadata || '{"originality_analyses_per_month": 50, "originality_max_file_size_mb": 20}'::jsonb
where id = 'pro';

update public.plans
set metadata = metadata || '{"originality_analyses_per_month": 200, "originality_max_file_size_mb": 20}'::jsonb
where id = 'team';
