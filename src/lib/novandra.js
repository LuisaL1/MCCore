// Novandra (asistente de la página): entiende la pregunta con el motor local de novandraBrain.js.
import { answer } from './novandraBrain.js'

// Abre el chat desde cualquier parte (p. ej. el ícono de soporte del header)
export const openNovandra = () => window.dispatchEvent(new Event('novandra:open'))

// Abre el chat y le envía una pregunta (p. ej. desde la barra de prompt del hero)
export const askFromPage = text =>
  window.dispatchEvent(new CustomEvent('novandra:ask', { detail: text }))

export const NOVANDRA_GREETING =
  'Hola, soy Novandra, la asistente de MCCore. ¿En qué te ayudo hoy?'

export const QUICK_REPLIES = ['¿Qué servicios ofrecen?', '¿Qué es Stockly?', '¿Cuánto cuesta Stockly?', 'Quiero hablar con alguien']

// Claude (función "novandra-web") es opcional: actívalo con VITE_NOVANDRA_IA=on en .env cuando haya saldo.
// Por defecto Novandra responde con su motor local (novandraBrain.js), sin costo.
const USE_AI = import.meta.env.VITE_NOVANDRA_IA === 'on'
const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/novandra-web`

async function askAI(history) {
  const messages = history.filter(m => m.text).map(m => ({ role: m.from === 'user' ? 'user' : 'assistant', content: m.text }))
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ messages }) })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.text) return { text: data.text, action: data.action ?? undefined }
  } catch {
    // sin conexión: sigue con el motor local
  }
  return null
}

// history: [{ from: 'user' | 'bot', text, topic? }] con la pregunta nueva al final
export async function askNovandra(history) {
  const question = history[history.length - 1]?.text ?? ''
  // Tema de la conversación: el de la última respuesta de Novandra
  const topic = [...history].reverse().find(m => m.from === 'bot' && m.topic)?.topic

  if (USE_AI) {
    const ai = await askAI(history)
    if (ai) return { ...ai, topic }
  }

  // Pequeña pausa para que se sienta natural (más larga si la respuesta es larga)
  const result = answer(question, { topic })
  await new Promise(resolve => setTimeout(resolve, Math.min(450 + result.text.length * 4, 1300)))
  return result
}
