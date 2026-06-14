import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client (bypasses RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase environment variables');
  return createClient(url, serviceKey);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { otp_code, student_id } = await req.json();
    const resolvedParams = await params;
    const examId = resolvedParams.id;

    if (!otp_code || !student_id || !examId) {
      return NextResponse.json({ error: 'exam_id, otp_code, and student_id are required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // ============================================================
    // GATE 1: TIME GATE — Is the exam scheduled time reached?
    // ============================================================
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('id, title, scheduled_at, duration_minutes, status')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: 'Exam not found.' }, { status: 404 });
    }

    const now = new Date();
    const scheduledAt = new Date(exam.scheduled_at);
    const examEndAt = new Date(scheduledAt.getTime() + exam.duration_minutes * 60 * 1000);

    if (now < scheduledAt) {
      const minutesUntil = Math.ceil((scheduledAt.getTime() - now.getTime()) / 60000);
      return NextResponse.json({
        error: `Exam has not started yet. It begins in ${minutesUntil} minute(s).`,
        starts_in_minutes: minutesUntil,
      }, { status: 403 });
    }

    if (now > examEndAt) {
      return NextResponse.json({ error: 'This exam has already ended.' }, { status: 403 });
    }

    // ============================================================
    // GATE 2: OTP GATE — Is the OTP valid for this student+exam?
    // ============================================================
    const { data: session, error: sessionError } = await supabase
      .from('exam_sessions')
      .select('id, otp_code, otp_expires_at, otp_verified, status')
      .eq('exam_id', examId)
      .eq('student_id', student_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No exam session found for this student.' }, { status: 404 });
    }

    // Verify OTP matches
    if (session.otp_code !== otp_code) {
      return NextResponse.json({ error: 'Invalid OTP. Please check your notification and try again.' }, { status: 401 });
    }

    // Check if OTP has expired
    if (session.otp_expires_at && new Date(session.otp_expires_at) < now) {
      return NextResponse.json({ error: 'This OTP has expired. Please contact your instructor.' }, { status: 401 });
    }

    // ============================================================
    // GATE 3: STATUS GATE — Is the session in a valid state?
    // ============================================================
    if (session.status === 'submitted' || session.status === 'graded') {
      return NextResponse.json({ error: 'You have already submitted this exam.' }, { status: 403 });
    }

    // ============================================================
    // ALL GATES PASSED — Grant Access
    // ============================================================

    // Mark OTP as verified and session as active
    await supabase
      .from('exam_sessions')
      .update({
        otp_verified: true,
        status: 'active',
        started_at: now.toISOString(),
      })
      .eq('id', session.id);

    // Generate short-lived signed URL for the exam material (if descriptive paper)
    let materialUrl = null;
    const { data: materials } = await supabase
      .from('exam_materials')
      .select('storage_path')
      .eq('exam_id', examId)
      .limit(1);

    if (materials && materials.length > 0) {
      const { data: signedUrlData } = await supabase.storage
        .from('secure_exam_materials')
        .createSignedUrl(materials[0].storage_path, (exam.duration_minutes + 5) * 60); // Expires at exam end + 5 min buffer

      materialUrl = signedUrlData?.signedUrl || null;
    }

    return NextResponse.json({
      success: true,
      session_id: session.id,
      exam_title: exam.title,
      duration_minutes: exam.duration_minutes,
      ends_at: examEndAt.toISOString(),
      material_url: materialUrl,
    });

  } catch (error: any) {
    console.error('Exam Access Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
