import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveRoleFromEmail,
  groupPendingAssignmentsByHorizon,
  generateCertaintyStamp,
  calculateStudentMetrics,
  validateAssignmentInput,
  validateAnnouncementInput,
  calculateAcademicTranscriptSummary,
  generateAcademicReportCSV,
  resolveSubmissionHistory,
  verifySubmissionHashIntegrity,
  lookupReceiptHash,
  isEmailAuthorized,
  checkEmailAuthorization,
  AUTHORIZED_STUDENT_EMAILS,
} from './academicLogic';
import { Assignment, SubmissionVersion } from '../types/academic';

test('resolveRoleFromEmail routes @estudiante.ufm.edu to /student/dashboard', () => {
  const res = resolveRoleFromEmail('camila.morales@estudiante.ufm.edu');
  assert.equal(res.role, 'student');
  assert.equal(res.targetRoute, '/student/dashboard');
  assert.equal(res.user.name, 'Camila Morales');
});

test('resolveRoleFromEmail routes institutional accounts directly to /student/dashboard', () => {
  const resStudent = resolveRoleFromEmail('camila.morales@estudiante.ufm.edu');
  assert.equal(resStudent.role, 'student');
  assert.equal(resStudent.targetRoute, '/student/dashboard');
  assert.equal(resStudent.user.name, 'Camila Morales');

  const resOther = resolveRoleFromEmail('rodrigo.sanchez@ufm.edu');
  assert.equal(resOther.role, 'student');
  assert.equal(resOther.targetRoute, '/student/dashboard');
});


test('generateCertaintyStamp produces deterministic UFM-SHA256 receipt stamp', () => {
  const stamp1 = generateCertaintyStamp(
    'asg-1',
    'camila.morales@estudiante.ufm.edu',
    'arquitectura_c4.pdf',
    '2026-10-14T22:15:00Z'
  );
  const stamp2 = generateCertaintyStamp(
    'asg-1',
    'camila.morales@estudiante.ufm.edu',
    'arquitectura_c4.pdf',
    '2026-10-14T22:15:00Z'
  );
  const stamp3 = generateCertaintyStamp(
    'asg-2',
    'camila.morales@estudiante.ufm.edu',
    'arquitectura_c4.pdf',
    '2026-10-14T22:15:00Z'
  );

  assert.equal(stamp1, stamp2);
  assert.notEqual(stamp1, stamp3);
  assert.ok(stamp1.startsWith('UFM-SHA256-'));
});

test('groupPendingAssignmentsByHorizon and calculateStudentMetrics compute accurate counts', () => {
  const sample: Assignment[] = [
    {
      id: '1',
      courseId: 'c1',
      courseName: 'Arquitectura de Software',
      sectionCode: 'G02',
      title: 'Diagrama C4',
      description: 'Desc',
      socraticInquiry: 'Pregunta',
      dueDate: '2026-10-15',
      dueTime: '23:59',
      dueLabel: 'VENCE HOY · 23:59',
      horizon: 'Hoy',
      points: 20,
      status: 'pending',
    },
    {
      id: '2',
      courseId: 'c2',
      courseName: 'Proceso Económico',
      sectionCode: 'G01',
      title: 'Ensayo Hayek',
      description: 'Desc',
      socraticInquiry: 'Pregunta',
      dueDate: '2026-10-16',
      dueTime: '18:00',
      dueLabel: 'MAÑANA · 18:00',
      horizon: 'Mañana',
      points: 15,
      status: 'pending',
    },
    {
      id: '3',
      courseId: 'c1',
      courseName: 'Arquitectura de Software',
      sectionCode: 'G02',
      title: 'Sprint Review',
      description: 'Desc',
      socraticInquiry: 'Pregunta',
      dueDate: '2026-10-10',
      dueTime: '23:59',
      dueLabel: 'ENTREGADO',
      horizon: 'Hoy',
      points: 100,
      status: 'submitted',
      submission: {
        submittedAt: '10 Oct 2026',
        fileName: 'sprint.pdf',
        receiptHash: 'UFM-SHA256-11112222-33334444',
        evaluationStatus: 'Calificada',
        score: 96,
        maxScore: 100,
        rubric: [],
      },
    },
  ];

  const grouped = groupPendingAssignmentsByHorizon(sample);
  assert.equal(grouped.Hoy.length, 1);
  assert.equal(grouped.Mañana.length, 1);
  assert.equal(grouped['Próxima semana'].length, 0);

  const metrics = calculateStudentMetrics(sample);
  assert.equal(metrics.totalCount, 3);
  assert.equal(metrics.submittedCount, 1);
  assert.equal(metrics.pendingCount, 2);
  assert.equal(metrics.urgentCount, 2);
  assert.equal(metrics.completionRate, 33);

  const transcript = calculateAcademicTranscriptSummary(sample);
  assert.equal(transcript.gradedCount, 1);
  assert.equal(transcript.pendingCount, 2);
  assert.equal(transcript.averageScore, 96);

  const csv = generateAcademicReportCSV(sample);
  assert.ok(csv.includes('UFM-SHA256-11112222-33334444'));
  assert.ok(csv.includes('Sprint Review'));
});

