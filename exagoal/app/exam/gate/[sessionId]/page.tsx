'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiAcademicCap,
  HiFingerPrint,
  HiShieldCheck,
  HiArrowRight,
  HiClock,
} from 'react-icons/hi2';

export default function OTPGatePage() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setVerifying(true);
    setError('');

    // MVP: Simulate OTP verification
    // In production: POST /api/sessions/{sessionId}/otp/verify
    setTimeout(() => {
      setVerifying(false);
      // Simulate success — navigate to live exam
      router.push('/exam/live/demo-session');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.3), transparent 70%)',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <HiAcademicCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Exa<span className="text-indigo-400">Goal</span>
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mx-auto mb-5">
            <HiFingerPrint className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Enter Your OTP</h1>
          <p className="text-sm text-zinc-400 mb-2">
            A 6-digit one-time password was sent to your registered email
          </p>

          {/* Timer */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-6 ${
              timeLeft > 120
                ? 'bg-green-500/10 text-green-400'
                : timeLeft > 30
                ? 'bg-yellow-500/10 text-yellow-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            <HiClock className="w-3.5 h-3.5" />
            {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* OTP Input */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none ${
                  digit
                    ? 'border-indigo-500/50 bg-indigo-500/5 text-white'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-400'
                } focus:border-indigo-500 focus:bg-indigo-500/10`}
                id={`otp-input-${idx}`}
              />
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || timeLeft <= 0}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <HiShieldCheck className="w-4 h-4" />
                Verify & Enter Exam
                <HiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-xs text-zinc-500 mt-4">
            OTP is unique to your session and expires in 10 minutes.
            <br />
            Contact your instructor if you didn&apos;t receive it.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
