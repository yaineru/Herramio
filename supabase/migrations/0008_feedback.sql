-- ============================================================
-- 0008 — Canal de feedback para la beta privada
-- ============================================================
-- Un solo sitio donde aterriza lo que la gente nos dice durante la beta.
-- El objetivo de la beta es aprender qué falla y qué no se entiende, y sin
-- un canal esa información se pierde en cuanto el usuario cierra la
-- pestaña.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),

  -- Nullable a propósito: alguien que no ha iniciado sesión también puede
  -- tener algo que decir, y perder ese comentario por exigir cuenta sería
  -- perder justo el feedback del que abandona.
  user_id uuid references auth.users (id) on delete set null,

  kind text not null default 'comment'
    check (kind in ('comment', 'problem', 'idea')),

  message text not null check (char_length(trim(message)) between 3 and 4000),

  -- Dónde estaba la persona al escribir. Vale más que el mensaje solo:
  -- "no entiendo esto" en /originalidad/[id] y en /precios son problemas
  -- distintos.
  page_path text,

  -- Contexto opcional que el widget adjunta (documento, ancho de pantalla).
  -- jsonb y no columnas fijas porque todavía no sabemos qué necesitaremos
  -- registrar, y una beta que no puede evolucionar su telemetría no sirve.
  -- NUNCA debe contener el contenido del documento ni datos sensibles.
  context jsonb not null default '{}'::jsonb,

  -- El equipo marca lo ya atendido sin borrar nada.
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'resolved')),

  created_at timestamptz not null default now()
);

create index feedback_created_at_idx on public.feedback (created_at desc);
create index feedback_status_idx on public.feedback (status) where status = 'new';
create index feedback_user_id_idx on public.feedback (user_id) where user_id is not null;

alter table public.feedback enable row level security;

-- ============================================================
-- RLS
-- ============================================================
-- Escribir: cualquiera, incluido anónimo. El único requisito es que un
-- usuario autenticado no pueda firmar un comentario en nombre de otro.
create policy "feedback_insert_anyone"
  on public.feedback for insert
  with check (user_id is null or user_id = auth.uid());

-- Leer: solo lo propio. Deliberadamente NO hay política de lectura para el
-- equipo: el panel de administración usa el service role, que salta RLS.
-- Añadir aquí una política basada en una lista de correos convertiría esa
-- lista en parte del modelo de seguridad de la base de datos, y hoy vive
-- en una variable de entorno.
create policy "feedback_select_own"
  on public.feedback for select
  using (user_id is not null and user_id = auth.uid());

-- Sin políticas de update ni delete: nadie edita ni borra su feedback una
-- vez enviado, y el equipo lo gestiona con service role. Un usuario que
-- reporta un problema y luego lo borra nos deja sin el dato justo cuando
-- más falta hace.

comment on table public.feedback is
  'Comentarios de la beta. context nunca debe contener texto de documentos ni PII innecesaria.';
