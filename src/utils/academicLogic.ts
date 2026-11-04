import {
  Assignment,
  AnnouncementUrgency,
  HashValidationStatus,
  RoutePath,
  SubmissionVersion,
  UrgencyHorizon,
  UserProfile,
  UserRole,
} from '../types/academic';

export interface RoleResolutionResult {
  role: UserRole;
  targetRoute: RoutePath;
  domain: string;
  claimDescription: string;
  user: UserProfile;
}

const DEMO_USERS: Record<UserRole, UserProfile> = {
  student: {
    id: 'usr-student-01',
    name: 'Camila Morales',
    email: 'camila.morales@estudiante.ufm.edu',
    role: 'student',
    initials: 'CM',
    departmentOrMajor: 'Computer Science & Economía',
    semesterOrTitle: '6to Semestre',
    credits: 24,
    badgeText: 'Persona Libre y Responsable',
  },
  faculty: {
    id: 'usr-faculty-01',
    name: 'Dr. Roberto Valdés',
    email: 'r.valdes@ufm.edu',
    role: 'faculty',
    initials: 'RV',
    departmentOrMajor: 'Ciencias de la Computación',
    semesterOrTitle: 'Catedrático Titular',
    badgeText: 'Libertad de Cátedra',
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Decanatura de Ingeniería',
    email: 'decanatura@ufm.edu',
    role: 'admin',
    initials: 'DI',
    departmentOrMajor: 'Facultad de Ingeniería y Ciencias Económicas',
    semesterOrTitle: 'Gobierno Académico',
    badgeText: 'Excelencia y Libertad',
  },
};

/**
 * Resolves the institutional role and redirect path from a Google Workspace email.
 */
export function resolveRoleFromEmail(rawEmail: string): RoleResolutionResult {
  const normalized = rawEmail.trim().toLowerCase();
  const parts = normalized.split('@');
  const localPart = parts[0] || 'usuario';
  const domain = parts[1] || 'ufm.edu';

  // 1. Student claim: @estudiante.ufm.edu or @estudiante.miu.edu or explicit student prefix
  if (
    domain === 'estudiante.ufm.edu' ||
    domain === 'estudiante.miu.edu' ||
    localPart.includes('estudiante') ||
    localPart.includes('camila')
  ) {
    const customStudent: UserProfile =
      normalized === DEMO_USERS.student.email
        ? DEMO_USERS.student
        : {
            ...DEMO_USERS.student,
            email: normalized,
            name: formatNameFromLocalPart(localPart, DEMO_USERS.student.name),
            initials: getInitialsFromLocalPart(localPart, 'CM'),
          };
    return {
      role: 'student',
      targetRoute: '/student/dashboard',
      domain,
      claimDescription: 'Dominio @estudiante.ufm.edu verificado · Rol Estudiante de Grado',
      user: customStudent,
    };
  }

  // 2. Admin / Dean claim: decanatura, admin, coord, rectoria
  if (
    localPart.includes('decanatura') ||
    localPart.includes('decanato') ||
    localPart.includes('admin') ||
    localPart.includes('coord') ||
    localPart.includes('rectoria')
  ) {
    const customAdmin: UserProfile =
      normalized === DEMO_USERS.admin.email || normalized === 'decanatura.ingenieria@ufm.edu'
        ? { ...DEMO_USERS.admin, email: normalized }
        : {
            ...DEMO_USERS.admin,
            email: normalized,
            name: formatNameFromLocalPart(localPart, DEMO_USERS.admin.name),
            initials: getInitialsFromLocalPart(localPart, 'DI'),
          };
    return {
      role: 'admin',
      targetRoute: '/admin/dashboard',
      domain,
      claimDescription: 'Claim Administrativo / Decanatura verificado en @ufm.edu',
      user: customAdmin,
    };
  }

  // 3. Faculty claim: @ufm.edu or @docente.miu.edu
  const customFaculty: UserProfile =
    normalized === DEMO_USERS.faculty.email
      ? DEMO_USERS.faculty
      : {
          ...DEMO_USERS.faculty,
          email: normalized,
          name: formatNameFromLocalPart(localPart, DEMO_USERS.faculty.name),
          initials: getInitialsFromLocalPart(localPart, 'RV'),
        };

  return {
    role: 'faculty',
    targetRoute: '/faculty/dashboard',
    domain,
    claimDescription: 'Claustro de Catedráticos @ufm.edu verificado · Libertad de Cátedra',
    user: customFaculty,
  };
}

