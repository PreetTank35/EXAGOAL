import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Play } from "lucide-react";

function FloatingOrb({
  className,
  delay = 0,
  duration = 6,
}: {
  className: string;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Icosahedron() {
  return (
    <svg viewBox="0 0 320 320" className="w-full h-full" fill="none">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Outer ring */}
      <motion.circle
        cx="160" cy="160" r="130"
        stroke="url(#grad1)"
        strokeWidth="0.5"
        strokeDasharray="8 4"
        opacity="0.3"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "160px 160px" }}
      />
      <motion.circle
        cx="160" cy="160" r="100"
        stroke="url(#grad2)"
        strokeWidth="0.5"
        strokeDasharray="5 6"
        opacity="0.25"
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "160px 160px" }}
      />

      {/* Central polyhedron faces */}
      <motion.polygon
        points="160,40 260,120 220,240 100,240 60,120"
        fill="url(#grad1)"
        opacity="0.08"
        stroke="url(#grad1)"
        strokeWidth="1"
        filter="url(#glow)"
        animate={{ opacity: [0.08, 0.14, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.polygon
        points="160,40 260,120 160,160"
        fill="url(#grad2)"
        opacity="0.15"
        stroke="#8b5cf6"
        strokeWidth="0.8"
        filter="url(#glow)"
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.polygon
        points="260,120 220,240 160,160"
        fill="url(#grad3)"
        opacity="0.12"
        stroke="#06b6d4"
        strokeWidth="0.8"
        animate={{ opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.polygon
        points="100,240 60,120 160,160"
        fill="url(#grad2)"
        opacity="0.12"
        stroke="#ec4899"
        strokeWidth="0.8"
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />
      <motion.polygon
        points="160,40 60,120 160,160"
        fill="url(#grad1)"
        opacity="0.1"
        stroke="#8b5cf6"
        strokeWidth="0.8"
        animate={{ opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.polygon
        points="220,240 100,240 160,160"
        fill="url(#grad3)"
        opacity="0.1"
        stroke="#06b6d4"
        strokeWidth="0.8"
        animate={{ opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Bright edges */}
      {[
        ["160,40", "260,120"],
        ["260,120", "220,240"],
        ["220,240", "100,240"],
        ["100,240", "60,120"],
        ["60,120", "160,40"],
        ["160,40", "160,160"],
        ["260,120", "160,160"],
        ["220,240", "160,160"],
        ["100,240", "160,160"],
        ["60,120", "160,160"],
      ].map(([p1, p2], i) => (
        <motion.line
          key={i}
          x1={p1.split(",")[0]}
          y1={p1.split(",")[1]}
          x2={p2.split(",")[0]}
          y2={p2.split(",")[1]}
          stroke={i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#06b6d4" : "#ec4899"}
          strokeWidth="1"
          opacity="0.6"
          filter="url(#glow)"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        />
      ))}

      {/* Vertex dots */}
      {[
        [160, 40],
        [260, 120],
        [220, 240],
        [100, 240],
        [60, 120],
        [160, 160],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          fill={i % 3 === 0 ? "#8b5cf6" : i % 3 === 1 ? "#06b6d4" : "#ec4899"}
          filter="url(#glow)"
          animate={{ r: [3, 5, 3], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}

      {/* Orbiting particle */}
      <motion.circle
        r="3"
        fill="#ec4899"
        filter="url(#glow)"
        animate={{
          cx: [160, 260, 160, 60, 160],
          cy: [40, 120, 240, 120, 40],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yShape = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background orbs */}
      <FloatingOrb
        className="w-[600px] h-[600px] bg-[#8b5cf6] opacity-[0.12] top-[-10%] left-[-10%]"
        delay={0}
        duration={8}
      />
      <FloatingOrb
        className="w-[400px] h-[400px] bg-[#06b6d4] opacity-[0.1] bottom-[5%] right-[-5%]"
        delay={2}
        duration={7}
      />
      <FloatingOrb
        className="w-[300px] h-[300px] bg-[#ec4899] opacity-[0.08] top-[20%] right-[20%]"
        delay={1}
        duration={9}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial fade overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.12),transparent)]" />

      <div className="relative w-full max-w-7xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <motion.div style={{ y: yText, opacity }} className="flex flex-col gap-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" />
            <span
              className="text-[#a78bfa] text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
            >
              Now in public beta
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(2.6rem, 5vw, 4.25rem)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Reach every{" "}
            <span
              className="relative"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              goal
            </span>{" "}
            with precision
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="text-white/55 max-w-lg"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: "1.1rem",
              lineHeight: 1.7,
            }}
          >
            Exagoal transforms how teams track, measure, and achieve their most ambitious objectives—through intelligent dashboards and real-time insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.44 }}
            className="flex flex-wrap items-center gap-4"
          >
            <a
              href="#"
              className="relative group flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-white overflow-hidden"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#0891b2]" />
              <span className="absolute inset-0 rounded-xl shadow-[0_0_24px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_40px_rgba(139,92,246,0.75)] transition-all duration-300" />
              <span className="relative">Start for free</span>
              <ArrowRight size={16} className="relative group-hover:translate-x-0.5 transition-transform duration-200" />
            </a>

            <a
              href="#"
              className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-300 bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, fontSize: "0.95rem" }}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#8b5cf6]/40 to-[#06b6d4]/40 flex items-center justify-center">
                <Play size={10} className="text-white fill-white ml-0.5" />
              </div>
              Watch demo
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="flex items-center gap-6 pt-2"
          >
            {[
              { val: "50K+", label: "Teams" },
              { val: "99.9%", label: "Uptime" },
              { val: "4.9★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col gap-0.5">
                <span
                  className="text-white"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}
                >
                  {stat.val}
                </span>
                <span
                  className="text-white/40 text-xs"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* 3D Shape */}
        <motion.div
          style={{ y: yShape, opacity }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center lg:justify-end z-10"
        >
          <div className="relative w-[420px] h-[420px] max-w-full">
            {/* Glow behind shape */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.2)_0%,rgba(6,182,212,0.1)_50%,transparent_70%)] blur-2xl" />

            {/* Glass card backdrop */}
            <div className="absolute inset-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm shadow-[0_0_80px_rgba(139,92,246,0.15)]" />

            {/* Icosahedron SVG */}
            <motion.div
              className="absolute inset-0"
              animate={{ rotateY: [0, 5, -5, 0], rotateX: [0, -3, 3, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Icosahedron />
            </motion.div>

            {/* Floating data chips */}
            <motion.div
              className="absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl bg-[rgba(10,10,20,0.8)] border border-[#8b5cf6]/30 backdrop-blur-md shadow-lg"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#06b6d4] shadow-[0_0_6px_#06b6d4]" />
                <span className="text-white/80 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>Goal velocity +34%</span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -bottom-2 -left-6 px-4 py-2.5 rounded-2xl bg-[rgba(10,10,20,0.8)] border border-[#ec4899]/30 backdrop-blur-md shadow-lg"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ec4899] shadow-[0_0_6px_#ec4899]" />
                <span className="text-white/80 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>12 OKRs completed</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
    </section>
  );
}
