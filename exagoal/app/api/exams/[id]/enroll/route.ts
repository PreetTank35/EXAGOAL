import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase environment variables');
  return createClient(url, serviceKey);
}

/**
 * GET: List enrolled students for an exam
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const examId = resolvedParams.id;

    const supabaseClient = await createServerSupabaseClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify exam ownership
    const { data: exam } = await supabaseAdmin
      .from('exams')
      .select('id, created_by')
      .eq('id', examId)
      .single();

    if (!exam || exam.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch enrollments with student names
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('student_id, enrolled_at')
      .eq('exam_id', examId);

    if (error) throw new Error(error.message);

    // Get student profiles
    const studentIds = (enrollments || []).map(e => e.student_id);
    let students: { id: string; full_name: string; enrolled: boolean }[] = [];

    if (studentIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      students = (profiles || []).map(p => ({
        id: p.id,
        full_name: p.full_name,
        enrolled: true,
      }));
    }

    return NextResponse.json({ students, total: students.length });
  } catch (error: any) {
    console.error('List Enrollments Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST: Enroll students in an exam
 * Body: { student_ids: string[] }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const examId = resolvedParams.id;
    const { student_ids } = await req.json();

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json({ error: 'student_ids array is required' }, { status: 400 });
    }

    const supabaseClient = await createServerSupabaseClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify exam ownership
    const { data: exam } = await supabaseAdmin
      .from('exams')
      .select('id, created_by')
      .eq('id', examId)
      .single();

    if (!exam || exam.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert enrollments (upsert to avoid duplicates)
    const enrollmentsToInsert = student_ids.map((sid: string) => ({
      exam_id: examId,
      student_id: sid,
      enrolled_by: user.id,
    }));

    const { error } = await supabaseAdmin
      .from('enrollments')
      .upsert(enrollmentsToInsert, { onConflict: 'exam_id,student_id', ignoreDuplicates: true });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      message: `${student_ids.length} student(s) enrolled.`,
    });
  } catch (error: any) {
    console.error('Enroll Students Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE: Remove students from an exam enrollment
 * Body: { student_ids: string[] }
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const examId = resolvedParams.id;
    const { student_ids } = await req.json();

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return NextResponse.json({ error: 'student_ids array is required' }, { status: 400 });
    }

    const supabaseClient = await createServerSupabaseClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Verify exam ownership
    const { data: exam } = await supabaseAdmin
      .from('exams')
      .select('id, created_by')
      .eq('id', examId)
      .single();

    if (!exam || exam.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('enrollments')
      .delete()
      .eq('exam_id', examId)
      .in('student_id', student_ids);

    if (error) throw new Error(error.message);

    return NextResponse.json({
      success: true,
      message: `${student_ids.length} student(s) unenrolled.`,
    });
  } catch (error: any) {
    console.error('Unenroll Students Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
