'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  HiAcademicCap,
  HiCheckBadge,
  HiXCircle,
  HiShieldCheck,
} from 'react-icons/hi2';

interface CredentialData {
  valid: boolean;
  student_name: string;
  exam_title: string;
  score: number;
  grade: string;
  issued_at: string;
  institution: string;
  network: string;
  block_number: number;
}

export default function VerifyPage() {
  const params = useParams();
  const hash = params.hash as string;
  
  const [loading, setLoading] = useState(true);
  const [credential, setCredential] = useState<CredentialData | null>(null);

  useEffect(() => {
    async function verifyCredential() {
      if (!hash) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/verify/${hash}`);
        const data = await res.json();
        
        if (res.ok && data.credential) {
          setCredential(data.credential);
        } else {
          setCredential(null);
        }
      } catch (err) {
        console.error("Verification failed", err);
        setCredential(null);
      } finally {
        setLoading(false);
      }
    }
    
    verifyCredential();
  }, [hash]);

  const verified = credential?.valid ?? false;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15"
          style={{
            background: loading 
              ? 'radial-gradient(circle, rgba(161,161,170,0.3), transparent 70%)'
              : verified
                ? 'radial-gradient(circle, rgba(34,197,94,0.3), transparent 70%)'
                : 'radial-gradient(circle, rgba(239,68,68,0.3), transparent 70%)',
            top: '30%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <HiAcademicCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Exa<span className="text-indigo-400">Goal</span>
          </span>
        </div>

        <div className="glass-card p-8 text-center min-h-[400px] flex flex-col justify-center">
          {loading ? (
            <div className="py-12">
              <div className="w-12 h-12 border-4 border-zinc-700 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-400 font-medium animate-pulse">Verifying blockchain credential...</p>
            </div>
          ) : verified && credential ? (
            <>
              {/* Verified */}
              <motion.div
                className="w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
              >
                <HiCheckBadge className="w-10 h-10 text-green-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-green-400 mb-2">
                ✅ Credential Verified
              </h1>
              <p className="text-sm text-zinc-400 mb-8">
                This credential is authentic and recorded on the blockchain.
              </p>

              <div className="space-y-4 text-left">
                {[
                  { label: 'Student', value: credential.student_name },
                  { label: 'Examination', value: credential.exam_title },
                  { label: 'Score', value: `${credential.score}/100 (${credential.grade})` },
                  { label: 'Institution', value: credential.institution },
                  {
                    label: 'Issued',
                    value: new Date(credential.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  },
                  { label: 'Network', value: credential.network },
                  { label: 'Block', value: `#${credential.block_number.toLocaleString()}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0"
                  >
                    <span className="text-sm text-zinc-500">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <p className="text-xs text-zinc-400 flex items-center justify-center gap-1.5">
                  <HiShieldCheck className="w-3.5 h-3.5 text-green-400" />
                  Verified on-chain via Polygon smart contract
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Not Found / Invalid */}
              <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <HiXCircle className="w-10 h-10 text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-red-400 mb-2">
                ❌ Credential Not Found
              </h1>
              <p className="text-sm text-zinc-400 mb-6">
                No credential matching this hash was found on the blockchain.
                The credential may have been revoked or the hash is incorrect.
              </p>

              <div className="p-3 rounded-lg bg-zinc-800/30 mb-4">
                <div className="text-xs text-zinc-500 mb-1">Searched Hash</div>
                <code className="text-xs text-zinc-300 font-mono break-all">
                  {hash}
                </code>
              </div>
            </>
          )}

          <Link
            href="/"
            className="btn-secondary inline-flex items-center gap-2 mt-6 justify-center w-full"
          >
            <HiArrowLeft className="w-4 h-4" />
            Back to ExaGoal
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function HiArrowLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
  );
}
