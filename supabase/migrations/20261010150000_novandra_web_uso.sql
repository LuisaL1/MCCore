-- Uso del chat Novandra de la página (para limitar abusos y medir costo). No guarda el texto de las conversaciones.
create table if not exists public.novandra_web_uso (
  id             bigint generated always as identity primary key,
  visitante      text not null,             -- hash de la IP (no se guarda la IP)
  tokens_entrada int,
  tokens_salida  int,
  created_at     timestamptz not null default now()
);
alter table public.novandra_web_uso enable row level security;
create index if not exists novandra_web_uso_visitante_fecha on public.novandra_web_uso (visitante, created_at desc);
