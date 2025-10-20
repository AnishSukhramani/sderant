'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

type CursorMode = 'default' | 'button' | 'link' | 'text'

export function CustomCursor() {
  const [cursorMode, setCursorMode] = useState<CursorMode>('default')
  const [isClicking, setIsClicking] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [trail, setTrail] = useState<{ x: number; y: number; id: number; char: string }[]>([])
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([])
  const [blinkState, setBlinkState] = useState(true)
  const lastPos = useRef({ x: 0, y: 0 })
  const trailCounter = useRef(0)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const springConfig = { damping: 20, stiffness: 200 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkState(prev => !prev)
    }, 530)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    let frameId: number

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)

      // Create trail effect with random characters
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastPos.current.x, 2) + 
        Math.pow(e.clientY - lastPos.current.y, 2)
      )

      if (distance > 15) {
        const chars = ['0', '1', '>', '_', '|', '/', '\\', '-', '+', '*', '#', '@']
        const id = Date.now() + trailCounter.current++
        setTrail(prev => {
          const newTrail = [
            ...prev, 
            { 
              x: e.clientX, 
              y: e.clientY, 
              id, 
              char: chars[Math.floor(Math.random() * chars.length)]
            }
          ]
          return newTrail.slice(-12) // Keep last 12 trail items
        })
        
        setTimeout(() => {
          setTrail(prev => prev.filter(t => t.id !== id))
        }, 600)

        lastPos.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / scrollHeight
      setScrollProgress(progress)
    }

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true)
      
      // Create particle explosion
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        const distance = 50
        const id = Date.now() + i
        const x = e.clientX + Math.cos(angle) * distance
        const y = e.clientY + Math.sin(angle) * distance
        
        setParticles(prev => [...prev, { x, y, id }])
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== id))
        }, 500)
      }
    }

    const handleMouseUp = () => {
      setIsClicking(false)
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        setCursorMode('button')
      } else if (target.tagName === 'A' || target.closest('a')) {
        setCursorMode('link')
      } else if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.closest('input') || 
        target.closest('textarea')
      ) {
        setCursorMode('text')
      } else {
        setCursorMode('default')
      }
    }

    const animate = () => {
      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseover', handleMouseOver)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseover', handleMouseOver)
    }
  }, [cursorX, cursorY])

  // Different cursor shapes based on mode
  const getCursorContent = () => {
    switch (cursorMode) {
      case 'button':
        return '[ ]'
      case 'link':
        return '→'
      case 'text':
        return blinkState ? '|' : ''
      default:
        return blinkState ? '█' : '▓'
    }
  }

  const getCursorRotation = () => {
    if (cursorMode === 'link') return 0
    return scrollProgress * 360
  }

  return (
    <>
      {/* Trail Effect */}
      {trail.map((item) => (
        <motion.div
          key={item.id}
          className="cursor-trail"
          style={{
            left: item.x,
            top: item.y,
          }}
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {item.char}
        </motion.div>
      ))}

      {/* Click Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="cursor-particle"
          initial={{ 
            left: cursorXSpring.get(), 
            top: cursorYSpring.get(),
            scale: 1,
            opacity: 1 
          }}
          animate={{ 
            left: particle.x,
            top: particle.y,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      ))}

      {/* Scan Line */}
      <motion.div
        className="cursor-scanline"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
        }}
        animate={{
          scaleX: isClicking ? 2 : 1,
          opacity: isClicking ? 1 : 0.3,
        }}
      />

      {/* Main Terminal Cursor */}
      <motion.div
        className="cursor-terminal"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          rotate: getCursorRotation(),
        }}
        animate={{
          scale: isClicking ? 0.8 : cursorMode === 'button' ? 1.3 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <span className="cursor-character">{getCursorContent()}</span>
        
        {/* Glitch Effect */}
        {isClicking && (
          <>
            <span className="cursor-glitch cursor-glitch-1">{getCursorContent()}</span>
            <span className="cursor-glitch cursor-glitch-2">{getCursorContent()}</span>
          </>
        )}
      </motion.div>

      {/* Outer Brackets for Button Hover */}
      {cursorMode === 'button' && (
        <motion.div
          className="cursor-brackets"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
          }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <span className="bracket-left">{'<'}</span>
          <span className="bracket-right">{'>'}</span>
        </motion.div>
      )}

      {/* Ambient Glow */}
      <motion.div
        className="cursor-ambient-glow"
        style={{
          left: cursorXSpring,
          top: cursorYSpring,
          opacity: scrollProgress * 0.5 + 0.2,
          scale: 1 + scrollProgress * 0.5,
        }}
      />

      {/* Matrix Rain Effect on Click */}
      {isClicking && (
        <motion.div
          className="cursor-matrix"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              className="matrix-char"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              style={{ left: `${(i - 3) * 8}px` }}
            >
              {String.fromCharCode(33 + Math.random() * 94)}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Hexagon Grid for Special Scroll Points */}
      {scrollProgress > 0.25 && scrollProgress < 0.75 && (
        <motion.div
          className="cursor-hex-grid"
          style={{
            left: cursorXSpring,
            top: cursorYSpring,
          }}
          animate={{
            rotate: scrollProgress * 720,
            scale: [1, 1.2, 1],
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity },
            rotate: { duration: 0 }
          }}
        />
      )}
    </>
  )
}

