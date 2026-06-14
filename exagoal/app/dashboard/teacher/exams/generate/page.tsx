'use client';

import { useState, useEffect } from 'react';
import { HiSparkles, HiChevronRight, HiCheckCircle, HiChevronLeft, HiPencilSquare, HiTrash } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import TimePicker from '@/components/ui/TimePicker';
import { createDateFrom12Hour, isWithinOperatingHours } from '@/lib/utils/timeFormat';

interface Syllabus {
  id: string;
  subject: string;
  grade_level: string;
  academic_term: string;
  raw_text_content: string | null;
}

interface GeneratedQuestion {
  question_text: string;
  question_type: string;
  options?: { id: string; text: string; is_correct: boolean }[];
  correct_answer: string;
  max_marks: number;
  difficulty_level: number;
  bloom_taxonomy: string;
  order_index: number;
}

export default function GenerateExamPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  // Config
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState('');
  const [manualSyllabus, setManualSyllabus] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [examTitle, setExamTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  // Schedule state
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [schedDate, setSchedDate] = useState(tomorrow);
  const [schedHour, setSchedHour] = useState(9);
  const [schedMinute, setSchedMinute] = useState(0);
  const [schedAmPm, setSchedAmPm] = useState<'AM' | 'PM'>('AM');

  const [availDate, setAvailDate] = useState(tomorrow);
  const [availHour, setAvailHour] = useState(5);
  const [availMinute, setAvailMinute] = useState(0);
  const [availAmPm, setAvailAmPm] = useState<'AM' | 'PM'>('PM');

  const [strictSubmission, setStrictSubmission] = useState(true);

  // Generated output
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadSyllabi();
  }, []);

  async function loadSyllabi() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('syllabi')
      .select('id, subject, grade_level, academic_term, raw_text_content')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setSyllabi(data);
  }

  async function handleGenerate() {
    setError('');
    setIsGenerating(true);
    setProgress(10);

    const syllabusText = manualSyllabus.trim() ||
      syllabi.find(s => s.id === selectedSyllabusId)?.raw_text_content ||
      syllabi.find(s => s.id === selectedSyllabusId)?.subject ||
      '';

    if (!syllabusText) {
      setError('Please select a syllabus or enter content manually.');
      setIsGenerating(false);
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 8, 85));
    }, 1500);

    try {
      const res = await fetch('/api/ai/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabus_text: syllabusText,
          question_count: questionCount,
          difficulty,
          question_types: ['mcq'],
          exam_title: examTitle || 'AI Generated Exam',
          duration_minutes: durationMinutes,
        }),
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        let err;
        let text = '';
        try {
          text = await res.clone().text();
          err = await res.json();
        } catch (e) {
          throw new Error(`Server Error (${res.status}): ${text.substring(0, 100)}...`);
        }
        throw new Error(err.error || 'Generation failed');
      }

      const data = await res.json();
      setQuestions(data.questions || []);
      setProgress(100);

      setTimeout(() => setStep(3), 500);
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message || 'Failed to generate exam');
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePublish() {
    setIsPublishing(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const schedLocal = createDateFrom12Hour(schedDate, schedHour, schedMinute, schedAmPm);
      const availLocal = createDateFrom12Hour(availDate, availHour, availMinute, availAmPm);

      if (!isWithinOperatingHours(schedLocal)) {
        throw new Error('Scheduled start time must be between 6:00 AM and 10:00 PM.');
      }
      if (!isWithinOperatingHours(availLocal)) {
        throw new Error('Availability end time must be between 6:00 AM and 10:00 PM.');
      }

      if (availLocal <= schedLocal) {
        throw new Error('Availability end time must be after the scheduled start time.');
      }

      const scheduledIso = schedLocal.toISOString();
      const availableIso = availLocal.toISOString();

      // 1. Create the exam record
      const { data: exam, error: examError } = await supabase
        .from('exams')
        .insert({
          title: examTitle || 'AI Generated Exam',
          description: `AI-generated from syllabus. ${questions.length} questions.`,
          created_by: user.id,
          exam_type: 'knowledge',
          duration_minutes: durationMinutes,
          scheduled_at: scheduledIso,
          available_until: availableIso,
          strict_submission: strictSubmission,
          status: 'published',
        })
        .select()
        .single();

      if (examError) throw new Error(examError.message);

      // 2. Insert all questions
      const questionsToInsert = questions.map((q, i) => ({
        exam_id: exam.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options ? JSON.stringify(q.options) : null,
        correct_answer: q.correct_answer,
        max_marks: q.max_marks || 1,
        difficulty_level: q.difficulty_level || 3,
        bloom_taxonomy: q.bloom_taxonomy || 'understand',
        order_index: i + 1,
      }));

      const { error: qError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (qError) throw new Error(qError.message);

      // Redirect to exam management
      router.push('/dashboard/teacher/exams');
    } catch (err: any) {
      setError(err.message || 'Failed to publish exam');
    } finally {
      setIsPublishing(false);
    }
  }

  function removeQuestion(idx: number) {
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Exam Generation</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Generate high-quality exams from your uploaded syllabi using Nemotron 120B.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between relative mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-zinc-800/50 -z-10" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-rose-500 transition-all duration-500 -z-10" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
        
        {[
          { label: 'Parameters', stepNum: 1 },
          { label: 'AI Generation', stepNum: 2 },
          { label: 'Review & Publish', stepNum: 3 }
        ].map((s) => (
          <div key={s.stepNum} className="flex flex-col items-center gap-2 bg-zinc-950 px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium border-2 transition-colors ${
              step >= s.stepNum ? 'bg-rose-500 border-rose-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-500'
            }`}>
              {step > s.stepNum ? <HiCheckCircle className="w-5 h-5" /> : s.stepNum}
            </div>
            <span className={`text-xs font-medium ${step >= s.stepNum ? 'text-zinc-200' : 'text-zinc-500'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Configuration */}
      {step === 1 && (
        <div className="glass-card p-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-lg font-semibold mb-6">Configure Exam Parameters</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Exam Title</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                placeholder="e.g. Physics Midterm Exam"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Select Source Syllabus</label>
              {syllabi.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {syllabi.map((s) => (
                    <label key={s.id} className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedSyllabusId === s.id ? 'border-rose-500 bg-rose-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'}`}>
                      <input type="radio" name="syllabus" className="sr-only" checked={selectedSyllabusId === s.id} onChange={() => setSelectedSyllabusId(s.id)} />
                      <span className="font-medium text-sm">{s.subject} ({s.grade_level})</span>
                      <p className="text-xs text-zinc-500 mt-1">{s.academic_term}</p>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 mb-2">No syllabi uploaded. Enter content manually below:</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Or paste syllabus content manually</label>
              <textarea
                value={manualSyllabus}
                onChange={(e) => setManualSyllabus(e.target.value)}
                placeholder="Paste your syllabus, curriculum, or topic list here..."
                rows={5}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Questions</label>
                <input type="number" value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} min={1} max={50} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500">
                  <option value="easy">Easy (Recall)</option>
                  <option value="medium">Medium (Apply)</option>
                  <option value="hard">Hard (Evaluate)</option>
                  <option value="adaptive">Adaptive (Mix)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Duration (min)</label>
                <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} min={5} max={300} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 bg-zinc-900/20 p-4 rounded-xl border border-zinc-800/50">
              <TimePicker
                label="Schedule Start Date & Time"
                date={schedDate}
                hour={schedHour}
                minute={schedMinute}
                ampm={schedAmPm}
                onDateChange={setSchedDate}
                onHourChange={setSchedHour}
                onMinuteChange={setSchedMinute}
                onAmPmChange={setSchedAmPm}
              />
              <TimePicker
                label="Available Until (End Time)"
                date={availDate}
                hour={availHour}
                minute={availMinute}
                ampm={availAmPm}
                onDateChange={setAvailDate}
                onHourChange={setAvailHour}
                onMinuteChange={setAvailMinute}
                onAmPmChange={setAvailAmPm}
              />
            </div>

            <label className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 cursor-pointer hover:border-zinc-700 transition-colors">
              <input type="checkbox" checked={strictSubmission} onChange={(e) => setStrictSubmission(e.target.checked)} className="w-4 h-4 rounded border-zinc-700 text-rose-500 focus:ring-rose-500 bg-zinc-900" />
              <div>
                <p className="font-medium text-sm text-zinc-200">Strict Automatic Submission</p>
                <p className="text-xs text-zinc-500 mt-0.5">Automatically submit the exam when the duration expires or availability window ends.</p>
              </div>
            </label>

            <div className="pt-4 border-t border-zinc-800/50 flex justify-end">
              <button 
                onClick={() => { setStep(2); handleGenerate(); }}
                className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Generate with AI <HiSparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Generation */}
      {step === 2 && (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
          <div className="relative">
            <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center relative shadow-lg">
              <HiSparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mt-6 mb-2">Nemotron is generating your exam...</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-8">
            Analyzing your syllabus and drafting {questionCount} {difficulty}-difficulty questions.
          </p>
          
          <div className="w-full max-w-md bg-zinc-900 rounded-full h-2 mb-4 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-zinc-500 font-mono">
            {progress < 30 ? 'Analyzing syllabus...' : progress < 60 ? 'Drafting questions...' : progress < 90 ? 'Formatting output...' : 'Almost done!'}
          </p>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-400">Exam Generation Complete</h3>
                <p className="text-sm text-emerald-500/70">{questions.length} questions drafted successfully.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                <HiChevronLeft className="w-4 h-4" /> Regenerate
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
              >
                {isPublishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  'Publish Exam'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3 flex-1">
                    <span className="font-medium text-rose-400">{i + 1}.</span>
                    <div className="flex-1">
                      <p className="font-medium mb-3">{q.question_text}</p>
                      {q.options && (
                        <div className="space-y-2">
                          {q.options.map((o, j) => (
                            <div key={j} className={`px-3 py-2 rounded-lg border text-sm ${o.is_correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-zinc-800 bg-zinc-900/30'}`}>
                              {String.fromCharCode(65 + j)}. {o.text}
                            </div>
                          ))}
                        </div>
                      )}
                      {!q.options && q.correct_answer && (
                        <div className="px-3 py-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 text-sm text-emerald-300">
                          Model Answer: {q.correct_answer}
                        </div>
                      )}
                      <div className="flex gap-3 mt-3 text-xs text-zinc-500">
                        <span>Difficulty: {q.difficulty_level}/5</span>
                        <span>Bloom: {q.bloom_taxonomy}</span>
                        <span>Marks: {q.max_marks}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeQuestion(i)}
                    className="text-xs font-medium text-zinc-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors ml-2"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
