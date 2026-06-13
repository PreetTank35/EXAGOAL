'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiArrowLeft,
  HiArrowRight,
  HiPlus,
  HiTrash,
  HiSparkles,
  HiCheckCircle,
} from 'react-icons/hi2';
import type { ExamType, QuestionType, AntiCheatLevel } from '@/lib/types';

const STEPS = ['Exam Details', 'Questions', 'Settings', 'Review'];

const EXAM_TYPES: { value: ExamType; label: string; emoji: string; desc: string }[] = [
  { value: 'knowledge', label: 'Knowledge', emoji: '📊', desc: 'Academic subject exams' },
  { value: 'reasoning', label: 'Critical Thinking', emoji: '🧠', desc: 'Analytical reasoning' },
  { value: 'ethical', label: 'Ethical Reasoning', emoji: '⚖️', desc: 'Moral dilemmas & ethics' },
  { value: 'collaborative', label: 'Collaborative', emoji: '🤝', desc: 'Team-based assessment' },
  { value: 'wellness_check', label: 'Wellness Check', emoji: '🧘', desc: 'Self-assessment & wellbeing' },
];

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'code', label: 'Code' },
  { value: 'case_study', label: 'Case Study' },
];

interface QuestionDraft {
  id: string;
  question_text: string;
  question_type: QuestionType;
  max_marks: number;
  difficulty_level: number;
  options: { id: string; text: string; is_correct: boolean }[];
}

