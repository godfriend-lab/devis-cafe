import { useState } from 'react';
import type {
  ButtonHTMLAttributes,
  ChangeEvent,
  ComponentType,
  CSSProperties,
  FormEvent,
  ReactNode,
} from 'react';
import { Navbar } from '../landing/components/Navbar';
import { Footer } from '../landing/components/Footer';
import {
  Check,
  ChevronDown,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

interface FAQItem {
  question: string;
  answer: string;
}

interface Step {
  label: string;
  ms: number;
}

interface PaymentResult {
  method?: string;
  failure?: string;
  pending?: boolean;
  reference?: string;
}

type PayFn = (steps: Step[], result: PaymentResult) => Promise<void>;

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

type CardErrors = Partial<Record<keyof CardData, string>>;

interface BankDetails {
  beneficiary: string;
  iban: string;
  bic: string;
}

type OperatorId = 'yas' | 'moov' | 'orange' | 'mtn' | 'wave' | 'free' | 'airtel';

interface Operator {
  id: OperatorId;
  name: string;
  hint: string;
}

interface Country {
  id: string;
  name: string;
  dial: string;
  placeholder: string;
  operators: OperatorId[];
}

interface Method {
  id: 'card' | 'paypal' | 'mobile' | 'transfer';
  label: string;
  Icon: ComponentType<{ size?: number }> | null;
}

interface ProcessingStep {
  label: string;
  progress: number;
}

interface ReceiptData {
  reference: string;
  method: string;
  date: Date;
  pending: boolean;
}

interface FormProps {
  pay: PayFn;
  checkEmail: () => boolean;
}

interface LogoProps {
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Données                                                                    */
/* -------------------------------------------------------------------------- */

const PRICE_FCFA = 10000;
const EUR_RATE = 655.957;
const PRICE_EUR = PRICE_FCFA / EUR_RATE;
const DASHBOARD_URL = '/dashboard';

/** Placez yas-mixx.png et moov-money.png dans /public/payment-logos/ */
const LOGO_PATH = '/payment-logos';

const BANK: BankDetails = {
  beneficiary: 'Devis Café',
  iban: 'FR76 3000 6000 0112 3456 7890 189',
  bic: 'AGRIFRPP',
};

const features: string[] = [
  'Devis illimités',
  'Génération PDF professionnelle',
  'Historique complet',
  'Multi-devises (FCFA, EUR, USD)',
  'Personnalisation complète',
  'Support prioritaire',
  'Mises à jour gratuites',
  'Sauvegarde automatique',
  'Gestion des clients',
  'Calculs automatiques',
  'Templates professionnels',
  'Accès mobile et desktop',
];

const OPERATORS: Record<OperatorId, Operator> = {
  yas: {
    id: 'yas',
    name: 'Mixx by Yas',
    hint: 'Validez la demande avec votre code secret Mixx by Yas.',
  },
  moov: {
    id: 'moov',
    name: 'Moov Money',
    hint: 'Validez la demande avec votre code secret Moov Money.',
  },
  orange: {
    id: 'orange',
    name: 'Orange Money',
    hint: 'Validez la demande avec votre code secret Orange Money.',
  },
  mtn: {
    id: 'mtn',
    name: 'MTN MoMo',
    hint: 'Validez la demande avec votre code PIN MoMo.',
  },
  wave: {
    id: 'wave',
    name: 'Wave',
    hint: 'Ouvrez l’application Wave pour confirmer le paiement.',
  },
  free: {
    id: 'free',
    name: 'Free Money',
    hint: 'Validez la demande avec votre code secret Free Money.',
  },
  airtel: {
    id: 'airtel',
    name: 'Airtel Money',
    hint: 'Validez la demande avec votre code PIN Airtel Money.',
  },
};

const COUNTRIES: Country[] = [
  { id: 'tg', name: 'Togo', dial: '+228', placeholder: '90 00 00 00', operators: ['yas', 'moov'] },
  { id: 'bj', name: 'Bénin', dial: '+229', placeholder: '01 97 00 00 00', operators: ['mtn', 'moov'] },
  {
    id: 'ci',
    name: 'Côte d’Ivoire',
    dial: '+225',
    placeholder: '07 00 00 00 00',
    operators: ['orange', 'mtn', 'moov', 'wave'],
  },
  {
    id: 'sn',
    name: 'Sénégal',
    dial: '+221',
    placeholder: '77 000 00 00',
    operators: ['orange', 'wave', 'free', 'yas'],
  },
  { id: 'ml', name: 'Mali', dial: '+223', placeholder: '70 00 00 00', operators: ['orange', 'moov'] },
  { id: 'bf', name: 'Burkina Faso', dial: '+226', placeholder: '70 00 00 00', operators: ['orange', 'moov'] },
  { id: 'ne', name: 'Niger', dial: '+227', placeholder: '90 00 00 00', operators: ['airtel', 'orange', 'moov'] },
  { id: 'cm', name: 'Cameroun', dial: '+237', placeholder: '6 70 00 00 00', operators: ['orange', 'mtn'] },
];

const faq: FAQItem[] = [
  {
    question: 'Y a-t-il une période d’essai ?',
    answer:
      'Oui. Vous bénéficiez de 7 jours d’essai gratuit avec accès à toutes les fonctionnalités. Aucune carte bancaire requise.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer:
      'Absolument. Vous pouvez annuler votre abonnement à tout moment. Vous conservez l’accès jusqu’à la fin de la période payée.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Les cartes Visa et Mastercard (traitées par Stripe), PayPal, le virement bancaire et le Mobile Money : Mixx by Yas, Moov Money, Orange Money, MTN MoMo, Wave, Free Money et Airtel Money selon votre pays.',
  },
  {
    question: 'Dans quels pays puis-je payer par Mobile Money ?',
    answer:
      'Togo, Bénin, Côte d’Ivoire, Sénégal, Mali, Burkina Faso, Niger et Cameroun. Les opérateurs proposés s’adaptent automatiquement au pays que vous sélectionnez.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Oui. Vos données sont chiffrées et hébergées sur des serveurs sécurisés. Les paiements par carte sont traités par Stripe, certifié PCI DSS niveau 1 : nous ne voyons ni ne stockons vos numéros de carte.',
  },
  {
    question: 'Puis-je exporter mes devis ?',
    answer:
      'Oui. Vous pouvez télécharger tous vos devis en PDF à tout moment. Vous gardez le contrôle total de vos données.',
  },
];

const METHODS: Method[] = [
  { id: 'card', label: 'Carte', Icon: CreditCard },
  { id: 'mobile', label: 'Mobile Money', Icon: Smartphone },
  { id: 'paypal', label: 'PayPal', Icon: null },
  { id: 'transfer', label: 'Virement', Icon: Landmark },
];

/* -------------------------------------------------------------------------- */
/*  Utilitaires                                                                */
/* -------------------------------------------------------------------------- */

const fcfa = (n: number): string => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;
const eur = (n: number): string =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
const makeReference = (): string => `DC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function detectBrand(digits: string): string | null {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digits)) return 'mastercard';
  return null;
}

function passesLuhn(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function validateCard(card: CardData): CardErrors {
  const errors: CardErrors = {};
  const digits = card.number.replace(/\s/g, '');

  if (digits.length !== 16 || !passesLuhn(digits)) {
    errors.number = 'Numéro de carte invalide';
  } else if (!detectBrand(digits)) {
    errors.number = 'Seules les cartes Visa et Mastercard sont acceptées';
  }

  const match = /^(\d{2})\/(\d{2})$/.exec(card.expiry);
  if (!match) {
    errors.expiry = 'Format MM/AA';
  } else {
    const month = Number(match[1]);
    const year = 2000 + Number(match[2]);
    const now = new Date();
    const expired =
      year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
    if (month < 1 || month > 12 || expired) errors.expiry = 'Carte expirée ou date invalide';
  }

  if (!/^\d{3}$/.test(card.cvc)) errors.cvc = '3 chiffres requis';
  if (card.name.trim().length < 2) errors.name = 'Nom du titulaire requis';

  return errors;
}

/* -------------------------------------------------------------------------- */
/*  Logos                                                                      */
/*  Yas Mixx et Moov Africa : fichiers officiels fournis (PNG).                */
/*  Autres opérateurs : reproductions vectorielles, à remplacer par les        */
/*  fichiers officiels de chaque marque si vous les obtenez.                   */
/* -------------------------------------------------------------------------- */

const FONT = 'Helvetica Neue, Helvetica, Arial, sans-serif';

function VisaLogo({ className = 'h-6 w-auto', mono = false }: { className?: string; mono?: boolean }) {
  return (
    <svg viewBox="0 0 64 22" role="img" aria-label="Visa" className={className}>
      <text
        x="1"
        y="18"
        fontFamily={FONT}
        fontWeight="900"
        fontStyle="italic"
        fontSize="23"
        letterSpacing="-1"
        fill={mono ? '#FFFFFF' : '#1A1F71'}
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardLogo({ className = 'h-6 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 40 24" role="img" aria-label="Mastercard" className={className}>
      <circle cx="14" cy="12" r="12" fill="#EB001B" />
      <circle cx="26" cy="12" r="12" fill="#F79E1B" />
      <path d="M20 1.61A12 12 0 0 1 20 22.39A12 12 0 0 1 20 1.61z" fill="#FF5F00" />
    </svg>
  );
}

function PayPalLogo({ className = 'h-5 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 84 22" role="img" aria-label="PayPal" className={className}>
      <text
        x="1"
        y="18"
        fontFamily={FONT}
        fontWeight="800"
        fontStyle="italic"
        fontSize="21"
        letterSpacing="-0.5"
      >
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    </svg>
  );
}

function StripeLogo({ className = 'h-5 w-auto' }: LogoProps) {
  return (
    <svg viewBox="0 0 60 22" role="img" aria-label="Stripe" className={className}>
      <text
        x="1"
        y="17"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="21"
        letterSpacing="-0.8"
        fill="#635BFF"
      >
        stripe
      </text>
    </svg>
  );
}

/* Logos opérateurs : tous au format 2:1 (80 × 40) pour un alignement parfait */

function YasMixxLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <img
      src={`${LOGO_PATH}/yas-mixx.png`}
      alt="Mixx by Yas"
      className={`${className} rounded-lg object-cover`}
      draggable={false}
    />
  );
}

function MoovLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <img
      src={`${LOGO_PATH}/moov-money.png`}
      alt="Moov Money"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}

function OrangeMoneyLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 40" role="img" aria-label="Orange Money" className={`${className} rounded-lg`}>
      <rect width="80" height="40" fill="#FF7900" />
      <text x="7" y="19" fontFamily={FONT} fontWeight="700" fontSize="9" fill="#FFFFFF">
        money
      </text>
      <text x="7" y="33" fontFamily={FONT} fontWeight="700" fontSize="14" fill="#FFFFFF">
        orange
      </text>
    </svg>
  );
}

function MtnLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 40" role="img" aria-label="MTN MoMo" className={`${className} rounded-lg`}>
      <rect width="80" height="40" fill="#FFCC00" />
      <text
        x="40"
        y="21"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="900"
        fontSize="19"
        fill="#000000"
      >
        MTN
      </text>
      <text
        x="40"
        y="34"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="10"
        fill="#000000"
      >
        MoMo
      </text>
    </svg>
  );
}

function WaveLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 40" role="img" aria-label="Wave" className={`${className} rounded-lg`}>
      <rect width="80" height="40" fill="#1DC8FF" />
      <path
        d="M16 22c5-10 10-10 12 0s7 10 12 0 7-10 12 0 5 7 9 2"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function FreeMoneyLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 40" role="img" aria-label="Free Money" className={`${className} rounded-lg`}>
      <rect width="80" height="40" fill="#CD1E25" />
      <text
        x="40"
        y="24"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="900"
        fontSize="22"
        letterSpacing="-0.5"
        fill="#FFFFFF"
      >
        free
      </text>
      <text
        x="40"
        y="35"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="8.5"
        fill="#FFFFFF"
      >
        money
      </text>
    </svg>
  );
}

function AirtelMoneyLogo({ className = 'h-10 w-20' }: LogoProps) {
  return (
    <svg viewBox="0 0 80 40" role="img" aria-label="Airtel Money" className={`${className} rounded-lg`}>
      <rect width="80" height="40" fill="#E40000" />
      <text
        x="40"
        y="23"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="800"
        fontSize="17"
        letterSpacing="-0.5"
        fill="#FFFFFF"
      >
        airtel
      </text>
      <text
        x="40"
        y="34"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="700"
        fontSize="8.5"
        fill="#FFFFFF"
      >
        money
      </text>
    </svg>
  );
}

const OPERATOR_LOGOS: Record<OperatorId, ComponentType<LogoProps>> = {
  yas: YasMixxLogo,
  moov: MoovLogo,
  orange: OrangeMoneyLogo,
  mtn: MtnLogo,
  wave: WaveLogo,
  free: FreeMoneyLogo,
  airtel: AirtelMoneyLogo,
};

/* -------------------------------------------------------------------------- */
/*  Carte bancaire interactive                                                 */
/* -------------------------------------------------------------------------- */

function CardPreview({
  number,
  name,
  expiry,
  cvc,
  brand,
  flipped,
}: CardData & { brand: string | null; flipped: boolean }) {
  const masked = number.replace(/\s/g, '').padEnd(16, '•').match(/.{4}/g)?.join(' ') || '';

  const face: CSSProperties = {
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    background: 'radial-gradient(120% 140% at 0% 0%, #1f2a44 0%, #0b1220 62%)',
  };

  return (
    <div className="mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
      <div
        className="relative aspect-[1.586/1] w-full transition-transform duration-700 ease-out motion-reduce:transition-none"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'none' }}
      >
        {/* Recto */}
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl p-6 text-white shadow-xl ring-1 ring-white/10"
          style={face}
        >
          <div className="flex items-start justify-between">
            <div className="h-8 w-11 rounded-md bg-linear-to-br from-amber-200 to-amber-400 p-0.75">
              <div className="h-full w-full rounded-sm border border-amber-600/40" />
            </div>
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-white/70"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M8 8c2 2.5 2 5.5 0 8" />
              <path d="M12 5.5c3.5 4 3.5 9 0 13" />
              <path d="M16 3c5 5.5 5 12.5 0 18" />
            </svg>
          </div>

          <div className="font-mono text-[1.15rem] tracking-[0.12em] tabular-nums sm:text-xl">{masked}</div>

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="text-[10px] text-white/50">Titulaire</div>
              <div className="truncate text-sm font-medium">{name.trim() || 'Nom Prénom'}</div>
            </div>
            <div>
              <div className="text-[10px] text-white/50">Expire</div>
              <div className="text-sm font-medium tabular-nums">{expiry || 'MM/AA'}</div>
            </div>
            <div className="flex h-7 w-14 items-center justify-end">
              {brand === 'visa' && <VisaLogo mono className="h-6 w-auto" />}
              {brand === 'mastercard' && <MastercardLogo className="h-7 w-auto" />}
            </div>
          </div>
        </div>

        {/* Verso */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl text-white shadow-xl ring-1 ring-white/10"
          style={{ ...face, transform: 'rotateY(180deg)' }}
        >
          <div className="mt-7 h-11 bg-black" />
          <div className="mx-6 mt-6">
            <div className="text-[10px] text-white/50">Code de sécurité</div>
            <div className="mt-1 flex h-10 items-center justify-end rounded-md bg-white px-4 font-mono text-base italic tracking-widest text-slate-900 tabular-nums">
              {cvc || '•••'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Champs                                                                     */
/* -------------------------------------------------------------------------- */

const inputClass = (error?: string): string =>
  `h-12 w-full rounded-xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100'
  }`;

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

function PayButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="submit"
      className={`flex h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-slate-950 text-base font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-200 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Formulaires par moyen de paiement                                          */
/* -------------------------------------------------------------------------- */

function CardForm({ pay, checkEmail }: FormProps) {
  const [card, setCard] = useState<CardData>({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<CardErrors>({});
  const [flipped, setFlipped] = useState(false);

  const digits = card.number.replace(/\s/g, '');
  const brand = detectBrand(digits);
  const update = (key: keyof CardData, value: string): void =>
    setCard((prev) => ({ ...prev, [key]: value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailOk = checkEmail();
    const found = validateCard(card);
    setErrors(found);
    if (!emailOk || Object.keys(found).length > 0) return;

    const declined = digits === '4000000000000002';
    void pay(
      [
        { label: 'Chiffrement des informations de carte', ms: 700 },
        { label: 'Contact avec votre banque', ms: 1100 },
        { label: 'Authentification 3-D Secure', ms: 1100 },
      ],
      {
        method: `${brand === 'visa' ? 'Visa' : 'Mastercard'} •••• ${digits.slice(-4)}`,
        failure: declined ? 'Votre carte a été refusée par l’émetteur. Essayez une autre carte.' : '',
      },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <CardPreview {...card} brand={brand} flipped={flipped} />

      <div className="space-y-4">
        <Field label="Numéro de carte" error={errors.number}>
          <div className="relative">
            <input
              className={`${inputClass(errors.number)} pr-20 font-mono tabular-nums`}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="1234 5678 9012 3456"
              value={card.number}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update('number', formatCardNumber(e.target.value))}
            />
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
              {brand === 'visa' && <VisaLogo className="h-5 w-auto" />}
              {brand === 'mastercard' && <MastercardLogo className="h-6 w-auto" />}
            </div>
          </div>
        </Field>

        <Field label="Nom du titulaire" error={errors.name}>
          <input
            className={inputClass(errors.name)}
            autoComplete="cc-name"
            placeholder="Comme indiqué sur la carte"
            value={card.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => update('name', e.target.value.replace(/[0-9]/g, ''))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date d’expiration" error={errors.expiry}>
            <input
              className={`${inputClass(errors.expiry)} tabular-nums`}
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder="MM/AA"
              value={card.expiry}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update('expiry', formatExpiry(e.target.value))}
            />
          </Field>
          <Field label="Code de sécurité" error={errors.cvc}>
            <input
              className={`${inputClass(errors.cvc)} tabular-nums`}
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="CVC"
              value={card.cvc}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                update('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))
              }
            />
          </Field>
        </div>
      </div>

      <PayButton>
        <Lock size={18} />
        Payer {fcfa(PRICE_FCFA)}
      </PayButton>

      <p className="text-center text-sm text-slate-500">
        Carte de test :{' '}
        <button
          type="button"
          className="font-medium text-slate-700 underline underline-offset-2 hover:text-slate-950"
          onClick={() =>
            setCard({ number: '4242 4242 4242 4242', name: 'Awa Koffi', expiry: '12/30', cvc: '123' })
          }
        >
          remplir automatiquement
        </button>
      </p>
    </form>
  );
}

function PayPalForm({ pay, checkEmail }: FormProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkEmail()) return;
    void pay(
      [
        { label: 'Redirection vers PayPal', ms: 900 },
        { label: 'Connexion à votre compte PayPal', ms: 1100 },
        { label: 'Autorisation du paiement', ms: 1100 },
      ],
      { method: 'PayPal' },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <PayPalLogo className="h-6 w-auto" />
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-slate-600">
          Vous serez redirigé vers PayPal pour confirmer le paiement avec votre solde ou une carte
          enregistrée. Montant débité : <span className="font-semibold text-slate-900">{eur(PRICE_EUR)}</span>.
        </p>
      </div>

      <button
        type="submit"
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#FFC439] text-base font-semibold text-slate-900 transition hover:bg-[#f5b92a] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200"
      >
        Payer avec <PayPalLogo className="h-5 w-auto" />
      </button>
    </form>
  );
}

function MobileMoneyForm({ pay, checkEmail }: FormProps) {
  const [countryId, setCountryId] = useState('tg');
  const [operatorId, setOperatorId] = useState<OperatorId>('yas');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const country = COUNTRIES.find((item) => item.id === countryId) ?? COUNTRIES[0];
  const operator = OPERATORS[operatorId];

  const changeCountry = (id: string): void => {
    const next = COUNTRIES.find((item) => item.id === id) ?? COUNTRIES[0];
    setCountryId(next.id);
    if (!next.operators.includes(operatorId)) setOperatorId(next.operators[0]);
    setError('');
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailOk = checkEmail();
    const length = phone.replace(/\D/g, '').length;
    const valid = length >= 8 && length <= 10;
    setError(valid ? '' : 'Saisissez un numéro de téléphone valide');
    if (!emailOk || !valid) return;

    void pay(
      [
        { label: `Demande envoyée à ${operator.name}`, ms: 1000 },
        { label: 'En attente de la validation sur votre téléphone', ms: 2200 },
        { label: 'Confirmation du paiement', ms: 900 },
      ],
      { method: `${operator.name} ${country.dial} ${phone.trim()}` },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label="Pays">
        <div className="relative">
          <select
            className={`${inputClass()} appearance-none pr-11`}
            value={countryId}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => changeCountry(e.target.value)}
          >
            {COUNTRIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.dial})
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Opérateur</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {country.operators.map((id) => {
            const Logo = OPERATOR_LOGOS[id];
            const selected = operatorId === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={selected}
                onClick={() => setOperatorId(id)}
                className={`relative flex h-28 flex-col items-center justify-center gap-3 rounded-2xl border bg-white text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                  selected
                    ? 'border-slate-950 text-slate-950 ring-1 ring-slate-950'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {selected && (
                  <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950">
                    <Check size={12} strokeWidth={3} className="text-white" />
                  </span>
                )}
                <Logo className="h-10 w-20" />
                {OPERATORS[id].name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label="Numéro de téléphone" error={error}>
        <div className="flex gap-2">
          <span className="flex h-12 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-[15px] font-medium tabular-nums text-slate-700">
            {country.dial}
          </span>
          <input
            className={`${inputClass(error)} tabular-nums`}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={country.placeholder}
            value={phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
          />
        </div>
      </Field>

      <PayButton>
        <Lock size={18} />
        Payer {fcfa(PRICE_FCFA)} avec {operator.name}
      </PayButton>

      <p className="text-center text-sm text-slate-500">{operator.hint}</p>
    </form>
  );
}

function TransferForm({ pay, checkEmail, reference }: FormProps & { reference: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkEmail()) return;
    void pay([{ label: 'Enregistrement de votre référence de virement', ms: 1200 }], {
      method: 'Virement bancaire',
      pending: true,
      reference,
    });
  };

  const rows: [string, string][] = [
    ['Bénéficiaire', BANK.beneficiary],
    ['IBAN', BANK.iban],
    ['BIC', BANK.bic],
    ['Montant', eur(PRICE_EUR)],
  ];

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <dl className="divide-y divide-slate-200 rounded-2xl border border-slate-200 text-[15px]">
        {rows.map(([term, value]) => (
          <div key={term} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <dt className="text-slate-500">{term}</dt>
            <dd className="text-right font-medium tabular-nums text-slate-900">{value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 bg-slate-50 px-5 py-3.5">
          <dt className="text-slate-500">Référence à indiquer</dt>
          <dd className="flex items-center gap-3">
            <span className="font-mono font-semibold text-slate-900">{reference}</span>
            <button
              type="button"
              onClick={copy}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 transition hover:border-slate-300"
            >
              {copied ? 'Copié' : 'Copier'}
            </button>
          </dd>
        </div>
      </dl>

      <PayButton>J’ai effectué le virement</PayButton>

      <p className="text-center text-sm text-slate-500">
        Votre accès est activé dès réception des fonds, généralement sous 24 à 48 h.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  États : traitement et confirmation                                         */
/* -------------------------------------------------------------------------- */

function ProcessingOverlay({ step }: { step: ProcessingStep }) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-3xl bg-white/92 px-8 text-center backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="animate-spin text-brand-600" size={36} />
      <div>
        <p className="text-lg font-semibold text-slate-900">{step.label}</p>
        <p className="mt-1 text-sm text-slate-500">Ne fermez pas cette page.</p>
      </div>
      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-600 transition-all duration-700 ease-out"
          style={{ width: `${step.progress}%` }}
        />
      </div>
    </div>
  );
}

function Receipt({
  receipt,
  email,
  onReset,
}: {
  receipt: ReceiptData;
  email: string;
  onReset: () => void;
}) {
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(
    receipt.date,
  );
  const rows: [string, string][] = [
    ['Référence', receipt.reference],
    ['Moyen de paiement', receipt.method],
    ['Date', date],
    ['Montant', fcfa(PRICE_FCFA)],
    ['Reçu envoyé à', email],
  ];

  return (
    <div className="p-8 sm:p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/60">
        <Check className="text-emerald-600" size={28} strokeWidth={2.5} />
      </div>
      <h2 className="mt-6 text-2xl font-semibold text-slate-900">
        {receipt.pending ? 'Virement enregistré' : 'Paiement confirmé'}
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
        {receipt.pending
          ? 'Votre abonnement sera activé dès réception des fonds.'
          : 'Votre abonnement annuel est actif. Vous pouvez créer votre premier devis dès maintenant.'}
      </p>

      <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 text-[15px]">
        {rows.map(([term, value]) => (
          <div key={term} className="flex items-center justify-between gap-6 px-5 py-3.5">
            <dt className="text-slate-500">{term}</dt>
            <dd className="truncate text-right font-medium tabular-nums text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      <a
        href={DASHBOARD_URL}
        className="mt-8 flex h-14 w-full items-center justify-center rounded-xl bg-slate-950 text-base font-semibold text-white transition hover:bg-slate-800"
      >
        Accéder à mon espace
      </a>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 w-full text-center text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        Revenir au paiement
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Panneau de paiement                                                        */
/* -------------------------------------------------------------------------- */

function Checkout() {
  const [method, setMethod] = useState<Method['id']>('card');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [step, setStep] = useState<ProcessingStep>({ label: '', progress: 0 });
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [transferReference] = useState(makeReference);

  const checkEmail = (): boolean => {
    const valid = EMAIL_RE.test(email.trim());
    setEmailError(valid ? '' : 'Saisissez une adresse e-mail valide');
    return valid;
  };

  const pay: PayFn = async (steps, result = {}) => {
    setError('');
    setStatus('processing');

    for (let i = 0; i < steps.length; i += 1) {
      setStep({ label: steps[i].label, progress: ((i + 1) / steps.length) * 100 });
      // eslint-disable-next-line no-await-in-loop
      await wait(steps[i].ms);
    }

    if (result.failure) {
      setError(result.failure);
      setStatus('idle');
      return;
    }

    setReceipt({
      reference: result.reference || makeReference(),
      method: result.method || 'Inconnu',
      date: new Date(),
      pending: result.pending || false,
    });
    setStatus('success');
  };

  const reset = (): void => {
    setStatus('idle');
    setReceipt(null);
    setError('');
  };

  const selectMethod = (id: Method['id']): void => {
    setMethod(id);
    setError('');
  };

  const formProps: FormProps = { pay, checkEmail };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
      {status === 'processing' && <ProcessingOverlay step={step} />}

      {status === 'success' && receipt ? (
        <Receipt receipt={receipt} email={email} onReset={reset} />
      ) : (
        <div className="p-6 sm:p-10">
          <h2 className="text-xl font-semibold text-slate-900">Paiement</h2>

          <div className="mt-6">
            <Field label="Adresse e-mail pour le reçu" error={emailError}>
              <input
                className={inputClass(emailError)}
                type="email"
                autoComplete="email"
                placeholder="vous@entreprise.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              />
            </Field>
          </div>

          <div
            role="tablist"
            aria-label="Moyen de paiement"
            className="mt-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 sm:grid-cols-4"
          >
            {METHODS.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={method === id}
                onClick={() => selectMethod(id)}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                  method === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {Icon && <Icon size={16} />}
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="mt-8">
            {method === 'card' && <CardForm {...formProps} />}
            {method === 'mobile' && <MobileMoneyForm {...formProps} />}
            {method === 'paypal' && <PayPalForm {...formProps} />}
            {method === 'transfer' && <TransferForm {...formProps} reference={transferReference} />}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Lock size={15} />
              Connexion chiffrée
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={15} />
              Certifié PCI DSS
            </span>
            <span className="flex items-center gap-2">
              Cartes traitées par <StripeLogo className="h-5 w-auto" />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Récapitulatif du plan                                                      */
/* -------------------------------------------------------------------------- */

function PlanSummary() {
  return (
    <aside className="rounded-3xl bg-slate-950 p-8 text-white sm:p-10 lg:sticky lg:top-24">
      <h2 className="text-lg font-medium text-slate-300">Plan Annuel</h2>

      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-6xl font-semibold tracking-tight tabular-nums">10 000</span>
        <span className="text-xl font-medium text-slate-400">FCFA par an</span>
      </div>
      <p className="mt-3 text-[15px] text-slate-400">
        Soit {eur(PRICE_EUR)} au taux fixe XOF/EUR, ou {fcfa(Math.round(PRICE_FCFA / 12))} par mois.
      </p>
      <p className="mt-5 inline-block rounded-full bg-emerald-400/10 px-3.5 py-1.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/20">
        50 % moins cher que l’abonnement mensuel
      </p>

      <ul className="mt-9 grid gap-x-6 gap-y-3.5 border-t border-white/10 pt-9 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-[15px] text-slate-200">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Check size={12} strokeWidth={3} className="text-emerald-300" />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <dl className="mt-9 space-y-3 border-t border-white/10 pt-6 text-[15px]">
        <div className="flex justify-between text-slate-400">
          <dt>Plan Annuel, 12 mois</dt>
          <dd className="tabular-nums">{fcfa(PRICE_FCFA)}</dd>
        </div>
        <div className="flex justify-between text-slate-400">
          <dt>Essai gratuit de 7 jours</dt>
          <dd>Inclus</dd>
        </div>
        <div className="flex justify-between pt-2 text-lg font-semibold text-white">
          <dt>Total</dt>
          <dd className="tabular-nums">{fcfa(PRICE_FCFA)}</dd>
        </div>
      </dl>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Couverture des moyens de paiement                                          */
/* -------------------------------------------------------------------------- */

function PaymentCoverage() {
  return (
    <div className="mx-auto mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Payez comme vous en avez l’habitude
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          Cartes internationales, PayPal, virement et Mobile Money dans huit pays d’Afrique de l’Ouest et
          centrale.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-slate-200 py-6">
        <span className="text-sm font-medium text-slate-500">Cartes et en ligne</span>
        <VisaLogo className="h-5 w-auto" />
        <MastercardLogo className="h-6 w-auto" />
        <PayPalLogo className="h-5 w-auto" />
        <StripeLogo className="h-5 w-auto" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COUNTRIES.map((country) => (
          <div key={country.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold text-slate-900">{country.name}</h3>
              <span className="text-sm tabular-nums text-slate-400">{country.dial}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {country.operators.map((id) => {
                const Logo = OPERATOR_LOGOS[id];
                return (
                  <span key={id} title={OPERATORS[id].name}>
                    <Logo className="h-8 w-16" />
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-slate-500">
        Tous les paiements Mobile Money sont réglés en FCFA. Les marques citées appartiennent à leurs
        propriétaires respectifs.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FAQ                                                                        */
/* -------------------------------------------------------------------------- */

function FaqItem({ item, open, onToggle }: { item: FAQItem; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-200">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium text-slate-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
        >
          {item.question}
          <ChevronDown
            size={20}
            className={`shrink-0 text-slate-400 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
      </h3>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-2xl pb-6 leading-relaxed text-slate-600">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export function PricingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* En-tête */}
      <section className="pt-28 pb-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl sm:leading-[1.05]">
            Un seul plan, toutes les fonctionnalités.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            10 000 FCFA pour 12 mois d’accès complet. Aucun frais caché, aucune option payante.
          </p>
        </div>
      </section>

      {/* Paiement */}
      <section id="paiement" className="scroll-mt-24 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-8">
          <PlanSummary />
          <Checkout />
        </div>

        <PaymentCoverage />
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 max-w-sm text-lg text-slate-600">
              Tout ce qu’il faut savoir avant de vous abonner.
            </p>
          </div>

          <div className="border-t border-slate-200">
            {faq.map((item, index) => (
              <FaqItem
                key={item.question}
                item={item}
                open={openFaq === index}
                onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-slate-950 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Prêt à simplifier vos devis ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Rejoignez les professionnels qui font déjà confiance à Devis Café.
          </p>
          <a
            href="#paiement"
            className="mt-8 inline-flex h-14 items-center rounded-xl bg-white px-8 text-base font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Passer au paiement
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}