test('validateAssignmentInput and validateAnnouncementInput reject empty/invalid fields', () => {
  const invalidAsg = validateAssignmentInput({
    courseId: 'c1',
    title: 'Abc',
    description: 'Corto',
    dueDate: '2026-10-25',
    dueTime: '23:59',
    points: 100,
  });
  assert.equal(invalidAsg.valid, false);

  const validAsg = validateAssignmentInput({
    courseId: 'c1',
    title: 'Caso Práctico 03: Circuit Breaker',
    description: 'Implementar Resilience4j con pruebas unitarias y defensa socrática en el README.',
    dueDate: '2026-10-25',
    dueTime: '23:59',
    points: 100,
  });
  assert.equal(validAsg.valid, true);

  const invalidAnn = validateAnnouncementInput({
    title: 'Aviso Importante',
    body: 'Descripción completa del boletín de decanatura.',
    urgency: 'Prioritario',
    globalBanner: false,
    emailPush: false,
    studentInbox: false,
  });
  assert.equal(invalidAnn.valid, false);
});

test('resolveSubmissionHistory sorts versions descending and synthesizes single submissions', () => {
  const asgWithHistory: Assignment = {
    id: 'asg-test-1',
    courseId: 'c1',
    courseName: 'Arquitectura',
    sectionCode: 'G02',
    title: 'Test Assignment',
    description: 'Desc',
    socraticInquiry: 'Inquiry',
    dueDate: '2026-10-20',
    dueTime: '23:59',
    dueLabel: 'VENCE EN 5 DÍAS',
    horizon: 'Próxima semana',
    points: 100,
    status: 'submitted',
    submission: {
      submittedAt: '12 Oct 2026',
      fileName: 'final.pdf',
      receiptHash: 'UFM-SHA256-AAAA1111-BBBB2222',
      evaluationStatus: 'Calificada',
      maxScore: 100,
      rubric: [],
      history: [
        {
          versionNumber: 1,
          submittedAt: '10 Oct 2026',
          fileName: 'draft.pdf',
          receiptHash: 'UFM-SHA256-00001111-22223333',
          hashValidationStatus: 'verified',
          hashAlgorithm: 'SHA-256 (FIPS 180-4)',
          isLatest: false,
        },
        {
          versionNumber: 2,
          submittedAt: '12 Oct 2026',
          fileName: 'final.pdf',
          receiptHash: 'UFM-SHA256-AAAA1111-BBBB2222',
          hashValidationStatus: 'verified',
          hashAlgorithm: 'SHA-256 (FIPS 180-4)',
          isLatest: true,
        },
      ],
    },
  };

  const history = resolveSubmissionHistory(asgWithHistory);
  assert.equal(history.length, 2);
  assert.equal(history[0].versionNumber, 2); // Latest first
  assert.equal(history[1].versionNumber, 1);
  assert.equal(history[0].isLatest, true);

  // Single submission without history array
  const asgSingle: Assignment = {
    ...asgWithHistory,
    submission: {
      ...asgWithHistory.submission!,
      history: undefined,
    },
  };
  const singleHistory = resolveSubmissionHistory(asgSingle);
  assert.equal(singleHistory.length, 1);
  assert.equal(singleHistory[0].versionNumber, 1);
  assert.equal(singleHistory[0].receiptHash, 'UFM-SHA256-AAAA1111-BBBB2222');
});

