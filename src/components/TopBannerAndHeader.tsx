import React from 'react';
import {
  LogOut,
  Megaphone,
  X,
} from 'lucide-react';
import {
  InstitutionalAnnouncement,
  RoutePath,
  UserProfile,
} from '../types/academic';

interface TopBannerAndHeaderProps {
  currentRoute: RoutePath;
  currentUser: UserProfile;
  onNavigate: (route: RoutePath) => void;
  activeBannerAnnouncement?: InstitutionalAnnouncement;
  onDismissBanner: () => void;
  onSignOut?: () => void;
}

export const TopBannerAndHeader: React.FC<TopBannerAndHeaderProps> = ({
  currentRoute,
  currentUser,
  onNavigate,
  activeBannerAnnouncement,
  onDismissBanner,
  onSignOut,
}) => {

  return (
    <>
      {/* 1. Cintillo Filosófico Superior UFM */}
      <aside
        aria-label="Lema institucional y aviso de prototipo"
        className="bg-[#7A1C29] text-[#F7F2E6] text-[11px] sm:text-xs py-2 px-4 border-b border-[#C59B27]/30 tracking-wide"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif italic text-white/95">
              &ldquo;La enseñanza y difusión de los principios éticos, jurídicos y económicos de una sociedad de personas libres y responsables.&rdquo;
            </span>
            <span className="text-[#C59B27] font-sans font-semibold text-[10px] uppercase hidden lg:inline whitespace-nowrap shrink-0">
              — Misión UFM
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-[#F7F2E6]/90 font-medium shrink-0">
            <span className="hidden md:inline whitespace-nowrap">
              Manuel F. Ayau · Ludwig von Mises
            </span>
            <span className="bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded border border-[#B45309] text-[10px] uppercase font-bold tracking-wider whitespace-nowrap shrink-0">
              Propuesta Académica No Oficial
            </span>
          </div>
        </div>
      </aside>

      {/* 2. Barra de Navegación Principal */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Zone 1: Brand Crest & Title */}
            <button
              type="button"
              onClick={() => onNavigate('/login')}
              className="flex items-center gap-3 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A1C29] rounded-lg shrink-0 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-[#7A1C29] text-white flex flex-col items-center justify-center border border-[#C59B27] shrink-0">
                <span className="font-crest font-bold text-sm leading-none tracking-tight text-white">
                  UFM
                </span>
                <span className="text-[8px] tracking-widest text-[#C59B27] font-semibold mt-0.5">
                  1971
                </span>
              </div>
              <div className="whitespace-nowrap shrink-0">
                <span className="font-crest font-bold text-[#111827] tracking-wider text-sm sm:text-base block">
                  MIU REIMAGINED · UFM
                </span>
                <span className="text-[11px] text-[#6B7280] font-serif italic hidden sm:block">
                  Edición Académica · Prototipo Académico No Oficial
                </span>
              </div>
            </button>

            {/* Zone 2: Active Institutional Session Indicator & Logout */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right">
                <p className="text-xs font-semibold text-[#111827] leading-none whitespace-nowrap">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5 whitespace-nowrap">
                  {currentUser.email}
                </p>
              </div>

              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#7A1C29]/30 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FDF2F4] border border-[#7A1C29]/30 text-[#7A1C29] font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.initials}
                </div>
              )}

              {onSignOut && currentRoute !== '/login' && (
                <button
                  type="button"
                  id="btn-header-signout"
                  onClick={onSignOut}
                  title="Cerrar sesión institucional"
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#4B5563] hover:text-[#9B1B30] transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Salir</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Banner Global de Comunicados Académicos UFM (si está activo) */}
      {activeBannerAnnouncement && currentRoute !== '/login' && (
        <div
          role="region"
          aria-label="Boletín académico prioritario"
          className={`border-b px-4 py-2.5 text-xs transition-colors ${
            activeBannerAnnouncement.urgency === 'Urgente'
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              : activeBannerAnnouncement.urgency === 'Prioritario'
              ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <Megaphone className="w-4 h-4 shrink-0" aria-hidden="true" />
              <p className="truncate">
                <strong className="font-semibold uppercase tracking-wider mr-1.5">
                  [{activeBannerAnnouncement.urgency} · {activeBannerAnnouncement.category}]
                </strong>
                <span className="font-semibold">{activeBannerAnnouncement.title}:</span>{' '}
                <span>{activeBannerAnnouncement.body}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onDismissBanner}
              aria-label="Ocultar boletín global"
              className="p-1 rounded hover:bg-black/5 shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
