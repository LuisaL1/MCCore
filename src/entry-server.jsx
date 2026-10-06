// Entrada de pre-renderizado (SEO): genera el HTML de la página en el build,
// para que buscadores y redes sociales lean el contenido sin ejecutar JavaScript.
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import App from './App.jsx'

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
