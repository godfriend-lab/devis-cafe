import { useEffect, useMemo, useRef, useState } from 'react';
import { Navbar } from '../landing/components/Navbar';
import { Footer } from '../landing/components/Footer';
import { ArrowRight, Mail, Plus, Search, SearchX } from 'lucide-react';

/* ─── TYPES ───────────────────────────────────────────── */

type QA = { question: string; answer: string };

type Category = {
  id: string;
  label: string;
  items: QA[];
};

/* ─── CONTENU ─────────────────────────────────────────── */
/**
 * Règle éditoriale : on décrit, on ne promet pas.
 * Les points qui dépendent des conditions en vigueur renvoient
 * aux conditions affichées lors de l'inscription.
 */

const categories: Category[] = [
  {
    id: 'comparaison',
    label: 'Devis Café vs Canva',
    items: [
      {
        question: 'Pourquoi choisir Devis Café plutôt que Canva pour mes devis ?',
        answer:
          'Canva est un outil de design polyvalent : vous partez d’un modèle et construisez la mise en page vous-même. Devis Café est conçu uniquement pour les devis : vous renseignez des champs en 6 étapes et le devis est créé à partir d’un modèle par défaut. Si les devis sont votre usage principal, un outil dédié évite beaucoup de manipulations. Pour d’autres besoins graphiques, un outil généraliste reste pertinent.',
      },
      {
        question: 'Quelle est la différence de prix ?',
        answer:
          'Devis Café coûte 10 000 XOF par an (soit 15,24 € ou environ 17,50 $ au taux indicatif) et donne accès à l’ensemble des modèles pendant 12 mois. Chez Canva, une partie des modèles est réservée aux offres payantes. Ses tarifs évoluant, consultez toujours la page tarifs officielle de Canva avant de comparer.',
      },
      {
        question: 'Retrouve-t-on chez vous les modèles payants de Canva ?',
        answer:
          'Non. Les modèles sont propres à chaque plateforme. Devis Café propose jusqu’à 1000 modèles de devis, accessibles avec l’abonnement annuel. Ils sont conçus pour les devis, pas pour reproduire le catalogue d’un autre service.',
      },
      {
        question: 'Combien d’étapes faut-il pour obtenir un devis ?',
        answer:
          'Chez Devis Café, le parcours compte 6 étapes de saisie : entreprise, client, prestations, taxes et remises, validité et conditions, puis création du devis. Pour Canva, le nombre d’étapes dépend de votre manière de travailler ; nous l’estimons à 8 ou plus pour un devis réalisé à partir d’un modèle, mais il s’agit d’une estimation, pas d’une mesure.',
      },
      {
        question: 'Puis-je utiliser Canva et Devis Café ensemble ?',
        answer:
          'Oui, rien ne vous en empêche. Beaucoup de professionnels utilisent un outil de design pour leurs visuels et un outil dédié pour leurs devis. Vous pouvez par exemple préparer votre logo ailleurs, puis l’importer dans Devis Café.',
      },
    ],
  },
  {
    id: 'tarifs',
    label: 'Tarifs et abonnement',
    items: [
      {
        question: 'Combien coûte Devis Café ?',
        answer:
          'L’abonnement est de 10 000 XOF pour 12 mois d’accès. Vous pouvez afficher le montant en XOF, en euros (15,24 €) ou en dollars (environ 17,50 $) sur la page des fonctionnalités.',
      },
      {
        question: 'Qu’est-ce qui est inclus dans l’abonnement annuel ?',
        answer:
          'L’abonnement donne accès à l’ensemble des modèles pendant 12 mois, à la personnalisation (couleurs, logo, signature, cachet), à l’export PDF et à la gestion de plusieurs devises. Le détail à jour est toujours celui affiché au moment de souscrire.',
      },
      {
        question: 'Le prix en euros et en dollars est-il fixe ?',
        answer:
          'L’euro est lié au franc CFA par une parité fixe (1 € = 655,957 XOF), donc l’équivalent en euros est stable. Le dollar fluctue : le montant affiché est indicatif et peut différer légèrement du taux du jour.',
      },
      {
        question: 'Quels moyens de paiement sont disponibles ?',
        answer:
          'Les moyens de paiement proposés s’affichent au moment de l’abonnement et peuvent évoluer dans le temps. Vérifiez l’écran de paiement pour connaître les options disponibles dans votre pays.',
      },
      {
        question: 'Y a-t-il un essai, un remboursement ou un renouvellement automatique ?',
        answer:
          'Ces conditions sont précisées lors de l’inscription et dans les conditions d’utilisation. Nous vous invitons à les lire avant de souscrire : ce sont elles qui font foi, pas une page d’aide.',
      },
    ],
  },
  {
    id: 'creation',
    label: 'Création et modèles',
    items: [
      {
        question: 'Comment fonctionne la création en 6 étapes ?',
        answer:
          'Vous renseignez successivement votre entreprise, votre client, vos prestations, les taxes et remises, puis la validité et les conditions. À la dernière étape, le devis est créé automatiquement.',
      },
      {
        question: 'Que se passe-t-il à la dernière étape ?',
        answer:
          'Le devis est généré avec le modèle par défaut. Vous pouvez ensuite le personnaliser ou choisir un autre modèle parmi ceux disponibles.',
      },
      {
        question: 'Que puis-je personnaliser ?',
        answer:
          'Les couleurs du devis, votre logo, votre signature et le cachet de votre entreprise. L’objectif est qu’un document porte votre identité sans que vous ayez à le dessiner.',
      },
      {
        question: 'Dois-je savoir utiliser un logiciel de design ?',
        answer:
          'Non, ce n’est pas nécessaire. Vous remplissez des champs ; la mise en page est gérée par le modèle choisi. Les réglages visuels se limitent à des choix guidés.',
      },
      {
        question: 'Dans quel format récupère-t-on les devis ?',
        answer:
          'Les devis s’exportent en PDF, que vous pouvez télécharger, imprimer ou envoyer à votre client.',
      },
    ],
  },
  {
    id: 'devises',
    label: 'Devises et calculs',
    items: [
      {
        question: 'Quelles devises sont prises en charge ?',
        answer:
          'Notamment le franc CFA (XOF), l’euro (EUR) et le dollar (USD). Vous choisissez la devise à l’étape de validité et de conditions.',
      },
      {
        question: 'Les totaux sont-ils calculés automatiquement ?',
        answer:
          'Oui : sous-totaux, taxes, remises et total sont calculés à partir des informations saisies. Le calcul dépend toutefois de ce que vous entrez : relisez toujours vos prix et quantités avant d’envoyer un devis à un client.',
      },
    ],
  },
  {
    id: 'donnees',
    label: 'Données et compte',
    items: [
      {
        question: 'Mes données sont-elles protégées ?',
        answer:
          'L’accès à votre compte est protégé par authentification. Aucun service en ligne ne peut garantir un risque nul : utilisez un mot de passe unique et robuste, et ne le partagez pas.',
      },
      {
        question: 'Puis-je récupérer mes devis ?',
        answer:
          'Chaque devis peut être téléchargé en PDF. Pour vos documents importants, conservez aussi une copie de votre côté.',
      },
      {
        question: 'Comment supprimer mon compte ?',
        answer:
          'Contactez-nous par email depuis l’adresse de votre compte. Les modalités de suppression et de conservation des données sont décrites dans les conditions d’utilisation.',
      },
    ],
  },
  {
    id: 'support',
    label: 'Contact',
    items: [
      {
        question: 'Comment vous contacter ?',
        answer:
          'Par email à support@deviscafe.app. Indiquez l’adresse de votre compte et décrivez votre question le plus précisément possible.',
      },
    ],
  },
];

