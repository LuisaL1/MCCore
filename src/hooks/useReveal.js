import { useEffect } from 'react'

// Muestra con animación los elementos marcados con data-reveal cuando entran en pantalla
export default function useReveal() {
  useEffect(() => {
    const items = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    items.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}
