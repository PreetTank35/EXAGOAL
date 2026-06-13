import { NextResponse } from 'next/server';
import { verifyOTP, isOTPExpired } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, otp_code } = body;

    if (!session_id || !otp_code) {
      return NextResponse.json(
        { error: 'session_id and otp_code are required' },
        { status: 400 }
      );
    }

    // MVP: Simulate verification — accept any 6-digit code
    // In production:
    // const supabase = createAdminClient();
    // const { data: session } = await supabase
    //   .from('exam_sessions')
    //   .select('otp_code, otp_expires_at, otp_verified')
    //   .eq('id', session_id)
    //   .single();
    //
    // if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    // if (session.otp_verified) return NextResponse.json({ error: 'OTP already used' }, { status: 409 });
    // if (isOTPExpired(session.otp_expires_at)) return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
    // if (!verifyOTP(otp_code, session.otp_code)) return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });

    if (otp_code.length !== 6) {
      return NextResponse.json({ error: 'OTP must be 6 digits' }, { status: 400 });
    }

    return NextResponse.json({
      verified: true,
      message: 'OTP verified — exam access granted',
      redirect_url: `/exam/live/${session_id}`,
    });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