const stats = [
  { value: '6', label: 'étapes de saisie' },
  { value: '1000', label: 'modèles maximum' },
  { value: '10 000', label: 'XOF par an' },
];

/* ─── UTILITAIRES ─────────────────────────────────────── */

const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const pad = (n: number): string => String(n).padStart(2, '0');

/* ─── ITEM D'ACCORDÉON ────────────────────────────────── */

type FAQItemProps = {
  id: string;
  index: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
};

function FAQItem({ id, index, question, answer, open, onToggle }: FAQItemProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur transition-all duration-300 ${
        open
          ? 'border-brand-500/50 bg-white/[0.06] shadow-[0_0_40px_-12px] shadow-brand-500/40'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      }`}
    >
      <span
        className={`absolute inset-y-0 left-0 w-0.5 bg-linear-to-b from-brand-400 to-violet-500 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-6"
      >
        <span className="mt-1 hidden font-mono text-xs tracking-widest text-brand-400/80 sm:block">
          Q.{pad(index + 1)}
        </span>
        <span className="flex-1 text-base font-semibold leading-snug text-white sm:text-lg">{question}</span>
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            open
              ? 'rotate-45 border-brand-400/60 bg-brand-500/20 text-brand-300'
              : 'border-white/15 text-slate-400 group-hover:text-white'
          }`}
        >
          <Plus size={16} />
        </span>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-6 text-slate-300 leading-relaxed sm:pl-[4.25rem] sm:pr-6">{answer}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── PAGE ────────────────────────────────────────────── */

export function FAQPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>('comparaison-0');
  const searchRef = useRef<HTMLInputElement>(null);

  // Raccourci clavier : "/" pour rechercher
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = normalize(query.trim());

  // Résultats de la recherche (toutes catégories) pour les compteurs
  const searched = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        items: c.items
          .map((item, i) => ({ ...item, id: `${c.id}-${i}`, index: i }))
          .filter((item) => !q || normalize(`${item.question} ${item.answer}`).includes(q)),
      })),
    [q],
  );

  const visible = searched.filter(
    (c) => c.items.length > 0 && (activeCategory === 'all' || activeCategory === c.id),
  );
  const totalVisible = visible.reduce((sum, c) => sum + c.items.length, 0);
  const totalAll = searched.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-14">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.07) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 75%)',
            maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 75%)',
          }}
        />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-130 w-225 -translate-x-1/2 rounded-full bg-linear-to-br from-brand-600/40 via-violet-600/30 to-transparent blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-slate-300 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Centre d’aide
          </span>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Des réponses{' '}
            <span className="bg-linear-to-r from-brand-400 via-violet-400 to-brand-300 bg-clip-text text-transparent">
              claires
            </span>
            , sans promesses en l’air.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 sm:text-xl">
            Prix, étapes, comparaison avec Canva : l’essentiel pour décider en connaissance de cause.
          </p>

          {/* Recherche */}
          <div className="relative mx-auto mt-10 max-w-2xl">
            <div className="absolute -inset-px rounded-2xl bg-linear-to-r from-brand-500/50 via-violet-500/40 to-brand-500/50 opacity-60 blur-sm" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/90 px-5 py-4 backdrop-blur">
              <Search size={20} className="shrink-0 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setQuery('');
                    e.currentTarget.blur();
                  }
                }}
                placeholder="Rechercher : prix, Canva, modèles, PDF…"
                aria-label="Rechercher dans la FAQ"
                className="w-full bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="shrink-0 rounded-md border border-white/15 px-2 py-0.5 font-mono text-xs text-slate-400 transition hover:text-white"
                >
                  Esc
                </button>
              ) : (
                <kbd className="hidden shrink-0 rounded-md border border-white/15 px-2 py-0.5 font-mono text-xs text-slate-500 sm:block">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Chiffres clés */}
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur">
            {stats.map((s) => (
              <div key={s.label} className="px-3 py-5">
                <div className="bg-linear-to-b from-white to-slate-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-widest text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
            {/* Navigation catégories */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="mb-3 hidden font-mono text-xs uppercase tracking-widest text-slate-500 lg:block">
                Catégories
              </p>
              <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    activeCategory === 'all'
                      ? 'border-brand-500/50 bg-brand-500/15 text-white'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>Toutes les questions</span>
                  <span className="font-mono text-xs text-slate-500">{pad(totalAll)}</span>
                </button>
                {searched.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={c.items.length === 0}
                    onClick={() => setActiveCategory(c.id)}
                    className={`flex shrink-0 items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${
                      activeCategory === c.id
                        ? 'border-brand-500/50 bg-brand-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-xs text-brand-400/80">{pad(i + 1)}</span>
                      <span className="whitespace-nowrap">{c.label}</span>
                    </span>
                    <span className="font-mono text-xs text-slate-500">{pad(c.items.length)}</span>
                  </button>
                ))}
              </nav>
            </aside>

            {/* Questions */}
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-widest text-slate-500" aria-live="polite">
                {totalVisible} {totalVisible > 1 ? 'résultats' : 'résultat'}
                {query ? ` pour « ${query.trim()} »` : ''}
              </p>

              {visible.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-400">
                    <SearchX size={26} />
                  </div>
                  <h3 className="text-lg font-bold">Aucun résultat</h3>
                  <p className="mt-2 max-w-sm text-slate-400">
                    Essayez un autre mot-clé, ou écrivez-nous : nous répondrons à votre question dès que possible.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      setActiveCategory('all');
                    }}
                    className="mt-6 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-brand-400 hover:text-white"
                  >
                    Réinitialiser la recherche
                  </button>
                </div>
              ) : (
                <div className="space-y-12">
                  {visible.map((c) => (
                    <div key={c.id}>
                      <h2 className="mb-5 flex items-center gap-3 text-xl font-bold sm:text-2xl">
                        <span className="h-px w-8 bg-linear-to-r from-brand-400 to-transparent" />
                        {c.label}
                      </h2>
                      <div className="space-y-3">
                        {c.items.map((item) => (
                          <FAQItem
                            key={item.id}
                            id={item.id}
                            index={item.index}
                            question={item.question}
                            answer={item.answer}
                            open={openId === item.id}
                            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-4xl border border-white/10 bg-linear-to-br from-slate-900 to-slate-950 px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Une question reste sans réponse ?</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
              Écrivez-nous en précisant l’adresse de votre compte. Nous vous répondrons dès que possible.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="mailto:support@deviscafe.app"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-100"
              >
                <Mail size={18} /> Nous écrire
              </a>
              <a
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:border-brand-400"
              >
                Créer un compte <ArrowRight size={18} />
              </a>
            </div>
            <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-slate-500">
              Les informations de cette page sont fournies à titre indicatif. Les conditions applicables sont celles
              affichées lors de l’inscription et dans les conditions d’utilisation. Canva est une marque appartenant à
              ses propriétaires ; ses offres et tarifs peuvent évoluer.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}