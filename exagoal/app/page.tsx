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
    description:
      'Multi-model AI via OpenRouter generates solutions, grades essays, and provides personalized feedback — turning every exam into a learning event.',
    color: '#6366f1',
    tag: 'OpenRouter API',
  },
  {
    icon: HiShieldCheck,
    title: 'Blockchain Credentials',
    description:
      'Exam results are hashed and anchored on-chain. Employers verify certificates in seconds via QR code — tamper-proof, permanent, global.',
    color: '#8b5cf6',
    tag: 'Polygon',
  },
  {
    icon: HiFingerPrint,
    title: 'OTP-Gated Access',
    description:
      'Individual one-time passwords delivered 5 minutes before exam start. Each student gets unique, time-bound access — no shared links, no leaks.',
    color: '#06b6d4',
    tag: 'Secure',
  },
  {
    icon: HiLockClosed,
    title: 'Anti-Cheat Lockdown',
    description:
      'Camera API blocked, clipboard disabled, fullscreen enforced, tab-switches logged. Multi-layered browser-level integrity — without invasive proctoring.',
    color: '#22c55e',
    tag: 'Privacy-First',
  },
  {
    icon: HiChartBar,
    title: 'Adaptive Difficulty',
    description:
      'Questions get harder when you excel, easier when you struggle — finding your optimal challenge level in real-time. Fair assessment, not just testing.',
    color: '#f59e0b',
    tag: 'AI Engine',
  },
  {
    icon: HiAcademicCap,
    title: 'Holistic Development',
    description:
      "Inspired by Japan's Chi-Toku-Tai (知徳体) framework. Score across Knowledge, Virtue, and Wellness — because education is more than marks.",
    color: '#ec4899',
    tag: '知徳体',
  },
];

const STATS = [
  { value: '3', label: 'Dimensions of Growth', suffix: '' },
  { value: '99.9', label: 'Credential Integrity', suffix: '%' },
  { value: '400', label: 'AI Models Available', suffix: '+' },
  { value: '< 5', label: 'Second Verification', suffix: 's' },
];

const PHILOSOPHIES = [
  {
    country: '🇫🇮 Finland',
    principles: [
      'Formative over summative assessment',
      'Teacher autonomy in evaluation',
      'Low-stress, equity-focused',
      'Creativity & critical thinking',
    ],
  },
  {
    country: '🇯🇵 Japan',
    principles: [
      'Chi (知) — Knowledge mastery',
      'Toku (徳) — Moral & ethical growth',
      'Tai (体) — Physical & mental wellness',
      'Discipline through self-improvement',
    ],
  },
];

