import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  ClipboardList,
  Coffee,
  Contact,
  Cpu,
  FileSignature,
  FileText,
  History,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Plug,
  Plus,
  QrCode,
  Receipt,
  Settings,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ========================================================================= */
/*  TYPES                                                                      */
/* ========================================================================= */

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  soon?: boolean; // fonctionnalité en cours de développement
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ========================================================================= */
/*  NAVIGATION                                                                 */
/*  Les pages existantes gardent leurs routes. Les nouvelles pointent vers     */
/*  /dashboard/coming-soon/:featureId (page « en cours de développement »).    */
/* ========================================================================= */

const soon = (id: string) => `/dashboard/coming-soon/${id}`;

const sections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { to: '/dashboard/quotes/new', icon: Plus, label: 'Créer un devis' },
      { to: '/dashboard/quotes', icon: History, label: 'Historique' },
    ],
  },
  {
    title: 'Intelligence artificielle',
    items: [{ to: soon('ai'), icon: Cpu, label: 'JOBOX AI', soon: true, badge: 'Bientôt' }],
  },
  {
    title: 'Gestion',
    items: [
      { to: soon('clients'), icon: Users, label: 'Mes clients', soon: true },
      { to: soon('crm'), icon: Contact, label: 'CRM', soon: true },
    ],
  },
  {
    title: 'Créateurs',
    items: [
      { to: soon('invoices'), icon: Receipt, label: 'Créateur de factures', soon: true },
      { to: soon('receipts'), icon: FileText, label: 'Créateur de reçus', soon: true },
      { to: soon('contracts'), icon: FileSignature, label: 'Créateur de contrats', soon: true },
      { to: soon('certificates'), icon: Award, label: 'Créateur de certificats', soon: true },
      { to: soon('forms'), icon: ClipboardList, label: 'Créateur de formulaires', soon: true },
      { to: soon('qr-codes'), icon: QrCode, label: 'Générateur de QR Codes', soon: true },
    ],
  },
  {
    title: 'Outils & extensions',
    items: [
      { to: soon('tools'), icon: Wrench, label: 'Tools', soon: true },
      { to: soon('integrations'), icon: Plug, label: 'Intégrations', soon: true },
    ],
  },
];

// Paramètres : toujours en dernière position
const settingsItem: NavItem = { to: '/dashboard/settings', icon: Settings, label: 'Paramètres' };

const allItems: NavItem[] = [...sections.flatMap((s) => s.items), settingsItem];

/* Un lien est actif sur sa route exacte ; « Historique » reste actif sur les
   sous-pages d'un devis, mais pas sur « Créer un devis ». */
