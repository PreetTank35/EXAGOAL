-- ============================================================
-- Faraway LMS — Database Schema Migration
-- ============================================================
-- Run this in your Supabase SQL Editor or via supabase db push.
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES — Extended user data linked to auth.users
-- ============================================================
CREATE TABLE public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL DEFAULT '',
    avatar_url  TEXT DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'student'
                CHECK (role IN ('student', 'instructor', 'admin')),
    bio         TEXT DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================================
-- 2. COURSES
-- ============================================================
CREATE TABLE public.courses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,
    description     TEXT NOT NULL DEFAULT '',
    thumbnail_url   TEXT DEFAULT '',
    difficulty      TEXT NOT NULL DEFAULT 'beginner'
                    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),
    category        TEXT DEFAULT 'general',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON public.courses(instructor_id);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_courses_slug ON public.courses(slug);
CREATE INDEX idx_courses_category ON public.courses(category);

-- ============================================================
-- 3. LESSONS
-- ============================================================
CREATE TABLE public.lessons (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id        UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    content_md       TEXT NOT NULL DEFAULT '',
    order_index      INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lessons_course ON public.lessons(course_id);
CREATE INDEX idx_lessons_order ON public.lessons(course_id, order_index);

-- ============================================================
-- 4. ENROLLMENTS — Student <-> Course junction
-- ============================================================
CREATE TABLE public.enrollments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id   UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON public.enrollments(user_id);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id);

-- ============================================================
-- 5. PROGRESS — Lesson completion tracking
-- ============================================================
CREATE TABLE public.progress (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id    UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    course_id    UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user ON public.progress(user_id);
CREATE INDEX idx_progress_course ON public.progress(user_id, course_id);

-- ============================================================
-- 6. AUTO-CREATE PROFILE ON SIGNUP — Trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 7. UPDATED_AT AUTO-TOUCH — Trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. ROW-LEVEL SECURITY
-- ============================================================

-- ---------- PROFILES ----------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: anyone can read"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Profiles: users update own"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------- COURSES ----------
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Courses: anyone reads published"
    ON public.courses FOR SELECT
    USING (status = 'published' OR instructor_id = auth.uid());

CREATE POLICY "Courses: instructors insert own"
    ON public.courses FOR INSERT
    WITH CHECK (
        instructor_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('instructor', 'admin')
        )
    );

CREATE POLICY "Courses: owner or admin updates"
    ON public.courses FOR UPDATE
    USING (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Courses: owner or admin deletes"
    ON public.courses FOR DELETE
    USING (
        instructor_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ---------- LESSONS ----------
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons: read if course published or owned"
    ON public.lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id
            AND (c.status = 'published' OR c.instructor_id = auth.uid())
        )
    );

CREATE POLICY "Lessons: instructor manages own course lessons"
    ON public.lessons FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Lessons: instructor updates own course lessons"
    ON public.lessons FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Lessons: instructor deletes own course lessons"
    ON public.lessons FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

-- ---------- ENROLLMENTS ----------
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enrollments: students read own"
    ON public.enrollments FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Enrollments: students enroll themselves"
    ON public.enrollments FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enrollments: students manage own"
    ON public.enrollments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Enrollments: students delete own"
    ON public.enrollments FOR DELETE
    USING (user_id = auth.uid());

-- ---------- PROGRESS ----------
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Progress: students read own or instructor reads course"
    ON public.progress FOR SELECT
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Progress: students insert own"
    ON public.progress FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Progress: students delete own"
    ON public.progress FOR DELETE
    USING (user_id = auth.uid());
