// Motor de entendimiento de Novandra (local, sin IA externa).
// Entiende preguntas escritas de forma natural sobre MCCore, sus servicios, Stockly y soporte:
// normaliza el texto, tolera errores de ortografía, puntúa intenciones por palabras clave,
// usa el tema de la conversación para preguntas cortas ("¿y cuánto vale?") y, si duda, pregunta.
//
// Para agregar algo que Novandra deba saber: crea una intención en INTENTS con sus palabras
// clave (`keys`), frases típicas (`phrases`) y la respuesta (`reply`).

const CONTACTO = { label: 'Ir a Contacto', href: '#contacto' }
const STOCKLY = { label: 'Conocer Stockly', href: '#stockly' }
const PLANES = { label: 'Ver planes de Stockly', href: '#planes' }
const SERVICIOS = { label: 'Ver servicios', href: '#servicios' }
const APP = { label: 'Ir a appstockly.com', href: 'https://appstockly.com' }

// ===== Texto =====
export const normalize = text =>
  text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim()

const STOPWORDS = new Set(`a al algo alguna alguno algunos ante como con contra cual cuales de del desde donde el ella ellas ellos en entre era es esa ese eso esta estan este esto fue ha hay la las le les lo los me mi mis muy nos o otra otro para pero por porque pues que se si sin sobre su sus te ti tu tus un una uno unos y ya yo usted ustedes ustds uds q k xq pq osea pues entonces tambien`.split(' '))

// Raíz aproximada en español: quita terminaciones frecuentes para que "facturas", "facturar" y "factura" coincidan
function stem(word) {
  if (word.length <= 4) return word
  for (const suf of ['aciones', 'amiento', 'imiento', 'adoras', 'adores', 'ciones', 'mente', 'ables', 'ación', 'acion', 'adora', 'ador', 'ando', 'iendo', 'aron', 'ieron', 'ados', 'idas', 'idos', 'adas', 'able', 'ar', 'er', 'ir', 'es', 'as', 'os', 's', 'a', 'o', 'e'])
    if (word.endsWith(suf) && word.length - suf.length >= 4) return word.slice(0, -suf.length)
  return word
}

function distance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

// ¿La palabra del visitante coincide con la clave? (exacta, por raíz, por prefijo o con un error de tipeo)
function matches(token, key) {
  if (token === key) return 1
  const st = stem(token), sk = stem(key)
  if (st === sk) return 0.95
  if (key.length >= 5 && token.startsWith(key)) return 0.9
  if (sk.length >= 5 && st.startsWith(sk)) return 0.85
  const allowed = key.length >= 9 ? 2 : key.length >= 6 ? 1 : 0
  if (allowed && distance(token, key) <= allowed) return 0.8
  return 0
}

const tokenize = text => normalize(text).split(' ').filter(t => t && !STOPWORDS.has(t))