function isActivePath(to: string, pathname: string) {
  if (to === '/dashboard/quotes') {
    return pathname.startsWith('/dashboard/quotes') && pathname !== '/dashboard/quotes/new';
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function pageTitle(pathname: string) {
  const exact = allItems.find((item) => item.to === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith('/dashboard/quotes')) return 'Devis';
  return 'Tableau de bord';
}

/* ========================================================================= */
/*  LOGO                                                                       */
/* ========================================================================= */

function LogoMark({ size = 'lg' }: { size?: 'sm' | 'lg' }) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 shadow-[0_0_24px_-4px_rgba(59,130,246,0.7),inset_0_1px_0_rgba(255,255,255,0.35)] ${
        size === 'lg' ? 'h-10 w-10 rounded-xl' : 'h-8 w-8 rounded-lg'
      }`}
    >
      <Coffee className="text-white" size={size === 'lg' ? 20 : 16} strokeWidth={2} />
    </div>
  );
}

/* ========================================================================= */
/*  COMPOSANT PRINCIPAL                                                        */
/* ========================================================================= */

export function DashboardLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur');
        setUserEmail(user.email || '');
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const initial = (userName || 'U').charAt(0).toUpperCase();

  const linkClass = (active: boolean, muted = false) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      active
        ? 'bg-gradient-to-r from-blue-600/25 to-blue-600/5 text-white ring-1 ring-inset ring-blue-400/25'
        : muted
          ? 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
          : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
    } ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`;

  return (
    <div className="dl-root flex min-h-screen bg-slate-50">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .dl-root { font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif; }
        .dl-mono { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; }

        .dl-grid {
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: linear-gradient(to bottom, #000, transparent 70%);
                  mask-image: linear-gradient(to bottom, #000, transparent 70%);
        }

        @keyframes dl-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.55); }
          70%  { box-shadow: 0 0 0 7px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
        .dl-pulse { animation: dl-pulse 2.2s ease-out infinite; }

        .dl-scroll::-webkit-scrollbar { width: 4px; }
        .dl-scroll::-webkit-scrollbar-track { background: transparent; }
        .dl-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }
        .dl-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

        @media (prefers-reduced-motion: reduce) { .dl-pulse { animation: none; } }
      `}</style>

      {/* Overlay mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ===================================================================== */}
      {/* SIDEBAR                                                                 */}
      {/* ===================================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden border-r border-white/[0.07] bg-[#07090f]
          transition-all duration-300 ease-in-out
          lg:sticky lg:top-0 lg:h-screen
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${sidebarCollapsed ? 'lg:w-[84px]' : 'lg:w-72'}
        `}
      >
        {/* Décor : grille + halo bleu */}
        <div aria-hidden="true" className="dl-grid pointer-events-none absolute inset-0" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/25 blur-[90px]"
        />

        {/* Logo */}
        <div className="relative flex items-center justify-between border-b border-white/[0.07] p-5">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="relative">
              <LogoMark />
              <span className="dl-pulse absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#07090f] bg-blue-400" />
            </div>
            <div className="leading-tight">
              <span className="block whitespace-nowrap text-[17px] font-semibold tracking-tight text-white">
                Devis Café
              </span>
              <span className="dl-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Espace pro</span>
            </div>
          </div>

          {sidebarCollapsed && (
            <div className="hidden w-full items-center justify-center lg:flex">
              <LogoMark />
            </div>
          )}

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="dl-scroll relative flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {sections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed ? (
                <h3 className="dl-mono mb-2.5 px-3 text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                  {section.title}
                </h3>
              ) : (
                <div className="mx-auto mb-3 hidden h-px w-6 bg-white/10 lg:block" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActivePath(item.to, pathname);
                  const isAI = item.label === 'JOBOX AI';

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={linkClass(active, item.soon)}
                    >
                      {active && (
                        <span className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
                      )}

                      {isAI ? (
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/30 bg-gradient-to-br from-blue-500/30 to-blue-900/30 text-blue-300 shadow-[0_0_18px_-6px_rgba(59,130,246,0.9)] ${
                            sidebarCollapsed ? '' : '-ml-1'
                          }`}
                        >
                          <item.icon size={16} strokeWidth={1.8} />
                        </span>
                      ) : (
                        <item.icon
                          size={18}
                          strokeWidth={1.7}
                          className={`shrink-0 transition-colors ${
                            active ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-200'
                          }`}
                        />
                      )}

                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 whitespace-nowrap">{item.label}</span>

                          {item.badge ? (
                            <span className="dl-mono rounded-md border border-blue-400/30 bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-blue-300">
                              {item.badge}
                            </span>
                          ) : item.soon ? (
                            <span className="dl-mono rounded-md border border-white/10 px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-slate-500">
                              Soon
                            </span>
                          ) : null}
                        </>
                      )}

                      {sidebarCollapsed && item.soon && (
                        <span className="absolute right-1.5 top-1.5 hidden h-1.5 w-1.5 rounded-full bg-blue-400/70 lg:block" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Paramètres : dernière position */}
        <div className="relative border-t border-white/[0.07] p-3">
          <NavLink
            to={settingsItem.to}
            onClick={() => setMobileMenuOpen(false)}
            title={sidebarCollapsed ? settingsItem.label : undefined}
            className={linkClass(isActivePath(settingsItem.to, pathname))}
          >
            <Settings
              size={18}
              strokeWidth={1.7}
              className={`shrink-0 ${isActivePath(settingsItem.to, pathname) ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-200'}`}
            />
            {!sidebarCollapsed && <span>{settingsItem.label}</span>}
          </NavLink>
        </div>

        {/* Utilisateur + déconnexion */}
        <div className="relative space-y-1 border-t border-white/[0.07] p-3">
          {!sidebarCollapsed && userName && (
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-700 text-sm font-bold text-white shadow-[0_0_16px_-4px_rgba(59,130,246,0.8)]">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{userName}</p>
                <p className="truncate text-[11px] text-slate-500">{userEmail}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Déconnexion' : undefined}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 ${
              sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''
            }`}
          >
            <LogOut size={18} strokeWidth={1.7} className="shrink-0" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* CONTENU PRINCIPAL                                                       */}
      {/* ===================================================================== */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileMenuOpen(true);
                } else {
                  setSidebarCollapsed(!sidebarCollapsed);
                }
              }}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              aria-label={sidebarCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <LogoMark size="sm" />
              <span className="font-semibold tracking-tight text-slate-900">Devis Café</span>
            </div>
          </div>

          {/* Titre de la page courante */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">{pageTitle(pathname)}</h1>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-800 text-xs font-bold text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.8)]">
            {initial}
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}