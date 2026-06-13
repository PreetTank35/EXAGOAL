import { NextResponse } from 'next/server';

/**
 * Signs an HMAC cookie for role verification.
 * Uses the OTP_SECRET_SALT from environment variables.
 */
export async function POST(req: Request) {
  try {
    const { role } = await req.json();

    if (role !== 'student' && role !== 'instructor') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const salt = process.env.OTP_SECRET_SALT || 'exagoal_otp_salt_change_in_production';

    // Create HMAC signature using Web Crypto API (Edge-compatible)
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(salt),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(role)
    );

    const sigHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Cookie value = role.signature
    const cookieValue = `${role}.${sigHex}`;

    const response = NextResponse.json({ success: true });

    response.cookies.set('exagoal_role', cookieValue, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    console.error('Set role cookie error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE clears the role cookie (used on logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('exagoal_role', '', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
  });
  return response;
}
