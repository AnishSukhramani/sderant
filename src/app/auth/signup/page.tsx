'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Terminal, User, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { registerUser } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0) // Animation step
  const [binaryChars, setBinaryChars] = useState<Array<{ x: number; y: number; char: string }>>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize binary rain effect
  useEffect(() => {
    const chars: Array<{ x: number; y: number; char: string }> = []
    for (let i = 0; i < 100; i++) {
      chars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        char: Math.random() > 0.5 ? '1' : '0'
      })
    }
    setBinaryChars(chars)

    // Start animation sequence
    setTimeout(() => setStep(1), 500)
    setTimeout(() => setStep(2), 1500)
  }, [])

  // Retina scan animation
  useEffect(() => {
    if (step >= 2 && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 300
      canvas.height = 300

      let scanY = 0
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw eye outline
        ctx.strokeStyle = '#00ff41'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.ellipse(150, 150, 80, 100, 0, 0, Math.PI * 2)
        ctx.stroke()

        // Draw iris
        ctx.beginPath()
        ctx.arc(150, 150, 40, 0, Math.PI * 2)
        ctx.stroke()

        // Draw pupil
        ctx.fillStyle = '#00ff41'
        ctx.beginPath()
        ctx.arc(150, 150, 15, 0, Math.PI * 2)
        ctx.fill()

        // Draw scan line
        ctx.strokeStyle = '#00ff41'
        ctx.lineWidth = 3
        ctx.globalAlpha = 0.7
        ctx.beginPath()
        ctx.moveTo(0, scanY)
        ctx.lineTo(300, scanY)
        ctx.stroke()
        ctx.globalAlpha = 1

        scanY = (scanY + 3) % canvas.height
        requestAnimationFrame(animate)
      }
      animate()
    }
  }, [step])

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required')
      return false
    }
    if (!username.trim()) {
      setError('Username is required')
      return false
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return false
    }
    if (!password) {
      setError('Password is required')
      return false
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const result = await registerUser(name, username, password)
      
      if (result.success) {
        setUser(result.user)
        // Show success animation
        setStep(3)
        setTimeout(() => {
          router.push('/app')
        }, 2000)
      } else {
        setError(result.error || 'Registration failed')
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none opacity-20" />
      
      {/* Binary rain */}
      <div className="fixed inset-0 pointer-events-none">
        {binaryChars.map((char, i) => (
          <motion.div
            key={i}
            className="absolute text-green-400 text-xs opacity-50"
            style={{ left: `${char.x}%`, top: `${char.y}%` }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
          >
            {char.char}
          </motion.div>
        ))}
      </div>

      {/* Scan lines */}
      <motion.div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
        }}
        animate={{
          backgroundPosition: ['0px 0px', '0px 100px'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center space-x-2 mb-4 hover:text-green-300 transition-colors">
              <Terminal className="w-6 h-6" />
              <span className="text-xl font-bold">← BACK_TO_HOME</span>
            </Link>
            <h1 className="text-4xl md:text-6xl font-bold glitch mb-4">
              USER_REGISTRATION.exe
            </h1>
            <p className="text-green-400/70">Initializing biometric authentication protocol...</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left side - Animations */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="border border-green-400/30 bg-black/80 backdrop-blur-sm p-8"
            >
              <div className="space-y-6">
                {/* Scanning animation */}
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div
                      key="initializing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin" />
                      <p className="text-lg">INITIALIZING_SYSTEM...</p>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="forming"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative h-64"
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          className="relative w-48 h-48"
                          animate={{
                            rotate: 360,
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        >
                          <User className="w-full h-full text-green-400" strokeWidth={1} />
                        </motion.div>
                      </div>
                      {/* Binary particles forming human shape */}
                      {Array.from({ length: 50 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-green-400 text-xs"
                          initial={{
                            x: Math.random() * 300 - 150,
                            y: Math.random() * 300 - 150,
                            opacity: 0,
                          }}
                          animate={{
                            x: (Math.random() - 0.5) * 200,
                            y: (Math.random() - 0.5) * 200,
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.02,
                          }}
                          style={{
                            left: '50%',
                            top: '50%',
                          }}
                        >
                          {Math.random() > 0.5 ? '1' : '0'}
                        </motion.div>
                      ))}
                      <p className="text-center mt-4">CONSTRUCTING_USER_MATRIX...</p>
                    </motion.div>
                  )}

                  {step >= 2 && step < 3 && (
                    <motion.div
                      key="retina"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <canvas
                        ref={canvasRef}
                        className="mx-auto mb-4 border border-green-400/30"
                      />
                      <p className="text-lg animate-pulse">RETINA_SCAN_ACTIVE...</p>
                      <div className="mt-4 space-y-1 text-sm text-green-400/70">
                        <p>▓▓▓▓▓▓▓▓▓▓ 100% - BIOMETRIC_READY</p>
                        <p>▓▓▓▓▓▓▓▓▓▓ 100% - NEURAL_LINK_ACTIVE</p>
                        <p>▓▓▓▓▓▓▓▓▓▓ 100% - ENCRYPTION_ONLINE</p>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center"
                    >
                      <CheckCircle2 className="w-24 h-24 mx-auto mb-4 text-green-400" />
                      <p className="text-2xl font-bold mb-2">REGISTRATION_COMPLETE</p>
                      <p className="text-green-400/70">Redirecting to terminal...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="border border-green-400/30 bg-black/80 backdrop-blur-sm p-8"
            >
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-400/70 ml-4">register@sderant:~$</span>
                </div>
                <h2 className="text-2xl font-bold">CREATE_USER</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">
                    <span className="text-green-400">$</span> DISPLAY_NAME:
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400/50" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your display name"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Username field */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">
                    <span className="text-green-400">$</span> USERNAME:
                  </label>
                  <div className="relative">
                    <Terminal className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400/50" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                      placeholder="Choose a unique username"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  <p className="text-xs text-green-400/50 mt-1">
                    Min 3 characters. Will be hashed with SHA-256.
                  </p>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">
                    <span className="text-green-400">$</span> PASSWORD:
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400/50" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter secure password"
                      className="w-full pl-10 pr-12 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400/50 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-green-400/50 mt-1">
                    Min 8 characters. Will be hashed with SHA-256.
                  </p>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label className="block text-sm mb-2 text-green-400/70">
                    <span className="text-green-400">$</span> CONFIRM_PASSWORD:
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400/50" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400/50 hover:text-green-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-900/20 border border-red-400/50 p-3 flex items-start space-x-2"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-green-400 text-black font-bold hover:bg-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>PROCESSING...</span>
                    </>
                  ) : (
                    <span>REGISTER_USER</span>
                  )}
                </button>

                {/* Login link */}
                <div className="text-center pt-4 border-t border-green-400/20">
                  <p className="text-green-400/70 text-sm">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-green-400 hover:text-green-300 transition-colors">
                      LOGIN_HERE
                    </Link>
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

