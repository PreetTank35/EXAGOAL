import { NextResponse } from 'next/server';
import {
  generateCredentialHash,
  anchorToBlockchain,
  getVerificationURL,
} from '@/lib/blockchain';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, exam_id, score, completed_at, institution_id } = body;

    if (!student_id || !exam_id || score === undefined) {
      return NextResponse.json(
        { error: 'student_id, exam_id, and score are required' },
        { status: 400 }
      );
    }

    // Generate credential hash
    const credentialHash = generateCredentialHash({
      studentId: student_id,
      examId: exam_id,
      score,
      completedAt: completed_at || new Date().toISOString(),
      institutionId: institution_id || 'default',
    });

    // Anchor to blockchain (simulated for MVP)
    const txResult = await anchorToBlockchain(credentialHash);

    // MVP: In production, store credential in Supabase
    // const supabase = createAdminClient();
    // await supabase.from('credentials').insert({
    //   session_id: body.session_id,
    //   student_id,
    //   credential_hash: credentialHash,
    //   blockchain_network: txResult.network,
    //   tx_hash: txResult.txHash,
    //   block_number: txResult.blockNumber,
    //   verified: true,
    // });

    const verificationURL = getVerificationURL(credentialHash);

    return NextResponse.json({
      credential_hash: credentialHash,
      tx_hash: txResult.txHash,
      block_number: txResult.blockNumber,
      network: txResult.network,
      verification_url: verificationURL,
    });
  } catch (error) {
    console.error('Blockchain Anchor Error:', error);
    return NextResponse.json(
      { error: 'Failed to anchor credential' },
      { status: 500 }
    );
  }
}