test('verifySubmissionHashIntegrity verifies valid UFM-SHA256 hashes and flags invalid/tampered', () => {
  const validVersion: SubmissionVersion = {
    versionNumber: 2,
    submittedAt: '12 Oct 2026 · 16:42 hrs',
    fileName: 'Entrega_Signed.pdf',
    receiptHash: 'UFM-SHA256-8F4A92C1-3B19D04E',
    hashValidationStatus: 'verified',
    hashAlgorithm: 'SHA-256 (FIPS 180-4)',
    isLatest: true,
  };

  const validResult = verifySubmissionHashIntegrity(validVersion);
  assert.equal(validResult.isValid, true);
  assert.equal(validResult.status, 'verified');
  assert.ok(validResult.auditRecord.includes('VERIFICACIÓN CRIPTOGRÁFICA EXITOSA'));

  const tamperedVersion: SubmissionVersion = {
    ...validVersion,
    receiptHash: 'INVALID-HASH-FORMAT',
    hashValidationStatus: 'tampered',
  };
  const tamperedResult = verifySubmissionHashIntegrity(tamperedVersion);
  assert.equal(tamperedResult.isValid, false);
  assert.equal(tamperedResult.status, 'tampered');
  assert.ok(tamperedResult.auditRecord.includes('ALERTA DE DISCREPANCIA'));
});

test('lookupReceiptHash finds existing hashes, flags unregistered valid hashes, and rejects invalid formats', () => {
  const sampleAssignments: Assignment[] = [
    {
      id: 'asg-test',
      courseId: 'c1',
      courseName: 'Arquitectura de Software',
      sectionCode: 'G02',
      title: 'Sprint Review 2',
      description: 'Desc',
      socraticInquiry: 'Pregunta',
      dueDate: '2026-10-10',
      dueTime: '23:59',
      dueLabel: 'ENTREGADO',
      horizon: 'Hoy',
      points: 100,
      status: 'submitted',
      submission: {
        submittedAt: '12 Oct 2026 · 16:42 hrs',
        fileName: 'Sprint2_Final_Signed.pdf',
        receiptHash: 'UFM-SHA256-8F4A92C1-3B19D04E',
        evaluationStatus: 'Calificada',
        score: 96,
        maxScore: 100,
        rubric: [],
        history: [
          {
            versionNumber: 1,
            submittedAt: '10 Oct 2026 · 14:10 hrs',
            fileName: 'Sprint2_Borrador_v1.pdf',
            receiptHash: 'UFM-SHA256-11A2B3C4-5D6E7F80',
            hashValidationStatus: 'verified',
            hashAlgorithm: 'SHA-256 (FIPS 180-4)',
            isLatest: false,
          },
          {
            versionNumber: 2,
            submittedAt: '11 Oct 2026 · 20:30 hrs',
            fileName: 'Sprint2_Entrega_v2.pdf',
            receiptHash: 'UFM-SHA256-4D2E8A90-1B2C3D4E',
            hashValidationStatus: 'verified',
            hashAlgorithm: 'SHA-256 (FIPS 180-4)',
            isLatest: false,
          },
          {
            versionNumber: 3,
            submittedAt: '12 Oct 2026 · 16:42 hrs',
            fileName: 'Sprint2_Final_Signed.pdf',
            receiptHash: 'UFM-SHA256-8F4A92C1-3B19D04E',
            hashValidationStatus: 'verified',
            hashAlgorithm: 'SHA-256 (FIPS 180-4)',
            isLatest: true,
          },
        ],
      },
    },
  ];

  // 1. Existing latest hash
  const resLatest = lookupReceiptHash('UFM-SHA256-8F4A92C1-3B19D04E', sampleAssignments);
  assert.equal(resLatest.isFound, true);
  assert.equal(resLatest.isFormatValid, true);
  assert.equal(resLatest.assignment?.title, 'Sprint Review 2');
  assert.equal(resLatest.version?.versionNumber, 3);
  assert.equal(resLatest.version?.isLatest, true);

  // 2. Existing previous version hash (v1)
  const resV1 = lookupReceiptHash('UFM-SHA256-11A2B3C4-5D6E7F80', sampleAssignments);
  assert.equal(resV1.isFound, true);
  assert.equal(resV1.isFormatValid, true);
  assert.equal(resV1.version?.versionNumber, 1);
  assert.equal(resV1.version?.isLatest, false);

  // 3. Valid format but not in database
  const resUnregistered = lookupReceiptHash('UFM-SHA256-99998888-77776666', sampleAssignments);
  assert.equal(resUnregistered.isFound, false);
  assert.equal(resUnregistered.isFormatValid, true);
  assert.equal(resUnregistered.assignment, undefined);

  // 4. Invalid format
  const resInvalid = lookupReceiptHash('not-a-real-hash', sampleAssignments);
  assert.equal(resInvalid.isFound, false);
  assert.equal(resInvalid.isFormatValid, false);

  // 5. Empty input
  const resEmpty = lookupReceiptHash('   ', sampleAssignments);
  assert.equal(resEmpty.isFound, false);
  assert.equal(resEmpty.isFormatValid, false);
});

