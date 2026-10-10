// Envía el formulario de Contacto a la Edge Function "contacto" de Supabase,
// que lo guarda y lo reenvía por correo a equipo@mccore.com.co.

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contacto`

// Lanza un Error con code: 'invalid_email' | 'missing_fields' | 'too_many' | 'network' | 'server_error'
export async function sendContactMessage({ nombre, email, servicio, mensaje, website = '' }) {
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nombre, email, servicio, mensaje, website }),
    })
  } catch {
    throw Object.assign(new Error('network'), { code: 'network' })
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error), { code: data.error ?? 'server_error' })
  return data.status
}
