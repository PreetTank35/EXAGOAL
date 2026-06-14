import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { MoreHorizontal, ArrowUpRight, Circle } from "lucide-react";

const goals = [
  { name: "Increase ARR to $10M", progress: 72, color: "#8b5cf6", status: "On track" },
  { name: "Launch mobile app v2", progress: 55, color: "#06b6d4", status: "At risk" },
  { name: "Reduce churn to 2%", progress: 88, color: "#ec4899", status: "Ahead" },
  { name: "Hire 20 engineers", progress: 40, color: "#a78bfa", status: "Delayed" },
];

const statusColors: Record<string, string> = {
  "On track": "#4ade80",
  "At risk": "#fbbf24",
  "Ahead": "#06b6d4",
  "Delayed": "#f87171",
};

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="relative py-24 px-6" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_60%,rgba(139,92,246,0.06),transparent)]" />

      <div className="relative max-w-7xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6]" />
            <span
              className="text-[#a78bfa] text-sm"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
            >
              Your command center
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
            A dashboard that thinks with you
          </motion.h2>
        </div>

        {/* Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "rgba(12,12,22,0.95)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 0 80px rgba(139,92,246,0.12), 0 40px 80px rgba(0,0,0,0.5)",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white/[0.04] rounded-lg h-7 w-56 flex items-center justify-center">
                <span className="text-white/30 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>app.exagoal.io/dashboard</span>
              </div>
            </div>
          </div>

          {/* Dashboard body */}
          <div className="flex h-[480px]">
            {/* Sidebar */}
            <div className="w-52 border-r border-white/[0.05] p-4 hidden md:flex flex-col gap-2">
              {["Overview", "Goals", "OKRs", "Reports", "Team", "Settings"].map((item, i) => (
                <div
                  key={item}
                  className={`px-3 py-2.5 rounded-xl flex items-center gap-3 cursor-pointer transition-colors ${
                    i === 0
                      ? "bg-[#8b5cf6]/15 text-[#a78bfa]"
                      : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
                >
                  <Circle size={6} style={{ color: i === 0 ? "#8b5cf6" : "rgba(255,255,255,0.2)", fill: i === 0 ? "#8b5cf6" : "transparent" }} />
                  <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: i === 0 ? 600 : 400, fontSize: "0.85rem" }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 p-6 flex flex-col gap-5 overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}>
                    Q3 2026 Overview
                  </h3>
                  <p className="text-white/35 text-xs mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>4 active objectives · Updated 2m ago</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-[#8b5cf6]/15 border border-[#8b5cf6]/25 text-[#a78bfa] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                    This quarter
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-white/[0.04] text-white/30">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "On track", val: "2", color: "#4ade80" },
                  { label: "At risk", val: "1", color: "#fbbf24" },
                  { label: "Delayed", val: "1", color: "#f87171" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-3 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="text-xl text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>{s.val}</div>
                    <div className="text-xs mt-1" style={{ color: s.color, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Goals list */}
              <div className="flex flex-col gap-3 flex-1">
                {goals.map((goal, i) => (
                  <motion.div
                    key={goal.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.07 }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-white/80 text-sm truncate group-hover:text-white transition-colors"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                        >
                          {goal.name}
                        </span>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span
                            className="text-xs px-2 py-0.5 rounded-md"
                            style={{
                              color: statusColors[goal.status],
                              background: `${statusColors[goal.status]}18`,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {goal.status}
                          </span>
                          <span
                            className="text-white/50 text-xs"
                            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                          >
                            {goal.progress}%
                          </span>
                          <ArrowUpRight size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: goal.color, boxShadow: `0 0 8px ${goal.color}60` }}
                          initial={{ width: "0%" }}
                          animate={inView ? { width: `${goal.progress}%` } : { width: "0%" }}
                          transition={{ duration: 1.2, delay: 0.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
