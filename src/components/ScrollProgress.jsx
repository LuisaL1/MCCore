import { useEffect, useRef } from 'react'

// Barra fina en degradado arriba de la página que muestra cuánto se ha recorrido
export default function ScrollProgress() {
  const bar = useRef(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const progress = max > 0 ? window.scrollY / max : 0
      bar.current?.style.setProperty('--progress', progress)
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])

  return <div className="scroll-progress" ref={bar} aria-hidden="true" />
}