export default function LandingPage() {
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)',
            top: '-10%',
            left: '-5%',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)',
            bottom: '10%',
            right: '-10%',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'float 10s ease-in-out infinite',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <HiAcademicCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Exa<span className="text-indigo-400">Goal</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#philosophy" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Philosophy
          </a>
          <a href="#security" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Security
          </a>
          <Link
            href="/login"
            className="btn-ghost text-sm"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-primary text-sm !py-2 !px-5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 md:pt-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-8">
            <HiSparkles className="w-4 h-4" />
            Reimagining the Future of Examinations
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          Assess{' '}
          <span className="gradient-text">Potential</span>
          <br />
          Not Just Answers
        </motion.h1>

        <motion.p
          className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        >
          Fair, secure, and intelligent examinations powered by AI. Credentials
          verified on blockchain. Inspired by the world&apos;s best education systems.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: 'easeOut' }}
        >
          <Link
            href="/register"
            className="btn-primary text-base !py-3.5 !px-8 flex items-center gap-2"
          >
            Start Free Trial
            <HiArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="btn-secondary text-base !py-3.5 !px-8"
          >
            Explore Features
          </Link>
        </motion.div>

        {/* Stats Strip */}
        <motion.div
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">
                {stat.value}
                <span className="text-xl">{stat.suffix}</span>
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Intelligent Features for{' '}
              <span className="gradient-text">Modern Assessment</span>
            </h2>
            <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
              Every feature is designed to make exams fairer, more secure, and genuinely insightful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                className={`glass-card glass-card-hover p-7 cursor-pointer ${
                  activeFeature === idx ? 'ring-1 ring-indigo-500/40' : ''
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${feature.color}18` }}
                  >
                    <feature.icon
                      className="w-5 h-5"
                      style={{ color: feature.color }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: `${feature.color}15`,
                      color: feature.color,
                    }}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Inspired by the{' '}
              <span className="gradient-text">World&apos;s Best</span>
            </h2>
            <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
              Our assessment philosophy draws from Finland and Japan — two nations
              that consistently lead global education rankings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PHILOSOPHIES.map((phil, idx) => (
              <motion.div
                key={phil.country}
                className="glass-card p-8"
                initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6">{phil.country}</h3>
                <ul className="space-y-4">
                  {phil.principles.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-3 text-zinc-300"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      <span className="text-sm leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Chi-Toku-Tai Visualization */}
          <motion.div
            className="mt-12 glass-card p-8 md:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-8 text-center">
              Three Dimensions of Student Development
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  emoji: '📊',
                  name: 'Chi (知)',
                  label: 'Knowledge',
                  desc: 'Academic proficiency, critical thinking, analytical reasoning',
                  color: '#6366f1',
                  weight: '40%',
                },
                {
                  emoji: '🤝',
                  name: 'Toku (徳)',
                  label: 'Virtue',
                  desc: 'Ethical reasoning, collaboration, moral development',
                  color: '#8b5cf6',
                  weight: '35%',
                },
                {
                  emoji: '🧘',
                  name: 'Tai (体)',
                  label: 'Wellness',
                  desc: 'Self-awareness, mental well-being, growth mindset',
                  color: '#06b6d4',
                  weight: '25%',
                },
              ].map((dim) => (
                <div
                  key={dim.name}
                  className="text-center p-6 rounded-xl"
                  style={{ background: `${dim.color}08` }}
                >
                  <div className="text-4xl mb-3">{dim.emoji}</div>
                  <h4 className="text-lg font-bold" style={{ color: dim.color }}>
                    {dim.name}
                  </h4>
                  <p className="text-sm text-zinc-500 mt-0.5">{dim.label}</p>
                  <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                    {dim.desc}
                  </p>
                  <div
                    className="mt-4 inline-block text-xs font-semibold px-3 py-1 rounded-full"
                    style={{
                      background: `${dim.color}15`,
                      color: dim.color,
                    }}
                  >
                    Weight: {dim.weight}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="relative z-10 px-6 md:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Multi-Layered{' '}
              <span className="gradient-text">Security</span>
            </h2>
            <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
              Every exam is protected by overlapping security measures — from browser-level lockdowns to blockchain-anchored results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: HiLockClosed,
                title: 'Camera & Screen Capture Blocked',
                desc: 'Permissions-Policy headers deny camera/microphone/display-capture. JS overrides block getUserMedia. CSP blocks media streams.',
              },
              {
                icon: HiFingerPrint,
                title: 'Individual OTP Access',
                desc: 'HMAC-SHA256 hashed OTPs, 10-minute expiry, single-use. Tied to authenticated session with device fingerprinting.',
              },
              {
                icon: HiShieldCheck,
                title: 'Immutable Credentials',
                desc: 'SHA-256 hashed results anchored to Polygon blockchain via smart contract. QR code verification for employers.',
              },
              {
                icon: HiGlobeAlt,
                title: 'Real-Time Integrity Monitoring',
                desc: 'AI analyzes tab switches, idle time, answer patterns, and submission timing. Anomalies flagged in real-time to proctors.',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                className="glass-card p-7 flex gap-5"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 md:px-12 py-24">
        <motion.div
          className="max-w-4xl mx-auto glass-card p-12 md:p-16 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(99,102,241,0.15), transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <HiUserGroup className="w-12 h-12 text-indigo-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Assessment?
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-8">
              Join institutions worldwide building a fairer, smarter future for
              examinations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="btn-primary text-base !py-3.5 !px-8 flex items-center justify-center gap-2"
              >
                Create Account
                <HiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="btn-secondary text-base !py-3.5 !px-8"
              >
                Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 px-6 md:px-12 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <HiAcademicCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold">ExaGoal</span>
          </div>
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} ExaGoal. Assess potential. Not just
            answers.
          </p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-zinc-300 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
