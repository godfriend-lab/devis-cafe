import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft, BadgeCheck, Briefcase, Download, FileText, Globe2,
  Landmark, LayoutTemplate, Palette, Search, Share2, Smartphone,
} from 'lucide-react';

/* ───────────────────────── Images (dossier public/images) ─────────────────────────
   Pour votre photo "high end" : déposez-la dans public/images/ sous le nom
   business.jpg (ou changez BUSINESS_IMAGE ci-dessous). Aucun fond n'est ajouté derrière. */
const IMG = '/images/';
const BUSINESS_IMAGE = `${IMG}business.jpg`;

const URL_PROKORB = 'https://www.prokorb.com';
const URL_DEVIS = 'https://www.devis-cafe.com';

/* ───────────────────────── Styles & animations ───────────────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap');
.eco{font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;background:#0e0c17;color:#fff}
@keyframes eco-spin{to{transform:rotate(360deg)}}
@keyframes eco-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes eco-glow{0%,100%{filter:drop-shadow(0 0 10px rgba(70,110,255,.35))}50%{filter:drop-shadow(0 0 28px rgba(120,150,255,.85))}}
.eco .eco-spin{animation:eco-spin var(--spin,20s) linear infinite;will-change:transform}
.eco .eco-float{animation:eco-float 6s ease-in-out infinite,eco-glow 4s ease-in-out infinite;will-change:transform}
@media (prefers-reduced-motion:reduce){.eco .eco-spin,.eco .eco-float{animation:none}}
`;

/* ───────────────────────── Données ───────────────────────── */
interface Item { icon: LucideIcon; title: string; text?: string }

const PILLARS = [
  { title: 'Technologies', src: 'crystal-tech.png', spin: 20 },
  { title: 'Business', src: 'crystal-business.png', spin: 26 },
  { title: 'Communauté', src: 'crystal-community.png', spin: 16 },
] as const;

const FOCUS: Item[] = [
  { icon: BadgeCheck, title: 'Professionnels vérifiés' },
  { icon: Landmark, title: "Qualification reconnue par l'État" },
  { icon: Search, title: 'Recherche par métier et ville' },
  { icon: LayoutTemplate, title: '24 modèles de devis' },
  { icon: Download, title: 'Export PDF, Word, Excel, Image' },
  { icon: Smartphone, title: 'Appli web installable (PWA)' },
];

const STEPS: Item[] = [
  { icon: Palette, title: 'Créer', text: 'Choisissez un modèle et remplissez votre devis.' },
  { icon: FileText, title: 'Exporter', text: 'PDF, Word, Excel, image ou EPUB en un clic.' },
  { icon: Share2, title: 'Envoyer', text: 'Partagez un devis net à vos clients.' },
];

/* ───────────────────────── Classes réutilisées ───────────────────────── */
const tile = 'rounded-3xl bg-[#2b2878] p-6';
const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0c17]';
const btn = `inline-flex items-center justify-center rounded-full px-7 py-4 text-sm font-medium transition hover:brightness-110 ${focus}`;

/* ───────────────────────── Briques ───────────────────────── */
/** Image sans aucun fond ni carte : seul le PNG transparent est affiché. */
function Robot({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <img
      src={IMG + src}
      alt={alt}
      draggable={false}
      className={`eco-float select-none object-contain object-bottom ${className}`}
    />
  );
}

function Crystal({ src, spin }: { src: string; spin: number }) {
  return (
    <img
      src={IMG + src}
      alt=""
      aria-hidden
      draggable={false}
      className="eco-spin h-56 w-56 select-none object-contain"
      style={{ ['--spin' as string]: `${spin}s` }}
    />
  );
}

/** Photo Business : masquée proprement si le fichier est absent. */
function BusinessPhoto() {
  return (
    <img
      src={BUSINESS_IMAGE}
      alt="ProKorb et Devis Café"
      loading="lazy"
      draggable={false}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
      className="h-full min-h-[320px] w-full rounded-3xl object-cover"
    />
  );
}

