import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateSecureOtp(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    otp += chars[randomIndex];
  }
  return otp;
}

async function fixForAllProfiles() {
  const { data: activeExams } = await supabase.from('exams').select('*').eq('status', 'active');
  const { data: profiles } = await supabase.from('profiles').select('id');
  
  if (!activeExams || !profiles) return;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60000);

  for (const exam of activeExams) {
    const sessionsToInsert = [];
    const notificationsToInsert = [];

    for (const profile of profiles) {
      // Check if session already exists for this profile
      const { data: existing } = await supabase
        .from('exam_sessions')
        .select('id')
        .eq('exam_id', exam.id)
        .eq('student_id', profile.id)
        .single();
        
      if (!existing) {
        const otpCode = generateSecureOtp();
        sessionsToInsert.push({
          exam_id: exam.id,
          student_id: profile.id,
          otp_code: otpCode,
          otp_expires_at: expiresAt.toISOString(),
          status: 'otp_sent',
          otp_verified: false,
        });

        notificationsToInsert.push({
          student_id: profile.id,
          exam_id: exam.id,
          title: `Exam Access: ${exam.title}`,
          message: `Your exam access code is ${otpCode}. It expires in 15 minutes.`,
          notification_type: 'otp_delivery',
          is_read: false,
          status: 'active',
          expires_at: expiresAt.toISOString(),
          metadata: { otp_code: otpCode }
        });
      }
    }

    if (sessionsToInsert.length > 0) {
      await supabase.from('exam_sessions').insert(sessionsToInsert);
      await supabase.from('student_notifications').insert(notificationsToInsert);
      console.log(`Added missing OTPs for ${sessionsToInsert.length} profiles for exam ${exam.title}`);
    }
  }
}

fixForAllProfiles();
