export type UserRole = 'student';

export type RoutePath = '/login' | '/student/dashboard';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  departmentOrMajor: string;
  semesterOrTitle: string;
  credits?: number;
  badgeText: string;
  avatarUrl?: string;
}

export type UrgencyHorizon = 'Hoy' | 'Mañana' | 'Próxima semana';

export interface RubricCriterion {
  id: string;
  criterion: string;
  weight: number;
  earned?: number;
  feedback?: string;
}

export type HashValidationStatus = 'verified' | 'tampered' | 'unverified';

export interface SubmissionVersion {
  versionNumber: number;
  submittedAt: string;
  fileName: string;
  fileSizeLabel?: string;
  repositoryUrl?: string;
  socraticDefense?: string;
  receiptHash: string;
  hashValidationStatus: HashValidationStatus;
  hashAlgorithm: string;
  evaluationStatus?: 'Calificada' | 'En revisión por cátedra';
  score?: number;
  maxScore?: number;
  isLatest: boolean;
  changeSummary?: string;
}

export interface SubmissionRecord {
  submittedAt: string;
  fileName: string;
  repositoryUrl?: string;
  socraticDefense?: string;
  receiptHash: string;
  evaluationStatus: 'Calificada' | 'En revisión por cátedra';
  score?: number;
  maxScore: number;
  rubric: RubricCriterion[];
  versionNumber?: number;
  hashValidationStatus?: HashValidationStatus;
  history?: SubmissionVersion[];
}

export interface Assignment {
  id: string;
  courseId: string;
  courseName: string;
  sectionCode: string;
  title: string;
  description: string;
  socraticInquiry: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  dueLabel: string;
  horizon: UrgencyHorizon;
  points: number;
  status: 'pending' | 'submitted';
  submission?: SubmissionRecord;
}

export interface CourseSection {
  id: string;
  name: string;
  code: string;
  section: string;
  enrolledCount: number;
  scheduleLabel: string;
  classroom: string;
  pendingEvaluations: number;
}

export interface ScheduleSlot {
  id: string;
  day: 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes';
  timeRange: string;
  courseName: string;
  section: string;
  classroom: string;
  professor: string;
  methodologyTag: string;
}

export type AnnouncementUrgency = 'Informativo' | 'Prioritario' | 'Urgente';

export interface InstitutionalAnnouncement {
  id: string;
  title: string;
  category: string;
  urgency: AnnouncementUrgency;
  body: string;
  publishedAt: string;
  author: string;
  reachCount: number;
  channels: {
    globalBanner: boolean;
    emailPush: boolean;
    studentInbox: boolean;
  };
  activeOnPortal: boolean;
}
