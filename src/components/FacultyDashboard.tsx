import React, { useState } from 'react';
import {
  Layers,
  Award,
  PlusCircle,
  Send,
  CheckCircle2,
  Info,
  Users,
  BookOpen,
} from 'lucide-react';
import {
  Assignment,
  CourseSection,
  UrgencyHorizon,
  UserProfile,
} from '../types/academic';
import { validateAssignmentInput } from '../utils/academicLogic';

interface FacultyDashboardProps {
  professor: UserProfile;
  courses: CourseSection[];
  assignments: Assignment[];
  onPublishAssignment: (newAssignment: Omit<Assignment, 'id' | 'status'>) => void;
  onGradeSubmission: (assignmentId: string, score: number) => void;
}

type FacultyTab = 'nueva-asignacion' | 'cursos-activos' | 'calificaciones';

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  professor,
  courses,
  assignments,
  onPublishAssignment,
  onGradeSubmission,
}) => {
  const [activeTab, setActiveTab] = useState<FacultyTab>('nueva-asignacion');

  // 3-Step Quick Assignment Creation Form State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || 'course-arch-g02'
  );
  const [title, setTitle] = useState(
    'Caso Práctico 03: Implementación de Patrón Circuit Breaker y Resiliencia Sistémica'
  );
  const [description, setDescription] = useState(
    '1. Implementar la tolerancia a fallos utilizando Resilience4j o Polly en el microservicio financiero.\n2. Formular una defensa técnica en el README: justifique por qué el desacoplamiento es superior al control centralizado.\n3. Subir enlace al repositorio con commit criptográficamente firmado y pruebas unitarias de latencia simulada.'
  );
  const [socraticInquiry, setSocraticInquiry] = useState(
    '¿Por qué los sistemas descentralizados con fallos aislados resisten mejor los choques externos que la planificación monolítica?'
  );
  const [dueDate, setDueDate] = useState('2026-10-25');
  const [dueTime, setDueTime] = useState('23:59');
  const [points, setPoints] = useState<number>(100);
  const [horizon, setHorizon] = useState<UrgencyHorizon>('Hoy');
  const [formError, setFormError] = useState<string | null>(null);
  const [publishedConfirmation, setPublishedConfirmation] = useState<{
    title: string;
    courseName: string;
    section: string;
    enrolledCount: number;
    points: number;
  } | null>(null);

  const selectedCourse =
    courses.find((c) => c.id === selectedCourseId) || courses[0];

  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const pendingEvaluationsCount = assignments.filter(
    (a) =>
      a.status === 'submitted' &&
      a.submission?.evaluationStatus === 'En revisión por cátedra'
  ).length;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAssignmentInput({
      courseId: selectedCourseId,
      title,
      description,
      dueDate,
      dueTime,
      points,
    });

    if (!validation.valid) {
      setFormError(validation.error || 'Revisa los campos del formulario.');
      return;
    }

    setFormError(null);

    const dueLabel =
      horizon === 'Hoy'
        ? `VENCE HOY · ${dueTime}`
        : horizon === 'Mañana'
        ? `MAÑANA · ${dueTime}`
        : `PRÓXIMA SEMANA · ${dueDate} · ${dueTime}`;

    onPublishAssignment({
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      sectionCode: selectedCourse.section,
      title: title.trim(),
      description: description.trim(),
      socraticInquiry: socraticInquiry.trim(),
      dueDate,
      dueTime,
      dueLabel,
      horizon,
      points,
    });

    setPublishedConfirmation({
      title: title.trim(),
      courseName: selectedCourse.name,
      section: selectedCourse.section,
      enrolledCount: selectedCourse.enrolledCount,
      points,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* SIDEBAR CATEDRÁTICO */}
      <aside
        aria-label="Navegación del catedrático"
        className="lg:col-span-3 bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs"
      >
        <div className="flex items-center gap-3 pb-5 border-b border-[#E5E7EB]">
          <div className="w-11 h-11 rounded-full bg-[#FFFBEB] border border-[#C59B27] flex items-center justify-center text-[#B8860B] font-bold text-sm font-serif shrink-0">
            {professor.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#111827] leading-tight font-serif truncate">
              {professor.name}
            </p>
            <p className="text-xs text-[#6B7280] truncate">
              {professor.semesterOrTitle} · {professor.departmentOrMajor}
            </p>
            <p className="text-[11px] font-semibold text-[#7A1C29] mt-1">
              {professor.badgeText}
            </p>
          </div>
        </div>

        {/* Navegación Lateral */}
        <nav aria-label="Módulos docentes" className="mt-5 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('cursos-activos')}
            className={`w-full flex items-center px-3.5 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
              activeTab === 'cursos-activos'
                ? 'font-semibold text-[#7A1C29] bg-[#FDF2F4] border border-[#7A1C29]/20'
                : 'font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
            }`}
          >
            <Layers className="w-4 h-4 mr-3 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Mis Cursos Activos</span>
            <span className="ml-auto text-xs font-bold text-[#4B5563] tabular-nums">
              {courses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calificaciones')}
            className={`w-full flex items-center px-3.5 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
              activeTab === 'calificaciones'
                ? 'font-semibold text-[#7A1C29] bg-[#FDF2F4] border border-[#7A1C29]/20'
                : 'font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
            }`}
          >
            <Award className="w-4 h-4 mr-3 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Calificaciones & Rúbricas</span>
            {pendingEvaluationsCount > 0 && (
              <span className="ml-auto text-xs font-bold text-[#7A1C29] tabular-nums">
                {pendingEvaluationsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nueva-asignacion')}
            className={`w-full flex items-center px-3.5 py-2.5 text-sm rounded-lg transition-colors cursor-pointer ${
              activeTab === 'nueva-asignacion'
                ? 'font-semibold text-[#7A1C29] bg-[#FDF2F4] border border-[#7A1C29]/20'
                : 'font-medium text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'
            }`}
          >
            <PlusCircle className="w-4 h-4 mr-3 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">Nueva Asignación Rápida</span>
          </button>
        </nav>

        {/* Tarjeta Filosófica: Método Socrático UFM */}
        <div className="mt-6 p-3.5 rounded-lg bg-[#FFFBEB] border border-[#C59B27]/40 text-xs">
          <span className="font-serif italic font-bold text-[#92400E] block mb-1">
            Método Socrático UFM:
          </span>
          <p className="text-[#4B5563] leading-relaxed font-serif">
            &ldquo;El profesor no impone verdades acabadas; guía preguntas que despiertan el rigor deductivo y la libertad de pensamiento.&rdquo;
          </p>
        </div>

        {/* Métricas Rápidas de Cátedra */}
        <div className="mt-6 pt-5 border-t border-[#E5E7EB]">
          <h4 className="text-xs font-serif font-bold text-[#6B7280] uppercase tracking-wider mb-3">
            Resumen de Cátedra
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 rounded bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="text-[#4B5563]">Alumnos inscritos:</span>
              <span className="font-bold text-[#111827] tabular-nums">142</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="text-[#4B5563]">Cátedras activas:</span>
              <span className="font-bold text-[#111827] tabular-nums">{courses.length} secciones</span>
            </div>
            <div className="flex justify-between p-2.5 rounded bg-[#F9FAFB] border border-[#E5E7EB]">
              <span className="text-[#4B5563]">Entregas por evaluar:</span>
              <span className="font-bold text-[#7A1C29] tabular-nums">
                {18 + pendingEvaluationsCount - 1} pendientes
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* PANEL PRINCIPAL DOCENTE */}
      <section className="lg:col-span-9 space-y-6">
        {activeTab === 'nueva-asignacion' && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden shadow-2xs">
            {/* Encabezado del Formulario Guiado en 3 Pasos */}
            <div className="p-6 border-b border-[#E5E7EB] bg-[#FAF9F6]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-[#7A1C29] uppercase tracking-wider block">
                    Cátedra Marroquín · Productividad y Rigor (&lt;60 segundos)
                  </span>
                  <h1 className="text-2xl font-serif font-bold text-[#111827] mt-1">
                    Creación Rápida de Cátedra — Asignación en 3 Pasos
                  </h1>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    Diseñado para publicar instrucciones claras con estándares socráticos y despacho automático a los alumnos.
                  </p>
                </div>
                <div
                  aria-label="Indicador de 3 pasos"
                  className="hidden sm:flex items-center gap-2 text-xs text-[#6B7280] shrink-0"
                >
                  <span className="w-6 h-6 rounded-full bg-[#7A1C29] text-white flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  <span>—</span>
                  <span className="w-6 h-6 rounded-full bg-[#7A1C29] text-white flex items-center justify-center font-bold text-[11px]">
                    2
                  </span>
                  <span>—</span>
                  <span className="w-6 h-6 rounded-full bg-[#7A1C29] text-white flex items-center justify-center font-bold text-[11px]">
                    3
                  </span>
                </div>
              </div>
            </div>

            {/* Banner de Confirmación de Despacho a Estudiantes */}
            {publishedConfirmation && (
              <div
                role="status"
                aria-live="polite"
                className="m-6 mb-0 p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-bold">
                      Asignación publicada con éxito: &ldquo;{publishedConfirmation.title}&rdquo;
                    </p>
                    <p className="mt-0.5">
                      Notificación institucional despachada automáticamente a los{' '}
                      <strong>{publishedConfirmation.enrolledCount} alumnos</strong> matriculados en{' '}
                      <strong>
                        {publishedConfirmation.courseName} ({publishedConfirmation.section})
                      </strong>{' '}
                      · Valor: {publishedConfirmation.points} pts. Ya está disponible en la vista Estudiante ("Mi Semana").
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPublishedConfirmation(null)}
                  className="text-xs font-semibold underline shrink-0 cursor-pointer"
                >
                  Ocultar
                </button>
              </div>
            )}

            <form
              id="quick-assignment-form"
              onSubmit={handlePublish}
              className="p-5 sm:p-6 space-y-5"
            >
              {/* PASO 1: SELECCIONAR CÁTEDRA Y SECCIÓN */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C29] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </span>
                  <h2 className="text-sm font-serif font-bold text-[#111827]">
                    Paso 1: Seleccionar Cátedra y Sección Destino
                  </h2>
                </div>

                <div
                  role="radiogroup"
                  aria-label="Seleccionar cátedra y sección"
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {courses.slice(0, 3).map((course) => {
                    const isSelected = course.id === selectedCourseId;
                    return (
                      <button
                        key={course.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedCourseId(course.id)}
                        className={`rounded-lg p-3 text-left flex flex-col justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[#7A1C29] bg-[#FDF2F4]/60'
                            : 'border border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
                        }`}
                      >
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-[#7A1C29]' : 'text-[#111827]'
                          }`}
                        >
                          {course.name}
                        </span>
                        <span className="text-[11px] text-[#6B7280] mt-1 tabular-nums">
                          {course.section} - {course.enrolledCount} alumnos
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PASO 2: INSTRUCCIONES Y DEBATE SOCRÁTICO */}
              <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C29] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </span>
                  <h2 className="text-sm font-serif font-bold text-[#111827]">
                    Paso 2: Instrucciones y Debate Socrático
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="assignment-title"
                      className="block text-xs font-semibold text-[#111827] mb-1"
                    >
                      Título de la Asignación Académica
                    </label>
                    <input
                      id="assignment-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-9 px-3 rounded border border-[#E5E7EB] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-xs text-[#111827]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-socratic"
                      className="block text-xs font-semibold text-[#111827] mb-1"
                    >
                      Indagación Socrática (Pregunta Guía)
                    </label>
                    <input
                      id="assignment-socratic"
                      type="text"
                      value={socraticInquiry}
                      onChange={(e) => setSocraticInquiry(e.target.value)}
                      className="w-full h-9 px-3 rounded border border-[#E5E7EB] focus:outline-none focus:border-[#9B1B30] text-xs font-serif italic text-[#111827]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label
                      htmlFor="assignment-description"
                      className="block text-xs font-semibold text-[#111827]"
                    >
                      Requisitos Argumentativos, Código y Criterios de Entrega
                    </label>
                    <span className="text-[11px] text-[#6B7280] font-serif italic">
                      Promueve el rigor deductivo individual
                    </span>
                  </div>
                  <textarea
                    id="assignment-description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded border border-[#E5E7EB] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30] text-xs text-[#111827] leading-relaxed"
                  />
                </div>
              </div>

              {/* PASO 3: FECHA LÍMITE Y PONDERACIÓN */}
              <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#7A1C29] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </span>
                  <h2 className="text-sm font-serif font-bold text-[#111827]">
                    Paso 3: Fecha Límite Improrrogable y Ponderación
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label
                      htmlFor="assignment-horizon"
                      className="block text-xs font-medium text-[#111827] mb-1"
                    >
                      Horizonte en "Mi Semana"
                    </label>
                    <select
                      id="assignment-horizon"
                      value={horizon}
                      onChange={(e) => setHorizon(e.target.value as UrgencyHorizon)}
                      className="w-full h-9 px-2.5 rounded border border-[#E5E7EB] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
                    >
                      <option value="Hoy">Hoy (Urgente)</option>
                      <option value="Mañana">Mañana</option>
                      <option value="Próxima semana">Próxima semana</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-date"
                      className="block text-xs font-medium text-[#111827] mb-1"
                    >
                      Fecha Límite
                    </label>
                    <input
                      id="assignment-date"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full h-9 px-2.5 rounded border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-time"
                      className="block text-xs font-medium text-[#111827] mb-1"
                    >
                      Hora Límite
                    </label>
                    <input
                      id="assignment-time"
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full h-9 px-2.5 rounded border border-[#E5E7EB] text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="assignment-points"
                      className="block text-xs font-medium text-[#111827] mb-1"
                    >
                      Ponderación (pts)
                    </label>
                    <div className="relative">
                      <input
                        id="assignment-points"
                        type="number"
                        min={1}
                        max={500}
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        className="w-full h-9 px-2.5 pr-9 rounded border border-[#E5E7EB] text-xs text-[#111827] tabular-nums focus:outline-none focus:border-[#9B1B30]"
                      />
                      <span className="absolute right-2.5 top-2 text-xs text-[#6B7280] font-serif">
                        pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs text-[#DC2626] font-medium">
                  {formError}
                </p>
              )}

              {/* CTA PRINCIPAL DE PUBLICACIÓN */}
              <div className="pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Info className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
                  <span>
                    Notificación automática al buzón <code className="font-mono">@estudiante.ufm.edu</code> de los{' '}
                    <strong className="text-[#111827]">{selectedCourse.enrolledCount} matriculados</strong>.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#9B1B30] hover:bg-[#7A1C29] text-white font-bold text-sm rounded-md shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Send className="w-4 h-4 text-[#F7F2E6] shrink-0" aria-hidden="true" />
                  <span>Publicar Tarea a Estudiantes</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* VISTA SECUNDARIA: MIS CURSOS ACTIVOS */}
        {activeTab === 'cursos-activos' && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="pb-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#111827]">
                  Cátedras Activas — Claustro UFM
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Total de estudiantes bajo dirección socrática: {totalStudents} alumnos en {courses.length} secciones.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#6B7280]">
                      <span className="font-mono font-semibold text-[#7A1C29]">
                        {c.code} · Sección {c.section}
                      </span>
                      <span className="tabular-nums font-medium">{c.enrolledCount} alumnos</span>
                    </div>
                    <h3 className="text-base font-serif font-bold text-[#111827] mt-1">
                      {c.name}
                    </h3>
                    <p className="text-xs text-[#4B5563] mt-1">
                      {c.scheduleLabel} · {c.classroom}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                    <span className="text-[#6B7280]">
                      Evaluaciones pendientes: <strong>{c.pendingEvaluations}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setActiveTab('nueva-asignacion');
                      }}
                      className="text-[#7A1C29] font-semibold hover:underline cursor-pointer"
                    >
                      Crear asignación para {c.section} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VISTA TERCIARIA: CALIFICACIONES Y RÚBRICAS */}
        {activeTab === 'calificaciones' && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-2xs space-y-5">
            <div className="pb-4 border-b border-[#E5E7EB]">
              <h2 className="text-xl font-serif font-bold text-[#111827]">
                Evaluación de Entregas y Rúbricas Socráticas
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Entregas recibidas con firma criptográfica SHA-256 listas para calificación.
              </p>
            </div>

            <div className="divide-y divide-[#E5E7EB] text-xs">
              {assignments
                .filter((a) => a.status === 'submitted')
                .map((asg) => (
                  <div
                    key={asg.id}
                    className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-serif font-bold text-[#111827]">{asg.title}</p>
                      <p className="text-[#6B7280]">
                        {asg.courseName} ({asg.sectionCode}) · Estudiante: Camila Morales · Archivo:{' '}
                        <code className="font-mono">{asg.submission?.fileName}</code>
                      </p>
                      {asg.submission?.socraticDefense && (
                        <p className="font-serif italic text-[#4B5563]">
                          Defensa: &ldquo;{asg.submission.socraticDefense}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {asg.submission?.evaluationStatus === 'Calificada' ? (
                        <span className="px-3 py-1.5 rounded bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-bold tabular-nums">
                          Calificada: {asg.submission.score}/{asg.submission.maxScore} pts
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onGradeSubmission(asg.id, 97)}
                          className="px-4 py-2 rounded bg-[#9B1B30] hover:bg-[#7A1C29] text-white font-semibold cursor-pointer whitespace-nowrap"
                        >
                          Aprobar y Calificar (97/100)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
