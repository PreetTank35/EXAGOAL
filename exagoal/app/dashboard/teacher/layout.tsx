'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiAcademicCap,
  HiHome,
  HiClipboardDocumentList,
  HiBookOpen,
  HiUsers,
  HiBars3,
  HiXMark,
  HiCog6Tooth,
  HiSparkles,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';

const TEACHER_NAV_ITEMS = [
  { href: '/dashboard/teacher', label: 'Overview', icon: HiHome },
  { href: '/dashboard/teacher/syllabus', label: 'Syllabus Management', icon: HiBookOpen },
  { href: '/dashboard/teacher/exams', label: 'Exam Management', icon: HiClipboardDocumentList },
  { href: '/dashboard/teacher/exams/generate', label: 'AI Exam Generation', icon: HiSparkles },
  { href: '/dashboard/teacher/students', label: 'Student Analytics', icon: HiUsers },
];

export default function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Teacher Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(15, 15, 20, 0.95)',
          borderRight: '1px solid rgba(244, 63, 94, 0.2)', // Red/Rose tint for teacher dashboard
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800/50">
          <Link href="/dashboard/teacher" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <HiAcademicCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Teacher<span className="text-rose-400">Portal</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <HiXMark className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TEACHER_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard/teacher'
                ? pathname === '/dashboard/teacher'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-rose-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-zinc-800/50">
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              await fetch('/api/auth/set-role', { method: 'DELETE' });
              window.location.href = '/';
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <HiArrowRightOnRectangle className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white"
          >
            <HiBars3 className="w-6 h-6" />
          </button>
          <span className="font-semibold">Teacher Portal</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
