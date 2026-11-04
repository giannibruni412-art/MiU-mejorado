import React, { useState } from 'react';
import {
  Users,
  Megaphone,
  Briefcase,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import {
  AnnouncementUrgency,
  InstitutionalAnnouncement,
} from '../types/academic';
import { validateAnnouncementInput } from '../utils/academicLogic';

interface AdminDashboardProps {
  announcements: InstitutionalAnnouncement[];
  totalAssignmentsCompletionRate: number;
  onPublishAnnouncement: (
    newAnn: Omit<InstitutionalAnnouncement, 'id' | 'publishedAt' | 'reachCount' | 'activeOnPortal'>
  ) => void;
  onToggleAnnouncementStatus: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  announcements,
  totalAssignmentsCompletionRate,
  onPublishAnnouncement,
  onToggleAnnouncementStatus,
}) => {
  const [title, setTitle] = useState(
    'Aviso Importante: Reubicación de Parqueo Poniente y Cierre de Fecha de Pagos de Cuota 3'
  );
  const [category, setCategory] = useState('Infraestructura & Tesorería');
  const [urgency, setUrgency] = useState<AnnouncementUrgency>('Prioritario');
  const [body, setBody] = useState(
    'Se informa a la comunidad universitaria que a partir del lunes 21 de octubre el Parqueo Poniente estará en mantenimiento. Por favor utilizar los accesos por el Edificio E. Asimismo, se recuerda que la fecha límite para el pago sin recargo vence el viernes 25.'
  );
  const [globalBanner, setGlobalBanner] = useState(true);
  const [emailPush, setEmailPush] = useState(true);
  const [studentInbox, setStudentInbox] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  const publishedCount = 25 + announcements.length;

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateAnnouncementInput({
      title,
      body,
      urgency,
      globalBanner,
      emailPush,
      studentInbox,
    });

    if (!validation.valid) {
      setErrorMsg(validation.error || 'Verifica los campos del comunicado.');
      return;
    }

    setErrorMsg(null);
    onPublishAnnouncement({
      title: title.trim(),
      category,
      urgency,
      body: body.trim(),
      author: 'Decanatura de Ingeniería y Ciencias Económicas',
      channels: {
        globalBanner,
        emailPush,
        studentInbox,
      },
    });

    setDispatchSuccess(
      `Boletín "${title.trim()}" despachado con nivel [${urgency}] a 4,820 miembros de la facultad.`
    );
  };

  return (
    <div className="space-y-7">
      {/* HEADER DECANATURA Y GOBIERNO ACADÉMICO */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#111827]">
              Decanatura y Gobierno Académico
            </h1>
            <span className="text-xs font-semibold text-[#92400E] bg-[#FFFBEB] px-2.5 py-0.5 rounded border border-[#FDE68A]">
              Excelencia & Libertad
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Supervisión en tiempo real de facultades, coloquios interdisciplinarios y comunicados oficiales del campus.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#4B5563] shrink-0">
          <span className="font-serif italic">Ciclo Semestral: 2026-II</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#065F46]">Sistemas 100% Operativos</span>
        </div>
      </div>

      {/* 4 TARJETAS DE MÉTRICAS CLAVE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Métrica 1: Estudiantes Activos */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Estudiantes Activos
            </span>
            <span className="w-8 h-8 rounded bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-serif font-extrabold text-[#111827] tabular-nums">
              4,820
            </p>
            <p className="text-xs text-[#059669] mt-1 font-medium tabular-nums">
              +3.2% vs ciclo anterior
            </p>
          </div>
        </div>

        {/* Métrica 2: Catedráticos en Línea */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Catedráticos en Línea
            </span>
            <span className="w-8 h-8 rounded bg-[#FFFBEB] text-[#B8860B] flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-serif font-extrabold text-[#111827] tabular-nums">
              114
            </p>
            <p className="text-xs text-[#6B7280] mt-1 font-serif italic">
              100% libertad de cátedra
            </p>
          </div>
        </div>

        {/* Métrica 3: Avisos Publicados */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Avisos Publicados
            </span>
            <span className="w-8 h-8 rounded bg-[#FDF2F4] text-[#7A1C29] flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-serif font-extrabold text-[#111827] tabular-nums">
              {publishedCount}
            </p>
            <p className="text-xs text-[#6B7280] mt-1 font-serif italic tabular-nums">
              {announcements.filter((a) => a.activeOnPortal).length} activos en portal hoy
            </p>
          </div>
        </div>

        {/* Métrica 4: Índice de Rigor y Entregas */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">
              Índice de Rigor y Entregas
            </span>
            <span className="w-8 h-8 rounded bg-[#F1F5F9] text-[#1A2332] flex items-center justify-center shrink-0">
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-serif font-extrabold text-[#111827] tabular-nums">
              92.8%
            </p>
            <p className="text-xs text-[#059669] mt-1 font-medium tabular-nums">
              Autoexigencia estudiantil ({totalAssignmentsCompletionRate}% muestra local)
            </p>
          </div>
        </div>
      </div>

      {/* DESPACHADOR DE COMUNICADOS A TODA LA FACULTAD */}
      <div className="bg-white rounded-lg border border-[#C59B27]/60 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5E7EB] gap-3">
          <div>
            <span className="text-xs font-semibold text-[#7A1C29] uppercase tracking-wider block">
              Canal Oficial de Decanatura · Despacho Masivo
            </span>
            <h2 className="text-xl font-serif font-bold text-[#111827] mt-1">
              Publicar Convocatoria o Comunicado a toda la Facultad
            </h2>
            <p className="text-xs text-[#6B7280]">
              Envío inmediato a estudiantes y catedráticos con control de nivel de urgencia y canales.
            </p>
          </div>
          <span className="text-xs font-medium text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1.5 rounded font-serif flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-4 h-4 text-[#B8860B]" aria-hidden="true" />
            <span>Canal Verificado UFM</span>
          </span>
        </div>

        {dispatchSuccess && (
          <div
            role="status"
            aria-live="polite"
            className="mt-5 p-4 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
              <span className="font-semibold">{dispatchSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setDispatchSuccess(null)}
              className="underline font-semibold cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}

        <form onSubmit={handleDispatch} className="mt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label
                htmlFor="announcement-title"
                className="block text-xs font-semibold text-[#111827] mb-1"
              >
                Título del Comunicado o Boletín
              </label>
              <input
                id="announcement-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3.5 rounded border border-[#E5E7EB] focus:outline-none focus:border-[#9B1B30] text-sm text-[#111827]"
              />
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="announcement-category"
                className="block text-xs font-semibold text-[#111827] mb-1"
              >
                Categoría Institucional
              </label>
              <select
                id="announcement-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded border border-[#E5E7EB] bg-white text-xs text-[#111827] focus:outline-none focus:border-[#9B1B30]"
              >
                <option value="Infraestructura & Tesorería">Infraestructura & Tesorería</option>
                <option value="Coloquios & Cátedras Magistrales">
                  Coloquios & Cátedras Magistrales
                </option>
                <option value="Calendario de Cierres Académicos">
                  Calendario de Cierres Académicos
                </option>
                <option value="Biblioteca Ludwig von Mises">Biblioteca Ludwig von Mises</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label
                htmlFor="announcement-urgency"
                className="block text-xs font-semibold text-[#111827] mb-1"
              >
                Nivel de Urgencia
              </label>
              <select
                id="announcement-urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as AnnouncementUrgency)}
                className="w-full h-10 px-3 rounded border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#9B1B30]"
              >
                <option value="Informativo">Informativo</option>
                <option value="Prioritario">Prioritario</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="announcement-body"
              className="block text-xs font-semibold text-[#111827] mb-1"
            >
              Cuerpo del Comunicado Oficial
            </label>
            <textarea
              id="announcement-body"
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3.5 rounded border border-[#E5E7EB] focus:outline-none focus:border-[#9B1B30] text-sm text-[#111827] leading-relaxed"
              placeholder="Escribe el mensaje institucional detallado..."
            />
          </div>

          {errorMsg && (
            <p role="alert" className="text-xs text-[#DC2626] font-medium">
              {errorMsg}
            </p>
          )}

          <div className="flex flex-col md:flex-row md:items-center justify-between pt-4 border-t border-[#E5E7EB] gap-4">
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#4B5563]">
              <span className="font-semibold text-[#111827]">Canales de Distribución:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={globalBanner}
                  onChange={(e) => setGlobalBanner(e.target.checked)}
                  className="rounded text-[#7A1C29] focus:ring-[#7A1C29] h-4 w-4"
                />
                <span>Banner global superior</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailPush}
                  onChange={(e) => setEmailPush(e.target.checked)}
                  className="rounded text-[#7A1C29] focus:ring-[#7A1C29] h-4 w-4"
                />
                <span>Email push (@ufm.edu)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={studentInbox}
                  onChange={(e) => setStudentInbox(e.target.checked)}
                  className="rounded text-[#7A1C29] focus:ring-[#7A1C29] h-4 w-4"
                />
                <span>Buzón estudiantil</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2.5 bg-[#9B1B30] hover:bg-[#7A1C29] text-white font-bold text-sm rounded-md shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Megaphone className="w-4 h-4 text-[#F7F2E6] shrink-0" aria-hidden="true" />
              <span>Enviar Comunicado a Toda la Facultad</span>
            </button>
          </div>
        </form>
      </div>

      {/* REGISTRO DE COMUNICADOS ENVIADOS RECIENTEMENTE */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-6 shadow-2xs">
        <h3 className="text-sm font-serif font-bold text-[#111827] mb-4">
          Registro de Comunicados y Boletines Enviados Recientemente
        </h3>
        <div className="divide-y divide-[#E5E7EB] text-xs">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                      item.urgency === 'Urgente'
                        ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                        : item.urgency === 'Prioritario'
                        ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                        : 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]'
                    }`}
                  >
                    {item.urgency}
                  </span>
                  <p className="font-bold text-[#111827] font-serif text-sm">{item.title}</p>
                </div>
                <p className="text-[#4B5563]">{item.body}</p>
                <p className="text-[#6B7280] font-serif italic">
                  {item.publishedAt} por {item.author} · Alcance:{' '}
                  <span className="tabular-nums">{item.reachCount.toLocaleString('es-GT')}</span>{' '}
                  miembros
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onToggleAnnouncementStatus(item.id)}
                  className={`px-2.5 py-1 rounded font-medium border cursor-pointer whitespace-nowrap ${
                    item.activeOnPortal
                      ? 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]'
                      : 'text-[#6B7280] bg-[#F3F4F6] border-[#E5E7EB]'
                  }`}
                >
                  {item.activeOnPortal ? 'Activo en portal' : 'Archivado'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
