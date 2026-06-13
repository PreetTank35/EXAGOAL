import { NextResponse } from 'next/server';
import { generateOTP, hashOTP, getOTPExpiry } from '@/lib/otp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, student_email } = body;

    if (!session_id) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = getOTPExpiry();

    // MVP: In production, update Supabase and send email
    // const supabase = createAdminClient();
    // await supabase.from('exam_sessions').update({
    //   otp_code: otpHash,
    //   otp_expires_at: expiresAt,
    //   status: 'otp_sent',
    // }).eq('id', session_id);

    // Send OTP via email (SMTP)
    // await sendEmail(student_email, 'Your Exam OTP', `Your OTP: ${otp}`);

    return NextResponse.json({
      message: 'OTP generated and sent',
      otp_preview: otp, // MVP only — remove in production!
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('OTP Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate OTP' },
      { status: 500 }
    );
  }
}
