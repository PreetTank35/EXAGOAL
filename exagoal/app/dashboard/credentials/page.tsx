'use client';

import { motion } from 'framer-motion';
import {
  HiShieldCheck,
  HiCheckBadge,
  HiLink,
  HiQrCode,
  HiDocumentDuplicate,
  HiArrowTopRightOnSquare,
} from 'react-icons/hi2';

const DEMO_CREDENTIALS = [
  {
    id: '1',
    exam_title: 'Advanced Mathematics — Calculus II',
    score: 85,
    grade: 'A',
    issued_at: '2026-06-10T12:00:00Z',
    credential_hash: 'a3f2e8d1b5c94a7e8f0123456789abcdef0123456789abcdef0123456789ab',
    tx_hash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
    block_number: 52847391,
    network: 'Polygon PoS',
    verified: true,
  },
  {
    id: '2',
    exam_title: 'Physics — Mechanics',
    score: 91,
    grade: 'A+',
    issued_at: '2026-06-05T14:00:00Z',
    credential_hash: 'b4c3d9e2f6a05b8f9a1234567890bcdef1234567890bcdef1234567890bc',
    tx_hash: '0x8a0bfde2d1e68b8bf77bc5fbe2d1e68b8bf77bc5fbe2d8d3fc3eb8c22b1a2493',
    block_number: 52741283,
    network: 'Polygon PoS',
    verified: true,
  },
  {
    id: '3',
    exam_title: 'Ethical Reasoning — Case Studies',
    score: 78,
    grade: 'B+',
    issued_at: '2026-05-28T10:00:00Z',
    credential_hash: 'c5d4e0f3a7b16c9g0b2345678901cdef2345678901cdef2345678901cd',
    tx_hash: '0x9b1cgef3e2f79c9cg88cd6gcf3e2f79c9cg88cd6gcf3e9e4gd4fc9d33c2b3',
    block_number: 52639175,
    network: 'Polygon PoS',
    verified: true,
  },
];

export default function CredentialsPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Blockchain Credentials</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Tamper-proof, on-chain verified academic certificates
        </p>
      </div>

      {/* Info Banner */}
      <motion.div
        className="glass-card p-5 mb-8 flex items-start gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <HiShieldCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">How it works</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Each exam result is hashed using SHA-256 and anchored to the Polygon
            blockchain via a smart contract. Employers can verify any credential
            instantly by scanning the QR code or entering the verification hash.
          </p>
        </div>
      </motion.div>

      {/* Credentials List */}
      <div className="space-y-5">
        {DEMO_CREDENTIALS.map((cred, idx) => (
          <motion.div
            key={cred.id}
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Left: Exam Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <HiCheckBadge className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{cred.exam_title}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-500">
                    <span>
                      Score:{' '}
                      <span className="text-green-400 font-semibold">
                        {cred.score}/100
                      </span>
                    </span>
                    <span>
                      Grade:{' '}
                      <span className="text-green-400 font-semibold">
                        {cred.grade}
                      </span>
                    </span>
                    <span>
                      {new Date(cred.issued_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Verification Badge */}
              <div className="flex items-center gap-3">
                {cred.verified && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <HiCheckBadge className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-semibold text-green-400">
                      Verified On-Chain
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Details */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-zinc-800/30">
                <div className="text-xs text-zinc-500 mb-1">Credential Hash</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-zinc-300 font-mono truncate">
                    {cred.credential_hash}
                  </code>
                  <button
                    onClick={() => copyToClipboard(cred.credential_hash)}
                    className="shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Copy hash"
                  >
                    <HiDocumentDuplicate className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-zinc-800/30">
                <div className="text-xs text-zinc-500 mb-1">Transaction Hash</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-zinc-300 font-mono truncate">
                    {cred.tx_hash}
                  </code>
                  <a
                    href={`https://polygonscan.com/tx/${cred.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-zinc-500 hover:text-indigo-400 transition-colors"
                    title="View on PolygonScan"
                  >
                    <HiArrowTopRightOnSquare className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <HiLink className="w-3 h-3" />
                {cred.network}
              </span>
              <span>Block #{cred.block_number.toLocaleString('en-US')}</span>
              <button
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium ml-auto"
                title="Generate QR code"
              >
                <HiQrCode className="w-3.5 h-3.5" />
                Verification QR
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
