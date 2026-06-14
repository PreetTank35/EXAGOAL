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

    // 2. Fetch exam sessions for this exam
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('exam_sessions')
      .select('student_id, otp_code, otp_expires_at, status')
      .eq('exam_id', examId);

    if (sessionsError) {
      throw new Error(sessionsError.message);
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ otps: [] });
    }

    // 3. Fetch student profiles to map names
    const studentIds = sessions.map(s => s.student_id);
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, role')
      .in('id', studentIds);

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    // Map profiles
    const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

    const otps = sessions.map(s => ({
      student_id: s.student_id,
      student_name: profileMap.get(s.student_id) || 'Unknown Student',
      otp_code: s.otp_code,
      expires_at: s.otp_expires_at,
      status: s.status
    }));

    // Sort alphabetically by student name
    otps.sort((a, b) => a.student_name.localeCompare(b.student_name));

    return NextResponse.json({ otps });

  } catch (error: any) {
    console.error('Fetch OTPs Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
