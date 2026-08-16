-- ============================================================
-- ExaGoal — Database Schema Migration 009
-- Enrollment System
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Enrollments table: links students to exams
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    enrolled_by UUID REFERENCES auth.users(id), -- teacher who enrolled them
    UNIQUE(exam_id, student_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Teachers can manage enrollments for their own exams
CREATE POLICY "teachers_manage_enrollments" ON public.enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.exams e
            WHERE e.id = exam_id AND e.created_by = auth.uid()
        )
    );

-- Students can read their own enrollments
CREATE POLICY "students_read_own_enrollments" ON public.enrollments
    FOR SELECT USING (student_id = auth.uid());

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_exam ON public.enrollments(exam_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);

-- Enable Realtime for enrollments (so student dashboard can show enrolled exams)
ALTER PUBLICATION supabase_realtime ADD TABLE public.enrollments;
