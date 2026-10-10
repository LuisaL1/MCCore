// Edge Function: recibe el formulario de Contacto de mccore.com.co, lo guarda en
// contacto_mensajes y lo envía por Brevo a equipo@mccore.com.co (responder = el visitante).
//
// Secretos (ya existentes): BREVO_API_KEY
// Opcionales: CONTACT_TO (destino), SENDER_EMAIL (remitente, por defecto no-reply@mccore.com.co)

import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { demoEmail, escape, receivedEmail } from './autorespuesta.ts'

const TO = Deno.env.get('CONTACT_TO') ?? 'equipo@mccore.com.co'
const SENDER = Deno.env.get('SENDER_EMAIL') ?? 'no-reply@mccore.com.co'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_PER_HOUR = 5        // por correo del visitante
const MAX_PER_DAY = 150       // en total, por seguridad

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

function emailHtml(nombre: string, email: string, servicio: string, mensaje: string) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6B6472;font-size:14px;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;font-size:15px;color:#17131D;">${v}</td></tr>`
  return `<!doctype html><html lang="es"><body style="margin:0;padding:24px 12px;background:#F4F1EC;font-family:Arial,Helvetica,sans-serif;color:#17131D;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E7E2DA;border-radius:20px;">
<tr><td style="padding:28px 30px;">
<p style="margin:0 0 4px;font-size:13px;font-weight:bold;letter-spacing:1px;color:#8800B3;">NUEVO MENSAJE DESDE LA PÁGINA WEB</p>
<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;">${escape(nombre)} quiere hablar con MCCore</h1>
<table role="presentation" cellpadding="0" cellspacing="0">
${row('Nombre', escape(nombre))}
${row('Correo', `<a href="mailto:${escape(email)}" style="color:#8800B3;">${escape(email)}</a>`)}
${row('Necesita', escape(servicio || 'No indicó'))}
</table>
<div style="margin-top:18px;padding:16px 18px;border-radius:14px;background:#F2E7F8;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escape(mensaje)}</div>
<p style="margin:18px 0 0;font-size:13px;color:#6B6472;">Responde este correo para escribirle directamente a ${escape(nombre)}.</p>
</td></tr></table>
</td></tr></table></body></html>`
}

Deno.serve(async req => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' }, origin)

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return json(400, { error: 'invalid_body' }, origin) }

  const nombre = String(body.nombre ?? '').trim().slice(0, 120)
  const email = String(body.email ?? '').trim().toLowerCase().slice(0, 254)
  const servicio = String(body.servicio ?? '').trim().slice(0, 80)
  const mensaje = String(body.mensaje ?? '').trim().slice(0, 5000)
  if (body.website) return json(200, { status: 'sent' }, origin)   // campo trampa para bots
  if (!nombre || !mensaje) return json(400, { error: 'missing_fields' }, origin)
  if (!EMAIL_RE.test(email)) return json(400, { error: 'invalid_email' }, origin)

  // Límites para evitar abuso del formulario
  const hourAgo = new Date(Date.now() - 3600_000).toISOString()
  const dayAgo = new Date(Date.now() - 86400_000).toISOString()
  const [{ count: perHour }, { count: perDay }] = await Promise.all([
    supabase.from('contacto_mensajes').select('id', { count: 'exact', head: true }).eq('email', email).gte('created_at', hourAgo),
    supabase.from('contacto_mensajes').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
  ])
  if ((perHour ?? 0) >= MAX_PER_HOUR || (perDay ?? 0) >= MAX_PER_DAY) return json(429, { error: 'too_many' }, origin)

  // Se guarda primero: así ningún mensaje se pierde aunque falle el correo
  const { data: saved, error: insertError } = await supabase
    .from('contacto_mensajes').insert({ nombre, email, servicio, mensaje }).select('id').single()
  if (insertError) return json(500, { error: 'server_error' }, origin)

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': Deno.env.get('BREVO_API_KEY')!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Página web MCCore', email: SENDER },
      to: [{ email: TO, name: 'Equipo MCCore' }],
      replyTo: { email, name: nombre },
      subject: `Nuevo mensaje de ${nombre}${servicio ? ` · ${servicio}` : ''}`,
      htmlContent: emailHtml(nombre, email, servicio, mensaje),
      textContent: `Nuevo mensaje desde la página web\n\nNombre: ${nombre}\nCorreo: ${email}\nNecesita: ${servicio || 'No indicó'}\n\n${mensaje}`,
    }),
  })

  let teamError: string | null = null
  if (!res.ok) {
    teamError = `Brevo ${res.status}: ${(await res.text()).slice(0, 400)}`
    console.error(teamError)
  }

  // Correo automático para quien escribió: info y acceso si pidió demo de Stockly, o confirmación
  const auto = servicio === 'Demo de Stockly' ? demoEmail(nombre) : receivedEmail(nombre, servicio)
  const autoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': Deno.env.get('BREVO_API_KEY')!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      sender: { name: 'Equipo MCCore', email: SENDER },
      to: [{ email, name: nombre }],
      subject: auto.subject,
      htmlContent: auto.html,
      textContent: auto.text,
    }),
  })
  if (!autoRes.ok) console.error('Autorespuesta', autoRes.status, (await autoRes.text()).slice(0, 300))

  await supabase.from('contacto_mensajes')
    .update({ enviado: !teamError, error: teamError, autorespuesta: autoRes.ok })
    .eq('id', saved.id)
  // El mensaje quedó guardado: para el visitante el envío fue exitoso aunque falle un correo
  return json(200, { status: teamError ? 'saved' : 'sent' }, origin)
})
