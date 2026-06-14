'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiKey, HiClipboardDocumentCheck, HiClipboardDocumentList, HiXMark } from 'react-icons/hi2';
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
  };
}

export default function OtpBanner() {
  const [notification, setNotification] = useState<OtpNotification | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    // Fetch initial active notifications
    const fetchActiveNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('student_notifications')
        .select('*')
        .eq('student_id', user.id)
        .eq('status', 'active')
        .eq('notification_type', 'otp_delivery')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setNotification(data as OtpNotification);
      }
    };

    fetchActiveNotifications();

    // Setup Supabase Realtime
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase.channel('student-otp-alerts')
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
              setNotification(newNotif);
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
            // If the notification we are showing is revoked, hide it
            setNotification((prev) => {
              if (prev && prev.id === updated.id) {
                return updated.status === 'active' ? updated : null;
              }
              return prev;
            });
          }
        )
        .subscribe();

      return channel;
    };

    let channelPromise = setupRealtime();

    return () => {
      channelPromise.then(channel => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  useEffect(() => {
    if (!notification || notification.status !== 'active') return;

    const calculateTimeLeft = () => {
      const expires = new Date(notification.expires_at).getTime();
      const now = new Date().getTime();
      const difference = Math.floor((expires - now) / 1000);
      
      if (difference <= 0) {
        setTimeLeft(0);
        // Optimistically set to expired
        setNotification(prev => prev ? { ...prev, status: 'expired' } : null);
      } else {
        setTimeLeft(difference);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [notification]);

  const copyToClipboard = async () => {
    if (!notification?.metadata?.otp_code) return;
    try {
      await navigator.clipboard.writeText(notification.metadata.otp_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDismiss = async () => {
    if (notification) {
      // Mark as read in DB so it doesn't show up again
      await supabase
        .from('student_notifications')
        .update({ is_read: true, status: 'revoked' })
        .eq('id', notification.id);
      setNotification(null);
    }
  };

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
            notification.status === 'expired' 
              ? 'bg-red-950/90 border-red-500/50 shadow-red-500/10' 
              : 'bg-zinc-900/90 border-emerald-500/50 shadow-emerald-500/20'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${
                  notification.status === 'expired' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}>
                  <HiKey className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-sm">
                  {notification.status === 'expired' ? 'Exam OTP Expired' : 'Exam Live! Access Code Required'}
                </h3>
              </div>
              <button onClick={handleDismiss} className="text-zinc-500 hover:text-white transition-colors">
                <HiXMark className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">{notification.title}</p>

            <div className="flex items-center gap-3">
              <div className="flex-1 bg-black/40 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className={`font-mono text-2xl tracking-[0.2em] font-bold ${
                  notification.status === 'expired' ? 'text-zinc-500 line-through' : 'text-white'
                }`}>
                  {notification.metadata?.otp_code || '------'}
                </span>
                
                <button
                  onClick={copyToClipboard}
                  disabled={notification.status === 'expired'}
                  className={`p-2 rounded-lg transition-colors ${
                    copied ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Copy OTP"
                >
                  {copied ? <HiClipboardDocumentCheck className="w-5 h-5" /> : <HiClipboardDocumentList className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {notification.status === 'active' && timeLeft !== null && (
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-1000 linear" 
                    style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
                  />
                </div>
              </div>
            )}
            
            {notification.status === 'expired' && (
              <p className="mt-3 text-xs text-red-400">
                This code has expired. Please contact your instructor for a new one.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
