'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HiUsers,
  HiChartBar,
  HiCheckBadge,
  HiClipboardDocumentCheck,
} from 'react-icons/hi2';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { createClient } from '@/lib/supabase/client';

interface AnalyticsData {
  totalAttempts: number;
  completedAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

interface ChartDataPoint {
  name: string;
  score: number;
}

export default function StudentAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [stats, setStats] = useState<AnalyticsData>({
    totalAttempts: 0,
    completedAttempts: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    passRate: 0,
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const supabase = createClient();

  useEffect(() => {
    loadAnalytics();
  }, [selectedExam]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch exams created by this teacher for the filter dropdown
      if (exams.length === 0) {
        const { data: examsData } = await supabase
          .from('exams')
          .select('id, title')
          .eq('created_by', user.id);
        if (examsData) setExams(examsData);
      }

      // Fetch exam sessions
      let query = supabase
        .from('exam_sessions')
        .select(`
          id,
          status,
          total_score,
          exam_id,
          exams!inner(created_by, passing_score)
        `)
        .eq('exams.created_by', user.id);

      if (selectedExam !== 'all') {
        query = query.eq('exam_id', selectedExam);
      }

      const { data: sessions, error } = await query;

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        setStats({
          totalAttempts: 0,
          completedAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
        });
        setChartData([]);
        return;
      }

      let totalScore = 0;
      let highest = 0;
      let lowest = 100;
      let passed = 0;
      let completedCount = 0;
      const cData: ChartDataPoint[] = [];

      sessions.forEach((s, idx) => {
        if (s.status === 'submitted' || s.status === 'graded') {
          completedCount++;
          const score = Number(s.total_score || 0);
          totalScore += score;
          if (score > highest) highest = score;
          if (score < lowest) lowest = score;
          
          // @ts-ignore
          const passingScore = Number(s.exams?.passing_score || 50);
          if (score >= passingScore) passed++;

          cData.push({
            name: `Attempt ${idx + 1}`,
            score: score,
          });
        }
      });

      setStats({
        totalAttempts: sessions.length,
        completedAttempts: completedCount,
        averageScore: completedCount > 0 ? Math.round(totalScore / completedCount) : 0,
        highestScore: completedCount > 0 ? highest : 0,
        lowestScore: completedCount > 0 ? lowest : 0,
        passRate: completedCount > 0 ? Math.round((passed / completedCount) * 100) : 0,
      });
      setChartData(cData);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Track performance and engagement metrics across your classes.
          </p>
        </div>
        <div>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="bg-zinc-900/80 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500"
          >
            <option value="all">All Exams</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-12 text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading analytics...</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<HiUsers className="w-6 h-6 text-blue-400" />}
              label="Total Attempts"
              value={stats.totalAttempts.toString()}
              subValue={`${stats.completedAttempts} completed`}
            />
            <StatCard
              icon={<HiChartBar className="w-6 h-6 text-emerald-400" />}
              label="Average Score"
              value={`${stats.averageScore}%`}
              subValue={`High: ${stats.highestScore}% | Low: ${stats.lowestScore}%`}
            />
            <StatCard
              icon={<HiCheckBadge className="w-6 h-6 text-amber-400" />}
              label="Pass Rate"
              value={`${stats.passRate}%`}
              subValue="Based on set passing scores"
            />
            <StatCard
              icon={<HiClipboardDocumentCheck className="w-6 h-6 text-rose-400" />}
              label="Completion Rate"
              value={`${stats.totalAttempts > 0 ? Math.round((stats.completedAttempts / stats.totalAttempts) * 100) : 0}%`}
              subValue="Of started attempts"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-6">Score Distribution</h3>
              <div className="h-72">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        cursor={{ fill: '#27272a' }}
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                      />
                      <Bar dataKey="score" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                    Not enough data to display chart
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-zinc-300 mb-6">Performance Trend</h3>
              <div className="h-72">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
                    Not enough data to display chart
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: string; subValue?: string }) {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium text-zinc-400">{label}</h3>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
      </div>
      {subValue && (
        <div className="text-xs text-zinc-500 border-t border-zinc-800 pt-3">
          {subValue}
        </div>
      )}
    </motion.div>
  );
}
