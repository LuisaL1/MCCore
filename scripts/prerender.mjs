// Inserta el HTML pre-renderizado de la página dentro de dist/index.html.
// Se ejecuta después de `vite build` (cliente) y `vite build --ssr` (servidor).
import { readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { render } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
const appHtml = render()

const indexPath = path.join(dist, 'index.html')
const template = await readFile(indexPath, 'utf8')
const placeholder = '<div id="root"></div>'
if (!template.includes(placeholder)) throw new Error('No se encontró <div id="root"></div> en dist/index.html')

await writeFile(indexPath, template.replace(placeholder, `<div id="root">${appHtml}</div>`))
await rm(ssrDir, { recursive: true, force: true })

console.log(`Pre-renderizado listo: ${(appHtml.length / 1024).toFixed(1)} KB de HTML en dist/index.html`)
