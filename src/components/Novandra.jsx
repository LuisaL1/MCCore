import { useEffect, useRef, useState } from 'react'
import { askNovandra, NOVANDRA_GREETING, QUICK_REPLIES } from '../lib/novandra.js'
import './Novandra.css'

export default function Novandra() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ from: 'bot', text: NOVANDRA_GREETING }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  const sendRef = useRef(null)
  // El botón flotante aparece al pasar el hero (ahí ya están la barra de prompt y la tarjeta de Novandra)
  const [showLauncher, setShowLauncher] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowLauncher(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onAsk = e => {
      setOpen(true)
      sendRef.current?.(e.detail)
    }
    window.addEventListener('novandra:open', onOpen)
    window.addEventListener('novandra:ask', onAsk)
    return () => {
      window.removeEventListener('novandra:open', onOpen)
      window.removeEventListener('novandra:ask', onAsk)
    }
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const send = async text => {
    const clean = text.trim()
    if (!clean || typing) return
    const history = [...messages, { from: 'user', text: clean }]
    setMessages(history)
    setInput('')
    setTyping(true)
    // El saludo inicial no se envía a la IA
    const answer = await askNovandra(history.slice(1))
    setTyping(false)
    setMessages(m => [...m, { from: 'bot', ...answer }])
  }

  useEffect(() => {
    sendRef.current = send
  })

  const showQuickReplies = messages.length === 1 && !typing

  return (
    <>
      <div
        className={`novandra-panel ${open ? 'open' : ''}`}
        role="dialog"
        aria-label="Chat con Novandra"
        aria-hidden={!open}
      >
        <header className="novandra-head">
          <span className="novandra-avatar"><i className="bi bi-stars" aria-hidden="true" /></span>
          <div>
            <strong>Novandra</strong>
            <small><span className="online-dot" /> Asistente IA de MCCore</small>
          </div>
          <button className="novandra-close" onClick={() => setOpen(false)} aria-label="Cerrar chat">
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        </header>

        <div className="novandra-messages" ref={listRef} aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`msg msg-${m.from}`}>
              <p>{m.text}</p>
              {m.options && i === messages.length - 1 && !typing && (
                <div className="quick-replies in-msg">
                  {m.options.map(o => <button key={o} onClick={() => send(o)}>{o}</button>)}
                </div>
              )}
              {m.action && (
                <a
                  href={m.action.href}
                  className="msg-action"
                  target={m.action.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  {m.action.label}
                </a>
              )}
            </div>
          ))}
          {typing && (
            <div className="msg msg-bot typing" aria-label="Novandra está escribiendo">
              <span /><span /><span />
            </div>
          )}
          {showQuickReplies && (
            <div className="quick-replies">
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}
        </div>

        <form
          className="novandra-input"
          onSubmit={e => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            aria-label="Mensaje para Novandra"
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" aria-label="Enviar" disabled={!input.trim() || typing} tabIndex={open ? 0 : -1}>
            <i className="bi bi-send-fill" aria-hidden="true" />
          </button>
        </form>
      </div>

      <button
        className={`novandra-launcher ${open ? 'is-open' : ''} ${showLauncher || open ? '' : 'is-hidden'}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Cerrar chat con Novandra' : 'Abrir chat con Novandra'}
        aria-expanded={open}
      >
        <i className={`bi ${open ? 'bi-chevron-down' : 'bi-stars'}`} aria-hidden="true" />
        {!open && <span className="launcher-label">Pregúntale a Novandra</span>}
      </button>
    </>
  )
}
