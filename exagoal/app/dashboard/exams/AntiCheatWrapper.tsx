'use client';

import { useEffect, useState } from 'react';

export default function AntiCheatWrapper({ children }: { children: React.ReactNode }) {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    // 1. Detect Window Focus Loss (Blocks snipping tools, switching apps)
    const handleBlur = () => setIsFocused(false);
    const handleFocus = () => setIsFocused(true);

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // 2. Block PrintScreen and common screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Screenshots are disabled during the examination.');
        navigator.clipboard.writeText(''); // Clear clipboard just in case
      }
      
      // Ctrl/Cmd + P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
      }

      // Ctrl/Cmd + Shift + S or Cmd + Shift + 3/4/5 (Snipping Tool / Mac Screenshots)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['s', 'S', '3', '4', '5'].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // 3. Block Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-zinc-950">
      {/* 4. CSS Print Media Protection (in globals.css but enforced here inline just in case) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { display: none !important; }
        }
        * {
          user-select: none !important;
          -webkit-user-select: none !important;
        }
      `}} />

      {/* The Actual Content */}
      <div className={`transition-opacity duration-150 ${isFocused ? 'opacity-100' : 'opacity-0 select-none pointer-events-none'}`}>
        {children}
      </div>

      {/* The Blackout Screen when Unfocused */}
      {!isFocused && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-rose-500">
          <svg className="w-16 h-16 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold tracking-tight">Window Focus Lost</h2>
          <p className="text-zinc-400 mt-2">Return to the exam window immediately. This incident has been logged.</p>
        </div>
      )}
    </div>
  );
}
