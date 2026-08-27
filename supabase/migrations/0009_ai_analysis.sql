-- AI explanation layer: storage for the prose that accompanies a report.
--
-- Additive and idempotent. No column is dropped, no type is changed, no
-- data is rewritten: an existing report simply has nulls here and renders
-- exactly as it does today.
--
-- The explanation is stored as jsonb rather than a column per field
-- because its shape (summary, findings, recommendations, uncertainty) is
-- presentation detail that will change, and a schema migration per wording
-- change is a bad trade. The COST columns are separate and typed, because
-- those get aggregated — "what did originality cost us last month" is a
-- query, not a document.

alter table public.originality_reports
  add column if not exists ai_analysis      jsonb,
  add column if not exists ai_model         text,
  add column if not exists ai_input_tokens  integer,
  add column if not exists ai_output_tokens integer,
  add column if not exists ai_cost_usd      numeric(12, 6),
  add column if not exists ai_duration_ms   integer;

comment on column public.originality_reports.ai_analysis is
  'Explicación generada sobre la evidencia ya medida. Nunca es la fuente de ninguna cifra del informe; si es null, el informe se muestra completo sin prosa.';

comment on column public.originality_reports.ai_cost_usd is
  'Coste calculado a partir de tokens medidos y un precio configurado explícitamente. Null cuando no hay precio configurado: los tokens son exactos, el precio no se adivina.';

-- Reports carrying an explanation, for cost aggregation over a period.
-- Partial: the vast majority of rows have no AI analysis and do not belong
-- in this index.
create index if not exists originality_reports_ai_cost_idx
  on public.originality_reports (created_at)
  where ai_analysis is not null;
