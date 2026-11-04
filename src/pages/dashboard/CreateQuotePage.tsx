import {
  useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import type {
  ChangeEvent, CSSProperties, DragEvent, InputHTMLAttributes,
  PointerEvent as ReactPointerEvent, ReactNode,
} from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, Building2, Calendar, Check, ChevronDown, Coffee, Download, Eye,
  FileBadge, FileSpreadsheet, FileText, FileType, Globe, Image as ImageIcon, Info, Loader2, Mail,
  MapPin, MessageCircle, Paperclip, PenLine, Phone, Plus, Save, SlidersHorizontal, Trash2, Upload, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

/* -------------------------------------------------------------------------- */
/*  Devises                                                                    */
/* -------------------------------------------------------------------------- */

export const WORLD_CURRENCIES = [
  { code: 'XOF', name: 'Franc CFA (UEMOA)' },
  { code: 'XAF', name: 'Franc CFA (CEMAC)' },
  { code: 'EUR', name: 'Euro' },
  { code: 'USD', name: 'Dollar américain' },
  { code: 'GBP', name: 'Livre sterling' },
  { code: 'NGN', name: 'Naira nigérian' },
  { code: 'GHS', name: 'Cedi ghanéen' },
  { code: 'KES', name: 'Shilling kényan' },
  { code: 'ZAR', name: 'Rand sud-africain' },
  { code: 'MAD', name: 'Dirham marocain' },
  { code: 'TND', name: 'Dinar tunisien' },
  { code: 'DZD', name: 'Dinar algérien' },
  { code: 'CDF', name: 'Franc congolais' },
  { code: 'XPF', name: 'Franc Pacifique' },
  { code: 'CAD', name: 'Dollar canadien' },
  { code: 'CHF', name: 'Franc suisse' },
  { code: 'CNY', name: 'Yuan chinois' },
  { code: 'JPY', name: 'Yen japonais' },
  { code: 'INR', name: 'Roupie indienne' },
  { code: 'BRL', name: 'Real brésilien' },
  { code: 'AUD', name: 'Dollar australien' },
  { code: 'AED', name: 'Dirham des Émirats' },
  { code: 'SAR', name: 'Riyal saoudien' },
  { code: 'EGP', name: 'Livre égyptienne' },
  { code: 'RWF', name: 'Franc rwandais' },
  { code: 'UGX', name: 'Shilling ougandais' },
  { code: 'TZS', name: 'Shilling tanzanien' },
  { code: 'GNF', name: 'Franc guinéen' },
  { code: 'SLL', name: 'Leone sierra-léonais' },
  { code: 'LRD', name: 'Dollar libérien' },
  { code: 'GMD', name: 'Dalasi gambien' },
  { code: 'MRU', name: 'Ouguiya mauritanien' },
  { code: 'CVE', name: 'Escudo cap-verdien' },
  { code: 'STN', name: 'Dobra santoméen' },
  { code: 'BIF', name: 'Franc burundais' },
  { code: 'DJF', name: 'Franc djiboutien' },
  { code: 'KMF', name: 'Franc comorien' },
  { code: 'MGA', name: 'Ariary malgache' },
  { code: 'MUR', name: 'Roupie mauricienne' },
  { code: 'SCR', name: 'Roupie seychelloise' },
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  XOF: 'FCFA', XAF: 'FCFA', EUR: '€', USD: '$', GBP: '£', NGN: '₦', GHS: 'GH₵',
  KES: 'KSh', ZAR: 'R', CAD: 'C$', CHF: 'CHF', CNY: '¥', JPY: '¥', INR: '₹',
  BRL: 'R$', AUD: 'A$', AED: 'AED', SAR: 'SAR', EGP: 'E£',
};
const currencySuffix = (code: string): string => CURRENCY_SYMBOLS[code] ?? code;
const currencyLabel = (code: string): string => `${code} (${currencySuffix(code)})`;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
type Lang = 'fr' | 'en';
type IconType = LucideIcon;
type ExportFormat = 'pdf' | 'word' | 'excel' | 'image' | 'epub';
type StepKey = 'general' | 'client' | 'lines' | 'conditions' | 'custom' | 'preview';

interface ClientInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  country: string;
  taxId: string;
  registrationNumber: string;
}

interface QuoteLine {
  id: string;
  designation: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  vatRate: number;
}

interface Attachment { id: string; name: string; size: number }

interface QuoteState {
  number: string;
  emissionDate: string;
  validityEnabled: boolean;
  validityDate: string;
  currency: string;
  language: Lang;
  status: QuoteStatus;
  vatEnabled: boolean;
  vatRate: number;
  client: ClientInfo;
  lines: QuoteLine[];
  executionDelay: string;
  paymentTerms: string;
  paymentMethod: string;
  depositPercent: number;
  deliveryTerms: string;
  specialConditions: string;
  notes: string;
  generalConditions: string;
  attachments: Attachment[];
}

interface ThemeState {
  template: number;
  color: string;
  logo: string | null;
  signature: string | null;
  stamp: string | null;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  signatory: string;
  signatoryRole: string;
}

/* -------------------------------------------------------------------------- */
/*  Données par défaut                                                         */
/* -------------------------------------------------------------------------- */

const DEFAULT_COMPANY: CompanyProfile = {
  name: 'ABC SARL',
  tagline: 'Votre partenaire de confiance',
  address: 'Avenue de l\'Indépendance, Lomé - Togo',
  city: 'Lomé',
  phone: '+228 90 12 34 56',
  email: 'contact@abc.tg',
  website: 'www.abc.tg',
  signatory: 'Jean Dupont',
  signatoryRole: 'Responsable',
};

const COMPANY_STORAGE_KEY = 'devis-cafe:company';

function loadCompany(override?: Partial<CompanyProfile>): CompanyProfile {
  let stored: Partial<CompanyProfile> = {};
  try {
    const raw = window.localStorage.getItem(COMPANY_STORAGE_KEY);
    if (raw) stored = JSON.parse(raw) as Partial<CompanyProfile>;
  } catch {
    stored = {};
  }
  return { ...DEFAULT_COMPANY, ...stored, ...override };
}

const EMPTY_CLIENT: ClientInfo = { name: '', phone: '', email: '', address: '', country: 'Togo', taxId: '', registrationNumber: '' };
const COUNTRIES = [
  'Afrique du Sud', 'Algérie', 'Allemagne', 'Angola', 'Arabie saoudite', 'Belgique', 'Bénin', 'Burkina Faso',
  'Burundi', 'Cameroun', 'Canada', 'Cap-Vert', 'Chine', 'Comores', 'Congo', 'Côte d\'Ivoire', 'Djibouti', 'Égypte',
  'Émirats arabes unis', 'Espagne', 'États-Unis', 'Éthiopie', 'France', 'Gabon', 'Gambie', 'Ghana', 'Guinée',
  'Guinée équatoriale', 'Inde', 'Italie', 'Kenya', 'Liberia', 'Madagascar', 'Mali', 'Maroc', 'Maurice',
  'Mauritanie', 'Niger', 'Nigeria', 'Ouganda', 'Pays-Bas', 'Portugal', 'République démocratique du Congo',
  'Royaume-Uni', 'Rwanda', 'Sénégal', 'Sierra Leone', 'Suisse', 'Tanzanie', 'Tchad', 'Togo', 'Tunisie', 'Turquie',
];
const UNITS = ['Projet', 'An', 'Mois', 'Heure', 'Jour', 'Forfait', 'Pièce', 'm²', 'Kg', 'Lot'];
const DELAYS = ['48 heures', '3 jours', '5 jours', '10 jours', '15 jours', '1 mois', '2 mois', 'À convenir'];
const PAYMENT_TERMS_BASE = [
  'Paiement à la commande',
  '30% à la commande, 70% à la livraison',
  '50% à la commande, 50% à la livraison',
  'Paiement à 30 jours',
  'Paiement à réception de la facture',
];
const PAYMENT_METHODS = ['Virement bancaire', 'Mobile Money', 'Espèces', 'Chèque', 'Carte bancaire', 'PayPal'];
const DELIVERY_TERMS = ['Livraison en ligne', 'Retrait sur place', 'Livraison à domicile', 'Sur chantier', 'À convenir'];
const VALIDITY_CHOICES = [7, 15, 30, 45, 60, 90];
const STATUS_META: Record<QuoteStatus, { label: string; dot: string }> = {
  draft: { label: 'Brouillon', dot: 'bg-brand-600' },
  sent: { label: 'Envoyé', dot: 'bg-amber-500' },
  accepted: { label: 'Accepté', dot: 'bg-emerald-500' },
  rejected: { label: 'Refusé', dot: 'bg-red-500' },
  expired: { label: 'Expiré', dot: 'bg-slate-400' },
};

/* -------------------------------------------------------------------------- */
/*  Palette de couleurs                                                        */
/* -------------------------------------------------------------------------- */

const hslToHex = (h: number, s: number, l: number): string => {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number): number => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number): number => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const x = (v: number): string => Math.round(255 * v).toString(16).padStart(2, '0');
  return `#${x(f(0))}${x(f(8))}${x(f(4))}`.toUpperCase();
};
const HUES = [0, 12, 24, 36, 48, 60, 84, 108, 132, 156, 174, 190, 204, 218, 232, 246, 260, 276, 292, 308, 324, 340];
const PALETTE: string[] = [
  '#000000', '#111827', '#1E2A4A', '#334155', '#475569', '#64748B', '#94A3B8', '#78350F', '#7C2D12', '#1D4ED8', '#22A559',
  ...[30, 40, 50, 60, 72].flatMap(l => HUES.map(h => hslToHex(h, l > 65 ? 70 : 80, l))),
];
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/* -------------------------------------------------------------------------- */
/*  Modèles de devis                                                           */
/* -------------------------------------------------------------------------- */

interface TemplateConfig {
  header: 'split' | 'banner' | 'centered';
  decor: 'corners' | 'topbar' | 'sidebar' | 'footerbar' | 'frame' | 'diagonal' | 'doublebar' | 'wave' | 'none';
  table: 'filled' | 'underline' | 'zebra' | 'boxed' | 'minimal' | 'rounded';
  font: 'sans' | 'serif';
  total: 'filled' | 'outline' | 'soft';
}

const TEMPLATES: TemplateConfig[] = [
  { header: 'split', decor: 'none', table: 'underline', font: 'sans', total: 'outline' },
  { header: 'split', decor: 'topbar', table: 'filled', font: 'sans', total: 'filled' },
  { header: 'split', decor: 'corners', table: 'filled', font: 'sans', total: 'filled' },
  { header: 'banner', decor: 'none', table: 'zebra', font: 'sans', total: 'filled' },
  { header: 'centered', decor: 'topbar', table: 'underline', font: 'serif', total: 'outline' },
  { header: 'banner', decor: 'footerbar', table: 'filled', font: 'sans', total: 'filled' },
  { header: 'split', decor: 'sidebar', table: 'zebra', font: 'sans', total: 'soft' },
  { header: 'centered', decor: 'none', table: 'boxed', font: 'sans', total: 'outline' },
  { header: 'split', decor: 'frame', table: 'filled', font: 'serif', total: 'filled' },
  { header: 'banner', decor: 'corners', table: 'filled', font: 'sans', total: 'soft' },
  { header: 'split', decor: 'topbar', table: 'boxed', font: 'sans', total: 'filled' },
  { header: 'centered', decor: 'corners', table: 'zebra', font: 'serif', total: 'filled' },
  { header: 'banner', decor: 'sidebar', table: 'filled', font: 'sans', total: 'filled' },
  { header: 'split', decor: 'footerbar', table: 'underline', font: 'sans', total: 'soft' },
  { header: 'centered', decor: 'frame', table: 'boxed', font: 'sans', total: 'outline' },
  { header: 'split', decor: 'diagonal', table: 'filled', font: 'sans', total: 'filled' },
  { header: 'banner', decor: 'wave', table: 'zebra', font: 'sans', total: 'filled' },
  { header: 'split', decor: 'doublebar', table: 'minimal', font: 'sans', total: 'outline' },
  { header: 'centered', decor: 'doublebar', table: 'underline', font: 'serif', total: 'soft' },
  { header: 'split', decor: 'wave', table: 'rounded', font: 'sans', total: 'soft' },
  { header: 'banner', decor: 'doublebar', table: 'minimal', font: 'serif', total: 'outline' },
  { header: 'centered', decor: 'diagonal', table: 'zebra', font: 'sans', total: 'filled' },
  { header: 'split', decor: 'sidebar', table: 'minimal', font: 'serif', total: 'outline' },
  { header: 'centered', decor: 'wave', table: 'rounded', font: 'sans', total: 'filled' },
];

const PAGE_W = 794;
const PAGE_H = 1122;
const BOTTOM = 96;
const BANNER_H = 132;
const RUN_BAND = 40;
const CONT_TOP = 84;

interface Geometry {
  banner: boolean;
  padL: number;
  padR: number;
  contentW: number;
  topFirst: number;
  topCont: number;
}

function geometry(cfg: TemplateConfig): Geometry {
  const banner = cfg.header === 'banner';
  const padL = cfg.decor === 'sidebar' ? 64 : 48;
  const padR = 48;
  return { banner, padL, padR, contentW: PAGE_W - padL - padR, topFirst: banner ? BANNER_H + 30 : 48, topCont: CONT_TOP };
}

/* Polices 100 % système : l'aperçu, l'impression, l'image et le Word utilisent
   exactement les mêmes métriques, donc la pagination mesurée reste fidèle. */
const fontFor = (cfg: TemplateConfig): string =>
  (cfg.font === 'serif'
    ? 'Georgia, "Times New Roman", "Liberation Serif", serif'
    : 'Arial, Helvetica, "Liberation Sans", sans-serif');

/* -------------------------------------------------------------------------- */
/*  Libellés du document (FR / EN)                                             */
/* -------------------------------------------------------------------------- */

const I18N = {
  fr: {
    quote: 'DEVIS', client: 'Client', issueDate: 'Date d\'émission :', validUntil: 'Valable jusqu\'au :', currency: 'Devise :',
    designation: 'Désignation', description: 'Description', qty: 'Qté', unit: 'Unité', unitPrice: 'PU HT', unitPriceNet: 'Prix unit.',
    discount: 'Remise', vat: 'TVA', amountHT: 'Montant HT', amountNet: 'Montant', subtotal: 'Sous-total HT', total: 'Total TTC',
    totalNet: 'Total', vatNA: 'TVA non applicable', conditions: 'Conditions', delay: 'Délai d\'exécution :',
    validity: 'Validité du devis :', method: 'Mode de paiement :', delivery: 'Livraison :', madeAt: 'Fait à', on: 'le',
    thanks: 'Merci pour votre confiance !', tel: 'Tél :', email: 'Email :', notes: 'Notes et remarques',
    terms: 'Conditions générales', days: 'jours', attachments: 'Pièces jointes :', page: 'Page', taxId: 'N° fiscal :',
    regNo: 'N° d\'enreg. :',
  },
  en: {
    quote: 'QUOTE', client: 'Client', issueDate: 'Issue date:', validUntil: 'Valid until:', currency: 'Currency:',
    designation: 'Item', description: 'Description', qty: 'Qty', unit: 'Unit', unitPrice: 'Unit price excl. VAT', unitPriceNet: 'Unit price',
    discount: 'Discount', vat: 'VAT', amountHT: 'Amount excl. VAT', amountNet: 'Amount', subtotal: 'Subtotal excl. VAT',
    total: 'Total incl. VAT', totalNet: 'Total', vatNA: 'VAT not applicable', conditions: 'Terms', delay: 'Lead time:',
    validity: 'Quote validity:', method: 'Payment method:', delivery: 'Delivery:', madeAt: 'Issued in', on: 'on',
    thanks: 'Thank you for your trust!', tel: 'Tel:', email: 'Email:', notes: 'Notes', terms: 'General terms',
    days: 'days', attachments: 'Attachments:', page: 'Page', taxId: 'Tax ID:', regNo: 'Reg. no.:',
  },
} as const;

/* -------------------------------------------------------------------------- */
/*  Utilitaires : dates, montants, calculs                                     */
/* -------------------------------------------------------------------------- */

const toISO = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const parseISO = (iso: string): [number, number, number] => {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
};

