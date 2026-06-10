/**
 * Faraway LMS — Footer Component
 */

import Link from "next/link";
import { GraduationCap, Github, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-navy-800/50 bg-navy-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="gradient-text">Faraway</span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-navy-500">
              A modern learning management system designed to deliver
              exceptional educational experiences. Learn from industry experts,
              track your progress, and achieve your goals.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400">
              Platform
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/courses", label: "Browse Courses" },
                { href: "/auth/register", label: "Get Started" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-navy-500 transition-colors hover:text-indigo-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-navy-400">
              Company
            </h4>
            <ul className="space-y-2">
              {["About", "Careers", "Privacy", "Terms"].map((label) => (
                <li key={label}>
                  <span className="text-sm text-navy-500 transition-colors hover:text-indigo-400 cursor-pointer">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-navy-800/50 pt-8 sm:flex-row">
          <p className="text-xs text-navy-600">
            © {new Date().getFullYear()} Faraway LMS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-navy-600 transition-colors hover:text-navy-400"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="text-navy-600 transition-colors hover:text-navy-400"
              aria-label="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
