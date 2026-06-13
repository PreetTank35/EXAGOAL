-- ============================================================
-- ExaGoal — Database Schema Migration 004
-- Fix ALL foreign keys that teachers use to reference auth.users
-- instead of profiles (since teachers are in the teachers table)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Fix syllabi.instructor_id
ALTER TABLE public.syllabi
  DROP CONSTRAINT IF EXISTS syllabi_instructor_id_fkey;
ALTER TABLE public.syllabi
  ADD CONSTRAINT syllabi_instructor_id_fkey
  FOREIGN KEY (instructor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Fix exams.created_by
ALTER TABLE public.exams
  DROP CONSTRAINT IF EXISTS exams_created_by_fkey;
ALTER TABLE public.exams
  ADD CONSTRAINT exams_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Fix exam_materials.teacher_id (already references teachers, but make safe)
ALTER TABLE public.exam_materials
  DROP CONSTRAINT IF EXISTS exam_materials_teacher_id_fkey;
ALTER TABLE public.exam_materials
  ADD CONSTRAINT exam_materials_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Backfill missing teacher records
INSERT INTO public.teachers (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Teacher')
FROM auth.users
WHERE email LIKE '%@exagoal.in'
ON CONFLICT (id) DO NOTHING;
