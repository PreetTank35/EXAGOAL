'use client';

import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  HiAcademicCap,
  HiArrowTrendingUp,
  HiSparkles,
  HiLightBulb,
} from 'react-icons/hi2';

// Demo data
const RADAR_DATA = [
  { dimension: 'Knowledge', score: 82, fullMark: 100 },
  { dimension: 'Critical Thinking', score: 74, fullMark: 100 },
  { dimension: 'Ethical Reasoning', score: 68, fullMark: 100 },
  { dimension: 'Collaboration', score: 85, fullMark: 100 },
  { dimension: 'Wellness', score: 71, fullMark: 100 },
  { dimension: 'Creativity', score: 77, fullMark: 100 },
];

const PROGRESS_DATA = [
  { month: 'Jan', chi: 65, toku: 55, tai: 60 },
  { month: 'Feb', chi: 68, toku: 58, tai: 62 },
  { month: 'Mar', chi: 72, toku: 63, tai: 64 },
  { month: 'Apr', chi: 75, toku: 67, tai: 68 },
  { month: 'May', chi: 78, toku: 72, tai: 70 },
  { month: 'Jun', chi: 82, toku: 76, tai: 71 },
];

const DIMENSIONS = [
  {
    key: 'chi',
    label: '知 Knowledge',
    emoji: '📊',
    score: 82,
    color: '#6366f1',
    weight: '40%',
    insights: [
      'Strong in mathematical analysis',
      'Improving in physics concepts',
      'Try more "create" level challenges',
    ],
  },
  {
    key: 'toku',
    label: '徳 Virtue',
    emoji: '🤝',
    score: 76,
    color: '#8b5cf6',
    weight: '35%',
    insights: [
      'Good collaboration in team tasks',
      'Ethical reasoning developing well',
      'Engage more with peer reviews',
    ],
  },
  {
    key: 'tai',
    label: '体 Wellness',
    emoji: '🧘',
    score: 71,
    color: '#06b6d4',
    weight: '25%',
    insights: [
      'Regular self-assessments completed',
      'Consider mindfulness exercises',
      'Balance study with rest periods',
    ],
  },
];

const BLOOM_ANALYSIS = [
  { level: 'Remember', proficiency: 92, color: '#22c55e' },
  { level: 'Understand', proficiency: 85, color: '#3b82f6' },
  { level: 'Apply', proficiency: 78, color: '#6366f1' },
  { level: 'Analyze', proficiency: 74, color: '#8b5cf6' },
  { level: 'Evaluate', proficiency: 62, color: '#f59e0b' },
  { level: 'Create', proficiency: 55, color: '#ef4444' },
];

export default function ProfilePage() {
  const overallScore = Math.round(82 * 0.4 + 76 * 0.35 + 71 * 0.25);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Student Profile</h1>
        <p className="text-zinc-400 text-sm mt-1">
          Holistic development across Knowledge, Virtue & Wellness
        </p>
      </div>

      {/* Profile Card */}
      <motion.div
        className="glass-card p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">ST</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">Sample Student</h2>
            <p className="text-zinc-400 text-sm">student@university.edu</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span>Enrolled: Sep 2025</span>
              <span>12 Exams Completed</span>
              <span>8 Credentials Earned</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text">{overallScore}</div>
            <div className="text-xs text-zinc-500 mt-1">Overall Score</div>
          </div>
        </div>
      </motion.div>

      {/* Chi-Toku-Tai Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {DIMENSIONS.map((dim, idx) => (
          <motion.div
            key={dim.key}
            className="glass-card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{dim.emoji}</span>
                <span className="text-sm font-semibold" style={{ color: dim.color }}>
                  {dim.label}
                </span>
              </div>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: `${dim.color}15`, color: dim.color }}
              >
                {dim.weight}
              </span>
            </div>

            <div className="text-3xl font-bold mb-3" style={{ color: dim.color }}>
              {dim.score}
              <span className="text-base text-zinc-500">/100</span>
            </div>

            <div className="w-full h-2 rounded-full bg-zinc-800 mb-4">
              <motion.div
                className="h-full rounded-full"
                style={{ background: dim.color }}
                initial={{ width: 0 }}
                animate={{ width: `${dim.score}%` }}
                transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
              />
            </div>

            <div className="space-y-2">
              {dim.insights.map((insight) => (
                <div
                  key={insight}
                  className="flex items-start gap-2 text-xs text-zinc-400"
                >
                  <HiLightBulb
                    className="w-3.5 h-3.5 shrink-0 mt-0.5"
                    style={{ color: dim.color }}
                  />
                  {insight}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <h3 className="text-base font-semibold mb-4">
            Competency Radar
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid
                stroke="rgba(113, 113, 122, 0.2)"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#71717a', fontSize: 10 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Progress Over Time */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h3 className="text-base font-semibold mb-4">
            Growth Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={PROGRESS_DATA}>
              <defs>
                <linearGradient id="chiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tokuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(113,113,122,0.1)" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(113,113,122,0.2)' }}
              />
              <YAxis
                domain={[40, 100]}
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={{ stroke: 'rgba(113,113,122,0.2)' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#18181f',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="chi"
                stroke="#6366f1"
                fill="url(#chiGrad)"
                strokeWidth={2}
                name="知 Knowledge"
              />
              <Area
                type="monotone"
                dataKey="toku"
                stroke="#8b5cf6"
                fill="url(#tokuGrad)"
                strokeWidth={2}
                name="徳 Virtue"
              />
              <Area
                type="monotone"
                dataKey="tai"
                stroke="#06b6d4"
                fill="url(#taiGrad)"
                strokeWidth={2}
                name="体 Wellness"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bloom's Taxonomy Analysis */}
      <motion.div
        className="glass-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <h3 className="text-base font-semibold mb-1">
          Bloom&apos;s Taxonomy Proficiency
        </h3>
        <p className="text-xs text-zinc-500 mb-6">
          Your cognitive skill level across Bloom&apos;s hierarchy
        </p>
        <div className="space-y-4">
          {BLOOM_ANALYSIS.map((bloom) => (
            <div key={bloom.level} className="flex items-center gap-4">
              <div className="w-24 text-sm text-zinc-400 text-right shrink-0">
                {bloom.level}
              </div>
              <div className="flex-1 h-3 rounded-full bg-zinc-800">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: bloom.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${bloom.proficiency}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div
                className="w-12 text-sm font-semibold text-right"
                style={{ color: bloom.color }}
              >
                {bloom.proficiency}%
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