// ===== Conocimiento: intenciones =====
// keys: [palabra, peso]. phrases: frases (normalizadas) que suman fuerte si aparecen.
// topic: 'stockly' | 'servicios' | 'empresa' | 'soporte' | 'charla'.
// needs: palabras de las que al menos una debe aparecer (evita falsos positivos).
const INTENTS = [
  // --- Conversación ---
  { id: 'saludo', topic: 'charla', keys: [['hola', 2], ['buenas', 2], ['buenos', 1.5], ['saludos', 2], ['hey', 1.5], ['ola', 1.5], ['holi', 2]], max: 3,
    reply: 'Hola. Soy Novandra, de MCCore. Puedo contarte sobre nuestros servicios, Stockly o ayudarte con lo que necesites. ¿Qué tienes en mente?',
    options: ['¿Qué servicios ofrecen?', '¿Qué es Stockly?', 'Quiero cotizar un proyecto'] },
  { id: 'gracias', topic: 'charla', keys: [['gracias', 3], ['agradezco', 3], ['genial', 1.5], ['perfecto', 1.5], ['excelente', 1.5], ['listo', 1], ['vale', 1], ['ok', 1], ['chevere', 1.5], ['bacano', 1.5]], max: 4,
    reply: 'Con gusto. Si necesitas algo más, aquí estoy.' },
  { id: 'despedida', topic: 'charla', keys: [['adios', 3], ['chao', 3], ['bye', 3], ['luego', 1], ['hasta', 1]], phrases: ['hasta luego', 'nos vemos', 'que estes bien'], max: 4,
    reply: 'Gracias por pasar por MCCore. Que tengas un excelente día.' },
  { id: 'quien_eres', topic: 'charla', phrases: ['quien eres', 'que eres', 'eres un bot', 'eres humano', 'eres una ia', 'eres real', 'con quien hablo'],
    reply: 'Soy Novandra, la asistente virtual de MCCore. Respondo dudas sobre la empresa, nuestros servicios y Stockly. Si prefieres hablar con una persona, el equipo te responde por el formulario de contacto.', action: CONTACTO },

  // --- Empresa ---
  { id: 'empresa', topic: 'empresa', keys: [['mccore', 2], ['empresa', 1.5], ['ustedes', 1], ['quienes', 2], ['dedican', 2.5], ['nosotros', 1.5], ['equipo', 1]], phrases: ['quienes son', 'a que se dedican', 'que es mccore', 'que hacen ustedes', 'que es esta empresa'],
    reply: 'MCCore es una empresa de ingeniería de software del Quindío, Colombia. Diseñamos y desarrollamos software a la medida, apps e inteligencia artificial para empresas. Y creamos Stockly, nuestro software de inventario y ventas.', action: SERVICIOS },
  { id: 'ubicacion', topic: 'empresa', keys: [['ubicacion', 3], ['ubicados', 3], ['donde', 1.5], ['direccion', 3], ['ciudad', 2], ['quindio', 2], ['armenia', 2], ['oficina', 2.5], ['sede', 1], ['colombia', 1]], phrases: ['donde estan', 'donde quedan', 'de donde son'],
    reply: 'Estamos en el Quindío, Colombia, y trabajamos con empresas de todo el país de forma remota. Si quieres reunirte con nosotros, escríbenos y lo coordinamos.', action: CONTACTO },
  { id: 'contacto', topic: 'soporte', keys: [['contacto', 3], ['contactar', 3], ['correo', 2.5], ['email', 2.5], ['mail', 2], ['telefono', 3], ['celular', 1], ['llamar', 3], ['whatsapp', 3], ['numero', 2], ['asesor', 3], ['humano', 3], ['persona', 2], ['hablar', 2], ['comunicar', 2.5], ['escribir', 1.5], ['agente', 2]], phrases: ['hablar con alguien', 'hablar con una persona', 'como los contacto', 'como me comunico', 'quiero que me llamen'],
    reply: 'Puedes escribirnos a equipo@mccore.com.co o dejar tu mensaje en el formulario de contacto, y te respondemos pronto. Por ahora no tenemos WhatsApp ni línea telefónica.', action: CONTACTO },
  { id: 'horario', topic: 'empresa', keys: [['horario', 3], ['hora', 1.5], ['atienden', 2.5], ['abierto', 2], ['sabado', 2], ['domingo', 2], ['festivo', 2]], phrases: ['a que hora', 'en que horario'],
    reply: 'Respondemos los mensajes en horario laboral, de lunes a viernes. Si nos escribes fuera de ese horario, te contestamos el siguiente día hábil.', action: CONTACTO },

  // --- Servicios ---
  { id: 'servicios', topic: 'servicios', keys: [['servicios', 3], ['servicio', 2.5], ['ofrecen', 2.5], ['hacen', 1.5], ['ayudar', 1], ['soluciones', 2], ['desarrollo', 1.5], ['desarrollan', 2], ['programacion', 2], ['software', 1]], phrases: ['que servicios', 'que ofrecen', 'que hacen', 'en que me pueden ayudar', 'que tipo de proyectos'],
    reply: 'Hacemos desarrollo web, apps móviles para iOS y Android, software a la medida (ERP, CRM, inventarios), automatización con IA, cloud y diseño UX/UI. ¿Cuál se acerca más a lo que necesitas?',
    options: ['Una página web o tienda', 'Una app móvil', 'Software para mi empresa', 'Automatizar con IA'] },
  { id: 'web', topic: 'servicios', keys: [['web', 2.5], ['pagina', 2.5], ['sitio', 2.5], ['landing', 3], ['tienda', 2], ['ecommerce', 3], ['online', 1.5], ['linea', 1], ['catalogo', 1.5], ['dominio', 1.5], ['portal', 2], ['blog', 2]], phrases: ['pagina web', 'sitio web', 'tienda en linea', 'tienda online', 'vender por internet', 'vender en linea'],
    reply: 'Hacemos sitios web y tiendas en línea a la medida de tu marca: rápidos, adaptados al celular y pensados para vender. Cuéntanos qué quieres lograr y te enviamos una propuesta sin compromiso.', action: CONTACTO },
  { id: 'app', topic: 'servicios', keys: [['app', 3], ['apps', 3], ['aplicacion', 3], ['aplicativo', 3], ['android', 3], ['ios', 3], ['iphone', 3], ['movil', 2.5], ['play', 1.5], ['store', 1.5]], phrases: ['app movil', 'aplicacion movil', 'aplicacion para celular', 'una app'],
    reply: 'Creamos apps para iOS y Android, conectadas con los sistemas que ya usas y fáciles desde el primer toque. ¿Tienes clara la idea? Escríbenos y la aterrizamos juntos.', action: CONTACTO },
  { id: 'software', topic: 'servicios', keys: [['erp', 3], ['crm', 3], ['sistema', 2], ['plataforma', 2], ['medida', 2], ['personalizado', 2.5], ['automatizar', 1], ['procesos', 1.5], ['nomina', 2], ['citas', 2], ['reservas', 2], ['agenda', 1.5], ['gestion', 1.5], ['administrativo', 2]], phrases: ['software a la medida', 'software a medida', 'sistema para mi empresa', 'software para mi empresa', 'un sistema'],
    reply: 'Desarrollamos software a la medida: ERP, CRM, inventarios, agendamiento y cualquier sistema que tu operación necesite, pensado para tu forma de trabajar. Cuéntanos el proceso que quieres mejorar.', action: CONTACTO },
  { id: 'ia', topic: 'servicios', keys: [['ia', 3], ['inteligencia', 2.5], ['artificial', 2.5], ['automatizacion', 3], ['automatizar', 2.5], ['chatbot', 3], ['bot', 2.5], ['asistente', 2], ['gpt', 2.5], ['chatgpt', 2.5], ['machine', 2], ['datos', 1]], phrases: ['inteligencia artificial', 'automatizar procesos', 'un chatbot'],
    reply: 'Integramos inteligencia artificial para automatizar tareas repetitivas, atender clientes con asistentes como yo y analizar datos. ¿Qué tarea te gustaría automatizar?', action: CONTACTO },
  { id: 'cloud', topic: 'servicios', keys: [['cloud', 3], ['nube', 3], ['servidor', 2.5], ['servidores', 2.5], ['hosting', 3], ['devops', 3], ['aws', 3], ['migrar', 2], ['infraestructura', 3], ['mantenimiento', 2]],
    reply: 'Nos encargamos de la infraestructura en la nube: hosting, servidores, despliegues y monitoreo, para que tu sistema esté estable, seguro y siempre disponible.', action: CONTACTO },
  { id: 'diseno', topic: 'servicios', keys: [['diseno', 3], ['ux', 3], ['ui', 3], ['interfaz', 3], ['prototipo', 3], ['figma', 3], ['experiencia', 1.5], ['marca', 1], ['logo', 1.5]],
    reply: 'Diseñamos interfaces claras y fáciles de usar, desde el prototipo hasta el diseño final. Si además necesitas el desarrollo, lo hacemos todo bajo un mismo techo.', action: CONTACTO },
  { id: 'cotizar', topic: 'servicios', keys: [['cotizar', 3], ['cotizacion', 3], ['presupuesto', 3], ['propuesta', 2.5], ['precio', 1.5], ['cuesta', 1.5], ['costo', 1.5], ['vale', 1], ['cobran', 2], ['tarifa', 2], ['inversion', 2]], phrases: ['cuanto cobran', 'cuanto me cuesta', 'cuanto vale un', 'cuanto cuesta una', 'cuanto cuesta un', 'quiero cotizar'],
    reply: 'Cada proyecto es distinto, así que cotizamos según lo que necesites. Cuéntanos tu idea en el formulario de contacto y te enviamos una propuesta clara, con alcance y tiempos, sin compromiso.', action: CONTACTO },
  { id: 'proceso', topic: 'servicios', keys: [['proceso', 3], ['pasos', 2.5], ['metodologia', 3], ['trabajan', 2.5], ['funciona', 1], ['empezar', 1.5], ['iniciar', 1.5], ['arrancar', 1.5]], phrases: ['como trabajan', 'como es el proceso', 'como empezamos', 'que sigue'],
    reply: 'Es simple: 1) nos cuentas tu idea, 2) te enviamos una propuesta clara con alcance y tiempos, 3) construimos contigo por etapas, mostrándote avances.', action: CONTACTO },
  { id: 'tiempos', topic: 'servicios', keys: [['tiempo', 2.5], ['tiempos', 2.5], ['demora', 3], ['demoran', 3], ['tarda', 3], ['tardan', 3], ['semanas', 2], ['meses', 1.5], ['rapido', 1.5], ['entrega', 2], ['plazo', 3]], phrases: ['cuanto se demoran', 'cuanto tiempo', 'para cuando'],
    reply: 'Depende del alcance del proyecto. En la propuesta te damos los tiempos claros desde el inicio, y trabajamos por etapas para que veas avances pronto.', action: CONTACTO },

  // --- Stockly ---
  { id: 'stockly', topic: 'stockly', keys: [['stockly', 4], ['inventario', 2], ['inventarios', 2], ['cuaderno', 3], ['libreta', 3], ['mercancia', 2], ['negocio', 1], ['controlar', 1.5], ['control', 1.5], ['tienda', 1], ['ropa', 1], ['minimercado', 2], ['ferreteria', 2], ['papeleria', 2], ['drogueria', 2]], phrases: ['que es stockly', 'para que sirve', 'que hace stockly', 'su producto', 'el software de inventario', 'llevo todo en', 'en un cuaderno', 'a mano', 'me sirve'],
    reply: 'Stockly es nuestro software en la nube para manejar inventario, ventas y facturas en un solo lugar. Funciona en computador, tablet y celular, y tiene un plan gratis para empezar.', action: STOCKLY },
  { id: 'stockly_precio', topic: 'stockly', keys: [['planes', 3], ['plan', 2.5], ['precio', 2], ['precios', 2.5], ['cuesta', 2], ['vale', 1.5], ['costo', 2], ['mensualidad', 3], ['pagar', 1.5], ['cobro', 1.5], ['suscripcion', 3], ['cuanto', 1], ['stockly', 1.5]], needs: ['stockly', 'plan', 'planes', 'mensualidad', 'suscripcion'], contextual: true,
    reply: 'Stockly tiene tres planes: Básico gratis, Pro a $69.900 al mes y Enterprise a $189.900 al mes. El pago anual trae 2 meses gratis y tu primera compra de Pro o Enterprise tiene 50% de descuento.', action: PLANES },
  { id: 'plan_basico', boost: 4, topic: 'stockly', keys: [['basico', 3], ['gratis', 2], ['gratuito', 2.5], ['free', 2.5]], needs: ['basico', 'gratis', 'gratuito', 'free'],
    reply: 'El plan Básico es gratis y no pide tarjeta: incluye 1.000 productos, 300 ventas al mes, 1 bodega, 2 usuarios, Novandra esencial y factura en PDF.', action: APP },
  { id: 'plan_pro', boost: 4, topic: 'stockly', keys: [['pro', 3]], needs: ['pro'],
    reply: 'El plan Pro cuesta $69.900 al mes o $699.000 al año. Incluye 5.000 productos, 5.000 ventas al mes, 5 bodegas y 3 sedes, 5 usuarios, inteligencia, auditoría e informe al contador.', action: PLANES },
  { id: 'plan_enterprise', boost: 4, topic: 'stockly', keys: [['enterprise', 3], ['empresarial', 2.5], ['grande', 1]], needs: ['enterprise', 'empresarial'],
    reply: 'El plan Enterprise cuesta $189.900 al mes o $1.899.000 al año: 50.000 productos, 30.000 ventas al mes, 30 bodegas y 15 sedes y 20 usuarios. Puedes probarlo 7 días gratis.', action: PLANES },
  { id: 'anual', boost: 4, topic: 'stockly', keys: [['anual', 3], ['ano', 2], ['anualidad', 3], ['año', 2]], needs: ['anual', 'ano', 'anualidad', 'año'],
    reply: 'Pagando el año te ahorras 2 meses: Pro queda en $699.000 al año y Enterprise en $1.899.000 al año.', action: PLANES },
  { id: 'descuento', topic: 'stockly', keys: [['descuento', 3], ['promocion', 3], ['promo', 3], ['oferta', 3], ['rebaja', 3], ['cupon', 3], ['codigo', 2]],
    reply: 'Tenemos dos beneficios: 1 mes de Stockly Pro gratis (solo 20 cupos, dejando tu correo en la sección de Stockly) y 50% de descuento en tu primera compra de Pro o Enterprise.', action: STOCKLY },
  { id: 'prueba', topic: 'stockly', keys: [['probar', 3], ['prueba', 3], ['trial', 3], ['testear', 2.5], ['mes', 1]], phrases: ['mes gratis', 'puedo probar', 'periodo de prueba', 'version de prueba'],
    reply: 'Puedes empezar gratis con el plan Básico, probar Enterprise 7 días sin costo o pedir 1 mes de Pro gratis dejando tu correo en la sección de Stockly. Si prefieres que te lo mostremos, pide una demo en contacto.', action: STOCKLY },
  { id: 'demo', topic: 'stockly', keys: [['demo', 4], ['demostracion', 4], ['mostrar', 2], ['muestren', 2.5], ['videollamada', 3], ['reunion', 2.5], ['presentacion', 2.5]], phrases: ['pedir una demo', 'quiero una demo', 'me lo muestran'],
    reply: 'Con gusto. En el formulario de contacto elige "Demo de Stockly": te llega al instante la información y el acceso para probarlo, y si quieres te lo mostramos en una videollamada.', action: CONTACTO },
  { id: 'codigo_no_llega', boost: 4, topic: 'soporte', keys: [['llega', 2.5], ['llego', 2.5], ['recibi', 2.5], ['codigo', 2], ['correo', 1], ['spam', 2.5]], needs: ['llega', 'llego', 'recibi', 'spam'], phrases: ['no me llego', 'no me ha llegado', 'no recibi', 'no llega el codigo'],
    reply: 'Revisa tu bandeja de Promociones y Spam, y busca "MCCORE-PRO30". Si aún no aparece, vuelve a pedirlo con el mismo correo en la sección de Stockly o escríbenos a equipo@mccore.com.co.', action: STOCKLY },
  { id: 'como_canjear', boost: 4, topic: 'soporte', keys: [['canjear', 3], ['activar', 3], ['usar', 1], ['codigo', 2], ['promocional', 3]], needs: ['canjear', 'activar', 'promocional', 'codigo'], phrases: ['como uso el codigo', 'donde pongo el codigo', 'como activo'],
    reply: 'Entra a appstockly.com y crea tu empresa. En el último paso toca "¿Tienes un código promocional?" y escribe tu código. Listo: tendrás Pro activo por 30 días.', action: APP },
  { id: 'tarjeta', boost: 4, topic: 'stockly', keys: [['tarjeta', 3], ['credito', 1.5]], needs: ['tarjeta'],
    reply: 'No necesitas tarjeta para empezar: el plan Básico es gratis. Solo la prueba de Enterprise pide registrar un medio de pago para validarlo, sin cobrar nada.' },
  { id: 'cobros', topic: 'stockly', keys: [['automatico', 3], ['automaticos', 3], ['renueva', 3], ['renovacion', 3], ['cancelar', 2.5], ['cancelo', 2.5]], phrases: ['me cobra solo', 'cobro automatico', 'se renueva'],
    reply: 'Stockly no hace cobros automáticos. Antes de que venza tu plan te avisamos y tú decides si renuevas.' },
  { id: 'datos', topic: 'stockly', keys: [['datos', 2], ['informacion', 1.5], ['pierdo', 3], ['borra', 3], ['borran', 3], ['dejo', 1.5]], phrases: ['si dejo de pagar', 'pierdo mis datos', 'se borra', 'que pasa con mis datos'],
    reply: 'Si dejas de pagar, pasas al plan Básico gratis y conservas toda tu información. Cambiar de plan nunca borra datos.' },
  { id: 'iva', topic: 'stockly', keys: [['iva', 3], ['impuestos', 3], ['impuesto', 3], ['adicionales', 2]],
    reply: 'Los precios publicados de Stockly son finales: no hay cargos adicionales.' },
  { id: 'pago', topic: 'stockly', keys: [['pago', 1.5], ['pagar', 1.5], ['pse', 3], ['nequi', 3], ['wompi', 3], ['bancolombia', 3], ['transferencia', 2], ['efectivo', 2], ['medios', 2]], phrases: ['como pago', 'medios de pago', 'formas de pago'],
    reply: 'Pagas tu plan de Stockly con Wompi: tarjeta, PSE, Nequi o Botón Bancolombia, y recibes el comprobante por correo. Y dentro de Stockly tus clientes te pueden pagar en efectivo, tarjeta, Bre-B, transferencia o link de pago.' },
  { id: 'dispositivos', topic: 'stockly', keys: [['celular', 2.5], ['movil', 2], ['tablet', 3], ['computador', 2.5], ['instalar', 3], ['descargar', 2.5], ['navegador', 3], ['internet', 2.5], ['conexion', 2.5], ['offline', 3]], needs: ['celular', 'tablet', 'computador', 'instalar', 'descargar', 'navegador', 'offline', 'movil', 'internet', 'conexion'], contextual: true,
    reply: 'Stockly funciona en el navegador del computador, la tablet y el celular, sin instalar nada. Como está en la nube, necesita conexión a internet.' },
  { id: 'excel', topic: 'stockly', keys: [['excel', 3], ['masiva', 3], ['importar', 3], ['subir', 2], ['cargar', 2], ['plantilla', 2.5], ['exportar', 2.5]],
    reply: 'Sí: descargas la plantilla de Excel, la llenas y la subes, y Stockly organiza todo tu catálogo en minutos. También puedes descargar tus datos en Excel cuando quieras.' },
  { id: 'dian', topic: 'stockly', keys: [['dian', 3], ['electronica', 3], ['facturacion', 2], ['legal', 1.5]], phrases: ['factura electronica', 'facturacion electronica'],
    reply: 'La factura electrónica DIAN llegará próximamente en los planes Pro y Enterprise. Hoy Stockly genera facturas en PDF con tu logo, listas para enviar por WhatsApp.' },
  { id: 'ventas', topic: 'stockly', keys: [['vender', 2], ['ventas', 2], ['caja', 2.5], ['pos', 3], ['factura', 2], ['facturas', 2], ['credito', 1.5], ['ticket', 2]], contextual: true,
    reply: 'Con Stockly vendes rápido desde la caja: buscas el producto, cobras con cualquier medio de pago, incluso mixto o a crédito, y envías la factura en PDF por WhatsApp.', action: STOCKLY },
  { id: 'inventario', topic: 'stockly', keys: [['bodega', 3], ['bodegas', 3], ['kardex', 3], ['stock', 2.5], ['existencias', 3], ['traslados', 3], ['barras', 2.5], ['sucursal', 2.5], ['sucursales', 2.5], ['agotado', 2.5], ['minimo', 2]], contextual: true,
    reply: 'Stockly lleva tu inventario al día: varias bodegas y sedes, traslados, kardex automático, código de barras y alertas cuando un producto llega a su mínimo.', action: STOCKLY },
  { id: 'compras', topic: 'stockly', keys: [['compras', 3], ['proveedor', 3], ['proveedores', 3], ['orden', 2], ['ordenes', 2], ['clientes', 1.5]],
    reply: 'En Stockly creas órdenes de compra y, al recibir la mercancía, el stock se suma solo. También guardas la factura del proveedor y tienes tu directorio de proveedores y clientes.', action: STOCKLY },
  { id: 'reportes', topic: 'stockly', keys: [['reportes', 3], ['reporte', 3], ['estadisticas', 3], ['rotacion', 3], ['analisis', 2.5], ['cobertura', 3], ['informes', 2], ['graficas', 2.5]],
    reply: 'Stockly te muestra la rotación de cada producto, cuántos días te alcanza el stock, tus más vendidos y cómo se mueve cada sede, con reportes listos.', action: STOCKLY },
  { id: 'contador', topic: 'stockly', keys: [['contador', 3], ['contable', 3], ['contabilidad', 3]],
    reply: 'Eliges el periodo y Stockly le envía a tu contador un informe general o detallado en Excel, con las facturas de tus proveedores, en un clic. Está en Pro (15 envíos al mes) y Enterprise (60).', action: PLANES },
  { id: 'novandra_stockly', boost: 4, topic: 'stockly', keys: [['novandra', 2.5], ['asistente', 1.5], ['agente', 1.5]], needs: ['novandra'],
    reply: 'Dentro de Stockly, Novandra responde cuánto vendiste, qué se está agotando o cuál es tu producto estrella, y prepara borradores de órdenes de compra que tú confirmas. Novandra Max, el agente completo, llegará pronto en Pro y Enterprise.', action: STOCKLY },
  { id: 'usuarios', topic: 'stockly', keys: [['usuarios', 3], ['usuario', 2], ['empleados', 3], ['permisos', 3], ['roles', 3], ['equipo', 1.5], ['vendedores', 2.5]],
    reply: 'Cada persona entra con su propio correo y tú eliges qué puede ver y hacer: dueño, administrador o empleado. Hay auditoría de quién cambió qué. Básico incluye 2 usuarios, Pro 5 y Enterprise 20.', action: PLANES },
  { id: 'seguridad', topic: 'stockly', keys: [['seguridad', 3], ['seguro', 2.5], ['segura', 2.5], ['respaldo', 3], ['backup', 3], ['privacidad', 3], ['hackeo', 2.5]],
    reply: 'Tus datos están aislados por empresa, los pagos van por Wompi (Stockly no guarda tarjetas) y borrar datos exige el nombre de tu empresa y un código en tu correo.' },

  // --- Soporte de Stockly ---
  { id: 'soporte', topic: 'soporte', keys: [['problema', 3], ['error', 3], ['falla', 3], ['funciona', 1.5], ['ayuda', 1.5], ['soporte', 3], ['bug', 3], ['contrasena', 3], ['clave', 2], ['entrar', 2], ['ingresar', 2], ['login', 3], ['acceso', 2], ['bloqueado', 3], ['olvide', 3]], phrases: ['no puedo entrar', 'no funciona', 'tengo un problema', 'olvide mi contrasena', 'no me deja'],
    reply: 'Siento el inconveniente. Si es de Stockly, en la app tienes el Centro de ayuda y el formulario de soporte, y en el inicio de sesión puedes recuperar tu contraseña. Si no se resuelve, escríbenos a equipo@mccore.com.co con lo que ves y te ayudamos.', action: CONTACTO },
]

