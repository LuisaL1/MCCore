import { modules } from '../lib/stocklyData.js'
import './StocklyFeatures.css'

// Todos los módulos de Stockly en una cuadrícula, uno debajo del otro (sin menú)
export default function StocklyFeatures({ onBack }) {
  return (
    <div className="sd">
      <div className="sd-head">
        <button type="button" className="stk-arrow stk-arrow-corner" aria-label="Volver a Stockly" onClick={onBack}>
          <i className="bi bi-arrow-left" aria-hidden="true" />
        </button>
        <span className="eyebrow">Stockly</span>
        <h2 className="section-title">Todo tu negocio, <span className="accent">en una sola app.</span></h2>
        <p className="section-lead">Pensado para negocios en Colombia. En la nube y en cualquier pantalla.</p>
      </div>

      <div className="sd-grid">
        {modules.map(m => (
          <article key={m.id} className={`sd-card sd-${m.id}`}>
            <span className="sd-icon"><i className={`bi ${m.icon}`} aria-hidden="true" /></span>
            <h3>{m.title}</h3>
            <p>{m.lead}</p>
            <ul>
              {m.items.map(([title, , flag]) => (
                <li key={title}>
                  <i className="bi bi-check2" aria-hidden="true" />
                  <span>
                    {title}
                    {flag === 'soon' && <em className="sf-soon">Próximamente</em>}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
