-- ============================================================
-- ExaGoal — Database Schema Migration 006
-- OTP Notification Enhancements
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enhance student_notifications table to handle real-time OTPs better
ALTER TABLE public.student_notifications
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'used')),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create an index to quickly find active notifications
CREATE INDEX IF NOT EXISTS idx_student_notifications_active 
ON public.student_notifications(student_id, status)
WHERE status = 'active';

-- Allow teachers to insert into student_notifications so they can broadcast OTPs
-- Currently, there is only a SELECT and UPDATE policy for students.
CREATE POLICY "Teachers can insert notifications for their exams" ON public.student_notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.exams e 
            WHERE e.id = exam_id AND e.created_by = auth.uid()
        )
    );

CREATE POLICY "Teachers can update notifications for their exams" ON public.student_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.exams e 
            WHERE e.id = exam_id AND e.created_by = auth.uid()
        )
    );

-- Ensure exam_sessions has a unique constraint on (exam_id, student_id) for upserts
ALTER TABLE public.exam_sessions
DROP CONSTRAINT IF EXISTS unique_exam_student;

ALTER TABLE public.exam_sessions
ADD CONSTRAINT unique_exam_student UNIQUE (exam_id, student_id);