const addDays = (iso: string, n: number): string => {
  const [y, m, d] = parseISO(iso);
  return toISO(new Date(y, m - 1, d + n));
};

const diffDays = (from: string, to: string): number => {
  const [y1, m1, d1] = parseISO(from);
  const [y2, m2, d2] = parseISO(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
};

const fmtDate = (iso: string): string => (iso ? iso.split('-').reverse().join('/') : '');

const fractionDigits = (currency: string): number => {
  try {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
};

const makeFormatter = (currency: string) => {
  const digits = fractionDigits(currency);
  const nf = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  return (n: number): string => nf.format(n).replace(/[\u202f\u00a0]/g, '\u00a0');
};
type Formatter = (n: number) => string;

interface Totals {
  lineTotals: number[];
  subtotal: number;
  vatRows: { rate: number; amount: number }[];
  totalVat: number;
  total: number;
}

function computeTotals(lines: QuoteLine[], vatEnabled: boolean): Totals {
  const lineTotals = lines.map(l =>
    Math.max(0, l.quantity * l.unitPrice * (1 - Math.min(100, Math.max(0, l.discount)) / 100)),
  );
  const subtotal = lineTotals.reduce((s, v) => s + v, 0);
  const byRate = new Map<number, number>();
  if (vatEnabled) {
    lines.forEach((l, i) => {
      if (l.vatRate > 0) byRate.set(l.vatRate, (byRate.get(l.vatRate) ?? 0) + (lineTotals[i] * l.vatRate) / 100);
    });
  }
  const vatRows = [...byRate.entries()].sort((a, b) => a[0] - b[0]).map(([rate, amount]) => ({ rate, amount }));
  const totalVat = vatRows.reduce((s, r) => s + r.amount, 0);
  return { lineTotals, subtotal, vatRows, totalVat, total: subtotal + totalVat };
}

function visibleLineIndexes(lines: QuoteLine[]): number[] {
  const idx = lines.map((_, i) => i).filter(i => {
    const l = lines[i];
    return l.designation.trim() !== '' || l.description.trim() !== '' || l.unitPrice > 0;
  });
  return idx.length > 0 ? idx : [0];
}

const depositFromTerms = (terms: string): number => {
  const m = /^(\d+)% à la commande/.exec(terms);
  if (m) return Number(m[1]);
  return terms === 'Paiement à la commande' ? 100 : 0;
};

const termsFromDeposit = (p: number, current: string): string => {
  if (p >= 100) return 'Paiement à la commande';
  if (p > 0) return `${p}% à la commande, ${100 - p}% à la livraison`;
  return depositFromTerms(current) > 0 ? '' : current;
};

const formatSize = (bytes: number): string =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} Ko` : `${(bytes / 1024 / 1024).toFixed(1)} Mo`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const paragraphs = (text: string): string[] => text.split(/\n+/).map(p => p.trim()).filter(Boolean);

/* Découpe un texte en « mots » (le mot + les espaces qui le suivent) pour pouvoir
   le répartir proprement sur plusieurs pages. */
const tokenize = (s: string): string[] => s.trim().match(/\S+\s*/g) ?? [];
const joinTokens = (tk: string[], a: number, b: number): string => tk.slice(a, b).join('').trim();

/* -------------------------------------------------------------------------- */
/*  Utilitaires : export                                                       */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line no-control-regex
const XML_BAD = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;
const esc = (v: string | number): string =>
  String(v).replace(XML_BAD, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const escBr = (v: string | number): string => esc(v).replace(/\r?\n/g, '<br/>');

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const dataUrlToBytes = (url: string): Uint8Array => {
  const bin = window.atob(url.split(',')[1] ?? '');
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
};

function snapshotNode(source: HTMLElement): HTMLElement {
  const clone = source.cloneNode(true) as HTMLElement;
  const from = [source, ...Array.from(source.querySelectorAll<HTMLElement>('*'))];
  const to = [clone, ...Array.from(clone.querySelectorAll<HTMLElement>('*'))];
  from.forEach((el, i) => {
    const cs = window.getComputedStyle(el);
    let css = '';
    for (let k = 0; k < cs.length; k += 1) {
      const prop = cs[k];
      if (prop.startsWith('-')) continue;
      css += `${prop}:${cs.getPropertyValue(prop)};`;
    }
    to[i].setAttribute('style', css);
    to[i].removeAttribute('class');
  });
  clone.style.transform = 'none';
  clone.style.margin = '0';
  return clone;
}

async function renderPng(node: HTMLElement, pixelRatio = 2): Promise<string> {
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const clone = snapshotNode(node);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
  const xml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${xml}</foreignObject></svg>`;
  const img = new window.Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('render'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.scale(pixelRatio, pixelRatio);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL('image/png');
}

async function printPages(pages: HTMLElement[], title: string): Promise<void> {
  const html = pages.map(p => `<div class="pg">${snapshotNode(p).outerHTML}</div>`).join('');
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    throw new Error('print');
  }
  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:#fff}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.pg{width:${PAGE_W}px;height:${PAGE_H - 1}px;overflow:hidden;position:relative;page-break-after:always;break-after:page}.pg:last-child{page-break-after:auto;break-after:auto}</style></head><body>${html}</body></html>`,
  );
  doc.close();
  // On attend que les images (logo, cachet, signature) soient chargées avant d'imprimer.
  await Promise.all(
    Array.from(doc.images).map(im => (im.complete
      ? Promise.resolve()
      : new Promise<void>(resolve => { im.onload = () => resolve(); im.onerror = () => resolve(); }))),
  );
  await new Promise<void>(resolve => { window.setTimeout(resolve, 250); });
  const cleanup = (): void => { iframe.remove(); };
  win.onafterprint = cleanup;
  window.setTimeout(cleanup, 120_000);
  win.focus();
  win.print();
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

interface ZipFile { name: string; data: Uint8Array }
const textFile = (name: string, content: string): ZipFile => ({ name, data: new TextEncoder().encode(content) });

function makeZip(files: ZipFile[], mime: string): Blob {
  const enc = new TextEncoder();
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  files.forEach(file => {
    const name = enc.encode(file.name);
    const { data } = file;
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true);
    local.set(name, 30);
    const entry = new Uint8Array(46 + name.length);
    const cv = new DataView(entry.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true);
    entry.set(name, 46);
    parts.push(local, data);
    central.push(entry);
    offset += local.length + data.length;
  });
  const centralSize = central.reduce((s, e) => s + e.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end] as BlobPart[], { type: mime });
}

interface ExportCtx {
  data: QuoteState;
  company: CompanyProfile;
  theme: ThemeState;
  calc: Totals;
  fmt: Formatter;
  money: (n: number) => string;
}

function buildBody(ctx: ExportCtx, xhtml: boolean): string {
  const { data, company, theme, calc, fmt, money } = ctx;
  const t = I18N[data.language];
  const color = theme.color;
  const vat = data.vatEnabled;
  const cur = currencySuffix(data.currency);
  const visible = visibleLineIndexes(data.lines);
  const hasDiscount = visible.some(i => data.lines[i].discount > 0);
  const days = diffDays(data.emissionDate, data.validityDate);
  const showValidity = data.validityEnabled && Boolean(data.validityDate);
  const c = data.client;
  const cell = 'border:1px solid #cbd5e1;padding:6px;vertical-align:top;word-wrap:break-word;overflow-wrap:anywhere;';
  const head = `${cell}background:${color};color:#ffffff;`;
  const widths = vat
    ? (hasDiscount ? [5, 17, 27, 9, 13, 8, 7, 14] : [5, 18, 33, 9, 14, 8, 13])
    : (hasDiscount ? [5, 19, 33, 10, 14, 8, 11] : [5, 20, 38, 10, 14, 13]);
  const cols = widths.map(w => `<col style="width:${w}%"/>`).join('');
  const headers = [
    `<th style="${head}text-align:center">#</th>`,
    `<th style="${head}text-align:left">${esc(t.designation)}</th>`,
    `<th style="${head}text-align:left">${esc(t.description)}</th>`,
    `<th style="${head}text-align:center">${esc(t.qty)}</th>`,
    `<th style="${head}text-align:right">${esc(vat ? t.unitPrice : t.unitPriceNet)} (${esc(cur)})</th>`,
    hasDiscount ? `<th style="${head}text-align:center">${esc(t.discount)}</th>` : '',
    vat ? `<th style="${head}text-align:center">${esc(t.vat)}</th>` : '',
    `<th style="${head}text-align:right">${esc(vat ? t.amountHT : t.amountNet)} (${esc(cur)})</th>`,
  ].join('');
  const rows = visible.map((li, n) => {
    const l = data.lines[li];
    return `<tr><td style="${cell}text-align:center">${n + 1}</td><td style="${cell}"><b>${escBr(l.designation)}</b></td><td style="${cell}">${escBr(l.description)}</td><td style="${cell}text-align:center">${esc(l.quantity)} ${esc(l.unit)}</td><td style="${cell}text-align:right">${fmt(l.unitPrice)}</td>${hasDiscount ? `<td style="${cell}text-align:center">${esc(l.discount)}%</td>` : ''}${vat ? `<td style="${cell}text-align:center">${esc(l.vatRate)}%</td>` : ''}<td style="${cell}text-align:right"><b>${fmt(calc.lineTotals[li])}</b></td></tr>`;
  }).join('');
  const totalRows = [
    vat ? `<tr><td style="padding:4px 8px">${esc(t.subtotal)}</td><td style="padding:4px 8px;text-align:right">${money(calc.subtotal)}</td></tr>` : '',
    ...calc.vatRows.map(r => `<tr><td style="padding:4px 8px">${esc(t.vat)} (${r.rate}%)</td><td style="padding:4px 8px;text-align:right">${money(r.amount)}</td></tr>`),
    `<tr style="background:${color};color:#ffffff;font-weight:bold"><td style="padding:6px 8px">${esc(vat ? t.total : t.totalNet)}</td><td style="padding:6px 8px;text-align:right">${money(calc.total)}</td></tr>`,
  ].join('');
  const terms = [
    data.paymentTerms && `${esc(data.paymentTerms)}`,
    data.executionDelay && `${esc(t.delay)} ${esc(data.executionDelay)}`,
    showValidity && `${esc(t.validity)} ${days} ${esc(t.days)}`,
    data.paymentMethod && `<b>${esc(t.method)} ${esc(data.paymentMethod)}</b>`,
    data.deliveryTerms && `${esc(t.delivery)} ${esc(data.deliveryTerms)}`,
  ].filter(Boolean).join('<br/>');
  const extra = [
    data.specialConditions && `<p style="color:${color}"><i>${escBr(data.specialConditions)}</i></p>`,
    data.notes && `<h3>${esc(t.notes)}</h3>${paragraphs(data.notes).map(p => `<p>${esc(p)}</p>`).join('')}`,
    data.attachments.length > 0 && `<p><b>${esc(t.attachments)}</b> ${esc(data.attachments.map(a => a.name).join(', '))}</p>`,
    data.generalConditions && `<h3>${esc(t.terms)}</h3>${paragraphs(data.generalConditions).map(p => `<p style="font-size:10px;color:#475569">${esc(p)}</p>`).join('')}`,
  ].filter(Boolean).join('');
  const img = (src: string | null, h: number): string => (src ? `<img src="${src}" alt="" style="height:${h}px;max-width:160px"${xhtml ? '/' : ''}>` : '');
  const clientLines = [
    c.address && esc(c.address),
    c.country && esc(c.country),
    c.phone && `${esc(t.tel)} ${esc(c.phone)}`,
    c.email && `${esc(t.email)} ${esc(c.email)}`,
    c.taxId && `${esc(t.taxId)} ${esc(c.taxId)}`,
    c.registrationNumber && `${esc(t.regNo)} ${esc(c.registrationNumber)}`,
  ].filter(Boolean).join('<br/>');
  return `<div style="font-family:Arial,Helvetica,sans-serif;color:#1e293b;font-size:12px;word-wrap:break-word;overflow-wrap:anywhere">
${img(theme.logo, 56)}
<h1 style="color:${color};margin:0">${esc(company.name)}</h1>
<p style="margin:2px 0 10px;color:#64748b">${esc(company.tagline)}</p>
<p>${[company.address, company.phone, company.email, company.website].filter(Boolean).map(esc).join('<br/>')}</p>
<h2 style="margin-bottom:2px">${esc(t.quote)}</h2>
<p style="margin-top:0"><b>N° ${esc(data.number)}</b><br/>${esc(t.issueDate)} ${fmtDate(data.emissionDate)}${showValidity ? `<br/>${esc(t.validUntil)} ${fmtDate(data.validityDate)}` : ''}<br/>${esc(t.currency)} ${esc(currencyLabel(data.currency))}</p>
<h3 style="margin-bottom:2px">${esc(t.client)}</h3>
<p style="margin-top:0"><b>${esc(c.name)}</b><br/>${clientLines}</p>
<table style="border-collapse:collapse;width:100%;table-layout:fixed"><colgroup>${cols}</colgroup><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
<table style="border-collapse:collapse;margin:14px 0 14px auto;min-width:280px">${totalRows}</table>
${vat ? '' : `<p style="text-align:right;font-size:10px;color:#64748b">${esc(t.vatNA)}</p>`}
${terms ? `<h3 style="margin-bottom:2px">${esc(t.conditions)}</h3><p style="margin-top:0">${terms}</p>` : ''}
${extra}
<p style="margin-top:22px"><span style="color:#64748b">${esc(t.madeAt)} ${esc(company.city)}, ${esc(t.on)} ${fmtDate(data.emissionDate)}</span><br/><b>${esc(company.signatory)}</b>${company.signatoryRole ? ` — ${esc(company.signatoryRole)}` : ''}<br/>${img(theme.signature, 60)} ${img(theme.stamp, 76)}</p>
<p style="text-align:center;color:${color}">${esc(t.thanks)}</p>
</div>`;
}

function buildWord(ctx: ExportCtx, title: string): string {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"/><title>${esc(title)}</title><style>@page{size:21cm 29.7cm;margin:1.8cm}body{font-family:Arial,Helvetica,sans-serif}table{table-layout:fixed}td,th{word-wrap:break-word}tr{page-break-inside:auto}</style></head><body><div>${buildBody(ctx, false)}</div></body></html>`;
}

function buildEpub(ctx: ExportCtx): Blob {
  const { data } = ctx;
  const lang = data.language;
  const title = `${I18N[lang].quote} ${data.number}`;
  const modified = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const head = '<?xml version="1.0" encoding="UTF-8"?>';
  return makeZip([
    textFile('mimetype', 'application/epub+zip'),
    textFile('META-INF/container.xml', `${head}<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`),
    textFile('OEBPS/content.opf', `${head}<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="bookid">urn:uuid:${crypto.randomUUID()}</dc:identifier><dc:title>${esc(title)}</dc:title><dc:language>${lang}</dc:language><meta property="dcterms:modified">${modified}</meta></metadata><manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="quote" href="quote.xhtml" media-type="application/xhtml+xml"/></manifest><spine><itemref idref="quote"/></spine></package>`),
    textFile('OEBPS/nav.xhtml', `${head}<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${lang}"><head><meta charset="utf-8"/><title>${esc(title)}</title></head><body><nav epub:type="toc"><ol><li><a href="quote.xhtml">${esc(title)}</a></li></ol></nav></body></html>`),
    textFile('OEBPS/quote.xhtml', `${head}<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" lang="${lang}"><head><meta charset="utf-8"/><title>${esc(title)}</title></head><body>${buildBody(ctx, true)}</body></html>`),
  ], 'application/epub+zip');
}

type XCell = { v: string | number; s?: number } | null;

