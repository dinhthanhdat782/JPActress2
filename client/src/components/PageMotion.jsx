import { useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

function PageMotion({ children }) {
  const pageRef = useRef(null)
  const { pathname } = useLocation()

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(pageRef.current, {
        autoAlpha: 0,
        y: 14,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 0.42,
        ease: 'power2.out',
        clearProps: 'transform',
      })
    })
    return () => media.revert()
  }, { dependencies: [pathname], revertOnUpdate: true, scope: pageRef })

  return <main className="main-content" ref={pageRef}>{children}</main>
}

export default PageMotion
