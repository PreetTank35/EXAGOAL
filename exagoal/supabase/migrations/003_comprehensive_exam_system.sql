-- ============================================================
-- ExaGoal — Database Schema Migration 003
-- Comprehensive Examination System (Teachers, Uploads, Notifications)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. DEDICATED TEACHERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@exagoal.in'),
    full_name TEXT NOT NULL,
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can read own profile" ON public.teachers 
    FOR SELECT USING (auth.uid() = id);

-- ============================================================
-- 2. AUTHENTICATION TRIGGER FOR ROLE ASSIGNMENT
-- ============================================================
-- This function runs every time a new user signs up in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If email is a teacher domain, insert into teachers table
  IF NEW.email LIKE '%@exagoal.in' THEN
    INSERT INTO public.teachers (id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Teacher'));
  ELSE
    -- Otherwise, insert into the student profiles table
    -- (Assumes profiles table handles the default student role logic)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'), 'student');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists (for idempotency)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- 3. EXAM MATERIALS (FILE UPLOADS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.exam_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'docx', 'image')),
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers manage own materials" ON public.exam_materials
    FOR ALL USING (teacher_id = auth.uid());


-- ============================================================
-- 4. STORAGE BUCKET FOR EXAM MATERIALS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('secure_exam_materials', 'secure_exam_materials', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage Bucket (Only authenticated users can upload/view temporarily)
CREATE POLICY "Auth users can upload exam materials" ON storage.objects
    FOR INSERT WITH CHECK ( bucket_id = 'secure_exam_materials' AND auth.role() = 'authenticated' );

CREATE POLICY "Owners can view materials" ON storage.objects
    FOR SELECT USING ( bucket_id = 'secure_exam_materials' AND auth.uid()::text = (storage.foldername(name))[1] );


-- ============================================================
-- 5. STUDENT NOTIFICATIONS (FOR SYNCHRONIZED OTP)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.student_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('otp_delivery', 'system_alert', 'exam_reminder')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.student_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read own notifications" ON public.student_notifications
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can update own notifications" ON public.student_notifications
    FOR UPDATE USING (student_id = auth.uid());

-- Enable Realtime for notifications so the OTP pops up instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_notifications;
