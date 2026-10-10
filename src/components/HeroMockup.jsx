import stocklyLogo from '../assets/stockly-logo.webp'
import './HeroMockup.css'

// Réplica en HTML/CSS de la app real de Stockly (datos de ejemplo), dentro de una laptop 3D,
// con Novandra (el agente de IA de Stockly) respondiendo en un panel flotante.

const nav = [
  { group: 'General', items: [['bi-house', 'Inicio', true], ['bi-lightbulb', 'Inteligencia']] },
  { group: 'Operación', items: [['bi-cart3', 'Vender'], ['bi-receipt', 'Facturas'], ['bi-truck', 'Compras'], ['bi-arrow-left-right', 'Kardex']] },
  { group: 'Inventario', items: [['bi-box', 'Productos'], ['bi-person-badge', 'Sucursales'], ['bi-buildings', 'Bodegas'], ['bi-bar-chart-line', 'Reportes']] },
  { group: 'Contactos', items: [['bi-person-vcard', 'Clientes'], ['bi-boxes', 'Proveedores']] },
]

// Notificaciones del panel flotante (como en la versión anterior)
const notifications = [
  { icon: 'bi-bag-check', text: 'Nuevo pedido #1042', detail: '3 productos · Tienda online' },
  { icon: 'bi-exclamation-triangle', text: 'Stock bajo: Tenis urbanos 38', detail: 'Quedan 8 unidades', warn: true },
  { icon: 'bi-truck', text: 'Llegó el pedido del proveedor', detail: '120 unidades · Bodega Armenia' },
  { icon: 'bi-stars', text: 'Novandra sugiere reabastecer', detail: 'Gorra negra antes del viernes' },
]

// Curva de ventas (lienzo de 600 × 160)
const chart =
  'M0,40 C20,60 30,120 50,125 S80,100 95,60 S115,40 125,70 S140,105 150,80 S165,30 175,70 ' +
  'S190,110 210,110 S235,135 245,130 S265,105 280,110 S300,100 310,80 S325,140 335,130 ' +
  'S350,95 360,110 S375,140 385,125 S395,20 405,30 S420,140 430,130 S445,45 455,60 ' +
  'S475,150 495,150 S510,150 520,90 S535,60 545,110 S565,115 580,70 L600,55'

