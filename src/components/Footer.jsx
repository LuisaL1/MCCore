import logo from '../assets/logo-mccore-dark.png'
import './Footer.css'

const columns = [
  {
    title: 'MCCore',
    links: [
      { href: '#servicios', label: 'Servicios' },
      { href: '#stockly', label: 'Stockly' },
      { href: '#planes', label: 'Planes' },
      { href: '#preguntas', label: 'Preguntas frecuentes' },
      { href: '#contacto', label: 'Contacto' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      { href: '#servicios', label: 'Desarrollo web' },
      { href: '#servicios', label: 'Apps móviles' },
      { href: '#servicios', label: 'Software a medida' },
      { href: '#servicios', label: 'Automatización e IA' },
    ],
  },
]

// Enlaces de redes de ejemplo: cámbialos por los perfiles reales
const socials = [
  { icon: 'bi-instagram', label: 'Instagram', href: '#' },
  { icon: 'bi-linkedin', label: 'LinkedIn', href: '#' },
  { icon: 'bi-facebook', label: 'Facebook', href: '#' },
  { icon: 'bi-tiktok', label: 'TikTok', href: '#' },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-5">
            <img src={logo} alt="MCCore" className="footer-logo" />
            <p className="footer-tagline">Tu idea, nuestra ingeniería.</p>
            <p className="footer-location"><i className="bi bi-geo-alt" aria-hidden="true" /> Quindío, Colombia</p>
            <div className="footer-socials">
              {socials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}>
                  <i className={`bi ${s.icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
          {columns.map(col => (
            <div className="col-6 col-lg-3" key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map(l => (
                  <li key={l.label}><a href={l.href}>{l.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MCCore. Todos los derechos reservados.</span>
          <a href="#inicio">Volver arriba <i className="bi bi-arrow-up" aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  )
}
