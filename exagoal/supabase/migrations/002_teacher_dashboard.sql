-- ============================================================
-- ExaGoal — Database Schema Migration 002
-- Teacher Dashboard & Syllabus Management
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SYLLABI
-- ============================================================
CREATE TABLE IF NOT EXISTS public.syllabi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    academic_term TEXT NOT NULL,
    file_url TEXT NOT NULL, -- URL to Supabase Storage
    file_type TEXT NOT NULL, -- pdf, docx, etc.
    raw_text_content TEXT, -- Extracted text for AI processing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Syllabi
ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;

-- Instructors manage their own syllabi
CREATE POLICY "instructors_manage_syllabi" ON public.syllabi
    FOR ALL USING (instructor_id = auth.uid());

-- Students can read published syllabi
CREATE POLICY "students_read_syllabi" ON public.syllabi
    FOR SELECT USING (true);


-- ============================================================
-- EXAMS TABLE UPDATES
-- ============================================================
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS syllabus_id UUID REFERENCES public.syllabi(id);
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS generated_by_ai BOOLEAN DEFAULT FALSE;

-- ============================================================
-- STORAGE BUCKETS
-- Note: This is an idempotent query to create the bucket if it doesn't exist
-- Make sure to run this via a superuser or the Supabase dashboard
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('syllabi_files', 'syllabi_files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Auth users can upload syllabi" ON storage.objects
    FOR INSERT WITH CHECK ( bucket_id = 'syllabi_files' AND auth.role() = 'authenticated' );

-- Allow public to read syllabi
CREATE POLICY "Public can view syllabi" ON storage.objects
    FOR SELECT USING ( bucket_id = 'syllabi_files' );
