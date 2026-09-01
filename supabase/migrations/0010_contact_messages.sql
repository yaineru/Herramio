-- ============================================================
-- 0010 — Mensajes de contacto
-- ============================================================
-- Sustituye un enlace mailto: a un buzón que no existe.
--
-- La página de contacto abría el cliente de correo del visitante apuntando
-- a una dirección sin buzón detrás. Todo mensaje enviado por ahí se perdía
-- sin que ni el remitente ni nosotros lo supiéramos, que es peor que no
-- tener página de contacto: promete un canal y no lo da.
--
-- POR QUÉ UNA TABLA NUEVA Y NO `feedback`
--
-- Se evaluó reutilizarla. No encaja por una razón concreta: `feedback` no
-- guarda correo, a propósito ("nada que convierta la caja de feedback en
-- una superficie de recogida de datos"). Un contacto sin dirección de
-- respuesta no es un contacto. Añadir `email` a `feedback` daría una
-- columna de datos personales a cada comentario que no la necesita, y
-- mezclaría dos cosas que se gestionan distinto: el feedback se tría por
-- página y no espera respuesta; un contacto se tría por asunto y sí la
-- espera.

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),

  -- Nullable: el formulario es público. Exigir cuenta para poder escribir
  -- a soporte deja fuera justo a quien tiene un problema para registrarse.
  user_id uuid references auth.users (id) on delete set null,

  -- La única razón por la que existe esta tabla y no se reutiliza
  -- `feedback`: sin esto no hay forma de responder.
  email text not null check (
    char_length(email) between 5 and 254
    and email like '%_@_%.__%'
  ),

  -- Opcional de verdad: saber cómo dirigirse a alguien ayuda, no saberlo
  -- no impide responderle.
  name text check (name is null or char_length(trim(name)) between 1 and 120),

  topic text not null default 'otro'
    check (topic in ('problema', 'herramienta', 'privacidad', 'otro')),

  message text not null check (char_length(trim(message)) between 10 and 4000),

  -- Desde dónde escribió. Igual que en feedback: el contexto suele valer
  -- tanto como el texto.
  page_path text check (page_path is null or char_length(page_path) <= 300),

  -- `archived` existe aquí y no en feedback porque los mensajes de
  -- contacto se acumulan y hay que poder archivarlos sin resolverlos
  -- (duplicados, spam que pasó el filtro, mensajes sin pregunta).
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'resolved', 'archived')),

  created_at timestamptz not null default now()
);

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index contact_messages_status_idx on public.contact_messages (status) where status = 'new';

alter table public.contact_messages enable row level security;

-- ============================================================
-- RLS
-- ============================================================
-- Escribir: la política permite firmar solo en nombre propio (o anónimo).
--
-- MEDIDO EN LA BASE REAL, no supuesto: un POST anónimo directo a PostgREST
-- se rechaza igualmente con 42501, exactamente como en `feedback`. Es
-- decir, en la práctica NADIE escribe aquí saltándose la aplicación: todo
-- pasa por la Server Action, que valida el correo, limita la longitud y
-- aplica rate limit por IP antes de escribir con service role.
--
-- Se deja así a propósito. Si la API aceptara escrituras anónimas
-- directas, esas tres protecciones serían decorativas: bastaría con hacer
-- POST a la tabla. Verificado por scripts/verify-contact-security.mjs.
create policy "contact_insert_anyone"
  on public.contact_messages for insert
  with check (user_id is null or user_id = auth.uid());

-- Leer: NADIE. Ni siquiera lo propio.
--
-- Más estricto que feedback, y a propósito. Estas filas contienen correos
-- y no existe ninguna pantalla donde alguien consulte sus mensajes
-- enviados, así que una política de lectura solo añadiría superficie de
-- ataque sin dar ninguna funcionalidad. El panel de administración usa el
-- service role, que salta RLS, y comprueba que quien llama es admin en
-- cada función.
--
-- Sin update ni delete: el estado lo cambia el equipo con service role.

comment on table public.contact_messages is
  'Mensajes del formulario público de contacto. Contiene correos: sin política de lectura por RLS, solo accesible con service role tras comprobar admin.';
