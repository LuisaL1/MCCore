-- Registra si el correo automático al visitante se envió.
alter table public.contacto_mensajes add column if not exists autorespuesta boolean;
