import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exam Session — ExaGoal',
};

export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b]">
      {children}
    </div>
  );
}
