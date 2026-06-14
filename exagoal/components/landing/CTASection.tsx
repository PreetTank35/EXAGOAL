import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="pricing" className="relative py-24 px-6" ref={ref}>
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl p-px"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.5), rgba(6,182,212,0.3), rgba(236,72,153,0.4))",
          }}
        >
          <div
            className="relative rounded-3xl px-10 py-16 sm:px-16 sm:py-20 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0d0d1a 0%, #0a0a14 100%)" }}
          >
            {/* Background glows */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#8b5cf6] opacity-[0.12] blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#06b6d4] opacity-[0.1] blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#ec4899] opacity-[0.06] blur-3xl" />

            {/* Grain */}
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
                backgroundSize: "128px",
              }}
            />

            <div className="relative flex flex-col items-center text-center gap-8">
              <div className="flex flex-col items-center gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04]">
                  <Sparkles size={14} className="text-[#a78bfa]" />
                  <span
                    className="text-white/70 text-sm"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}
                  >
                    Free forever for small teams
                  </span>
                </div>

                <h2
                  className="text-white max-w-2xl"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800,
                    fontSize: "clamp(2rem, 4vw, 3.2rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Start achieving more{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899, #06b6d4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    today
                  </span>
                </h2>

                <p
                  className="text-white/45 max-w-xl"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 400,
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                  }}
                >
                  Join 50,000+ teams already using Exagoal to turn ambition into execution. No credit card required.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="relative group flex items-center gap-2.5 px-8 py-4 rounded-xl text-white overflow-hidden"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1rem" }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4]" />
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-[#7c3aed] via-[#ec4899] to-[#0891b2]" />
                  <span className="absolute inset-0 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.6)] group-hover:shadow-[0_0_50px_rgba(139,92,246,0.8)] transition-all duration-300" />
                  <span className="relative">Get started for free</span>
                  <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform duration-200" />
                </Link>

                <a
                  href="#"
                  className="group flex items-center gap-2 px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-300 bg-white/[0.02] hover:bg-white/[0.05]"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: "1rem" }}
                >
                  Schedule a demo
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
                {[
                  "No credit card",
                  "14-day Pro trial",
                  "Cancel anytime",
                  "SOC 2 Type II",
                ].map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-1.5 text-white/35 text-sm"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
