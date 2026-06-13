import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ExaGoal — Assess Potential. Not Just Answers.',
  description:
    'A next-generation examination platform that reimagines assessments through fairness, security, and intelligence. Powered by AI, secured by blockchain, inspired by Finland & Japan.',
  keywords: [
    'examination platform',
    'AI grading',
    'blockchain credentials',
    'adaptive testing',
    'holistic assessment',
    'ExaGoal',
  ],
  authors: [{ name: 'ExaGoal Team' }],
  openGraph: {
    title: 'ExaGoal — Assess Potential. Not Just Answers.',
    description:
      'Fair, secure, intelligent examinations powered by AI and blockchain.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
