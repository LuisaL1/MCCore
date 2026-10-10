// Correos automáticos para quien llena el formulario de Contacto.
// - "Demo de Stockly": información del producto y acceso para probarlo.
// - Cualquier otro servicio: confirmación de que recibimos su mensaje.
// Por seguridad NO repiten el texto del mensaje (evita usar el formulario para enviar spam a terceros).

const LOGO = 'https://csiwkliqxivjkvogkfdi.supabase.co/storage/v1/object/public/marca/logo-correo.png'
const APP = 'https://appstockly.com'
const SITE = 'https://www.mccore.com.co'

export const escape = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// Estructura común: fondo hueso, tarjeta blanca, solo tablas y estilos en línea (Gmail/Outlook)
function layout(preheader: string, brand: string, body: string) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F4F1EC;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#F4F1EC;opacity:0;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4F1EC;"><tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
<tr><td style="background-color:#FFFFFF;border:1px solid #E7E2DA;border-radius:20px;padding:32px 32px 28px 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${brand}
${body}
<tr><td style="border-top:1px solid #E7E2DA;padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#6B6472;">
Este es un correo automático, por favor no lo respondas. ¿Dudas? Escríbenos a <a href="mailto:equipo@mccore.com.co" style="color:#8800B3;text-decoration:underline;">equipo@mccore.com.co</a>.
</td></tr>
</table></td></tr>
<tr><td align="center" style="padding:20px 16px 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6B6472;">MCCore · Quindío, Colombia · <a href="${SITE}" style="color:#6B6472;text-decoration:underline;">mccore.com.co</a></td></tr>
</table></td></tr></table></body></html>`
}

const p = (html: string, pad = 14) =>
  `<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#17131D;padding-bottom:${pad}px;">${html}</td></tr>`
const h1 = (text: string) =>
  `<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:30px;font-weight:bold;color:#17131D;padding-bottom:16px;">${text}</td></tr>`
const button = (href: string, label: string, dark = false) =>
  `<a href="${href}" target="_blank" style="display:inline-block;background-color:${dark ? '#17131D' : '#8800B3'};color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:46px;font-weight:bold;text-decoration:none;border-radius:999px;padding:0 26px;margin:0 6px 8px 0;">${label}</a>`

const stocklyBrand = `<tr><td style="padding-bottom:26px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:10px;"><img src="${LOGO}" width="36" height="36" alt="Stockly" style="display:block;width:36px;height:36px;border:0;"></td>
<td valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:24px;font-weight:bold;color:#17131D;">Stockly</td>
</tr></table></td></tr>`

const mccoreBrand = `<tr><td style="padding-bottom:26px;font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:26px;font-weight:bold;">
<span style="color:#8800B3;">M</span><span style="color:#A6A6A6;">C</span><span style="color:#17131D;">Core</span></td></tr>`

// ===== Demo de Stockly =====
const features: [string, string][] = [
  ['Vende rápido', 'Caja ágil, todos los medios de pago y factura en PDF con tu logo.'],
  ['Inventario al día', 'Varias bodegas, kardex automático y alertas de stock bajo.'],
  ['Compras y clientes', 'Órdenes de compra, proveedores y clientes organizados.'],
  ['Novandra, tu asistente', 'Pregúntale cuánto vendiste o qué reabastecer.'],
]

