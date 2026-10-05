import { faqs } from '../lib/stocklyData.js'
import './StocklyFaq.css'

export default function StocklyFaq() {
  return (
    <div className="stk-panel-faq">
        <div className="row g-4">
          <div className="col-lg-4">
            <span className="eyebrow">Preguntas frecuentes</span>
            <h2 className="section-title">Lo que más nos <span className="accent">preguntan.</span></h2>
            <p className="section-lead">¿No encuentras tu respuesta? Escríbenos a equipo@mccore.com.co.</p>
          </div>
          <div className="col-lg-8" style={{ '--delay': '.08s' }}>
            <div className="faq-list">
              {faqs.map(([q, a], i) => (
                <details key={q} open={i === 0}>
                  <summary>{q} <i className="bi bi-plus-lg" aria-hidden="true" /></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
    </div>
  )
}
