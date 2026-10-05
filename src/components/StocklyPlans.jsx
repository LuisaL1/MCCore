import { useState } from 'react'
import { APP_URL, comparison, formatCOP, planNotes, plans } from '../lib/stocklyData.js'
import './StocklyPlans.css'

export default function StocklyPlans() {
  const [yearly, setYearly] = useState(false)

  return (
    <div className="stk-panel-plans">
        <div className="section-head">
          <span className="eyebrow">Planes de Stockly</span>
          <h2 className="section-title">Empieza gratis. <span className="accent">Crece cuando quieras.</span></h2>
          <p className="section-lead">Precios finales en pesos colombianos, sin cargos adicionales.</p>

          <div className="sp-toggle" role="group" aria-label="Periodo de pago">
            <button className={!yearly ? 'active' : ''} aria-pressed={!yearly} onClick={() => setYearly(false)}>Mensual</button>
            <button className={yearly ? 'active' : ''} aria-pressed={yearly} onClick={() => setYearly(true)}>
              Anual <em>2 meses gratis</em>
            </button>
          </div>
        </div>

        <div className="row g-3">
          {plans.map((p, i) => {
            const price = yearly ? p.yearly : p.monthly
            return (
              <div className="col-lg-4" key={p.id}>
                <article className={`sp-card ${p.featured ? 'featured' : ''}`} style={{ '--delay': `${i * 0.08}s` }}>
                  <div className="plan-top">
                    <h3>{p.name}</h3>
                    {p.featured && <span className="sp-badge">Recomendado</span>}
                  </div>
                  <p className="sp-tagline">{p.tagline}</p>
                  <div className="sp-price">
                    <strong>{formatCOP(price)}</strong>
                    {price > 0 && <span>/{yearly ? 'año' : 'mes'}</span>}
                  </div>
                  <ul>
                    {p.highlights.map(h => (
                      <li key={h}><i className="bi bi-check2" aria-hidden="true" /> {h}</li>
                    ))}
                  </ul>
                  <a href={APP_URL} target="_blank" rel="noreferrer" className={`mc-btn w-100 ${p.featured ? '' : 'mc-btn-outline'}`}>
                    {p.cta}
                  </a>
                </article>
              </div>
            )
          })}
        </div>

        <div className="sp-notes">
          {planNotes.map(n => (
            <p key={n.text}><i className={`bi ${n.icon}`} aria-hidden="true" /> {n.text}</p>
          ))}
        </div>

        <details className="sp-compare">
          <summary>Ver comparación completa <i className="bi bi-chevron-down" aria-hidden="true" /></summary>
          <div className="sp-table-wrap">
            <table>
              <thead>
                <tr><th scope="col" /><th scope="col">Básico</th><th scope="col">Pro</th><th scope="col">Enterprise</th></tr>
              </thead>
              <tbody>
                {comparison.map(([label, ...vals]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    {vals.map((v, j) => <td key={j}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
    </div>
  )
}
