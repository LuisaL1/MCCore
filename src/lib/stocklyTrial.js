// Pide el mes gratis de Stockly Pro: la Edge Function de Supabase reserva el cupo
// y envía el correo con el código a través de Brevo.

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stockly-trial`

// Devuelve 'sent' | 'already_registered'. Lanza un Error con code
// 'sold_out' | 'invalid_email' | 'email_failed' | 'network' | 'server_error'.
export async function requestStocklyTrial(email, website = '') {
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, website }),
    })
  } catch {
    throw Object.assign(new Error('network'), { code: 'network' })
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error), { code: data.error ?? 'server_error' })
  return data.status
}