// Temas que no son de la empresa: responder con amabilidad y reenfocar
const OFF_TOPIC = ['tarea', 'chiste', 'clima', 'futbol', 'receta', 'poema', 'historia', 'politica', 'pelicula', 'cancion', 'traduce', 'traducir', 'matematicas', 'ecuacion', 'novia', 'novio', 'horoscopo', 'noticias']

const GENERIC_PRICE = new Set(['precio', 'precios', 'cuesta', 'vale', 'costo', 'cuanto', 'valor', 'cobran', 'pagar'])

// ===== Motor =====
function scoreIntent(intent, tokens, norm) {
  let score = 0
  const hits = new Set()
  // Cada palabra del visitante cuenta una sola vez (con su mejor coincidencia), así sinónimos no se suman de más
  for (const t of tokens) {
    let best = 0, bestKey = null
    for (const [key, weight] of intent.keys ?? []) {
      const m = matches(t, key) * weight
      if (m > best) { best = m; bestKey = key }
    }
    if (best) { score += best; hits.add(bestKey) }
  }
  for (const phrase of intent.phrases ?? []) if (norm.includes(phrase)) score += 4
  // "needs": exige la palabra (tolera errores solo en palabras largas) y, si está, la intención es muy específica
  if (intent.needs) {
    if (!intent.needs.some(n => tokens.some(t => matches(t, n) >= 0.8))) return { score: 0, hits }
    score += intent.boost ?? 0
  }
  if (intent.max) score = Math.min(score, intent.max)
  return { score, hits }
}

