import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import logo from '../assets/logo-mccore-dark.webp'
import stocklyLogo from '../assets/stockly-logo.webp'
import { openNovandra } from '../lib/novandra.js'
import './Header.css'

// Menús del navbar. Un elemento con "items" abre un desplegable; con "href" es un enlace directo.
const menus = [
  {
    label: 'Productos',
    wide: true,
    featured: [
      {
        icon: 'bi-box-seam',
        image: stocklyLogo,
        title: 'Stockly',
        badge: 'Nuevo',
        text: 'Inventario, ventas y facturas. En un solo lugar.',
        href: '#stockly',
      },
      {
        icon: 'bi-stars',
        title: 'Novandra',
        badge: 'IA',
        text: 'El agente de IA de Stockly. Sabe qué reabastecer.',
        href: '#stockly',
      },
    ],
  },
  {
    label: 'Servicios',
    items: [
      { icon: 'bi-window-stack', title: 'Desarrollo web', text: 'Sitios que venden', href: '#servicios' },
      { icon: 'bi-phone', title: 'Apps móviles', text: 'Para iOS y Android', href: '#servicios' },
      { icon: 'bi-cpu', title: 'Software a medida', text: 'ERP, CRM e inventarios', href: '#servicios' },
      { icon: 'bi-stars', title: 'Automatización e IA', text: 'Menos tareas repetitivas', href: '#servicios' },
      { icon: 'bi-cloud-check', title: 'Cloud y DevOps', text: 'Estable y siempre en línea', href: '#servicios' },
      { icon: 'bi-palette', title: 'Diseño UX/UI', text: 'Interfaces que se entienden', href: '#servicios' },
    ],
  },
  { label: 'Contacto', href: '#contacto' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)      // desplegable abierto (escritorio)
  const [mobileOpen, setMobileOpen] = useState(false)  // menú de celular
  const [mobileSection, setMobileSection] = useState(null)
  const headerRef = useRef(null)
  const shellRef = useRef(null)
  const closeTimer = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Publica la altura del navbar (en su estado inicial) como --header-h,
  // para que el contenido de abajo nunca quede pegado ni debajo de la barra
  useLayoutEffect(() => {
    if (scrolled) return
    const measure = () => {
      const shell = shellRef.current
      if (!shell) return
      const bottom = shell.offsetTop + shell.offsetHeight
      document.documentElement.style.setProperty('--header-h', `${bottom}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(shellRef.current)
    return () => ro.disconnect()
  }, [scrolled])

  // Cerrar con Escape o al hacer clic fuera del header
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        setOpenMenu(null)
        setMobileOpen(false)
      }
    }
    const onClick = e => {
      if (!headerRef.current?.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onClick)
    }
  }, [])

  // Hover con un pequeño retardo al salir, para poder mover el mouse hasta el panel
  const hoverOpen = label => {
    clearTimeout(closeTimer.current)
    setOpenMenu(label)
  }
  const hoverClose = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160)
  }

  const closeAll = () => {
    setOpenMenu(null)
    setMobileOpen(false)
  }

  const runItem = item => {
    closeAll()
    if (item.action === 'novandra') openNovandra()
  }

  const renderPanel = menu => (
    <div className={`nav-panel ${menu.wide ? 'wide' : ''}`} role="menu">
      {menu.featured && (
        <div className="nav-featured">
          {menu.featured.map(f => (
            <a
              key={f.title}
              href={f.href ?? '#'}
              className="nav-feature"
              role="menuitem"
              onClick={e => {
                if (f.action) e.preventDefault()
                runItem(f)
              }}
            >
              <span className={`nav-feature-icon ${f.image ? 'has-image' : ''}`}>
                {f.image
                  ? <img src={f.image} alt="" aria-hidden="true" width="160" height="161" />
                  : <i className={`bi ${f.icon}`} aria-hidden="true" />}
              </span>
              <span className="nav-feature-title">
                {f.title} <span className="nav-badge">{f.badge}</span>
              </span>
              <span className="nav-feature-text">{f.text}</span>
              <span className="nav-feature-cta">Conocer más <i className="bi bi-arrow-right" aria-hidden="true" /></span>
            </a>
          ))}
        </div>
      )}
      {menu.items && (
        <div className={`nav-items ${menu.items.length > 4 ? 'two-cols' : ''}`}>
          {menu.items.map(item => (
            <a key={item.title} href={item.href} className="nav-item" role="menuitem" onClick={() => runItem(item)}>
              <span className="nav-item-icon"><i className={`bi ${item.icon}`} aria-hidden="true" /></span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.text}</small>
              </span>
            </a>
          ))}
        </div>
      )}
      {menu.footer && (
        <a href={menu.footer.href} className="nav-panel-footer" onClick={closeAll}>
          {menu.footer.label} <i className="bi bi-arrow-right" aria-hidden="true" />
        </a>
      )}
    </div>
  )

  return (
    <header
      ref={headerRef}
      className={`site-header ${scrolled ? 'scrolled' : ''} ${mobileOpen ? 'menu-open' : ''}`}
    >
      <div className="nav-shell" ref={shellRef}>
        <a href="#inicio" className="brand" aria-label="MCCore, ir al inicio" onClick={closeAll}>
          <img src={logo} alt="MCCore" width="360" height="143" />
        </a>

        {/* ===== Menú de escritorio ===== */}
        <nav className="main-nav" aria-label="Principal">
          <ul className="nav-menu">
            {menus.map(menu => (
              <li
                key={menu.label}
                className={`nav-entry ${openMenu === menu.label ? 'open' : ''}`}
                onMouseEnter={() => menu.href ? setOpenMenu(null) : hoverOpen(menu.label)}
                onMouseLeave={hoverClose}
              >
                {menu.href ? (
                  <a href={menu.href} className="nav-trigger" onClick={closeAll}>{menu.label}</a>
                ) : (
                  <>
                    <button
                      className="nav-trigger"
                      aria-expanded={openMenu === menu.label}
                      aria-haspopup="true"
                      onClick={() => setOpenMenu(openMenu === menu.label ? null : menu.label)}
                    >
                      {menu.label} <i className="bi bi-chevron-down" aria-hidden="true" />
                    </button>
                    {renderPanel(menu)}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <a href="#stockly" className="mc-btn mc-btn-dark header-cta" onClick={closeAll}>
            Prueba Stockly
          </a>
          <button
            className="nav-toggle"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ===== Menú de celular (acordeón) ===== */}
      <div id="mobile-menu" className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {menus.map(menu => (
          <div key={menu.label} className="mobile-group">
            {menu.href ? (
              <a href={menu.href} className="mobile-trigger" onClick={closeAll}>{menu.label}</a>
            ) : (
              <>
                <button
                  className="mobile-trigger"
                  aria-expanded={mobileSection === menu.label}
                  onClick={() => setMobileSection(mobileSection === menu.label ? null : menu.label)}
                >
                  {menu.label} <i className="bi bi-chevron-down" aria-hidden="true" />
                </button>
                <div className={`mobile-sub ${mobileSection === menu.label ? 'open' : ''}`}>
                  <div>
                    {[...(menu.featured ?? []), ...(menu.items ?? [])].map(item => (
                      <a
                        key={item.title}
                        href={item.href ?? '#'}
                        className="mobile-item"
                        onClick={e => {
                          if (item.action) e.preventDefault()
                          runItem(item)
                        }}
                      >
                        <i className={`bi ${item.icon}`} aria-hidden="true" />
                        {item.title}
                        {item.badge && <span className="nav-badge">{item.badge}</span>}
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="mobile-actions">
          <a href="#stockly" className="mc-btn" onClick={closeAll}>Prueba Stockly</a>
        </div>
      </div>
    </header>
  )
}
