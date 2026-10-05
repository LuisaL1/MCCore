// Información oficial de Stockly (fuente: documentación del producto).
// Edita aquí los textos, módulos, planes y preguntas: la página se actualiza sola.

export const APP_URL = 'https://appstockly.com'

// ===== Módulos (pestañas de "Todo lo que hace Stockly") =====
export const modules = [
  {
    id: 'ventas',
    icon: 'bi-cart3',
    tab: 'Ventas',
    title: 'Vende rápido desde la caja',
    lead: 'Un punto de venta pensado para atender sin filas.',
    items: [
      ['Caja ágil', 'Busca, agrega al ticket y cobra en segundos.'],
      ['Todos los medios de pago', 'Efectivo con cambio, tarjeta, Bre-B y transferencia.'],
      ['Pago mixto', 'Parte en efectivo y parte con tarjeta o link.'],
      ['Link de pago con Wompi', 'Tarjeta, PSE o Nequi; la factura se marca pagada sola.'],
      ['Ventas a crédito', 'Registra el saldo y cóbralo después.'],
      ['Factura en PDF con tu logo', 'Descárgala o envíala por WhatsApp con el link de pago.'],
      ['Anula sin enredos', 'Anulas la venta y el inventario vuelve a la bodega.'],
      ['Historial de facturas', 'Busca por número, cliente o documento.'],
    ],
  },
  {
    id: 'inventario',
    icon: 'bi-box-seam',
    tab: 'Inventario',
    title: 'Inventario siempre al día',
    lead: 'Sabe qué tienes, dónde está y cuándo se te va a acabar.',
    items: [
      ['Productos completos', 'Precios, códigos, código de barras, categoría, marca y mínimo.'],
      ['Varias bodegas y sedes', 'Stock separado por tienda, bodega o tienda online.'],
      ['Traslados entre bodegas', 'Mueves mercancía y ambas se actualizan.'],
      ['Kardex automático', 'Cada movimiento con fecha, motivo y responsable.'],
      ['Alertas de stock bajo', 'Te avisamos cuando un producto llega a su mínimo.'],
      ['Reportes listos', 'Stock, bajo mínimo, entradas, salidas e inventario valorado.'],
      ['Carga masiva con Excel', 'Sube todo tu catálogo en minutos con la plantilla.'],
      ['Tus datos son tuyos', 'Descarga una copia en Excel cuando quieras.'],
    ],
  },
  {
    id: 'compras',
    icon: 'bi-truck',
    tab: 'Compras',
    title: 'Compras, proveedores y clientes',
    lead: 'Todo lo que entra y todos con quienes trabajas, organizados.',
    items: [
      ['Órdenes de compra', 'Al recibir la mercancía, el stock se suma solo.'],
      ['Factura del proveedor adjunta', 'PDF, imagen o XML de la factura electrónica en cada compra.'],
      ['Directorio de proveedores', 'Contacto e historial de compras.'],
      ['Base de clientes', 'Factura y envía por WhatsApp sin escribir el número.'],
    ],
  },
  {
    id: 'inteligencia',
    icon: 'bi-graph-up-arrow',
    tab: 'Inteligencia',
    title: 'Inteligencia para decidir mejor',
    lead: 'Analiza tu propio ritmo de ventas, no un promedio del mercado.',
    items: [
      ['Rotación de productos', 'Qué se vende rápido y qué está quieto ocupando espacio.'],
      ['Días de cobertura', 'Cuántos días te alcanza el stock al ritmo actual.'],
      ['Panel de inicio', 'Ventas, más vendidos, medios de pago y valor del inventario.'],
      ['Análisis por sede', 'Compara cómo se mueve cada sucursal.'],
    ],
  },
  {
    id: 'novandra',
    icon: 'bi-stars',
    tab: 'Novandra',
    title: 'Novandra, tu asistente dentro de Stockly',
    lead: 'Pregúntale a tu negocio como le preguntarías a una persona.',
    items: [
      ['Novandra esencial', 'Incluida en todos los planes: cuánto vendiste, qué se agota, tu producto estrella.'],
      ['Te guía en la app', 'Pregúntale cómo hacer algo y te lleva a la guía correcta.'],
      ['Prepara borradores', 'Órdenes de compra y recordatorios que tú confirmas.'],
      ['Tú decides qué ve tu equipo', 'Por ejemplo, que los empleados no vean costos.'],
      ['Novandra Max', 'Próximamente en Pro y Enterprise: tu agente de IA completo.', 'soon'],
    ],
  },
  {
    id: 'contabilidad',
    icon: 'bi-calculator',
    tab: 'Contabilidad',
    title: 'Contabilidad sin perseguir papeles',
    lead: 'Tu contador recibe lo que necesita, cuando lo necesita.',
    items: [
      ['Informe para tu contador', 'Elige el periodo y envíalo por correo con un clic.'],
      ['General o detallado', 'Resumen o detalle de cada venta y compra, en Excel.'],
      ['Facturas de proveedores incluidas', 'Adjuntas o con enlace de descarga.'],
      ['Factura electrónica DIAN', 'Próximamente en Pro y Enterprise.', 'soon'],
    ],
  },
  {
    id: 'equipo',
    icon: 'bi-people',
    tab: 'Equipo',
    title: 'Tu equipo, con los permisos justos',
    lead: 'Cada persona entra con su correo y ve solo lo que le corresponde.',
    items: [
      ['Invitaciones por correo', 'Cada quien confirma su correo y crea su contraseña.'],
      ['Roles y permisos', 'Dueño, administrador o empleado; tú eliges qué ve cada uno.'],
      ['Auditoría', 'Quién cambió qué y cuándo.'],
      ['Notificaciones', 'Ventas, pagos, stock bajo y avisos del plan.'],
    ],
  },
  {
    id: 'seguridad',
    icon: 'bi-shield-check',
    tab: 'Seguridad',
    title: 'Seguridad y respaldo',
    lead: 'Tu información protegida y siempre bajo tu control.',
    items: [
      ['Datos aislados por empresa', 'Nadie fuera de tu equipo ve tu información.'],
      ['Pagos con Wompi (Bancolombia)', 'Stockly no guarda datos de tarjetas.'],
      ['Borrado protegido', 'Exige el nombre de tu empresa y un código a tu correo.'],
      ['Cambiar de plan no borra datos', 'Todo lo que registraste se conserva.'],
      ['Soporte cercano', 'Centro de ayuda con guías y soporte dentro de la app.'],
      ['Modo claro y oscuro', 'Trabaja cómodo de día y de noche.'],
    ],
  },
]

