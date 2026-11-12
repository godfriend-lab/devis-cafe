import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Building2,
  Check,
  ChevronRight,
  Droplets,
  GraduationCap,
  Leaf,
  Lightbulb,
  MessageSquare,
  Monitor,
  Package,
  Ship,
  ShoppingBag,
  Users,
  Video,
  Wheat,
} from 'lucide-react';
import { AfricaMap } from '../../components/AfricaMap';

const FONT = { fontFamily: "'Plus Jakarta Sans','Inter','Segoe UI',system-ui,sans-serif" };

type Category = 'all' | 'tech' | 'services' | 'industry' | 'commerce';

interface Expertise {
  id: number;
  title: string;
  description: string;
  category: Exclude<Category, 'all'>;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  highlights: string[];
}

const expertises: Expertise[] = [
  {
    id: 1,
    title: 'Technologies numériques',
    description: "Outils digitaux de pointe pour la transformation numérique des entreprises. Développement d'applications web, mobiles et solutions cloud sur mesure.",
    category: 'tech',
    icon: Monitor,
    highlights: ['Applications web et mobiles', 'Infrastructure cloud', 'Transformation digitale', 'Intelligence artificielle'],
  },
  {
    id: 2,
    title: 'Technologies vertes',
    description: "Innovations écologiques pour réduire l'impact environnemental. Solutions énergétiques durables et technologies propres pour un avenir responsable.",
    category: 'tech',
    icon: Leaf,
    highlights: ['Énergies renouvelables', 'Solutions écologiques', 'Efficacité énergétique', 'Développement durable'],
  },
  {
    id: 3,
    title: 'Création et Innovation',
    description: 'Expertise en design, créativité et solutions innovantes. Nous transformons vos idées en produits et services à forte valeur ajoutée.',
    category: 'tech',
    icon: Lightbulb,
    highlights: ['Design thinking', 'Innovation produit', 'Recherche et développement', 'Prototypage rapide'],
  },
  {
    id: 4,
    title: "Fourniture d'équipements",
    description: "Solutions fiables et modernes adaptées aux besoins professionnels et particuliers. Équipements de qualité pour tous les secteurs d'activité.",
    category: 'commerce',
    icon: Package,
    highlights: ['Équipements professionnels', 'Matériel spécialisé', 'Installation et maintenance', 'Support technique'],
  },
  {
    id: 5,
    title: 'Commerce Général',
    description: 'Large gamme de produits et services pour répondre aux besoins quotidiens des entreprises et des particuliers.',
    category: 'commerce',
    icon: ShoppingBag,
    highlights: ['Distribution de produits', 'Approvisionnement', 'Gestion de stock', 'Logistique commerciale'],
  },
  {
    id: 6,
    title: 'Import-Export',
    description: "Solutions logistiques pour faciliter les échanges internationaux. Accompagnement complet dans les opérations de commerce international.",
    category: 'commerce',
    icon: Ship,
    highlights: ['Commerce international', 'Logistique globale', 'Dédouanement', 'Gestion des flux'],
  },
  {
    id: 7,
    title: 'Consultation en Communication',
    description: "Stratégies de communication percutantes pour optimiser l'image et les messages de votre entreprise.",
    category: 'services',
    icon: MessageSquare,
    highlights: ['Stratégie de marque', 'Communication digitale', 'Relations publiques', 'Conseil en image'],
  },
  {
    id: 8,
    title: 'Production audiovisuelle',
    description: 'Vidéos et contenus visuels de qualité professionnelle. De la conception à la post-production, nous donnons vie à vos projets.',
    category: 'services',
    icon: Video,
    highlights: ['Production vidéo', 'Contenu visuel', 'Post-production', 'Streaming'],
  },
  {
    id: 9,
    title: 'Formation et Éducation',
    description: 'Programmes pédagogiques adaptés aux défis actuels pour développer les compétences de vos équipes.',
    category: 'services',
    icon: GraduationCap,
    highlights: ['Formations professionnelles', 'E-learning', 'Coaching', 'Certifications'],
  },
  {
    id: 10,
    title: 'Représentation',
    description: 'Défense des intérêts et valorisation des marques auprès de partenaires stratégiques.',
    category: 'services',
    icon: Users,
    highlights: ['Représentation commerciale', 'Partenariats stratégiques', 'Négociation', 'Développement réseau'],
  },
  {
    id: 11,
    title: "Prestations liées à l'Hydraulique",
    description: "Solutions techniques pour une gestion optimale de l'eau et des infrastructures hydrauliques.",
    category: 'industry',
    icon: Droplets,
    highlights: ['Infrastructures hydrauliques', "Gestion de l'eau", 'Maintenance', 'Ingénierie'],
  },
  {
    id: 12,
    title: 'Construction et Immobilier',
    description: 'Accompagnement et réalisation de projets immobiliers avec expertise et fiabilité.',
    category: 'industry',
    icon: Building,
    highlights: ['Construction', 'Immobilier', 'Rénovation', 'Gestion de projet'],
  },
  {
    id: 13,
    title: 'Production et transformation agricole',
    description: 'Valorisation des produits agricoles avec des procédés modernes et durables.',
    category: 'industry',
    icon: Wheat,
    highlights: ['Agriculture moderne', 'Transformation', 'Valorisation', 'Durabilité'],
  },
];

