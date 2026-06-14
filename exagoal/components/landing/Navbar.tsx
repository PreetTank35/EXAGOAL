import { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import CardNav from "@/components/ui/CardNav";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const items = [
    {
      label: "Platform",
      bgColor: "#120f17",
      textColor: "#fff",
      links: [
        { label: "Features", ariaLabel: "Platform Features", href: "#features" },
        { label: "Metrics", ariaLabel: "Platform Metrics", href: "#metrics" }
      ]
    },
    {
      label: "Company", 
      bgColor: "#1e1b24",
      textColor: "#fff",
      links: [
        { label: "About Us", ariaLabel: "About Company", href: "#about" },
        { label: "Pricing", ariaLabel: "Pricing Plans", href: "#pricing" }
      ]
    },
    {
      label: "Access",
      bgColor: "#120f17", 
      textColor: "#fff",
      links: [
        { label: "Sign In", ariaLabel: "Sign In", href: "/login" },
        { label: "Register", ariaLabel: "Register", href: "/register" }
      ]
    }
  ];

  const logoNode = (
    <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_24px_rgba(139,92,246,0.7)] transition-all duration-300">
        <Zap size={16} className="text-white fill-white" />
      </div>
      <span
        className="text-white tracking-tight"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: "1.1rem" }}
      >
        Exagoal
      </span>
    </div>
  );

  return (
    <CardNav
      logo={logoNode}
      items={items}
      baseColor={scrolled ? "rgba(10, 10, 20, 0.72)" : "rgba(10, 10, 20, 0.4)"}
      menuColor="#fff"
      buttonBgColor="#8b5cf6"
      buttonTextColor="#fff"
      buttonHref="/register"
      ease="power3.out"
      className="fixed top-5 left-1/2 -translate-x-1/2 w-full max-w-6xl z-50 transition-all duration-500"
    />
  );
}
