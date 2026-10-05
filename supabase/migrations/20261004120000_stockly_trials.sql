-- Correos que pidieron el código del mes gratis de Stockly Pro (evita reenviar al mismo correo).
-- Solo la Edge Function stockly-trial escribe aquí (usa la service role, que ignora RLS).

create table if not exists public.stockly_trials (
  id          bigint generated always as identity primary key,
  email       text not null,
  created_at  timestamptz not null default now(),
  constraint stockly_trials_email_unique unique (email)
);

-- RLS activo y sin políticas: nadie puede leer ni escribir desde el navegador.
alter table public.stockly_trials enable row level security;
