import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee, FileText, Settings, LogOut, Plus, ArrowUpRight,
  Banknote, CheckCircle2, Clock, Sparkles, Search, Bell,
  Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* Routes de l'application */
const ROUTES = {
  quotes: '/dashboard/quotes',
  newQuote: '/dashboard/quotes/new',
  settings: '/dashboard/settings',
  ai: '/dashboard/coming-soon/ai',
};

type IconType = ComponentType<{ size?: number; className?: string }>;

interface StatItem {
  label: string;
  value: string;
  hint: string;
  icon: IconType;
  color: string;
}

const STATS: StatItem[] = [
  { label: 'Devis créés', value: '0', hint: 'Ce mois-ci', icon: FileText, color: 'bg-brand-50 text-brand-600' },
  { label: 'Chiffre proposé', value: '0 FCFA', hint: 'Total des devis envoyés', icon: Banknote, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Devis acceptés', value: '0', hint: 'Signés par vos clients', icon: CheckCircle2, color: 'bg-blue-50 text-blue-600' },
  { label: 'En attente', value: '0', hint: 'Réponse du client attendue', icon: Clock, color: 'bg-amber-50 text-amber-600' },
];

interface QuickAction {
  title: string;
  desc: string;
  icon: IconType;
  to: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Nouveau devis', desc: 'Partez d\'une page blanche.', icon: Plus, to: ROUTES.newQuote },
  { title: 'Mes devis', desc: 'Consultez votre historique.', icon: FileText, to: ROUTES.quotes },
  { title: 'Paramètres', desc: 'Logo, coordonnées, devise.', icon: Settings, to: ROUTES.settings },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30">
      <style>{`
        @keyframes dc-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .dc-rise { animation: dc-rise .5s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) { .dc-rise { animation: none; } }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Coffee className="text-white" size={22} />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900 block leading-tight">Devis Café</span>
              <span className="text-[10px] text-slate-500">Espace professionnel</span>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative hidden max-w-md flex-1 lg:block">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Rechercher un devis, un client…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900 hover:border-slate-300">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full" />
            </button>

            <button
              type="button"
              onClick={() => navigate(ROUTES.newQuote)}
              className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 px-4 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Nouveau devis</span>
            </button>

            {/* Avatar utilisateur */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700">{firstName || 'Utilisateur'}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              aria-label="Déconnexion"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:text-red-600 hover:border-red-200 hover:bg-red-50"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Section Bienvenue */}
        <section className="dc-rise">
          <p className="text-sm font-medium text-brand-600">{greeting()}{firstName ? `, ${firstName}` : ''} 👋</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Votre tableau de bord</h1>
          <p className="mt-2 max-w-xl text-slate-600">Suivez votre activité et créez vos devis en quelques minutes.</p>
        </section>

        {/* Statistiques */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Statistiques">
          {STATS.map(({ label, value, hint, icon: Icon, color }, i) => (
            <div
              key={label}
              className="dc-rise rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.03] hover:shadow-md hover:border-slate-300 transition"
              style={{ animationDelay: `${80 + i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
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
                className="mt-6 flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:-translate-y-0.5"
              >
                <Plus size={16} /> Créer mon premier devis
              </button>
            </div>
          </section>

          {/* Actions rapides */}
          <section className="dc-rise space-y-3" style={{ animationDelay: '380ms' }}>
            <h2 className="px-1 text-lg font-bold text-slate-900">Actions rapides</h2>

            {QUICK_ACTIONS.map(({ title, desc, icon: Icon, to }) => (
              <button
                key={title}
                type="button"
                onClick={() => navigate(to)}
                className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm shadow-slate-900/[0.03] transition hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5"
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

            {/* Carte DEVIS AI */}
            <button
              type="button"
              onClick={() => navigate(ROUTES.ai)}
              className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-5 text-left text-white shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-amber-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full">Nouveau</span>
                </div>
                <p className="text-sm font-semibold">DEVIS AI</p>
                <p className="text-xs text-white/80 mt-1">L&apos;IA rédige vos devis automatiquement</p>
              </div>
            </button>
          </section>
        </div>

        {/* Section DEVIS AI - Grande carte */}
        <section className="dc-rise" style={{ animationDelay: '440ms' }}>
          <button
            type="button"
            onClick={() => navigate(ROUTES.ai)}
            className="group relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 p-8 sm:p-10 text-left text-white shadow-2xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold">NOUVEAU</span>
                    <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold">Intelligence Artificielle</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">DEVIS AI</h3>
                </div>
              </div>
              <ArrowUpRight size={28} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
            </div>

            <p className="relative mt-6 text-lg text-white/90 max-w-2xl">
              Laissez l&apos;intelligence artificielle rédiger vos devis automatiquement. Décrivez votre prestation en quelques mots, et notre IA génère un devis professionnel complet.
            </p>

            <div className="relative flex flex-wrap gap-2 mt-6">
              {['Rédaction automatique', 'Suggestions intelligentes', 'Optimisation des prix'].map((tag) => (
                <span key={tag} className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm text-sm font-medium border border-white/20">
                  {tag}
                </span>
              ))}
            </div>

            <div className="relative mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-700 font-semibold group-hover:bg-purple-50 transition">
              <Zap size={16} />
              Découvrir DEVIS AI
            </div>
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Coffee size={16} className="text-brand-600" />
              <span>© 2026 Devis Café. Tous droits réservés.</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-brand-600 transition">Support</a>
              <a href="#" className="hover:text-brand-600 transition">Documentation</a>
              <a href="#" className="hover:text-brand-600 transition">Contact</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}