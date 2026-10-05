import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import Stockly from './components/Stockly.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import Novandra from './components/Novandra.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import useReveal from './hooks/useReveal.js'

export default function App() {
  useReveal()

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <Hero />
        <Services />
        <Stockly />
        <Contact />
      </main>
      <Footer />
      <Novandra />
    </>
  )
}