test('isEmailAuthorized strictly permits ofernando@ufm.edu and giannibruni412@gmail.com, rejecting unauthorized emails', () => {
  // Authorized: ofernando@ufm.edu & giannibruni412@gmail.com
  assert.equal(isEmailAuthorized('ofernando@ufm.edu'), true);
  assert.equal(isEmailAuthorized('OFERNANDO@UFM.EDU'), true);
  assert.equal(isEmailAuthorized(' ofernando@ufm.edu  '), true);
  assert.equal(isEmailAuthorized('giannibruni412@gmail.com'), true);
  assert.equal(isEmailAuthorized('GIANNIBRUNI412@GMAIL.COM'), true);

  // Unauthorized accounts must be rejected
  assert.equal(isEmailAuthorized('rodrigo.sanchez@ufm.edu'), false);
  assert.equal(isEmailAuthorized('random.user@gmail.com'), false);
  assert.equal(isEmailAuthorized('usuario.no.autorizado@gmail.com'), false);
  assert.equal(isEmailAuthorized(''), false);

  // Detailed authorization check returns diagnostics
  const authOk1 = checkEmailAuthorization('ofernando@ufm.edu');
  assert.equal(authOk1.isAuthorized, true);
  assert.equal(authOk1.email, 'ofernando@ufm.edu');

  const authOk2 = checkEmailAuthorization('giannibruni412@gmail.com');
  assert.equal(authOk2.isAuthorized, true);
  assert.equal(authOk2.email, 'giannibruni412@gmail.com');

  const authDenied = checkEmailAuthorization('usuario.no.autorizado@gmail.com');
  assert.equal(authDenied.isAuthorized, false);
  assert.ok(authDenied.reason?.includes('403'));
  assert.ok(authDenied.reason?.includes('giannibruni412@gmail.com'));

  // Profile resolution for ofernando@ufm.edu
  const resOf = resolveRoleFromEmail('ofernando@ufm.edu');
  assert.equal(resOf.role, 'student');
  assert.equal(resOf.user.name, 'Fernando O.');
  assert.equal(resOf.user.email, 'ofernando@ufm.edu');
  assert.equal(resOf.user.initials, 'FO');
  assert.ok(resOf.claimDescription.includes('Alumno Autorizado'));

  // Profile resolution for giannibruni412@gmail.com
  const resGianni = resolveRoleFromEmail('giannibruni412@gmail.com');
  assert.equal(resGianni.role, 'student');
  assert.equal(resGianni.user.name, 'Gianni Bruni');
  assert.equal(resGianni.user.email, 'giannibruni412@gmail.com');
  assert.equal(resGianni.user.initials, 'GB');
  assert.ok(resGianni.claimDescription.includes('Alumno Autorizado'));
});

