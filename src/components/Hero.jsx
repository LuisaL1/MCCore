import { useEffect, useRef, useState } from 'react'
import circles from '../assets/hero-circles.webp'
import { openNovandra } from '../lib/novandra.js'
import PromptBar from './PromptBar.jsx'
import HeroMockup from './HeroMockup.jsx'
import stocklyLogo from '../assets/stockly-logo.webp'
import './Hero.css'

// Datos de ejemplo de la vista previa de Stockly
const stock = [
  { name: 'Camiseta básica M', qty: 124, state: 'ok' },
  { name: 'Tenis urbanos 38', qty: 8, state: 'low' },
  { name: 'Gorra negra', qty: 0, state: 'out' },
]
const stateLabel = { ok: 'Disponible', low: 'Stock bajo', out: 'Agotado' }
const week = [38, 52, 30, 64, 58, 80, 70]

export default function Hero() {
  // Vista de Stockly: las tarjetas salen hacia la izquierda y entra la laptop con el panel
  const [showStockly, setShowStockly] = useState(false)
  const [mockupKey, setMockupKey] = useState(0)        // reinicia la animación de la laptop
  const [mockupMounted, setMockupMounted] = useState(false)
  const backRef = useRef(null)
  const openerRef = useRef(null)

  const openStockly = () => {
    setMockupKey(k => k + 1)
    setMockupMounted(true)
    setShowStockly(true)
  }
  const closeStockly = () => {
    setShowStockly(false)
    openerRef.current?.focus()
  }

  useEffect(() => {
    if (showStockly) {
      backRef.current?.focus({ preventScroll: true })
      const onKey = e => { if (e.key === 'Escape') closeStockly() }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    // Desmonta la laptop cuando termina de desvanecerse
    const t = setTimeout(() => setMockupMounted(false), 600)
    return () => clearTimeout(t)
  }, [showStockly])

  return (
    <section id="inicio" className={`hero ${showStockly ? 'show-stockly' : ''}`}>
      <div className="hero-stage">
      <div className="hero-bento" inert={showStockly}>
        {/* 1 · Mensaje principal */}
        <div className="tile tile-intro" data-reveal>
          <button type="button" className="hero-announce" onClick={openStockly} ref={openerRef}>
            <span className="hero-announce-tag">Nuevo</span>
            Conoce Stockly
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>

          <h1 className="hero-title">
            Tecnología que encaja con <span className="accent">tu negocio.</span>
          </h1>

          <p className="hero-subtitle">
            Software a la medida, sin tecnicismos. Cuéntanos qué necesitas:
          </p>

          <PromptBar />
        </div>

        {/* 2 · Stockly */}
        <a href="#stockly" className="tile tile-stockly" data-reveal style={{ '--delay': '.08s' }}>
          <div className="stockly-head">
            <span className="stockly-mark"><img src={stocklyLogo} alt="" aria-hidden="true" width="160" height="161" /></span>
            <span>
              <strong>Stockly</strong>
              <small>Tu aliado en inventarios</small>
            </span>
            <span className="tile-tag">Nuevo</span>
          </div>

          <p className="stockly-line">Tu inventario, por fin en orden.</p>

          <div className="stockly-preview" aria-hidden="true">
            <div className="sp-top">
              <span>Inventario</span>
              <b>1.248 productos</b>
            </div>
            <div className="sp-bars">
              {week.map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
            </div>
            {stock.map(s => (
              <div key={s.name} className="sp-row">
                <span className={`sp-dot ${s.state}`} />
                <span className="sp-name">{s.name}</span>
                <span className="sp-qty">{s.qty}</span>
                <span className={`sp-state ${s.state}`}>{stateLabel[s.state]}</span>
              </div>
            ))}
          </div>

          <span className="tile-link">Ver cómo funciona <i className="bi bi-arrow-up-right" aria-hidden="true" /></span>
        </a>

        {/* 3 · Servicios */}
        <a href="#servicios" className="tile tile-stat" data-reveal style={{ '--delay': '.12s' }}>
          <i className="bi bi-briefcase stat-icon" aria-hidden="true" />
          <span className="stat-big">Desarrollo de software para empresas.</span>
          <span className="stat-text">Web, apps, sistemas a la medida e IA <i className="bi bi-arrow-right" aria-hidden="true" /></span>
        </a>

        {/* 4 · Lado humano */}
        <div className="tile tile-human" data-reveal style={{ '--delay': '.16s' }}>
          <img src={circles} alt="" className="human-circles" aria-hidden="true" width="520" height="454" />
          <span className="human-place"><i className="bi bi-geo-alt" aria-hidden="true" /> Hecho en el Quindío</span>
          <p className="human-text">Soluciones tecnológicas a tu medida.</p>
          <span className="human-note">
            <i className="bi bi-chat-dots" aria-hidden="true" /> Hablas directo con quien construye tu proyecto
          </span>
        </div>

        {/* 5 · Novandra */}
        <div className="tile tile-novandra" data-reveal style={{ '--delay': '.2s' }}>
          <div className="nv-chat" aria-hidden="true">
            <p className="nv-user">¿Cuánto cuesta una tienda en línea?</p>
            <p className="nv-bot">Depende de lo que vendas. Cuéntame un poco y te ayudo a cotizar 🙂</p>
          </div>
          <button className="tile-link as-button" onClick={openNovandra}>
            Pregúntale a Novandra <i className="bi bi-arrow-up-right" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Vista de Stockly (aparece al hacer clic en "Conoce Stockly") */}
      <div className="hero-stockly" inert={!showStockly} aria-hidden={!showStockly}>
        <div className="hs-copy">
          <span className="hs-label">Nuestro producto</span>
          <div className="hs-brand">
            <img src={stocklyLogo} alt="" className="hs-logo" aria-hidden="true" width="160" height="161" />
            Stockly
          </div>
          <h2 className="hs-title">Tu inventario, por fin en orden.</h2>
          <p className="hs-text">
            Tu inventario, tus ventas y tus facturas en un solo lugar. En computador, tablet y celular.
          </p>
          <div className="hs-novandra">
            <span className="hs-nv-icon"><i className="bi bi-stars" aria-hidden="true" /></span>
            <p>
              <strong>Con Novandra, tu agente de IA.</strong>
              Te dice qué reabastecer y deja las compras listas. Tú apruebas.
            </p>
          </div>
          <div className="hs-actions">
            <a href="#stockly" className="mc-btn">Quiero mi mes gratis</a>
            <button type="button" className="mc-btn mc-btn-outline" onClick={closeStockly} ref={backRef}>
              <i className="bi bi-arrow-left" aria-hidden="true" /> Volver
            </button>
          </div>
          <p className="hs-perk">
            <i className="bi bi-gift" aria-hidden="true" /> 1 mes de Pro gratis
          </p>
        </div>
        <div className="hs-visual">
          {mockupMounted && <HeroMockup key={mockupKey} />}
        </div>
      </div>
      </div>
    </section>
  )
}
