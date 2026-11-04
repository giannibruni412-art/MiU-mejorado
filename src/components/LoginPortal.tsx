import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { resolveRoleFromEmail, RoleResolutionResult } from '../utils/academicLogic';

interface LoginPortalProps {
  onCompleteSSO: (resolution: RoleResolutionResult) => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onCompleteSSO }) => {
  const [customEmail, setCustomEmail] = useState('camila.morales@estudiante.ufm.edu');
  const [feedbackState, setFeedbackState] = useState<{
    email: string;
    roleLabel: string;
    claimDescription: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const triggerSSOFlow = (emailToAuthenticate: string) => {
    const trimmed = emailToAuthenticate.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMessage('Ingresa un correo institucional válido (ej. usuario@ufm.edu).');
      return;
    }
    setErrorMessage(null);
    const resolution = resolveRoleFromEmail(trimmed);
    const roleLabel =
      resolution.role === 'student'
        ? 'Estudiante (/student/dashboard)'
        : resolution.role === 'faculty'
        ? 'Catedrático (/faculty/dashboard)'
        : 'Decanatura / Admin (/admin/dashboard)';

    setFeedbackState({
      email: trimmed,
      roleLabel,
      claimDescription: resolution.claimDescription,
    });

    onCompleteSSO(resolution);
  };

  const demoAccounts = [
    {
      email: 'camila.morales@estudiante.ufm.edu',
      name: 'Camila Morales',
      subtitle: 'Computer Science & Economía · 6to Semestre',
      initials: 'CM',
      roleBadge: 'Estudiante →',
      badgeColors: 'text-[#7A1C29] bg-[#FDF2F4] border-[#7A1C29]/25',
    },
    {
      email: 'r.valdes@ufm.edu',
      name: 'Dr. Roberto Valdés',
      subtitle: 'Catedrático Titular · Ciencias de la Computación',
      initials: 'RV',
      roleBadge: 'Catedrático →',
      badgeColors: 'text-[#92400E] bg-[#FFFBEB] border-[#FDE68A]',
    },
    {
      email: 'decanatura@ufm.edu',
      name: 'Decanatura de Ingeniería',
      subtitle: 'Gobierno Académico y Coordinación General',
      initials: 'DI',
      roleBadge: 'Decanatura →',
      badgeColors: 'text-[#1A2332] bg-[#F1F5F9] border-[#CBD5E1]',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4">
      <div className="grid grid-cols-1 md:grid-cols-12 bg-white rounded-lg border border-[#E5E7EB] shadow-xs overflow-hidden items-stretch">
        {/* Lado Izquierdo: Hero Editorial Filosófico Maroon */}
        <div className="md:col-span-5 bg-[#7A1C29] text-white p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="text-xs text-[#F7F2E6] font-medium tracking-wide">
              Tradición Liberal · Desde 1971
            </div>
            <h2 className="text-2xl font-serif font-bold mt-4 leading-snug text-white">
              Una Universidad para Formar Personas Libres y Responsables
            </h2>
            <p className="text-xs text-stone-200/90 mt-3 leading-relaxed">
              Riguroso compromiso con la libertad individual, el proceso económico, el estado de derecho y el método socrático en cada aula y laboratorio.
            </p>
          </div>

          {/* Cita Filosófica */}
          <blockquote className="my-6 p-4 rounded-lg bg-black/20 border border-[#C59B27]/40 text-xs italic font-serif">
            <p className="text-stone-100 leading-relaxed">
              &ldquo;El profesor no impone verdades acabadas; guía preguntas que despiertan el rigor deductivo y la libertad de pensamiento.&rdquo;
            </p>
            <footer className="mt-2 not-italic font-sans text-[11px] font-semibold text-[#F7F2E6] tracking-wide">
              — Método Socrático UFM · Espíritu Ludwig von Mises
            </footer>
          </blockquote>

          <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-stone-200">
            <span>Campus Central UFM</span>
            <span>Guatemala · Madrid · Online</span>
          </div>
        </div>

        {/* Lado Derecho: Portal de Acceso Google Workspace SSO */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded">
              <ShieldCheck className="w-4 h-4 text-[#059669] shrink-0" aria-hidden="true" />
              <span>Single Sign-On Institucional Activo (SAML 2.0 / Google OAuth)</span>
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#111827] mt-3">
              Portal de Acceso Institucional
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Autenticación federada mediante cuentas oficiales{' '}
              <strong className="text-[#111827]">@estudiante.ufm.edu</strong> y{' '}
              <strong className="text-[#111827]">@ufm.edu</strong>.
            </p>
          </div>

          {/* Input de correo institucional + CTA Principal Google Workspace */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerSSOFlow(customEmail);
            }}
            className="space-y-3"
          >
            <div>
              <label
                htmlFor="sso-email-input"
                className="block text-xs font-medium text-[#111827] mb-1"
              >
                Correo Institucional Google Workspace
              </label>
              <input
                id="sso-email-input"
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="nombre.apellido@estudiante.ufm.edu"
                className="w-full h-10 px-3.5 rounded bg-white border border-[#E5E7EB] text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
              />
              {errorMessage && (
                <p role="alert" className="text-xs text-[#DC2626] mt-1 font-medium">
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              id="btn-google-sso"
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-5 py-3 border border-[#7A1C29] bg-[#9B1B30] hover:bg-[#7A1C29] text-white rounded-md transition-colors shadow-2xs font-semibold text-sm cursor-pointer whitespace-nowrap"
            >
              <svg className="w-4 h-4 shrink-0 bg-white rounded-xs p-0.5" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  fill="#4285F4"
                />
                <path
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.31 7.32 24 12 24z"
                  fill="#34A853"
                />
                <path
                  d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.25 2.69 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google Workspace</span>
            </button>
          </form>

          {/* Cuadro Informativo de Resolución Automática de Rol */}
          <div className="my-5 p-3.5 rounded-lg bg-[#FDF2F4]/70 border border-[#7A1C29]/20 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-[#7A1C29] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-[#7A1C29]">
                Resolución Automática de Rol por Dominio y Claims
              </p>
              <p className="text-[#4B5563] mt-0.5 leading-relaxed">
                Al autenticar con Google OAuth, el callback inspecciona el dominio: cuentas{' '}
                <code className="font-mono text-[#7A1C29]">@estudiante.ufm.edu</code> redirigen a{' '}
                <code className="font-mono">/student/dashboard</code>; claustro{' '}
                <code className="font-mono text-[#7A1C29]">@ufm.edu</code> a{' '}
                <code className="font-mono">/faculty/dashboard</code>; y claims de decanatura a{' '}
                <code className="font-mono">/admin/dashboard</code>.
              </p>
            </div>
          </div>

          {feedbackState && (
            <div
              role="status"
              className="mb-4 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669]" aria-hidden="true" />
              <span>
                Autenticado <strong>{feedbackState.email}</strong> → Redirigiendo a{' '}
                <strong>{feedbackState.roleLabel}</strong>
              </span>
            </div>
          )}

          {/* Selector Rápido de Cuentas Demostrativas (Fallback / Demo Mode) */}
          <div className="pt-4 border-t border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#111827] tracking-tight">
                Cuentas Demostrativas (Cambio Rápido en 1 Clic)
              </span>
              <span className="text-[11px] text-[#6B7280]">Detección automática de rol</span>
            </div>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setCustomEmail(acc.email);
                    triggerSSOFlow(acc.email);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] hover:border-[#7A1C29] hover:bg-[#F9FAFB] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#FDF2F4] text-[#7A1C29] flex items-center justify-center font-bold text-xs border border-[#7A1C29]/20 shrink-0">
                      {acc.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#111827] group-hover:text-[#7A1C29] truncate">
                        {acc.email}
                      </p>
                      <p className="text-[11px] text-[#6B7280] truncate">{acc.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap shrink-0 flex items-center gap-1 ${acc.badgeColors}`}
                  >
                    <span>{acc.roleBadge}</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