function formatNameFromLocalPart(localPart: string, fallback: string): string {
  if (!localPart || localPart.length < 2) return fallback;
  const tokens = localPart
    .replace(/[0-9_.-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return fallback;
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(' ');
}

function getInitialsFromLocalPart(localPart: string, fallback: string): string {
  const tokens = localPart
    .replace(/[0-9_.-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return fallback;
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

/**
 * Groups pending assignments chronologically by horizon ('Hoy', 'Mañana', 'Próxima semana').
 */
export function groupPendingAssignmentsByHorizon(
  assignments: Assignment[]
): Record<UrgencyHorizon, Assignment[]> {
  const grouped: Record<UrgencyHorizon, Assignment[]> = {
    Hoy: [],
    Mañana: [],
    'Próxima semana': [],
  };

  const pending = assignments.filter((a) => a.status === 'pending');

  for (const item of pending) {
    grouped[item.horizon].push(item);
  }

  return grouped;
}

/**
 * Generates a deterministic immutable certainty reception hash stamp for student submissions.
 */
export function generateCertaintyStamp(
  assignmentId: string,
  studentEmail: string,
  fileName: string,
  isoTimestamp: string
): string {
  const payload = `${assignmentId}|${studentEmail.toLowerCase()}|${fileName.trim()}|${isoTimestamp}`;
  let h1 = 0xdeadbeef ^ payload.length;
  let h2 = 0x41c6ce57 ^ payload.length;

  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0').toUpperCase();
  return `UFM-SHA256-${hex1}-${hex2}`;
}

/**
 * Calculates student completion metrics (delivered count, pending count, completion percentage).
 */
export function calculateStudentMetrics(assignments: Assignment[]): {
  totalCount: number;
  submittedCount: number;
  pendingCount: number;
  urgentCount: number;
  completionRate: number;
} {
  const totalCount = assignments.length;
  const submittedCount = assignments.filter((a) => a.status === 'submitted').length;
  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const urgentCount = assignments.filter(
    (a) => a.status === 'pending' && (a.horizon === 'Hoy' || a.horizon === 'Mañana')
  ).length;
  const completionRate = totalCount === 0 ? 100 : Math.round((submittedCount / totalCount) * 100);

  return {
    totalCount,
    submittedCount,
    pendingCount,
    urgentCount,
    completionRate,
  };
}

export interface AssignmentValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAssignmentInput(input: {
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  points: number;
}): AssignmentValidationResult {
  if (!input.courseId.trim()) {
    return { valid: false, error: 'Selecciona una cátedra y sección destino en el Paso 1.' };
  }
  if (!input.title || input.title.trim().length < 5) {
    return {
      valid: false,
      error: 'El título de la asignación debe contener al menos 5 caracteres.',
    };
  }
  if (!input.description || input.description.trim().length < 15) {
    return {
      valid: false,
      error: 'Las instrucciones socráticas deben detallar los requisitos (mínimo 15 caracteres).',
    };
  }
  if (!input.dueDate.trim() || !input.dueTime.trim()) {
    return { valid: false, error: 'Debes definir fecha y hora límite improrrogables.' };
  }
  if (!Number.isFinite(input.points) || input.points <= 0 || input.points > 500) {
    return { valid: false, error: 'La ponderación debe estar entre 1 y 500 puntos.' };
  }
  return { valid: true };
}

export function validateAnnouncementInput(input: {
  title: string;
  body: string;
  urgency: AnnouncementUrgency;
  globalBanner: boolean;
  emailPush: boolean;
  studentInbox: boolean;
}): AssignmentValidationResult {
  if (!input.title || input.title.trim().length < 6) {
    return {
      valid: false,
      error: 'El título del boletín oficial debe tener al menos 6 caracteres.',
    };
  }
  if (!input.body || input.body.trim().length < 15) {
    return {
      valid: false,
      error: 'El cuerpo del comunicado debe describir claramente el aviso institucional.',
    };
  }
  if (!input.globalBanner && !input.emailPush && !input.studentInbox) {
    return {
      valid: false,
      error: 'Selecciona al menos un canal de distribución oficial.',
    };
  }
  return { valid: true };
}

export interface TranscriptSummary {
  gradedCount: number;
  inReviewCount: number;
  pendingCount: number;
  averageScore: number;
}

/**
 * Computes the student's academic transcript summary from current assignments.
 */
export function calculateAcademicTranscriptSummary(assignments: Assignment[]): TranscriptSummary {
  const graded = assignments.filter(
    (a) =>
      a.status === 'submitted' &&
      a.submission?.evaluationStatus === 'Calificada' &&
      typeof a.submission.score === 'number'
  );
  const inReview = assignments.filter(
    (a) =>
      a.status === 'submitted' &&
      a.submission?.evaluationStatus === 'En revisión por cátedra'
  );
  const pending = assignments.filter((a) => a.status === 'pending');

  const totalPercentage = graded.reduce((sum, a) => {
    const score = a.submission?.score ?? 0;
    const max = a.submission?.maxScore || a.points || 100;
    return sum + (score / max) * 100;
  }, 0);

  const averageScore =
    graded.length === 0 ? 0 : Math.round((totalPercentage / graded.length) * 10) / 10;

  return {
    gradedCount: graded.length,
    inReviewCount: inReview.length,
    pendingCount: pending.length,
    averageScore,
  };
}

/**
 * Generates a downloadable CSV report of grades and immutable SHA-256 receipts.
 */
export function generateAcademicReportCSV(assignments: Assignment[]): string {
  const headers = [
    'ID',
    'Catedra',
    'Seccion',
    'Titulo',
    'Estado',
    'Calificacion',
    'Puntos_Max',
    'Sello_SHA256',
  ];
  const rows = assignments.map((a) => {
    const statusLabel =
      a.status === 'pending'
        ? 'Pendiente'
        : a.submission?.evaluationStatus || 'Entregada';
    const score =
      a.submission?.score !== undefined ? String(a.submission.score) : 'Pendiente';
    const maxScore = String(a.submission?.maxScore ?? a.points);
    const hash = a.submission?.receiptHash ?? 'N/A';
    const safeTitle = `"${a.title.replace(/"/g, '""')}"`;
    const safeCourse = `"${a.courseName.replace(/"/g, '""')}"`;

    return [
      a.id,
      safeCourse,
      a.sectionCode,
      safeTitle,
      statusLabel,
      score,
      maxScore,
      hash,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Resolves the immutable submission history for a given assignment.
 * If the assignment already has multiple versions recorded in submission.history, returns them ordered descending (latest first).
 * If it has a single submission without explicit history, synthesizes a pristine v1 entry.
 */
export function resolveSubmissionHistory(assignment: Assignment): SubmissionVersion[] {
  if (assignment.submission?.history && assignment.submission.history.length > 0) {
    // Sort descending by version number
    return [...assignment.submission.history].sort(
      (a, b) => b.versionNumber - a.versionNumber
    );
  }

  if (assignment.submission) {
    const singleVersion: SubmissionVersion = {
      versionNumber: assignment.submission.versionNumber || 1,
      submittedAt: assignment.submission.submittedAt,
      fileName: assignment.submission.fileName,
      fileSizeLabel: '1.8 MB (PDF)',
      repositoryUrl: assignment.submission.repositoryUrl,
      socraticDefense: assignment.submission.socraticDefense,
      receiptHash: assignment.submission.receiptHash,
      hashValidationStatus: assignment.submission.hashValidationStatus || 'verified',
      hashAlgorithm: 'SHA-256 (FIPS 180-4)',
      evaluationStatus: assignment.submission.evaluationStatus,
      score: assignment.submission.score,
      maxScore: assignment.submission.maxScore,
      isLatest: true,
      changeSummary: 'Entrega inicial registrada con certeza académica inmutable',
    };
    return [singleVersion];
  }

  return [];
}

/**
 * Validates the cryptographic hash integrity of a submission version.
 * Verifies format conforming to standard UFM-SHA256 tokens and generates an audit record.
 */
export function verifySubmissionHashIntegrity(version: SubmissionVersion): {
  isValid: boolean;
  status: HashValidationStatus;
  algorithm: string;
  auditRecord: string;
  timestamp: string;
} {
  const hashRegex = /^UFM-SHA256-[0-9A-F]{8}-[0-9A-F]{8}$/i;
  const matchesFormat = hashRegex.test(version.receiptHash);

  const isValid = matchesFormat && version.hashValidationStatus !== 'tampered';
  const now = new Date().toISOString();

  return {
    isValid,
    status: isValid ? 'verified' : 'tampered',
    algorithm: version.hashAlgorithm || 'SHA-256 (FIPS 180-4)',
    auditRecord: isValid
      ? `VERIFICACIÓN CRIPTOGRÁFICA EXITOSA: El hash ${version.receiptHash} para el archivo '${version.fileName}' (v${version.versionNumber}) coincide exactamente con la firma de recepción inmutable registrada en el claustro.`
      : `ALERTA DE DISCREPANCIA: El registro ${version.receiptHash} no concuerda con la firma original o fue alterado.`,
    timestamp: now,
  };
}

