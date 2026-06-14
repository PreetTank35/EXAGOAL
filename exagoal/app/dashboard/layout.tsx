'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HiAcademicCap,
  HiHome,
  HiClipboardDocumentList,
  HiUser,
  HiChartBar,
  HiShieldCheck,
  HiChatBubbleLeftEllipsis,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
  HiCog6Tooth,
} from 'react-icons/hi2';
import NotificationBell from '@/components/notifications/NotificationBell';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: HiHome },
  { href: '/dashboard/exams', label: 'Exams', icon: HiClipboardDocumentList },
  { href: '/dashboard/chat', label: 'AI Tutor', icon: HiChatBubbleLeftEllipsis },
  { href: '/dashboard/profile', label: 'My Profile', icon: HiUser },
  { href: '/dashboard/results', label: 'Results', icon: HiChartBar },
  { href: '/dashboard/credentials', label: 'Credentials', icon: HiShieldCheck },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Teacher routes use their own dedicated layout — skip the student wrapper entirely
  if (pathname.startsWith('/dashboard/teacher')) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'rgba(15, 15, 20, 0.95)',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-800/50">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <HiAcademicCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Exa<span className="text-indigo-400">Goal</span>
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
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-zinc-800/50 space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all"
          >
            <HiCog6Tooth className="w-5 h-5" />
            Settings
          </Link>
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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-zinc-800/50"
          style={{
            background: 'rgba(9, 9, 11, 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <button
            className="lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <HiBars3 className="w-6 h-6" />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">ST</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
    </>
  );
}
