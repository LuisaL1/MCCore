import { useEffect, useState } from 'react'
import circles from '../assets/hero-circles.webp'
import { sendContactMessage } from '../lib/contactForm.js'
import './Contact.css'

// Datos de contacto oficiales
const channels = [
  { icon: 'bi-envelope', label: 'Correo', value: 'equipo@mccore.com.co', href: 'mailto:equipo@mccore.com.co' },
  { icon: 'bi-geo-alt', label: 'Ubicación', value: 'Quindío, Colombia' },
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [service, setService] = useState('')
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '', website: '' })
  const [sending, setSending] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const update = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const errorText = {
    invalid_email: 'Revisa tu correo, parece que tiene un error.',
    too_many: 'Recibimos varios mensajes tuyos hace poco. Intenta de nuevo en un rato.',
    network: 'No pudimos conectarnos. Revisa tu internet e intenta de nuevo.',
  }

  // El botón "Solicita una demo" del navbar elige esta opción automáticamente
  useEffect(() => {
    const onPreset = e => {
      setSent(false)
      setService(e.detail)
    }
    window.addEventListener('contact:preset', onPreset)
    return () => window.removeEventListener('contact:preset', onPreset)
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    setErrorMsg('')
    try {
      await sendContactMessage({ ...form, servicio: service })
      setSent(true)
      setForm({ nombre: '', email: '', mensaje: '', website: '' })
      setService('')
    } catch (err) {
      setErrorMsg(errorText[err.code] ?? `Algo salió mal. Escríbenos directo a equipo@mccore.com.co.`)
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contacto" className="section contact">
      <div className="container">
        <div className="contact-box" data-reveal>
          <img className="contact-circles" src={circles} alt="" aria-hidden="true" width="520" height="454" loading="lazy" />
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
                    <input id="c-name" className="form-control" required placeholder="Tu nombre" value={form.nombre} onChange={update('nombre')} maxLength={120} />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="c-email" className="form-label">Correo</label>
                    <input id="c-email" type="email" className="form-control" required placeholder="tu@correo.com" value={form.email} onChange={update('email')} />
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
                    <textarea id="c-message" className="form-control" rows="4" required placeholder="Quiero construir..." value={form.mensaje} onChange={update('mensaje')} maxLength={5000} />
                  </div>
                  <div className="col-12">
                    {/* Campo trampa para bots (invisible para las personas) */}
                    <input className="contact-trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={update('website')} />
                    <button type="submit" className="mc-btn" disabled={sending}>
                      {sending ? 'Enviando…' : 'Enviar mensaje'} <i className="bi bi-send" aria-hidden="true" />
                    </button>
                    {errorMsg && (
                      <p className="contact-error" role="alert">
                        <i className="bi bi-exclamation-circle" aria-hidden="true" /> {errorMsg}
                      </p>
                    )}
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
