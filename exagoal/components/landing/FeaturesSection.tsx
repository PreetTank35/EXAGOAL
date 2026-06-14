import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  Target,
  BarChart3,
  Bell,
  Users,
  Zap,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "OKR Framework",
    description: "Structure your objectives and key results with templates built for modern teams. Align every initiative to your north star.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
    border: "rgba(139,92,246,0.25)",
    bg: "rgba(139,92,246,0.06)",
  },
  {
    icon: BarChart3,
    title: "Live Analytics",
    description: "Visualize progress in real time. Interactive charts and cohort analyses reveal exactly where you're winning or losing.",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    border: "rgba(6,182,212,0.25)",
    bg: "rgba(6,182,212,0.06)",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified the moment a metric deviates from plan. Catch risks before they become blockers with predictive signals.",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.3)",
    border: "rgba(236,72,153,0.25)",
    bg: "rgba(236,72,153,0.06)",
  },
  {
    icon: Users,
    title: "Team Alignment",
    description: "Cascade goals across departments with confidence. Everyone sees how their work contributes to company strategy.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.3)",
    border: "rgba(139,92,246,0.25)",
    bg: "rgba(139,92,246,0.06)",
  },
  {
    icon: Zap,
    title: "Automations",
    description: "Connect your existing tools—Jira, Slack, Notion—and let data flow into your goals automatically, no manual updates.",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.3)",
    border: "rgba(6,182,212,0.25)",
    bg: "rgba(6,182,212,0.06)",
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    description: "SSO, role-based access, and SOC 2 Type II compliance out of the box. Security that scales with your ambition.",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.3)",
    border: "rgba(236,72,153,0.25)",
    bg: "rgba(236,72,153,0.06)",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const Icon = feature.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group relative p-7 rounded-2xl border cursor-default"
      style={{
        background: "rgba(255,255,255,0.02)",
        borderColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Hover glow layer */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400"
        style={{
          background: feature.bg,
          border: `1px solid ${feature.border}`,
        }}
      />

      {/* Corner glow */}
      <div
        className="absolute -top-px -left-px w-24 h-24 rounded-tl-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${feature.glow}, transparent 70%)`,
        }}
      />

      <div className="relative flex flex-col gap-5">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: feature.bg,
            border: `1px solid ${feature.border}`,
            boxShadow: `0 0 20px ${feature.glow}`,
          }}
        >
          <Icon size={22} style={{ color: feature.color }} />
        </div>

        <div className="flex flex-col gap-2">
          <h3
            className="text-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700,
              fontSize: "1.05rem",
            }}
          >
            {feature.title}
          </h3>
          <p
            className="text-white/50 leading-relaxed"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 400,
              fontSize: "0.9rem",
              lineHeight: 1.65,
            }}
          >
            {feature.description}
          </p>
        </div>

        <div
          className="flex items-center gap-1.5 text-sm opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
          style={{ color: feature.color, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
        >
          Learn more
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" className="relative py-28 px-6" ref={ref}>
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(139,92,246,0.05),transparent)]" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#06b6d4]/30 bg-[#06b6d4]/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
            <span
              className="text-[#67e8f9] text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
            >
              Everything you need
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white max-w-2xl"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(1.9rem, 3.5vw, 2.9rem)",
              lineHeight: 1.15,
              letterSpacing: "-0.025em",
            }}
          >
            Features built for how great teams actually work
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/45 max-w-xl"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: "1rem",
              lineHeight: 1.7,
            }}
          >
            From startups to Fortune 500s, Exagoal gives every team the infrastructure to move fast and stay aligned.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
