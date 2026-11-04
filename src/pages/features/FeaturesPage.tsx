import { useState } from 'react';
import { Navbar } from '../landing/components/Navbar';
import { Footer } from '../landing/components/Footer';
import {
  Building2, User, ListChecks, Calculator, CalendarClock, FileCheck2,
  Palette, ImagePlus, PenLine, Stamp, LayoutTemplate, Download,
  Check, X, ArrowRight, BadgeCheck,
} from 'lucide-react';

/**
 * ─── LOGOS ─────────────────────────────────────────────
 * Placez vos fichiers dans le dossier /public/logos/ de votre projet VS Code :
 *   public/logos/devis-cafe.png   → logo Devis Café
 *   public/logos/canva.png        → logo officiel de Canva
 * (formats .svg, .webp ou .jpg possibles : modifiez simplement l'extension ci-dessous)
 */
const LOGO_DEVIS_CAFE = '/logos/devis-cafe.png';
const LOGO_CANVA = '/logos/canva.png';

type LogoProps = {
  src: string;
  name: string;
  className?: string;
};

function Logo({ src, name, className = 'h-8' }: LogoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <span className="text-lg font-bold tracking-tight">{name}</span>;
  }
  return (
    <img
      src={src}
      alt={name}
      className={`${className} w-auto object-contain`}
      onError={() => setFailed(true)}
    />
  );
}

/* ─── DONNÉES ─────────────────────────────────────────── */

// 10 000 XOF = 15,24 € (parité fixe 655,957 XOF pour 1 €). Le dollar est indicatif.
const PRICES = {
  XOF: { label: 'XOF', amount: '10 000', suffix: 'FCFA' },
  EUR: { label: 'EUR', amount: '15,24', suffix: '€' },
  USD: { label: 'USD', amount: '≈ 17,50', suffix: '$' },
};

type CurrencyCode = keyof typeof PRICES;

const steps = [
  { icon: Building2, title: 'Votre entreprise', text: 'Nom, adresse, contact : renseignés une seule fois.' },
  { icon: User, title: 'Votre client', text: 'Les informations de la personne ou société à facturer.' },
  { icon: ListChecks, title: 'Vos prestations', text: 'Désignation, quantité et prix unitaire.' },
  { icon: Calculator, title: 'Taxes et remises', text: 'TVA, remise, acompte : les totaux se calculent seuls.' },
  { icon: CalendarClock, title: 'Validité et conditions', text: 'Durée de validité, devise, conditions de paiement.' },
  { icon: FileCheck2, title: 'Devis créé', text: 'Généré automatiquement avec le modèle par défaut, prêt à personnaliser.' },
];

const customization = [
  { icon: Palette, title: 'Vos couleurs', text: 'Choisissez la couleur de votre devis : en-tête, titres, totaux. L’aperçu change en direct.', tint: 'bg-brand-100 text-brand-600' },
  { icon: ImagePlus, title: 'Votre logo', text: 'Importez votre logo en un clic. Il se place et se redimensionne tout seul.', tint: 'bg-violet-100 text-violet-600' },
  { icon: PenLine, title: 'Votre signature', text: 'Ajoutez votre signature manuscrite scannée ou dessinée directement à l’écran.', tint: 'bg-emerald-100 text-emerald-600' },
  { icon: Stamp, title: 'Votre cachet', text: 'Importez le cachet de votre entreprise pour des devis officiels et crédibles.', tint: 'bg-amber-100 text-amber-600' },
  { icon: LayoutTemplate, title: 'Jusqu’à 1000 modèles', text: 'Un modèle par défaut prêt à l’emploi, et 1000 designs à découvrir si vous voulez changer.', tint: 'bg-rose-100 text-rose-600' },
  { icon: Download, title: 'PDF prêt à envoyer', text: 'Export haute qualité, mise en page parfaite même avec de nombreuses lignes.', tint: 'bg-sky-100 text-sky-600' },
];