export function understand(text, context = {}) {
  const norm = normalize(text)
  const tokens = tokenize(text)
  if (!norm) return { intents: [], tokens }

  const scored = INTENTS
    .map(intent => ({ intent, ...scoreIntent(intent, tokens, norm) }))
    .filter(s => s.score > 0)

  // El tema de la conversación ayuda con preguntas cortas ("¿y cuánto vale?", "¿y en el celular?")
  for (const s of scored) {
    if (context.topic && s.intent.topic === context.topic) s.score += s.intent.contextual ? 1.5 : 0.6
  }

  // "¿Cuánto cuesta?" sin decir qué: decide por el tema de la conversación
  const onlyPrice = tokens.length <= 4 && tokens.some(t => GENERIC_PRICE.has(t))
  if (onlyPrice && !scored.some(s => ['stockly_precio', 'plan_pro', 'plan_basico', 'plan_enterprise', 'anual'].includes(s.intent.id) && s.score >= 3)) {
    const target = context.topic === 'stockly' ? 'stockly_precio' : context.topic === 'servicios' ? 'cotizar' : null
    if (target) {
      const found = scored.find(s => s.intent.id === target)
      if (found) found.score += 3
      else scored.push({ intent: INTENTS.find(i => i.id === target), score: 3.5, hits: new Set() })
    }
  }

  // Si hay una pregunta concreta de Stockly, la descripción general de Stockly pasa a segundo plano
  if (scored.some(s => s.intent.topic === 'stockly' && s.intent.id !== 'stockly' && s.score >= 3)) {
    const general = scored.find(s => s.intent.id === 'stockly')
    if (general) general.score -= 2.5
  }

  scored.sort((a, b) => b.score - a.score)
  return { intents: scored, tokens, norm }
}

