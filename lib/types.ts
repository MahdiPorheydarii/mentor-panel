export type SubscriptionPlan = 'premium' | 'economy' | 'vip';
export type StudentStatus = 'active' | 'suspended' | 'withdrawn';
export type CallResult = 'answered' | 'no_answer' | 'busy';

export interface Student {
  id: string;
  name: string;
  username: string;
  role: string;
  status: StudentStatus;
  withdrawalWarning: boolean;
  course: string;
  term: string;
  termNumber: number;
  startDate: string;
  currentWeek: number;
  currentTopic: string;
  subscriptionPlan: SubscriptionPlan;
  phase: string;
  progress: number;
  lastContact?: string;
  classesCompleted: number;
  totalClasses: number;
  reportCardDone: boolean;
  suspensionReason?: string;
}

export interface CallLog {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  duration?: number;
  notes: string;
  result: CallResult;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  sessionDate: string;
  sessionType: string;
  present: boolean;
  duration?: number;
}
