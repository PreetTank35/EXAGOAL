// ============================================================
// ExaGoal — Type Definitions
// ============================================================

export type UserRole = 'student' | 'instructor' | 'admin';

export type ExamType =
  | 'knowledge'
  | 'reasoning'
  | 'ethical'
  | 'collaborative'
  | 'wellness_check';

export type QuestionType =
  | 'mcq'
  | 'short_answer'
  | 'essay'
  | 'code'
  | 'case_study'
  | 'peer_review';

export type BloomLevel =
  | 'remember'
  | 'understand'
  | 'apply'
  | 'analyze'
  | 'evaluate'
  | 'create';

export type AntiCheatLevel = 'minimal' | 'standard' | 'strict';
export type ExamStatus = 'draft' | 'published' | 'active' | 'completed' | 'archived';
export type SessionStatus = 'pending' | 'otp_sent' | 'active' | 'submitted' | 'flagged' | 'graded';

export type AntiCheatEventType =
  | 'tab_switch'
  | 'fullscreen_exit'
  | 'copy_attempt'
  | 'right_click'
  | 'camera_block'
  | 'idle_timeout'
  | 'question_navigate'
  | 'answer_submit'
  | 'wellness_checkin';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  institution_id: string | null;
  avatar_url: string | null;
  chi_score: number;
  toku_score: number;
  tai_score: number;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  country_code: string;
  blockchain_wallet: string | null;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  institution_id: string | null;
  created_by: string;
  exam_type: ExamType;
  duration_minutes: number;
  scheduled_at: string;
  is_adaptive: boolean;
  max_attempts: number;
  passing_score: number | null;
  anti_cheat_level: AntiCheatLevel;
  status: ExamStatus;
  created_at: string;
  updated_at: string;
}

export interface MCQOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options: MCQOption[] | null;
  correct_answer: string | null;
  max_marks: number;
  difficulty_level: number;
  bloom_taxonomy: BloomLevel | null;
  ai_solution: string | null;
  ai_rubric: Record<string, unknown> | null;
  order_index: number;
  created_at: string;
}

export interface ExamSession {
  id: string;
  exam_id: string;
  student_id: string;
  otp_code: string;
  otp_expires_at: string;
  otp_verified: boolean;
  started_at: string | null;
  completed_at: string | null;
  status: SessionStatus;
  total_score: number | null;
  chi_contribution: number | null;
  toku_contribution: number | null;
  tai_contribution: number | null;
  blockchain_tx_hash: string | null;
  integrity_score: number;
  anti_cheat_log: AntiCheatEvent[];
  created_at: string;
}

export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  student_answer: string | null;
  is_correct: boolean | null;
  marks_awarded: number | null;
  time_spent_seconds: number | null;
  ai_feedback: string | null;
  ai_confidence: number | null;
  created_at: string;
}

export interface Credential {
  id: string;
  session_id: string;
  student_id: string;
  credential_hash: string;
  blockchain_network: string;
  tx_hash: string | null;
  block_number: number | null;
  verified: boolean;
  issued_at: string;
}

export interface AntiCheatEvent {
  event_type: AntiCheatEventType;
  timestamp: string;
  details: Record<string, unknown>;
}

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  event_type: AntiCheatEventType;
  event_data: Record<string, unknown> | null;
  occurred_at: string;
}

// AI Response Types
export interface AIGradingResult {
  marks: number;
  feedback: string;
  confidence: number;
  concept_gaps: string[];
}

export interface AIFeedbackReport {
  strengths: string[];
  concept_gaps: {
    concept: string;
    severity: 'low' | 'medium' | 'high';
    resources: string[];
  }[];
  bloom_analysis: {
    level: BloomLevel;
    proficiency: 'weak' | 'developing' | 'strong';
  }[];
  study_plan: string;
  encouragement: string;
}

export interface HolisticScore {
  chi: number;
  toku: number;
  tai: number;
  overall: number;
  insights: string[];
}

// Exam result used for holistic scoring
export interface ExamResult {
  exam_type: ExamType;
  percentage: number;
  completed_at: string;
}
