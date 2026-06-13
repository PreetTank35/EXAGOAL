import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase environment variables');
  return createClient(url, serviceKey);
}

/**
 * OTP Generation Cron Job
 * 
 * This runs every minute. It finds exams starting in ~5 minutes,
 * generates cryptographically secure 6-digit OTPs for each enrolled student,
 * and pushes Realtime notifications to their dashboards.
 * 
 * Trigger: Vercel Cron (vercel.json) or manual GET request
 */
export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret in production
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();

    // Find exams starting between 4 and 6 minutes from now
    const tMinus4 = new Date(now.getTime() + 4 * 60 * 1000).toISOString();
    const tMinus6 = new Date(now.getTime() + 6 * 60 * 1000).toISOString();

    console.log(`[CRON] Checking for exams between ${tMinus4} and ${tMinus6}`);

    const { data: exams, error: examsError } = await supabase
      .from('exams')
      .select('id, title, scheduled_at, duration_minutes')
      .gte('scheduled_at', tMinus4)
      .lte('scheduled_at', tMinus6)
      .eq('status', 'published');

    if (examsError) {
      console.error('[CRON] Error fetching exams:', examsError);
      return NextResponse.json({ error: examsError.message }, { status: 500 });
    }

    if (!exams || exams.length === 0) {
      return NextResponse.json({ success: true, message: 'No exams starting in 5 minutes.', processed: 0 });
    }

    let totalProcessed = 0;

    for (const exam of exams) {
      // Find all sessions for this exam that haven't received OTPs yet
      const { data: sessions, error: sessionsError } = await supabase
        .from('exam_sessions')
        .select('id, student_id')
        .eq('exam_id', exam.id)
        .eq('status', 'pending'); // Only pending sessions

      if (sessionsError || !sessions) {
        console.error(`[CRON] Error fetching sessions for exam ${exam.id}:`, sessionsError);
        continue;
      }

      for (const session of sessions) {
        // Generate cryptographically secure 6-digit OTP
        const otpCode = String(crypto.getRandomValues(new Uint32Array(1))[0] % 900000 + 100000);
        const otpExpiry = new Date(new Date(exam.scheduled_at).getTime() + exam.duration_minutes * 60 * 1000);

        // Update the session with the OTP
        await supabase
          .from('exam_sessions')
          .update({
            otp_code: otpCode,
            otp_expires_at: otpExpiry.toISOString(),
            status: 'otp_sent',
          })
          .eq('id', session.id);

        // Push a Realtime notification to the student's dashboard
        await supabase
          .from('student_notifications')
          .insert({
            student_id: session.student_id,
            exam_id: exam.id,
            notification_type: 'otp_delivery',
            title: '🔑 Exam Starting Soon',
            message: `Your exam "${exam.title}" starts in 5 minutes.\n\nYour unique entry OTP is: ${otpCode}\n\nDo NOT share this code with anyone.`,
          });

        totalProcessed++;
      }

      console.log(`[CRON] Processed ${sessions.length} students for exam "${exam.title}"`);
    }

    return NextResponse.json({
      success: true,
      message: `OTP generation cycle completed.`,
      exams_found: exams.length,
      students_processed: totalProcessed,
    });

  } catch (error: any) {
    console.error('[CRON] Fatal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