/* ───────────────────────── Page ───────────────────────── */
export function OurProjects() {
  const navigate = useNavigate();

  return (
    <div className="eco min-h-screen overflow-x-hidden">
      <style>{css}</style>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#14123a] to-[#0e0c17]">
        <div className="mx-auto grid max-w-7xl items-end gap-8 px-5 pt-14 lg:grid-cols-2 lg:pt-20">
          <div className="self-center pb-16">
            <button onClick={() => navigate('/')} className={`mb-10 inline-flex items-center gap-2 rounded text-sm text-slate-300 transition hover:text-white ${focus}`}>
              <ArrowLeft size={16} aria-hidden /> Retour à l'accueil
            </button>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Un écosystème pour trouver des professionnels fiables et créer des devis en Afrique.
            </h1>
            <a href="#business" className={`${btn} mt-14 bg-[#2f3fd9] text-white`}>Explorer ProKorb et Devis Café</a>
          </div>
          <Robot src="robot-hero.png" alt="Tête d'intelligence artificielle" className="mx-auto h-[420px] w-full max-w-lg lg:h-[580px]" />
        </div>
      </section>

      {/* Trois piliers */}
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 pt-10 md:grid-cols-3" aria-label="Piliers">
        {PILLARS.map((p) => (
          <div key={p.title} className="relative mt-24 h-80 rounded-3xl bg-[#15123f]">
            <div className="absolute -top-24 left-6"><Crystal src={p.src} spin={p.spin} /></div>
            <h2 className="absolute bottom-10 left-10 text-3xl font-bold sm:text-4xl">{p.title}</h2>
          </div>
        ))}
      </section>

      {/* Axes principaux */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-8 rounded-3xl bg-[#15123f] p-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="flex flex-col">
            <h2 className="text-3xl font-bold">Nos axes principaux :</h2>
            <div className="mt-6 flex flex-1 items-end justify-center">
              <Robot src="robot-focus.png" alt="Tête d'intelligence artificielle de profil" className="h-80 w-full lg:h-[420px]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {FOCUS.map(({ icon: Icon, title }) => (
              <div key={title} className={`${tile} flex min-h-[160px] flex-col justify-between`}>
                <Icon size={36} strokeWidth={1.4} aria-hidden />
                <p className="mt-6 text-sm">{title}</p>
              </div>
            ))}
            <div className={`${tile} col-span-2 sm:col-span-3`}>
              <Globe2 size={36} strokeWidth={1.4} aria-hidden />
              <p className="mt-4 text-sm leading-relaxed">
                Notre mission : rendre le travail des professionnels africains visible, vérifiable et simple à facturer, partout sur le continent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business */}
      <section id="business" className="mx-auto max-w-7xl scroll-mt-8 px-5 pb-20">
        <h2 className="mb-8 text-4xl font-bold">Business</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {[
                { name: 'ProKorb', href: URL_PROKORB, icon: Briefcase },
                { name: 'Devis Café', href: URL_DEVIS, icon: FileText },
              ].map(({ name, href, icon: Icon }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={`${tile} flex min-h-[240px] flex-col items-center justify-center gap-4 transition hover:brightness-110 ${focus}`}>
                  <Icon size={52} strokeWidth={1.3} aria-hidden />
                  <span className="text-sm">{name}</span>
                </a>
              ))}
            </div>
            <div className="rounded-3xl bg-[#15123f] p-8">
              <p className="text-sm leading-relaxed">
                ProKorb est le service le plus fiable d'Afrique pour trouver des professionnels vérifiés et qualifiés par l'État. Devis Café est l'alternative à Canva pour créer des devis professionnels, avec 24 modèles et des exports PDF, Word, Excel, image et EPUB.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href={URL_PROKORB} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#4a6cf7] text-white`}>Trouver un professionnel</a>
                <a href={URL_DEVIS} target="_blank" rel="noopener noreferrer" className={`${btn} bg-[#2f3fd9] text-white`}>Créer un devis</a>
              </div>
            </div>
          </div>
          <BusinessPhoto />
        </div>
      </section>

      {/* Devis Café */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-8 rounded-3xl bg-[#15123f] p-8 lg:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col">
            <h2 className="text-4xl font-bold">Devis Café</h2>
            <div className="mt-6 flex flex-1 items-end justify-center">
              <Robot src="robot-alpha.png" alt="Tête d'intelligence artificielle de face" className="h-96 w-full" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#2f3fd9] p-6 text-sm leading-relaxed">
              Devis Café, l'alternative à Canva pour les devis. Pas besoin de savoir dessiner : choisissez un modèle, ajoutez vos lignes et téléchargez un document prêt à envoyer.
            </div>
            <p className="text-sm">Trois étapes :</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }) => (
                <div key={title} className={`${tile} flex min-h-[220px] flex-col justify-between`}>
                  <Icon size={44} strokeWidth={1.3} aria-hidden />
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-xs leading-relaxed">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="flex flex-col gap-8 rounded-3xl bg-[#2f3fd9] p-10 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="max-w-2xl text-3xl font-bold">Votre prochain projet commence ici</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/contact')} className={`${btn} bg-white text-slate-900`}>Démarrer un projet</button>
            <button onClick={() => navigate('/become-partner')} className={`${btn} border border-white/60 text-white`}>Devenir partenaire</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default OurProjects;