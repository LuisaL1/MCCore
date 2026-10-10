-- Mensajes del formulario de Contacto de mccore.com.co.
-- Se guardan siempre (aunque falle el correo) para no perder ningún contacto.
-- Solo la Edge Function "contacto" escribe aquí (service role); RLS sin políticas = nadie lee desde el navegador.
create table if not exists public.contacto_mensajes (
  id          bigint generated always as identity primary key,
  nombre      text not null,
  email       text not null,
  servicio    text,
  mensaje     text not null,
  enviado     boolean not null default false,
  error       text,
  created_at  timestamptz not null default now()
);
alter table public.contacto_mensajes enable row level security;
create index if not exists contacto_mensajes_email_fecha on public.contacto_mensajes (email, created_at desc);
