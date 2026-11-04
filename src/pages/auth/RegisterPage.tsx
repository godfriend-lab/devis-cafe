import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, AlertCircle, User, Users, Building2, MapPin,
  Phone, Mail, Lock, Eye, EyeOff, Coffee, BarChart3, Banknote, Laptop,
  HardHat, HeartPulse, ShoppingBag, Briefcase, Hammer, PenLine, Lightbulb,
  UserCheck, Wand2, UserRound, ChevronLeft, ChevronRight, Star, ShieldCheck,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ========================================================================= */
/*  CONSTANTES                                                                 */
/* ========================================================================= */

const BACKGROUND_IMAGE = '/images/auth-bg.jpg';
const DWELL_MS = 5000;
const EXIT_MS = 500;

type CountryCode = 'TG' | 'GH' | 'BJ' | 'CI' | 'BF' | 'BE' | 'FR' | 'CA' | 'NG' | 'ZA' | 'SN' | 'CG';
type UserType = 'individual' | 'company';
type Currency = 'XOF' | 'USD' | 'EUR';
type IconType = ComponentType<{ size?: number; className?: string }>;

const COUNTRIES: Record<CountryCode, string> = {
  TG: 'Togo', GH: 'Ghana', BJ: 'Bénin', CI: 'Côte d\'Ivoire', BF: 'Burkina Faso',
  BE: 'Belgique', FR: 'France', CA: 'Canada', NG: 'Nigeria', ZA: 'Afrique du Sud',
  SN: 'Sénégal', CG: 'Congo',
};

interface Testimonial {
  name: string;
  role: string;
  city: string;
  country: CountryCode;
  quote: string;
  avatar: string;
}

const TESTIMONIALS: Testimonial[] = [
  { name: 'Moussa Koné', role: 'Développeur freelance', city: 'Abidjan', country: 'CI', quote: 'Devis Café a divisé par 3 le temps que je passais à faire mes devis.', avatar: '/testimonials/t01.jpg' },
  { name: 'Aminata Diallo', role: 'Architecte d\'intérieur', city: 'Dakar', country: 'SN', quote: 'Mes clients reçoivent un devis propre le jour même.', avatar: '/testimonials/t02.jpg' },
  { name: 'Kofi Mensah', role: 'Entrepreneur BTP', city: 'Accra', country: 'GH', quote: 'Chiffrer un chantier me prenait une soirée. Maintenant, je le fais entre deux visites.', avatar: '/testimonials/t03.jpg' },
  { name: 'Fatou Sow', role: 'Consultante', city: 'Dakar', country: 'SN', quote: 'Le rendu est tellement professionnel que j\'ai pu augmenter mes tarifs.', avatar: '/testimonials/t04.jpg' },
  { name: 'Yao Agbessi', role: 'Électricien', city: 'Lomé', country: 'TG', quote: 'Je fais mes devis depuis mon téléphone, sur le chantier.', avatar: '/testimonials/t05.jpg' },
];

