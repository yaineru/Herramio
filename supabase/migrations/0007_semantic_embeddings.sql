-- Semantic similarity infrastructure for Originality.
--
-- IMPORTANT: applying this migration does NOT turn on semantic matching.
-- No embedding provider is configured (no API key exists), so nothing
-- writes to this table yet and every report continues to report
-- `semantic_ratio = 0` and label semantic similarity "no disponible".
-- This exists so that connecting a provider later is a configuration
-- step, not a schema migration under pressure.
--
-- Uses Supabase's native pgvector rather than an external vector database
-- (Pinecone/Weaviate/etc.): the corpus here is per-user/per-workspace
-- documents, which is orders of magnitude below where a dedicated vector
-- service earns its operational cost.

create extension if not exists vector with schema extensions;

-- ============================================================
-- document_chunk_embeddings
-- ============================================================
-- Separate table rather than a column on document_chunks: embeddings are
-- optional, model-specific, and re-generated when the model changes,
-- while chunks are permanent. Keeping them apart means switching models
-- never risks the chunk rows themselves.
create table public.document_chunk_embeddings (
  chunk_id bigint not null references public.document_chunks (id) on delete cascade,
  -- Which model produced this vector. Part of the primary key so the same
  -- chunk can hold vectors from two models during a migration between
  -- them, instead of forcing a destructive re-embed of everything.
  model text not null,
  dimensions integer not null check (dimensions > 0),
  -- 1536 covers the common general-purpose embedding sizes. pgvector
  -- requires a fixed dimension per column; a model with a different size
  -- needs its own migration, which is deliberate — silently mixing
  -- dimensionalities would produce meaningless similarity scores.
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  primary key (chunk_id, model)
);

-- HNSW over cosine distance: recommended default for this workload, and
-- cosine is the right metric for text embeddings (direction carries the
-- meaning, magnitude mostly reflects length).
create index document_chunk_embeddings_hnsw_idx
  on public.document_chunk_embeddings
  using hnsw (embedding extensions.vector_cosine_ops);

comment on table public.document_chunk_embeddings is
  'Optional semantic vectors per chunk. Empty until an embedding provider is configured — see ORIGINALITY.md.';

alter table public.document_chunk_embeddings enable row level security;

-- Readable only through a chunk the requester can already see; the
-- existing document/workspace rules remain the single source of truth for
-- who can read what. No insert/update/delete policies: only the pipeline
-- (service-role) writes embeddings.
create policy "document_chunk_embeddings_select_via_chunk"
  on public.document_chunk_embeddings for select
  using (exists (
    select 1
    from public.document_chunks c
    join public.documents d on d.id = c.document_id
    where c.id = chunk_id
      and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
  ));

-- ============================================================
-- Semantic neighbour search
-- ============================================================
-- SECURITY DEFINER so it can traverse embeddings efficiently, but it
-- re-applies the caller's own visibility rules inside — it can only ever
-- return chunks from documents the caller could already read directly.
create function public.match_document_chunks(
  p_embedding extensions.vector(1536),
  p_model text,
  p_exclude_document_id uuid,
  p_match_threshold double precision default 0.75,
  p_match_count integer default 20
)
returns table (chunk_id bigint, document_id uuid, similarity double precision)
language sql
security definer
set search_path = public, extensions
stable
as $$
  select
    e.chunk_id,
    c.document_id,
    -- pgvector's <=> is cosine DISTANCE; similarity is its complement.
    1 - (e.embedding <=> p_embedding) as similarity
  from public.document_chunk_embeddings e
  join public.document_chunks c on c.id = e.chunk_id
  join public.documents d on d.id = c.document_id
  where e.model = p_model
    and c.document_id <> p_exclude_document_id
    and (d.user_id = auth.uid() or (d.workspace_id is not null and public.is_workspace_member(d.workspace_id)))
    and 1 - (e.embedding <=> p_embedding) >= p_match_threshold
  order by e.embedding <=> p_embedding
  limit p_match_count;
$$;

revoke execute on function public.match_document_chunks from public, anon;

-- ============================================================
-- Cost / observability
-- ============================================================
-- Answers "what did this analysis actually cost us to run", which is the
-- prerequisite for pricing the feature honestly later.
alter table public.originality_reports
  add column if not exists embeddings_generated integer not null default 0,
  add column if not exists source_queries_run integer not null default 0,
  add column if not exists processing_ms integer;
