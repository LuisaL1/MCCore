import { useEffect, useRef, useState } from 'react'
import { requestStocklyTrial } from '../lib/stocklyTrial.js'
import logo from '../assets/stockly-logo.png'
import illustration from '../assets/stockly-ilustracion.jpg'
import StocklyFeatures from './StocklyFeatures.jsx'
import StocklyPlans from './StocklyPlans.jsx'
import StocklyFaq from './StocklyFaq.jsx'
import './Stockly.css'

// Dos vistas: la presentación y, al tocar la flecha, todos los detalles uno debajo del otro
const SLIDES = [{ id: 'inicio' }, { id: 'detalles' }]
// Enlaces que abren la vista de detalles y bajan hasta su parte
const HASH_TO_SLIDE = { '#stockly': 'inicio', '#stockly-funciones': 'detalles', '#planes': 'detalles', '#preguntas': 'detalles' }

const features = [
  { icon: 'bi-lightning-charge', title: 'Caja ágil', text: 'Cobra en segundos, con todos los medios de pago.' },
  { icon: 'bi-box-seam', title: 'Inventario al día', text: 'Varias bodegas, kardex y alertas de stock.' },
  { icon: 'bi-receipt', title: 'Facturas en PDF', text: 'Con tu logo, listas para enviar por WhatsApp.' },
  { icon: 'bi-stars', title: 'Novandra', text: 'Pregúntale a tu negocio como a una persona.' },
]