interface RegisterForm {
  userType: UserType | null;
  fullName: string;
  companyName: string;
  city: string;
  industry: string;
  customIndustry: string;
  createsQuotesSelf: boolean | null;
  delegatePhone: string;
  monthlyVolume: string;
  currency: Currency;
  previousCostTier: string;
  referralSource: string;
  phone: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

const INITIAL_FORM: RegisterForm = {
  userType: null, fullName: '', companyName: '', city: '', industry: '',
  customIndustry: '', createsQuotesSelf: null, delegatePhone: '',
  monthlyVolume: '', currency: 'XOF', previousCostTier: '', referralSource: '',
  phone: '', email: '', password: '', acceptTerms: false,
};

const STEPS = [
  { title: 'Profil' }, { title: 'Identité' }, { title: 'Activité' },
  { title: 'Devis' }, { title: 'Volume' }, { title: 'Historique' },
  { title: 'Découverte' }, { title: 'Compte' },
] as const;
const TOTAL_STEPS = STEPS.length;

const INDUSTRIES: { label: string; icon: IconType }[] = [
  { label: 'Informatique / Tech', icon: Laptop },
  { label: 'BTP / Construction', icon: HardHat },
  { label: 'Santé', icon: HeartPulse },
  { label: 'Commerce / Retail', icon: ShoppingBag },
  { label: 'Services / Conseil', icon: Briefcase },
  { label: 'Artisanat', icon: Hammer },
  { label: 'Autre', icon: PenLine },
];

const VOLUMES = ['1 à 5 devis', '6 à 20 devis', '21 à 50 devis', 'Plus de 50 devis'];

const CURRENCIES: { id: Currency; label: string; symbol: string }[] = [
  { id: 'XOF', label: 'FCFA', symbol: 'FCFA' },
  { id: 'USD', label: 'Dollar', symbol: '$' },
  { id: 'EUR', label: 'Euro', symbol: '€' },
];

const COST_TIERS: { id: string; labels: Record<Currency, string> }[] = [
  { id: 'free', labels: { XOF: 'Gratuit', USD: 'Gratuit', EUR: 'Gratuit' } },
  { id: 't1', labels: { XOF: '500 – 2 000 FCFA', USD: '1 – 3 $', EUR: '1 – 3 €' } },
  { id: 't2', labels: { XOF: '2 000 – 5 000 FCFA', USD: '3 – 8 $', EUR: '3 – 8 €' } },
  { id: 't3', labels: { XOF: '5 000 – 15 000 FCFA', USD: '8 – 25 $', EUR: '8 – 23 €' } },
  { id: 't4', labels: { XOF: 'Plus de 15 000 FCFA', USD: 'Plus de 25 $', EUR: 'Plus de 23 €' } },
  { id: 'unknown', labels: { XOF: 'Je ne sais pas', USD: 'Je ne sais pas', EUR: 'Je ne sais pas' } },
];

const SOURCES: { id: string; label: string; icon: IconType; tint?: string }[] = [
  { id: 'youtube', label: 'YouTube', icon: ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" className={className}><rect x="1.5" y="4.5" width="21" height="15" rx="4.5" fill="#FF0000" /><path d="M10 9.2v5.6l5-2.8-5-2.8Z" fill="#fff" /></svg> },
  { id: 'tiktok', label: 'TikTok', icon: ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" className={className}><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="#000" /></svg> },
  { id: 'facebook', label: 'Facebook', icon: ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" className={className}><circle cx="12" cy="12" r="11" fill="#0866FF" /><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.4 1.5-1.4h1.6V4.5c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.2H8v3h2.5V21h3Z" fill="#fff" /></svg> },
  { id: 'instagram', label: 'Instagram', icon: ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" className={className}><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#FEDA75" /><stop offset="0.55" stopColor="#D62976" /><stop offset="1" stopColor="#4F5BD5" /></linearGradient></defs><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#ig)" /><rect x="6" y="6" width="12" height="12" rx="3.8" fill="none" stroke="#fff" strokeWidth="1.8" /><circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" strokeWidth="1.8" /></svg> },
  { id: 'chatgpt', label: 'ChatGPT', icon: ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" className={className}><rect x="1" y="1" width="22" height="22" rx="7" fill="#10A37F" /><g fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"><rect x="8.2" y="4.3" width="7.6" height="15.4" rx="3.8" /><rect x="8.2" y="4.3" width="7.6" height="15.4" rx="3.8" transform="rotate(60 12 12)" /><rect x="8.2" y="4.3" width="7.6" height="15.4" rx="3.8" transform="rotate(120 12 12)" /></g></svg> },
  { id: 'ami', label: 'Un ami', icon: UserCheck, tint: 'text-slate-600' },
  { id: 'collegue', label: 'Un collègue', icon: Users, tint: 'text-slate-600' },
  { id: 'autre', label: 'Autre', icon: Lightbulb, tint: 'text-amber-500' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

function passwordScore(pwd: string): number {
  let s = 0;
  if (pwd.length >= 8) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd) || pwd.length >= 12) s++;
  return s;
}

const STRENGTH_LABELS = ['Trop court', 'Faible', 'Correct', 'Solide', 'Excellent'];
const STRENGTH_COLORS = ['bg-slate-200', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

function validateStep(step: number, f: RegisterForm): string {
  switch (step) {
    case 1: return f.userType ? '' : 'Choisissez le profil qui vous correspond.';
    case 2:
      if (!f.fullName.trim()) return 'Indiquez votre nom complet.';
      if (f.userType === 'company' && !f.companyName.trim()) return 'Indiquez le nom de votre entreprise.';
      if (!f.city.trim()) return 'Indiquez votre ville.';
      return '';
    case 3:
      if (!f.industry) return 'Sélectionnez votre domaine d\'activité.';
      if (f.industry === 'Autre' && !f.customIndustry.trim()) return 'Précisez votre domaine.';
      return '';
    case 4:
      if (f.createsQuotesSelf === null) return 'Faites un choix pour continuer.';
      if (f.createsQuotesSelf === false && f.delegatePhone.replace(/\D/g, '').length < 8) return 'Numéro de téléphone invalide.';
      return '';
    case 5: return f.monthlyVolume ? '' : 'Sélectionnez votre volume mensuel.';
    case 6: return f.previousCostTier ? '' : 'Sélectionnez une option.';
    case 7: return f.referralSource ? '' : 'Dites-nous comment vous nous avez trouvé.';
    case 8:
      if (!PHONE_RE.test(f.phone.trim())) return 'Entrez un numéro de téléphone valide.';
      if (!EMAIL_RE.test(f.email.trim())) return 'Entrez une adresse e-mail valide.';
      if (f.password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
      if (!f.acceptTerms) return 'Vous devez accepter les conditions.';
      return '';
    default: return '';
  }
}

/* ========================================================================= */
/*  COMPOSANTS UI                                                              */
/* ========================================================================= */

function StepShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1.5 text-slate-600">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  icon?: IconType;
  autoComplete?: string;
  autoFocus?: boolean;
  trailing?: ReactNode;
}

function Field({ label, value, onChange, type = 'text', placeholder, icon: Icon, autoComplete, autoFocus, trailing }: FieldProps) {
  return (
    <label className="block mb-4 last:mb-0">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">
        {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-900 transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${Icon ? 'pl-11' : ''} ${trailing ? 'pr-12' : ''}`}
        />
        {trailing && <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>}
      </span>
    </label>
  );
}

function Choice({ label, selected, onClick, icon: Icon }: { label: string; selected: boolean; onClick: () => void; icon?: IconType }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        selected ? 'border-brand-500 bg-brand-50 text-brand-900 ring-1 ring-brand-500' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      {Icon && <Icon size={18} className={selected ? 'text-brand-600' : 'text-slate-400'} />}
      <span className="text-sm font-medium flex-1">{label}</span>
      {selected && <Check size={18} className="text-brand-600" />}
    </button>
  );
}

function BigChoice({ title, description, icon: Icon, selected, onClick }: { title: string; description: string; icon: IconType; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative flex flex-col items-start gap-4 rounded-2xl border p-5 text-left transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        selected ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${selected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
        <Icon size={22} />
      </span>
      <span>
        <span className="block font-semibold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-sm text-slate-600">{description}</span>
      </span>
      {selected && (
        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function Flag({ code, className = '' }: { code: CountryCode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-600 ${className}`}
      role="img"
      aria-label={`Drapeau : ${COUNTRIES[code]}`}
    >
      {code}
    </span>
  );
}

function Avatar({ src, name, className = '' }: { src: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase(), [name]);
  return failed ? (
    <div className={`flex items-center justify-center rounded-full bg-slate-700 font-bold ${className}`} aria-label={name}>{initials}</div>
  ) : (
    <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className={`rounded-full object-cover ${className}`} />
  );
}

/* ========================================================================= */
/*  PAGE PRINCIPALE                                                            */
/* ========================================================================= */

export function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]): void => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const next = (): void => {
    const message = validateStep(step, form);
    if (message) return setError(message);
    setDirection('forward');
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const back = (): void => {
    setError('');
    setDirection('back');
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async (): Promise<void> => {
    const message = validateStep(TOTAL_STEPS, form);
    if (message) return setError(message);

    setIsLoading(true);
    setError('');

    const email = form.email.trim();
    const phone = form.phone.trim();
    const industry = form.industry === 'Autre' ? form.customIndustry.trim() : form.industry;
    const costLabel = COST_TIERS.find(t => t.id === form.previousCostTier)?.labels[form.currency] ?? '';

    try {
      // 1. Inscription Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            user_type: form.userType,
            phone: phone,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Échec de l\'inscription. Réessayez dans un instant.');

      // 2. Connexion automatique (contourne la confirmation email)
      let userId = authData.user.id;
      if (!authData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: form.password,
        });
        if (signInError || !signInData.session) {
          throw new Error('Compte créé mais connexion auto échouée. Désactivez "Confirm email" dans Supabase.');
        }
        userId = signInData.user.id;
      }

      // 3. Création de l'organisation
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: form.userType === 'company' ? form.companyName.trim() : form.fullName.trim(),
          email: email,
          phone: phone,
          address: form.city.trim(),
          user_type: form.userType,
          industry: industry,
          creates_quotes_self: form.createsQuotesSelf,
          delegate_phone: form.createsQuotesSelf ? null : form.delegatePhone.trim(),
          previous_quote_cost: costLabel,
          preferred_currency: form.currency,
          referral_source: form.referralSource,
          monthly_quote_volume: form.monthlyVolume,
          subscription_status: 'trial',
          subscription_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orgError) {
        console.error('Erreur création organisation:', orgError);
        throw new Error(orgError.message || 'Impossible de créer votre espace entreprise.');
      }

      // 4. Liaison User <-> Organization
      const { error: memberError } = await supabase.from('organization_members').insert({
        user_id: userId,
        organization_id: orgData.id,
        role: 'owner',
      });
      if (memberError) {
        console.error('Erreur liaison membre:', memberError);
        throw new Error(memberError.message || 'Erreur lors de la liaison utilisateur-organisation.');
      }

      // 5. Redirection immédiate
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setError(msg.includes('already registered') || msg.includes('already exists')
        ? 'Cette adresse e-mail est déjà utilisée. Veuillez vous connecter.'
        : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: FormEvent): void => {
    e.preventDefault();
    if (isLoading) return;
    if (step < TOTAL_STEPS) next();
    else void handleSubmit();
  };

  const renderStep = (): ReactNode => {
    switch (step) {
      case 1:
        return (
          <StepShell title="Vous créez vos devis en tant que…" subtitle="Nous adaptons votre espace et vos modèles de devis à votre situation.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BigChoice icon={UserRound} title="Particulier" description="Indépendant, freelance ou auto-entrepreneur." selected={form.userType === 'individual'} onClick={() => update('userType', 'individual')} />
              <BigChoice icon={Building2} title="Entreprise" description="Société, agence, cabinet ou équipe." selected={form.userType === 'company'} onClick={() => update('userType', 'company')} />
            </div>
          </StepShell>
        );
      case 2:
        return (
          <StepShell title={form.userType === 'company' ? 'Présentez votre entreprise' : 'Présentez-vous'} subtitle="Ces informations apparaîtront sur vos devis.">
            {form.userType === 'company' && (
              <Field label="Nom de l'entreprise" value={form.companyName} onChange={v => update('companyName', v)} placeholder="ex : Dakar Tech Solutions" icon={Building2} autoComplete="organization" autoFocus />
            )}
            <Field label={form.userType === 'company' ? 'Votre nom complet (responsable)' : 'Nom complet'} value={form.fullName} onChange={v => update('fullName', v)} placeholder="ex : Amadou Diallo" icon={User} autoComplete="name" autoFocus={form.userType !== 'company'} />
            <Field label="Ville et pays" value={form.city} onChange={v => update('city', v)} placeholder="ex : Lomé, Togo" icon={MapPin} autoComplete="address-level2" />
          </StepShell>
        );
      case 3:
        return (
          <StepShell title="Votre domaine d'activité" subtitle="Nous préparons des modèles de devis adaptés à votre métier.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INDUSTRIES.map(({ label, icon }) => (
                <Choice key={label} label={label} icon={icon} selected={form.industry === label} onClick={() => update('industry', label)} />
              ))}
            </div>
            {form.industry === 'Autre' && (
              <div className="dc-reveal mt-3">
                <Field label="Précisez votre domaine" value={form.customIndustry} onChange={v => update('customIndustry', v)} placeholder="ex : Agriculture, Transport…" icon={PenLine} autoFocus />
              </div>
            )}
          </StepShell>
        );
      case 4:
        return (
          <StepShell title="Qui crée vos devis ?" subtitle="Créez-les vous-même dans l'application, ou laissez notre équipe s'en charger.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BigChoice icon={Wand2} title="Je les crée moi-même" description="Je pilote tout depuis l'application." selected={form.createsQuotesSelf === true} onClick={() => update('createsQuotesSelf', true)} />
              <BigChoice icon={Users} title="Je veux déléguer" description="Notre équipe prépare vos devis pour vous." selected={form.createsQuotesSelf === false} onClick={() => update('createsQuotesSelf', false)} />
            </div>
            {form.createsQuotesSelf === false && (
              <div className="dc-reveal mt-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 space-y-3">
                <p className="flex items-center gap-2 text-sm font-medium text-brand-800">
                  <Phone size={16} /> Notre équipe vous contactera pour prendre en charge vos devis.
                </p>
                <Field label="Votre numéro de téléphone" type="tel" value={form.delegatePhone} onChange={v => update('delegatePhone', v)} placeholder="+228 90 00 00 00" icon={Phone} autoComplete="tel" autoFocus />
              </div>
            )}
          </StepShell>
        );
      case 5:
        return (
          <StepShell title="Votre volume d'activité" subtitle="Combien de devis créez-vous, ou faites-vous créer, par mois en moyenne ?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {VOLUMES.map(vol => (
                <Choice key={vol} label={vol} icon={BarChart3} selected={form.monthlyVolume === vol} onClick={() => update('monthlyVolume', vol)} />
              ))}
            </div>
          </StepShell>
        );
      case 6:
        return (
          <StepShell title="Votre historique" subtitle="Avant Devis Café, combien payiez-vous en moyenne pour un devis professionnel ?">
            <div role="radiogroup" className="inline-flex rounded-xl bg-slate-100 p-1 mb-4">
              {CURRENCIES.map(c => (
                <button key={c.id} type="button" role="radio" aria-checked={form.currency === c.id} onClick={() => update('currency', c.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${form.currency === c.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                  {c.label} <span className="text-slate-400 font-medium">{c.symbol}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COST_TIERS.map(tier => (
                <Choice key={tier.id} label={tier.labels[form.currency]} icon={Banknote} selected={form.previousCostTier === tier.id} onClick={() => update('previousCostTier', tier.id)} />
              ))}
            </div>
          </StepShell>
        );
      case 7:
        return (
          <StepShell title="Comment nous avez-vous trouvé ?" subtitle="Cela nous aide à savoir où être présents.">
            <div className="grid grid-cols-3 gap-3">
              {SOURCES.map(({ id, label, icon: Icon, tint }) => {
                const selected = form.referralSource === id;
                return (
                  <button key={id} type="button" aria-pressed={selected} onClick={() => update('referralSource', id)}
                    className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
                      selected ? 'border-brand-500 bg-brand-50 text-brand-900 ring-1 ring-brand-500' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105">
                      <Icon size={26} className={`shrink-0 ${tint ?? ''}`} />
                    </span>
                    {label}
                    {selected && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white"><Check size={12} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
          </StepShell>
        );
      case 8: {
        const score = passwordScore(form.password);
        const industry = form.industry === 'Autre' ? form.customIndustry : form.industry;
        return (
          <StepShell title="Dernière étape : votre accès" subtitle="Créez vos identifiants pour accéder immédiatement à votre espace.">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm space-y-2 mb-6">
              <SummaryRow label={form.userType === 'company' ? 'Entreprise' : 'Nom'} value={form.userType === 'company' ? form.companyName : form.fullName} />
              <SummaryRow label="Domaine" value={industry} />
              <SummaryRow label="Création des devis" value={form.createsQuotesSelf ? 'Par vous-même' : `Déléguée (${form.delegatePhone})`} />
            </div>

            <Field label="Numéro de téléphone" type="tel" value={form.phone} onChange={v => update('phone', v)} placeholder="+228 90 00 00 00" icon={Phone} autoComplete="tel" autoFocus />
            <Field label="Adresse e-mail" type="email" value={form.email} onChange={v => update('email', v)} placeholder="vous@entreprise.com" icon={Mail} autoComplete="email" />

            <div className="mt-4">
              <Field label="Mot de passe" type={showPassword ? 'text' : 'password'} value={form.password} onChange={v => update('password', v)} placeholder="8 caractères minimum" icon={Lock} autoComplete="new-password"
                trailing={
                  <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? 'Masquer' : 'Afficher'} className="p-1 text-slate-400 hover:text-slate-700 transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                } />
              {form.password && (
                <div className="mt-3 flex items-center gap-3" aria-live="polite">
                  <div className="flex flex-1 gap-1.5">
                    {[1, 2, 3, 4].map(i => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= score ? STRENGTH_COLORS[score] : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <span className="w-20 text-right text-xs font-medium text-slate-500">{STRENGTH_LABELS[score]}</span>
                </div>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 group mt-6">
              <input type="checkbox" checked={form.acceptTerms} onChange={e => update('acceptTerms', e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500 transition" />
              <span className="text-sm text-slate-600 group-hover:text-slate-900 transition leading-relaxed">
                J'accepte les <a href="/terms" target="_blank" rel="noreferrer" className="text-brand-600 underline decoration-brand-300 hover:decoration-brand-600">Conditions Générales</a> et la <a href="/privacy" target="_blank" rel="noreferrer" className="text-brand-600 underline decoration-brand-300 hover:decoration-brand-600">Politique de Confidentialité</a> de Devis Café.
              </span>
            </label>
          </StepShell>
        );
      }
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <GlobalStyles />
      <BrandPanel />

      <div className="relative flex w-full items-center justify-center p-5 sm:p-10 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 dc-grid-light" aria-hidden="true" />
        <div className="relative w-full max-w-lg">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/20">
              <Coffee className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Devis Café</span>
          </div>

          <div className="mb-8" aria-label={`Étape ${step} sur ${TOTAL_STEPS}`}>
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-900">{STEPS[step - 1].title}</span>
              <span className="text-slate-500">{step} / {TOTAL_STEPS}</span>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <span key={s.title} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>

          <form onSubmit={onFormSubmit} noValidate className="flex min-h-[28rem] flex-col rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-8">
            <div className="flex-1">
              <div key={step} className={direction === 'forward' ? 'dc-step-forward' : 'dc-step-back'}>
                {renderStep()}
              </div>
              {error && (
                <div role="alert" className="mt-6 flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
              <button type="button" onClick={back} disabled={step === 1 || isLoading}
                className={`flex items-center gap-2 text-sm font-medium transition ${step === 1 ? 'cursor-not-allowed text-slate-300' : 'text-slate-600 hover:text-slate-900 hover:-translate-x-0.5'}`}>
                <ArrowLeft size={16} /> Retour
              </button>

              {step < TOTAL_STEPS ? (
                <button type="submit" className="group flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950">
                  Continuer <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <button type="submit" disabled={isLoading}
                  className="group flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                  {isLoading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Création en cours…</>
                  ) : (
                    <>Créer mon espace <Check size={16} className="transition-transform group-hover:scale-110" /></>
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-8 text-center space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <ShieldCheck size={15} className="text-slate-400" />
              Vos données sont chiffrées et ne sont jamais revendues.
            </p>
            <p className="text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <a href="/login" className="font-semibold text-brand-600 hover:text-brand-700 transition">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================= */
/*  PANNEAU GAUCHE                                                             */
/* ========================================================================= */

function BrandPanel() {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    if (paused) { setLeaving(false); return; }
    let exitTimer: number | undefined;
    const dwellTimer = window.setTimeout(() => {
      setLeaving(true);
      exitTimer = window.setTimeout(() => {
        setIndex(i => (i + 1) % count);
        setLeaving(false);
      }, EXIT_MS);
    }, DWELL_MS);
    return () => { window.clearTimeout(dwellTimer); window.clearTimeout(exitTimer); };
  }, [paused, index, count]);

  const t = TESTIMONIALS[index];
  const go = (delta: number): void => {
    setLeaving(false);
    setIndex(i => (i + delta + count) % count);
  };

  return (
    <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-1/2 lg:flex-col lg:justify-between"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BACKGROUND_IMAGE})` }} aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/50" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-transparent to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 dc-grid-dark" aria-hidden="true" />

      <div className="relative z-10 flex items-center gap-3 p-12">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/30">
          <Coffee className="text-white" size={24} />
        </div>
        <span className="text-2xl font-bold tracking-tight">Devis Café</span>
      </div>

      <div className="relative z-10 overflow-hidden px-12 pb-12">
        <div key={index} className={leaving ? 'dc-quote-out' : 'dc-quote'}>
          <div className="mb-5 flex gap-1 text-amber-400" aria-label="5 étoiles sur 5">
            {[0, 1, 2, 3, 4].map(i => <Star key={i} size={18} fill="currentColor" />)}
          </div>
          <blockquote className="max-w-xl text-3xl font-semibold leading-snug tracking-tight">« {t.quote} »</blockquote>
          <div className="mt-8 flex items-center gap-4">
            <Avatar src={t.avatar} name={t.name} className="h-16 w-16 shrink-0 ring-2 ring-white/70" />
            <div className="min-w-0">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-slate-300">{t.role}</p>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-300">
                <Flag code={t.country} className="h-4 w-6 shrink-0 rounded-[3px] shadow ring-1 ring-white/30" />
                {t.city}, {COUNTRIES[t.country]}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4">
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Précédent" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur transition hover:bg-white/15"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => go(1)} aria-label="Suivant" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur transition hover:bg-white/15"><ChevronRight size={18} /></button>
          </div>
          <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
            <div className="dc-progress h-full w-full bg-white" style={{ animationDuration: `${DWELL_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }} />
          </div>
        </div>
        <p className="mt-8 text-sm text-slate-400">© {new Date().getFullYear()} Devis Café. Tous droits réservés.</p>
      </div>
    </aside>
  );
}

/* ========================================================================= */
/*  STYLES GLOBAUX                                                             */
/* ========================================================================= */

function GlobalStyles() {
  return (
    <style>{`
      .dc-grid-dark { background-image: linear-gradient(to right, rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.05) 1px, transparent 1px); background-size: 48px 48px; mask-image: radial-gradient(ellipse at 30% 20%, #000 0%, transparent 70%); }
      .dc-grid-light { background-image: linear-gradient(to right, rgba(15,23,42,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,.04) 1px, transparent 1px); background-size: 40px 40px; mask-image: radial-gradient(ellipse at 70% 10%, #000 0%, transparent 65%); }
      @keyframes dc-in-forward { from { opacity: 0; transform: translateX(18px); } to { opacity: 1; transform: none; } }
      @keyframes dc-in-back { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: none; } }
      @keyframes dc-quote { from { opacity: 0; transform: translateX(48px); } to { opacity: 1; transform: none; } }
      @keyframes dc-quote-out { from { opacity: 1; transform: none; } to { opacity: 0; transform: translateX(-64px); } }
      @keyframes dc-progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      @keyframes dc-reveal { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      .dc-step-forward { animation: dc-in-forward .4s cubic-bezier(.2,.7,.2,1) both; }
      .dc-step-back { animation: dc-in-back .4s cubic-bezier(.2,.7,.2,1) both; }
      .dc-quote { animation: dc-quote .6s cubic-bezier(.2,.7,.2,1) both; }
      .dc-quote-out { animation: dc-quote-out .5s cubic-bezier(.5,0,.75,0) both; }
      .dc-progress { transform-origin: left center; animation: dc-progress linear both; }
      .dc-reveal { animation: dc-reveal .3s ease-out both; }
      @media (prefers-reduced-motion: reduce) { .dc-step-forward, .dc-step-back, .dc-quote, .dc-quote-out, .dc-progress, .dc-reveal { animation: none; } }
    `}</style>
  );
}