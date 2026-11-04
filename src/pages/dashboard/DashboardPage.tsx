import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee, FileText, Settings, LogOut, Plus, LayoutDashboard, Users, ArrowUpRight,
  Banknote, CheckCircle2, Clock, Sparkles, Search, Bell,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* Adaptez ces routes à celles de votre application. */
const ROUTES = {
  quotes: '/dashboard/quotes',
  newQuote: '/dashboard/quotes/new',
  clients: '/dashboard/clients',
  settings: '/dashboard/settings',
};

type IconType = ComponentType<{ size?: number; className?: string }>;

const NAV: { label: string; icon: IconType; to?: string; soon?: boolean }[] = [
  { label: 'Tableau de bord', icon: LayoutDashboard },
  { label: 'Mes devis', icon: FileText, to: ROUTES.quotes },
  { label: 'Clients', icon: Users, to: ROUTES.clients, soon: true },
  { label: 'Paramètres', icon: Settings, to: ROUTES.settings },
];

const STATS: { label: string; value: string; hint: string; icon: IconType }[] = [
  { label: 'Devis créés', value: '0', hint: 'Ce mois-ci', icon: FileText },
  { label: 'Chiffre proposé', value: '0 FCFA', hint: 'Total des devis envoyés', icon: Banknote },
  { label: 'Devis acceptés', value: '0', hint: 'Signés par vos clients', icon: CheckCircle2 },
  { label: 'En attente', value: '0', hint: 'Réponse du client attendue', icon: Clock },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Bonne nuit';
  if (h < 18) return 'Bonjour';
  return 'Bonsoir';
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user || !active) return;

      const fullName = (user.user_metadata?.full_name as string | undefined) ?? '';
      setFirstName(fullName.trim().split(' ')[0] ?? '');

      const { data: member } = await supabase
        .from('organization_members')
        .select('organizations(name)')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      const org = (member as { organizations?: { name?: string } | { name?: string }[] } | null)?.organizations;
      const name = Array.isArray(org) ? org[0]?.name : org?.name;
      if (active && name) setOrgName(name);
    })();
    return () => { active = false; };
  }, []);

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const initials = (orgName || firstName || 'DC').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <style>{`
        @keyframes dc-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .dc-rise { animation: dc-rise .5s cubic-bezier(.2,.7,.2,1) both; }
        .dc-grid {
          background-image:
            linear-gradient(to right, rgba(15,23,42,.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,.04) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(ellipse at 80% 0%, #000 0%, transparent 65%);
          -webkit-mask-image: radial-gradient(ellipse at 80% 0%, #000 0%, transparent 65%);
        }
        @media (prefers-reduced-motion: reduce) { .dc-rise { animation: none; } }
      `}</style>

      {/* Sidebar */}
      <aside className="relative hidden w-72 shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-6 text-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />

        <div className="relative">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/30">
              <Coffee size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight">Devis Café</span>
          </div>

          <nav className="mt-10 space-y-1" aria-label="Navigation principale">
            {NAV.map(({ label, icon: Icon, to, soon }, i) => {
              const active = i === 0;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => to && !soon && navigate(to)}
                  disabled={soon}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? 'bg-white/10 text-white ring-1 ring-white/10'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                  {soon && (
                    <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                      Bientôt
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="relative space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-sm font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{orgName || 'Votre espace'}</p>
                <p className="truncate text-xs text-slate-400">{firstName || 'Compte propriétaire'}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu */}
      <div className="relative min-w-0 flex-1">
        <div className="pointer-events-none absolute inset-0 dc-grid" aria-hidden="true" />

        {/* Barre du haut */}
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600">
                <Coffee className="text-white" size={20} />
              </div>
              <span className="text-lg font-bold text-slate-900">Devis Café</span>
            </div>

            <div className="relative hidden max-w-md flex-1 lg:block">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Rechercher un devis, un client…"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <button type="button" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900">
                <Bell size={18} />
              </button>
              <button
                type="button"
                onClick={() => navigate(ROUTES.newQuote)}
                className="flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800"
              >
                <Plus size={16} /> <span className="hidden sm:inline">Nouveau devis</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Déconnexion"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900 lg:hidden"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
          {/* Bienvenue */}
          <section className="dc-rise">
            <p className="text-sm font-medium text-brand-600">{greeting()}{firstName ? `, ${firstName}` : ''}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Votre tableau de bord</h1>
            <p className="mt-2 max-w-xl text-slate-600">Suivez votre activité et créez vos devis en quelques minutes.</p>
          </section>

          {/* Statistiques */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistiques">
            {STATS.map(({ label, value, hint, icon: Icon }, i) => (
              <div
                key={label}
                className="dc-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03]"
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">{label}</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <Icon size={18} />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
                <p className="mt-1 text-xs text-slate-500">{hint}</p>
              </div>
            ))}
          </section>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Devis récents */}
            <section className="dc-rise rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.03] sm:p-8 lg:col-span-2" style={{ animationDelay: '320ms' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Devis récents</h2>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.quotes)}
                  className="flex items-center gap-1 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  Tout voir <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
                  <FileText size={26} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-slate-900">Aucun devis pour le moment</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-600">
                  Créez votre premier devis : il sera prêt à envoyer à votre client en quelques minutes.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.newQuote)}
                  className="mt-6 flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700"
                >
                  <Plus size={16} /> Créer mon premier devis
                </button>
              </div>
            </section>

            {/* Actions rapides */}
            <section className="dc-rise space-y-3" style={{ animationDelay: '380ms' }}>
              <h2 className="px-1 text-lg font-bold text-slate-900">Actions rapides</h2>

              {[
                { title: 'Nouveau devis', desc: 'Partez d’une page blanche.', icon: Plus, to: ROUTES.newQuote },
                { title: 'Mes devis', desc: 'Consultez votre historique.', icon: FileText, to: ROUTES.quotes },
                { title: 'Paramètres', desc: 'Logo, coordonnées, devise.', icon: Settings, to: ROUTES.settings },
              ].map(({ title, desc, icon: Icon, to }) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => navigate(to)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-900/[0.03] transition hover:border-brand-300 hover:shadow-md"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-brand-600 group-hover:text-white">
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{title}</span>
                    <span className="block truncate text-xs text-slate-500">{desc}</span>
                  </span>
                  <ArrowUpRight size={16} className="text-slate-300 transition group-hover:text-brand-600" />
                </button>
              ))}

              <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-5 text-white">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-600/30 blur-2xl" aria-hidden="true" />
                <Sparkles size={18} className="relative text-amber-400" />
                <p className="relative mt-3 text-sm font-semibold">Les modules Clients et Statistiques arrivent bientôt.</p>
                <p className="relative mt-1 text-xs text-slate-400">Vous serez prévenu dès leur disponibilité.</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}