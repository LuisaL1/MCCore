import { useEffect, useState } from 'react'
import { askFromPage } from '../lib/novandra.js'
import './PromptBar.css'

// Ideas que se van "escribiendo" en el placeholder
const ideas = [
  'una tienda en línea para mi marca…',
  'una app para agendar citas…',
  'un sistema para controlar inventario…',
  'un chatbot que atienda a mis clientes…',
]

const suggestions = [
  { icon: 'bi-bag', label: 'Tienda en línea', text: 'Quiero una tienda en línea para vender mis productos' },
  { icon: 'bi-phone', label: 'App móvil', text: 'Quiero crear una app móvil para mi negocio' },
  { icon: 'bi-stars', label: 'Automatizar con IA', text: 'Quiero automatizar procesos de mi empresa con IA' },
]

// Placeholder animado tipo máquina de escribir
function useTypewriter(words, { type = 55, erase = 25, pause = 1600 } = {}) {
  const [text, setText] = useState('')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = setTimeout(() => setText(words[0]), 0)
      return () => clearTimeout(id)
    }
    let word = 0
    let chars = 0
    let deleting = false
    let timer
    const step = () => {
      const current = words[word]
      chars += deleting ? -1 : 1
      setText(current.slice(0, chars))
      let delay = deleting ? erase : type
      if (!deleting && chars === current.length) {
        deleting = true
        delay = pause
      } else if (deleting && chars === 0) {
        deleting = false
        word = (word + 1) % words.length
        delay = 400
      }
      timer = setTimeout(step, delay)
    }
    timer = setTimeout(step, 900)
    return () => clearTimeout(timer)
  }, [words, type, erase, pause])
  return text
}

export default function PromptBar() {
  const [value, setValue] = useState('')
  const idea = useTypewriter(ideas)

  const submit = text => {
    const clean = text.trim()
    if (!clean) return
    askFromPage(clean)
    setValue('')
  }

  return (
    <div className="prompt">
      <form
        className="prompt-bar"
        onSubmit={e => {
          e.preventDefault()
          submit(value)
        }}
      >
        <i className="bi bi-stars prompt-icon" aria-hidden="true" />
        <label htmlFor="hero-prompt" className="visually-hidden">Cuéntale a Novandra qué quieres construir</label>
        <input
          id="hero-prompt"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={`Quiero ${idea}`}
          autoComplete="off"
        />
        <button type="submit" aria-label="Preguntar a Novandra" disabled={!value.trim()}>
          <i className="bi bi-arrow-up" aria-hidden="true" />
        </button>
      </form>

      <div className="prompt-chips">
        {suggestions.map(s => (
          <button key={s.label} type="button" onClick={() => submit(s.text)}>
            <i className={`bi ${s.icon}`} aria-hidden="true" /> {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
