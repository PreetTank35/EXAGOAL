import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize a Supabase admin client to bypass RLS since verification is a public action
// We need access to the student profile and exam details which might be protected
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(
  request: Request,
  { params }: { params: { hash: string } }
) {
  const hash = params.hash;

  if (!hash) {
    return NextResponse.json({ error: 'Missing credential hash' }, { status: 400 });
  }

  try {
    // We fetch the credential and join the associated session, exam, and student profile
    const { data: credential, error } = await supabaseAdmin
      .from('credentials')
      .select(`
        *,
        exam_sessions!inner (
          total_score,
          exams!inner (
            title,
            passing_score,
            institutions (
              name
            )
          ),
          profiles!inner (
            full_name
          )
        )
      `)
      .eq('credential_hash', hash)
      .single();

    if (error || !credential) {
      return NextResponse.json({ error: 'Credential not found' }, { status: 404 });
    }

    // Format the response for the frontend
    const score = credential.exam_sessions.total_score || 0;
    const passingScore = credential.exam_sessions.exams.passing_score || 0;
    
    // Determine a simple grade letter based on score (since grade isn't explicitly stored)
    let grade = 'F';
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';

    const responseData = {
      valid: true,
      student_name: credential.exam_sessions.profiles.full_name || 'Unknown Student',
      exam_title: credential.exam_sessions.exams.title || 'Unknown Exam',
      score: score,
      grade: grade,
      issued_at: credential.issued_at,
      institution: credential.exam_sessions.exams.institutions?.name || 'ExaGoal Verification',
      network: credential.blockchain_network,
      block_number: credential.block_number,
      tx_hash: credential.tx_hash
    };

    return NextResponse.json({ credential: responseData });
  } catch (error: any) {
    console.error('Credential Verification Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
