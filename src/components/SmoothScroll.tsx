'use client'

import { useEffect } from 'react'

export function SmoothScroll() {
  useEffect(() => {
    // Add smooth scroll behavior
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a[href^="#"]') as HTMLAnchorElement
      
      if (anchor) {
        e.preventDefault()
        const targetId = anchor.getAttribute('href')?.slice(1)
        const targetElement = targetId ? document.getElementById(targetId) : null
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          })
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    
    return () => {
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return null
}

