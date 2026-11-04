import React, { useState, useEffect } from 'react';
import {
  Zap,
  Award,
  Download,
  Sun,
  Moon,
  X,
  FileSpreadsheet,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import { Assignment, CourseSection, RoutePath, UserRole } from '../types/academic';
import {
  calculateAcademicTranscriptSummary,
  generateAcademicReportCSV,
} from '../utils/academicLogic';

interface QuickActionsMenuProps {
  currentRoute: RoutePath;
  userRole: UserRole;
  assignments: Assignment[];
  courses: CourseSection[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (route: RoutePath) => void;
}

interface ResourceItem {
  id: string;
  title: string;
  courseLabel: string;
  format: string;
  fileName: string;
  content: string;
}

const UFM_ACADEMIC_RESOURCES: ResourceItem[] = [
  {
    id: 'res-silabo-arch',
    title: 'Sílabo Oficial y Rúbrica Socrática: Arquitectura de Software',
    courseLabel: 'CS-402 · Sección G02 · Dr. Roberto Valdés',
    format: 'TXT / Markdown',
    fileName: 'Silabo_Arquitectura_Software_CS402_UFM.txt',
    content: `UNIVERSIDAD FRANCISCO MARROQUÍN (UFM)
FACULTAD DE INGENIERÍA Y CIENCIAS DE LA COMPUTACIÓN
CÁTEDRA: ARQUITECTURA DE SOFTWARE (CS-402) — SECCIÓN G02
CATEDRÁTICO: DR. ROBERTO VALDÉS

1. MISIÓN Y MÉTODO SOCRÁTICO
"La enseñanza y difusión de los principios éticos, jurídicos y económicos de una sociedad de personas libres y responsables."
Cada sesión exige lectura previa, defensa argumentada de decisiones técnicas y verificación empírica mediante código.

2. PONDERACIÓN ACADÉMICA
- Casos Prácticos y Diagramación C4: 40%
- Laboratorios de Resiliencia y Sistemas Distribuidos: 35%
- Coloquios Socráticos y Defensa de Arquitectura: 25%
`,
  },
  {
    id: 'res-lectura-hayek',
    title: 'Guía de Lectura: El Uso del Conocimiento en la Sociedad (F.A. Hayek)',
    courseLabel: 'EC-305 · Proceso Económico & Sistemas Complejos',
    format: 'TXT / Guía Socrática',
    fileName: 'Guia_Socratica_Hayek_Conocimiento_Distribuido_UFM.txt',
    content: `UNIVERSIDAD FRANCISCO MARROQUÍN (UFM)
SEMINARIO DE PROCESO ECONÓMICO Y SISTEMAS COMPLEJOS (EC-305)
LECTURA FUNDAMENTAL: F.A. HAYEK (1945) — "THE USE OF KNOWLEDGE IN SOCIETY"

PREGUNTAS GUÍA PARA EL COLOQUIO:
1. ¿Por qué el conocimiento relevante para la coordinación social nunca existe de forma concentrada ni integrada en una sola mente?
2. ¿Cómo operan los precios libres como un sistema de telecomunicaciones descentralizado que transmite escasez relativa?
3. Compare un sistema de precios libres con la arquitectura de microservicios gobernada por eventos asíncronos.
`,
  },
  {
    id: 'res-plantilla-c4',
    title: 'Plantilla de Especificación Técnica C4 y Resiliencia (Circuit Breaker)',
    courseLabel: 'CS-402 / CS-410 · Laboratorios de Ingeniería',
    format: 'TXT / Plantilla',
    fileName: 'Plantilla_C4_Resiliencia_Microservicios_UFM.txt',
    content: `PLANTILLA DE ENTREGA CON CERTEZA ACADÉMICA (UFM)
1. Contexto del Sistema (Nivel 1 C4)
2. Contenedores y Contratos de Comunicación (Nivel 2 C4)
3. Componentes y Políticas de Tolerancia a Fallos (Circuit Breaker / Bulkhead)
4. Síntesis de Defensa Socrática: Justificación de Desacoplamiento
`,
  },
];

export const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  currentRoute,
  userRole,
  assignments,
  courses,
  isDarkMode,
  onToggleDarkMode,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'grades' | 'resources' | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const transcript = calculateAcademicTranscriptSummary(assignments);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeModal]);

  // Do not display Quick Actions floating menu on the login screen
  if (currentRoute === '/login') {
    return null;
  }

  const triggerClientDownload = (fileName: string, content: string, mimeType: string) => {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback safe no-op in restricted environments
    }
    setStatusFeedback(`Archivo generado y descargado: ${fileName}`);
  };

  const handleDownloadCSVReport = () => {
    const csv = generateAcademicReportCSV(assignments);
    triggerClientDownload(
      'Expediente_Calificaciones_UFM_SHA256.csv',
      csv,
      'text/csv;charset=utf-8;'
    );
  };

  const roleQuickSwitch =
    userRole === 'student'
      ? {
          label: 'Ir a Creación Rápida de Cátedra (Vista Catedrático)',
          target: '/faculty/dashboard' as RoutePath,
        }
      : userRole === 'faculty'
      ? {
          label: 'Inspeccionar "Mi Semana" (Vista Estudiante)',
          target: '/student/dashboard' as RoutePath,
        }
      : {
          label: 'Ver Portal Estudiantil ("Mi Semana")',
          target: '/student/dashboard' as RoutePath,
        };

  return (
    <>
      {/* FLOATING QUICK ACTIONS CONTAINER */}
      <aside
        aria-label="Menú flotante de acciones rápidas"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end"
      >
        {/* Status Toast Notification */}
        {statusFeedback && (
          <div
            role="status"
            aria-live="polite"
            className="mb-3 px-4 py-2.5 rounded-lg bg-[#065F46] text-white text-xs font-medium shadow-lg border border-[#A7F3D0]/40 flex items-center gap-2 max-w-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-[#A7F3D0] shrink-0" aria-hidden="true" />
            <span className="truncate">{statusFeedback}</span>
            <button
              type="button"
              onClick={() => setStatusFeedback(null)}
              aria-label="Cerrar notificación de descarga"
              className="ml-1 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Popover Menu */}
        {isOpen && (
          <div
            role="dialog"
            aria-label="Panel de Acciones Rápidas Académicas"
            className={`mb-3 w-80 rounded-lg border shadow-xl overflow-hidden transition-all ${
              isDarkMode
                ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                : 'bg-white border-[#E5E7EB] text-[#111827]'
            }`}
          >
            {/* Header */}
            <div className="bg-[#7A1C29] text-white px-4 py-3 flex items-center justify-between border-b border-[#C59B27]/50">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#F7F2E6] font-semibold block">
                  Atajos de Productividad UFM
                </span>
                <h2 className="text-sm font-serif font-bold text-white">
                  Acciones Rápidas (Quick Actions)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar menú de acciones rápidas"
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Summary Strip */}
            <div
              className={`px-4 py-2.5 border-b text-xs flex items-center justify-between ${
                isDarkMode
                  ? 'bg-[#0F172A] border-[#334155] text-[#CBD5E1]'
                  : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#4B5563]'
              }`}
            >
              <span>Promedio Calificado:</span>
              <span className="font-mono font-bold text-[#059669] tabular-nums">
                {transcript.averageScore}% ({transcript.gradedCount} evaluadas)
              </span>
            </div>

            {/* Action Buttons List */}
            <div className="p-2 space-y-1">
              {/* 1. View Grades */}
              <button
                id="qa-view-grades"
                type="button"
                onClick={() => {
                  setActiveModal('grades');
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-md text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#FDF2F4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded bg-[#FDF2F4] text-[#7A1C29] flex items-center justify-center shrink-0 border border-[#7A1C29]/20">
                    <Award className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Ver Calificaciones y Rúbricas</p>
                    <p
                      className={`text-[11px] truncate ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}
                    >
                      Expediente rápido y sellos SHA-256
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold text-[#7A1C29] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1C29]/20 tabular-nums shrink-0">
                  {transcript.averageScore} pts
                </span>
              </button>

              {/* 2. Download Resources Modal */}
              <button
                id="qa-download-resources"
                type="button"
                onClick={() => {
                  setActiveModal('resources');
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-md text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#FDF2F4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded bg-[#FFFBEB] text-[#B8860B] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Descargar Recursos y Sílabos</p>
                    <p
                      className={`text-[11px] truncate ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}
                    >
                      Guías socráticas, lecturas y plantillas C4
                    </p>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-[#6B7280] shrink-0" aria-hidden="true" />
              </button>

              {/* 3. Direct 1-Click CSV Gradebook Export */}
              <button
                id="qa-export-csv"
                type="button"
                onClick={handleDownloadCSVReport}
                className={`w-full px-3 py-2.5 rounded-md text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#FDF2F4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                    <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Exportar Expediente (.CSV)</p>
                    <p
                      className={`text-[11px] truncate ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}
                    >
                      Descarga inmediata con firmas SHA-256
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#059669] font-semibold shrink-0">
                  CSV
                </span>
              </button>

              {/* 4. Toggle Theme Preference */}
              <button
                id="qa-toggle-theme"
                type="button"
                onClick={onToggleDarkMode}
                aria-pressed={isDarkMode}
                className={`w-full px-3 py-2.5 rounded-md text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  isDarkMode ? 'hover:bg-[#334155]' : 'hover:bg-[#FDF2F4]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-7 h-7 rounded bg-[#F1F5F9] text-[#1A2332] flex items-center justify-center shrink-0 border border-[#CBD5E1]">
                    {isDarkMode ? (
                      <Sun className="w-4 h-4 text-[#B8860B]" aria-hidden="true" />
                    ) : (
                      <Moon className="w-4 h-4 text-[#1A2332]" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">
                      Tema: {isDarkMode ? 'Modo Nocturno Académico' : 'Modo Claro Editorial'}
                    </p>
                    <p
                      className={`text-[11px] truncate ${
                        isDarkMode ? 'text-[#94A3B8]' : 'text-[#6B7280]'
                      }`}
                    >
                      Clic para alternar contraste visual
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-[#7A1C29] bg-[#FDF2F4] px-2 py-0.5 rounded border border-[#7A1C29]/20 shrink-0">
                  {isDarkMode ? 'Oscuro' : 'Claro'}
                </span>
              </button>

              {/* 5. Role Contextual Quick Jump */}
              <div className="pt-1 mt-1 border-t border-[#E5E7EB] dark:border-[#334155]">
                <button
                  id="qa-role-shortcut"
                  type="button"
                  onClick={() => {
                    onNavigate(roleQuickSwitch.target);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-md text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isDarkMode
                      ? 'text-[#F8FAFC] hover:bg-[#334155]'
                      : 'text-[#7A1C29] hover:bg-[#FDF2F4]'
                  }`}
                >
                  <span className="truncate">{roleQuickSwitch.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Primary Floating Trigger Button */}
        <button
          id="btn-quick-actions"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className="px-4 py-3 rounded-full bg-[#7A1C29] hover:bg-[#5E101D] text-white font-semibold text-xs shadow-lg border-2 border-[#C59B27] flex items-center gap-2 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <Zap className="w-4 h-4 text-[#C59B27] shrink-0" aria-hidden="true" />
          <span>Acciones Rápidas</span>
        </button>
      </aside>

      {/* QUICK MODAL 1: EXPEDIENTE DE CALIFICACIONES Y SELLOS SHA-256 */}
      {activeModal === 'grades' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qa-grades-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 backdrop-blur-[2px] p-4"
        >
          <div
            className={`rounded-lg border shadow-xl max-w-2xl w-full overflow-hidden ${
              isDarkMode
                ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                : 'bg-white border-[#E5E7EB] text-[#111827]'
            }`}
          >
            <div className="bg-[#7A1C29] text-white px-6 py-4 flex items-center justify-between border-b border-[#C59B27]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#F7F2E6] font-semibold block">
                  Consulta Instantánea · Certeza Académica UFM
                </span>
                <h3 id="qa-grades-modal-title" className="text-lg font-serif font-bold text-white">
                  Expediente de Calificaciones y Certificados SHA-256
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar expediente de calificaciones"
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
              {/* KPI Strip */}
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`p-3.5 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0F172A] border-[#334155]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB]'
                  }`}
                >
                  <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] block">
                    Promedio Ponderado
                  </span>
                  <span className="text-xl font-serif font-bold text-[#059669] tabular-nums">
                    {transcript.averageScore} / 100
                  </span>
                </div>
                <div
                  className={`p-3.5 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0F172A] border-[#334155]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB]'
                  }`}
                >
                  <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] block">
                    Entregas Calificadas
                  </span>
                  <span className="text-xl font-serif font-bold tabular-nums">
                    {transcript.gradedCount}
                  </span>
                </div>
                <div
                  className={`p-3.5 rounded-lg border ${
                    isDarkMode
                      ? 'bg-[#0F172A] border-[#334155]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB]'
                  }`}
                >
                  <span className="text-[11px] text-[#6B7280] dark:text-[#94A3B8] block">
                    En Revisión / Pendientes
                  </span>
                  <span className="text-xl font-serif font-bold text-[#B8860B] tabular-nums">
                    {transcript.inReviewCount} / {transcript.pendingCount}
                  </span>
                </div>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto border border-[#E5E7EB] dark:border-[#334155] rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr
                      className={`border-b text-[11px] font-semibold ${
                        isDarkMode
                          ? 'bg-[#0F172A] border-[#334155] text-[#94A3B8]'
                          : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
                      }`}
                    >
                      <th className="py-2.5 px-3">Cátedra</th>
                      <th className="py-2.5 px-3">Asignación</th>
                      <th className="py-2.5 px-3">Sello Criptográfico</th>
                      <th className="py-2.5 px-3 text-right">Nota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#334155]">
                    {assignments.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-3 font-medium text-[#7A1C29] dark:text-[#FCA5A5] whitespace-nowrap">
                          {item.courseName} ({item.sectionCode})
                        </td>
                        <td className="py-2.5 px-3 font-semibold">{item.title}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#059669] tabular-nums whitespace-nowrap">
                          {item.submission?.receiptHash || 'Pendiente de entrega'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums whitespace-nowrap">
                          {item.submission?.score !== undefined
                            ? `${item.submission.score}/${item.submission.maxScore}`
                            : item.status === 'submitted'
                            ? 'En revisión'
                            : `—/${item.points}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleDownloadCSVReport}
                  className="px-4 py-2 rounded border border-[#E5E7EB] dark:border-[#334155] hover:bg-[#F9FAFB] dark:hover:bg-[#334155] font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#7A1C29]" aria-hidden="true" />
                  <span>Descargar Certificado en CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2 rounded bg-[#7A1C29] text-white font-semibold cursor-pointer"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK MODAL 2: DESCARGA DE RECURSOS Y SÍLABOS DE CÁTEDRA */}
      {activeModal === 'resources' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qa-resources-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/55 backdrop-blur-[2px] p-4"
        >
          <div
            className={`rounded-lg border shadow-xl max-w-xl w-full overflow-hidden ${
              isDarkMode
                ? 'bg-[#1E293B] border-[#334155] text-[#F8FAFC]'
                : 'bg-white border-[#E5E7EB] text-[#111827]'
            }`}
          >
            <div className="bg-[#1A2332] text-white px-6 py-4 flex items-center justify-between border-b border-[#C59B27]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C59B27] font-semibold block">
                  Biblioteca Ludwig von Mises · Material de Cátedra
                </span>
                <h3
                  id="qa-resources-modal-title"
                  className="text-lg font-serif font-bold text-white"
                >
                  Descargar Recursos, Sílabos y Guías Socráticas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                aria-label="Cerrar ventana de recursos"
                className="p-1 rounded hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-[#6B7280] dark:text-[#94A3B8]">
                Selecciona cualquier documento oficial de tus {courses.length} cátedras activas para descargarlo inmediatamente.
              </p>

              <div className="divide-y divide-[#E5E7EB] dark:divide-[#334155] border border-[#E5E7EB] dark:border-[#334155] rounded-lg">
                {UFM_ACADEMIC_RESOURCES.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <p className="font-serif font-bold text-sm">{res.title}</p>
                      <p className="text-[#6B7280] dark:text-[#94A3B8]">
                        {res.courseLabel} · Formato: {res.format}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        triggerClientDownload(
                          res.fileName,
                          res.content,
                          'text/plain;charset=utf-8;'
                        )
                      }
                      className="px-3.5 py-2 rounded bg-[#9B1B30] hover:bg-[#7A1C29] text-white font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Descargar</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[#059669] font-medium">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>Documentos verificados por el Claustro UFM</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 rounded border border-[#E5E7EB] dark:border-[#334155] font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
