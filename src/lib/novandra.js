// Cerebro de Novandra.
// Por ahora responde con reglas locales (sin IA real) para poder ver y probar el chat.
// Para conectarla a una IA de verdad, reemplaza el cuerpo de askNovandra por un fetch
// a tu backend (p. ej. POST /api/novandra), que es quien guarda la API key.
// Nunca pongas la API key en este archivo: todo lo que está en el frontend es público.

// Abre el chat desde cualquier parte (p. ej. el ícono de soporte del header)
export const openNovandra = () => window.dispatchEvent(new Event('novandra:open'))

// Abre el chat y le envía una pregunta (p. ej. desde la barra de prompt del hero)
export const askFromPage = text =>
  window.dispatchEvent(new CustomEvent('novandra:ask', { detail: text }))

export const NOVANDRA_GREETING =
  'Hola, soy Novandra, la asistente de MCCore. ¿En qué te ayudo hoy?'

export const QUICK_REPLIES = ['¿Qué servicios ofrecen?', '¿Cuánto cuesta una página web?', '¿Cómo es el proceso?', 'Quiero hablar con alguien']

const rules = [
  {
    match: /stockly|inventario|bodega|stock/,
    reply:
      'Stockly es nuestro primer producto: un software para controlar tu inventario, bodegas y pedidos sin hojas de cálculo. Es nuevo y ya está disponible. ¿Quieres probarlo con 1 mes gratis de Plan Pro?',
    action: { label: 'Conocer Stockly', href: '#stockly' },
  },
  {
    match: /servicio|hacen|ofrecen|qué hacen/,
    reply:
      'En MCCore hacemos desarrollo web, apps móviles, software a medida, automatización con IA, cloud/DevOps y diseño UX/UI. ¿Cuál de estos te interesa?',
  },
  {
    match: /precio|cuesta|costo|valor|cotiza|presupuesto/,
    reply:
      'Cada proyecto es distinto, así que cotizamos según lo que necesites. Si me cuentas un poco de tu idea en el formulario de contacto, te enviamos una propuesta inicial, sin compromiso.',
  },
  {
    match: /proceso|trabajan|pasos|tiempo|demora|cuánto tarda/,
    reply:
      'Primero escuchamos tu idea, luego te enviamos una propuesta con alcance y tiempos claros, y construimos por etapas mostrándote avances. ¿Quieres contarnos tu proyecto?',
  },
  {
    match: /web|página|sitio|tienda|ecommerce|e-commerce/,
    reply:
      'Hacemos sitios web y tiendas en línea a la medida de tu marca, listas para celulares. ¿Quieres que te ayudemos a cotizar la tuya?',
  },
  {
    match: /app|móvil|movil|android|ios|iphone/,
    reply: 'Creamos aplicaciones para iOS y Android, conectadas con los sistemas que ya usas. ¿Ya tienes clara la idea de tu app?',
  },
  {
    match: /\bia\b|inteligencia|automatiza|chatbot|bot/,
    reply:
      'Es uno de nuestros temas favoritos. Integramos IA para automatizar procesos, atender clientes (¡como yo!) y analizar datos. Cuéntame qué tarea te gustaría automatizar.',
  },
  {
    match: /humano|persona|asesor|hablar|contact|whatsapp|llamar|correo/,
    reply:
      'Claro, te pongo en contacto con el equipo. Escríbenos a equipo@mccore.com.co o deja tus datos en la sección de Contacto y te respondemos pronto.',
    action: { label: 'Ir a Contacto', href: '#contacto' },
  },
  {
    match: /hola|buenas|hey|saludos/,
    reply: 'Hola. Cuéntame qué tienes en mente y le damos forma juntos.',
  },
  {
    match: /gracias|genial|perfecto|excelente/,
    reply: '¡Con gusto! Aquí estaré si necesitas algo más. Construyamos lo que sigue.',
  },
]

const fallback = {
  reply:
    'Buena pregunta. Todavía estoy aprendiendo, pero el equipo de MCCore te puede responder con detalle. ¿Quieres dejarnos tus datos?',
  action: { label: 'Ir a Contacto', href: '#contacto' },
}

export async function askNovandra(text) {
  const normalized = text.toLowerCase()
  const rule = rules.find(r => r.match.test(normalized)) ?? fallback
  // Simula el tiempo de "pensar" de la IA
  await new Promise(resolve => setTimeout(resolve, 700 + Math.random() * 600))
  return { text: rule.reply, action: rule.action }
}
