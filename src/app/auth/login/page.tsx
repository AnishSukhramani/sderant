'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Terminal, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react'
import { loginUser } from '@/lib/auth'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(0) // Animation step
  const [scanProgress, setScanProgress] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Initialize scan animation
  useEffect(() => {
    setTimeout(() => setStep(1), 500)
    
    // Progress bar animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) return 0
        return prev + 1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Fingerprint scan animation
  useEffect(() => {
    if (step >= 1 && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 300
      canvas.height = 300

      const centerX = 150
      const centerY = 150
      let angle = 0

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Draw fingerprint circles
        ctx.strokeStyle = '#00ff41'
        ctx.lineWidth = 1.5
        
        for (let i = 0; i < 8; i++) {
          ctx.globalAlpha = 0.3 + (i * 0.1)
          ctx.beginPath()
          ctx.arc(centerX, centerY, 20 + i * 15, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Draw rotating scan line
        ctx.globalAlpha = 0.8
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(
          centerX + Math.cos(angle) * 120,
          centerY + Math.sin(angle) * 120
        )
        ctx.stroke()

        // Draw scanning arc
        ctx.globalAlpha = 0.6
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(centerX, centerY, 130, angle - 0.5, angle + 0.5)
        ctx.stroke()

        ctx.globalAlpha = 1
        angle += 0.05
        requestAnimationFrame(animate)
      }
      animate()
    }
  }, [step])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }

    setIsSubmitting(true)
    setStep(2) // Show authentication animation

    try {
      const result = await loginUser(username, password)
      
      if (result.success) {
        setUser(result.user)
        // Show success animation
        setStep(3)
        setTimeout(() => {
          router.push('/app')
        }, 2000)
      } else {
        setError(result.error || 'Login failed')
        setIsSubmitting(false)
        setStep(1)
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An unexpected error occurred')
      setIsSubmitting(false)
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono relative overflow-hidden">
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none opacity-20" />
      
      {/* Animated grid */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
          animate={{
            backgroundPosition: ['0px 0px', '50px 50px'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
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
              USER_AUTHENTICATION.exe
            </h1>
            <p className="text-green-400/70">Verifying credentials and biometric signature...</p>
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
                      <p className="text-lg">INITIALIZING_AUTH_PROTOCOL...</p>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div
                      key="ready"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <canvas
                        ref={canvasRef}
                        className="mx-auto mb-4 border border-green-400/30"
                      />
                      <p className="text-lg mb-4">BIOMETRIC_SCANNER_READY</p>
                      
                      {/* System status */}
                      <div className="space-y-2 text-sm text-green-400/70 text-left">
                        <div className="flex items-center justify-between">
                          <span>SECURITY_LEVEL:</span>
                          <span className="text-green-400 font-bold">MAXIMUM</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>ENCRYPTION:</span>
                          <span className="text-green-400 font-bold">SHA-256</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>SYSTEM_STATUS:</span>
                          <span className="text-green-400 font-bold">ONLINE</span>
                        </div>
                        
                        {/* Scanning progress bar */}
                        <div className="pt-4">
                          <div className="flex justify-between text-xs mb-1">
                            <span>SCAN_PROGRESS:</span>
                            <span>{scanProgress}%</span>
                          </div>
                          <div className="w-full bg-black border border-green-400/30 h-2">
                            <motion.div
                              className="h-full bg-green-400"
                              style={{ width: `${scanProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="authenticating"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="relative mb-8">
                        <Shield className="w-32 h-32 mx-auto text-green-400" />
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                          <div className="w-40 h-40 border-4 border-transparent border-t-green-400 rounded-full" />
                        </motion.div>
                      </div>
                      <p className="text-xl font-bold mb-4 animate-pulse">AUTHENTICATING...</p>
                      <div className="space-y-2 text-sm text-green-400/70">
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          ▓ Verifying credentials...
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          ▓ Checking security hash...
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          ▓ Establishing secure connection...
                        </motion.p>
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
                      <p className="text-2xl font-bold mb-2">ACCESS_GRANTED</p>
                      <p className="text-green-400/70 mb-4">Welcome back, user.</p>
                      <div className="space-y-1 text-sm text-green-400/70">
                        <p>✓ Authentication successful</p>
                        <p>✓ Security clearance verified</p>
                        <p>✓ Loading terminal interface...</p>
                      </div>
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
                  <span className="text-sm text-green-400/70 ml-4">login@sderant:~$</span>
                </div>
                <h2 className="text-2xl font-bold">USER_LOGIN</h2>
                <p className="text-sm text-green-400/70 mt-2">
                  Enter your credentials to access the system
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="Enter your username"
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                      autoComplete="username"
                    />
                  </div>
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
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-12 py-3 bg-black/50 border border-green-400/30 text-green-400 placeholder-green-400/30 focus:border-green-400 focus:outline-none transition-colors"
                      disabled={isSubmitting}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400/50 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                      <div className="flex-1">
                        <p className="text-red-400 text-sm">{error}</p>
                        <p className="text-red-400/70 text-xs mt-1">
                          Authentication failed. Please verify your credentials.
                        </p>
                      </div>
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
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>ACCESS_SYSTEM</span>
                    </>
                  )}
                </button>

                {/* Security notice */}
                <div className="bg-black/60 border border-green-400/20 p-3 text-xs text-green-400/70">
                  <p className="mb-1">🔒 SECURITY_NOTICE:</p>
                  <p>Your credentials are encrypted with SHA-256 before transmission. All communications are secured.</p>
                </div>

                {/* Signup link */}
                <div className="text-center pt-4 border-t border-green-400/20">
                  <p className="text-green-400/70 text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" className="text-green-400 hover:text-green-300 transition-colors">
                      REGISTER_HERE
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

