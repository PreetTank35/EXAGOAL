import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "motion/react";
import { TrendingUp, TrendingDown } from "lucide-react";

function useCountUp(target: number, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [target, duration, start]);
  return val;
}

const metrics = [
  { label: "Goals achieved", value: 94, suffix: "%", trend: "+12%", up: true, color: "#8b5cf6" },
  { label: "Teams onboarded", value: 50400, suffix: "+", trend: "+8K", up: true, color: "#06b6d4" },
  { label: "Avg. time to value", value: 3, suffix: " days", trend: "-2d", up: true, color: "#ec4899" },
  { label: "Data sources", value: 120, suffix: "+", trend: "+30", up: true, color: "#8b5cf6" },
];

function MiniBarChart({ color }: { color: string }) {
  const bars = [40, 65, 50, 80, 60, 90, 75, 95, 70, 88];
  return (
    <div className="flex items-end gap-1 h-10">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          className="w-2 rounded-sm"
          style={{ backgroundColor: color, opacity: 0.3 + (i / bars.length) * 0.7 }}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function MetricCard({ metric, index }: { metric: (typeof metrics)[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const count = useCountUp(metric.value, 1800, inView);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="relative p-6 rounded-2xl overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Top-left corner accent */}
      <div
        className="absolute top-0 left-0 w-32 h-32 opacity-15 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top left, ${metric.color}, transparent 60%)`,
        }}
      />

      <div className="relative flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <span
            className="text-white/50 text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
          >
            {metric.label}
          </span>
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
            style={{
              background: metric.up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
              color: metric.up ? "#4ade80" : "#f87171",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
            }}
          >
            {metric.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {metric.trend}
          </div>
        </div>

        <div className="flex items-end gap-1">
          <span
            className="text-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: "2.4rem",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {count.toLocaleString()}
          </span>
          <span
            className="text-white/40 pb-1"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "1.1rem" }}
          >
            {metric.suffix}
          </span>
        </div>

        <MiniBarChart color={metric.color} />
      </div>
    </motion.div>
  );
}

function RingProgress({ value, color, label }: { value: number; color: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: circumference - dash } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}
          >
            {value}%
          </span>
        </div>
      </div>
      <span
        className="text-white/50 text-sm text-center"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
      >
        {label}
      </span>
    </div>
  );
}

export function MetricsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="metrics" className="relative py-28 px-6" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(6,182,212,0.05),transparent)]" />

      <div className="relative max-w-7xl mx-auto flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#ec4899]/30 bg-[#ec4899]/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899]" />
            <span
              className="text-[#f9a8d4] text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
            >
              Real impact, real numbers
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
            Numbers that tell the whole story
          </motion.h2>
        </div>

        {/* Metric cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} />
          ))}
        </div>

        {/* Ring charts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-10 justify-between"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex flex-col gap-2 max-w-xs">
            <h3
              className="text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.25rem" }}
            >
              Team performance overview
            </h3>
            <p
              className="text-white/45"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400, fontSize: "0.9rem", lineHeight: 1.6 }}
            >
              Aggregated across all active plans. Updated in real time from connected data sources.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-8 justify-center">
            <RingProgress value={94} color="#8b5cf6" label="Goal completion" />
            <RingProgress value={78} color="#06b6d4" label="KPI on track" />
            <RingProgress value={88} color="#ec4899" label="Team adoption" />
            <RingProgress value={62} color="#a78bfa" label="Cross-team alignment" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