export default function CreateExamPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Exam Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [examType, setExamType] = useState<ExamType>('knowledge');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [scheduledAt, setScheduledAt] = useState('');

  // Step 2: Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      id: '1',
      question_text: '',
      question_type: 'mcq',
      max_marks: 5,
      difficulty_level: 3,
      options: [
        { id: 'a', text: '', is_correct: true },
        { id: 'b', text: '', is_correct: false },
        { id: 'c', text: '', is_correct: false },
        { id: 'd', text: '', is_correct: false },
      ],
    },
  ]);

  // Step 3: Settings
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [antiCheatLevel, setAntiCheatLevel] = useState<AntiCheatLevel>('standard');
  const [passingScore, setPassingScore] = useState(50);

  const addQuestion = () => {
    const newId = (questions.length + 1).toString();
    setQuestions([
      ...questions,
      {
        id: newId,
        question_text: '',
        question_type: 'mcq',
        max_marks: 5,
        difficulty_level: 3,
        options: [
          { id: 'a', text: '', is_correct: true },
          { id: 'b', text: '', is_correct: false },
          { id: 'c', text: '', is_correct: false },
          { id: 'd', text: '', is_correct: false },
        ],
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: string, value: unknown) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    // MVP: Simulate save — replace with Supabase insert
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard/exams');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-lg bg-zinc-800/50 flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <HiArrowLeft className="w-4 h-4 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Create Exam</h1>
          <p className="text-zinc-400 text-sm">Design a new assessment</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, idx) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                idx < step
                  ? 'bg-green-500/20 text-green-400'
                  : idx === step
                  ? 'bg-indigo-500/20 text-indigo-400 ring-2 ring-indigo-500/30'
                  : 'bg-zinc-800/50 text-zinc-500'
              }`}
            >
              {idx < step ? <HiCheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                idx === step ? 'text-indigo-400' : 'text-zinc-500'
              }`}
            >
              {s}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full ${
                  idx < step ? 'bg-green-500/30' : 'bg-zinc-800'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={step}
        className="glass-card p-8"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Step 1: Exam Details */}
        {step === 0 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                Exam Title
              </label>
              <input
                id="exam-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="e.g., Advanced Mathematics — Calculus II"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                Description
              </label>
              <textarea
                id="exam-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="Describe the exam scope and objectives..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Assessment Type (Chi-Toku-Tai)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {EXAM_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setExamType(t.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      examType === t.value
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                    }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <div className="text-sm font-semibold mt-1">{t.label}</div>
                    <div className="text-xs text-zinc-500">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Duration (minutes)
                </label>
                <input
                  id="exam-duration"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="input-field"
                  min={5}
                  max={300}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                  Scheduled Date & Time
                </label>
                <input
                  id="exam-schedule"
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {step === 1 && (
          <div className="space-y-6">
            {questions.map((q, qIdx) => (
              <div
                key={q.id}
                className="p-5 rounded-xl bg-zinc-800/30 border border-zinc-700/30 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-300">
                    Question {qIdx + 1}
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={q.question_type}
                      onChange={(e) =>
                        updateQuestion(q.id, 'question_type', e.target.value)
                      }
                      className="input-field !py-1.5 !px-2 !text-xs w-auto"
                    >
                      {QUESTION_TYPES.map((qt) => (
                        <option key={qt.value} value={qt.value}>
                          {qt.label}
                        </option>
                      ))}
                    </select>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"
                      >
                        <HiTrash className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={q.question_text}
                  onChange={(e) =>
                    updateQuestion(q.id, 'question_text', e.target.value)
                  }
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Enter your question..."
                />

                {q.question_type === 'mcq' && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">
                      Options (click to mark correct)
                    </label>
                    {q.options.map((opt, optIdx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newOpts = q.options.map((o) => ({
                              ...o,
                              is_correct: o.id === opt.id,
                            }));
                            updateQuestion(q.id, 'options', newOpts);
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                            opt.is_correct
                              ? 'border-green-500 bg-green-500/20'
                              : 'border-zinc-600'
                          }`}
                        >
                          {opt.is_correct && (
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                          )}
                        </button>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = { ...opt, text: e.target.value };
                            updateQuestion(q.id, 'options', newOpts);
                          }}
                          className="input-field !py-2 text-sm"
                          placeholder={`Option ${opt.id.toUpperCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-xs text-zinc-500">Max Marks</label>
                    <input
                      type="number"
                      value={q.max_marks}
                      onChange={(e) =>
                        updateQuestion(q.id, 'max_marks', Number(e.target.value))
                      }
                      className="input-field !py-1.5 !text-sm w-20"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">Difficulty (1-5)</label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() =>
                            updateQuestion(q.id, 'difficulty_level', d)
                          }
                          className={`w-7 h-7 rounded-md text-xs font-bold transition-all ${
                            q.difficulty_level >= d
                              ? 'bg-indigo-500/20 text-indigo-400'
                              : 'bg-zinc-800 text-zinc-600'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <HiPlus className="w-4 h-4" />
              Add Question
            </button>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Anti-Cheat Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(
                  [
                    {
                      value: 'minimal',
                      label: 'Minimal',
                      desc: 'Tab-switch logging only',
                    },
                    {
                      value: 'standard',
                      label: 'Standard',
                      desc: 'Camera block + fullscreen + clipboard',
                    },
                    {
                      value: 'strict',
                      label: 'Strict',
                      desc: 'Full lockdown + AI monitoring',
                    },
                  ] as { value: AntiCheatLevel; label: string; desc: string }[]
                ).map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setAntiCheatLevel(level.value)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      antiCheatLevel === level.value
                        ? 'border-indigo-500/50 bg-indigo-500/10'
                        : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-sm font-semibold">{level.label}</div>
                    <div className="text-xs text-zinc-500 mt-1">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/30">
              <div>
                <h3 className="text-sm font-semibold">Adaptive Difficulty</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  AI adjusts question difficulty based on student performance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAdaptive(!isAdaptive)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  isAdaptive ? 'bg-indigo-500' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                    isAdaptive ? 'left-6' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-1.5 block">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="input-field w-32"
                min={0}
                max={100}
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Review Your Exam</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl bg-zinc-800/30">
                <div className="text-xs text-zinc-500">Title</div>
                <div className="font-medium mt-1">{title || 'Untitled'}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30">
                <div className="text-xs text-zinc-500">Type</div>
                <div className="font-medium mt-1">
                  {EXAM_TYPES.find((t) => t.value === examType)?.emoji}{' '}
                  {EXAM_TYPES.find((t) => t.value === examType)?.label}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30">
                <div className="text-xs text-zinc-500">Duration</div>
                <div className="font-medium mt-1">{durationMinutes} minutes</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30">
                <div className="text-xs text-zinc-500">Questions</div>
                <div className="font-medium mt-1">{questions.length}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30">
                <div className="text-xs text-zinc-500">Anti-Cheat</div>
                <div className="font-medium mt-1 capitalize">{antiCheatLevel}</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-800/30">
                <div className="text-xs text-zinc-500">Adaptive</div>
                <div className="font-medium mt-1">{isAdaptive ? 'Yes ⚡' : 'No'}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
              <HiSparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-sm text-zinc-300">
                AI will generate model solutions and grading rubrics for each
                question after publishing.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="btn-secondary flex items-center gap-2 disabled:opacity-30"
        >
          <HiArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(Math.min(STEPS.length - 1, step + 1))}
            className="btn-primary flex items-center gap-2"
          >
            Next
            <HiArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <HiCheckCircle className="w-4 h-4" />
                Publish Exam
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
