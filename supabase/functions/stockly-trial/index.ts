// Edge Function: recibe un correo desde mccore.com.co y, si el código MCCORE-PRO30 aún
// tiene cupos (tabla codigos_promo de Stockly), envía el correo con el código usando Brevo.
// Los cupos los controla la app al canjear el código; aquí solo se evita reenviar al mismo correo.
//
// Secretos (ya existentes en el proyecto): BREVO_API_KEY
// Opcionales:
//   PROMO_CODE         código a promocionar (por defecto MCCORE-PRO30)
//   SENDER_EMAIL       remitente verificado en Brevo (por defecto equipo@appstockly.com, el mismo de "bienvenida")
//   REPLY_TO           a dónde llegan las respuestas (por defecto equipo@mccore.com.co)
//   MAX_EMAILS         tope de correos enviados, por seguridad (por defecto 300)
//   ALLOWED_ORIGINS    orígenes permitidos separados por coma
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase automáticamente.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { HTML, SUBJECT } from './correo.ts'

const PROMO = Deno.env.get('PROMO_CODE') ?? 'MCCORE-PRO30'
const SENDER = Deno.env.get('SENDER_EMAIL') ?? 'equipo@appstockly.com'
const REPLY_TO = Deno.env.get('REPLY_TO') ?? 'equipo@mccore.com.co'
const MAX_EMAILS = Number(Deno.env.get('MAX_EMAILS') ?? 300)
const ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ??
  'https://mccore.com.co,https://www.mccore.com.co,http://localhost:5180')
  .split(',').map(o => o.trim())

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

function cors(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin && ORIGINS.includes(origin) ? origin : ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Vary': 'Origin',
  }
}

function reply(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), 'Content-Type': 'application/json' },
  })
}

async function sendEmail(to: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': Deno.env.get('BREVO_API_KEY')!,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Stockly', email: SENDER },
      replyTo: { email: REPLY_TO, name: 'Equipo MCCore' },
      to: [{ email: to }],
      subject: SUBJECT,
      htmlContent: HTML,
      tags: ['stockly-pro-trial'],
    }),
  })
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
}

Deno.serve(async req => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) })
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' }, origin)

  let email = ''
  let website = ''
  try {
    const body = await req.json()
    email = String(body.email ?? '').trim().toLowerCase()
    website = String(body.website ?? '')   // campo trampa para bots: las personas lo dejan vacío
  } catch {
    return reply(400, { error: 'invalid_body' }, origin)
  }

  if (website) return reply(200, { status: 'sent' }, origin)
  if (!EMAIL_RE.test(email) || email.length > 254) return reply(400, { error: 'invalid_email' }, origin)

  // ¿Ya está registrado? No gasta otro cupo ni reenvía.
  const { data: existing, error: findError } = await supabase
    .from('stockly_trials').select('id').eq('email', email).maybeSingle()
  if (findError) return reply(500, { error: 'server_error' }, origin)
  if (existing) return reply(200, { status: 'already_registered' }, origin)

  // ¿El código sigue activo y con cupos? (lo controla la app de Stockly)
  const { data: promo, error: promoError } = await supabase
    .from('codigos_promo').select('activo, usos, usos_max, canjear_hasta').eq('codigo', PROMO).maybeSingle()
  if (promoError) return reply(500, { error: 'server_error' }, origin)
  const vencido = promo?.canjear_hasta && new Date(promo.canjear_hasta) < new Date()
  if (!promo || !promo.activo || vencido || (promo.usos_max != null && promo.usos >= promo.usos_max)) {
    return reply(409, { error: 'sold_out' }, origin)
  }

  // Tope de seguridad de correos enviados (evita abuso del formulario)
  const { count, error: countError } = await supabase
    .from('stockly_trials').select('id', { count: 'exact', head: true })
  if (countError) return reply(500, { error: 'server_error' }, origin)
  if ((count ?? 0) >= MAX_EMAILS) return reply(409, { error: 'sold_out' }, origin)

  // Reserva el cupo (la restricción única evita duplicados si llegan dos envíos a la vez)
  const { error: insertError } = await supabase.from('stockly_trials').insert({ email })
  if (insertError) {
    if (insertError.code === '23505') return reply(200, { status: 'already_registered' }, origin)
    return reply(500, { error: 'server_error' }, origin)
  }

  try {
    await sendEmail(email)
  } catch (err) {
    console.error(err)
    // Si el correo falla, libera el cupo para que la persona pueda intentarlo de nuevo
    await supabase.from('stockly_trials').delete().eq('email', email)
    return reply(502, { error: 'email_failed' }, origin)
  }

  return reply(200, { status: 'sent' }, origin)
})
