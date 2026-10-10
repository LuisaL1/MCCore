// CORS compartido por las funciones que usa la página de MCCore.
// Acepta mccore.com.co, cualquier despliegue *.vercel.app y el servidor local de desarrollo.
// ALLOWED_ORIGINS (opcional) agrega orígenes extra separados por coma.

const EXTRA = (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map(o => o.trim()).filter(Boolean)
const FIXED = ['https://mccore.com.co', 'https://www.mccore.com.co', 'http://localhost:5180', 'http://localhost:5190']
const VERCEL = /^https:\/\/[a-z0-9-]+\.vercel\.app$/

export function isAllowedOrigin(origin: string | null) {
  return !!origin && (FIXED.includes(origin) || EXTRA.includes(origin) || VERCEL.test(origin))
}

export function corsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin! : FIXED[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Vary': 'Origin',
  }
}

export function json(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}
