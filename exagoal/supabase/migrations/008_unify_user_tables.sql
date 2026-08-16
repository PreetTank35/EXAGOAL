-- ============================================================
-- ExaGoal — Database Schema Migration 008
-- Unify teachers and profiles into a single table
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add 'department' column to profiles (currently only on teachers)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Backfill: Insert any teachers who don't have a profiles row yet
INSERT INTO public.profiles (id, full_name, role, department, created_at, updated_at)
SELECT 
    t.id,
    t.full_name,
    'instructor',
    t.department,
    t.created_at,
    t.updated_at
FROM public.teachers t
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = t.id
)
ON CONFLICT (id) DO UPDATE SET
    role = 'instructor',
    department = EXCLUDED.department;

-- 3. Replace the handle_new_user() trigger so ALL users go into profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email LIKE '%@exagoal.in' THEN
    -- Instructor: insert into profiles with role='instructor'
    INSERT INTO public.profiles (id, full_name, role, department)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Teacher'),
      'instructor',
      COALESCE(NEW.raw_user_meta_data->>'department', NULL)
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'instructor',
      department = COALESCE(EXCLUDED.department, public.profiles.department);

    -- Also keep the teachers table in sync for backwards compat (deprecated)
    INSERT INTO public.teachers (id, email, full_name, department)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Teacher'),
      COALESCE(NEW.raw_user_meta_data->>'department', NULL)
    )
    ON CONFLICT (id) DO NOTHING;
  ELSE
    -- Student: insert into profiles with role='student'
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student'),
      'student'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update RLS policies: instructors should be able to read their own profile
-- (The existing policy only allows auth.uid() = id, which already covers this)

-- 5. Add an RLS policy so instructors can read student profiles for analytics
CREATE POLICY "instructors_read_student_profiles" ON public.profiles
    FOR SELECT USING (
        role = 'student'
        AND EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'instructor'
        )
    );
