import { useEffect, useState } from 'react'
import circles from '../assets/hero-circles.png'
import './Contact.css'

// Datos de contacto oficiales
const channels = [
  { icon: 'bi-envelope', label: 'Correo', value: 'equipo@mccore.com.co', href: 'mailto:equipo@mccore.com.co' },
  { icon: 'bi-geo-alt', label: 'Ubicación', value: 'Quindío, Colombia' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [service, setService] = useState('')

  // El botón "Solicita una demo" del navbar elige esta opción automáticamente
  useEffect(() => {
    const onPreset = e => {
      setSent(false)
      setService(e.detail)
    }
    window.addEventListener('contact:preset', onPreset)
    return () => window.removeEventListener('contact:preset', onPreset)
  }, [])

  // Por ahora solo muestra el mensaje de confirmación; falta conectarlo a un correo o CRM
  const handleSubmit = e => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section id="contacto" className="section contact">
      <div className="container">
        <div className="contact-box" data-reveal>
          <img className="contact-circles" src={circles} alt="" aria-hidden="true" />
          <div className="row g-5">
            <div className="col-lg-5">
              <span className="eyebrow">Contacto</span>
              <h2 className="section-title">¿Construimos lo que <span className="accent">sigue</span>?</h2>
              <p className="section-lead mb-4">
                Cuéntanos tu idea y te enviamos una propuesta, sin compromiso.
              </p>
              <ul className="contact-channels">
                {channels.map(c => {
                  const content = (
                    <>
                      <span className="channel-icon"><i className={`bi ${c.icon}`} aria-hidden="true" /></span>
                      <span>
                        <small>{c.label}</small>
                        {c.value}
                      </span>
                    </>
                  )
                  return (
                    <li key={c.label}>
                      {c.href
                        ? <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{content}</a>
                        : <div>{content}</div>}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="col-lg-7">
              {sent ? (
                <div className="contact-thanks">
                  <i className="bi bi-check-circle" aria-hidden="true" />
                  <h3>¡Mensaje recibido!</h3>
                  <p>Te escribimos muy pronto.</p>
                  <button className="mc-btn mc-btn-outline" onClick={() => setSent(false)}>Enviar otro mensaje</button>
                </div>
              ) : (
                <form className="contact-form row g-3" onSubmit={handleSubmit}>
                  <div className="col-md-6">
                    <label htmlFor="c-name" className="form-label">Nombre</label>
                    <input id="c-name" className="form-control" required placeholder="Tu nombre" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c-email" className="form-label">Correo</label>
                    <input id="c-email" type="email" className="form-control" required placeholder="tu@correo.com" />
                  </div>
                  <div className="col-12">
                    <label htmlFor="c-service" className="form-label">¿Qué necesitas?</label>
                    <select id="c-service" className="form-select" value={service} onChange={e => setService(e.target.value)}>
                      <option value="" disabled>Elige un servicio</option>
                      <option>Demo de Stockly</option>
                      <option>Desarrollo web</option>
                      <option>App móvil</option>
                      <option>Software a medida</option>
                      <option>Automatización e IA</option>
                      <option>Otro</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="c-message" className="form-label">Cuéntanos tu idea</label>
                    <textarea id="c-message" className="form-control" rows="4" required placeholder="Quiero construir..." />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="mc-btn">
                      Enviar mensaje <i className="bi bi-send" aria-hidden="true" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