export default function HeroMockup() {
  return (
    <div className="hm" aria-hidden="true">
      <div className="hm-stage">
        {/* ===== Laptop con la app ===== */}
        <div className="hm-laptop">
          <div className="hm-screen">
            <div className="hm-app dark">
              {/* Menú lateral */}
              <aside className="hm-side">
                <div className="hm-brand">
                  <img src={stocklyLogo} alt="" width="160" height="161" /> Stockly
                </div>
                <div className="hm-company">
                  <span className="hm-company-icon"><i className="bi bi-buildings" /></span>
                  <span>
                    <b>Tu empresa</b>
                    <small>Plan Pro</small>
                  </span>
                </div>
                {nav.map(g => (
                  <div key={g.group} className="hm-group">
                    <span className="hm-group-label">{g.group}</span>
                    {g.items.map(([icon, label, active]) => (
                      <div key={label} className={`hm-nav ${active ? 'active' : ''}`}>
                        <i className={`bi ${icon}`} /> {label}
                      </div>
                    ))}
                  </div>
                ))}
              </aside>

              {/* Contenido */}
              <div className="hm-main">
                <div className="hm-top">
                  <span className="hm-date">Sábado, 3 de octubre</span>
                  <span className="hm-ask"><i className="bi bi-stars" /> Pregúntale a Novandra… <em>IA</em></span>
                  <span className="hm-new"><i className="bi bi-plus" /> Nueva venta</span>
                  <span className="hm-bell"><i className="bi bi-bell" /><em>6</em></span>
                </div>

                <div className="hm-greet">
                  <div>
                    <strong>Buenas noches, Juan</strong>
                    <small>Así va tu empresa hoy.</small>
                  </div>
                  <div className="hm-range"><span>7 días</span><span className="on">30 días</span><span>90 días</span></div>
                </div>

                <div className="hm-grid">
                  {/* Ventas del periodo */}
                  <div className="hm-card hm-sales">
                    <div className="hm-card-head">
                      <span className="hm-ic dark"><i className="bi bi-graph-up-arrow" /></span>
                      <span><b>Ventas del periodo</b><small>Últimos 30 días</small></span>
                      <span className="hm-link">Ver facturas</span>
                    </div>
                    <strong className="hm-big">COP 18.118.821</strong>
                    <small className="hm-sub">50 ventas</small>
                    <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="hm-chart">
                      <path d={`${chart} L600,160 L0,160 Z`} className="hm-area" />
                      <path d={chart} className="hm-line" fill="none" />
                    </svg>
                    <div className="hm-axis"><span>4 sept</span><span>10 sept</span><span>16 sept</span><span>22 sept</span><span>28 sept</span><span>3 oct</span></div>
                  </div>

                  {/* Ventas de hoy */}
                  <div className="hm-card hm-today">
                    <div className="hm-card-head">
                      <span className="hm-ic light"><i className="bi bi-cart3" /></span>
                      <span><b>Ventas de hoy</b></span>
                    </div>
                    <strong className="hm-big">COP 1.122.170</strong>
                    <small className="hm-sub">4 ventas registradas</small>
                    <span className="hm-register"><i className="bi bi-plus" /> Registrar venta</span>
                  </div>

                  {/* Valor del inventario */}
                  <div className="hm-card hm-value">
                    <div className="hm-card-head">
                      <span className="hm-ic soft"><i className="bi bi-currency-dollar" /></span>
                      <span><b>Valor del inventario</b></span>
                    </div>
                    <strong className="hm-big">COP 15.964.000</strong>
                    <small className="hm-sub">A costo · COP 33.678.000 a precio de venta</small>
                  </div>
                </div>

                <div className="hm-row4">
                  <div className="hm-card hm-mini soft">
                    <span className="hm-mini-head"><i className="bi bi-exclamation-triangle" /> Bajo mínimo</span>
                    <strong>1</strong><small>productos por reponer</small>
                  </div>
                  <div className="hm-card hm-mini">
                    <span className="hm-mini-head"><i className="bi bi-receipt" /> Ticket promedio</span>
                    <strong>COP 362.376</strong><small>50 ventas en el periodo</small>
                  </div>
                  <div className="hm-card hm-mini">
                    <span className="hm-mini-head"><i className="bi bi-truck" /> Órdenes abiertas</span>
                    <strong>2</strong><small className="u">Ver compras</small>
                  </div>
                  <div className="hm-card hm-mini">
                    <span className="hm-mini-head"><i className="bi bi-gem" /> Plan Pro</span>
                    <small className="hm-plan">Ventas del mes <b>8 / 5.000</b></small>
                    <span className="hm-bar"><span style={{ width: '3%' }} /></span>
                    <small className="hm-plan">Productos <b>14 / 5.000</b></small>
                    <span className="hm-bar"><span style={{ width: '4%' }} /></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hm-base" />
        </div>

        {/* ===== Novandra, el agente de IA de Stockly (abajo a la izquierda) ===== */}
        <div className="hm-panel hm-novandra">
          <div className="nv-head">
            <span className="nv-icon"><i className="bi bi-stars" /></span>
            <span>
              <b>Novandra</b>
              <small>Asistente de operaciones · ve tus datos en tiempo real</small>
            </span>
          </div>
          <div className="nv-body">
            <p className="nv-msg user">¿Qué productos debo reabastecer esta semana?</p>
            <p className="nv-typing"><span /><span /><span /></p>
            <p className="nv-msg bot">
              Te recomiendo reponer <b>3 productos</b>. El más urgente: <b>Tenis urbanos 38</b>, quedan 8 y se
              venden 5 por semana.
            </p>
            <div className="nv-draft">
              <i className="bi bi-file-earmark-check" />
              <span><b>Orden de compra en borrador</b><small>3 productos · lista para revisar</small></span>
            </div>
          </div>
          <small className="nv-foot">Novandra solo crea borradores: tú confirmas cada cambio.</small>
        </div>

        {/* ===== Notificaciones (arriba a la derecha) ===== */}
        <div className="hm-panel hm-notifs">
          <div className="hm-panel-head">Notificaciones</div>
          {notifications.map((n, i) => (
            <div key={n.text} className={`hm-notif ${n.warn ? 'warn' : ''}`} style={{ '--i': i }}>
              <span className="hm-notif-icon"><i className={`bi ${n.icon}`} /></span>
              <span>
                <b>{n.text}</b>
                <small>{n.detail}</small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
