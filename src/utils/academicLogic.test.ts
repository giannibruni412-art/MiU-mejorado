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
} from './academicLogic';
import { Assignment, SubmissionVersion } from '../types/academic';

test('resolveRoleFromEmail routes @estudiante.ufm.edu to /student/dashboard', () => {
  const res = resolveRoleFromEmail('camila.morales@estudiante.ufm.edu');
  assert.equal(res.role, 'student');
  assert.equal(res.targetRoute, '/student/dashboard');
  assert.equal(res.user.name, 'Camila Morales');
});

test('resolveRoleFromEmail routes faculty @ufm.edu to /faculty/dashboard', () => {
  const res = resolveRoleFromEmail('r.valdes@ufm.edu');
  assert.equal(res.role, 'faculty');
  assert.equal(res.targetRoute, '/faculty/dashboard');
  assert.equal(res.user.name, 'Dr. Roberto Valdés');
});

test('resolveRoleFromEmail routes admin/decanatura claims to /admin/dashboard', () => {
  const res = resolveRoleFromEmail('decanatura@ufm.edu');
  assert.equal(res.role, 'admin');
  assert.equal(res.targetRoute, '/admin/dashboard');
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