function buildXlsx(ctx: ExportCtx): Blob {
  const { data, company, theme, calc } = ctx;
  const t = I18N[data.language];
  const vat = data.vatEnabled;
  const cur = currencySuffix(data.currency);
  const digits = fractionDigits(data.currency);
  const brand = theme.color.slice(1).toUpperCase();
  const visible = visibleLineIndexes(data.lines);
  const showValidity = data.validityEnabled && Boolean(data.validityDate);
  const S = {
    bold: 1, head: 2, title: 3, money: 4, cell: 5, totalLabel: 6, totalValue: 7, center: 8, pct: 9, muted: 10,
    subLabel: 11, subValue: 12, wrap: 13, wrapMuted: 14,
  };
  const n = vat ? 9 : 8;
  const widths = vat ? [5, 26, 46, 9, 10, 18, 11, 9, 20] : [5, 26, 46, 9, 10, 18, 11, 20];
  const letter = (i: number): string => String.fromCharCode(65 + i);
  const tx = (v: string, s?: number): XCell => ({ v, s });
  const nu = (v: number, s?: number): XCell => ({ v, s });
  const info = (label: string, value: string): XCell[] => [null, tx(label, S.bold), tx(value)];
  const fill = (label: XCell, value: XCell): XCell[] => [...Array.from({ length: n - 2 }, () => null), label, value];
  const rows: XCell[][] = [];
  const merges: string[] = [];
  const heights: Record<number, number> = {};
  const estimateLines = (text: string, chars: number): number =>
    text.split('\n').reduce((s, ln) => s + Math.max(1, Math.ceil(ln.length / Math.max(1, chars * 1.05))), 0);
  const wideChars = widths.slice(1).reduce((s, w) => s + w, 0);
  const pushWrapped = (label: string | null, text: string, style: number): void => {
    const r = rows.length + 1;
    rows.push([label ? tx(label, S.bold) : null, tx(text, style)]);
    merges.push(`B${r}:${letter(n - 1)}${r}`);
    heights[r] = Math.max(15, estimateLines(text, wideChars) * 14);
  };
  rows.push([tx(company.name, S.title)]);
  if (company.tagline) rows.push([tx(company.tagline, S.muted)]);
  rows.push([tx([company.address, company.phone, company.email, company.website].filter(Boolean).join('  ·  '), S.muted)]);
  rows.push([]);
  rows.push([tx(`${t.quote} N° ${data.number}`, S.bold)]);
  rows.push(info(t.issueDate, fmtDate(data.emissionDate)));
  if (showValidity) rows.push(info(t.validUntil, fmtDate(data.validityDate)));
  rows.push(info(t.currency, currencyLabel(data.currency)));
  rows.push([]);
  rows.push(info(t.client, data.client.name));
  [data.client.address, data.client.country, data.client.phone, data.client.email, data.client.taxId, data.client.registrationNumber]
    .filter(Boolean).forEach(v => rows.push([null, null, tx(v)]));
  rows.push([]);
  rows.push([
    tx('#', S.head), tx(t.designation, S.head), tx(t.description, S.head), tx(t.qty, S.head), tx(t.unit, S.head),
    tx(`${vat ? t.unitPrice : t.unitPriceNet} (${cur})`, S.head), tx(`${t.discount} (%)`, S.head),
    ...(vat ? [tx(`${t.vat} (%)`, S.head)] : []), tx(`${vat ? t.amountHT : t.amountNet} (${cur})`, S.head),
  ]);
  visible.forEach((li, idx) => {
    const l = data.lines[li];
    const r = rows.length + 1;
    heights[r] = Math.max(15, Math.max(estimateLines(l.description, widths[2]), estimateLines(l.designation, widths[1])) * 14);
    rows.push([
      nu(idx + 1, S.center), tx(l.designation, S.cell), tx(l.description, S.cell), nu(l.quantity, S.center), tx(l.unit, S.center),
      nu(l.unitPrice, S.money), nu(l.discount, S.pct), ...(vat ? [nu(l.vatRate, S.pct)] : []), nu(calc.lineTotals[li], S.money),
    ]);
  });
  rows.push([]);
  if (vat) {
    rows.push(fill(tx(t.subtotal, S.subLabel), nu(calc.subtotal, S.subValue)));
    calc.vatRows.forEach(r => rows.push(fill(tx(`${t.vat} (${r.rate}%)`, S.subLabel), nu(r.amount, S.subValue))));
  }
  rows.push(fill(tx(vat ? t.total : t.totalNet, S.totalLabel), nu(calc.total, S.totalValue)));
  if (!vat) rows.push(fill(null, tx(t.vatNA, S.muted)));
  rows.push([]);
  if (data.paymentTerms || data.executionDelay || data.paymentMethod || data.deliveryTerms || showValidity) {
    rows.push([tx(t.conditions, S.bold)]);
    if (data.paymentTerms) rows.push([null, tx(data.paymentTerms)]);
    if (data.executionDelay) rows.push(info(t.delay, data.executionDelay));
    if (showValidity) rows.push(info(t.validity, `${diffDays(data.emissionDate, data.validityDate)} ${t.days}`));
    if (data.paymentMethod) rows.push(info(t.method, data.paymentMethod));
    if (data.deliveryTerms) rows.push(info(t.delivery, data.deliveryTerms));
  }
  if (data.specialConditions) pushWrapped(null, data.specialConditions, S.wrapMuted);
  paragraphs(data.notes).forEach((p, i) => pushWrapped(i === 0 ? t.notes : null, p, S.wrap));
  paragraphs(data.generalConditions).forEach((p, i) => pushWrapped(i === 0 ? t.terms : null, p, S.wrapMuted));
  const sheetRows = rows.map((cells, ri) => {
    const r = ri + 1;
    const xml = cells.map((c, ci) => {
      if (!c) return '';
      const ref = `${letter(ci)}${r}`;
      const s = c.s ? ` s="${c.s}"` : '';
      return typeof c.v === 'number'
        ? `<c r="${ref}"${s}><v>${Number.isFinite(c.v) ? c.v : 0}</v></c>`
        : `<c r="${ref}" t="inlineStr"${s}><is><t xml:space="preserve">${esc(c.v.slice(0, 32000))}</t></is></c>`;
    }).join('');
    const ht = heights[r] ? ` ht="${heights[r]}" customHeight="1"` : '';
    return `<row r="${r}"${ht}>${xml}</row>`;
  }).join('');
  const colsXml = `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`;
  const mergeXml = merges.length > 0 ? `<mergeCells count="${merges.length}">${merges.map(m => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
  const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
  const REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const head = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const moneyFmt = `${digits > 0 ? `#,##0.${'0'.repeat(digits)}` : '#,##0'} "${cur}"`;
  const border = '<border><left style="thin"><color rgb="FFCBD5E1"/></left><right style="thin"><color rgb="FFCBD5E1"/></right><top style="thin"><color rgb="FFCBD5E1"/></top><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border>';
  const xf = (font: number, fillId: number, bd: number, numFmt: number, align?: string): string =>
    `<xf numFmtId="${numFmt}" fontId="${font}" fillId="${fillId}" borderId="${bd}" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"${align ? ' applyAlignment="1">' + align + '</xf>' : '/>'}`;
  const al = (h: string, wrap = true): string => `<alignment horizontal="${h}" vertical="top"${wrap ? ' wrapText="1"' : ''}/>`;
  const styles = `${head}<styleSheet xmlns="${NS}"><numFmts count="2"><numFmt numFmtId="164" formatCode="${esc(moneyFmt)}"/><numFmt numFmtId="165" formatCode="0.##&quot;%&quot;"/></numFmts><fonts count="5"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="18"/><color rgb="FF${brand}"/><name val="Calibri"/></font><font><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF${brand}"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>${border}</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="15">${[
    xf(0, 0, 0, 0),
    xf(1, 0, 0, 0),
    xf(2, 2, 1, 0, al('center')),
    xf(3, 0, 0, 0),
    xf(0, 0, 1, 164, al('right', false)),
    xf(0, 0, 1, 0, al('left')),
    xf(2, 2, 0, 0, al('right', false)),
    xf(2, 2, 0, 164, al('right', false)),
    xf(0, 0, 1, 0, al('center')),
    xf(0, 0, 1, 165, al('center', false)),
    xf(4, 0, 0, 0),
    xf(1, 0, 0, 0, al('right', false)),
    xf(1, 0, 0, 164, al('right', false)),
    xf(0, 0, 0, 0, al('left')),
    xf(4, 0, 0, 0, al('left')),
  ].join('')}</cellXfs></styleSheet>`;
  const sheet = `${head}<worksheet xmlns="${NS}"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>${colsXml}<sheetData>${sheetRows}</sheetData>${mergeXml}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`;
  return makeZip([
    textFile('[Content_Types].xml', `${head}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`),
    textFile('_rels/.rels', `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`),
    textFile('xl/workbook.xml', `${head}<workbook xmlns="${NS}" xmlns:r="${REL}"><sheets><sheet name="${esc(t.quote === 'DEVIS' ? 'Devis' : 'Quote')}" sheetId="1" r:id="rId1"/></sheets></workbook>`),
    textFile('xl/_rels/workbook.xml.rels', `${head}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${REL}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${REL}/styles" Target="styles.xml"/></Relationships>`),
    textFile('xl/styles.xml', styles),
    textFile('xl/worksheets/sheet1.xml', sheet),
  ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

/* -------------------------------------------------------------------------- */
/*  Composants d'interface                                                     */
/* -------------------------------------------------------------------------- */

const INPUT =
  'h-10 w-full rounded-lg border bg-white px-3 text-[13px] text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:bg-slate-50 disabled:text-slate-400';
const BORDER_OK = 'border-slate-200';
const BORDER_ERR = 'border-red-400 ring-2 ring-red-100';
const CELL_INPUT =
  'h-9 w-full rounded-md border border-slate-200 bg-white px-1.5 text-[11.5px] text-slate-800 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20';
const DATE_CLASSES =
  '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0';

function Label({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <span className="mb-1 block text-[12px] font-medium text-slate-500">
      {children}
      {required && <span className="text-red-500"> *</span>}
    </span>
  );
}

function ErrorText({ children }: { children: ReactNode }) {
  return <p role="alert" className="mt-1 text-[11.5px] text-red-600">{children}</p>;
}

function OptionalChip() {
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-medium text-slate-500">Optionnel</span>;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconType;
  invalid?: boolean;
  suffix?: ReactNode;
}

function TextField({ icon: Icon, invalid, suffix, className = '', ...props }: TextFieldProps) {
  return (
    <div className="relative">
      {Icon && <Icon size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />}
      <input
        {...props}
        className={`${INPUT} ${invalid ? BORDER_ERR : BORDER_OK} ${Icon ? 'pl-9' : ''} ${suffix ? 'pr-12' : ''} ${className}`}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400">{suffix}</span>}
    </div>
  );
}

interface SelectFieldProps {
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
  invalid?: boolean;
  leading?: ReactNode;
  label?: string;
}

function SelectField({ value, onChange, children, invalid, leading, label }: SelectFieldProps) {
  return (
    <div className="relative">
      {leading && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">{leading}</span>}
      <select
        aria-label={label}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
        className={`${INPUT} appearance-none pr-8 ${invalid ? BORDER_ERR : BORDER_OK} ${leading ? 'pl-8' : ''}`}
      >
        {children}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-start gap-3 text-left">
      <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
      <span>
        <span className="block text-[13px] font-semibold text-slate-800">{label}</span>
        {hint && <span className="block text-[11.5px] leading-snug text-slate-500">{hint}</span>}
      </span>
    </button>
  );
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
          {description && <p className="mt-0.5 text-[11.5px] text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Logo / cachet / signature                                                  */
/* -------------------------------------------------------------------------- */

function ImageDropzone({ value, onChange, cta, hint, alt }: {
  value: string | null; onChange: (value: string | null) => void; cta: string; hint: string; alt: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [over, setOver] = useState(false);
  const handleFile = (file: File | undefined): void => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Format non pris en charge : PNG, JPG ou WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Le fichier dépasse 2 Mo.');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setOver(false);
    handleFile(e.dataTransfer.files[0]);
  };
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={`flex min-h-[132px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-4 text-center transition ${
          over ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-brand-50/40'
        }`}
      >
        {value ? (
          <>
            <img src={value} alt={alt} className="h-16 max-w-[160px] object-contain" />
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(null); }}
              className="flex items-center gap-1 text-[12px] font-medium text-red-600 hover:text-red-700"
            >
              <X size={13} /> Retirer
            </button>
          </>
        ) : (
          <>
            <Upload size={20} className="text-slate-500" />
            <p className="text-[12px] font-medium text-brand-700">{cta}</p>
            <p className="text-[11px] text-slate-400">{hint}</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
      </div>
      {error && <p role="alert" className="mt-2 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

function SignatureModal({ onClose, onSave }: { onClose: () => void; onSave: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const point = (e: ReactPointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * canvas.width) / r.width, y: ((e.clientY - r.top) * canvas.height) / r.height };
  };
  const start = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = point(e);
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.01, p.y + 0.01);
    ctx.stroke();
    setEmpty(false);
  };
  const move = (e: ReactPointerEvent<HTMLCanvasElement>): void => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const clear = (): void => {
    const canvas = canvasRef.current;
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setEmpty(true);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Dessiner une signature">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Dessinez votre signature</h3>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
        </div>
        <canvas
          ref={canvasRef}
          width={600}
          height={220}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={() => { drawing.current = false; }}
          onPointerCancel={() => { drawing.current = false; }}
          className="w-full touch-none rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
        />
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={clear} className="text-sm font-medium text-slate-500 hover:text-slate-800">Effacer</button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Annuler</button>
            <button
              type="button"
              disabled={empty}
              onClick={() => canvasRef.current && onSave(canvasRef.current.toDataURL('image/png'))}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              Utiliser cette signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultLogo({ color }: { color: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true" className="shrink-0">
      <rect x="5" y="9" width="34" height="38" rx="9" fill="none" stroke={color} strokeWidth="5" />
      <rect x="21" y="17" width="29" height="29" rx="8" fill="#F5A524" />
      <rect x="28" y="25" width="15" height="13" rx="4" fill="#fff" />
    </svg>
  );
}

function TemplateThumb({ cfg, color }: { cfg: TemplateConfig; color: string }) {
  const side = cfg.decor === 'sidebar' ? 3 : 0;
  const banner = cfg.header === 'banner';
  const head =
    cfg.table === 'filled' ? <rect x="6" y="34" width="48" height="5" fill={color} />
    : cfg.table === 'rounded' ? <rect x="6" y="34" width="48" height="5" rx="2.5" fill={color} />
    : cfg.table === 'zebra' ? <rect x="6" y="34" width="48" height="5" fill={color} opacity="0.22" />
    : cfg.table === 'underline' ? <rect x="6" y="38" width="48" height="1.2" fill={color} />
    : cfg.table === 'minimal' ? <rect x="6" y="38" width="48" height="1.2" fill="#0f172a" />
    : <rect x="6" y="34" width="48" height="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.4" />;
  return (
    <svg viewBox="0 0 60 80" className="h-full w-full" aria-hidden="true">
      <rect width="60" height="80" fill="#fff" />
      {cfg.decor === 'corners' && (
        <>
          {!banner && <polygon points="42,0 60,0 60,18" fill={color} />}
          <polygon points="0,80 0,68 30,80" fill={color} />
          <polygon points="60,80 60,68 30,80" fill={color} opacity="0.55" />
        </>
      )}
      {cfg.decor === 'topbar' && <rect width="60" height="3" fill={color} />}
      {cfg.decor === 'sidebar' && <rect width="4" height="80" fill={color} />}
      {cfg.decor === 'footerbar' && <rect y="76" width="60" height="4" fill={color} />}
      {cfg.decor === 'frame' && <rect x="2" y="2" width="56" height="76" fill="none" stroke={color} strokeWidth="0.8" />}
      {cfg.decor === 'diagonal' && (
        <>
          <polygon points="60,80 60,30 10,80" fill={color} opacity="0.12" />
          <polygon points="60,80 60,64 44,80" fill={color} />
        </>
      )}
      {cfg.decor === 'doublebar' && (
        <>
          <rect width="60" height="3" fill={color} />
          <rect y="4.5" width="60" height="0.8" fill={color} opacity="0.5" />
        </>
      )}
      {cfg.decor === 'wave' && <path d="M0,74 C14,80 26,68 40,74 S54,76 60,72 L60,80 L0,80Z" fill={color} />}
      <g transform={`translate(${side} 0)`}>
        {cfg.header === 'banner' && (
          <>
            <rect width="60" height="17" fill={color} />
            <rect x="6" y="5" width="7" height="7" rx="1.5" fill="#fff" opacity="0.9" />
            <rect x="16" y="6" width="14" height="2" fill="#fff" />
            <rect x="16" y="10" width="10" height="1.4" fill="#fff" opacity="0.7" />
          </>
        )}
        {cfg.header === 'split' && (
          <>
            <rect x="6" y="7" width="8" height="8" rx="2" fill={color} />
            <rect x="17" y="8" width="14" height="2" fill="#334155" />
            <rect x="17" y="12" width="10" height="1.4" fill="#cbd5e1" />
            {[8, 11, 14].map(y => <rect key={y} x="38" y={y} width="16" height="1.4" fill="#cbd5e1" />)}
          </>
        )}
        {cfg.header === 'centered' && (
          <>
            <circle cx="30" cy="9" r="4" fill={color} />
            <rect x="20" y="15" width="20" height="2" fill="#334155" />
          </>
        )}
        <rect x="6" y={banner ? 23 : 22} width="14" height="3" fill="#1e293b" />
        <rect x="6" y={banner ? 28 : 27} width="18" height="1.4" fill="#cbd5e1" />
        {head}
        {[41, 46, 51].map((y, i) => (
          <rect key={y} x="6" y={y} width="48" height="3" fill={cfg.table === 'zebra' && i % 2 ? '#f1f5f9' : '#f8fafc'} stroke="#e2e8f0" strokeWidth="0.3" />
        ))}
        {cfg.total === 'filled' && <rect x="34" y="58" width="20" height="6" fill={color} />}
        {cfg.total === 'outline' && <rect x="34" y="58" width="20" height="6" fill="none" stroke={color} strokeWidth="0.9" />}
        {cfg.total === 'soft' && <rect x="34" y="58" width="20" height="6" fill={color} opacity="0.25" />}
        <rect x="6" y="66" width="22" height="1.6" fill="#cbd5e1" />
        <rect x="6" y="70" width="16" height="1.6" fill="#e2e8f0" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Document du devis : pièces + pagination A4 robuste                         */
/*                                                                            */
/*  Principe : tout élément « long » (description d'une ligne, notes,          */
/*  conditions, pièces jointes…) est découpé mot par mot et réparti sur       */
/*  autant de pages que nécessaire. Les mesures se font dans le DOM réel,     */
/*  donc le résultat est identique pour les 24 modèles.                       */
/* -------------------------------------------------------------------------- */

interface DocProps {
  data: QuoteState;
  theme: ThemeState;
  company: CompanyProfile;
  calc: Totals;
  fmt: Formatter;
  money: (n: number) => string;
}

interface DocEnv extends DocProps { cfg: TemplateConfig }

/** Fragment d'une ligne du tableau : mots [a, b) de la description. */
interface RowFrag { i: number; a: number; b: number; cont: boolean; last: boolean; h: number }
/** Fragment d'un bloc sous le tableau. */
interface BlockFrag { key: string; a: number; b: number; cont: boolean; last: boolean }

interface StaticBlock { key: string; kind: 'static'; node: ReactNode }
interface TextBlock { key: string; kind: 'text'; tokens: string[]; render: (text: string, cont: boolean) => ReactNode }
type DocBlock = StaticBlock | TextBlock;

interface DocParts {
  banner: ReactNode;
  head: ReactNode;
  colgroup: ReactNode;
  thead: ReactNode;
  rowCount: number;
  rowTokens: string[][];
  renderRow: (idx: number, frag?: RowFrag) => ReactNode;
  blocks: DocBlock[];
  separate: boolean;
}

interface PageSpec { first: boolean; rows: RowFrag[]; blocks: BlockFrag[] }

function buildParts(env: DocEnv): DocParts {
  const { data, theme, company, calc, fmt, money, cfg } = env;
  const t = I18N[data.language];
  const c = theme.color;
  const soft = `${c}1A`;
  const banner = cfg.header === 'banner';
  const centered = cfg.header === 'centered';
  const vat = data.vatEnabled;
  const cur = currencySuffix(data.currency);
  const client = data.client;
  const showValidity = data.validityEnabled && Boolean(data.validityDate);
  const days = diffDays(data.emissionDate, data.validityDate);
  const visible = visibleLineIndexes(data.lines);
  const hasDiscount = visible.some(i => data.lines[i].discount > 0);
  const nowrap: CSSProperties = { whiteSpace: 'nowrap' };
  const separate = cfg.table === 'rounded';

  const thBase: CSSProperties =
    cfg.table === 'filled' ? { background: c, color: '#fff', border: `1px solid ${c}` }
    : cfg.table === 'rounded' ? { background: c, color: '#fff' }
    : cfg.table === 'zebra' ? { background: soft, color: c }
    : cfg.table === 'underline' ? { color: c, borderBottom: `2px solid ${c}` }
    : cfg.table === 'minimal' ? { color: '#0f172a', borderBottom: '2px solid #0f172a' }
    : { background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1' };

  const tdStyle = (i: number): CSSProperties =>
    cfg.table === 'zebra' ? { background: i % 2 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }
    : cfg.table === 'boxed' ? { border: '1px solid #cbd5e1' }
    : cfg.table === 'filled' ? { border: '1px solid #dbe3ef' }
    : cfg.table === 'minimal' ? { borderBottom: '1px solid #e2e8f0' }
    : { borderBottom: '1px solid #e2e8f0' };

  const totalStyle: CSSProperties =
    cfg.total === 'filled' ? { background: c, color: '#fff' }
    : cfg.total === 'outline' ? { border: `2px solid ${c}`, color: c }
    : { background: soft, color: c };

  type Col = { k: string; w: number | null; align: 'left' | 'center' | 'right'; label: ReactNode };
  const sub = (txt: string): ReactNode => <div className="text-[8.5px] font-normal opacity-80">{txt}</div>;
  const cols: Col[] = [
    { k: 'n', w: 28, align: 'center', label: '#' },
    { k: 'd', w: 108, align: 'left', label: t.designation },
    { k: 'desc', w: null, align: 'left', label: t.description },
    { k: 'q', w: 62, align: 'center', label: t.qty },
    { k: 'pu', w: 92, align: 'right', label: <>{vat ? t.unitPrice : t.unitPriceNet}{sub(`(${cur})`)}</> },
    ...(hasDiscount ? [{ k: 'disc', w: 50, align: 'center' as const, label: t.discount }] : []),
    ...(vat ? [{ k: 'vat', w: 42, align: 'center' as const, label: t.vat }] : []),
    { k: 'amt', w: 104, align: 'right', label: <>{vat ? t.amountHT : t.amountNet}{sub(`(${cur})`)}</> },
  ];

  const thead = (
    <tr>
      {cols.map((col, i) => {
        const first = i === 0;
        const last = i === cols.length - 1;
        const style: CSSProperties = cfg.table === 'rounded'
          ? { ...thBase, textAlign: col.align, borderRadius: `${first ? 8 : 0}px ${last ? 8 : 0}px ${last ? 8 : 0}px ${first ? 8 : 0}px` }
          : { ...thBase, textAlign: col.align };
        return <th key={col.k} className="px-2 py-2.5 font-semibold" style={{ ...style, overflowWrap: 'anywhere' }}>{col.label}</th>;
      })}
    </tr>
  );

  const colgroup = <colgroup>{cols.map(col => <col key={col.k} style={col.w ? { width: col.w } : undefined} />)}</colgroup>;

  const rowTokens = visible.map(li => tokenize(data.lines[li].description));

  const renderRow = (idx: number, frag?: RowFrag): ReactNode => {
    const li = visible[idx];
    const l = data.lines[li];
    const cont = frag ? frag.cont : false;
    const last = frag ? frag.last : true;
    const text = frag ? joinTokens(rowTokens[idx], frag.a, frag.b) : l.description.trim();
    const st: CSSProperties = {
      ...tdStyle(idx),
      ...(last ? {} : { borderBottom: 'none' }),
      ...(cont ? { borderTop: 'none' } : {}),
    };
    const cellFor = (k: string): ReactNode => {
      if (cont && k !== 'desc') return null;
      switch (k) {
        case 'n': return idx + 1;
        case 'd': return <div className="font-medium" style={{ maxHeight: 360, overflow: 'hidden' }}>{l.designation}</div>;
        case 'desc': return <span className="block whitespace-pre-line text-[10px] leading-snug text-slate-600">{text}</span>;
        case 'q': return `${l.quantity} ${l.unit}`;
        case 'pu': return fmt(l.unitPrice);
        case 'disc': return `${l.discount}%`;
        case 'vat': return `${l.vatRate}%`;
        default: return <span className="font-medium">{fmt(calc.lineTotals[li])}</span>;
      }
    };
    return (
      <tr key={`${idx}-${frag ? frag.a : 0}`} data-row={idx}>
        {cols.map(col => (
          <td
            key={col.k}
            data-k={col.k}
            className="px-2 py-3"
            style={{ ...st, textAlign: col.align, verticalAlign: 'top', overflowWrap: 'anywhere', ...(col.k === 'pu' || col.k === 'amt' ? nowrap : {}) }}
          >
            {cellFor(col.k)}
          </td>
        ))}
      </tr>
    );
  };

  const brand = (light: boolean): ReactNode => (
    <div className={`flex min-w-0 items-center gap-3 ${centered ? 'flex-col text-center' : ''}`}>
      {theme.logo ? (
        <img
          src={theme.logo}
          alt=""
          className="h-14 w-14 shrink-0 object-contain"
          style={light ? { background: '#fff', borderRadius: 10, padding: 4 } : undefined}
        />
      ) : (
        <DefaultLogo color={light ? '#fff' : c} />
      )}
      <div className="min-w-0">
        <div className="break-words text-[26px] font-extrabold leading-none tracking-tight" style={{ color: light ? '#fff' : '#0F1B3D', overflowWrap: 'anywhere' }}>
          {company.name || ' '}
        </div>
        {company.tagline && (
          <div className="mt-1.5 break-words text-[11px]" style={{ color: light ? 'rgba(255,255,255,.85)' : '#64748B' }}>{company.tagline}</div>
        )}
      </div>
    </div>
  );

  const contactItems: [IconType, string][] = ([
    [MapPin, company.address], [Phone, company.phone], [Mail, company.email], [Globe, company.website],
  ] as [IconType, string][]).filter(([, text]) => text.trim() !== '');

  const contact = (light: boolean): ReactNode => (
    <ul
      className={`min-w-0 space-y-1 text-[10px] ${centered ? 'flex flex-wrap justify-center gap-x-4 space-y-0' : 'max-w-[300px] shrink-0'}`}
      style={{ color: light ? '#fff' : '#334155' }}
    >
      {contactItems.map(([Icon, text]) => (
        <li key={text} className="flex items-center gap-1.5">
          <span
            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
            style={{ background: light ? 'rgba(255,255,255,.22)' : c, color: '#fff' }}
          >
            <Icon size={9} />
          </span>
          <span className="min-w-0" style={{ overflowWrap: 'anywhere' }}>{text}</span>
        </li>
      ))}
    </ul>
  );

  const bannerNode = banner ? (
    <>
      {brand(true)}
      {contact(true)}
    </>
  ) : null;

  const clientLines: ReactNode[] = [
    client.address && <div key="a">{client.address}</div>,
    client.country && <div key="c">{client.country}</div>,
    client.phone && <div key="p">{t.tel} {client.phone}</div>,
    client.email && <div key="e">{t.email} {client.email}</div>,
    client.taxId && <div key="t">{t.taxId} {client.taxId}</div>,
    client.registrationNumber && <div key="r">{t.regNo} {client.registrationNumber}</div>,
  ].filter(Boolean) as ReactNode[];

  const head = (
    <div className="pb-6">
      {cfg.header === 'split' && (
        <div className="flex items-start justify-between gap-6">
          {brand(false)}
          {contact(false)}
        </div>
      )}
      {centered && (
        <div className="flex flex-col items-center gap-3 border-b border-slate-200 pb-5">
          {brand(false)}
          {contact(false)}
        </div>
      )}
      <div className={`${banner ? 'mt-0' : 'mt-8'} flex justify-between gap-6 ${centered ? 'flex-col items-center text-center' : 'items-end'}`}>
        <div className="min-w-0">
          <h1 className="text-[30px] font-extrabold leading-none tracking-tight" style={{ color: '#0F1B3D' }}>{t.quote}</h1>
          <div className="mt-2 text-[13px] font-bold" style={{ overflowWrap: 'anywhere' }}>N° {data.number}</div>
        </div>
        <dl className="grid shrink-0 grid-cols-[auto_auto] gap-x-6 gap-y-1 text-[10px]">
          <dt className="text-slate-500">{t.issueDate}</dt><dd className="text-right">{fmtDate(data.emissionDate)}</dd>
          {showValidity && (<><dt className="text-slate-500">{t.validUntil}</dt><dd className="text-right">{fmtDate(data.validityDate)}</dd></>)}
          <dt className="text-slate-500">{t.currency}</dt><dd className="text-right">{currencyLabel(data.currency)}</dd>
        </dl>
      </div>
      <div className={`mt-7 text-[11px] leading-[1.55] ${centered ? 'text-center' : ''}`} style={{ overflowWrap: 'anywhere' }}>
        <div className="text-[12px] font-bold text-slate-900">{t.client}</div>
        <div className="font-bold">{client.name || '—'}</div>
        {clientLines}
      </div>
    </div>
  );

  const blocks: DocBlock[] = [];
  blocks.push({
    key: 'totals',
    kind: 'static',
    node: (
      <div className="pt-5">
        <div className="ml-auto w-[280px] text-[11px]">
          {vat && (
            <>
              <div className="flex justify-between gap-3 border border-slate-200 px-3 py-2">
                <span>{t.subtotal}</span><span className="font-medium" style={nowrap}>{money(calc.subtotal)}</span>
              </div>
              {calc.vatRows.map(r => (
                <div key={r.rate} className="flex justify-between gap-3 border border-t-0 border-slate-200 px-3 py-2">
                  <span>{t.vat} ({r.rate}%)</span><span className="font-medium" style={nowrap}>{money(r.amount)}</span>
                </div>
              ))}
            </>
          )}
          <div className={`${vat ? 'mt-2' : ''} flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-[13.5px] font-bold`} style={totalStyle}>
            <span>{vat ? t.total : t.totalNet}</span><span style={nowrap}>{money(calc.total)}</span>
          </div>
          {!vat && <div className="mt-1.5 text-right text-[9.5px] text-slate-500">{t.vatNA}</div>}
        </div>
      </div>
    ),
  });

  if (data.specialConditions.trim()) {
    blocks.push({
      key: 'special',
      kind: 'text',
      tokens: tokenize(data.specialConditions),
      render: (text, cont) => (
        <div className={`${cont ? '' : 'pt-6'} break-words text-[10.5px] italic leading-[1.6]`} style={{ color: c, overflowWrap: 'anywhere' }}>
          <span data-t="" className="block whitespace-pre-line">{text}</span>
        </div>
      ),
    });
  }

  const termLines: ReactNode[] = [
    data.paymentTerms && <div key="pt">{data.paymentTerms}</div>,
    data.executionDelay && <div key="d"><span className="text-slate-600">{t.delay}</span> {data.executionDelay}</div>,
    showValidity && <div key="v"><span className="text-slate-600">{t.validity}</span> {days} {t.days}</div>,
    data.paymentMethod && <div key="m" className="font-bold">{t.method} <span className="font-semibold">{data.paymentMethod}</span></div>,
    data.deliveryTerms && <div key="dl"><span className="text-slate-600">{t.delivery}</span> {data.deliveryTerms}</div>,
  ].filter(Boolean) as ReactNode[];

  const hasLeft = termLines.length > 0;
  const madeAt = `${company.city ? `${t.madeAt} ${company.city}, ${t.on}` : `${t.on[0].toUpperCase()}${t.on.slice(1)}`} ${fmtDate(data.emissionDate)}`;

  blocks.push({
    key: 'terms',
    kind: 'static',
    node: (
      <div className={`grid gap-8 pt-8 text-[10.5px] leading-[1.7] ${hasLeft ? 'grid-cols-[1.25fr_1fr]' : 'grid-cols-[1fr_1fr]'}`} style={{ overflowWrap: 'anywhere' }}>
        {hasLeft ? (
          <div>
            <div className="mb-1 text-[11px] font-bold text-slate-900">{t.conditions}</div>
            {termLines}
          </div>
        ) : <div />}
        <div className="border-l border-slate-200 pl-6 text-center">
          <div className="text-[10px] text-slate-500">{madeAt}</div>
          {company.signatory && <div className="mt-3 text-[11px] font-bold text-slate-900">{company.signatory}</div>}
          {company.signatoryRole && <div className="text-[10px] text-slate-500">{company.signatoryRole}</div>}
          <div className="relative mx-auto mt-1 h-[84px] w-[200px]">
            {theme.signature && <img src={theme.signature} alt="" className="absolute left-0 top-2 h-[64px] w-[130px] object-contain" />}
            {theme.stamp && <img src={theme.stamp} alt="" className="absolute right-0 top-0 h-[80px] w-[80px] object-contain" />}
          </div>
        </div>
      </div>
    ),
  });

  paragraphs(data.notes).forEach((p, i) => {
    blocks.push({
      key: `notes-${i}`,
      kind: 'text',
      tokens: tokenize(p),
      render: (text, cont) => (
        <div className={`${cont ? '' : i === 0 ? 'pt-6' : 'pt-1.5'} break-words text-[10.5px] leading-[1.6] text-slate-600`} style={{ overflowWrap: 'anywhere' }}>
          {!cont && i === 0 && <div className="mb-1 text-[11px] font-bold text-slate-900">{t.notes}</div>}
          <span data-t="" className="block whitespace-pre-line">{text}</span>
        </div>
      ),
    });
  });

  if (data.attachments.length > 0) {
    blocks.push({
      key: 'att',
      kind: 'text',
      tokens: tokenize(data.attachments.map(a => a.name).join(', ')),
      render: (text, cont) => (
        <div className={`${cont ? '' : 'pt-5'} break-words text-[10.5px] text-slate-600`} style={{ overflowWrap: 'anywhere' }}>
          {!cont && <b className="text-slate-800">{t.attachments} </b>}
          <span data-t="">{text}</span>
        </div>
      ),
    });
  }

  paragraphs(data.generalConditions).forEach((p, i) => {
    blocks.push({
      key: `gc-${i}`,
      kind: 'text',
      tokens: tokenize(p),
      render: (text, cont) => (
        <div className={`${cont ? '' : i === 0 ? 'pt-6' : 'pt-1.5'} break-words text-[9.5px] leading-[1.55] text-slate-500`} style={{ overflowWrap: 'anywhere' }}>
          {!cont && i === 0 && <div className="mb-1 text-[11px] font-bold text-slate-800">{t.terms}</div>}
          <span data-t="" className="block whitespace-pre-line">{text}</span>
        </div>
      ),
    });
  });

  blocks.push({
    key: 'thanks',
    kind: 'static',
    node: <div className="pt-8 text-center text-[11px] font-medium" style={{ color: c }}>{t.thanks}</div>,
  });

  return {
    banner: bannerNode, head, colgroup, thead, rowCount: visible.length, rowTokens, renderRow, blocks, separate,
  };
}

function DocTable({ parts, rows, measure }: { parts: DocParts; rows: RowFrag[]; measure?: boolean }) {
  return (
    <table
      data-mt={measure ? '' : undefined}
      className="w-full text-[11px]"
      style={{ tableLayout: 'fixed', borderCollapse: parts.separate ? 'separate' : 'collapse', borderSpacing: 0 }}
    >
      {parts.colgroup}
      <thead>{parts.thead}</thead>
      <tbody>{rows.map(f => parts.renderRow(f.i, f))}</tbody>
    </table>
  );
}

/** Plus grand `end` tel que mesure(start→end) ≤ maxH. `hi` (= fin du texte) est supposé ne pas tenir. */
function fitTokens(total: number, start: number, maxH: number, measure: (end: number) => number): number {
  let lo = start;
  let hi = total;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (measure(mid) <= maxH) lo = mid;
    else hi = mid;
  }
  return lo;
}

const MIN_TOKENS = 8;
const SAFETY = 10;

function paginate(root: HTMLElement, host: HTMLElement, geo: Geometry, parts: DocParts): PageSpec[] {
  host.replaceChildren();
  const h = (el: Element | null): number => (el ? el.getBoundingClientRect().height : 0);
  const headH = h(root.querySelector('[data-m="head"]'));
  const theadH = h(root.querySelector('thead'));
  const tableEl = root.querySelector<HTMLTableElement>('table[data-mt]');
  const rowEls = Array.from(root.querySelectorAll<HTMLElement>('tr[data-row]'));
  const rowH = rowEls.map(h);
  const blockH: Record<string, number> = {};
  parts.blocks.forEach(b => { blockH[b.key] = h(root.querySelector(`[data-b="${b.key}"]`)); });

  /* Sondes : copies du DOM mesuré dans lesquelles on remplace le texte pour mesurer un fragment. */
  let probeBody: HTMLTableSectionElement | null = null;
  if (tableEl) {
    const probeTable = tableEl.cloneNode(false) as HTMLTableElement;
    const cg = tableEl.querySelector('colgroup');
    if (cg) probeTable.appendChild(cg.cloneNode(true));
    probeBody = document.createElement('tbody');
    probeTable.appendChild(probeBody);
    host.appendChild(probeTable);
  }
  const textHost = document.createElement('div');
  host.appendChild(textHost);

  const measureRow = (i: number, a: number, b: number, cont: boolean): number => {
    const src = rowEls[i];
    if (!src || !probeBody) return rowH[i] ?? 0;
    const clone = src.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('td').forEach(td => {
      if (td.getAttribute('data-k') === 'desc') {
        const sp = td.querySelector('span');
        if (sp) sp.textContent = joinTokens(parts.rowTokens[i] ?? [], a, b);
      } else if (cont) {
        td.textContent = '';
      }
    });
    probeBody.replaceChildren(clone);
    return clone.getBoundingClientRect().height;
  };

  const measureText = (key: string, tokens: string[], a: number, b: number, cont: boolean): number => {
    const src = root.querySelector<HTMLElement>(cont ? `[data-bc="${key}"]` : `[data-b="${key}"]`);
    if (!src) return 0;
    const clone = src.cloneNode(true) as HTMLElement;
    const target = clone.querySelector('[data-t]');
    if (target) target.textContent = joinTokens(tokens, a, b);
    textHost.replaceChildren(clone);
    return clone.getBoundingClientRect().height;
  };

  const availFirst = PAGE_H - BOTTOM - geo.topFirst - SAFETY;
  const availCont = PAGE_H - BOTTOM - geo.topCont - SAFETY;
  const pages: PageSpec[] = [];
  let cur: PageSpec = { first: true, rows: [], blocks: [] };
  let used = headH;
  let avail = availFirst;
  const flush = (): void => {
    pages.push(cur);
    cur = { first: false, rows: [], blocks: [] };
    used = 0;
    avail = availCont;
  };
  const isEmpty = (): boolean => !cur.first && cur.rows.length === 0 && cur.blocks.length === 0;

  /* ---- Lignes du tableau (découpées mot par mot si besoin) ---- */
  for (let i = 0; i < rowEls.length; i += 1) {
    const toks = parts.rowTokens[i] ?? [];
    const n = toks.length;
    let a = 0;
    let cont = false;
    let guard = 0;
    for (;;) {
      guard += 1;
      if (guard > 500) {
        cur.rows.push({ i, a, b: n, cont, last: true, h: 0 });
        break;
      }
      const extra = cur.rows.length === 0 ? theadH : 0;
      const whole = !cont && a === 0 ? rowH[i] : measureRow(i, a, n, cont);
      if (used + extra + whole <= avail) {
        cur.rows.push({ i, a, b: n, cont, last: true, h: whole });
        used += extra + whole;
        break;
      }
      const room = avail - used - extra;
      let e = a;
      if (n - a > 1 && room > 0) e = fitTokens(n, a, room, end => measureRow(i, a, end, cont));
      const need = Math.min(n - a, MIN_TOKENS);
      if (e > a && (e - a >= need || isEmpty())) {
        cur.rows.push({ i, a, b: e, cont, last: false, h: 0 });
        flush();
        a = e;
        cont = true;
        continue;
      }
      if (!isEmpty()) {
        flush();
        continue;
      }
      // Page vierge et rien ne tient : on force l'avancement pour ne jamais boucler.
      const forced = n === 0 ? 0 : Math.min(n, a + Math.max(1, e - a));
      if (n === 0 || forced >= n) {
        cur.rows.push({ i, a, b: n, cont, last: true, h: 0 });
        used = avail;
        break;
      }
      cur.rows.push({ i, a, b: forced, cont, last: false, h: 0 });
      flush();
      a = forced;
      cont = true;
    }
  }

  /* ---- Blocs sous le tableau ---- */
  for (const blk of parts.blocks) {
    if (blk.kind === 'static') {
      const bh = blockH[blk.key] ?? 0;
      if (used + bh > avail) {
        if (blk.key === 'thanks') continue; // simple remerciement : on l'omet plutôt que de créer une page
        if (!isEmpty()) {
          const lastRow = cur.rows[cur.rows.length - 1];
          if (blk.key === 'totals' && cur.rows.length > 1 && cur.blocks.length === 0 && lastRow.last && !lastRow.cont && lastRow.h > 0) {
            // Les totaux ne restent jamais seuls : on emmène la dernière ligne avec eux.
            cur.rows.pop();
            flush();
            cur.rows.push(lastRow);
            used = theadH + lastRow.h;
          } else {
            flush();
          }
        }
      }
      cur.blocks.push({ key: blk.key, a: 0, b: 0, cont: false, last: true });
      used += bh;
      continue;
    }
    const toks = blk.tokens;
    const n = toks.length;
    let a = 0;
    let cont = false;
    let guard = 0;
    for (;;) {
      guard += 1;
      if (guard > 500) {
        cur.blocks.push({ key: blk.key, a, b: n, cont, last: true });
        break;
      }
      const whole = !cont && a === 0 ? (blockH[blk.key] ?? 0) : measureText(blk.key, toks, a, n, true);
      if (used + whole <= avail) {
        cur.blocks.push({ key: blk.key, a, b: n, cont, last: true });
        used += whole;
        break;
      }
      const room = avail - used;
      let e = a;
      if (n - a > 1 && room > 0) e = fitTokens(n, a, room, end => measureText(blk.key, toks, a, end, cont));
      const need = Math.min(n - a, MIN_TOKENS);
      if (e > a && (e - a >= need || isEmpty())) {
        cur.blocks.push({ key: blk.key, a, b: e, cont, last: false });
        flush();
        a = e;
        cont = true;
        continue;
      }
      if (!isEmpty()) {
        flush();
        continue;
      }
      const forced = Math.min(n, a + Math.max(1, e - a));
      if (forced >= n) {
        cur.blocks.push({ key: blk.key, a, b: n, cont, last: true });
        used = avail;
        break;
      }
      cur.blocks.push({ key: blk.key, a, b: forced, cont, last: false });
      flush();
      a = forced;
      cont = true;
    }
  }

  pages.push(cur);
  host.replaceChildren();
  return pages;
}

function Decor({ cfg, c }: { cfg: TemplateConfig; c: string }) {
  const banner = cfg.header === 'banner';
  return (
    <>
      {cfg.decor === 'corners' && (
        <>
          {!banner && (
            <svg className="absolute right-0 top-0" width="96" height="96" viewBox="0 0 96 96" aria-hidden="true">
              <polygon points="28,0 96,0 96,68" fill={c} />
              <polygon points="58,0 96,0 96,38" fill={c} opacity="0.55" />
            </svg>
          )}
          <svg className="absolute bottom-0 left-0" width="300" height="70" viewBox="0 0 300 70" aria-hidden="true">
            <polygon points="0,70 0,22 190,70" fill={c} />
            <polygon points="0,70 0,44 100,70" fill={c} opacity="0.5" />
          </svg>
          <svg className="absolute bottom-0 right-0" width="300" height="70" viewBox="0 0 300 70" aria-hidden="true">
            <polygon points="300,70 300,22 110,70" fill={c} />
            <polygon points="300,70 300,44 200,70" fill={c} opacity="0.5" />
          </svg>
        </>
      )}
      {cfg.decor === 'topbar' && <div className="absolute inset-x-0 top-0 h-2" style={{ background: c }} />}
      {cfg.decor === 'sidebar' && <div className="absolute left-0 top-0 h-full w-3.5" style={{ background: c }} />}
      {cfg.decor === 'footerbar' && <div className="absolute inset-x-0 bottom-0 h-3" style={{ background: c }} />}
      {cfg.decor === 'frame' && <div className="absolute inset-4 border-2" style={{ borderColor: c }} />}
      {cfg.decor === 'doublebar' && (
        <>
          <div className="absolute inset-x-0 top-0 h-2" style={{ background: c }} />
          <div className="absolute inset-x-0 top-[13px] h-[2px]" style={{ background: c, opacity: 0.45 }} />
        </>
      )}
      {cfg.decor === 'diagonal' && (
        <svg className="absolute bottom-0 right-0" width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
          <polygon points="220,220 220,0 0,220" fill={c} opacity="0.1" />
          <polygon points="220,220 220,110 110,220" fill={c} />
        </svg>
      )}
      {cfg.decor === 'wave' && (
        <svg className="absolute bottom-0 left-0" width={PAGE_W} height="80" viewBox="0 0 794 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,28 C180,78 330,-6 500,30 S730,58 794,14 L794,80 L0,80Z" fill={c} opacity="0.35" />
          <path d="M0,44 C150,84 300,6 470,44 S720,74 794,38 L794,80 L0,80Z" fill={c} />
        </svg>
      )}
    </>
  );
}

function QuotePage({ spec, index, total, parts, env }: { spec: PageSpec; index: number; total: number; parts: DocParts; env: DocEnv }) {
  const { cfg, theme, company, data } = env;
  const geo = geometry(cfg);
  const c = theme.color;
  const t = I18N[data.language];
  const cornerRight = cfg.decor === 'corners' && !geo.banner;
  return (
    <div
      data-doc-page=""
      className="relative overflow-hidden bg-white text-slate-800"
      style={{ width: PAGE_W, height: PAGE_H, fontSize: 12, fontFamily: fontFor(cfg) }}
    >
      <Decor cfg={cfg} c={c} />
      {spec.first && geo.banner && (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-6 overflow-hidden" style={{ height: BANNER_H, background: c, paddingLeft: geo.padL, paddingRight: geo.padR }}>
          {parts.banner}
        </div>
      )}
      {!spec.first && (geo.banner ? (
        <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 overflow-hidden whitespace-nowrap text-[11px] font-semibold text-white" style={{ height: RUN_BAND, background: c, paddingLeft: geo.padL, paddingRight: geo.padR }}>
          <span className="truncate">{company.name}</span>
          <span className="shrink-0">{t.quote} N° {data.number}</span>
        </div>
      ) : (
        <div
          className="absolute flex items-center justify-between gap-4 overflow-hidden whitespace-nowrap border-b border-slate-200 text-[10.5px] text-slate-500"
          style={{ left: geo.padL, right: geo.padR + (cornerRight ? 60 : 0), top: 34, height: 28 }}
        >
          <span className="truncate font-semibold" style={{ color: c }}>{company.name}</span>
          <span className="shrink-0">{t.quote} N° {data.number}</span>
        </div>
      ))}
      <div className="absolute flex flex-col overflow-hidden" style={{ left: geo.padL, right: geo.padR, top: spec.first ? geo.topFirst : geo.topCont, bottom: BOTTOM }}>
        {spec.first && <div className="shrink-0">{parts.head}</div>}
        {spec.rows.length > 0 && <div className="shrink-0"><DocTable parts={parts} rows={spec.rows} /></div>}
        {spec.blocks.map(frag => {
          const block = parts.blocks.find(b => b.key === frag.key);
          if (!block) return null;
          const node = block.kind === 'static' ? block.node : block.render(joinTokens(block.tokens, frag.a, frag.b), frag.cont);
          return <div key={`${frag.key}-${frag.a}`} className={`shrink-0 ${frag.key === 'thanks' ? 'mt-auto' : ''}`}>{node}</div>;
        })}
      </div>
      {total > 1 && (
        <div className="absolute text-[10px] text-slate-400" style={{ right: geo.padR, bottom: 82 }}>{t.page} {index + 1} / {total}</div>
      )}
    </div>
  );
}

function ScaledPages({ pages, maxScale = 1 }: { pages: ReactNode[]; maxScale?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = (): void => setScale(Math.min(maxScale, el.clientWidth / PAGE_W));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxScale]);
  return (
    <div ref={wrapRef} className="mx-auto w-full" style={{ maxWidth: PAGE_W * maxScale }}>
      {pages.map((page, i) => (
        <div
          key={i}
          className="relative mb-4 overflow-hidden rounded-md bg-white shadow-[0_8px_30px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-200 last:mb-0"
          style={{ width: PAGE_W * scale, height: PAGE_H * scale }}
        >
          <div style={{ width: PAGE_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{page}</div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page principale                                                            */
/* -------------------------------------------------------------------------- */

const STEPS: { key: StepKey; label: string; optional?: boolean }[] = [
  { key: 'general', label: 'Informations' },
  { key: 'client', label: 'Client' },
  { key: 'lines', label: 'Prestations' },
  { key: 'conditions', label: 'Conditions', optional: true },
  { key: 'custom', label: 'Personnalisation' },
  { key: 'preview', label: 'Aperçu & export' },
];

const FEATURES = [
  '24 modèles professionnels',
  'Palette de couleurs illimitée',
  'Logo, cachet et signature',
  'PDF, Word, Excel, Image, EPUB',
  'Devis multi-pages impeccables',
];

const EXPORT_BUTTONS: { format: ExportFormat; label: string; icon: IconType; className: string }[] = [
  { format: 'pdf', label: 'PDF', icon: FileText, className: 'bg-red-500 hover:bg-red-600' },
  { format: 'word', label: 'Word', icon: FileType, className: 'bg-blue-600 hover:bg-blue-700' },
  { format: 'excel', label: 'Excel', icon: FileSpreadsheet, className: 'bg-green-600 hover:bg-green-700' },
  { format: 'image', label: 'Image', icon: ImageIcon, className: 'bg-violet-500 hover:bg-violet-600' },
  { format: 'epub', label: 'EPUB', icon: BookOpen, className: 'bg-orange-500 hover:bg-orange-600' },
];

const newLine = (patch: Partial<QuoteLine> = {}): QuoteLine => ({
  id: crypto.randomUUID(), designation: '', description: '', quantity: 1, unit: 'Projet', unitPrice: 0, discount: 0, vatRate: 18, ...patch,
});

function initialState(): QuoteState {
  const today = toISO(new Date());
  return {
    number: `DEV-${new Date().getFullYear()}-0001`,
    emissionDate: today,
    validityEnabled: true,
    validityDate: addDays(today, 30),
    currency: 'XOF',
    language: 'fr',
    status: 'draft',
    vatEnabled: true,
    vatRate: 18,
    client: { ...EMPTY_CLIENT },
    lines: [newLine()],
    executionDelay: '',
    paymentTerms: '',
    paymentMethod: '',
    depositPercent: 0,
    deliveryTerms: '',
    specialConditions: '',
    notes: '',
    generalConditions: '',
    attachments: [],
  };
}

export function CreateQuotePage({ company: companyOverride }: { company?: Partial<CompanyProfile> }) {
  const navigate = useNavigate();
  const [company, setCompany] = useState<CompanyProfile>(() => loadCompany(companyOverride));
  const [data, setData] = useState<QuoteState>(initialState);
  const [theme, setTheme] = useState<ThemeState>({ template: 3, color: '#1D4ED8', logo: null, signature: null, stamp: null });
  const [activeStep, setActiveStep] = useState<StepKey>('general');
  const [condTab, setCondTab] = useState<'commercial' | 'notes' | 'files' | 'general'>('commercial');
  const [customTab, setCustomTab] = useState<'models' | 'colors' | 'branding'>('models');
  const [showErrors, setShowErrors] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'err' } | null>(null);
  const [hexInput, setHexInput] = useState('');
  const topRef = useRef<HTMLDivElement>(null);
  const attachInput = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const exportWrapRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const stepIdx = STEPS.findIndex(s => s.key === activeStep);

  useEffect(() => {
    try {
      window.localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(company));
    } catch {
      /* stockage indisponible : on ignore */
    }
  }, [company]);

  useEffect(() => setHexInput(theme.color), [theme.color]);

  const dData = useDeferredValue(data);
  const dTheme = useDeferredValue(theme);
  const dCompany = useDeferredValue(company);
  const calc = useMemo(() => computeTotals(dData.lines, dData.vatEnabled), [dData.lines, dData.vatEnabled]);
  const fmt = useMemo(() => makeFormatter(dData.currency), [dData.currency]);
  const cur = currencySuffix(dData.currency);
  const money = useCallback((n: number): string => `${fmt(n)}\u00a0${cur}`, [fmt, cur]);
  const cfg = TEMPLATES[dTheme.template - 1];
  const geo = useMemo(() => geometry(cfg), [cfg]);
  const env = useMemo<DocEnv>(
    () => ({ data: dData, theme: dTheme, company: dCompany, calc, fmt, money, cfg }),
    [dData, dTheme, dCompany, calc, fmt, money, cfg],
  );
  const parts = useMemo(() => buildParts(env), [env]);
  const measureRows = useMemo<RowFrag[]>(
    () => Array.from({ length: parts.rowCount }, (_, i) => ({ i, a: 0, b: parts.rowTokens[i].length, cont: false, last: true, h: 0 })),
    [parts],
  );

  const [pages, setPages] = useState<PageSpec[]>([{ first: true, rows: [], blocks: [] }]);
  const runPaginate = useCallback((): void => {
    const root = measureRef.current;
    const host = probeRef.current;
    if (!root || !host) return;
    const next = paginate(root, host, geo, parts);
    setPages(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [geo, parts]);

  useLayoutEffect(() => { runPaginate(); }, [runPaginate]);
  useEffect(() => {
    let cancelled = false;
    const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
    fonts?.ready.then(() => { if (!cancelled) runPaginate(); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [runPaginate]);

  const renderPages = (limit?: number): ReactNode[] =>
    pages.slice(0, limit).map((spec, i) => (
      <QuotePage key={i} spec={spec} index={i} total={pages.length} parts={parts} env={env} />
    ));

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    const c = data.client;
    if (!data.number.trim()) e.number = 'Numéro requis';
    if (!c.name.trim()) e.name = 'Requis';
    if (!c.phone.trim()) e.phone = 'Requis';
    if (!EMAIL_RE.test(c.email.trim())) e.email = 'E-mail invalide';
    if (!c.address.trim()) e.address = 'Requis';
    if (!c.country) e.country = 'Requis';
    if (data.lines.every(l => !l.designation.trim())) e.lines = 'Ajoutez au moins une prestation avec une désignation.';
    return e;
  }, [data.number, data.client, data.lines]);

  const bad = (key: string): boolean => showErrors && Boolean(errors[key]);

  const stepHasError = (key: StepKey): boolean => {
    if (key === 'general') return Boolean(errors.number);
    if (key === 'client') return ['name', 'phone', 'email', 'address', 'country'].some(k => errors[k]);
    if (key === 'lines') return Boolean(errors.lines);
    return false;
  };

  const notify = useCallback((msg: string, tone: 'ok' | 'err' = 'ok') => {
    setToast({ msg, tone });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const scrollTop = (): void => {
    window.setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  const goTo = (target: StepKey): void => {
    const ti = STEPS.findIndex(s => s.key === target);
    if (ti > stepIdx) {
      for (let i = stepIdx; i < ti; i += 1) {
        const k = STEPS[i].key;
        if (stepHasError(k)) {
          setShowErrors(true);
          setActiveStep(k);
          notify('Complétez les champs obligatoires pour continuer.', 'err');
          scrollTop();
          return;
        }
      }
    }
    setActiveStep(target);
    scrollTop();
  };

  const set = <K extends keyof QuoteState>(key: K, value: QuoteState[K]): void =>
    setData(prev => ({ ...prev, [key]: value }));
  const setClient = (patch: Partial<ClientInfo>): void =>
    setData(prev => ({ ...prev, client: { ...prev.client, ...patch } }));
  const updateLine = (id: string, patch: Partial<QuoteLine>): void =>
    setData(prev => ({ ...prev, lines: prev.lines.map(l => (l.id === id ? { ...l, ...patch } : l)) }));
  const setCompanyField = (patch: Partial<CompanyProfile>): void => setCompany(prev => ({ ...prev, ...patch }));
  const setEmission = (iso: string): void => {
    if (!iso) return;
    setData(prev => ({ ...prev, emissionDate: iso, validityDate: addDays(iso, Math.max(0, diffDays(prev.emissionDate, prev.validityDate))) }));
  };
  const validityDays = Math.max(0, diffDays(data.emissionDate, data.validityDate));
  const setValidityDays = (days: number): void => set('validityDate', addDays(data.emissionDate, days));
  const setVatRate = (rate: number): void => {
    const r = Math.min(100, Math.max(0, rate || 0));
    setData(prev => ({ ...prev, vatRate: r, lines: prev.lines.map(l => ({ ...l, vatRate: r })) }));
  };
  const setDeposit = (value: number): void => {
    const p = Math.min(100, Math.max(0, Math.round(value) || 0));
    setData(prev => ({ ...prev, depositPercent: p, paymentTerms: termsFromDeposit(p, prev.paymentTerms) }));
  };
  const setPaymentTerms = (terms: string): void =>
    setData(prev => ({ ...prev, paymentTerms: terms, depositPercent: depositFromTerms(terms) }));
  const addAttachments = (files: FileList | null): void => {
    if (!files) return;
    const added = Array.from(files).map(f => ({ id: crypto.randomUUID(), name: f.name, size: f.size }));
    set('attachments', [...data.attachments, ...added]);
  };
  const applyHex = (value: string): void => {
    const v = value.startsWith('#') ? value : `#${value}`;
    setHexInput(v);
    if (HEX_RE.test(v)) setTheme(p => ({ ...p, color: v.toUpperCase() }));
  };

  /* ========================================================================== */
  /*  SAUVEGARDE SUPABASE (inchangée)                                            */
  /* ========================================================================== */

  const handleSaveToSupabase = async (): Promise<void> => {
    // 1. Validation avant sauvegarde
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      const failing = STEPS.find(s => stepHasError(s.key));
      if (failing) setActiveStep(failing.key);
      notify('Complétez les champs obligatoires avant d\'enregistrer.', 'err');
      scrollTop();
      return;
    }

    setIsSaving(true);
    try {
      // 2. Vérifier l'utilisateur connecté
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Vous devez être connecté pour sauvegarder un devis.');
      }

      // 3. Récupérer l'ID de l'organisation existante
      let organizationId: string | null = null;

      try {
        const { data: member, error: memberError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (!memberError && member) {
          organizationId = member.organization_id;
        }
      } catch {
        organizationId = null;
      }

      // 4. Si pas d'organisation, la créer via la fonction RPC
      if (!organizationId) {
        const { data: orgId, error: rpcError } = await supabase.rpc('create_organization', {
          p_name: company.name || 'Mon Entreprise',
          p_email: company.email || user.email || '',
          p_phone: company.phone || '',
          p_address: company.address || '',
          p_default_currency: data.currency,
          p_default_tax_rate: data.vatRate,
          p_quote_prefix: 'DEV-',
          p_quote_sequence: 1,
          p_default_payment_conditions: data.paymentTerms || 'Paiement à 30 jours',
          p_default_validity_days: 30,
          p_default_notes: data.notes || '',
        });

        if (rpcError || !orgId) {
          console.error('Erreur RPC:', rpcError);
          throw new Error(rpcError?.message || 'Impossible de créer votre entreprise.');
        }

        organizationId = orgId;
      }

      // 5. Sauvegarder ou récupérer le client
      let clientId: string | null = null;
      if (data.client.name.trim()) {
        const { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('name', data.client.name)
          .eq('email', data.client.email)
          .maybeSingle();

        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              organization_id: organizationId,
              name: data.client.name,
              email: data.client.email || null,
              phone: data.client.phone || null,
              address: data.client.address || null,
            })
            .select('id')
            .single();

          if (clientError) {
            console.warn('Erreur client (non bloquante):', clientError);
          } else {
            clientId = newClient.id;
          }
        }
      }

      // 6. Préparer les lignes au format JSONB
      const linesForDB = data.lines
        .filter(l => l.designation.trim() !== '')
        .map(line => ({
          designation: line.designation,
          description: line.description,
          quantity: line.quantity,
          unit: line.unit,
          unit_price: line.unitPrice,
          discount: line.discount,
          vat_rate: line.vatRate,
          total: Math.max(0, line.quantity * line.unitPrice * (1 - line.discount / 100)),
        }));

      // 7. Insérer le devis
      const { error: quoteError } = await supabase
        .from('quotes')
        .insert({
          organization_id: organizationId,
          client_id: clientId,
          number: data.number,
          date: data.emissionDate,
          valid_until: data.validityEnabled ? data.validityDate : null,
          client_name: data.client.name,
          client_email: data.client.email,
          client_phone: data.client.phone,
          client_address: data.client.address,
          lines: linesForDB,
          subtotal: calc.subtotal,
          total_tax: calc.totalVat,
          global_discount: 0,
          total: calc.total,
          notes: data.notes,
          payment_conditions: [
            data.paymentTerms,
            data.executionDelay ? `Délai: ${data.executionDelay}` : null,
            data.paymentMethod ? `Mode: ${data.paymentMethod}` : null,
            data.depositPercent > 0 ? `Acompte: ${data.depositPercent}%` : null,
          ].filter(Boolean).join(' | '),
          status: data.status,
        })
        .select('id')
        .single();

      if (quoteError) {
        console.error('Erreur devis:', quoteError);
        throw new Error(quoteError.message || 'Erreur lors de la sauvegarde du devis.');
      }

      // 8. Succès
      notify('Devis enregistré avec succès !', 'ok');
      window.setTimeout(() => navigate('/dashboard/quotes'), 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('Erreur complète:', err);
      notify(message, 'err');
    } finally {
      setIsSaving(false);
    }
  };

  const ensureValid = (): boolean => {
    if (Object.keys(errors).length === 0) return true;
    setShowErrors(true);
    const failing = STEPS.find(s => stepHasError(s.key));
    if (failing) setActiveStep(failing.key);
    notify('Complétez les champs obligatoires avant d\'exporter.', 'err');
    scrollTop();
    return false;
  };

  const baseName = `Devis-${data.number}`.replace(/[^\w.-]+/g, '-');

  const pageNodes = (): HTMLElement[] =>
    Array.from(exportWrapRef.current?.querySelectorAll<HTMLElement>('[data-doc-page]') ?? []);

  const runExport = async (format: ExportFormat): Promise<void> => {
    if (!ensureValid()) return;
    const ctx: ExportCtx = { data: dData, company: dCompany, theme: dTheme, calc, fmt, money };
    setExporting(format);
    try {
      if (format === 'pdf') {
        const nodes = pageNodes();
        if (nodes.length === 0) throw new Error('pages');
        await printPages(nodes, baseName);
        notify('Choisissez « Enregistrer au format PDF » dans la fenêtre d\'impression.');
      } else if (format === 'word') {
        downloadBlob(new Blob(['\uFEFF', buildWord(ctx, baseName)], { type: 'application/msword' }), `${baseName}.doc`);
        notify('Fichier Word téléchargé.');
      } else if (format === 'excel') {
        downloadBlob(buildXlsx(ctx), `${baseName}.xlsx`);
        notify('Fichier Excel téléchargé.');
      } else if (format === 'image') {
        const nodes = pageNodes();
        if (nodes.length === 0) throw new Error('pages');
        const urls: string[] = [];
        for (const node of nodes) urls.push(await renderPng(node, 2));
        if (urls.length === 1) {
          downloadDataUrl(urls[0], `${baseName}.png`);
          notify('Image téléchargée.');
        } else {
          const zip = makeZip(urls.map((u, i) => ({ name: `${baseName}-page-${i + 1}.png`, data: dataUrlToBytes(u) })), 'application/zip');
          downloadBlob(zip, `${baseName}-images.zip`);
          notify(`${urls.length} pages exportées dans une archive ZIP.`);
        }
      } else {
        downloadBlob(buildEpub(ctx), `${baseName}.epub`);
        notify('Fichier EPUB téléchargé.');
      }
    } catch {
      notify('L\'export a échoué. Réessayez ou utilisez un autre format.', 'err');
    } finally {
      setExporting(null);
    }
  };

  const summaryText = (): string =>
    `${I18N[data.language].quote} ${data.number}\n${company.name} → ${data.client.name}\n${I18N[data.language].totalNet} : ${money(calc.total)}${data.validityEnabled ? `\n${I18N[data.language].validUntil} ${fmtDate(data.validityDate)}` : ''}`;

  const sendEmail = (): void => {
    if (!ensureValid()) return;
    const subject = encodeURIComponent(`${I18N[data.language].quote} ${data.number} – ${company.name}`);
    const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-dessous notre devis.\n\n${summaryText()}\n\nCordialement,\n${company.signatory}\n${company.name}`);
    window.location.href = `mailto:${data.client.email.trim()}?subject=${subject}&body=${body}`;
  };

  const shareWhatsApp = (): void => {
    if (!ensureValid()) return;
    const digits = data.client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(summaryText())}`, '_blank', 'noopener,noreferrer');
  };

  const paymentTermsOptions = Array.from(new Set([...PAYMENT_TERMS_BASE, ...(data.paymentTerms ? [data.paymentTerms] : [])]));
  const validityOptions = Array.from(new Set([...VALIDITY_CHOICES, validityDays])).sort((a, b) => a - b);
  const liveTotals = computeTotals(data.lines, data.vatEnabled);
  const liveMoney = (n: number): string => `${makeFormatter(data.currency)(n)}\u00a0${currencySuffix(data.currency)}`;

  /* ------------------------------------------------------------------------ */
  /*  Étapes                                                                   */
  /* ------------------------------------------------------------------------ */

  const stepMeta: Record<StepKey, { title: string; description: string; icon: ReactNode }> = {
    general: { title: 'Informations générales', description: 'Numéro, dates, devise, TVA et coordonnées de votre entreprise.', icon: <Info size={20} className="text-brand-600" /> },
    client: { title: 'Informations du client', description: 'À qui adressez-vous ce devis ?', icon: <Building2 size={20} className="text-brand-600" /> },
    lines: { title: 'Prestations et produits', description: 'Listez ce que vous facturez. Les montants se calculent automatiquement.', icon: <FileText size={20} className="text-brand-600" /> },
    conditions: { title: 'Conditions et informations complémentaires', description: 'Tout est facultatif : seuls les champs remplis apparaissent sur le devis.', icon: <PenLine size={20} className="text-brand-600" /> },
    custom: { title: 'Personnalisation du modèle', description: 'Choisissez un modèle, une couleur, puis ajoutez logo, cachet et signature.', icon: <SlidersHorizontal size={20} className="text-brand-600" /> },
    preview: { title: 'Aperçu et export', description: 'Vérifiez chaque page, puis exportez dans le format de votre choix.', icon: <Eye size={20} className="text-brand-600" /> },
  };

  const renderGeneral = (): ReactNode => (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label required>Numéro du devis</Label>
          <TextField
            value={data.number}
            invalid={bad('number')}
            onChange={e => set('number', e.target.value)}
            suffix={<span className="text-[11px]">{data.number === `DEV-${new Date().getFullYear()}-0001` ? 'Auto' : 'Manuel'}</span>}
            className="bg-slate-50 font-medium"
          />
          {bad('number') && <ErrorText>{errors.number}</ErrorText>}
        </div>
        <div>
          <Label>Date d'émission</Label>
          <div className="relative">
            <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input type="date" value={data.emissionDate} onChange={e => setEmission(e.target.value)} className={`${INPUT} ${BORDER_OK} pl-9 ${DATE_CLASSES}`} />
          </div>
        </div>
        <div>
          <Label>Devise</Label>
          <SelectField value={data.currency} onChange={v => set('currency', v)} label="Devise">
            {WORLD_CURRENCIES.map(cu => <option key={cu.code} value={cu.code}>{currencyLabel(cu.code)} — {cu.name}</option>)}
          </SelectField>
        </div>
        <div>
          <Label>Langue du devis</Label>
          <SelectField value={data.language} onChange={v => set('language', v as Lang)} label="Langue">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </SelectField>
        </div>
        <div>
          <Label>Statut</Label>
          <SelectField
            value={data.status}
            onChange={v => set('status', v as QuoteStatus)}
            label="Statut"
            leading={<span className={`block h-2.5 w-2.5 rounded-full ${STATUS_META[data.status].dot}`} />}
          >
            {(Object.keys(STATUS_META) as QuoteStatus[]).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </SelectField>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Date de validité" description="Optionnelle : désactivée, elle n'apparaît pas sur le devis.">
          <Switch checked={data.validityEnabled} onChange={v => set('validityEnabled', v)} label={data.validityEnabled ? 'Date de validité activée' : 'Aucune date de validité'} />
          {data.validityEnabled && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <Label>Valable jusqu'au</Label>
                <div className="relative">
                  <Calendar size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="date" min={data.emissionDate} value={data.validityDate} onChange={e => e.target.value && set('validityDate', e.target.value)} className={`${INPUT} ${BORDER_OK} pl-9 ${DATE_CLASSES}`} />
                </div>
              </div>
              <div>
                <Label>Durée</Label>
                <SelectField value={validityDays} onChange={v => setValidityDays(Number(v))} label="Durée de validité">
                  {validityOptions.map(d => <option key={d} value={d}>{d} jours</option>)}
                </SelectField>
              </div>
            </div>
          )}
        </Panel>
        <Panel title="TVA" description="Activez la TVA pour l'appliquer aux lignes et afficher le total TTC.">
          <Switch checked={data.vatEnabled} onChange={v => set('vatEnabled', v)} label={data.vatEnabled ? 'TVA activée' : 'TVA désactivée'} hint={data.vatEnabled ? undefined : 'Le total sera affiché sans taxe.'} />
          {data.vatEnabled && (
            <div className="mt-3 max-w-[200px]">
              <Label>Taux de TVA appliqué</Label>
              <TextField type="number" min={0} max={100} step="any" value={data.vatRate} onChange={e => setVatRate(Number(e.target.value))} suffix="%" />
              <p className="mt-1 text-[11px] text-slate-400">Modifiable ligne par ligne à l'étape suivante.</p>
            </div>
          )}
        </Panel>
      </div>
      <Panel title="Votre entreprise" description="Ces informations figurent en en-tête et sont mémorisées sur cet appareil.">
        <div className="grid grid-cols-1 gap-x-3 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <div><Label>Nom de l'entreprise</Label><TextField value={company.name} onChange={e => setCompanyField({ name: e.target.value })} /></div>
          <div><Label>Slogan</Label><TextField value={company.tagline} onChange={e => setCompanyField({ tagline: e.target.value })} /></div>
          <div><Label>Ville (pour « Fait à »)</Label><TextField value={company.city} onChange={e => setCompanyField({ city: e.target.value })} /></div>
          <div className="sm:col-span-2 lg:col-span-3"><Label>Adresse</Label><TextField icon={MapPin} value={company.address} onChange={e => setCompanyField({ address: e.target.value })} /></div>
          <div><Label>Téléphone</Label><TextField icon={Phone} value={company.phone} onChange={e => setCompanyField({ phone: e.target.value })} /></div>
          <div><Label>Email</Label><TextField icon={Mail} value={company.email} onChange={e => setCompanyField({ email: e.target.value })} /></div>
          <div><Label>Site web</Label><TextField icon={Globe} value={company.website} onChange={e => setCompanyField({ website: e.target.value })} /></div>
          <div><Label>Signataire</Label><TextField value={company.signatory} onChange={e => setCompanyField({ signatory: e.target.value })} /></div>
          <div><Label>Fonction du signataire</Label><TextField value={company.signatoryRole} onChange={e => setCompanyField({ signatoryRole: e.target.value })} /></div>
        </div>
      </Panel>
    </div>
  );

  const renderClient = (): ReactNode => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-2">
        <div>
          <Label required>Raison sociale / Nom complet</Label>
          <TextField id="client-name" value={data.client.name} invalid={bad('name')} onChange={e => setClient({ name: e.target.value })} />
          {bad('name') && <ErrorText>{errors.name}</ErrorText>}
        </div>
        <div>
          <Label required>Téléphone</Label>
          <TextField icon={Phone} type="tel" value={data.client.phone} invalid={bad('phone')} onChange={e => setClient({ phone: e.target.value })} />
          {bad('phone') && <ErrorText>{errors.phone}</ErrorText>}
        </div>
        <div>
          <Label required>Email</Label>
          <TextField icon={Mail} type="email" value={data.client.email} invalid={bad('email')} onChange={e => setClient({ email: e.target.value })} />
          {bad('email') && <ErrorText>{errors.email}</ErrorText>}
        </div>
        <div>
          <Label required>Pays</Label>
          <SelectField value={data.client.country} onChange={v => setClient({ country: v })} invalid={bad('country')} label="Pays">
            {!COUNTRIES.includes(data.client.country) && <option value={data.client.country}>{data.client.country}</option>}
            {COUNTRIES.map(co => <option key={co} value={co}>{co}</option>)}
          </SelectField>
        </div>
        <div className="sm:col-span-2">
          <Label required>Adresse</Label>
          <TextField icon={MapPin} value={data.client.address} invalid={bad('address')} onChange={e => setClient({ address: e.target.value })} />
          {bad('address') && <ErrorText>{errors.address}</ErrorText>}
        </div>
        <div>
          <Label>N° d'identification fiscale <span className="font-normal text-slate-400">(optionnel)</span></Label>
          <TextField icon={FileBadge} value={data.client.taxId} onChange={e => setClient({ taxId: e.target.value })} />
        </div>
        <div>
          <Label>N° d'enregistrement <span className="font-normal text-slate-400">(optionnel)</span></Label>
          <TextField icon={Building2} value={data.client.registrationNumber} onChange={e => setClient({ registrationNumber: e.target.value })} />
        </div>
      </div>
      <button type="button" onClick={() => setData(prev => ({ ...prev, client: { ...EMPTY_CLIENT } }))} className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition hover:text-red-600">
        <Trash2 size={13} /> Vider les informations du client
      </button>
    </div>
  );

  const renderLines = (): ReactNode => (
    <div className="space-y-4">
      {bad('lines') && <p role="alert" className="text-[12px] text-red-600">{errors.lines}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-[11px]">
          <colgroup>
            <col style={{ width: 28 }} /><col style={{ width: '16%' }} /><col />
            <col style={{ width: 56 }} /><col style={{ width: 70 }} /><col style={{ width: 92 }} />
            <col style={{ width: 56 }} />{data.vatEnabled && <col style={{ width: 54 }} />}<col style={{ width: 100 }} /><col style={{ width: 40 }} />
          </colgroup>
          <thead>
            <tr className="bg-slate-50 text-left text-[11px] font-semibold text-slate-600">
              <th className="px-2 py-2.5 text-center">#</th>
              <th className="px-1.5 py-2.5">Désignation</th>
              <th className="px-1.5 py-2.5">Description</th>
              <th className="px-1 py-2.5 text-center">Qté</th>
              <th className="px-1 py-2.5 text-center">Unité</th>
              <th className="px-1 py-2.5 text-center">Prix unitaire</th>
              <th className="px-1 py-2.5 text-center">Remise</th>
              {data.vatEnabled && <th className="px-1 py-2.5 text-center">TVA</th>}
              <th className="px-1.5 py-2.5 text-right">Montant {data.vatEnabled ? 'HT' : ''}</th>
              <th className="px-1 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {data.lines.map((l, i) => (
              <tr key={l.id} className="border-t border-slate-100 align-middle">
                <td className="px-2 py-2 text-center text-slate-600">{i + 1}</td>
                <td className="px-1 py-2">
                  <input
                    value={l.designation}
                    onChange={e => updateLine(l.id, { designation: e.target.value })}
                    aria-label="Désignation"
                    className={`${CELL_INPUT} ${showErrors && errors.lines && !l.designation.trim() ? 'border-red-400' : ''}`}
                  />
                </td>
                <td className="px-1 py-2">
                  <textarea value={l.description} rows={2} onChange={e => updateLine(l.id, { description: e.target.value })} aria-label="Description" className={`${CELL_INPUT} h-11 resize-y py-1 leading-tight`} />
                </td>
                <td className="px-1 py-2">
                  <input type="number" min="0" step="any" value={l.quantity} onChange={e => updateLine(l.id, { quantity: Number(e.target.value) || 0 })} aria-label="Quantité" className={`${CELL_INPUT} text-center`} />
                </td>
                <td className="px-1 py-2">
                  <select value={l.unit} onChange={e => updateLine(l.id, { unit: e.target.value })} aria-label="Unité" className={`${CELL_INPUT} px-0.5 text-center`}>
                    {(UNITS.includes(l.unit) ? UNITS : [...UNITS, l.unit]).map(u => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td className="px-1 py-2">
                  <input type="number" min="0" step="any" value={l.unitPrice} onChange={e => updateLine(l.id, { unitPrice: Number(e.target.value) || 0 })} aria-label="Prix unitaire" className={`${CELL_INPUT} text-right`} />
                </td>
                <td className="px-1 py-2">
                  <div className="relative">
                    <input type="number" min="0" max="100" value={l.discount} onChange={e => updateLine(l.id, { discount: Math.min(100, Number(e.target.value) || 0) })} aria-label="Remise en pourcentage" className={`${CELL_INPUT} pr-4 text-right`} />
                    <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                  </div>
                </td>
                {data.vatEnabled && (
                  <td className="px-1 py-2">
                    <div className="relative">
                      <input type="number" min="0" max="100" value={l.vatRate} onChange={e => updateLine(l.id, { vatRate: Math.min(100, Number(e.target.value) || 0) })} aria-label="TVA en pourcentage" className={`${CELL_INPUT} pr-4 text-right`} />
                      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">%</span>
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-1.5 py-2 text-right font-medium text-slate-800">{makeFormatter(data.currency)(liveTotals.lineTotals[i])}</td>
                <td className="px-1 py-2 text-center">
                  <button
                    type="button"
                    disabled={data.lines.length === 1}
                    onClick={() => set('lines', data.lines.filter(x => x.id !== l.id))}
                    aria-label="Supprimer la ligne"
                    className="text-red-500 transition hover:text-red-700 disabled:opacity-30"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11.5px] text-slate-400">Les descriptions longues sont automatiquement réparties sur plusieurs pages du devis.</p>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <button
          type="button"
          onClick={() => set('lines', [...data.lines, newLine({ vatRate: data.vatRate })])}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700"
        >
          <Plus size={15} /> Ajouter une ligne
        </button>
        <dl className="w-full max-w-[300px] space-y-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-[12.5px]">
          {data.vatEnabled && (
            <>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">Sous-total HT</dt><dd className="font-medium">{liveMoney(liveTotals.subtotal)}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-slate-500">TVA</dt><dd className="font-medium">{liveMoney(liveTotals.totalVat)}</dd></div>
            </>
          )}
          <div className="flex justify-between gap-3 border-t border-slate-200 pt-1.5 text-[14px] font-bold text-slate-900">
            <dt>{data.vatEnabled ? 'Total TTC' : 'Total'}</dt><dd>{liveMoney(liveTotals.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );

  const renderConditions = (): ReactNode => (
    <div>
      <div role="tablist" className="mb-4 flex flex-wrap gap-1.5 border-b border-slate-200">
        {([['commercial', 'Conditions commerciales'], ['notes', 'Notes et remarques'], ['files', 'Pièces jointes'], ['general', 'Conditions générales']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={condTab === key}
            onClick={() => setCondTab(key)}
            className={`-mb-px rounded-t-lg border px-3.5 py-2 text-[12.5px] font-medium transition ${
              condTab === key ? 'border-slate-200 border-b-white bg-white text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {condTab === 'commercial' && (
        <div className="grid grid-cols-1 gap-x-3 gap-y-3.5 sm:grid-cols-3">
          <div>
            <Label>Délai d'exécution</Label>
            <SelectField value={data.executionDelay} onChange={v => set('executionDelay', v)} label="Délai d'exécution">
              <option value="">— Non précisé —</option>
              {Array.from(new Set([...DELAYS, ...(data.executionDelay ? [data.executionDelay] : [])])).map(d => <option key={d}>{d}</option>)}
            </SelectField>
          </div>
          <div>
            <Label>Conditions de paiement</Label>
            <SelectField value={data.paymentTerms} onChange={setPaymentTerms} label="Conditions de paiement">
              <option value="">— Non précisé —</option>
              {paymentTermsOptions.map(p => <option key={p}>{p}</option>)}
            </SelectField>
          </div>
          <div>
            <Label>Mode de paiement</Label>
            <SelectField value={data.paymentMethod} onChange={v => set('paymentMethod', v)} label="Mode de paiement">
              <option value="">— Non précisé —</option>
              {PAYMENT_METHODS.map(p => <option key={p}>{p}</option>)}
            </SelectField>
          </div>
          <div>
            <Label>Pourcentage d'acompte</Label>
            <TextField type="number" min={0} max={100} value={data.depositPercent || ''} placeholder="0" onChange={e => setDeposit(Number(e.target.value))} suffix="%" />
          </div>
          <div>
            <Label>Modalités de livraison</Label>
            <SelectField value={data.deliveryTerms} onChange={v => set('deliveryTerms', v)} label="Modalités de livraison">
              <option value="">— Non précisé —</option>
              {DELIVERY_TERMS.map(d => <option key={d}>{d}</option>)}
            </SelectField>
          </div>
          <div className="sm:col-span-3">
            <Label>Conditions particulières</Label>
            <textarea
              value={data.specialConditions}
              onChange={e => set('specialConditions', e.target.value)}
              rows={3}
              placeholder="Ex. : Merci de nous confirmer la réception de ce devis par retour d'email."
              className={`${INPUT} ${BORDER_OK} h-auto resize-y py-2.5`}
            />
          </div>
        </div>
      )}
      {condTab === 'notes' && (
        <div>
          <Label>Notes et remarques (affichées sur le devis)</Label>
          <textarea value={data.notes} onChange={e => set('notes', e.target.value)} rows={6} placeholder="Précisions destinées au client…" className={`${INPUT} ${BORDER_OK} h-auto resize-y py-2.5`} />
        </div>
      )}
      {condTab === 'files' && (
        <div>
          <button type="button" onClick={() => attachInput.current?.click()} className="flex items-center gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 px-4 py-3 text-[13px] font-medium text-brand-700 transition hover:bg-brand-50">
            <Paperclip size={16} /> Ajouter des pièces jointes
          </button>
          <input ref={attachInput} type="file" multiple className="hidden" onChange={e => { addAttachments(e.target.files); e.target.value = ''; }} />
          <p className="mt-2 text-[11.5px] text-slate-400">Les noms des fichiers sont listés sur le devis ; joignez les fichiers eux-mêmes à votre e-mail.</p>
          {data.attachments.length === 0 ? (
            <p className="mt-3 text-[12px] text-slate-400">Aucune pièce jointe.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {data.attachments.map(a => (
                <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2 text-[12.5px]">
                  <span className="flex min-w-0 items-center gap-2"><Paperclip size={14} className="shrink-0 text-slate-400" /><span className="truncate">{a.name}</span></span>
                  <span className="flex shrink-0 items-center gap-3 text-slate-400">
                    {formatSize(a.size)}
                    <button type="button" aria-label={`Retirer ${a.name}`} onClick={() => set('attachments', data.attachments.filter(x => x.id !== a.id))} className="text-red-500 hover:text-red-700"><X size={15} /></button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {condTab === 'general' && (
        <div>
          <Label>Conditions générales de vente (affichées en bas du devis)</Label>
          <textarea value={data.generalConditions} onChange={e => set('generalConditions', e.target.value)} rows={7} placeholder="Pénalités de retard, garanties, propriété intellectuelle…" className={`${INPUT} ${BORDER_OK} h-auto resize-y py-2.5`} />
          <p className="mt-1 text-[11.5px] text-slate-400">Un long texte est automatiquement réparti sur plusieurs pages.</p>
        </div>
      )}
    </div>
  );

  const renderCustom = (): ReactNode => (
    <div>
      <div role="tablist" className="mb-5 grid max-w-xl grid-cols-3 overflow-hidden rounded-lg border border-slate-200 text-[12.5px] font-semibold">
        {([['models', 'Modèles'], ['colors', 'Couleurs'], ['branding', 'Logo, cachet, signature']] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={customTab === key}
            onClick={() => setCustomTab(key)}
            className={`border-b-2 px-2 py-2.5 transition ${customTab === key ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-transparent text-slate-600 hover:bg-slate-50'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {customTab === 'models' && (
        <div className="grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-4 lg:grid-cols-6">
          {TEMPLATES.map((tpl, i) => {
            const n = i + 1;
            const selected = theme.template === n;
            return (
              <button key={n} type="button" aria-pressed={selected} aria-label={`Modèle ${n}`} onClick={() => setTheme(p => ({ ...p, template: n }))} className="group text-center">
                <span className={`relative block aspect-[3/4] overflow-hidden rounded-md border bg-white shadow-sm transition ${selected ? 'border-2 border-brand-600 ring-2 ring-brand-200' : 'border-slate-200 group-hover:border-brand-300 group-hover:shadow-md'}`}>
                  <TemplateThumb cfg={tpl} color={theme.color} />
                  {selected && <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white"><Check size={10} strokeWidth={3.5} /></span>}
                </span>
                <span className={`mt-1 block text-[10.5px] ${selected ? 'font-semibold text-brand-700' : 'text-slate-600'}`}>Modèle {n}</span>
              </button>
            );
          })}
        </div>
      )}
      {customTab === 'colors' && (
        <div className="space-y-5">
          <div>
            <h3 className="mb-2.5 text-[13px] font-semibold text-slate-800">Toutes les couleurs</h3>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(26px, 1fr))' }}>
              {PALETTE.map(col => (
                <button
                  key={col}
                  type="button"
                  aria-label={`Couleur ${col}`}
                  aria-pressed={theme.color.toUpperCase() === col}
                  title={col}
                  onClick={() => setTheme(p => ({ ...p, color: col }))}
                  className={`aspect-square w-full rounded-md transition hover:scale-110 ${theme.color.toUpperCase() === col ? 'ring-2 ring-slate-900 ring-offset-2' : 'ring-1 ring-black/5'}`}
                  style={{ background: col }}
                />
              ))}
            </div>
          </div>
          <Panel title="Couleur personnalisée" description="Choisissez n'importe quelle teinte avec le sélecteur ou saisissez un code hexadécimal.">
            <div className="flex flex-wrap items-end gap-4">
              <label className="block">
                <Label>Sélecteur</Label>
                <input type="color" value={HEX_RE.test(theme.color) ? theme.color : '#1D4ED8'} onChange={e => setTheme(p => ({ ...p, color: e.target.value.toUpperCase() }))} className="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1" />
              </label>
              <div className="w-40">
                <Label>Code hexadécimal</Label>
                <TextField value={hexInput} maxLength={7} invalid={!HEX_RE.test(hexInput)} onChange={e => applyHex(e.target.value.trim())} placeholder="#1D4ED8" className="font-mono uppercase" />
              </div>
              <div className="flex items-center gap-2 pb-2 text-[12px] text-slate-500">
                <span className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: theme.color }} /> Couleur actuelle : <b className="font-mono text-slate-800">{theme.color}</b>
              </div>
            </div>
          </Panel>
        </div>
      )}
      {customTab === 'branding' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Panel title="Logo" action={<OptionalChip />}>
            <ImageDropzone value={theme.logo} onChange={logo => setTheme(p => ({ ...p, logo }))} cta="Importer votre logo" hint="PNG, JPG, WebP (max 2 Mo)" alt="Logo importé" />
          </Panel>
          <Panel title="Cachet" action={<OptionalChip />}>
            <ImageDropzone value={theme.stamp} onChange={stamp => setTheme(p => ({ ...p, stamp }))} cta="Importer votre cachet" hint="PNG transparent recommandé (max 2 Mo)" alt="Cachet importé" />
          </Panel>
          <Panel title="Signature" action={<OptionalChip />}>
            <ImageDropzone value={theme.signature} onChange={signature => setTheme(p => ({ ...p, signature }))} cta="Importer votre signature" hint="PNG transparent recommandé (max 2 Mo)" alt="Signature importée" />
            <button type="button" onClick={() => setSignatureOpen(true)} className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 text-[12px] font-medium text-brand-700 transition hover:bg-brand-50">
              <PenLine size={13} /> Dessiner ma signature
            </button>
          </Panel>
        </div>
      )}
    </div>
  );

  const renderPreview = (): ReactNode => (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <div className="space-y-4 lg:sticky lg:top-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-[12px] text-slate-500">Devis {data.number}</p>
          <p className="mt-0.5 truncate text-[14px] font-semibold text-slate-900">{data.client.name || 'Client'}</p>
          <p className="mt-2 text-[20px] font-bold text-slate-900">{liveMoney(liveTotals.total)}</p>
          <p className="mt-0.5 text-[11.5px] text-slate-500">{data.vatEnabled ? 'TVA incluse' : 'Sans TVA'} · {pages.length} page{pages.length > 1 ? 's' : ''} A4</p>
        </div>

        <button
          type="button"
          onClick={handleSaveToSupabase}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3.5 text-[14px] font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save size={18} />
              Enregistrer le devis
            </>
          )}
        </button>

        <div>
          <h3 className="mb-2 flex items-center gap-2 text-[13px] font-semibold text-slate-800"><Download size={15} className="text-brand-700" /> Exporter le devis</h3>
          <div className="grid grid-cols-2 gap-2">
            {EXPORT_BUTTONS.map(({ format, label, icon: Icon, className }) => (
              <button
                key={format}
                type="button"
                disabled={exporting !== null}
                onClick={() => void runExport(format)}
                className={`flex h-10 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold text-white shadow-sm transition disabled:opacity-60 ${className}`}
              >
                {exporting === format ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
                {label}
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <button type="button" onClick={sendEmail} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-brand-300 bg-white text-[12.5px] font-semibold text-brand-700 transition hover:bg-brand-50">
              <Mail size={14} /> Envoyer par email
            </button>
            <button type="button" onClick={shareWhatsApp} className="flex h-10 items-center justify-center gap-1.5 rounded-lg bg-green-600 text-[12.5px] font-semibold text-white transition hover:bg-green-700">
              <MessageCircle size={14} /> Partager sur WhatsApp
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-slate-400">PDF : choisissez « Enregistrer au format PDF ». Image : un fichier par page, regroupés en ZIP si le devis compte plusieurs pages.</p>
        </div>
      </div>
      <div ref={exportWrapRef} className="rounded-xl bg-slate-100 p-3 sm:p-4">
        <ScaledPages pages={renderPages()} />
      </div>
    </div>
  );

  const stepBody: Record<StepKey, () => ReactNode> = {
    general: renderGeneral,
    client: renderClient,
    lines: renderLines,
    conditions: renderConditions,
    custom: renderCustom,
    preview: renderPreview,
  };

  const meta = stepMeta[activeStep];
  const showSidePreview = activeStep !== 'preview';
  const nextLabel = activeStep === 'custom' ? 'Aperçu et export' : 'Suivant';

  /* ------------------------------------------------------------------------ */
  /*  Rendu                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-full bg-gradient-to-b from-slate-50 via-brand-50/30 to-slate-50 pb-6">
      <div ref={topRef} className="mx-auto max-w-[1500px] scroll-mt-4 px-4 pt-6 sm:px-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Nouveau devis</h1>
            <p className="mt-1 text-[13px] text-slate-500">Six étapes pour un devis professionnel, prêt à envoyer.</p>
          </div>
          <button
            type="button"
            onClick={handleSaveToSupabase}
            disabled={isSaving}
            className="hidden items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-700 disabled:opacity-60 sm:flex"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={16} />
                Enregistrer
              </>
            )}
          </button>
        </header>

        <nav aria-label="Étapes" className="mb-5 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <ol className="flex items-center">
            {STEPS.map((s, i) => {
              const active = i === stepIdx;
              const done = i < stepIdx;
              return (
                <li key={s.key} className="flex min-w-0 flex-1 items-center last:flex-none">
                  <button type="button" onClick={() => goTo(s.key)} aria-current={active ? 'step' : undefined} className="flex items-center gap-2 rounded-full py-1 pr-2">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold transition ${active ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' : done ? 'bg-brand-600/10 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
                      {done ? <Check size={15} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={`hidden whitespace-nowrap text-[12.5px] lg:block ${active ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                      {s.label}
                      {s.optional && <span className="ml-1 text-[10.5px] text-slate-400">(optionnel)</span>}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && <span className={`mx-1 h-0.5 min-w-3 flex-1 rounded ${done ? 'bg-brand-600/40' : 'bg-slate-200'}`} />}
                </li>
              );
            })}
          </ol>
          <p className="mt-2 text-[12px] text-slate-500 lg:hidden">Étape {stepIdx + 1} sur {STEPS.length} — {STEPS[stepIdx].label}</p>
        </nav>

        <div className={`grid gap-5 ${showSidePreview ? 'xl:grid-cols-[minmax(0,1fr)_440px] xl:items-start' : ''}`}>
          <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(30,64,175,0.18)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">{meta.icon}</span>
                <div>
                  <h2 className="text-[17px] font-semibold text-slate-900">{meta.title}</h2>
                  <p className="mt-0.5 text-[12.5px] text-slate-500">{meta.description}</p>
                </div>
              </div>
              {STEPS[stepIdx].optional && <OptionalChip />}
            </div>
            {stepBody[activeStep]()}
            <div className="mt-7 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={stepIdx === 0}
                onClick={() => goTo(STEPS[stepIdx - 1].key)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2.5 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:invisible"
              >
                <ArrowLeft size={15} /> Précédent
              </button>
              <div className="flex items-center gap-2">
                {activeStep === 'conditions' && (
                  <button type="button" onClick={() => goTo('custom')} className="px-3 py-2.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800">
                    Passer cette étape
                  </button>
                )}
                {stepIdx < STEPS.length - 1 && (
                  <button type="button" onClick={() => goTo(STEPS[stepIdx + 1].key)} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700">
                    {nextLabel} <ArrowRight size={15} />
                  </button>
                )}
              </div>
            </div>
          </section>
          {showSidePreview && (
            <aside className={`min-w-0 ${activeStep === 'custom' ? '' : 'hidden xl:block'} xl:sticky xl:top-4`}>
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(30,64,175,0.18)]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-[13.5px] font-semibold text-slate-900"><Eye size={16} className="text-brand-700" /> Aperçu en direct</h2>
                  <span className="text-[11px] text-slate-400">{pages.length > 1 ? `Page 1 sur ${pages.length}` : 'Page 1'}</span>
                </div>
                <div className="rounded-lg bg-slate-100 p-2.5">
                  <ScaledPages pages={renderPages(1)} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Barre du bas */}
      <div className="relative mt-10">
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 xl:pr-[360px]">
          <ul className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3.5 text-[11.5px] font-medium text-white">
            {FEATURES.map(f => (
              <li key={f} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-brand-700"><Check size={12} strokeWidth={3.5} /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 right-0 hidden h-[84px] w-[400px] items-center justify-end gap-3 bg-amber-400 pr-9 text-slate-900 xl:flex"
          style={{ clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0 100%)' }}
        >
          <Coffee size={34} strokeWidth={1.8} />
          <div className="text-left">
            <div className="text-[19px] font-extrabold leading-none tracking-tight">DEVIS CAFE</div>
            <div className="mt-2 text-[11px] font-semibold">Simple <span className="mx-1.5">•</span> Rapide <span className="mx-1.5">•</span> Professionnel</div>
          </div>
        </div>
      </div>

      {/* Zone de mesure hors écran (sert à la pagination) */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 text-slate-800"
        style={{ left: -20000, width: geo.contentW, visibility: 'hidden', fontSize: 12, fontFamily: fontFor(cfg) }}
      >
        <div data-m="head">{parts.head}</div>
        <DocTable parts={parts} rows={measureRows} measure />
        {parts.blocks.map(b => (
          b.kind === 'static' ? (
            <div key={b.key} data-b={b.key}>{b.node}</div>
          ) : (
            <div key={b.key}>
              <div data-b={b.key}>{b.render(joinTokens(b.tokens, 0, b.tokens.length), false)}</div>
              <div data-bc={b.key}>{b.render(' ', true)}</div>
            </div>
          )
        ))}
        <div ref={probeRef} />
      </div>

      {signatureOpen && (
        <SignatureModal
          onClose={() => setSignatureOpen(false)}
          onSave={signature => { setTheme(p => ({ ...p, signature })); setSignatureOpen(false); }}
        />
      )}

      {toast && (
        <div role="status" className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl px-5 py-3 text-[13px] font-medium text-white shadow-2xl ${toast.tone === 'ok' ? 'bg-slate-900' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}