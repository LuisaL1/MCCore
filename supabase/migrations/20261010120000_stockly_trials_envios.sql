-- Permite reenviar el código y deja registro de cada envío para poder diagnosticar.
alter table public.stockly_trials
  add column if not exists envios           int         not null default 1,
  add column if not exists ultimo_envio     timestamptz not null default now(),
  add column if not exists brevo_message_id text,
  add column if not exists ultimo_error     text;
