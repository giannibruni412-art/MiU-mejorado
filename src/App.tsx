/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Assignment,
  CourseSection,
  InstitutionalAnnouncement,
  RoutePath,
  SubmissionVersion,
  UserProfile,
} from './types/academic';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_COURSES,
  WEEKLY_SCHEDULE,
} from './data/mockData';
import {
  calculateStudentMetrics,
  resolveRoleFromEmail,
  resolveSubmissionHistory,
  RoleResolutionResult,
} from './utils/academicLogic';
import { TopBannerAndHeader } from './components/TopBannerAndHeader';
import { LoginPortal } from './components/LoginPortal';
import { StudentDashboard } from './components/StudentDashboard';
import { FacultyDashboard } from './components/FacultyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { QuickActionsMenu } from './components/QuickActionsMenu';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<RoutePath>('/login');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    return resolveRoleFromEmail('camila.morales@estudiante.ufm.edu').user;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [courses, setCourses] = useState<CourseSection[]>(INITIAL_COURSES);
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [announcements, setAnnouncements] = useState<InstitutionalAnnouncement[]>(
    INITIAL_ANNOUNCEMENTS
  );
  const [dismissedBannerId, setDismissedBannerId] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Support URL hash / query parameter navigation (including ?autostart=1 or ?view=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'student') {
      handleNavigate('/student/dashboard');
    } else if (viewParam === 'faculty') {
      handleNavigate('/faculty/dashboard');
    } else if (viewParam === 'admin') {
      handleNavigate('/admin/dashboard');
    } else if (params.get('autostart') === '1') {
      handleNavigate('/student/dashboard');
    }
  }, []);

  const handleNavigate = (route: RoutePath) => {
    setCurrentRoute(route);
    if (route === '/student/dashboard' && currentUser.role !== 'student') {
      setCurrentUser(resolveRoleFromEmail('camila.morales@estudiante.ufm.edu').user);
    } else if (route === '/faculty/dashboard' && currentUser.role !== 'faculty') {
      setCurrentUser(resolveRoleFromEmail('r.valdes@ufm.edu').user);
    } else if (route === '/admin/dashboard' && currentUser.role !== 'admin') {
      setCurrentUser(resolveRoleFromEmail('decanatura@ufm.edu').user);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteSSO = (resolution: RoleResolutionResult) => {
    setCurrentUser(resolution.user);
    setCurrentRoute(resolution.targetRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudentSubmitAssignment = (
    assignmentId: string,
    payload: {
      fileName: string;
      repositoryUrl: string;
      socraticDefense: string;
      receiptHash: string;
      submittedAt: string;
      changeSummary?: string;
    }
  ) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId) return asg;

        const previousHistory = resolveSubmissionHistory(asg);
        const newVersionNum = previousHistory.length + 1;

        const updatedOlderVersions: SubmissionVersion[] = previousHistory.map((v) => ({
          ...v,
          isLatest: false,
        }));

        const newVersion: SubmissionVersion = {
          versionNumber: newVersionNum,
          submittedAt: payload.submittedAt,
          fileName: payload.fileName,
          fileSizeLabel: '2.4 MB (PDF)',
          repositoryUrl: payload.repositoryUrl || undefined,
          socraticDefense: payload.socraticDefense,
          receiptHash: payload.receiptHash,
          hashValidationStatus: 'verified',
          hashAlgorithm: 'SHA-256 (FIPS 180-4)',
          evaluationStatus: 'En revisión por cátedra',
          maxScore: asg.points,
          isLatest: true,
          changeSummary:
            payload.changeSummary ||
            (newVersionNum === 1
              ? 'Entrega inicial registrada con certeza académica inmutable.'
              : `Versión ${newVersionNum} actualizada con mejoras y defensa socrática.`),
        };

        const fullHistory = [...updatedOlderVersions, newVersion];

        return {
          ...asg,
          status: 'submitted',
          dueLabel: 'ENTREGADO · HOY',
          submission: {
            submittedAt: payload.submittedAt,
            fileName: payload.fileName,
            repositoryUrl: payload.repositoryUrl || undefined,
            socraticDefense: payload.socraticDefense,
            receiptHash: payload.receiptHash,
            evaluationStatus: 'En revisión por cátedra',
            maxScore: asg.points,
            versionNumber: newVersionNum,
            hashValidationStatus: 'verified',
            history: fullHistory,
            rubric: asg.submission?.rubric || [
              {
                id: `rub-${asg.id}-1`,
                criterion: 'Rigor Deductivo y Defensa Socrática',
                weight: Math.round(asg.points * 0.4),
              },
              {
                id: `rub-${asg.id}-2`,
                criterion: 'Calidad Técnica de la Entrega y Verificabilidad',
                weight: Math.round(asg.points * 0.6),
              },
            ],
          },
        };
      })
    );
  };


  const handleFacultyPublishAssignment = (
    newAssignmentData: Omit<Assignment, 'id' | 'status'>
  ) => {
    const created: Assignment = {
      ...newAssignmentData,
      id: `asg-${Date.now()}`,
      status: 'pending',
    };
    setAssignments((prev) => [created, ...prev]);
    setCourses((prev) =>
      prev.map((c) =>
        c.id === newAssignmentData.courseId
          ? { ...c, pendingEvaluations: c.pendingEvaluations + 1 }
          : c
      )
    );
  };

  const handleFacultyGradeSubmission = (assignmentId: string, score: number) => {
    setAssignments((prev) =>
      prev.map((asg) => {
        if (asg.id !== assignmentId || !asg.submission) return asg;
        return {
          ...asg,
          submission: {
            ...asg.submission,
            evaluationStatus: 'Calificada',
            score,
            rubric: asg.submission.rubric.map((r) => ({
              ...r,
              earned: r.weight,
              feedback: 'Evaluado con excelencia bajo el estándar de la cátedra UFM.',
            })),
          },
        };
      })
    );
  };

  const handlePublishAnnouncement = (
    newAnn: Omit<
      InstitutionalAnnouncement,
      'id' | 'publishedAt' | 'reachCount' | 'activeOnPortal'
    >
  ) => {
    const created: InstitutionalAnnouncement = {
      ...newAnn,
      id: `ann-${Date.now()}`,
      publishedAt: 'Publicado hace instantes',
      reachCount: 4820,
      activeOnPortal: true,
    };
    setAnnouncements((prev) => [created, ...prev]);
    if (created.channels.globalBanner) {
      setDismissedBannerId(null);
    }
  };

  const handleToggleAnnouncementStatus = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, activeOnPortal: !a.activeOnPortal } : a))
    );
  };

  const activeBannerAnnouncement = announcements.find(
    (a) => a.activeOnPortal && a.channels.globalBanner && a.id !== dismissedBannerId
  );

  const studentMetrics = calculateStudentMetrics(assignments);

  const studentProfile = resolveRoleFromEmail('camila.morales@estudiante.ufm.edu').user;
  const facultyProfile = resolveRoleFromEmail('r.valdes@ufm.edu').user;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors ${
        isDarkMode ? 'bg-[#0F172A] text-[#F8FAFC]' : 'bg-[#F9FAFB] text-[#111827]'
      }`}
    >
      <TopBannerAndHeader
        currentRoute={currentRoute}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        activeBannerAnnouncement={activeBannerAnnouncement}
        onDismissBanner={() => {
          if (activeBannerAnnouncement) {
            setDismissedBannerId(activeBannerAnnouncement.id);
          }
        }}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentRoute === '/login' && (
          <LoginPortal onCompleteSSO={handleCompleteSSO} />
        )}

        {currentRoute === '/student/dashboard' && (
          <StudentDashboard
            student={currentUser.role === 'student' ? currentUser : studentProfile}
            assignments={assignments}
            schedule={WEEKLY_SCHEDULE}
            isDarkMode={isDarkMode}
            onSubmitAssignment={handleStudentSubmitAssignment}
          />
        )}

        {currentRoute === '/faculty/dashboard' && (
          <FacultyDashboard
            professor={currentUser.role === 'faculty' ? currentUser : facultyProfile}
            courses={courses}
            assignments={assignments}
            onPublishAssignment={handleFacultyPublishAssignment}
            onGradeSubmission={handleFacultyGradeSubmission}
          />
        )}

        {currentRoute === '/admin/dashboard' && (
          <AdminDashboard
            announcements={announcements}
            totalAssignmentsCompletionRate={studentMetrics.completionRate}
            onPublishAnnouncement={handlePublishAnnouncement}
            onToggleAnnouncementStatus={handleToggleAnnouncementStatus}
          />
        )}
      </main>

      {/* FLOATING QUICK ACTIONS MENU FOR DASHBOARD VIEWS */}
      <QuickActionsMenu
        currentRoute={currentRoute}
        userRole={currentUser.role}
        assignments={assignments}
        courses={courses}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        onNavigate={handleNavigate}
      />

      {/* FOOTER INSTITUCIONAL OBLIGATORIO */}
      <footer
        className={`mt-auto border-t py-6 transition-colors ${
          isDarkMode
            ? 'bg-[#1E293B] border-[#334155] text-[#94A3B8]'
            : 'bg-white border-[#E5E7EB] text-[#6B7280]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#7A1C29] text-white flex items-center justify-center font-crest text-[10px] font-bold border border-[#C59B27] shrink-0">
              UFM
            </div>
            <span
              className={`font-serif font-bold ${
                isDarkMode ? 'text-[#F8FAFC]' : 'text-[#111827]'
              }`}
            >
              MIU Reimagined · Edición Académica UFM
            </span>
            <span className="text-[#E5E7EB] dark:text-[#334155]" aria-hidden="true">
              |
            </span>
            <span className="text-[#92400E] font-semibold bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#B45309]">
              Propuesta Académica No Oficial
            </span>
          </div>

          <div
            className={`font-serif italic text-center ${
              isDarkMode ? 'text-[#CBD5E1]' : 'text-[#4B5563]'
            }`}
          >
            &ldquo;La enseñanza y difusión de los principios éticos, jurídicos y económicos de una sociedad de personas libres y responsables.&rdquo;
          </div>

          <div className="text-right whitespace-nowrap">
            Rigor intelectual · Método Socrático
          </div>
        </div>
      </footer>
    </div>
  );
}