const comparison = [
  {
    label: 'Prix des modèles',
    dc: { text: '10 000 XOF pour tout, pendant 12 mois', good: true },
    other: { text: 'Une grande partie des modèles est réservée aux abonnements payants', good: false },
  },
  {
    label: 'Accès aux 1000 modèles',
    dc: { text: 'Inclus dans l’abonnement annuel', good: true },
    other: { text: 'Modèles Pro payants', good: false },
  },
  {
    label: 'Coût par an',
    dc: { text: '10 000 XOF · 15,24 € · ≈ 17,50 $', good: true },
    other: { text: 'Abonnement récurrent pour accéder aux modèles Pro', good: false },
  },
  {
    label: 'Étapes pour obtenir un devis',
    dc: { text: '6 étapes guidées, le devis se crée tout seul', good: true },
    other: { text: '8 étapes ou plus, à faire manuellement', good: false },
  },
  {
    label: 'Création du devis',
    dc: { text: 'Automatique à la dernière étape', good: true },
    other: { text: 'Mise en page à construire soi-même', good: false },
  },
  {
    label: 'Calcul des totaux et taxes',
    dc: { text: 'Automatique, zéro erreur', good: true },
    other: { text: 'À calculer et saisir à la main', good: false },
  },
  {
    label: 'Couleurs, logo, signature, cachet',
    dc: { text: 'Personnalisation guidée en quelques clics', good: true },
    other: { text: 'Élément par élément, dans un éditeur de design', good: false },
  },
];

/* ─── PAGE ────────────────────────────────────────────── */

