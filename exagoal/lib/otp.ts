// ============================================================
// OTP Generation & Verification
// ============================================================

import CryptoJS from 'crypto-js';

const OTP_SALT = process.env.OTP_SECRET_SALT || 'exagoal_default_salt';
const OTP_VALIDITY_MINUTES = 10; // 5 min before + 5 min grace

/** Generate a 6-digit OTP */
export function generateOTP(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/** Hash OTP for secure storage using HMAC-SHA256 */
export function hashOTP(otp: string): string {
  return CryptoJS.HmacSHA256(otp, OTP_SALT).toString(CryptoJS.enc.Hex);
}

/** Verify a plaintext OTP against its stored hash */
export function verifyOTP(plainOTP: string, storedHash: string): boolean {
  const computedHash = hashOTP(plainOTP);
  return computedHash === storedHash;
}

/** Get OTP expiration timestamp (from now) */
export function getOTPExpiry(): string {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + OTP_VALIDITY_MINUTES);
  return expiry.toISOString();
}

/** Check whether the OTP has expired */
export function isOTPExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt);
}

/** Format OTP for display (e.g., "123 456") */
export function formatOTP(otp: string): string {
  return `${otp.slice(0, 3)} ${otp.slice(3)}`;
}
