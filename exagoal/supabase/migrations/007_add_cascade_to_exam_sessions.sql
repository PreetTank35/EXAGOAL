-- ============================================================
-- ExaGoal — Database Schema Migration 007
-- Add ON DELETE CASCADE to exam_sessions
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Fix: Allow exams to be deleted by ensuring exam_sessions are deleted along with it
ALTER TABLE public.exam_sessions
DROP CONSTRAINT IF EXISTS exam_sessions_exam_id_fkey;

ALTER TABLE public.exam_sessions
ADD CONSTRAINT exam_sessions_exam_id_fkey
FOREIGN KEY (exam_id) REFERENCES public.exams(id) ON DELETE CASCADE;