export function FeaturesPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('XOF');
  const price = PRICES[currency];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-135 w-215 -translate-x-1/2 rounded-full bg-linear-to-br from-brand-200/60 via-violet-200/50 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <Logo src={LOGO_DEVIS_CAFE} name="Devis Café" className="mx-auto mb-8 h-12" />
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Votre devis professionnel en{' '}
            <span className="bg-linear-to-r from-brand-600 to-violet-600 bg-clip-text text-transparent">
              6 étapes
            </span>
            , sans rien dessiner.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Vous renseignez les champs, Devis Café crée le devis automatiquement.
            Vous personnalisez ensuite les couleurs, le logo, la signature et le cachet.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-4 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Créer mon premier devis <ArrowRight size={18} />
            </a>
            <a
              href="#comparatif"
              className="rounded-xl border border-slate-200 bg-white px-7 py-4 font-semibold text-slate-700 transition hover:border-brand-200 hover:text-brand-700"
            >
              Comparer les prix
            </a>
          </div>
        </div>
      </section>

      {/* 6 ÉTAPES */}
      <section className="pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Six étapes, un devis terminé</h2>
            <p className="mt-3 text-lg text-slate-600">
              Aucun éditeur de design à apprendre : remplissez, validez, c’est fait.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => {
              const last = i === steps.length - 1;
              return (
                <div
                  key={s.title}
                  className={`relative rounded-3xl border p-8 transition hover:-translate-y-1 hover:shadow-xl ${
                    last
                      ? 'border-transparent bg-linear-to-br from-brand-600 to-violet-600 text-white shadow-xl shadow-brand-600/25'
                      : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <span
                    className={`absolute -top-4 left-8 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-md ${
                      last ? 'bg-white text-brand-700' : 'bg-linear-to-br from-brand-600 to-violet-600 text-white'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div
                    className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${
                      last ? 'bg-white/20 text-white' : 'bg-brand-50 text-brand-600'
                    }`}
                  >
                    <s.icon size={26} />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
                  <p className={`leading-relaxed ${last ? 'text-white/90' : 'text-slate-600'}`}>{s.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PERSONNALISATION */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Un devis qui porte votre image</h2>
            <p className="mt-3 text-lg text-slate-600">
              Le modèle par défaut est déjà soigné. Personnalisez-le en quelques clics.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {customization.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-slate-200 bg-white p-8 transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
              >
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl transition group-hover:scale-110 ${f.tint}`}>
                  <f.icon size={26} />
                </div>
                <h3 className="mb-2 text-xl font-bold">{f.title}</h3>
                <p className="leading-relaxed text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARATIF */}
      <section id="comparatif" className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold sm:text-5xl">
              Les mêmes modèles, <span className="text-brand-400">presque gratuits chez nous.</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Là où les modèles premium se paient en abonnement, Devis Café vous donne accès
              à tout pour 10 000 XOF par an.
            </p>
          </div>

          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60">
            <table className="w-full min-w-180 border-collapse text-left">
              <thead>
                <tr className="bg-slate-900">
                  <th className="w-[22%] px-6 py-6 text-sm font-semibold uppercase tracking-wider text-slate-500">
                    Critère
                  </th>
                  <th className="w-[39%] border-x border-brand-500/30 bg-linear-to-b from-brand-600/30 to-brand-600/5 px-6 py-6">
                    <div className="flex items-center gap-3 text-white">
                      <Logo src={LOGO_DEVIS_CAFE} name="Devis Café" className="h-9" />
                    </div>
                  </th>
                  <th className="w-[39%] px-6 py-6">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Logo src={LOGO_CANVA} name="Canva" className="h-8" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.label} className="border-t border-slate-800">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-300">{row.label}</td>
                    <td className="border-x border-brand-500/30 bg-brand-600/10 px-6 py-5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check size={14} strokeWidth={3} />
                        </span>
                        <span className="font-semibold text-white">{row.dc.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                          <X size={13} strokeWidth={3} />
                        </span>
                        <span className="text-slate-400">{row.other.text}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-slate-500">
            Comparaison portant sur la création de devis. Canva est un outil de design polyvalent
            appartenant à ses propriétaires. Le nombre d’étapes est une estimation pour un devis
            réalisé à partir d’un modèle ; les offres et tarifs de Canva peuvent évoluer.
          </p>
        </div>
      </section>

      {/* TARIF */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl border border-brand-100 bg-linear-to-br from-white to-brand-50 p-10 text-center shadow-xl shadow-brand-600/10 sm:p-14">
            <div className="mx-auto mb-8 inline-flex rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              {(Object.keys(PRICES) as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                    currency === code ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:text-brand-700'
                  }`}
                >
                  {PRICES[code].label}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Accès complet · 12 mois</p>
            <div className="mt-3 flex items-end justify-center gap-2">
              <span className="text-6xl font-extrabold tracking-tight sm:text-7xl">{price.amount}</span>
              <span className="mb-2 text-2xl font-bold text-slate-500">{price.suffix}</span>
            </div>
            <p className="mt-1 text-slate-500">par an</p>

            <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left">
              {[
                'Jusqu’à 1000 modèles de devis',
                'Couleurs, logo, signature et cachet',
                'Devis illimités en PDF',
                'Multi-devises : XOF, EUR, USD',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700">
                  <BadgeCheck className="shrink-0 text-brand-600" size={20} />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="/signup"
              className="mt-10 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-4 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              Créer mon compte <ArrowRight size={20} />
            </a>
            <p className="mt-4 text-xs text-slate-400">
              Parité fixe 655,957 XOF = 1 €. Le montant en dollars est indicatif et varie selon le taux de change.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-4xl bg-linear-to-br from-brand-600 via-brand-600 to-violet-600 px-6 py-16 text-center shadow-2xl shadow-brand-600/30 sm:px-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-violet-300/20 blur-2xl" />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-5xl">
            Votre prochain devis, prêt avant votre café.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-brand-100">
            Six étapes, un modèle par défaut soigné, et 1000 designs si vous voulez en changer.
          </p>
          <a
            href="/signup"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-brand-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            Créer mon compte gratuitement <ArrowRight size={20} />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}