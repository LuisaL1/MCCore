import './Services.css'

const services = [
  {
    icon: 'bi-window-stack',
    title: 'Desarrollo web',
    text: 'Sitios rápidos que convierten visitas en clientes.',
  },
  {
    icon: 'bi-phone',
    title: 'Apps móviles',
    text: 'iOS y Android, fáciles de usar desde el primer día.',
  },
  {
    icon: 'bi-cpu',
    title: 'Software a medida',
    text: 'ERP, CRM e inventarios hechos para tu operación.',
  },
  {
    icon: 'bi-stars',
    title: 'Automatización e IA',
    text: 'Menos tareas repetitivas, más tiempo para crecer.',
  },
  {
    icon: 'bi-cloud-check',
    title: 'Cloud y DevOps',
    text: 'Tu sistema estable, seguro y siempre en línea.',
  },
  {
    icon: 'bi-palette',
    title: 'Diseño UX/UI',
    text: 'Interfaces que se entienden a la primera.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="section services">
      <div className="container">
        <div className="section-head" data-reveal>
          <span className="eyebrow">Servicios</span>
          <h2 className="section-title">Ingeniería para cada <span className="accent">etapa</span> de tu idea</h2>
          <p className="section-lead">
            Del boceto al lanzamiento, contigo en cada paso.
          </p>
        </div>

        <div className="row g-4">
          {services.map((s, i) => (
            <div className="col-md-6 col-lg-4" key={s.title}>
              <article className="mc-card service-card" data-reveal style={{ '--delay': `${(i % 3) * 0.1}s` }}>
                <div className="mc-icon"><i className={`bi ${s.icon}`} aria-hidden="true" /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <a href="#contacto" className="service-link">
                  Saber más <i className="bi bi-arrow-right" aria-hidden="true" />
                </a>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
