import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
// Solo las partes de Bootstrap que usa la página (base, cuadrícula y utilidades): carga más rápido
import 'bootstrap/dist/css/bootstrap-reboot.min.css'
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import 'bootstrap/dist/css/bootstrap-utilities.min.css'
// Fuentes dentro del proyecto (sin pedirlas a Google): la página pinta antes
import '@fontsource/raleway/latin-400.css'
import '@fontsource/raleway/latin-500.css'
import '@fontsource/raleway/latin-600.css'
import '@fontsource/raleway/latin-700.css'
import '@fontsource/raleway/latin-800.css'
import '@fontsource/open-sans/latin-400.css'
import '@fontsource/open-sans/latin-600.css'
import '@fontsource/open-sans/latin-700.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'

// Al recargar, empezar siempre arriba (el navegador restauraba el scroll y el hero
// quedaba pegado al navbar). Si la URL trae una sección (#contacto…), se respeta.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
if (!location.hash) window.scrollTo(0, 0)

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
const root = document.getElementById('root')
// En producción el HTML ya viene pre-renderizado (SEO): React solo lo "activa".
// En desarrollo la página llega vacía y React la dibuja desde cero.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