// ===== Planes =====
export const plans = [
  {
    id: 'basico',
    name: 'Básico',
    tagline: 'Para empezar a ordenar tu negocio.',
    monthly: 0,
    yearly: 0,
    cta: 'Crea tu empresa gratis',
    highlights: ['1.000 productos', '300 ventas al mes', '1 bodega / 1 sede', '2 usuarios', 'Novandra esencial', 'Factura en PDF'],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Para negocios que ya están creciendo.',
    monthly: 69900,
    yearly: 699000,
    cta: 'Empezar con Pro',
    featured: true,
    highlights: ['5.000 productos', '5.000 ventas al mes', '5 bodegas / 3 sedes', '5 usuarios', 'Inteligencia y auditoría', 'Informe al contador (15/mes)'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para varias sedes y equipos grandes.',
    monthly: 189900,
    yearly: 1899000,
    cta: 'Prueba 7 días gratis',
    highlights: ['50.000 productos', '30.000 ventas al mes', '30 bodegas / 15 sedes', '20 usuarios', 'Inteligencia y auditoría', 'Informe al contador (60/mes)'],
  },
]

// Tabla completa de comparación: [característica, Básico, Pro, Enterprise]
export const comparison = [
  ['Productos', '1.000', '5.000', '50.000'],
  ['Ventas al mes', '300', '5.000', '30.000'],
  ['Bodegas / sedes', '1 / 1', '5 / 3', '30 / 15'],
  ['Usuarios del equipo', '2', '5', '20'],
  ['Clientes / proveedores', '200 / 20', '5.000 / 300', '50.000 / 3.000'],
  ['Archivos (logo y facturas)', '50 MB', '2 GB', '10 GB'],
  ['Informe al contador', '—', '15 envíos al mes', '60 envíos al mes'],
  ['Inteligencia y auditoría', '—', 'Sí', 'Sí'],
  ['Novandra esencial', 'Sí', 'Sí', 'Sí'],
  ['Novandra Max (IA)', '—', '80 consultas/mes · próximamente', '250 consultas/mes · próximamente'],
  ['Factura electrónica DIAN', 'Factura en PDF', 'Próximamente', 'Próximamente'],
]

export const planNotes = [
  { icon: 'bi-percent', text: '50% de descuento en tu primera compra de Pro o Enterprise.' },
  { icon: 'bi-hourglass-split', text: 'Enterprise 7 días gratis: validas tu tarjeta o Nequi, no se cobra nada.' },
  { icon: 'bi-plus-circle', text: '¿Llegaste a un tope? Agrega usuarios, sedes, bodegas o ventas sin cambiar de plan.' },
  { icon: 'bi-bell', text: 'Sin cobros automáticos: te avisamos antes de que venza tu plan.' },
]

// ===== Preguntas frecuentes =====
export const faqs = [
  ['¿Necesito tarjeta para empezar?', 'No. El plan Básico es gratis y no pide tarjeta. Solo la prueba de Enterprise pide registrar un medio de pago para validarlo, sin cobrar nada.'],
  ['¿Se renueva y me cobra solo?', 'No. Stockly no hace cobros automáticos. Antes de que venza tu plan te avisamos y tú decides si renuevas.'],
  ['¿Qué pasa con mis datos si dejo de pagar?', 'Pasas al plan Básico gratis y conservas toda tu información. Nada se borra.'],
  ['¿Los precios incluyen IVA?', 'Los precios publicados son finales: no hay cargos adicionales.'],
  ['¿Cómo pago?', 'Con Wompi: tarjeta, PSE, Nequi o Botón Bancolombia. Recibes tu comprobante de pago por correo.'],
  ['¿Puedo subir mis productos de una vez?', 'Sí. Descarga la plantilla de Excel, llénala y súbela; Stockly organiza todo y te muestra cómo quedó.'],
  ['¿Funciona en el celular?', 'Sí. Stockly funciona en el navegador del computador, la tablet y el celular, sin instalar nada.'],
]

export const formatCOP = n => (n === 0 ? 'Gratis' : `$${n.toLocaleString('es-CO')}`)
