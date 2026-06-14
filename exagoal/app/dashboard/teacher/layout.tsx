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
    <div className="min-h-screen flex bg-background text-foreground font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Teacher Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 flex flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-sidebar-border">
          <Link href="/dashboard/teacher" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <HiAcademicCap className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
              Teacher<span className="text-primary">Portal</span>
            </span>
          </Link>
          <button
            className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
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
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-sm'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-sidebar-foreground' : ''}`} />
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-6 border-t border-sidebar-border space-y-1.5">
          <button
            onClick={async () => {
              const { createClient } = await import('@/lib/supabase/client');
              const supabase = createClient();
              await supabase.auth.signOut();
              await fetch('/api/auth/set-role', { method: 'DELETE' });
              window.location.href = '/';
            }}
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-all w-full"
          >
            <HiArrowRightOnRectangle className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative bg-background">
        {/* Top Bar - Floating Navbar Theme */}
        <header className="sticky top-4 mx-4 sm:mx-8 z-30 flex items-center justify-between px-6 py-3 border border-white/10 rounded-2xl bg-background/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-[16px] transition-all">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            >
              <HiBars3 className="w-7 h-7" />
            </button>
            <h1 className="text-xl font-semibold tracking-tight hidden sm:block text-foreground">
              {TEACHER_NAV_ITEMS.find(i => 
                i.href === '/dashboard/teacher' 
                  ? pathname === '/dashboard/teacher' 
                  : pathname.startsWith(i.href)
              )?.label || 'Overview'}
            </h1>
          </div>
          
          <div className="flex items-center gap-5">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md ring-2 ring-border cursor-pointer hover:ring-primary/50 transition-all">
              <span className="text-sm font-bold text-primary-foreground">TR</span>
            </div>
          </div>
        </header>

        <div className="flex-1 px-4 sm:px-8 py-8 w-full max-w-7xl mx-auto z-10 relative">
          {children}
        </div>
      </div>
    </div>
  );
}
