import React from 'react';
import {
  LogIn,
  GraduationCap,
  BookOpenCheck,
  Building2,
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
}

export const TopBannerAndHeader: React.FC<TopBannerAndHeaderProps> = ({
  currentRoute,
  currentUser,
  onNavigate,
  activeBannerAnnouncement,
  onDismissBanner,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navTabs: {
    route: RoutePath;
    id: string;
    label: string;
    shortLabel: string;
    icon: React.ReactNode;
  }[] = [
    {
      route: '/login',
      id: 'tab-login',
      label: '1. Acceso SSO',
      shortLabel: '1. Acceso SSO',
      icon: <LogIn className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      route: '/student/dashboard',
      id: 'tab-student',
      label: '2. Estudiante',
      shortLabel: '2. Estudiante',
      icon: <GraduationCap className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      route: '/faculty/dashboard',
      id: 'tab-teacher',
      label: '3. Catedrático',
      shortLabel: '3. Catedrático',
      icon: <BookOpenCheck className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
    {
      route: '/admin/dashboard',
      id: 'tab-admin',
      label: '4. Decanatura',
      shortLabel: '4. Decanatura',
      icon: <Building2 className="w-4 h-4 shrink-0" aria-hidden="true" />,
    },
  ];

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

            {/* Zone 2: Desktop Interactive Role / Route Switcher Tabs */}
            <nav
              aria-label="Selector de vistas del prototipo"
              className="hidden md:flex bg-[#F3F4F6] p-1 rounded-lg items-center border border-[#E5E7EB] text-xs font-medium gap-1"
            >
              {navTabs.map((tab) => {
                const isActive = currentRoute === tab.route;
                return (
                  <button
                    key={tab.route}
                    id={tab.id}
                    type="button"
                    onClick={() => onNavigate(tab.route)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#7A1C29] font-semibold shadow-2xs border border-[#E5E7EB]'
                        : 'text-[#4B5563] hover:text-[#111827]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Active Institutional Session Indicator + Mobile Hamburger Button */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-[#111827] leading-none whitespace-nowrap">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-[#6B7280] mt-0.5 whitespace-nowrap">
                  {currentUser.email}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#FDF2F4] border border-[#7A1C29]/30 text-[#7A1C29] font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.initials}
              </div>
              <button
                type="button"
                aria-label="Alternar menú de navegación móvil"
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-md border border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible Mobile Hamburger Navigation */}
          {mobileMenuOpen && (
            <nav
              aria-label="Navegación móvil de roles"
              className="md:hidden py-3 border-t border-[#E5E7EB] grid grid-cols-2 gap-2"
            >
              {navTabs.map((tab) => {
                const isActive = currentRoute === tab.route;
                return (
                  <button
                    key={tab.route}
                    type="button"
                    onClick={() => {
                      onNavigate(tab.route);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-[#FDF2F4] text-[#7A1C29] font-semibold border border-[#7A1C29]/25'
                        : 'bg-[#F9FAFB] text-[#4B5563] border border-[#E5E7EB]'
                    }`}
                  >
                    {tab.icon}
                    <span className="truncate">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* 3. Banner Global de Comunicados Oficiales de Decanatura (si está activo) */}
      {activeBannerAnnouncement && currentRoute !== '/login' && (
        <div
          role="region"
          aria-label="Boletín institucional prioritario"
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