export function demoEmail(nombre: string) {
  const first = escape(nombre.split(' ')[0] || nombre)
  const list = features.map(([t, d]) => `<tr>
<td width="26" valign="top" style="padding:2px 0 12px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="22" height="22" align="center" valign="middle" style="width:22px;height:22px;background-color:#F2E7F8;border-radius:11px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;color:#8800B3;">✓</td></tr></table></td>
<td valign="top" style="padding:0 0 12px 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#17131D;"><strong>${t}.</strong> <span style="color:#6B6472;">${d}</span></td></tr>`).join('')

  const html = layout(
    'Crea tu empresa gratis en Stockly o prueba Enterprise 7 días.',
    stocklyBrand,
    `${h1(`Hola ${first}, esta es tu demo de Stockly`)}
${p('Gracias por tu interés. Stockly es el software en la nube para manejar tu <strong>inventario, ventas y facturas</strong> en un solo lugar, desde el computador, la tablet o el celular.')}
<tr><td style="padding:4px 0 10px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${list}</table></td></tr>
${p('<strong>La mejor demo es probarlo con tus propios productos:</strong>', 10)}
<tr><td style="padding-bottom:18px;">${button(APP, 'Crear mi empresa gratis')}${button(APP, 'Probar Enterprise 7 días', true)}</td></tr>
<tr><td style="padding-bottom:22px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:#F2E7F8;border-radius:14px;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#17131D;">
<strong>Planes:</strong> Básico gratis · Pro $69.900/mes · Enterprise $189.900/mes.<br>
Tu primera compra de Pro o Enterprise tiene <strong style="color:#8800B3;">50% de descuento</strong>. Sin cobros automáticos.
</td></tr></table></td></tr>
${p('¿Prefieres que te mostremos Stockly en una videollamada? Escríbenos a <a href="mailto:equipo@mccore.com.co" style="color:#8800B3;">equipo@mccore.com.co</a> y agendamos tu demo guiada.', 20)}`,
  )

  const text = `Hola ${nombre.split(' ')[0] || nombre}, esta es tu demo de Stockly

Gracias por tu interés. Stockly es el software en la nube para manejar tu inventario, ventas y facturas en un solo lugar.

${features.map(([t, d]) => `- ${t}: ${d}`).join('\n')}

Pruébalo con tus propios productos:
- Crea tu empresa gratis: ${APP}
- O prueba Enterprise 7 días: ${APP}

Planes: Básico gratis · Pro $69.900/mes · Enterprise $189.900/mes. Tu primera compra de Pro o Enterprise tiene 50% de descuento.

¿Quieres una demo guiada por videollamada? Escríbenos a equipo@mccore.com.co.

Este es un correo automático, por favor no lo respondas.
Equipo MCCore`

  return { subject: 'Tu demo de Stockly', html, text }
}

// ===== Confirmación general =====
export function receivedEmail(nombre: string, servicio: string) {
  const first = escape(nombre.split(' ')[0] || nombre)
  const about = servicio ? ` sobre <strong>${escape(servicio.toLowerCase())}</strong>` : ''
  const html = layout(
    'Recibimos tu mensaje. Te escribimos con una propuesta muy pronto.',
    mccoreBrand,
    `${h1(`¡Gracias, ${first}! Recibimos tu mensaje`)}
${p(`Ya tenemos tu mensaje${about}. Lo revisamos y te escribimos pronto con una propuesta inicial, sin compromiso.`)}
<tr><td style="padding:4px 0 22px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="background-color:#F2E7F8;border-radius:14px;padding:16px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#17131D;">
<strong>Lo que sigue:</strong><br>1. Revisamos tu idea.<br>2. Te enviamos la propuesta.<br>3. Construimos contigo.
</td></tr></table></td></tr>
<tr><td style="padding-bottom:22px;">${button(SITE, 'Visitar mccore.com.co')}</td></tr>`,
  )
  const text = `¡Gracias, ${nombre.split(' ')[0] || nombre}! Recibimos tu mensaje${servicio ? ` sobre ${servicio.toLowerCase()}` : ''}.

Lo revisamos y te escribimos pronto con una propuesta inicial, sin compromiso.

Lo que sigue:
1. Revisamos tu idea.
2. Te enviamos la propuesta.
3. Construimos contigo.

Este es un correo automático, por favor no lo respondas. ¿Dudas? Escríbenos a equipo@mccore.com.co.
Equipo MCCore`
  return { subject: 'Recibimos tu mensaje', html, text }
}
