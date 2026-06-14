'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiBell, HiKey, HiClipboardDocumentCheck, HiClipboardDocumentList, HiXMark } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

interface OtpNotification {
  id: string;
  exam_id: string;
  title: string;
  message: string;
  notification_type: string;
  status: 'active' | 'expired' | 'revoked' | 'used';
  expires_at: string;
  metadata: {
    otp_code: string;
    exam_scheduled_at?: string;
  };
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<OtpNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());
  
  const popoverRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Update current time every second to trigger appearance precisely
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let channel: any;

    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('student_notifications')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .eq('notification_type', 'otp_delivery')
        .order('created_at', { ascending: false });

      if (data) {
        setNotifications(data as OtpNotification[]);
      }

      // Setup Realtime
      channel = supabase.channel('student-otp-alerts-bell')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'student_notifications',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as OtpNotification;
            if (newNotif.status === 'active' && newNotif.notification_type === 'otp_delivery') {
              setNotifications((prev) => [newNotif, ...prev]);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'student_notifications',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            const updated = payload.new as OtpNotification;
            setNotifications((prev) => {
              if (updated.status !== 'active') {
                return prev.filter(n => n.id !== updated.id);
              }
              return prev.map(n => n.id === updated.id ? updated : n);
            });
          }
        )
        .subscribe();
    };

    fetchNotifications();

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      if (channel) supabase.removeChannel(channel);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyToClipboard = async (id: string, otpCode: string) => {
    try {
      await navigator.clipboard.writeText(otpCode);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDismiss = async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) => prev.filter(n => n.id !== id));
    // Update DB
    await supabase
      .from('student_notifications')
      .update({ is_read: true, status: 'revoked' })
      .eq('id', id);
  };

  // Filter notifications that should be visible (within 5 mins of exam start, or missing scheduled_at)
  const visibleNotifications = notifications.filter(notif => {
    if (!notif.metadata?.exam_scheduled_at) return true; // Show immediately if no scheduled_at metadata
    const scheduledAt = new Date(notif.metadata.exam_scheduled_at).getTime();
    // Show if we are within 5 minutes (300,000 ms) of the scheduled start time, or if it has already started
    return now.getTime() >= scheduledAt - 300000;
  });

  const unreadCount = visibleNotifications.length;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-zinc-950 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <h3 className="font-semibold text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs">
                    {unreadCount} New
                  </span>
                )}
              </h3>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {visibleNotifications.length === 0 ? (
                <div className="p-8 text-center text-zinc-500">
                  <HiBell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-800">
                  {visibleNotifications.map((notif) => {
                    const otpCode = notif.metadata?.otp_code || '------';
                    const isCopied = copiedId === notif.id;

                    return (
                      <div key={notif.id} className="p-4 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                              <HiKey className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-sm text-zinc-200">
                              Exam Access OTP
                            </span>
                          </div>
                          <button 
                            onClick={() => handleDismiss(notif.id)}
                            className="text-zinc-500 hover:text-zinc-300 p-1"
                            title="Dismiss"
                          >
                            <HiXMark className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <p className="text-xs text-zinc-400 mb-3">{notif.title}</p>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
                            <span className="font-mono text-xl tracking-[0.2em] font-bold text-white">
                              {otpCode}
                            </span>
                            <button
                              onClick={() => copyToClipboard(notif.id, otpCode)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isCopied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-zinc-700 text-zinc-400 hover:text-white'
                              }`}
                              title="Copy OTP"
                            >
                              {isCopied ? <HiClipboardDocumentCheck className="w-4 h-4" /> : <HiClipboardDocumentList className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
