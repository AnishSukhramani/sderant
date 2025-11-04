'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Terminal, Code, Users, Rocket, Heart, MessageSquare, Sparkles, ArrowRight, Github, Mail, DollarSign, Globe } from 'lucide-react'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { MagneticButton } from '@/components/MagneticButton'
import { WorldMapDemo } from '@/components/WorldMapDemo'

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])

  return (
    <div ref={containerRef} className="min-h-screen text-[#00ff41] font-mono overflow-x-hidden relative">
      {/* World Map Background */}
      <WorldMapDemo />
      
      {/* Matrix background */}
      <div className="fixed inset-0 matrix-bg pointer-events-none" />
      <MatrixRain />

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-[#00ff41]/20 bg-black/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Terminal className="w-6 h-6 sm:w-8 sm:h-8 text-[#00ff41]" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold glitch">SUDONET.exe</h1>
            </div>
            <Link href="/app">
              <MagneticButton
                className="px-4 sm:px-6 py-2 border border-[#00ff41] text-[#00ff41] hover:bg-[#00ff41] hover:text-black transition-all duration-300 text-sm sm:text-base"
              >
                LAUNCH_APP
              </MagneticButton>
            </Link>
              </div>
            </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen bg-black/30 flex items-center justify-center overflow-hidden pt-20 z-10">
        
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glitch text shadow animation - commented out */}
            {/* animate={{ 
              textShadow: [
                "0.05em 0 0 #00ff41, -0.05em -0.025em 0 #ff6b35",
                "0.025em 0.05em 0 #00ff41, 0.05em 0 0 #ff6b35",
                "-0.05em -0.025em 0 #00ff41, 0.025em 0.025em 0 #ff6b35"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }} */}
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-[#00ff41]"
            >
              WHERE DEVS RANT<br />
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-[#00ff41]/80">
                {'// Anonymous. Real. Raw.'}
              </span>
            </motion.h2>
            
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-[#00ff41]/70 mb-8 max-w-3xl mx-auto px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              The global terminal for software engineers. Share your thoughts, 
              memes, and experiences with developers worldwide. No accounts, 
              no tracking, just pure chaos.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link href="/app">
                <MagneticButton
                  className="px-8 py-4 bg-[#00ff41] text-black font-bold text-lg flex items-center space-x-2 group hover:shadow-[0_0_20px_rgba(0,255,65,0.5)]"
                  strength={0.4}
                >
                  <span>START_RANTING</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </Link>
              
              <MagneticButton
                className="px-8 py-4 border-2 border-[#00ff41] text-[#00ff41] font-bold text-lg hover:bg-[#00ff41]/10 transition-colors"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                }}
                strength={0.4}
              >
                LEARN_MORE
              </MagneticButton>
            </motion.div>
          </motion.div>

          {/* Terminal Stats */}
          <motion.div 
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {[
              { label: 'ACTIVE_DEVS', value: '10K+', icon: Users },
              { label: 'RANTS_POSTED', value: '50K+', icon: MessageSquare },
              { label: 'COUNTRIES', value: '120+', icon: Globe },
              { label: 'UPTIME', value: '99.9%', icon: Rocket }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, borderColor: '#00ff41' }}
                className="border border-[#00ff41]/30 bg-black/50 backdrop-blur-sm p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + index * 0.1 }}
              >
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-[#00ff41] mb-2 mx-auto" />
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#00ff41]">{stat.value}</div>
                <div className="text-xs sm:text-sm text-[#00ff41]/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-[#00ff41] rounded-full flex justify-center pt-2">
            <motion.div 
              className="w-1 h-2 bg-[#00ff41] rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 glitch">
              FEATURES.exe
            </h3>
            <p className="text-lg sm:text-xl text-[#00ff41]/70">
              Built for developers, by developers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: Terminal,
                title: 'ANONYMOUS_POSTING',
                description: 'No sign-ups, no logins. Just open your terminal and start ranting. Your privacy is our priority.',
                color: 'text-[#00ff41]'
              },
              {
                icon: Rocket,
                title: 'REAL_TIME_UPDATES',
                description: 'See posts appear instantly. Experience the pulse of the global dev community in real-time.',
                color: 'text-blue-400'
              },
              {
                icon: Heart,
                title: 'REACT_&_ENGAGE',
                description: 'Like, comment, and share your thoughts. Build connections without compromising anonymity.',
                color: 'text-red-400'
              },
              {
                icon: Code,
                title: 'CODE_SYNTAX_SUPPORT',
                description: 'Share code snippets with beautiful syntax highlighting. Make your rants technical.',
                color: 'text-yellow-400'
              },
              {
                icon: Globe,
                title: 'GLOBAL_COMMUNITY',
                description: 'Connect with developers from every corner of the world. Different time zones, same frustrations.',
                color: 'text-cyan-400'
              },
              {
                icon: Sparkles,
                title: 'TRENDING_ALGORITHM',
                description: 'Discover what\'s hot in the dev world. Our algorithm surfaces the best rants and memes.',
                color: 'text-purple-400'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05, 
                  borderColor: '#00ff41',
                  boxShadow: '0 0 20px rgba(0, 255, 65, 0.3)'
                }}
                className="border border-[#00ff41]/30 bg-black/50 backdrop-blur-sm p-6 sm:p-8 group"
              >
                <feature.icon className={`w-10 h-10 sm:w-12 sm:h-12 ${feature.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h4 className="text-xl sm:text-2xl font-bold mb-3 text-[#00ff41]">{feature.title}</h4>
                <p className="text-[#00ff41]/70 text-sm sm:text-base">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black/50 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 glitch">
              HOW_IT_WORKS.sh
            </h3>
            <p className="text-lg sm:text-xl text-[#00ff41]/70">
              Three steps to join the chaos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'OPEN_TERMINAL',
                description: 'Navigate to SUDONET. No account needed, no email required. Just click and start.',
                command: '$ cd /sudonet && ./launch'
              },
              {
                step: '02',
                title: 'WRITE_YOUR_RANT',
                description: 'Share your thoughts, code, memes, or frustrations. Be authentic. Be anonymous.',
                command: '$ echo "My thoughts" > rant.txt'
              },
              {
                step: '03',
                title: 'WATCH_IT_SPREAD',
                description: 'Your rant goes live instantly. Watch devs worldwide react and engage with your content.',
                command: '$ git push origin master'
              }
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="border border-[#00ff41]/30 bg-black/80 backdrop-blur-sm p-6 sm:p-8">
                  <div className="text-5xl sm:text-6xl font-bold text-[#00ff41]/20 mb-4">{step.step}</div>
                  <h4 className="text-xl sm:text-2xl font-bold mb-3 text-[#00ff41]">{step.title}</h4>
                  <p className="text-[#00ff41]/70 mb-4 text-sm sm:text-base">{step.description}</p>
                  <div className="bg-black/50 border border-[#00ff41]/20 p-3 sm:p-4 font-mono text-xs sm:text-sm">
                    <span className="text-[#00ff41]/50">$</span>{' '}
                    <span className="text-[#00ff41]">{step.command}</span>
                </div>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-[#00ff41]/30" />
                </div>
                )}
              </motion.div>
            ))}
                </div>
              </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center border-2 border-[#00ff41] bg-black/80 backdrop-blur-sm p-8 sm:p-12 md:p-16"
        >
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 glitch">
            READY_TO_RANT?
          </h3>
          <p className="text-lg sm:text-xl text-[#00ff41]/70 mb-8">
            Join thousands of developers sharing their unfiltered thoughts
          </p>
          <Link href="/app">
            <MagneticButton
              className="px-8 sm:px-12 py-4 sm:py-5 bg-[#00ff41] text-black font-bold text-lg sm:text-xl hover:shadow-[0_0_30px_rgba(0,255,65,0.6)]"
              strength={0.5}
            >
              INITIALIZE_RANT.exe
            </MagneticButton>
          </Link>
        </motion.div>
      </section>

      {/* Bottom Sections */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black/50 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {/* Contact Developer */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                borderColor: '#00ff41'
              }}
              className="border border-[#00ff41]/30 bg-black/80 backdrop-blur-sm p-6 sm:p-8"
            >
              <Mail className="w-10 h-10 sm:w-12 sm:h-12 text-[#00ff41] mb-4" />
              <h4 className="text-xl sm:text-2xl font-bold mb-3 text-[#00ff41]">CONTACT_DEV</h4>
              <p className="text-[#00ff41]/70 mb-6 text-sm sm:text-base">
                Have questions? Found a bug? Want to suggest a feature? Reach out to the developer.
              </p>
              <motion.a
                href="mailto:dev@sderant.com"
                whileHover={{ x: 5 }}
                className="text-[#00ff41] flex items-center space-x-2 group text-sm sm:text-base"
              >
                <span>dev@sderant.com</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>

            {/* Become a Contributor */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ 
                scale: 1.05,
                borderColor: '#00ff41'
              }}
              className="border border-[#00ff41]/30 bg-black/80 backdrop-blur-sm p-6 sm:p-8"
            >
              <Code className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 mb-4" />
              <h4 className="text-xl sm:text-2xl font-bold mb-3 text-[#00ff41]">MAKE_IT_BETTER</h4>
              <p className="text-[#00ff41]/70 mb-6 text-sm sm:text-base">
                Open source and proud. Contribute code, report issues, or suggest improvements. Make SUDONET better for everyone.
              </p>
              <motion.a
                href="https://github.com/yourusername/sderant"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 5 }}
                className="text-blue-400 flex items-center space-x-2 group text-sm sm:text-base"
              >
                <Github className="w-5 h-5" />
                <span>Contribute on GitHub</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>

            {/* Donate/Invest */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ 
                scale: 1.05,
                borderColor: '#00ff41'
              }}
              className="border border-[#00ff41]/30 bg-black/80 backdrop-blur-sm p-6 sm:p-8"
            >
              <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mb-4" />
              <h4 className="text-xl sm:text-2xl font-bold mb-3 text-[#00ff41]">SUPPORT_US</h4>
              <p className="text-[#00ff41]/70 mb-6 text-sm sm:text-base">
                Help us keep the servers running and the platform free. Every contribution helps us build better features.
              </p>
              <motion.a
                href="https://donate.sderant.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 5 }}
                className="text-yellow-400 flex items-center space-x-2 group text-sm sm:text-base"
              >
                <Heart className="w-5 h-5" />
                <span>Donate / Invest</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-[#00ff41]/20 bg-black/80 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Terminal className="w-6 h-6 text-[#00ff41]" />
              <span className="text-[#00ff41]/70 text-sm sm:text-base">
                © 2025 SUDONET. Built with ❤️ by developers, for developers.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm sm:text-base">
              <a href="#" className="text-[#00ff41]/70 hover:text-[#00ff41] transition-colors">Privacy</a>
              <a href="#" className="text-[#00ff41]/70 hover:text-[#00ff41] transition-colors">Terms</a>
              <a href="#" className="text-[#00ff41]/70 hover:text-[#00ff41] transition-colors">Status</a>
            </div>
          </div>
          <div className="mt-4 text-center text-[#00ff41]/50 text-xs sm:text-sm">
            <p>No cookies, no tracking, no bullshit. Just pure developer chaos.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


// Matrix Rain Effect
function MatrixRain() {
  const [columns, setColumns] = useState<number[]>([])

  useEffect(() => {
    const columnCount = Math.floor(window.innerWidth / 20)
    setColumns(Array.from({ length: columnCount }, (_, i) => i))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
      {columns.map((col) => (
        <motion.div
          key={col}
          className="absolute top-0 text-[#00ff41] text-xs font-mono"
          style={{ left: `${col * 20}px` }}
          initial={{ y: -100 }}
          animate={{ y: '100vh' }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            repeatType: 'loop',
            delay: Math.random() * 5,
            ease: 'linear'
          }}
        >
          {Array.from({ length: 20 }, () => 
            String.fromCharCode(33 + Math.random() * 94)
          ).join('\n')}
        </motion.div>
      ))}
    </div>
  )
}
