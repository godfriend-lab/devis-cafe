import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BellRing,
  Briefcase,
  CalendarDays,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  Contact,
  Cpu,
  Download,
  FileCheck2,
  FileSignature,
  FileText,
  History,
  Inbox,
  Layers,
  LayoutTemplate,
  Link2,
  ListChecks,
  MousePointerClick,
  Palette,
  Pencil,
  PenTool,
  Percent,
  Plug,
  Printer,
  QrCode,
  Receipt,
  RefreshCw,
  Repeat,
  Ruler,
  Search,
  Share2,
  Sparkles,
  Stamp,
  Target,
  TrendingUp,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Utilitaires visuels                                                */
/* ------------------------------------------------------------------ */

const tint = (accent: string, pct: number) => `color-mix(in srgb, ${accent} ${pct}%, white)`;

function Bar({ w = '100%', c = '#e2e8f0', h = 8 }: { w?: string; c?: string; h?: number }) {
  return <div className="shrink-0 rounded-full" style={{ width: w, height: h, background: c }} />;
}

function Pill({ children, accent }: { children: ReactNode; accent: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ background: tint(accent, 14), color: accent }}
    >
      {children}
    </span>
  );
}

function Sheet({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-4 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Aperçus du concept — un par fonctionnalité                         */
/* ------------------------------------------------------------------ */

type PreviewProps = { a: string };

function PreviewAI({ a }: PreviewProps) {
  return (
    <div className="space-y-3">
      <Sheet>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Sparkles size={14} style={{ color: a }} aria-hidden="true" />
          Votre description
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">
          Rénovation d’une salle de bain de 8 m² : dépose, plomberie, carrelage sol et murs.
        </p>
      </Sheet>
      <Sheet>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">Devis proposé</span>
          <Pill accent={a}>Brouillon</Pill>
        </div>
        <ul className="mt-3 space-y-2.5">
          {['Dépose et évacuation', 'Plomberie sanitaire', 'Carrelage sol et murs', 'Joints et finitions'].map((l) => (
            <li key={l} className="flex items-center justify-between gap-3 text-[13px] text-slate-700">
              <span className="flex items-center gap-2">
                <Check size={13} style={{ color: a }} strokeWidth={3} aria-hidden="true" />
                {l}
              </span>
              <Bar w="44px" h={7} />
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}

function PreviewClients({ a }: PreviewProps) {
  const rows = [
    { n: 'Kofi Agbodjan', i: 'KA', d: '4 devis', s: 'Accepté' },
    { n: 'Ama Lawson', i: 'AL', d: '2 devis', s: 'En attente' },
    { n: 'Studio Adjovi', i: 'SA', d: '7 devis', s: 'Accepté' },
  ];
  return (
    <Sheet className="space-y-1 p-3!">
      <div className="mb-2 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-400">
        <Search size={13} aria-hidden="true" />
        Rechercher un client
      </div>
      {rows.map((r) => (
        <div key={r.n} className="flex items-center gap-3 rounded-lg px-2 py-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: tint(a, 16), color: a }}
          >
            {r.i}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{r.n}</p>
            <p className="text-xs text-slate-500">{r.d}</p>
          </div>
          <Pill accent={r.s === 'Accepté' ? a : '#64748b'}>{r.s}</Pill>
        </div>
      ))}
    </Sheet>
  );
}

function PreviewCRM({ a }: PreviewProps) {
  const cols = [
    { t: 'Prospects', n: 2 },
    { t: 'Devis envoyé', n: 2 },
    { t: 'Gagné', n: 1 },
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {cols.map((c, idx) => (
        <div key={c.t} className="rounded-xl bg-white/10 p-2 ring-1 ring-white/10">
          <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold text-slate-200">
            {c.t}
            <span className="rounded-full bg-white/15 px-1.5 text-[10px]">{c.n}</span>
          </div>
          <div className="space-y-2">
            {Array.from({ length: c.n }).map((_, i) => (
              <div key={i} className="rounded-lg bg-white p-2.5 shadow-md">
                <Bar w="70%" c="#cbd5e1" h={7} />
                <div className="mt-2">
                  <Bar w="45%" h={6} />
                </div>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: a, opacity: 0.4 + idx * 0.3 }} />
                  {idx === 1 && i === 0 ? <BellRing size={11} style={{ color: a }} aria-hidden="true" /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PreviewInvoices({ a }: PreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-3 text-xs font-medium text-slate-300">
        <span className="rounded-lg bg-white/10 px-3 py-1.5 ring-1 ring-white/15">Devis accepté</span>
        <ArrowRight size={15} style={{ color: a }} aria-hidden="true" />
        <span className="rounded-lg px-3 py-1.5 font-semibold text-white" style={{ background: a }}>
          Facture
        </span>
      </div>
      <Sheet>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-semibold text-slate-900">Facture</p>
            <p className="text-xs text-slate-500">Reprise du devis</p>
          </div>
          <Pill accent={a}>Prête à envoyer</Pill>
        </div>
        <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Bar w={`${58 - i * 9}%`} c="#cbd5e1" />
              <Bar w="42px" />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: tint(a, 10) }}>
          <span className="text-xs font-semibold" style={{ color: a }}>
            Total
          </span>
          <Bar w="64px" c={tint(a, 55)} h={10} />
        </div>
      </Sheet>
    </div>
  );
}

function PreviewReceipts({ a }: PreviewProps) {
  return (
    <div className="relative mx-auto max-w-68">
      <Sheet className="rounded-b-sm!">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Reçu de paiement</p>
          <span className="h-7 w-7 rounded-lg" style={{ background: tint(a, 20) }} aria-hidden="true" />
        </div>
        <div className="mt-4 space-y-2.5 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            Reçu de <Bar w="90px" c="#cbd5e1" />
          </div>
          <div className="flex items-center justify-between">
            Pour <Bar w="120px" />
          </div>
        </div>
        <div className="mt-5 border-y border-dashed border-slate-200 py-4 text-center">
          <p className="text-[11px] text-slate-400">Montant reçu</p>
          <div className="mt-2 flex justify-center">
            <Bar w="110px" c={tint(a, 45)} h={14} />
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <Bar w="70px" />
          <span
            className="flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-2 text-[10px] font-extrabold"
            style={{ borderColor: a, color: a }}
          >
            PAYÉ
          </span>
        </div>
      </Sheet>
      <div
        aria-hidden="true"
        className="h-2.5 w-full"
        style={{
          background: 'linear-gradient(135deg, #fff 50%, transparent 50%) 0 0/10px 10px, linear-gradient(225deg, #fff 50%, transparent 50%) 0 0/10px 10px',
        }}
      />
    </div>
  );
}

function PreviewContracts({ a }: PreviewProps) {
  return (
    <Sheet>
      <p className="text-sm font-semibold text-slate-900">Contrat de prestation</p>
      <div className="mt-3 space-y-2">
        <Bar w="92%" />
        <Bar w="78%" />
      </div>
      <div
        className="mt-3 rounded-lg border p-3"
        style={{ borderColor: tint(a, 50), background: tint(a, 7) }}
      >
        <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: a }}>
          Article 3 · Modalités de paiement
          <Pencil size={12} aria-hidden="true" />
        </div>
        <div className="mt-2 space-y-1.5">
          <Bar w="95%" c={tint(a, 30)} h={6} />
          <Bar w="60%" c={tint(a, 30)} h={6} />
        </div>
      </div>
      <div className="mt-3 space-y-2">
        <Bar w="85%" />
      </div>
      <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-3">
        <svg width="96" height="34" viewBox="0 0 96 34" fill="none" aria-hidden="true">
          <path
            d="M4 24c8-18 12-20 14-12s-6 16 2 14 10-18 16-14-4 14 4 12 10-10 14-8 4 8 12 4 12-8 16-6"
            stroke={a}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed"
          style={{ borderColor: a, color: a }}
        >
          <Stamp size={18} aria-hidden="true" />
        </span>
      </div>
    </Sheet>
  );
}

function PreviewCertificates({ a }: PreviewProps) {
  return (
    <div className="rounded-xl bg-white p-2 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)]">
      <div className="rounded-lg border-2 p-1.5" style={{ borderColor: a }}>
        <div className="rounded-md border px-5 py-6 text-center" style={{ borderColor: tint(a, 45) }}>
          <p className="font-serif text-xl italic text-slate-900">Certificat de réalisation</p>
          <p className="mt-3 text-[11px] text-slate-400">décerné à</p>
          <div className="mt-2 flex justify-center">
            <Bar w="130px" c={tint(a, 35)} h={12} />
          </div>
          <div className="mt-4 space-y-1.5">
            <Bar w="70%" h={6} />
            <div className="flex justify-center">
              <Bar w="50%" h={6} />
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <Bar w="60px" h={6} />
            <span
              className="flex h-12 w-12 items-center justify-center rounded-full text-white"
              style={{ background: a }}
            >
              <Award size={22} aria-hidden="true" />
            </span>
            <Bar w="60px" h={6} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewForms({ a }: PreviewProps) {
  return (
    <Sheet>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Demande de renseignements</p>
        <Pill accent={a}>3 réponses</Pill>
      </div>
      <div className="mt-4 space-y-3.5">
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-slate-500">Nom complet</p>
          <div className="h-9 rounded-lg border border-slate-200 bg-slate-50" />
        </div>
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-slate-500">Type de besoin</p>
          <div className="flex h-9 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400">
            <Bar w="80px" />
            <ChevronDown size={14} aria-hidden="true" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex h-4 w-4 items-center justify-center rounded text-white" style={{ background: a }}>
            <Check size={11} strokeWidth={3} aria-hidden="true" />
          </span>
          <Bar w="150px" />
        </div>
        <div className="flex h-9 items-center justify-center rounded-lg text-xs font-semibold text-white" style={{ background: a }}>
          Envoyer
        </div>
      </div>
    </Sheet>
  );
}

/* Motif de QR Code déterministe */
const QR_N = 21;
const QR_CELLS: Array<[number, number]> = (() => {
  let s = 20260;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= QR_N - 8 && y < 8) || (x < 8 && y >= QR_N - 8);
  const out: Array<[number, number]> = [];
  for (let y = 0; y < QR_N; y++) {
    for (let x = 0; x < QR_N; x++) {
      if (!inFinder(x, y) && rnd() > 0.52) out.push([x, y]);
    }
  }
  return out;
})();

function PreviewQR({ a }: PreviewProps) {
  const finders: Array<[number, number]> = [
    [0, 0],
    [QR_N - 7, 0],
    [0, QR_N - 7],
  ];
  return (
    <div className="mx-auto max-w-64 space-y-3">
      <Sheet className="p-5!">
        <svg viewBox={`0 0 ${QR_N} ${QR_N}`} className="mx-auto w-full" shapeRendering="crispEdges" aria-hidden="true">
          {QR_CELLS.map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={a} />
          ))}
          {finders.map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <rect x={x + 0.5} y={y + 0.5} width="6" height="6" fill="none" stroke={a} strokeWidth="1" />
              <rect x={x + 2} y={y + 2} width="3" height="3" fill={a} />
            </g>
          ))}
        </svg>
      </Sheet>
      <div className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2.5 ring-1 ring-white/10">
        <div className="flex items-center gap-1.5">
          {['#0f172a', a, '#ffffff'].map((c) => (
            <span key={c} className="h-5 w-5 rounded-full ring-2 ring-white/30" style={{ background: c }} />
          ))}
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
          <Download size={14} aria-hidden="true" />
          Haute qualité
        </span>
      </div>
    </div>
  );
}

function PreviewTools({ a }: PreviewProps) {
  const tiles: Array<[LucideIcon, string]> = [
    [Calculator, 'Calculatrice'],
    [Percent, 'Remises'],
    [Ruler, 'Mesures'],
    [CalendarDays, 'Agenda'],
    [Palette, 'Couleurs'],
    [Clock, 'Minuteur'],
  ];
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map(([Ico, label]) => (
        <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-white px-2 py-4 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: tint(a, 14), color: a }}>
            <Ico size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold text-slate-700">{label}</span>
        </div>
      ))}
    </div>
  );
}

function PreviewIntegrations({ a }: PreviewProps) {
  const nodes = [
    { l: 'Comptabilité', s: 'left-0 top-3' },
    { l: 'Agenda', s: 'right-0 top-3' },
    { l: 'Paiement', s: 'left-0 bottom-3' },
    { l: 'Stockage', s: 'right-0 bottom-3' },
  ];
  return (
    <div className="relative mx-auto h-64 w-full max-w-sm">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {[
          ['18%', '17%'],
          ['82%', '17%'],
          ['18%', '83%'],
          ['82%', '83%'],
        ].map(([x, y]) => (
          <line key={x + y} x1="50%" y1="50%" x2={x} y2={y} stroke={a} strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="4 5" />
        ))}
      </svg>
      <div
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-2xl text-white"
        style={{ background: a, boxShadow: `0 0 50px -8px ${a}` }}
      >
        <Plug size={24} aria-hidden="true" />
        <span className="text-[10px] font-bold">Devis Café</span>
      </div>
      {nodes.map((n) => (
        <div
          key={n.l}
          className={`absolute ${n.s} flex w-28 items-center gap-2 rounded-xl bg-white px-2.5 py-2.5 shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: tint(a, 14), color: a }}>
            <RefreshCw size={13} aria-hidden="true" />
          </span>
          <span className="text-[11px] font-semibold text-slate-700">{n.l}</span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Contenu de chaque fonctionnalité                                   */
/*  La clé correspond à /dashboard/coming-soon/:featureId              */
/* ------------------------------------------------------------------ */

interface Capability {
  Icon: LucideIcon;
  title: string;
  text: string;
}

interface Feature {
  title: string;
  headline: string;
  intro: string;
  Icon: LucideIcon;
  accent: string;
  Preview: (p: PreviewProps) => ReactElement;
  caps: Capability[];
}

const features: Record<string, Feature> = {
  ai: {
    title: 'JOBO AI',
    headline: 'Décrivez le chantier, JOBO AI rédige le devis.',
    intro:
      'Un assistant qui transforme quelques mots en devis structuré, avec des lignes adaptées à votre métier et des textes clairs pour vos clients.',
    Icon: Cpu,
    accent: '#6366f1',
    Preview: PreviewAI,
    caps: [
      { Icon: Sparkles, title: 'Du texte au devis', text: 'Décrivez la prestation en une phrase : JOBO AI propose un devis complet, ligne par ligne.' },
      { Icon: ListChecks, title: 'Lignes adaptées à votre métier', text: 'Les suggestions suivent votre secteur pour éviter les oublis et les approximations.' },
      { Icon: Pencil, title: 'Des textes plus professionnels', text: 'Reformulez vos descriptions en un clic, sans perdre votre façon de parler.' },
    ],
  },
  clients: {
    title: 'Mes clients',
    headline: 'Chaque client, chaque devis, au même endroit.',
    intro:
      'Un carnet de clients relié à vos devis : vous retrouvez une fiche en quelques secondes et ses informations se remplissent toutes seules.',
    Icon: Users,
    accent: '#0284c7',
    Preview: PreviewClients,
    caps: [
      { Icon: Search, title: 'Retrouvez un client instantanément', text: 'Toutes vos fiches sont réunies et consultables depuis une seule recherche.' },
      { Icon: History, title: 'Historique de chaque client', text: 'Consultez les devis envoyés, acceptés ou en attente pour chaque personne.' },
      { Icon: Zap, title: 'Informations reprises automatiquement', text: 'Choisissez un client dans un devis : nom, adresse et contact se remplissent seuls.' },
    ],
  },
  crm: {
    title: 'CRM',
    headline: 'Ne laissez plus aucune opportunité s’endormir.',
    intro:
      'Suivez vos prospects de la première demande jusqu’au devis signé, et relancez-les exactement quand il le faut.',
    Icon: Contact,
    accent: '#059669',
    Preview: PreviewCRM,
    caps: [
      { Icon: Target, title: 'Vos prospects en un coup d’œil', text: 'Visualisez où en est chaque opportunité, de la demande au devis gagné.' },
      { Icon: BellRing, title: 'Rappels au bon moment', text: 'Soyez prévenu quand un prospect mérite une relance, avant qu’il ne refroidisse.' },
      { Icon: TrendingUp, title: 'Vue d’ensemble de votre activité', text: 'Mesurez l’avancement de votre activité commerciale sans tableur à tenir.' },
    ],
  },
  invoices: {
    title: 'Créateur de factures',
    headline: 'Du devis accepté à la facture, sans rien ressaisir.',
    intro:
      'Transformez un devis accepté en facture professionnelle : les lignes, les montants et les informations du client sont déjà là.',
    Icon: Receipt,
    accent: '#2563eb',
    Preview: PreviewInvoices,
    caps: [
      { Icon: FileCheck2, title: 'Factures professionnelles', text: 'Des documents nets et complets, prêts à être envoyés à vos clients.' },
      { Icon: Repeat, title: 'Reprise d’un devis accepté', text: 'Lignes, montants et coordonnées sont repris : zéro ressaisie, zéro erreur de recopie.' },
      { Icon: Palette, title: 'À l’image de votre activité', text: 'Logo, couleurs et mentions : la facture ressemble à votre entreprise.' },
    ],
  },
  receipts: {
    title: 'Créateur de reçus',
    headline: 'Un reçu soigné dès que le paiement arrive.',
    intro:
      'Remettez à vos clients une preuve de paiement claire, avec votre logo et votre cachet, en quelques secondes.',
    Icon: FileText,
    accent: '#d97706',
    Preview: PreviewReceipts,
    caps: [
      { Icon: FileText, title: 'Reçus de paiement professionnels', text: 'Montant, date et objet du paiement présentés de façon claire et sans ambiguïté.' },
      { Icon: Stamp, title: 'Votre logo et votre cachet', text: 'Chaque reçu porte votre identité, du premier au dernier.' },
      { Icon: Share2, title: 'Téléchargement et partage simplifiés', text: 'Enregistrez le reçu ou envoyez-le à votre client sans manipulation compliquée.' },
    ],
  },
  contracts: {
    title: 'Créateur de contrats',
    headline: 'Des accords clairs, signés et cachetés.',
    intro:
      'Partez d’un modèle solide, ajustez chaque clause à votre situation et finalisez avec votre signature et votre cachet.',
    Icon: FileSignature,
    accent: '#7c3aed',
    Preview: PreviewContracts,
    caps: [
      { Icon: LayoutTemplate, title: 'Modèles prêts à personnaliser', text: 'Un point de départ complet pour ne jamais commencer d’une page blanche.' },
      { Icon: Pencil, title: 'Clauses modifiables', text: 'Adaptez, ajoutez ou retirez des clauses selon chaque accord.' },
      { Icon: PenTool, title: 'Signature et cachet intégrés', text: 'Le document est finalisé directement, sans impression ni retouche.' },
    ],
  },
  certificates: {
    title: 'Créateur de certificats',
    headline: 'Valorisez chaque réalisation avec un certificat élégant.',
    intro:
      'Des certificats au rendu soigné, entièrement personnalisables, à remettre à vos clients ou à vos équipes.',
    Icon: Award,
    accent: '#b45309',
    Preview: PreviewCertificates,
    caps: [
      { Icon: LayoutTemplate, title: 'Modèles soignés', text: 'Des mises en page élégantes, pensées pour marquer une réalisation.' },
      { Icon: Palette, title: 'Personnalisation complète', text: 'Texte, couleurs et style : vous décidez de chaque détail du certificat.' },
      { Icon: Printer, title: 'Prêt à imprimer ou à partager', text: 'Exportez en bonne qualité pour l’imprimer ou l’envoyer en un instant.' },
    ],
  },
  forms: {
    title: 'Créateur de formulaires',
    headline: 'Posez les bonnes questions, recevez des réponses utiles.',
    intro:
      'Construisez un formulaire en quelques minutes pour recueillir les informations de vos clients, puis retrouvez toutes les réponses au même endroit.',
    Icon: ClipboardList,
    accent: '#db2777',
    Preview: PreviewForms,
    caps: [
      { Icon: Zap, title: 'Créé en quelques minutes', text: 'Ajoutez vos champs et votre formulaire est prêt à être partagé.' },
      { Icon: Users, title: 'Les informations de vos clients', text: 'Collectez exactement ce dont vous avez besoin avant de rédiger un devis.' },
      { Icon: Inbox, title: 'Réponses regroupées', text: 'Toutes les réponses arrivent au même endroit, sans messages éparpillés.' },
    ],
  },
  'qr-codes': {
    title: 'Générateur de QR Codes',
    headline: 'Un QR Code net, à vos couleurs.',
    intro:
      'Créez des QR Codes pour vos liens et vos coordonnées, personnalisez-les et téléchargez-les en haute qualité.',
    Icon: QrCode,
    accent: '#0d9488',
    Preview: PreviewQR,
    caps: [
      { Icon: Link2, title: 'Liens et coordonnées', text: 'Un scan suffit pour ouvrir votre site ou enregistrer vos coordonnées.' },
      { Icon: Palette, title: 'Couleurs et style personnalisables', text: 'Accordez le QR Code à votre identité sans nuire à sa lisibilité.' },
      { Icon: Download, title: 'Téléchargement haute qualité', text: 'Un rendu net, adapté à l’impression comme à l’écran.' },
    ],
  },
  tools: {
    title: 'Tools',
    headline: 'Les petits outils qui font gagner de gros moments.',
    intro:
      'Une boîte à outils pensée pour votre quotidien professionnel, accessible depuis votre espace et enrichie au fil du temps.',
    Icon: Wrench,
    accent: '#ea580c',
    Preview: PreviewTools,
    caps: [
      { Icon: MousePointerClick, title: 'Accessibles en un clic', text: 'Des utilitaires pratiques, à portée de main, sans quitter votre espace.' },
      { Icon: Briefcase, title: 'Pensés pour votre activité', text: 'Chaque outil répond à un besoin concret de votre métier.' },
      { Icon: Layers, title: 'Une sélection qui grandit', text: 'De nouveaux outils s’ajoutent régulièrement à la boîte.' },
    ],
  },
  integrations: {
    title: 'Intégrations',
    headline: 'Vos outils et Devis Café, enfin connectés.',
    intro:
      'Reliez Devis Café aux services que vous utilisez déjà pour que vos données circulent sans effort.',
    Icon: Plug,
    accent: '#3b82f6',
    Preview: PreviewIntegrations,
    caps: [
      { Icon: Plug, title: 'Vos outils favoris', text: 'Connectez les services de votre quotidien à votre espace Devis Café.' },
      { Icon: RefreshCw, title: 'Des données qui circulent', text: 'Les informations passent d’un outil à l’autre sans copier-coller.' },
      { Icon: Repeat, title: 'Moins de tâches répétitives', text: 'Automatisez ce qui se répète pour garder du temps pour vos clients.' },
    ],
  },
};

const fallback: Feature = {
  title: 'Nouvelle fonctionnalité',
  headline: 'Une nouveauté arrive dans votre espace pro.',
  intro: 'Conçue pour vous faire gagner du temps, elle s’intégrera directement à votre espace Devis Café.',
  Icon: Cpu,
  accent: '#2563eb',
  Preview: PreviewTools,
  caps: [
    { Icon: Zap, title: 'Gain de temps', text: 'Pensée pour réduire les gestes répétitifs de votre quotidien.' },
    { Icon: Layers, title: 'Intégrée à votre espace', text: 'Elle s’ajoute naturellement à vos outils existants.' },
    { Icon: Sparkles, title: 'Bientôt disponible', text: 'Notre équipe finalise les derniers détails.' },
  ],
};

const stages = [
  { label: 'Conception', state: 'done', note: 'Terminée' },
  { label: 'Développement', state: 'current', note: 'En cours' },
  { label: 'Tests', state: 'next', note: 'À venir' },
  { label: 'Lancement', state: 'next', note: 'À venir' },
] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ComingSoonPage() {
  const { featureId = '' } = useParams<{ featureId: string }>();
  const navigate = useNavigate();
  const feature = features[featureId] ?? fallback;
  const { title, headline, intro, Icon, accent, Preview, caps } = feature;
  const others = Object.entries(features).filter(([id]) => id !== featureId);

  const panelStyle: CSSProperties = {
    background: `radial-gradient(120% 90% at 85% 0%, color-mix(in srgb, ${accent} 55%, transparent), transparent 60%), radial-gradient(90% 70% at 0% 100%, color-mix(in srgb, ${accent} 28%, transparent), transparent 65%), #0a1022`,
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 py-6" key={featureId}>
      <style>{`
        @keyframes cs-slide { 0% { transform: translateX(-110%); } 100% { transform: translateX(310%); } }
        .cs-bar { animation: cs-slide 2.4s cubic-bezier(.4,0,.2,1) infinite; }
        @keyframes cs-pulse {
          0%   { box-shadow: 0 0 0 0 color-mix(in srgb, var(--cs-a) 60%, transparent); }
          70%  { box-shadow: 0 0 0 7px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .cs-dot { animation: cs-pulse 2s ease-out infinite; }
        .cs-grid {
          background-image:
            linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 28px 28px;
          -webkit-mask-image: radial-gradient(ellipse at 50% 40%, #000, transparent 75%);
                  mask-image: radial-gradient(ellipse at 50% 40%, #000, transparent 75%);
        }
        @media (prefers-reduced-motion: reduce) { .cs-bar, .cs-dot { animation: none; } }
      `}</style>

      <div style={{ '--cs-a': accent } as CSSProperties} className="space-y-6">
        {/* ---------- Hero ---------- */}
        <article className="grid overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_-44px_rgba(15,23,42,0.4)] lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full py-1 pl-1 pr-3.5 text-xs font-semibold"
              style={{ background: tint(accent, 10), color: accent }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-white" style={{ background: accent }}>
                <Icon size={13} strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="cs-dot h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
              En cours de développement
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-[2.75rem] sm:leading-[1.05]">
              {title}
            </h1>
            <p className="mt-4 text-xl font-medium leading-snug text-slate-800">{headline}</p>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600">{intro}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Retour
              </button>
              <Link
                to="/dashboard/quotes/new"
                className="group inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ background: accent, boxShadow: `0 12px 30px -14px ${accent}`, outlineColor: accent }}
              >
                Créer un devis en attendant
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Aperçu du concept */}
          <div className="relative flex min-h-[22rem] items-center justify-center overflow-hidden p-6 sm:p-10" style={panelStyle}>
            <div aria-hidden="true" className="cs-grid pointer-events-none absolute inset-0" />
            <div className="relative w-full max-w-sm">
              <p className="mb-4 text-center text-xs font-medium text-slate-400">Aperçu du concept</p>
              <Preview a={accent} />
            </div>
          </div>
        </article>

        {/* ---------- Capacités ---------- */}
        <section aria-label={`Ce que prépare ${title}`} className="grid gap-4 md:grid-cols-3">
          {caps.map(({ Icon: CapIcon, title: capTitle, text }) => (
            <div key={capTitle} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.5)]">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: tint(accent, 12), color: accent }}
              >
                <CapIcon size={21} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-base font-semibold text-slate-950">{capTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </section>

        {/* ---------- Avancement ---------- */}
        <section
          aria-label="Avancement du développement"
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-950">Avancement</h2>
            <span className="text-xs font-semibold" style={{ color: accent }}>
              Bientôt disponible
            </span>
          </div>
          <ol className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
            {stages.map((s) => (
              <li key={s.label}>
                <div
                  className="relative h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: s.state === 'done' ? accent : tint(accent, 14) }}
                >
                  {s.state === 'current' && (
                    <span
                      className="cs-bar absolute inset-y-0 left-0 w-1/3 rounded-full"
                      style={{ background: accent }}
                    />
                  )}
                </div>
                <p className={`mt-3 text-sm font-semibold ${s.state === 'next' ? 'text-slate-400' : 'text-slate-900'}`}>
                  {s.label}
                </p>
                <p className="text-xs text-slate-500">{s.note}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Autres nouveautés ---------- */}
        <nav aria-label="Autres fonctionnalités à venir" className="flex flex-wrap items-center gap-2 px-1">
          <span className="mr-1 text-sm font-medium text-slate-500">Autres nouveautés</span>
          {others.map(([id, f]) => (
            <Link
              key={id}
              to={`/dashboard/coming-soon/${id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              <f.Icon size={13} style={{ color: f.accent }} aria-hidden="true" />
              {f.title}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}