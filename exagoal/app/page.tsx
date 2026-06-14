'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiShieldCheck,
  HiAcademicCap,
  HiCpuChip,
  HiLockClosed,
  HiChartBar,
  HiFingerPrint,
  HiArrowRight,
  HiSparkles,
  HiGlobeAlt,
  HiUserGroup,
} from 'react-icons/hi2';

const FEATURES = [
  {
    icon: HiCpuChip,
    title: 'AI-Powered Intelligence',
    description: 'Multi-model AI via OpenRouter generates solutions, grades essays, and provides personalized feedback — turning every exam into a learning event.',
    color: '#8b5cf6', // Electric Purple
    tag: 'OpenRouter API',
  },
  {
    icon: HiShieldCheck,
    title: 'Blockchain Credentials',
    description: 'Exam results are hashed and anchored on-chain. Employers verify certificates in seconds via QR code — tamper-proof, permanent, global.',
    color: '#06b6d4', // Cyan
    tag: 'Polygon',
  },
  {
    icon: HiFingerPrint,
    title: 'OTP-Gated Access',
    description: 'Individual one-time passwords delivered 5 minutes before exam start. Each student gets unique, time-bound access — no shared links, no leaks.',
    color: '#ec4899', // Magenta
    tag: 'Secure',
  },
  {
    icon: HiLockClosed,
    title: 'Anti-Cheat Lockdown',
    description: 'Camera API blocked, clipboard disabled, fullscreen enforced, tab-switches logged. Multi-layered browser-level integrity.',
    color: '#22c55e',
    tag: 'Privacy-First',
  },
  {
    icon: HiChartBar,
    title: 'Adaptive Difficulty',
    description: 'Questions get harder when you excel, easier when you struggle — finding your optimal challenge level in real-time.',
    color: '#f59e0b',
    tag: 'AI Engine',
  },
  {
    icon: HiAcademicCap,
    title: 'Holistic Development',
    description: "Inspired by Japan's Chi-Toku-Tai (知徳体) framework. Score across Knowledge, Virtue, and Wellness.",
    color: '#3b82f6',
    tag: '知徳体',
  },
];

const STATS = [
  { value: '3', label: 'Dimensions of Growth', suffix: '' },
  { value: '99.9', label: 'Credential Integrity', suffix: '%' },
  { value: '400', label: 'AI Models Available', suffix: '+' },
  { value: '< 5', label: 'Second Verification', suffix: 's' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-purple-500/30">
      {/* 3D Abstract Background Shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] rounded-[40%_60%_70%_30%] opacity-20 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(236,72,153,0.2))',
            top: '-20%',
            right: '-10%',
          }}
        />
        <motion.div
          animate={{
            rotate: [360, 270, 180, 90, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] rounded-[60%_40%_30%_70%] opacity-15 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.8), rgba(99,102,241,0.2))',
            bottom: '-10%',
            left: '-10%',
          }}
        />
      </div>

      {/* Floating Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none">
        <motion.nav 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className={`pointer-events-auto flex items-center justify-between px-6 py-3 w-full max-w-5xl transition-all duration-300 ${scrolled ? 'nav-glass' : 'bg-transparent'}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-lg shadow-purple-500/20">
              <HiAcademicCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Exa<span className="text-[#06b6d4]">Goal</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Features</a>
            <a href="#security" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Security</a>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
            <Link href="/register" className="btn-primary text-sm !py-2.5 !px-6 shadow-[0_0_20px_rgba(139,92,246,0.3)]">Get Started</Link>
          </div>
        </motion.nav>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Subtle floating 3D elements around hero */}
          <div className="absolute -left-20 top-0 text-6xl opacity-40 animate-float-complex blur-[1px]">💎</div>
          <div className="absolute -right-16 bottom-10 text-6xl opacity-40 animate-float-reverse blur-[1px]">🔮</div>
          
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm font-semibold mb-8 backdrop-blur-md shadow-xl">
            <HiSparkles className="w-4 h-4 text-[#ec4899]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#ec4899]">
              Reimagining the Future of Examinations
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl lg:text-[7.5rem] font-extrabold tracking-tighter leading-[1.05] max-w-6xl mx-auto drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          Assess <span className="gradient-text">Potential</span>
          <br />
          <span className="text-white/90">Not Just Answers</span>
        </motion.h1>

        <motion.p
          className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed font-medium"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          Fair, secure, and intelligent examinations powered by AI. Credentials verified instantly on the Polygon blockchain.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row gap-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href="/register"
            className="btn-primary text-lg !py-4 !px-10 flex items-center gap-3 animate-pulse-glow"
          >
            Start Building
            <HiArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="btn-secondary text-lg !py-4 !px-10 flex items-center gap-2"
          >
            Explore Features
          </Link>
        </motion.div>
      </section>

      {/* Stats Strip */}
      <section className="relative z-10 py-10 border-y border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {STATS.map((stat, idx) => (
              <motion.div 
                key={stat.label} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg tracking-tight mb-2">
                  {stat.value}
                  <span className="text-2xl text-zinc-500 font-bold">{stat.suffix}</span>
                </div>
                <div className="text-sm font-semibold text-zinc-400 tracking-wide uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Intelligent Features for <br/>
              <span className="gradient-text-cool">Modern Assessment</span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
              Every interaction is designed to make exams fairer, radically secure, and genuinely insightful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className="glass-card glass-card-hover p-8 group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: `linear-gradient(135deg, ${feature.color}33, ${feature.color}11)`, border: `1px solid ${feature.color}44` }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{ background: `${feature.color}15`, color: feature.color, border: `1px solid ${feature.color}33` }}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-base text-zinc-400 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 md:px-12 py-32 mb-20">
        <motion.div
          className="max-w-5xl mx-auto glass-card p-16 md:p-24 text-center relative overflow-hidden rounded-[3rem]"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Intense Glow Background inside CTA */}
          <div
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.4), transparent 60%)',
            }}
          />
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
              <HiUserGroup className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-md">
              Ready to Transform Assessment?
            </h2>
            <p className="text-zinc-300 text-xl max-w-2xl mx-auto mb-12 font-medium">
              Join institutions worldwide building a fairer, smarter, and tamper-proof future for education.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link
                href="/register"
                className="btn-primary text-lg !py-4 !px-10 flex items-center justify-center gap-3 w-full sm:w-auto"
              >
                Create Account
                <HiArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-lg !py-4 !px-10 w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-black/40 px-6 md:px-12 py-12 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center">
              <HiAcademicCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ExaGoal</span>
          </div>
          <p className="text-sm font-medium text-zinc-500">
            © {new Date().getFullYear()} ExaGoal. Assess potential. Not just answers.
          </p>
          <div className="flex gap-8 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
