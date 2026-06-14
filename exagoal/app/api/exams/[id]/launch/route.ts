import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase environment variables');
  return createClient(url, serviceKey);
}

// Generate a cryptographically secure 6-character uppercase alphanumeric OTP
// Avoids 0, O, I, 1 for clarity
function generateSecureOtp(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    otp += chars[randomIndex];
  }
  return otp;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const examId = resolvedParams.id;
    const supabase = getSupabaseAdmin();

    // 1. Verify Exam exists and is not already completed
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('id, title, duration_minutes, status, created_by')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: 'Exam not found.' }, { status: 404 });
    }

    if (exam.status === 'completed' || exam.status === 'archived') {
      return NextResponse.json({ error: 'Cannot launch a completed or archived exam.' }, { status: 400 });
    }

    // 2. Fetch all students (in a real app, this would query an enrollments table)
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'student');

    if (studentsError) {
      return NextResponse.json({ error: 'Error fetching students.' }, { status: 500 });
    }
    
    const studentsList = students || [];

    // Set validity window (15 mins)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60000); // 15 minutes from now

    // 3. Prepare bulk inserts
    const sessionsToInsert = [];
    const notificationsToInsert = [];

    for (const student of studentsList) {
      const otpCode = generateSecureOtp();
      
      // Upsert exam_session for this student
      sessionsToInsert.push({
        exam_id: examId,
        student_id: student.id,
        otp_code: otpCode,
        otp_expires_at: expiresAt.toISOString(),
        status: 'otp_sent',
        otp_verified: false,
      });

      // Insert real-time notification
      notificationsToInsert.push({
        student_id: student.id,
        exam_id: examId,
        title: `Exam Access: ${exam.title}`,
        message: `Your exam access code is ${otpCode}. It expires in 15 minutes.`,
        notification_type: 'otp_delivery',
        is_read: false,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        metadata: { otp_code: otpCode }
      });
    }

    // 4. Update existing notifications for this exam to 'revoked' to clean up old banners
    await supabase
      .from('student_notifications')
      .update({ status: 'revoked', is_read: true })
      .eq('exam_id', examId)
      .eq('notification_type', 'otp_delivery');

    if (studentsList.length > 0) {
      // 5. Insert new sessions (using upsert in case of re-launches)
      const { error: sessionInsertError } = await supabase
        .from('exam_sessions')
        .upsert(sessionsToInsert, { onConflict: 'exam_id,student_id', ignoreDuplicates: false });

      if (sessionInsertError) {
        throw new Error(`Failed to create sessions: ${sessionInsertError.message}`);
      }

      // 6. Insert new real-time notifications
      const { error: notificationInsertError } = await supabase
        .from('student_notifications')
        .insert(notificationsToInsert);

      if (notificationInsertError) {
        throw new Error(`Failed to send notifications: ${notificationInsertError.message}`);
      }
    }

    // 7. Update exam status to active
    await supabase
      .from('exams')
      .update({ status: 'active' })
      .eq('id', examId);

    return NextResponse.json({
      success: true,
      message: `Exam launched. OTPs delivered to ${studentsList.length} students.`,
    });

  } catch (error: any) {
    console.error('Launch Exam Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
