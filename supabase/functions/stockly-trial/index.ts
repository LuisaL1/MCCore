// Edge Function: recibe un correo desde mccore.com.co y, si el código MCCORE-PRO30 aún
// tiene cupos (tabla codigos_promo de Stockly), envía el correo con el código usando Brevo.
// Los cupos los controla la app al canjear el código; aquí solo se evita reenviar al mismo correo.
//
// Secretos (ya existentes en el proyecto): BREVO_API_KEY
// Opcionales:
//   PROMO_CODE         código a promocionar (por defecto MCCORE-PRO30)
//   SENDER_EMAIL       remitente "no responder" (por defecto no-reply@mccore.com.co)
//   FALLBACK_SENDER    remitente verificado en Brevo si el anterior es rechazado (por defecto gerencia@mccore.com.co)
//   MAX_EMAILS         tope de correos enviados, por seguridad (por defecto 300)
//   ALLOWED_ORIGINS    orígenes permitidos separados por coma
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los pone Supabase automáticamente.

import { createClient } from 'npm:@supabase/supabase-js@2'
import { HTML, SUBJECT } from './correo.ts'

const PROMO = Deno.env.get('PROMO_CODE') ?? 'MCCORE-PRO30'
const SENDER = Deno.env.get('SENDER_EMAIL') ?? 'no-reply@mccore.com.co'
const FALLBACK_SENDER = Deno.env.get('FALLBACK_SENDER') ?? 'gerencia@mccore.com.co'
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

async function brevoSend(to: string, from: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': Deno.env.get('BREVO_API_KEY')!,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      // Correo automático de MCCore: sin dirección de respuesta
      sender: { name: 'MCCore', email: from },
      to: [{ email: to }],
      subject: SUBJECT,
      htmlContent: HTML,
      tags: ['stockly-pro-trial'],
    }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Brevo ${res.status} (${from}): ${text.slice(0, 300)}`)
  // Brevo responde { messageId } cuando acepta el correo: lo guardamos para rastrearlo en su panel
  try { return `${from} · ${JSON.parse(text).messageId}` } catch { return from }
}

// Intenta con no-reply; si Brevo rechaza ese remitente (no verificado), usa el de respaldo
async function sendEmail(to: string) {
  try {
    return await brevoSend(to, SENDER)
  } catch (err) {
    if (!FALLBACK_SENDER || FALLBACK_SENDER === SENDER) throw err
    console.error(err)
    return await brevoSend(to, FALLBACK_SENDER)
  }
}

const MAX_SENDS = 3                 // envíos máximos al mismo correo
const RESEND_WAIT_MS = 2 * 60_000   // espera mínima entre reenvíos

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

  // ¿El código sigue activo y con cupos? (lo controla la app de Stockly)
  const { data: promo, error: promoError } = await supabase
    .from('codigos_promo').select('activo, usos, usos_max, canjear_hasta').eq('codigo', PROMO).maybeSingle()
  if (promoError) return reply(500, { error: 'server_error' }, origin)
  const vencido = promo?.canjear_hasta && new Date(promo.canjear_hasta) < new Date()
  if (!promo || !promo.activo || vencido || (promo.usos_max != null && promo.usos >= promo.usos_max)) {
    return reply(409, { error: 'sold_out' }, origin)
  }

  // ¿Ya pidió el código antes? Se le puede reenviar (máximo 3 veces, con 2 minutos entre envíos)
  const { data: existing, error: findError } = await supabase
    .from('stockly_trials').select('id, envios, ultimo_envio').eq('email', email).maybeSingle()
  if (findError) return reply(500, { error: 'server_error' }, origin)

  if (existing) {
    const recent = Date.now() - new Date(existing.ultimo_envio).getTime() < RESEND_WAIT_MS
    if (existing.envios >= MAX_SENDS || recent) return reply(200, { status: 'already_registered' }, origin)
  } else {
    // Tope de seguridad de correos distintos (evita abuso del formulario)
    const { count, error: countError } = await supabase
      .from('stockly_trials').select('id', { count: 'exact', head: true })
    if (countError) return reply(500, { error: 'server_error' }, origin)
    if ((count ?? 0) >= MAX_EMAILS) return reply(409, { error: 'sold_out' }, origin)

    const { error: insertError } = await supabase.from('stockly_trials').insert({ email, envios: 0 })
    if (insertError && insertError.code !== '23505') return reply(500, { error: 'server_error' }, origin)
  }

  const sends = existing?.envios ?? 0
  try {
    const messageId = await sendEmail(email)
    await supabase.from('stockly_trials')
      .update({ envios: sends + 1, ultimo_envio: new Date().toISOString(), brevo_message_id: messageId, ultimo_error: null })
      .eq('email', email)
  } catch (err) {
    console.error(err)
    // Guarda el error para diagnosticar y deja reintentar de inmediato
    await supabase.from('stockly_trials')
      .update({ ultimo_error: String(err).slice(0, 500), ultimo_envio: new Date(0).toISOString() })
      .eq('email', email)
    return reply(502, { error: 'email_failed' }, origin)
  }

  return reply(200, { status: 'sent' }, origin)
})
