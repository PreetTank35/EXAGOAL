-- ============================================================
-- ExaGoal — Database Schema Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- INSTITUTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    country_code TEXT NOT NULL,
    blockchain_wallet TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'instructor', 'admin')),
    institution_id UUID REFERENCES public.institutions(id),
    avatar_url TEXT,
    chi_score NUMERIC(5,2) DEFAULT 0,
    toku_score NUMERIC(5,2) DEFAULT 0,
    tai_score NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    institution_id UUID REFERENCES public.institutions(id),
    created_by UUID REFERENCES public.profiles(id),
    exam_type TEXT NOT NULL CHECK (exam_type IN (
        'knowledge', 'reasoning', 'ethical', 'collaborative', 'wellness_check'
    )),
    duration_minutes INTEGER NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    is_adaptive BOOLEAN DEFAULT FALSE,
    max_attempts INTEGER DEFAULT 1,
    passing_score NUMERIC(5,2),
    anti_cheat_level TEXT DEFAULT 'standard' CHECK (anti_cheat_level IN ('minimal', 'standard', 'strict')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- QUESTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN (
        'mcq', 'short_answer', 'essay', 'code', 'case_study', 'peer_review'
    )),
    options JSONB,
    correct_answer TEXT,
    max_marks NUMERIC(5,2) NOT NULL,
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    bloom_taxonomy TEXT CHECK (bloom_taxonomy IN (
        'remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'
    )),
    ai_solution TEXT,
    ai_rubric JSONB,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EXAM SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exam_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.exams(id),
    student_id UUID REFERENCES public.profiles(id),
    otp_code TEXT NOT NULL,
    otp_expires_at TIMESTAMPTZ NOT NULL,
    otp_verified BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'otp_sent', 'active', 'submitted', 'flagged', 'graded'
    )),
    total_score NUMERIC(5,2),
    chi_contribution NUMERIC(5,2),
    toku_contribution NUMERIC(5,2),
    tai_contribution NUMERIC(5,2),
    blockchain_tx_hash TEXT,
    integrity_score NUMERIC(5,2) DEFAULT 100,
    anti_cheat_log JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id),
    student_answer TEXT,
    is_correct BOOLEAN,
    marks_awarded NUMERIC(5,2),
    time_spent_seconds INTEGER,
    ai_feedback TEXT,
    ai_confidence NUMERIC(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREDENTIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id),
    student_id UUID REFERENCES public.profiles(id),
    credential_hash TEXT NOT NULL,
    blockchain_network TEXT DEFAULT 'polygon',
    tx_hash TEXT,
    block_number BIGINT,
    verified BOOLEAN DEFAULT FALSE,
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.exam_sessions(id),
    event_type TEXT NOT NULL CHECK (event_type IN (
        'tab_switch', 'fullscreen_exit', 'copy_attempt',
        'right_click', 'camera_block', 'idle_timeout',
        'question_navigate', 'answer_submit', 'wellness_checkin'
    )),
    event_data JSONB,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "users_read_own_profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Exams: anyone can read published exams; instructors can manage their own
CREATE POLICY "read_published_exams" ON public.exams
    FOR SELECT USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "instructors_manage_exams" ON public.exams
    FOR ALL USING (created_by = auth.uid());

-- Exam sessions: students see their own; instructors see their exam's sessions
CREATE POLICY "students_own_sessions" ON public.exam_sessions
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "instructors_exam_sessions" ON public.exam_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exams e
            WHERE e.id = exam_id AND e.created_by = auth.uid()
        )
    );

-- Answers: students can insert to their active sessions
CREATE POLICY "students_submit_answers" ON public.answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exam_sessions es
            WHERE es.id = session_id
            AND es.student_id = auth.uid()
            AND es.status = 'active'
        )
    );

CREATE POLICY "students_read_own_answers" ON public.answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.exam_sessions es
            WHERE es.id = session_id AND es.student_id = auth.uid()
        )
    );

-- Credentials: public read for verification
CREATE POLICY "public_verify_credentials" ON public.credentials
    FOR SELECT USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_scheduled ON public.exams(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.exam_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exam ON public.exam_sessions(exam_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON public.answers(session_id);
CREATE INDEX IF NOT EXISTS idx_credentials_hash ON public.credentials(credential_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.analytics_events(session_id);

-- ============================================================
-- REALTIME (enable for proctoring)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.exam_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.answers;
