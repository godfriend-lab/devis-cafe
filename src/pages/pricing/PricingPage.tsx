import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
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

interface Feature {
  label: string;
  ms: number;
}

interface PaymentResult {
  method?: string;
  failure?: string;
  pending?: boolean;
  reference?: string;
}

interface CardData {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
}

interface CardErrors {
  number?: string;
  name?: string;
  expiry?: string;
  cvc?: string;
}

interface BankDetails {
  beneficiary: string;
  iban: string;
  bic: string;
}

interface Operator {
  id: string;
  name: string;
  Logo: React.ComponentType<{ className?: string }>;
}

interface Method {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }> | null;
}

interface ProcessingStep {
  label: string;
  progress: number;
}

interface Receipt {
  reference: string;
  method: string;
  date: Date;
  pending: boolean;
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

interface PayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface CardPreviewProps {
  number: string;
  name: string;
  expiry: string;
  cvc: string;
  brand: string | null;
  flipped: boolean;
}

interface CardFormProps {
  pay: (steps: Feature[], result: PaymentResult) => Promise<void>;
  checkEmail: () => boolean;
}

interface PayPalFormProps {
  pay: (steps: Feature[], result: PaymentResult) => Promise<void>;
  checkEmail: () => boolean;
}

interface MobileMoneyFormProps {
  pay: (steps: Feature[], result: PaymentResult) => Promise<void>;
  checkEmail: () => boolean;
}

interface TransferFormProps {
  pay: (steps: Feature[], result: PaymentResult) => Promise<void>;
  checkEmail: () => boolean;
  reference: string;
}

interface ProcessingOverlayProps {
  step: ProcessingStep;
}

interface ReceiptProps {
  receipt: Receipt;
  email: string;
  onReset: () => void;
}

interface FaqItemComponentProps {
  item: FAQItem;
  open: boolean;
  onToggle: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Données                                                                    */
/* -------------------------------------------------------------------------- */

const PRICE_FCFA = 10000;
const EUR_RATE = 655.957;
const PRICE_EUR = PRICE_FCFA / EUR_RATE;
const DASHBOARD_URL = '/dashboard';

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

const faq: FAQItem[] = [
  {
    question: 'Y a-t-il une période d\'essai ?',
    answer:
      'Oui. Vous bénéficiez de 7 jours d\'essai gratuit avec accès à toutes les fonctionnalités. Aucune carte bancaire requise.',
  },
  {
    question: 'Puis-je annuler à tout moment ?',
    answer:
      'Absolument. Vous pouvez annuler votre abonnement à tout moment. Vous conservez l\'accès jusqu\'à la fin de la période payée.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer:
      'Les cartes Visa et Mastercard (traitées par Stripe), PayPal, Orange Money, MTN MoMo, Wave et le virement bancaire.',
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

const MOBILE_OPERATORS: Operator[] = [
  { id: 'orange', name: 'Orange Money', Logo: OrangeMoneyLogo },
  { id: 'mtn', name: 'MTN MoMo', Logo: MtnLogo },
  { id: 'wave', name: 'Wave', Logo: WaveLogo },
];

const METHODS: Method[] = [
  { id: 'card', label: 'Carte', Icon: CreditCard },
  { id: 'paypal', label: 'PayPal', Icon: null },
  { id: 'mobile', label: 'Mobile Money', Icon: Smartphone },
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
/*  Logos (vectoriels)                                                         */
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

function MastercardLogo({ className = 'h-6 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" role="img" aria-label="Mastercard" className={className}>
      <circle cx="14" cy="12" r="12" fill="#EB001B" />
      <circle cx="26" cy="12" r="12" fill="#F79E1B" />
      <path d="M20 1.61A12 12 0 0 1 20 22.39A12 12 0 0 1 20 1.61z" fill="#FF5F00" />
    </svg>
  );
}

function PayPalLogo({ className = 'h-5 w-auto' }: { className?: string }) {
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

function StripeLogo({ className = 'h-5 w-auto' }: { className?: string }) {
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

function OrangeMoneyLogo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Orange Money" className={className}>
      <rect width="32" height="32" rx="3" fill="#FF7900" />
      <text x="3" y="28" fontFamily={FONT} fontWeight="700" fontSize="7.5" fill="#FFFFFF">
        orange
      </text>
    </svg>
  );
}

function MtnLogo({ className = 'h-7 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" role="img" aria-label="MTN MoMo" className={className}>
      <ellipse cx="24" cy="16" rx="23" ry="15" fill="#FFCC00" />
      <text
        x="24"
        y="21"
        textAnchor="middle"
        fontFamily={FONT}
        fontWeight="900"
        fontSize="14"
        fill="#000000"
      >
        MTN
      </text>
    </svg>
  );
}

function WaveLogo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="Wave" className={className}>
      <rect width="32" height="32" rx="8" fill="#1DC8FF" />
      <path
        d="M5 17c3-6 6-6 9 0s6 6 9 0"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Carte bancaire interactive                                                 */
/* -------------------------------------------------------------------------- */

function CardPreview({ number, name, expiry, cvc, brand, flipped }: CardPreviewProps) {
  const masked = number.replace(/\s/g, '').padEnd(16, '•').match(/.{4}/g)?.join(' ') || '';

  const face: React.CSSProperties = {
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

          <div className="font-mono text-[1.15rem] tracking-[0.12em] tabular-nums sm:text-xl">
            {masked}
          </div>

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

function Field({ label, error, children }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-600">{error}</span>}
    </label>
  );
}

function PayButton({ children, className = '', ...props }: PayButtonProps) {
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

function CardForm({ pay, checkEmail }: CardFormProps) {
  const [card, setCard] = useState<CardData>({ number: '', name: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState<CardErrors>({});
  const [flipped, setFlipped] = useState(false);

  const digits = card.number.replace(/\s/g, '');
  const brand = detectBrand(digits);
  const update = (key: keyof CardData, value: string): void => setCard((prev) => ({ ...prev, [key]: value }));

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
        failure: declined ? 'Votre carte a été refusée par l\'émetteur. Essayez une autre carte.' : '',
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
          <Field label="Date d'expiration" error={errors.expiry}>
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
              onChange={(e: ChangeEvent<HTMLInputElement>) => update('cvc', e.target.value.replace(/\D/g, '').slice(0, 3))}
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

function PayPalForm({ pay, checkEmail }: PayPalFormProps) {
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

function MobileMoneyForm({ pay, checkEmail }: MobileMoneyFormProps) {
  const [operatorId, setOperatorId] = useState('orange');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const operator = MOBILE_OPERATORS.find((item) => item.id === operatorId);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailOk = checkEmail();
    const valid = phone.replace(/\D/g, '').length >= 8;
    setError(valid ? '' : 'Saisissez un numéro de téléphone valide');
    if (!emailOk || !valid) return;

    void pay(
      [
        { label: `Demande envoyée à ${operator?.name ?? 'Mobile Money'}`, ms: 1000 },
        { label: 'En attente de la validation sur votre téléphone', ms: 2200 },
        { label: 'Confirmation du paiement', ms: 900 },
      ],
      { method: `${operator?.name ?? 'Mobile Money'} ${phone}` },
    );
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Opérateur</legend>
        <div className="grid grid-cols-3 gap-3">
          {MOBILE_OPERATORS.map(({ id, name, Logo }) => (
            <button
              key={id}
              type="button"
              aria-pressed={operatorId === id}
              onClick={() => setOperatorId(id)}
              className={`flex h-24 flex-col items-center justify-center gap-2 rounded-xl border text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-100 ${
                operatorId === id
                  ? 'border-brand-500 bg-brand-50 text-slate-900'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Logo />
              {name}
            </button>
          ))}
        </div>
      </fieldset>

      <Field label="Numéro de téléphone" error={error}>
        <input
          className={`${inputClass(error)} tabular-nums`}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+225 07 00 00 00 00"
          value={phone}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value.replace(/[^\d+\s]/g, ''))}
        />
      </Field>

      <PayButton>
        <Lock size={18} />
        Payer {fcfa(PRICE_FCFA)}
      </PayButton>

      <p className="text-center text-sm text-slate-500">
        Vous recevrez une notification pour valider le paiement avec votre code secret.
      </p>
    </form>
  );
}

function TransferForm({ pay, checkEmail, reference }: TransferFormProps) {
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

      <PayButton>J'ai effectué le virement</PayButton>

      <p className="text-center text-sm text-slate-500">
        Votre accès est activé dès réception des fonds, généralement sous 24 à 48 h.
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  États : traitement et confirmation                                         */
/* -------------------------------------------------------------------------- */

function ProcessingOverlay({ step }: ProcessingOverlayProps) {
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

function Receipt({ receipt, email, onReset }: ReceiptProps) {
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
  const [method, setMethod] = useState('card');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [step, setStep] = useState<ProcessingStep>({ label: '', progress: 0 });
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [transferReference] = useState(makeReference);

  const checkEmail = (): boolean => {
    const valid = EMAIL_RE.test(email.trim());
    setEmailError(valid ? '' : 'Saisissez une adresse e-mail valide');
    return valid;
  };

  const pay = async (steps: Feature[], result: PaymentResult = {}) => {
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

  const selectMethod = (id: string): void => {
    setMethod(id);
    setError('');
  };

  const formProps = { pay, checkEmail };

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
            {method === 'paypal' && <PayPalForm {...formProps} />}
            {method === 'mobile' && <MobileMoneyForm {...formProps} />}
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
              Propulsé par <StripeLogo className="h-5 w-auto" />
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

      <div className="mt-5 flex items-baseline gap-3">
        <span className="text-6xl font-semibold tracking-tight tabular-nums">10 000</span>
        <span className="text-xl font-medium text-slate-400">FCFA par an</span>
      </div>
      <p className="mt-3 text-[15px] text-slate-400">
        Soit {eur(PRICE_EUR)} au taux fixe XOF/EUR, ou {fcfa(Math.round(PRICE_FCFA / 12))} par mois.
      </p>
      <p className="mt-5 inline-block rounded-full bg-emerald-400/10 px-3.5 py-1.5 text-sm font-medium text-emerald-300 ring-1 ring-emerald-400/20">
        50 % moins cher que l'abonnement mensuel
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
/*  FAQ                                                                        */
/* -------------------------------------------------------------------------- */

function FaqItem({ item, open, onToggle }: FaqItemComponentProps) {
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
            10 000 FCFA pour 12 mois d'accès complet. Aucun frais caché, aucune option payante.
          </p>
        </div>
      </section>

      {/* Paiement */}
      <section id="paiement" className="scroll-mt-24 pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-10 lg:px-8">
          <PlanSummary />
          <Checkout />
        </div>

        {/* Moyens de paiement */}
        <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500">Moyens de paiement acceptés</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'Visa', node: <VisaLogo className="h-5 w-auto" /> },
              { name: 'Mastercard', node: <MastercardLogo className="h-6 w-auto" /> },
              { name: 'PayPal', node: <PayPalLogo className="h-5 w-auto" /> },
              { name: 'Stripe', node: <StripeLogo className="h-5 w-auto" /> },
              { name: 'Orange Money', node: <OrangeMoneyLogo className="h-6 w-6" /> },
              { name: 'MTN MoMo', node: <MtnLogo className="h-6 w-auto" /> },
              { name: 'Wave', node: <WaveLogo className="h-6 w-6" /> },
            ].map(({ name, node }) => (
              <div
                key={name}
                title={name}
                className="flex h-12 w-24 items-center justify-center rounded-xl border border-slate-200 bg-white"
              >
                {node}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20 lg:px-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Questions fréquentes
            </h2>
            <p className="mt-4 max-w-sm text-lg text-slate-600">
              Tout ce qu'il faut savoir avant de vous abonner.
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