const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'Tous les domaines' },
  { id: 'tech', label: 'Technologies' },
  { id: 'services', label: 'Services' },
  { id: 'industry', label: 'Industrie' },
  { id: 'commerce', label: 'Commerce' },
];

const categoryLabel: Record<Exclude<Category, 'all'>, string> = {
  tech: 'Technologies',
  services: 'Services',
  industry: 'Industrie',
  commerce: 'Commerce',
};

const etapes = [
  { title: 'Consultation', description: 'Nous analysons vos besoins et objectifs pour comprendre votre vision.' },
  { title: 'Conception', description: 'Nous concevons une solution sur mesure avec une architecture robuste.' },
  { title: 'Développement', description: "Notre équipe d'experts déploie votre solution selon les meilleures pratiques." },
  { title: 'Déploiement', description: 'Nous testons, déployons et lançons votre solution en production.' },
  { title: 'Support', description: 'Nous assurons la maintenance, les mises à jour et le support continu.' },
];

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2';
const focusRingDark =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black';

export function OurServices() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered = activeCategory === 'all' ? expertises : expertises.filter((e) => e.category === activeCategory);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased" style={FONT}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ───────────── Hero ───────────── */}
      <section className="relative overflow-hidden bg-[#05070B] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-32 -top-32 h-160 w-160 rounded-full bg-blue-600/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 h-128 w-lg rounded-full bg-blue-700/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-5">
            <button
              onClick={() => navigate('/')}
              className={`group mb-10 inline-flex items-center gap-2 rounded text-sm font-medium text-slate-400 transition hover:text-white ${focusRingDark}`}
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
              Retour à l'accueil
            </button>

            <p className="text-sm font-semibold text-blue-400">MATUNEQHYD SARL U</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              13 domaines d'expertise au service de votre croissance.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
              De la technologie à l'agriculture, en passant par l'immobilier et le commerce international,
              MATUNEQHYD déploie une gamme complète de services pour accompagner les entreprises et les particuliers,
              partout en Afrique.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#expertises"
                className={`inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 ${focusRingDark}`}
              >
                Explorer nos expertises
                <ChevronRight size={16} />
              </a>
              <button
                onClick={() => navigate('/contact')}
                className={`inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white hover:text-black ${focusRingDark}`}
              >
                Nous contacter
              </button>
            </div>

            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/15 pt-6">
              {[
                ['13', 'domaines'],
                ['54', 'pays africains'],
                ['5', "étapes d'accompagnement"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="text-3xl font-bold">{v}</dt>
                  <dd className="mt-1 text-sm leading-snug text-slate-400">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-7">
            <AfricaMap />
          </div>
        </div>
      </section>

      {/* ───────────── Expertises ───────────── */}
      <section id="expertises" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nos domaines d'expertise</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            MATUNEQHYD intervient sur 13 secteurs clés. Filtrez par catégorie pour découvrir nos compétences.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label="Filtrer les domaines">
          {categories.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={active}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${focusRing} ${
                  active ? 'bg-black text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exp) => {
            const Icon = exp.icon;
            return (
              <article
                key={exp.id}
                className="group rounded-2xl border border-slate-200 bg-white p-8 transition hover:border-blue-300 hover:shadow-xl hover:shadow-blue-600/10"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon size={24} />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {categoryLabel[exp.category]}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold tracking-tight">{exp.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{exp.description}</p>
                <ul className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <Check size={15} className="mt-0.5 shrink-0 text-blue-600" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* ───────────── Processus ───────────── */}
      <section id="methode" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-24 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Notre processus de travail</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">Une méthode éprouvée, en cinq étapes, pour garantir le succès de vos projets.</p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
          {etapes.map((step, i) => (
            <li key={step.title}>
              <div className="flex items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                {i < etapes.length - 1 && <span aria-hidden className="ml-3 hidden h-px flex-1 bg-slate-300 md:block" />}
              </div>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────────── Engagements ───────────── */}
      <section id="engagements" className="scroll-mt-8 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pourquoi choisir MATUNEQHYD ?</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">Expertise technique, compréhension du marché africain et standards internationaux.</p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Building2, title: 'Entreprise enregistrée', desc: 'MATUNEQHYD SARL U, RCCM TG-LFW-01-2023-B13-03106.' },
              { icon: Users, title: 'Portée mondiale', desc: 'Des produits utilisés dans le monde entier.' },
              { icon: Leaf, title: 'Engagement durable', desc: "Solutions responsables et respectueuses de l'environnement." },
              { icon: Check, title: 'Support dédié', desc: 'Une équipe réactive, à votre écoute.' },
            ].map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.title} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-5 font-bold">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────── Appel à l'action ───────────── */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 rounded-3xl bg-blue-600 px-8 py-14 text-white sm:px-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Prêt à transformer votre entreprise ?</h2>
            <p className="mt-4 text-lg leading-relaxed text-blue-100">Parlez-nous de votre projet : nous vous montrons comment l'atteindre.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <button
              onClick={() => navigate('/become-partner')}
              className="rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              Devenir partenaire
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="rounded-full border border-white/70 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
            >
              Nous contacter
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}