export default function Stockly() {
  // ===== Paneles de la sección (efecto de transición como en el hero) =====
  const [current, setCurrent] = useState('inicio')
  const [leaving, setLeaving] = useState(null)
  const [dir, setDir] = useState('fwd')
  const [animate, setAnimate] = useState(false)
  const sectionRef = useRef(null)
  const leaveTimer = useRef(null)
  const index = SLIDES.findIndex(sl => sl.id === current)

  const go = (id, { scroll = true, target = null } = {}) => {
    // Baja hasta una parte concreta (#planes, #preguntas) cuando ya se ve
    const scrollToTarget = delay => setTimeout(() => {
      const el = target && document.querySelector(target)
      ;(el ?? sectionRef.current)?.scrollIntoView({ behavior: 'smooth' })
    }, delay)
    if (id === current) {
      if (scroll) scrollToTarget(0)
      return
    }
    const nextIndex = SLIDES.findIndex(sl => sl.id === id)
    setDir(nextIndex > index ? 'fwd' : 'back')
    setLeaving(current)
    setCurrent(id)
    setAnimate(true)
    clearTimeout(leaveTimer.current)
    leaveTimer.current = setTimeout(() => setLeaving(null), 500)
    // Si el visitante está más abajo (p. ej. en un panel largo), vuelve al inicio de la sección
    const top = sectionRef.current?.getBoundingClientRect().top ?? 0
    if (target) scrollToTarget(650)
    else if (scroll && (top < 0 || top > window.innerHeight * 0.6)) scrollToTarget(0)
  }

  // Los enlaces #stockly, #stockly-funciones, #planes y #preguntas abren su panel
  const goRef = useRef(go)
  useEffect(() => { goRef.current = go })
  useEffect(() => {
    const onClick = e => {
      const a = e.target.closest?.('a[href^="#"]')
      const id = a && HASH_TO_SLIDE[a.getAttribute('href')]
      if (!id) return
      e.preventDefault()
      const href = a.getAttribute('href')
      history.replaceState(null, '', href)
      goRef.current(id, { target: id === 'detalles' && href !== '#stockly-funciones' ? href : null })
    }
    document.addEventListener('click', onClick)
    const initial = HASH_TO_SLIDE[location.hash]
    if (initial && initial !== 'inicio') goRef.current(initial, { target: location.hash })
    return () => {
      document.removeEventListener('click', onClick)
      clearTimeout(leaveTimer.current)
    }
  }, [])

  const renderSlide = id => {
    if (id === 'inicio') return intro
    return (
      <>
        <StocklyFeatures onBack={() => go('inicio')} />
        <div id="planes" className="sd-block"><StocklyPlans /></div>
        <div id="preguntas" className="sd-block"><StocklyFaq /></div>
      </>
    )
  }

  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')        // campo trampa para bots (invisible)
  // idle | sending | sent | already | error
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const joined = status === 'sent' || status === 'already'

  const errorText = {
    sold_out: 'Los 20 cupos ya se agotaron. Escríbenos y te avisamos de la próxima promo.',
    invalid_email: 'Revisa tu correo, parece que tiene un error.',
    network: 'No pudimos conectarnos. Revisa tu internet e intenta de nuevo.',
  }

  const submit = async e => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const result = await requestStocklyTrial(email.trim(), website)
      setStatus(result === 'already_registered' ? 'already' : 'sent')
    } catch (err) {
      setErrorMsg(errorText[err.code] ?? 'Algo salió mal. Intenta de nuevo en un momento.')
      setStatus('error')
    }
  }

  const intro = (
    <div className="row g-3 align-items-stretch">
      <div className="col-lg-5">
        <div className="stockly-copy">
        <button type="button" className="stk-arrow stk-arrow-corner" aria-label="Ver todo lo que hace Stockly" onClick={() => go('detalles')}>
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
        <span className="stockly-pill">
          <span className="pulse-dot" /> Nuevo · Ya disponible
        </span>
        <div className="stockly-brand">
          <img src={logo} alt="" className="stockly-logo-img" aria-hidden="true" />
          Stockly
        </div>
        <h2 className="section-title">
          Tu inventario, en <span className="accent">piloto automático</span>
        </h2>
        <p className="section-lead mb-4">
          Tu inventario, tus ventas y tus facturas en un solo lugar. Adiós a los cuadernos y al Excel.
        </p>

        <ul className="stockly-features">
          {features.map(f => (
            <li key={f.title}>
              <i className={`bi ${f.icon}`} aria-hidden="true" />
              <div>
                <strong>{f.title}</strong>
                <span>{f.text}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="stockly-perk">
          <span className="stockly-perk-icon"><i className="bi bi-gift" aria-hidden="true" /></span>
          <p>
            <strong>1 mes de Stockly Pro, gratis.</strong>
            Deja tu correo y tu licencia te llega al instante.
          </p>
        </div>

        {joined ? (
          <div className="stockly-joined" role="status">
            <i className="bi bi-envelope-check" aria-hidden="true" />
            {status === 'already' ? (
              <p>
                <strong>¡Ya estás dentro!</strong>
                Tu licencia ya la enviamos a<br /><b>{email}</b>
              </p>
            ) : (
              <p>
                <strong>¡Gracias por tu interés!</strong>
                Tu licencia Pro va en camino a<br /><b>{email}</b>
              </p>
            )}
          </div>
        ) : (
          <form className="stockly-waitlist" onSubmit={submit} aria-busy={status === 'sending'}>
            <label htmlFor="stockly-email" className="visually-hidden">Tu correo</label>
            <input
              id="stockly-email"
              type="email"
              required
              placeholder="tu@empresa.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={status === 'sending'}
            />
            <input
              className="stockly-trap"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
            <button type="submit" className="mc-btn" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Quiero mi mes gratis'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="stockly-error" role="alert">
            <i className="bi bi-exclamation-circle" aria-hidden="true" /> {errorMsg}
          </p>
        )}
        {!joined && status !== 'error' && <small className="stockly-note">Sin tarjeta · Solo 20 cupos</small>}
        <button type="button" className="stockly-more" onClick={() => go('detalles')}>
          Ver todo lo que hace Stockly <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
        </div>
      </div>

      {/* Ilustración de Stockly con avisos flotantes del producto */}
      <div className="col-lg-7" style={{ '--delay': '.15s' }}>
        <div className="stockly-art">
          <img
            src={illustration}
            alt="Ilustración de una persona revisando inventario con un escáner y cajas"
            loading="lazy"
          />

          <div className="mock-toast">
            <span className="mock-toast-icon"><i className="bi bi-bell-fill" aria-hidden="true" /></span>
            <div>
              <strong>Stock bajo</strong>
              <small>Tenis urbanos 38 · quedan 8</small>
            </div>
          </div>
          <div className="mock-ai">
            <i className="bi bi-stars" aria-hidden="true" />
            <span>Pide <strong>40 unidades</strong> antes del viernes</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section id="stockly" className="section stockly" ref={sectionRef}>
      <div className="container">
        <div className="stk-stage" data-reveal>
          {leaving && (
            <div className={`stk-slide leaving ${dir}`} inert aria-hidden="true">{renderSlide(leaving)}</div>
          )}
          <div key={current} className={`stk-slide ${animate ? `entering ${dir}` : ''}`} role="tabpanel">
            {renderSlide(current)}
          </div>
        </div>

      </div>
    </section>
  )
}
