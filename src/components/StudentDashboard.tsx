import React, { useState } from 'react';
import {
  Home,
  CheckSquare,
  Calendar,
  Upload,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock,
  X,
  BookOpen,
  ExternalLink,
  Award,
  History,
} from 'lucide-react';
import {
  Assignment,
  ScheduleSlot,
  UrgencyHorizon,
  UserProfile,
} from '../types/academic';
import {
  calculateStudentMetrics,
  generateCertaintyStamp,
  groupPendingAssignmentsByHorizon,
  resolveSubmissionHistory,
} from '../utils/academicLogic';
import { SubmissionHistoryModal } from './SubmissionHistoryModal';

interface StudentDashboardProps {
  student: UserProfile;
  assignments: Assignment[];
  schedule: ScheduleSlot[];
  isDarkMode?: boolean;
  onSubmitAssignment: (
    assignmentId: string,
    payload: {
      fileName: string;
      repositoryUrl: string;
      socraticDefense: string;
      receiptHash: string;
      submittedAt: string;
      changeSummary?: string;
    }
  ) => void;
}

type StudentTab = 'mi-semana' | 'mis-tareas' | 'horario';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  assignments,
  schedule,
  isDarkMode = false,
  onSubmitAssignment,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('mi-semana');
  const [horizonFilter, setHorizonFilter] = useState<'Todas' | UrgencyHorizon>('Todas');
  const [activeUploadAssignment, setActiveUploadAssignment] = useState<Assignment | null>(null);
  const [activeRubricAssignment, setActiveRubricAssignment] = useState<Assignment | null>(null);
  const [activeHistoryAssignment, setActiveHistoryAssignment] = useState<Assignment | null>(null);

  // Certainty Drawer Form State
  const [fileName, setFileName] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [socraticDefense, setSocraticDefense] = useState('');
  const [changeSummary, setChangeSummary] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastReceiptBanner, setLastReceiptBanner] = useState<{
    title: string;
    courseName: string;
    fileName: string;
    receiptHash: string;
    submittedAt: string;
    versionNumber?: number;
  } | null>(null);

  const metrics = calculateStudentMetrics(assignments);
  const groupedPending = groupPendingAssignmentsByHorizon(assignments);
  const submittedAssignments = assignments.filter((a) => a.status === 'submitted');
  const pendingAssignments = assignments.filter((a) => a.status === 'pending');

  const openCertaintyDrawer = (assignment: Assignment) => {
    const slug = assignment.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 24);
    const existingHistory = resolveSubmissionHistory(assignment);
    const nextVersionNum = existingHistory.length + 1;

    setActiveUploadAssignment(assignment);
    setFileName(
      nextVersionNum > 1
        ? `CamilaMorales_${slug}_v${nextVersionNum}.pdf`
        : `CamilaMorales_${slug}.pdf`
    );
    setRepositoryUrl(
      assignment.submission?.repositoryUrl ||
        'https://github.com/ufm-cs/camila-morales-entrega'
    );
    setSocraticDefense(assignment.submission?.socraticDefense || '');
    setChangeSummary(
      nextVersionNum > 1
        ? `Versión ${nextVersionNum}: Corrección de observaciones y profundización en el análisis socrático.`
        : 'Entrega inicial registrada con certeza académica inmutable.'
    );
    setUploadError(null);
  };

  const handleConfirmSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUploadAssignment) return;

    if (!fileName.trim()) {
      setUploadError('Debes adjuntar o indicar el nombre del archivo PDF/ZIP de tu entrega.');
      return;
    }
    if (!socraticDefense.trim() || socraticDefense.trim().length < 15) {
      setUploadError(
        'Por favor redacta tu síntesis de defensa socrática (mínimo 15 caracteres).'
      );
      return;
    }

    const nowIso = new Date().toISOString();
    const formattedDate = 'Hoy · ' + new Date().toLocaleTimeString('es-GT', {
      hour: '2-digit',
      minute: '2-digit',
    }) + ' hrs';

    const receiptHash = generateCertaintyStamp(
      activeUploadAssignment.id,
      student.email,
      fileName,
      nowIso
    );

    const prevHistory = resolveSubmissionHistory(activeUploadAssignment);
    const nextVer = prevHistory.length + 1;

    onSubmitAssignment(activeUploadAssignment.id, {
      fileName: fileName.trim(),
      repositoryUrl: repositoryUrl.trim(),
      socraticDefense: socraticDefense.trim(),
      receiptHash,
      submittedAt: formattedDate,
      changeSummary: changeSummary.trim(),
    });

    setLastReceiptBanner({
      title: activeUploadAssignment.title,
      courseName: activeUploadAssignment.courseName,
      fileName: fileName.trim(),
      receiptHash,
      submittedAt: formattedDate,
      versionNumber: nextVer,
    });

    setActiveUploadAssignment(null);
  };

  const horizonsOrder: UrgencyHorizon[] = ['Hoy', 'Mañana', 'Próxima semana'];


  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* SIDEBAR ESTUDIANTE */}
      <aside
        aria-label="Navegación del estudiante"
        className="lg:col-span-3 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs"
      >
        {/* Perfil del estudiante con créditos */}
        <div className="flex items-center gap-3 pb-5 border-b border-[#E5E7EB]">
          <div className="w-11 h-11 rounded-full bg-[#FDF2F4] border border-[#C59B27] flex items-center justify-center text-[#7A1C29] font-bold text-sm shrink-0">
            {student.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#111827] leading-tight font-serif truncate">
              {student.name}
            </p>
            <p className="text-xs text-[#6B7280] truncate">
              {student.departmentOrMajor} · {student.semesterOrTitle}
            </p>
            <p className="text-[11px] text-[#7A1C29] font-medium mt-1">
              {student.credits ?? 24} UMAS / Créditos Activos · {student.badgeText}
            </p>
          </div>
        </div>

        {/* Menú de Navegación */}
        <nav aria-label="Secciones del portal estudiantil" className="mt-5 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('mi-semana')}
            className={`w-full flex items-center px-3.5 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
              activeTab === 'mi-semana'
                ? 'font-semibold text-[#7A1C29] bg-[#FDF2F4] border border-[#7A1C29]/20'
                : 'font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
            }`}
          >
            <Home className="w-4 h-4 mr-3 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Inicio ("Mi Semana")</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mis-tareas')}
            className={`w-full flex items-center px-3.5 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
              activeTab === 'mis-tareas'
                ? 'font-semibold text-[#7A1C29] bg-[#FDF2F4] border border-[#7A1C29]/20'
                : 'font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
            }`}
          >
            <CheckSquare className="w-4 h-4 mr-3 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Mis Tareas</span>
            <span className="ml-auto text-xs font-bold text-[#7A1C29] tabular-nums">
              {metrics.pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('horario')}
            className={`w-full flex items-center px-3.5 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
              activeTab === 'horario'
                ? 'font-semibold text-[#7A1C29] bg-[#FDF2F4] border border-[#7A1C29]/20'
                : 'font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
            }`}
          >
            <Calendar className="w-4 h-4 mr-3 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Horario Semanal</span>
          </button>
        </nav>

        {/* Barra de Autonomía y Disciplina */}
        <div className="mt-8 pt-5 border-t border-[#E5E7EB]">
          <h4 className="text-xs font-serif font-bold text-[#6B7280] uppercase tracking-wider mb-2">
            Autonomía y Disciplina
          </h4>
          <div className="bg-[#F9FAFB] rounded-lg p-3.5 border border-[#E5E7EB]">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[#4B5563] font-medium">Cumplimiento personal</span>
              <span className="font-bold text-[#059669] tabular-nums">
                {metrics.completionRate}%
              </span>
            </div>
            <div className="w-full bg-[#E5E7EB] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#7A1C29] h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-2 tabular-nums">
              {metrics.submittedCount} de {metrics.totalCount} compromisos completados a tiempo
            </p>
          </div>
        </div>
      </aside>

      {/* CONTENIDO CENTRAL ESTUDIANTE */}
      <section className="lg:col-span-9 space-y-6">
        {/* Banner Filosófico Superior Maroon */}
        <div className="bg-[#7A1C29] rounded-lg p-6 text-white shadow-xs border-b-2 border-[#C59B27] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-[11px] text-[#F7F2E6] font-medium uppercase tracking-wider">
              Excelencia y Acción Humana · Ciclo Académico 2026-II
            </div>
            <h1 className="text-2xl font-serif font-bold mt-1 text-white">
              ¡Buen día, {student.name.split(' ')[0]}! Tu Semana Académica
            </h1>
            <p className="text-xs text-stone-200/95 font-serif italic mt-1">
              &ldquo;En una sociedad libre, el éxito es consecuencia directa del esfuerzo personal, la integridad y el valor aportado a los demás.&rdquo;
            </p>
          </div>
          <div className="text-xs bg-black/25 px-3.5 py-2 rounded-md border border-white/15 shrink-0 tabular-nums">
            <span className="text-[#F7F2E6] font-semibold">Semana 9 (14 - 20 Oct)</span>
          </div>
        </div>

        {/* Confirmación Inmutable Reciente (si acaba de subir una entrega) */}
        {lastReceiptBanner && (
          <div
            role="status"
            aria-live="polite"
            className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#065F46]">
                <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
                <span>Sello de Recepción Criptográfico Generado con Éxito</span>
              </div>
              <p className="text-xs text-[#065F46]">
                Entrega registrada para <strong>{lastReceiptBanner.title}</strong> ({lastReceiptBanner.courseName}) · Archivo:{' '}
                <code className="font-mono">{lastReceiptBanner.fileName}</code>
              </p>
              <p className="text-[11px] font-mono text-[#047857] tabular-nums">
                Hash Inmutable: {lastReceiptBanner.receiptHash} · Estampa: {lastReceiptBanner.submittedAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLastReceiptBanner(null)}
              className="text-xs font-semibold text-[#065F46] hover:underline self-end sm:self-center shrink-0 cursor-pointer"
            >
              Cerrar aviso
            </button>
          </div>
        )}

        {/* VISTA 1 & 2: MI SEMANA / MIS TAREAS */}
        {(activeTab === 'mi-semana' || activeTab === 'mis-tareas') && (
          <>
            {/* Cabecera de Sección con Filtro de Horizonte */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-2xs">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-serif font-bold text-[#111827]">
                    {activeTab === 'mi-semana'
                      ? 'Mis Asignaciones y Proyectos'
                      : 'Catálogo Completo de Asignaciones y Coloquios'}
                  </h2>
                  <span className="text-xs font-medium text-[#4B5563] tabular-nums">
                    · {metrics.submittedCount} Entregadas a tiempo · {metrics.pendingCount} Pendientes prioritarias
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1">
                  Orden cronológico estricto para máxima certeza académica y libre gestión del tiempo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div
                  role="group"
                  aria-label="Filtrar tareas por horizonte"
                  className="flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-md border border-[#E5E7EB]"
                >
                  {(['Todas', 'Hoy', 'Mañana', 'Próxima semana'] as const).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHorizonFilter(h)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        horizonFilter === h
                          ? 'bg-white text-[#7A1C29] font-semibold shadow-2xs'
                          : 'text-[#4B5563] hover:text-[#111827]'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Agrupación Cronológica: Hoy, Mañana, Próxima semana */}
            <div className="space-y-6">
              {pendingAssignments.length === 0 ? (
                <div className="bg-white rounded-lg border border-[#E5E7EB] p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto mb-2" aria-hidden="true" />
                  <h3 className="text-base font-serif font-bold text-[#111827]">
                    Todas las entregas de la semana están al día
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Has cumplido el 100% de tus responsabilidades académicas programadas.
                  </p>
                </div>
              ) : (
                horizonsOrder
                  .filter((h) => horizonFilter === 'Todas' || horizonFilter === h)
                  .map((horizon) => {
                    const list = groupedPending[horizon];
                    if (list.length === 0) return null;

                    return (
                      <div key={horizon} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
                          <h3 className="text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                            Horizonte: {horizon} ({list.length})
                          </h3>
                          <span className="text-[11px] text-[#6B7280] font-serif italic">
                            Responsabilidad individual ineludible
                          </span>
                        </div>

                        {list.map((task) => (
                          <article
                            key={task.id}
                            className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs hover:border-[#9CA3AF] transition-colors"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  <span
                                    className={`font-bold px-2 py-0.5 rounded border ${
                                      task.horizon === 'Hoy'
                                        ? 'text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]'
                                        : task.horizon === 'Mañana'
                                        ? 'text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]'
                                        : 'text-[#374151] bg-[#F3F4F6] border-[#E5E7EB]'
                                    }`}
                                  >
                                    {task.dueLabel}
                                  </span>
                                  <span className="text-[#6B7280]" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="font-semibold text-[#7A1C29]">
                                    {task.courseName} ({task.sectionCode})
                                  </span>
                                  <span className="text-[#6B7280]" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="text-[#4B5563] font-medium tabular-nums">
                                    Ponderación: {task.points} pts
                                  </span>
                                </div>

                                <h4 className="text-base font-serif font-bold text-[#111827]">
                                  {task.title}
                                </h4>
                                <p className="text-xs text-[#4B5563] leading-relaxed">
                                  {task.description}
                                </p>
                                {task.socraticInquiry && (
                                  <p className="text-xs font-serif italic text-[#7A1C29] pt-1">
                                    Pregunta guía socrática: &ldquo;{task.socraticInquiry}&rdquo;
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => openCertaintyDrawer(task)}
                                  className="px-4 py-2 bg-[#9B1B30] hover:bg-[#7A1C29] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                >
                                  <Upload className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                  <span>Subir Entrega</span>
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    );
                  })
              )}
            </div>

            {/* SECCIÓN DE TAREAS ENTREGADAS (CONFIRMACIÓN INMUTABLE & RÚBRICAS) */}
            <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-serif font-bold text-[#111827] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
                  <span>Tareas Entregadas — Registro Histórico de Certeza Inmutable</span>
                </h3>
                <span className="text-xs text-[#6B7280] tabular-nums">
                  {submittedAssignments.length} entregas verificadas con hash SHA-256
                </span>
              </div>

              <div className="divide-y divide-[#E5E7EB] text-xs">
                {submittedAssignments.map((item) => (
                  <div
                    key={item.id}
                    className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[#111827] text-sm">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[#6B7280]">
                        <span>
                          {item.courseName} ({item.sectionCode})
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Entregado: {item.submission?.submittedAt}</span>
                        <span aria-hidden="true">·</span>
                        <code className="font-mono text-[11px] text-[#065F46] tabular-nums">
                          {item.submission?.receiptHash}
                        </code>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded font-medium border ${
                          item.submission?.evaluationStatus === 'Calificada'
                            ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                            : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                        }`}
                      >
                        {item.submission?.evaluationStatus === 'Calificada'
                          ? 'Certeza confirmada'
                          : 'En revisión por cátedra'}
                      </span>

                      <span className="font-bold text-[#111827] tabular-nums min-w-[54px] text-right">
                        {item.submission?.score !== undefined
                          ? `${item.submission.score}/${item.submission.maxScore}`
                          : `—/${item.points}`}
                      </span>

                      <button
                        type="button"
                        id={`btn-history-${item.id}`}
                        onClick={() => setActiveHistoryAssignment(item)}
                        className="px-3 py-1.5 rounded border border-[#C59B27]/40 bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#92400E] font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
                      >
                        <History className="w-3.5 h-3.5 text-[#B8860B]" aria-hidden="true" />
                        <span>
                          Historial (v{item.submission?.history?.length ?? item.submission?.versionNumber ?? 1})
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveRubricAssignment(item)}
                        className="px-3 py-1.5 rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#111827] font-medium transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Ver Rúbrica
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* VISTA 3: HORARIO SEMANAL */}
        {activeTab === 'horario' && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#111827]">
                  Horario Semanal & Salones Ludwig von Mises
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Sesiones presenciales de diálogo socrático, laboratorios de sistemas y coloquios.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#7A1C29] bg-[#FDF2F4] px-3 py-1 rounded border border-[#7A1C29]/20">
                24 Créditos matriculados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#6B7280] font-semibold">
                    <th className="py-3 px-4">Día</th>
                    <th className="py-3 px-4">Horario</th>
                    <th className="py-3 px-4">Cátedra y Sección</th>
                    <th className="py-3 px-4">Salón / Ubicación</th>
                    <th className="py-3 px-4">Catedrático</th>
                    <th className="py-3 px-4">Metodología</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {schedule.map((slot) => (
                    <tr key={slot.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#111827]">{slot.day}</td>
                      <td className="py-3.5 px-4 font-mono text-[#4B5563] tabular-nums whitespace-nowrap">
                        {slot.timeRange}
                      </td>
                      <td className="py-3.5 px-4 font-serif font-bold text-[#7A1C29]">
                        {slot.courseName} ({slot.section})
                      </td>
                      <td className="py-3.5 px-4 text-[#111827]">{slot.classroom}</td>
                      <td className="py-3.5 px-4 text-[#4B5563]">{slot.professor}</td>
                      <td className="py-3.5 px-4 text-[#6B7280] italic font-serif">
                        {slot.methodologyTag}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* CERTAINTY DRAWER / MODAL DE ENTREGA INMUTABLE */}
      {activeUploadAssignment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="certainty-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 backdrop-blur-[2px] p-4"
        >
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#7A1C29] text-white px-6 py-4 flex items-center justify-between border-b border-[#C59B27]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#F7F2E6] font-semibold block">
                  Protocolo de Certeza Académica UFM
                </span>
                <h3 id="certainty-modal-title" className="text-lg font-serif font-bold text-white">
                  Subir Entrega con Sello Criptográfico
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveUploadAssignment(null)}
                aria-label="Cerrar ventana de entrega"
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSubmission} className="p-6 space-y-4">
              <div className="p-3.5 rounded bg-[#F9FAFB] border border-[#E5E7EB] text-xs space-y-1">
                <p className="font-bold text-[#111827]">{activeUploadAssignment.title}</p>
                <p className="text-[#6B7280]">
                  {activeUploadAssignment.courseName} ({activeUploadAssignment.sectionCode}) ·{' '}
                  {activeUploadAssignment.dueLabel} · {activeUploadAssignment.points} pts
                </p>
              </div>

              <div>
                <label
                  htmlFor="upload-filename"
                  className="block text-xs font-semibold text-[#111827] mb-1"
                >
                  Archivo de Entrega (PDF / ZIP / Ensayo Académico)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="upload-filename"
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="flex-1 h-10 px-3 rounded border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
                    placeholder="Nombre_Apellido_Entrega.pdf"
                  />
                  <label className="px-3 py-2.5 rounded border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] text-xs font-medium text-[#111827] cursor-pointer whitespace-nowrap flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#7A1C29]" aria-hidden="true" />
                    <span>Examinar</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFileName(file.name);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="upload-repo-url"
                  className="block text-xs font-semibold text-[#111827] mb-1"
                >
                  Repositorio GitHub / Evidencia Verificable (Opcional)
                </label>
                <input
                  id="upload-repo-url"
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
                  placeholder="https://github.com/ufm-cs/..."
                />
              </div>

              <div>
                <label
                  htmlFor="upload-socratic-defense"
                  className="block text-xs font-semibold text-[#111827] mb-1"
                >
                  Síntesis de Defensa Socrática (Tesis Central del Estudiante)
                </label>
                <textarea
                  id="upload-socratic-defense"
                  rows={3}
                  value={socraticDefense}
                  onChange={(e) => setSocraticDefense(e.target.value)}
                  placeholder="Expón con rigor deductivo tu argumento principal ante la pregunta guía de la cátedra..."
                  className="w-full p-3 rounded border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30] leading-relaxed"
                />
              </div>

              <div>
                <label
                  htmlFor="upload-change-summary"
                  className="block text-xs font-semibold text-[#111827] mb-1"
                >
                  Notas de Iteración / Bitácora de Versión (Opcional)
                </label>
                <input
                  id="upload-change-summary"
                  type="text"
                  value={changeSummary}
                  onChange={(e) => setChangeSummary(e.target.value)}
                  placeholder="Ej: Corrección de tests flaky, ampliación de la justificación técnica..."
                  className="w-full h-10 px-3 rounded border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
                />
              </div>

              {activeUploadAssignment.submission && (
                <div className="flex items-center justify-between p-2.5 rounded bg-[#FFFBEB] border border-[#FDE68A] text-xs">
                  <span className="text-[#92400E] font-medium">
                    Esta asignación ya posee {activeUploadAssignment.submission.history?.length ?? 1} versión(es) enviada(s).
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveHistoryAssignment(activeUploadAssignment);
                    }}
                    className="text-[#B8860B] hover:text-[#92400E] font-bold underline cursor-pointer"
                  >
                    Ver Historial Previo
                  </button>
                </div>
              )}

              {uploadError && (
                <p role="alert" className="text-xs text-[#DC2626] font-medium">
                  {uploadError}
                </p>
              )}

              <div className="p-3 rounded bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] text-[#065F46] flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-[#059669]" aria-hidden="true" />
                <span>
                  Al confirmar, se emitirá un sello criptográfico SHA-256 inmutable como comprobante oficial de recepción.
                </span>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveUploadAssignment(null)}
                  className="px-4 py-2 rounded border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] text-xs font-semibold text-[#111827] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#9B1B30] hover:bg-[#7A1C29] text-white text-xs font-semibold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Confirmar Entrega y Generar Sello</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE RÚBRICA Y EVALUACIÓN SOCRÁTICA */}
      {activeRubricAssignment && activeRubricAssignment.submission && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rubric-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 backdrop-blur-[2px] p-4"
        >
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-xl max-w-xl w-full overflow-hidden">
            <div className="bg-[#1A2332] text-white px-6 py-4 flex items-center justify-between border-b border-[#C59B27]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C59B27] font-semibold block">
                  Certificado de Recepción y Evaluación por Rúbrica
                </span>
                <h3 id="rubric-modal-title" className="text-base font-serif font-bold text-white">
                  {activeRubricAssignment.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRubricAssignment(null)}
                aria-label="Cerrar rúbrica"
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded bg-[#F9FAFB] border border-[#E5E7EB] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#111827]">
                    Archivo: {activeRubricAssignment.submission.fileName}
                  </span>
                  <span className="font-mono text-[#065F46] font-semibold tabular-nums">
                    {activeRubricAssignment.submission.receiptHash}
                  </span>
                </div>
                {activeRubricAssignment.submission.repositoryUrl && (
                  <p className="text-[#4B5563] flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-[#7A1C29]" aria-hidden="true" />
                    <span>Repositorio: {activeRubricAssignment.submission.repositoryUrl}</span>
                  </p>
                )}
                {activeRubricAssignment.submission.socraticDefense && (
                  <p className="font-serif italic text-[#4B5563] pt-1">
                    Defensa Socrática: &ldquo;{activeRubricAssignment.submission.socraticDefense}&rdquo;
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-serif font-bold text-[#111827] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#C59B27]" aria-hidden="true" />
                  <span>Desglose de Criterios de Evaluación</span>
                </h4>
                <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-lg">
                  {activeRubricAssignment.submission.rubric.map((crit) => (
                    <div key={crit.id} className="p-3 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[#111827]">{crit.criterion}</p>
                        {crit.feedback && (
                          <p className="text-[#6B7280] mt-0.5">{crit.feedback}</p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-[#7A1C29] tabular-nums shrink-0">
                        {crit.earned !== undefined ? `${crit.earned}/${crit.weight} pts` : `Pendiente (${crit.weight} pts)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-[#6B7280]">
                  Estado: <strong>{activeRubricAssignment.submission.evaluationStatus}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveRubricAssignment(null)}
                  className="px-4 py-2 rounded bg-[#7A1C29] text-white font-semibold cursor-pointer"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL DE ENTREGAS & LOG INMUTABLE HASH */}
      {activeHistoryAssignment && (
        <SubmissionHistoryModal
          assignment={activeHistoryAssignment}
          onClose={() => setActiveHistoryAssignment(null)}
          onRequestNewVersion={(asg) => {
            setActiveHistoryAssignment(null);
            openCertaintyDrawer(asg);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

