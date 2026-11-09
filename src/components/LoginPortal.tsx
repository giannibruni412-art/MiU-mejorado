import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Info, Loader2, ShieldAlert, Lock, AlertCircle } from 'lucide-react';
import {
  checkEmailAuthorization,
  resolveRoleFromEmail,
  RoleResolutionResult,
  AUTHORIZED_STUDENT_EMAILS,
} from '../utils/academicLogic';
import { googleSignIn } from '../utils/googleAuth';

interface LoginPortalProps {
  onCompleteSSO: (resolution: RoleResolutionResult) => void;
  externalNotice?: string | null;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({ onCompleteSSO, externalNotice }) => {
  const [customEmail, setCustomEmail] = useState('ofernando@ufm.edu');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [unauthorizedEmailState, setUnauthorizedEmailState] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<{
    email: string;
    roleLabel: string;
    claimDescription: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRealGoogleSignIn = async () => {
    setIsLoadingGoogle(true);
    setErrorMessage(null);
    setUnauthorizedEmailState(null);
    try {
      const result = await googleSignIn();
      setFeedbackState({
        email: result.userProfile.email,
        roleLabel: 'Portal Estudiantil (/student/dashboard)',
        claimDescription: 'Sesión Google Workspace verificada exitosamente · Alumno Autorizado',
      });
      onCompleteSSO(result.resolution);
    } catch (err: any) {
      console.error('Error during Google sign-in:', err);
      if (err?.code === 'auth/unauthorized-account') {
        const attemptedEmail = err.unauthorizedEmail || 'la cuenta seleccionada';
        setUnauthorizedEmailState(attemptedEmail);
        setErrorMessage(
          `Acceso No Autorizado: '${attemptedEmail}' no figura en el padrón de alumnos matriculados para este ciclo académico. Cuentas autorizadas: ${AUTHORIZED_STUDENT_EMAILS.join(', ')}.`
        );
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('La ventana de Google se cerró antes de completar la autenticación. Intenta nuevamente.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setErrorMessage('Solicitud cancelada por apertura múltiple.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('El navegador bloqueó la ventana emergente de Google. Por favor permite popups para este sitio.');
      } else {
        setErrorMessage(
          err?.message || 'Ocurrió un error al conectar con Google Workspace. Verifica tu conexión.'
        );
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const triggerSSOFlow = (emailToAuthenticate: string) => {
    const trimmed = emailToAuthenticate.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMessage('Ingresa un correo institucional válido (ej. ofernando@ufm.edu).');
      return;
    }

    // Strict Authorization Check: Only authorized emails can proceed
    const authCheck = checkEmailAuthorization(trimmed);
    if (!authCheck.isAuthorized) {
      setUnauthorizedEmailState(trimmed);
      setErrorMessage(
        authCheck.reason ||
          `Acceso No Autorizado (403): La cuenta '${trimmed}' no está matriculada en este ciclo académico.`
      );
      return;
    }

    setErrorMessage(null);
    setUnauthorizedEmailState(null);
    const resolution = resolveRoleFromEmail(trimmed);
    const roleLabel = 'Portal Estudiantil (/student/dashboard)';

    setFeedbackState({
      email: trimmed,
      roleLabel,
      claimDescription: resolution.claimDescription,
    });

    onCompleteSSO(resolution);
  };

  const demoAccounts = [
    {
      email: 'giannibruni412@gmail.com',
      name: 'Gianni Bruni',
      subtitle: 'Computer Science & Economía · Alumno Autorizado',
      initials: 'GB',
      roleBadge: 'Cuenta Autorizada →',
      badgeColors: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      authorized: true,
    },
    {
      email: 'ofernando@ufm.edu',
      name: 'Fernando O.',
      subtitle: 'Facultad de Ciencias Económicas · Alumno Autorizado',
      initials: 'FO',
      roleBadge: 'Cuenta Autorizada UFM →',
      badgeColors: 'text-[#065F46] bg-[#ECFDF5] border-[#A7F3D0]',
      authorized: true,
    },
    {
      email: 'camila.morales@estudiante.ufm.edu',
      name: 'Camila Morales',
      subtitle: 'Computer Science & Economía · Alumna Registrada',
      initials: 'CM',
      roleBadge: 'Cuenta Registrada →',
      badgeColors: 'text-[#7A1C29] bg-[#FDF2F4] border-[#7A1C29]/25',
      authorized: true,
    },
    {
      email: 'usuario.no.autorizado@gmail.com',
      name: 'Usuario Externo',
      subtitle: 'Sin matrícula activa en claustro',
      initials: 'UX',
      roleBadge: 'Prueba Bloqueo 403 ✕',
      badgeColors: 'text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]',
      authorized: false,
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

          {/* External Access Restriction Notice */}
          {externalNotice && !unauthorizedEmailState && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-md bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-start gap-2.5"
            >
              <Lock className="w-4 h-4 text-[#B91C1C] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold">Acceso Restringido al Portal Estudiantil</p>
                <p className="mt-0.5 text-stone-700">{externalNotice}</p>
              </div>
            </div>
          )}

          {/* Unauthorized Email Alert (403 Forbidden) */}
          {unauthorizedEmailState ? (
            <div
              role="alert"
              id="alert-unauthorized-access"
              className="mb-5 p-4 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/40 shadow-xs text-xs text-[#7F1D1D]"
            >
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-sm text-[#991B1B] font-serif">
                      Acceso No Autorizado (Código 403 · Matrícula No Encontrada)
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#FEE2E2] text-[#991B1B] rounded border border-[#F87171]">
                      Bloqueado
                    </span>
                  </div>
                  <p className="leading-relaxed">
                    La cuenta <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#FECACA]">{unauthorizedEmailState}</strong> no figura en el padrón de alumnos autorizados para el ciclo académico vigente.
                  </p>
                  <p className="text-[11px] text-[#991B1B]/90">
                    Cuentas con acceso autorizado: <strong className="font-mono font-bold text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">giannibruni412@gmail.com</strong>, <strong className="font-mono font-bold text-[#065F46] bg-[#ECFDF5] px-1.5 py-0.5 rounded border border-[#A7F3D0]">ofernando@ufm.edu</strong>
                  </p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUnauthorizedEmailState(null);
                        setErrorMessage(null);
                        setCustomEmail('ofernando@ufm.edu');
                      }}
                      className="text-xs font-semibold underline text-[#991B1B] hover:text-[#7F1D1D] cursor-pointer"
                    >
                      Restablecer a cuenta autorizada (ofernando@ufm.edu)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : errorMessage ? (
            <div
              role="alert"
              className="mb-4 p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2"
            >
              <Info className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="font-semibold">Atención al autenticar</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          ) : null}

          {/* Botón Principal: Inicio de Sesión Real con Google Workspace */}
          <div className="space-y-4">
            <button
              id="btn-google-sso"
              type="button"
              disabled={isLoadingGoogle}
              onClick={handleRealGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 border border-[#7A1C29] bg-[#9B1B30] hover:bg-[#7A1C29] active:bg-[#60121C] text-white rounded-md transition-all shadow-sm hover:shadow-md font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-wait"
            >
              {isLoadingGoogle ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" aria-hidden="true" />
                  <span>Conectando con Google Workspace...</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-xs bg-white flex items-center justify-center p-0.5 shrink-0 shadow-2xs">
                    <svg className="w-full h-full" viewBox="0 0 24 24" aria-hidden="true">
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
                  </div>
                  <span>Continuar con Google Workspace</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-mono font-normal">
                    OAuth 2.0
                  </span>
                </>
              )}
            </button>

            {/* Separador de opciones */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-[#E5E7EB] w-full" />
              <span className="bg-white px-3 text-[11px] text-[#6B7280] uppercase tracking-wider font-medium shrink-0">
                o verificar cuenta autorizada
              </span>
              <div className="border-t border-[#E5E7EB] w-full" />
            </div>

            {/* Input secundario para testing / demo */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerSSOFlow(customEmail);
              }}
              className="space-y-2"
            >
              <div className="flex gap-2">
                <input
                  id="sso-email-input"
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="ofernando@ufm.edu"
                  className="flex-1 h-9 px-3 rounded bg-white border border-[#E5E7EB] text-xs text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:border-[#9B1B30] focus:ring-1 focus:ring-[#9B1B30]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded bg-[#9B1B30] hover:bg-[#7A1C29] text-white text-xs font-semibold cursor-pointer border border-[#7A1C29] whitespace-nowrap shadow-2xs"
                >
                  Verificar Acceso
                </button>
              </div>
            </form>
          </div>

          {/* Cuadro Informativo de Autenticación Institucional & Padrón */}
          <div className="my-5 p-3.5 rounded-lg bg-[#FDF2F4]/70 border border-[#7A1C29]/20 flex items-start gap-3 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#7A1C29] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-[#7A1C29] flex items-center gap-1.5 flex-wrap">
                <span>Padrón de Acceso Estudiantil UFM</span>
                <span className="text-[10px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-1.5 py-0.2 rounded font-mono font-bold">
                  giannibruni412@gmail.com
                </span>
                <span className="text-[10px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-1.5 py-0.2 rounded font-mono font-bold">
                  ofernando@ufm.edu
                </span>
              </p>
              <p className="text-[#4B5563] mt-0.5 leading-relaxed">
                Por políticas de claustro, el acceso al portal está estrictamente restringido a alumnos matriculados. Las cuentas <code className="font-mono text-[#7A1C29] font-bold">giannibruni412@gmail.com</code> y <code className="font-mono text-[#7A1C29] font-bold">ofernando@ufm.edu</code> están debidamente autorizadas con acceso pleno a cátedras, horarios y entregas con certeza inmutable mediante sellos SHA-256.
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
