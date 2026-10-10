import './Services.css'

const services = [
  {
    icon: 'bi-window-stack',
    title: 'Desarrollo web',
    text: 'Rápidos, claros y hechos para vender.',
  },
  {
    icon: 'bi-phone',
    title: 'Apps móviles',
    text: 'Para iOS y Android. Fáciles desde el primer toque.',
  },
  {
    icon: 'bi-cpu',
    title: 'Software a medida',
    text: 'ERP, CRM e inventarios, pensados para tu forma de trabajar.',
  },
  {
    icon: 'bi-stars',
    title: 'Automatización e IA',
    text: 'Menos tareas repetitivas. Más tiempo para lo importante.',
  },
  {
    icon: 'bi-cloud-check',
    title: 'Cloud y DevOps',
    text: 'Estable, seguro y siempre disponible.',
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
          <h2 className="section-title">Lo que tu idea necesita. <span className="accent">Bajo un mismo techo.</span></h2>
          <p className="section-lead">
            Del primer boceto al lanzamiento. Y contigo en cada paso.
          </p>
        </div>

        <div className="row g-4">
          {services.map((s, i) => (
            <div className="col-md-6 col-lg-4" key={s.title}>
              <article className="mc-card service-card" data-reveal style={{ '--delay': `${(i % 3) * 0.1}s` }}>
                <div className="mc-icon"><i className={`bi ${s.icon}`} aria-hidden="true" /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <a href="#contacto" className="service-link stretched-link">
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
