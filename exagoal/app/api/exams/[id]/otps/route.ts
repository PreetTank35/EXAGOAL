import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase environment variables');
  return createClient(url, serviceKey);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const examId = resolvedParams.id;
    
    // Auth check via standard server client
    const supabaseClient = await createServerSupabaseClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Verify exam ownership
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .select('id, created_by')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    if (exam.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this exam' }, { status: 403 });
    }

    // 2. Fetch OTP details from student_notifications instead of exam_sessions
    //    (Since exam_sessions now stores HMAC-hashed OTPs, we read plaintext from notifications)
    const { data: notifications, error: notifError } = await supabaseAdmin
      .from('student_notifications')
      .select('student_id, metadata, expires_at, status')
      .eq('exam_id', examId)
      .eq('notification_type', 'otp_delivery')
      .neq('status', 'revoked');

    if (notifError) {
      throw new Error(notifError.message);
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ otps: [] });
    }

    // 3. Fetch student profiles to map names
    const studentIds = notifications.map(n => n.student_id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .in('id', studentIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    // Map profiles
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    const otps = notifications.map(n => ({
      student_id: n.student_id,
      student_name: profileMap.get(n.student_id) || 'Unknown Student',
      otp_code: (n.metadata as Record<string, string>)?.otp_code || '------',
      expires_at: n.expires_at,
      status: n.status,
    }));

    // Sort alphabetically by student name
    otps.sort((a, b) => a.student_name.localeCompare(b.student_name));

    return NextResponse.json({ otps });

  } catch (error: any) {
    console.error('Fetch OTPs Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
