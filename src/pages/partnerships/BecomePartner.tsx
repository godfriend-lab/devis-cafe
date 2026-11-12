import { useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* Données                                                             */
/* ------------------------------------------------------------------ */

type Profile = 'company' | 'individual';
type Status = 'idle' | 'loading' | 'success';

interface PartnerType {
  id: string;
  title: string;
  desc: string;
  gain: string;
  profiles: Profile[];
}

const flag = (code: string, w = 40) => `https://flagcdn.com/w${w}/${code}.png`;

const PROFILES: { id: Profile; title: string; desc: string }[] = [
  { id: 'company', title: 'Entreprise ou organisation', desc: 'Société, agence, cabinet, institution, école ou réseau.' },
  { id: 'individual', title: 'Individuel', desc: 'Freelance, expert, formateur, créateur ou investisseur.' },
];

const TYPES: PartnerType[] = [
  {
    id: 'distribution',
    title: 'Revendeur et distribution',
    desc: 'Proposez Devis Café à votre portefeuille clients et à vos points de vente.',
    gain: 'Commissions récurrentes et tarifs partenaires',
    profiles: ['company'],
  },
  {
    id: 'referral',
    title: 'Apporteur d’affaires',
    desc: 'Recommandez nos solutions à votre réseau et suivez vos recommandations en temps réel.',
    gain: 'Commission sur chaque client converti',
    profiles: ['company', 'individual'],
  },
  {
    id: 'tech',
    title: 'Intégration technologique',
    desc: 'Connectez Devis Café à vos outils : ERP, caisse, CRM, comptabilité, API.',
    gain: 'Accès API, documentation et support technique dédié',
    profiles: ['company', 'individual'],
  },
  {
    id: 'payment',
    title: 'Paiement et fintech',
    desc: 'Banques, Mobile Money, passerelles de paiement et néobanques.',
    gain: 'Parcours de paiement co-construits, visibilité sur la plateforme',
    profiles: ['company'],
  },
  {
    id: 'accounting',
    title: 'Cabinets comptables et experts',
    desc: 'Recommandez et gérez la facturation de vos clients depuis un espace conforme.',
    gain: 'Espace multi-clients et offre cabinet',
    profiles: ['company', 'individual'],
  },
  {
    id: 'agency',
    title: 'Agences et intégrateurs',
    desc: 'Déployez, personnalisez et accompagnez les entreprises qui adoptent nos outils.',
    gain: 'Missions facturables et label partenaire certifié',
    profiles: ['company', 'individual'],
  },
  {
    id: 'infra',
    title: 'Télécom, cloud et hébergement',
    desc: 'Opérateurs, hébergeurs et fournisseurs d’infrastructure.',
    gain: 'Offres groupées et performance locale',
    profiles: ['company'],
  },
  {
    id: 'education',
    title: 'Éducation et incubation',
    desc: 'Écoles, universités, incubateurs et accélérateurs de startups.',
    gain: 'Licences pour vos promotions et programmes startups',
    profiles: ['company', 'individual'],
  },
  {
    id: 'network',
    title: 'Réseaux et institutions',
    desc: 'Chambres de commerce, associations professionnelles, ONG et programmes publics.',
    gain: 'Avantages membres et programmes de digitalisation',
    profiles: ['company'],
  },
  {
    id: 'media',
    title: 'Médias et communication',
    desc: 'Co-marketing, événements, études et contenus à destination des entrepreneurs.',
    gain: 'Campagnes communes et accès à notre audience',
    profiles: ['company', 'individual'],
  },
  {
    id: 'ambassador',
    title: 'Ambassadeur et créateur de contenu',
    desc: 'Partagez votre expérience avec Devis Café auprès de votre communauté.',
    gain: 'Lien de suivi personnel, rémunération à la performance',
    profiles: ['individual'],
  },
  {
    id: 'trainer',
    title: 'Formateur et consultant',
    desc: 'Formez les entrepreneurs à la facturation et à la gestion commerciale numérique.',
    gain: 'Supports de formation et mise en relation avec nos clients',
    profiles: ['individual'],
  },
  {
    id: 'investor',
    title: 'Investissement et financement',
    desc: 'Fonds, family offices, business angels et institutions de développement.',
    gain: 'Accès à la feuille de route et aux indicateurs de croissance',
    profiles: ['company', 'individual'],
  },
  {
    id: 'other',
    title: 'Autre proposition',
    desc: 'Une idée qui ne figure pas dans cette liste ? Décrivez-la nous.',
    gain: 'Étude personnalisée par l’équipe partenariats',
    profiles: ['company', 'individual'],
  },
];

const COUNTRIES: [string, string][] = [
  ['tg', 'Togo'], ['bj', 'Bénin'], ['bf', 'Burkina Faso'], ['ci', 'Côte d’Ivoire'], ['gh', 'Ghana'],
  ['ng', 'Nigeria'], ['sn', 'Sénégal'], ['ml', 'Mali'], ['ne', 'Niger'], ['gn', 'Guinée'],
  ['cm', 'Cameroun'], ['ga', 'Gabon'], ['cg', 'Congo'], ['cd', 'RD Congo'], ['td', 'Tchad'],
  ['ma', 'Maroc'], ['dz', 'Algérie'], ['tn', 'Tunisie'], ['eg', 'Égypte'], ['ke', 'Kenya'],
  ['tz', 'Tanzanie'], ['et', 'Éthiopie'], ['ao', 'Angola'], ['za', 'Afrique du Sud'],
  ['fr', 'France'], ['be', 'Belgique'], ['ca', 'Canada'], ['ch', 'Suisse'], ['gb', 'Royaume-Uni'],
  ['us', 'États-Unis'], ['ae', 'Émirats arabes unis'], ['cn', 'Chine'],
];

const SIZES = ['1 à 10 personnes', '11 à 50 personnes', '51 à 200 personnes', 'Plus de 200 personnes'];

interface FormState {
  name: string; // entreprise ou nom complet
  contact: string;
  role: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  size: string;
  audience: string;
  message: string;
}

const EMPTY: FormState = {
  name: '', contact: '', role: '', email: '', phone: '', country: 'tg',
  website: '', size: SIZES[0], audience: '', message: '',
};

const input =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

/* ------------------------------------------------------------------ */
/* Sous-composants                                                     */
/* ------------------------------------------------------------------ */

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between text-sm font-semibold text-slate-800">
        {label}
        {hint && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-600 text-sm font-semibold text-brand-600 tabular-nums">
        {step}
      </span>
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1 text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function BecomePartner() {
  const navigate = useNavigate();
  const typesRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [profile, setProfile] = useState<Profile>('company');
  const [selected, setSelected] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState('');

  const isCompany = profile === 'company';
  const visibleTypes = useMemo(() => TYPES.filter((t) => t.profiles.includes(profile)), [profile]);
  const selectedTypes = useMemo(() => visibleTypes.filter((t) => selected.includes(t.id)), [visibleTypes, selected]);
  const country = COUNTRIES.find(([c]) => c === form.country) ?? COUNTRIES[0];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const changeProfile = (p: Profile) => {
    setProfile(p);
    setSelected((s) => s.filter((id) => TYPES.find((t) => t.id === id)?.profiles.includes(p)));
    setError('');
  };

  const toggle = (id: string) => {
    setError('');
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      setError('Sélectionnez au moins un type de partenariat.');
      typesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setStatus('loading');
    // Simulation d'envoi (remplacer par l'appel Supabase ou EmailJS).
    // Données à envoyer : { profile, types: selectedTypes.map((t) => t.id), ...form }
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setStatus('success');
  };

  /* ---------------- Succès ---------------- */
  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-xl rounded-[2.5rem] bg-white p-10 text-center shadow-[0_40px_80px_-30px_rgba(2,11,29,0.3)] sm:p-14">
          <div className="mx-auto mb-8 flex items-center justify-center">
            <img src={flag(form.country, 160)} alt={`Drapeau : ${country[1]}`} className="h-14 w-20 rounded-lg object-cover shadow-lg ring-1 ring-slate-200" />
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-slate-900">Demande envoyée</h1>
          <p className="mx-auto mt-4 max-w-md text-slate-600">
            Merci {form.contact || form.name}. L’équipe partenariats de MATUNEQHYD étudie votre proposition et vous répond sous 48 heures à l’adresse {form.email}.
          </p>
          <ul className="mx-auto mt-8 max-w-md divide-y divide-slate-100 rounded-2xl border border-slate-200 text-left">
            {selectedTypes.map((t) => (
              <li key={t.id} className="px-5 py-3 text-sm font-medium text-slate-800">{t.title}</li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/')}
            className="mt-10 rounded-full bg-brand-600 px-8 py-3.5 font-semibold text-white transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Retour à l’accueil
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- Formulaire ---------------- */
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(203 213 225) 1px, transparent 0)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(to bottom, black, transparent 90%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 90%)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="mb-10 rounded text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            Retour à l’accueil
          </button>
          <p className="mb-5 inline-flex rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm text-slate-700 backdrop-blur">
            Programme partenaires MATUNEQHYD
          </p>
          <h1 className="max-w-4xl text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Construisons ensemble l’avenir de la technologie africaine
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Entreprises, institutions, experts et créateurs : rejoignez l’écosystème MATUNEQHYD et Devis Café, et faites croître votre activité avec nous.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="bg-slate-100 py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="space-y-6 lg:col-span-8">
            {/* 1. Profil */}
            <section className="rounded-[2.5rem] bg-white p-6 sm:p-10">
              <SectionTitle step={1} title="Vous êtes" desc="Choisissez le profil qui vous correspond." />
              <div role="radiogroup" aria-label="Profil" className="grid gap-4 sm:grid-cols-2">
                {PROFILES.map((p) => {
                  const active = profile === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => changeProfile(p.id)}
                      className={`rounded-3xl border p-6 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 ${
                        active ? 'border-brand-600 bg-brand-50 shadow-[0_0_0_1px_var(--color-brand-600,#004fe8)]' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{p.title}</span>
                        <span className={`h-5 w-5 rounded-full border-2 ${active ? 'border-brand-600 bg-brand-600 ring-4 ring-white ring-inset' : 'border-slate-300'}`} />
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-slate-600">{p.desc}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Types */}
            <section ref={typesRef} className="rounded-[2.5rem] bg-white p-6 sm:p-10">
              <SectionTitle step={2} title="Type de partenariat" desc="Sélectionnez un ou plusieurs types qui correspondent à votre proposition." />
              <div className="grid gap-4 md:grid-cols-2">
                {visibleTypes.map((t) => {
                  const active = selected.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(t.id)}
                      className={`flex flex-col rounded-3xl border p-6 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 ${
                        active ? 'border-brand-600 bg-brand-50' : 'border-slate-200 hover:border-slate-400 hover:shadow-md'
                      }`}
                    >
                      <span className="flex items-start justify-between gap-4">
                        <span className="text-base font-semibold leading-snug text-slate-900">{t.title}</span>
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition ${active ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                          {active && <span className="h-2 w-2 rounded-sm bg-white" />}
                        </span>
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-slate-600">{t.desc}</span>
                      <span className="mt-4 border-t border-slate-200/80 pt-3 text-xs font-medium text-brand-700">{t.gain}</span>
                    </button>
                  );
                })}
              </div>
              {error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
            </section>

            {/* 3. Coordonnées */}
            <section className="rounded-[2.5rem] bg-white p-6 sm:p-10">
              <SectionTitle step={3} title="Vos coordonnées" desc="Ces informations nous permettent de vous répondre rapidement." />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={isCompany ? 'Nom de l’entreprise' : 'Nom complet'}>
                  <input required className={input} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder={isCompany ? 'Ex. Tech Solutions SARL' : 'Ex. Jean Dupont'} />
                </Field>
                {isCompany ? (
                  <Field label="Personne à contacter">
                    <input required className={input} value={form.contact} onChange={(e) => set('contact', e.target.value)} placeholder="Ex. Awa Koffi" />
                  </Field>
                ) : (
                  <Field label="Activité ou profession">
                    <input required className={input} value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Ex. Consultant en gestion" />
                  </Field>
                )}
                <Field label="Email professionnel">
                  <input required type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contact@entreprise.com" />
                </Field>
                <Field label="Téléphone ou WhatsApp" hint="Facultatif">
                  <input type="tel" className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+228 90 00 00 00" />
                </Field>
                <Field label="Pays">
                  <div className="relative">
                    <img src={flag(country[0])} alt="" className="pointer-events-none absolute left-4 top-1/2 h-4 w-6 -translate-y-1/2 rounded-sm object-cover ring-1 ring-slate-200" />
                    <select className={`${input} appearance-none pl-14`} value={form.country} onChange={(e) => set('country', e.target.value)}>
                      {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                    </select>
                  </div>
                </Field>
                {isCompany ? (
                  <Field label="Taille de l’entreprise">
                    <select className={input} value={form.size} onChange={(e) => set('size', e.target.value)}>
                      {SIZES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                ) : (
                  <Field label="Réseau ou audience" hint="Facultatif">
                    <input className={input} value={form.audience} onChange={(e) => set('audience', e.target.value)} placeholder="Ex. 5 000 abonnés, 200 clients" />
                  </Field>
                )}
                {isCompany && (
                  <div className="sm:col-span-2">
                    <Field label="Site web" hint="Facultatif">
                      <input type="url" className={input} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://www.entreprise.com" />
                    </Field>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <Field label="Votre proposition de collaboration">
                    <textarea
                      required
                      rows={5}
                      className={`${input} resize-none`}
                      value={form.message}
                      onChange={(e) => set('message', e.target.value)}
                      placeholder="Présentez brièvement votre activité, ce que vous apportez et ce que vous attendez de ce partenariat."
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          {/* Récapitulatif */}
          <aside className="lg:col-span-4">
            <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white lg:sticky lg:top-8">
              <h2 className="text-2xl font-medium tracking-tight">Votre demande</h2>
              <dl className="mt-6 space-y-5 text-sm">
                <div>
                  <dt className="text-slate-400">Profil</dt>
                  <dd className="mt-1 font-medium">{PROFILES.find((p) => p.id === profile)?.title}</dd>
                </div>
                <div>
                  <dt className="text-slate-400">Partenariats choisis</dt>
                  <dd className="mt-2">
                    {selectedTypes.length === 0 ? (
                      <span className="text-slate-500">Aucun pour le moment</span>
                    ) : (
                      <ul className="space-y-2">
                        {selectedTypes.map((t) => (
                          <li key={t.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 font-medium">{t.title}</li>
                        ))}
                      </ul>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400">Pays</dt>
                  <dd className="mt-1 flex items-center gap-3 font-medium">
                    <img src={flag(country[0])} alt="" className="h-4 w-6 rounded-sm object-cover" />
                    {country[1]}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-sm font-semibold">Après l’envoi</p>
                <ol className="mt-4 space-y-3 text-sm text-slate-300">
                  <li>Étude de votre proposition par l’équipe partenariats.</li>
                  <li>Réponse sous 48 heures par email.</li>
                  <li>Échange de cadrage et signature d’un accord.</li>
                </ol>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-8 w-full rounded-full bg-brand-600 px-8 py-4 font-semibold text-white transition hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'loading' ? 'Envoi en cours…' : 'Envoyer la demande'}
              </button>
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}