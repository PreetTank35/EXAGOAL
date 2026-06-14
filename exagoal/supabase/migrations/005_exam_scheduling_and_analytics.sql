-- ============================================================
-- ExaGoal — Database Schema Migration 005
-- Exam Scheduling and Availability Window Updates
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add availability window and strict submission option to exams
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS available_until TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS strict_submission BOOLEAN DEFAULT TRUE;

-- Update existing exams to have an available_until equal to their scheduled_at + duration + some buffer (e.g. 1 day)
-- for backwards compatibility if needed.
UPDATE public.exams
SET available_until = scheduled_at + interval '1 day'
WHERE available_until IS NULL;

-- Make available_until NOT NULL if desired, or leave it nullable if some exams are always open
-- ALTER TABLE public.exams ALTER COLUMN available_until SET NOT NULL;

-- Create an index for faster querying by availability
CREATE INDEX IF NOT EXISTS idx_exams_available_until ON public.exams(available_until);

-- Analytics Views (Optional, helps with dashboard queries without heavy client-side processing)
-- This view aggregates session scores per exam
CREATE OR REPLACE VIEW public.exam_analytics AS
SELECT 
    e.id AS exam_id,
    e.title,
    e.created_by AS teacher_id,
    COUNT(s.id) AS total_attempts,
    COUNT(CASE WHEN s.status IN ('submitted', 'graded') THEN 1 END) AS completed_attempts,
    AVG(CASE WHEN s.status IN ('submitted', 'graded') THEN s.total_score END) AS average_score,
    MAX(CASE WHEN s.status IN ('submitted', 'graded') THEN s.total_score END) AS highest_score,
    MIN(CASE WHEN s.status IN ('submitted', 'graded') THEN s.total_score END) AS lowest_score
FROM 
    public.exams e
LEFT JOIN 
    public.exam_sessions s ON e.id = s.exam_id
GROUP BY 
    e.id, e.title, e.created_by;