// Devuelve { text, action?, options?, topic }
export function answer(text, context = {}) {
  const { intents, tokens, norm } = understand(text, context)
  const top = intents[0]

  const offTopic = tokens.some(t => OFF_TOPIC.some(o => matches(t, o) >= 0.85))
  if (!top || top.score < 2 || (offTopic && top.score < 5)) {
    if (offTopic) {
      return { text: 'Eso se sale de lo que sé. Soy la asistente de MCCore: te ayudo con nuestros servicios, Stockly o cualquier duda sobre la empresa.', options: ['¿Qué servicios ofrecen?', '¿Qué es Stockly?'], topic: context.topic }
    }
    if (norm && norm.split(' ').length <= 2 && context.topic) {
      return { text: '¿Me cuentas un poco más? Así te doy una respuesta precisa.', topic: context.topic }
    }
    return {
      text: 'Quiero darte la respuesta correcta. ¿Tu pregunta es sobre alguno de estos temas?',
      options: ['Servicios de MCCore', 'Stockly y sus planes', 'Cotizar un proyecto', 'Hablar con el equipo'],
      topic: context.topic,
    }
  }

  // Dos temas fuertes y distintos en la misma pregunta: responde ambos
  const second = intents.find(s => s !== top && s.score >= 3 && s.intent.topic !== 'charla' && s.intent.id !== 'stockly' && s.intent.id !== top.intent.id)
  const combine = second && top.intent.topic !== 'charla' && second.score >= top.score * 0.5 &&
    ![...second.hits].every(h => top.hits.has(h))

  // Saludo + pregunta: responde la pregunta
  if (top.intent.topic === 'charla' && second && second.score >= 2.5) {
    const i = second.intent
    return { text: i.reply, action: i.action, options: i.options, topic: i.topic }
  }

  if (combine) {
    return {
      text: `${top.intent.reply}\n\n${second.intent.reply}`,
      action: top.intent.action ?? second.intent.action,
      topic: top.intent.topic,
    }
  }

  const i = top.intent
  return { text: i.reply, action: i.action, options: i.options, topic: i.topic === 'charla' ? context.topic : i.topic }
}

// Para pruebas
export const _intents = INTENTS
