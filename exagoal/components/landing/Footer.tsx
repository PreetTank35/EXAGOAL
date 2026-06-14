import { Zap } from "lucide-react";

const links = {
  Product: ["Features", "Pricing", "Changelog", "Roadmap"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security", "Cookies"],
  Support: ["Documentation", "API Reference", "Community", "Status"],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.05] py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <a href="#" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.4)]">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span
                className="text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}
              >
                Exagoal
              </span>
            </a>
            <p
              className="text-white/35 text-sm leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Turning ambition into measurable achievement for teams that refuse to settle.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section} className="flex flex-col gap-4">
              <span
                className="text-white/60 text-xs uppercase tracking-widest"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700 }}
              >
                {section}
              </span>
              <div className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-white/35 hover:text-white/70 text-sm transition-colors duration-200"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 400 }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-white/25 text-sm"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            © 2026 Exagoal, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Twitter", "LinkedIn", "GitHub"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-white/25 hover:text-white/60 text-sm transition-colors duration-200"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
