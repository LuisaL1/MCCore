// Edge Function: Novandra, la asistente de la página web de MCCore, con Claude.
// Recibe la conversación del chat, responde con Claude y devuelve { text, action }.
// No es la Novandra de la app Stockly (esa es la función "novandra").
//
// Secretos (ya existentes): ANTHROPIC_API_KEY
// Opcionales: NOVANDRA_WEB_MAX_POR_HORA (por visitante, 30), NOVANDRA_WEB_MAX_POR_DIA (total, 1500)

import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, json } from '../_shared/cors.ts'
import { SYSTEM_PROMPT } from './conocimiento.ts'

const MODEL = 'claude-opus-5-5'
const MAX_PER_HOUR = Number(Deno.env.get('NOVANDRA_WEB_MAX_POR_HORA') ?? 30)
const MAX_PER_DAY = Number(Deno.env.get('NOVANDRA_WEB_MAX_POR_DIA') ?? 1500)
const MAX_TURNS = 12           // mensajes de historial que se envían
const MAX_CHARS = 1000         // por mensaje del visitante

const anthropic = new Anthropic()   // lee ANTHROPIC_API_KEY
const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// Etiquetas que Claude puede poner al final → botón en el chat
const ACTIONS: Record<string, { label: string; href: string }> = {
  contacto: { label: 'Ir a Contacto', href: '#contacto' },
  stockly: { label: 'Conocer Stockly', href: '#stockly' },
  planes: { label: 'Ver planes de Stockly', href: '#planes' },
  servicios: { label: 'Ver servicios', href: '#servicios' },
}

async function visitorId(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'desconocido'
  const data = new TextEncoder().encode(`novandra-web:${ip}`)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash)).slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async req => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' }, origin)

  let body: { messages?: { role: string; content: string }[] }
  try { body = await req.json() } catch { return json(400, { error: 'invalid_body' }, origin) }

  // Historial limpio: solo user/assistant con texto, empieza en user y termina en user
  const history: Anthropic.MessageParam[] = (body.messages ?? [])
    .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_TURNS)
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content.trim().slice(0, MAX_CHARS) }))
  while (history.length && history[0].role !== 'user') history.shift()
  if (!history.length || history[history.length - 1].role !== 'user') return json(400, { error: 'missing_question' }, origin)

  // Límites de uso (por visitante y total diario)
  const visitante = await visitorId(req)
  const hourAgo = new Date(Date.now() - 3600_000).toISOString()
  const dayAgo = new Date(Date.now() - 86400_000).toISOString()
  const [{ count: perHour }, { count: perDay }] = await Promise.all([
    supabase.from('novandra_web_uso').select('id', { count: 'exact', head: true }).eq('visitante', visitante).gte('created_at', hourAgo),
    supabase.from('novandra_web_uso').select('id', { count: 'exact', head: true }).gte('created_at', dayAgo),
  ])
  if ((perHour ?? 0) >= MAX_PER_HOUR || (perDay ?? 0) >= MAX_PER_DAY) return json(429, { error: 'too_many' }, origin)

  let response
  try {
    response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 2000,
      // Chat corto: poco razonamiento basta y responde más rápido
      output_config: { effort: 'low' },
      // Si el modelo declina por política, la API reintenta con otro modelo en la misma llamada
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Instrucciones fijas en caché: más rápido y más barato desde la segunda pregunta
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      messages: history,
    } as Anthropic.Beta.MessageCreateParamsNonStreaming)
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return json(429, { error: 'too_many' }, origin)
    console.error('Claude', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err)
    return json(502, { error: 'ai_unavailable' }, origin)
  }

  if (response.stop_reason === 'refusal') {
    return json(200, { text: 'Prefiero no responder eso. ¿Te ayudo con algo sobre MCCore o Stockly?', action: null }, origin)
  }

  let text = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { text: string }).text)
    .join('')
    .trim()

  // Extrae la etiqueta de acción final, si la hay
  let action = null
  const tag = text.match(/\[\[(\w+)\]\]\s*$/)
  if (tag) {
    action = ACTIONS[tag[1]] ?? null
    text = text.slice(0, tag.index).trim()
  }
  text = text.replace(/\[\[\w+\]\]/g, '').replace(/\*\*/g, '').trim()
  if (!text) return json(502, { error: 'ai_unavailable' }, origin)

  await supabase.from('novandra_web_uso').insert({
    visitante,
    tokens_entrada: (response.usage.input_tokens ?? 0) + (response.usage.cache_read_input_tokens ?? 0) + (response.usage.cache_creation_input_tokens ?? 0),
    tokens_salida: response.usage.output_tokens,
  })

  return json(200, { text, action }, origin)
})
