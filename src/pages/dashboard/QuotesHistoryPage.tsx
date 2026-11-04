import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, Download, Trash2, Calendar, ChevronLeft, ChevronRight,
  FileText, CheckCircle2, XCircle, Clock, Mail, AlertCircle, Inbox,
  RefreshCw, Info, ArrowUp, ArrowDown, ArrowUpDown, X, Send,
  BellRing, Hourglass, PenLine, ChevronDown, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

/* ========================================================================== */
/*  Types & configuration                                                      */
/* ========================================================================== */

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
type SortKey = 'date' | 'due' | 'client' | 'amount';
type Period = 'all' | '30d' | 'month' | 'year';

interface Quote {
  id: string;
  number: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  date: string;
  valid_until: string | null;
  total: number;
  subtotal?: number;
  total_tax?: number;
  currency?: string;
  status: QuoteStatus;
  payment_conditions?: string;
  notes?: string;
  lines?: any[];
  created_at: string;
  updated_at?: string;
}

interface Toast {
  id: string;
  msg: string;
  tone: 'ok' | 'err' | 'info';
}

const STATUS: Record<QuoteStatus, {
  label: string; pill: string; dot: string; bar: string; icon: typeof FileText;
}> = {
  draft:    { label: 'Brouillon', pill: 'bg-slate-100 text-slate-700 ring-slate-200',       dot: 'bg-slate-400',   bar: 'bg-slate-300',   icon: PenLine },
  sent:     { label: 'Envoyé',    pill: 'bg-sky-50 text-sky-700 ring-sky-200',              dot: 'bg-sky-500',     bar: 'bg-sky-400',     icon: Send },
  accepted: { label: 'Accepté',   pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200',  dot: 'bg-emerald-500', bar: 'bg-emerald-500', icon: CheckCircle2 },
  rejected: { label: 'Refusé',    pill: 'bg-rose-50 text-rose-700 ring-rose-200',           dot: 'bg-rose-500',    bar: 'bg-rose-400',    icon: XCircle },
  expired:  { label: 'Expiré',    pill: 'bg-amber-50 text-amber-700 ring-amber-200',        dot: 'bg-amber-500',   bar: 'bg-amber-400',   icon: Clock },
};

const STATUS_ORDER: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired'];
const ITEMS_PER_PAGE = 10;
const FOLLOW_UP_AFTER_DAYS = 5;
const STALE_DRAFT_DAYS = 7;
const EXPIRING_SOON_DAYS = 7;

/* ========================================================================== */
/*  Utilitaires purs                                                           */
/* ========================================================================== */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Nombre de jours entiers entre aujourd'hui et la date (positif = futur). */
const daysFromToday = (iso: string | null): number | null => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return Math.round((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / 86_400_000);
};

/** Statut réel : un brouillon/envoyé dont la validité est dépassée est considéré expiré. */
const effectiveStatus = (q: Quote): QuoteStatus => {
  if (q.status === 'draft' || q.status === 'sent') {
    const d = daysFromToday(q.valid_until);
    if (d !== null && d < 0) return 'expired';
  }
  return q.status;
};

const formatCurrency = (amount: number, currency?: string): string => {
  const code = currency && currency.trim() ? currency : 'XOF';
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency', currency: code, minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch {
    return `${(amount || 0).toLocaleString('fr-FR')} FCFA`;
  }
};

const formatShortDate = (iso: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const plural = (n: number, one: string, many: string) => (Math.abs(n) > 1 ? many : one);

const initials = (name: string) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || '?';

/** Échéance lisible + ton visuel. */
const describeDue = (q: Quote, status: QuoteStatus): { text: string; tone: string } => {
  const d = daysFromToday(q.valid_until);
  if (d === null) return { text: 'Sans échéance', tone: 'text-slate-400' };
  if (status === 'accepted' || status === 'rejected') {
    return { text: formatShortDate(q.valid_until), tone: 'text-slate-400' };
  }
  if (d < 0) return { text: `Expiré depuis ${-d} ${plural(-d, 'jour', 'jours')}`, tone: 'text-rose-600' };
  if (d === 0) return { text: "Expire aujourd'hui", tone: 'text-rose-600' };
  if (d === 1) return { text: 'Expire demain', tone: 'text-amber-600' };
  if (d <= EXPIRING_SOON_DAYS) return { text: `Dans ${d} jours`, tone: 'text-amber-600' };
  return { text: `Dans ${d} jours`, tone: 'text-slate-500' };
};

const periodMatches = (iso: string, period: Period): boolean => {
  if (period === 'all') return true;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return true;
  const now = new Date();
  if (period === '30d') return now.getTime() - d.getTime() <= 30 * 86_400_000;
  if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  return d.getFullYear() === now.getFullYear();
};

const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

/* ========================================================================== */
/*  Petits composants                                                          */
/* ========================================================================== */

function Kpi({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: string }) {
  return (
    <div className="px-6 py-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tabular-nums ${accent || 'text-slate-900'}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function SortHeader({
  label, k, sortBy, sortOrder, onSort, align = 'left', className = '',
}: {
  label: string; k: SortKey; sortBy: SortKey; sortOrder: 'asc' | 'desc';
  onSort: (k: SortKey) => void; align?: 'left' | 'right'; className?: string;
}) {
  const active = sortBy === k;
  const Icon = !active ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th className={`px-4 py-3.5 ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}>
      <button
        onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
          active ? 'text-slate-900' : 'text-slate-400 hover:text-slate-700'
        }`}
      >
        {label}
        <Icon size={12} />
      </button>
    </th>
  );
}

/* ========================================================================== */
/*  Page                                                                       */
/* ========================================================================== */

export function QuotesHistoryPage() {
  const navigate = useNavigate();

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<QuoteStatus | 'all'>('all');
  const [period, setPeriod] = useState<Period>('all');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  /* ------------------------------ Toasts ---------------------------------- */

  const showToast = useCallback((msg: string, tone: Toast['tone'] = 'ok') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, msg, tone }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  /* ------------------------------ Données --------------------------------- */

  const fetchQuotes = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        showToast('Session expirée. Veuillez vous reconnecter.', 'err');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      const { data: member } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!member) { setQuotes([]); return; }

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('organization_id', member.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      console.error('Erreur chargement devis:', err);
      showToast('Impossible de charger les devis', 'err');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, showToast]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, tab, period, sortBy, sortOrder]);

  /* --------------------------- Filtrage & tri ----------------------------- */

  const counts = useMemo(() => {
    const c: Record<QuoteStatus | 'all', number> = { all: quotes.length, draft: 0, sent: 0, accepted: 0, rejected: 0, expired: 0 };
    quotes.forEach(q => { c[effectiveStatus(q)]++; });
    return c;
  }, [quotes]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result = quotes.filter(q => {
      if (tab !== 'all' && effectiveStatus(q) !== tab) return false;
      if (!periodMatches(q.date, period)) return false;
      if (!term) return true;
      return (
        (q.number || '').toLowerCase().includes(term) ||
        (q.client_name || '').toLowerCase().includes(term) ||
        (q.client_email || '').toLowerCase().includes(term) ||
        (q.client_phone || '').includes(term)
      );
    });

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortBy) {
        case 'date':   cmp = new Date(a.date).getTime() - new Date(b.date).getTime(); break;
        case 'due': {
          const da = a.valid_until ? new Date(a.valid_until).getTime() : Infinity;
          const db = b.valid_until ? new Date(b.valid_until).getTime() : Infinity;
          cmp = da === db ? 0 : da < db ? -1 : 1;
          break;
        }
        case 'amount': cmp = (a.total || 0) - (b.total || 0); break;
        case 'client': cmp = (a.client_name || '').localeCompare(b.client_name || '', 'fr'); break;
      }
      return sortOrder === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [quotes, searchTerm, tab, period, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const rows = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSort = (k: SortKey) => {
    if (sortBy === k) setSortOrder(o => (o === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(k); setSortOrder(k === 'client' ? 'asc' : 'desc'); }
  };

  /* ----------------------------- Statistiques ----------------------------- */

  const stats = useMemo(() => {
    let revenue = 0, pending = 0, decided = 0;
    quotes.forEach(q => {
      const s = effectiveStatus(q);
      if (s === 'accepted') { revenue += q.total || 0; decided++; }
      if (s === 'rejected') decided++;
      if (s === 'sent') pending += q.total || 0;
    });
    const winRate = decided > 0 ? Math.round((counts.accepted / decided) * 100) : null;
    const avg = counts.accepted > 0 ? revenue / counts.accepted : 0;
    return { revenue, pending, winRate, avg };
  }, [quotes, counts.accepted]);

  /* ------------------------------ À traiter ------------------------------- */

  type Attention = { quote: Quote; kind: 'expiring' | 'followup' | 'draft'; label: string; weight: number };

  const attention = useMemo<Attention[]>(() => {
    const items: Attention[] = [];
    quotes.forEach(q => {
      const s = effectiveStatus(q);
      const due = daysFromToday(q.valid_until);
      const age = daysFromToday(q.updated_at || q.created_at || q.date);
      const ageDays = age === null ? 0 : -age;

      if ((s === 'sent' || s === 'draft') && due !== null && due >= 0 && due <= EXPIRING_SOON_DAYS) {
        items.push({
          quote: q, kind: 'expiring', weight: due,
          label: due === 0 ? "Expire aujourd'hui" : due === 1 ? 'Expire demain' : `Expire dans ${due} jours`,
        });
      } else if (s === 'sent' && ageDays >= FOLLOW_UP_AFTER_DAYS) {
        items.push({ quote: q, kind: 'followup', weight: 10 + (30 - Math.min(ageDays, 30)), label: `Sans réponse depuis ${ageDays} jours` });
      } else if (s === 'draft' && ageDays >= STALE_DRAFT_DAYS) {
        items.push({ quote: q, kind: 'draft', weight: 50, label: `Brouillon inachevé depuis ${ageDays} jours` });
      }
    });
    return items.sort((a, b) => a.weight - b.weight);
  }, [quotes]);

  /* -------------------------------- Actions ------------------------------- */

  const updateStatus = async (ids: string[], status: QuoteStatus) => {
    if (ids.length === 0) return;
    const previous = quotes;
    setQuotes(prev => prev.map(q => (ids.includes(q.id) ? { ...q, status, updated_at: new Date().toISOString() } : q)));
    try {
      const { error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;
      showToast(
        ids.length === 1 ? `Statut mis à jour : ${STATUS[status].label}` : `${ids.length} devis passés en « ${STATUS[status].label} »`,
        'ok',
      );
    } catch (err) {
      console.error('Erreur mise à jour statut:', err);
      setQuotes(previous);
      showToast('Impossible de modifier le statut', 'err');
    }
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!confirm(`Supprimer définitivement ${ids.length} ${plural(ids.length, 'devis', 'devis')} ? Cette action est irréversible.`)) return;

    setBusy(true);
    try {
      const { error } = await supabase.from('quotes').delete().in('id', ids);
      if (error) throw error;
      setQuotes(prev => prev.filter(q => !ids.includes(q.id)));
      setSelected(new Set());
      showToast(`${ids.length} ${plural(ids.length, 'devis supprimé', 'devis supprimés')}`, 'ok');
    } catch (err) {
      console.error('Erreur suppression:', err);
      showToast('Erreur lors de la suppression', 'err');
    } finally {
      setBusy(false);
    }
  };

  const exportCSV = (list: Quote[], filename: string) => {
    if (list.length === 0) { showToast('Rien à exporter', 'err'); return; }
    const header = ['Numéro', 'Client', 'Email', 'Téléphone', 'Date', 'Valable jusqu\'au', 'Statut', 'Montant', 'Devise'];
    const lines = list.map(q => [
      q.number, q.client_name, q.client_email, q.client_phone || '',
      q.date, q.valid_until || '', STATUS[effectiveStatus(q)].label, q.total || 0, q.currency || 'XOF',
    ].map(csvCell).join(';'));
    const blob = new Blob(['\uFEFF' + [header.map(csvCell).join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${list.length} ${plural(list.length, 'devis exporté', 'devis exportés')}`, 'ok');
  };

  const followUp = (q: Quote) => {
    const amount = formatCurrency(q.total, q.currency);
    const phone = (q.client_phone || '').replace(/\D/g, '');
    if (phone) {
      const text = encodeURIComponent(
        `Bonjour ${q.client_name},\n\nJe me permets de revenir vers vous concernant notre devis n°${q.number} d'un montant de ${amount}.\n` +
        `Avez-vous pu en prendre connaissance ? Je reste à votre disposition pour toute question.`,
      );
      window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (q.client_email) {
      const subject = encodeURIComponent(`Relance – Devis ${q.number}`);
      const body = encodeURIComponent(
        `Bonjour ${q.client_name},\n\nJe me permets de revenir vers vous concernant notre devis n°${q.number} d'un montant de ${amount}, ` +
        `valable jusqu'au ${formatShortDate(q.valid_until)}.\n\nRestant à votre disposition,\nCordialement`,
      );
      window.location.href = `mailto:${q.client_email}?subject=${subject}&body=${body}`;
      showToast('Ouverture de votre messagerie…', 'info');
      return;
    }
    showToast('Aucun contact renseigné pour ce client', 'err');
  };

  /* ------------------------------ Sélection ------------------------------- */

  const toggleOne = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const allPageSelected = rows.length > 0 && rows.every(q => selected.has(q.id));
  const somePageSelected = rows.some(q => selected.has(q.id));

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = somePageSelected && !allPageSelected;
  }, [somePageSelected, allPageSelected]);

  const togglePage = () =>
    setSelected(prev => {
      const next = new Set(prev);
      if (allPageSelected) rows.forEach(q => next.delete(q.id));
      else rows.forEach(q => next.add(q.id));
      return next;
    });

  /* -------------------------------- Rendu --------------------------------- */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-5">
              <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-40 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-4 w-24 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasFilters = !!searchTerm || tab !== 'all' || period !== 'all';
  const pipelineTotal = Math.max(1, quotes.length);

  return (
    <div className="space-y-8 pb-28 animate-fadeIn">
      {/* ------------------------------ En-tête ------------------------------ */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Ventes</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-slate-900">Devis</h1>
          <p className="mt-1.5 text-sm text-slate-500">Suivez l'avancement de chaque proposition, de l'envoi à la signature.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV(filtered, `devis-${new Date().toISOString().slice(0, 10)}.csv`)}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <Download size={16} />
            Exporter
          </button>
          <button
            onClick={() => navigate('/dashboard/quotes/new')}
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            Nouveau devis
          </button>
        </div>
      </div>

      {/* -------------------------------- KPI -------------------------------- */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 divide-slate-100 lg:grid-cols-4 lg:divide-x">
          <Kpi label="Chiffre d'affaires signé" value={formatCurrency(stats.revenue)} hint={`${counts.accepted} ${plural(counts.accepted, 'devis accepté', 'devis acceptés')}`} accent="text-emerald-600" />
          <Kpi label="En attente de réponse" value={formatCurrency(stats.pending)} hint={`${counts.sent} ${plural(counts.sent, 'devis envoyé', 'devis envoyés')}`} />
          <Kpi label="Taux de signature" value={stats.winRate === null ? '—' : `${stats.winRate} %`} hint="Acceptés / décidés" />
          <Kpi label="Panier moyen" value={stats.avg ? formatCurrency(stats.avg) : '—'} hint="Sur les devis acceptés" />
        </div>
        {quotes.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              {STATUS_ORDER.map(s => counts[s] > 0 && (
                <div key={s} className={`${STATUS[s].bar} transition-all`} style={{ width: `${(counts[s] / pipelineTotal) * 100}%` }} title={`${STATUS[s].label} : ${counts[s]}`} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500">
              {STATUS_ORDER.map(s => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${STATUS[s].dot}`} />
                  {STATUS[s].label}
                  <span className="font-semibold tabular-nums text-slate-700">{counts[s]}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ------------------------------ À traiter ---------------------------- */}
      {attention.length > 0 && (
        <section className="rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-50/70 to-white p-1.5 shadow-sm">
          <div className="flex items-center gap-2.5 px-4 pb-2 pt-3">
            <BellRing size={16} className="text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-900">À traiter</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">{attention.length}</span>
          </div>
          <ul className="divide-y divide-slate-100 rounded-xl bg-white">
            {attention.slice(0, 4).map(({ quote, kind, label }) => {
              const Icon = kind === 'expiring' ? Hourglass : kind === 'followup' ? Mail : PenLine;
              return (
                <li
                  key={quote.id}
                  onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}
                  className="group flex cursor-pointer items-center gap-4 px-4 py-3.5 transition first:rounded-t-xl last:rounded-b-xl hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {quote.client_name || 'Client'} <span className="font-mono text-xs font-normal text-slate-400">· {quote.number}</span>
                    </p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                  <span className="hidden text-sm font-semibold tabular-nums text-slate-900 sm:block">
                    {formatCurrency(quote.total, quote.currency)}
                  </span>
                  {kind !== 'draft' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); followUp(quote); }}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <Send size={12} />
                      Relancer
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          {attention.length > 4 && (
            <p className="px-4 py-2.5 text-xs text-slate-500">+ {attention.length - 4} autres devis nécessitent votre attention</p>
          )}
        </section>
      )}

      {/* ------------------------- Onglets + filtres ------------------------- */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-3 pt-2">
          {([['all', 'Tous'], ...STATUS_ORDER.map(s => [s, STATUS[s].label])] as [QuoteStatus | 'all', string][]).map(([key, label]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative flex shrink-0 items-center gap-2 px-4 py-3 text-sm font-medium transition ${
                  active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums ${active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {counts[key]}
                </span>
                {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-slate-900" />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un numéro, un client, un email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-11 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-slate-900/5"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-medium text-slate-700 transition focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5"
              >
                <option value="all">Toute la période</option>
                <option value="30d">30 derniers jours</option>
                <option value="month">Ce mois-ci</option>
                <option value="year">Cette année</option>
              </select>
            </div>
            <button
              onClick={() => fetchQuotes(true)}
              disabled={refreshing}
              title="Actualiser"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* -------------------------------- Table ------------------------------- */}
        {rows.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-20 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Inbox className="text-slate-400" size={28} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {hasFilters ? 'Aucun devis ne correspond' : 'Aucun devis pour le moment'}
            </h3>
            <p className="mt-1.5 max-w-sm text-sm text-slate-500">
              {hasFilters ? 'Modifiez votre recherche ou vos filtres pour élargir les résultats.' : 'Créez votre premier devis en quelques clics.'}
            </p>
            {hasFilters ? (
              <button
                onClick={() => { setSearchTerm(''); setTab('all'); setPeriod('all'); }}
                className="mt-6 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Réinitialiser les filtres
              </button>
            ) : (
              <button
                onClick={() => navigate('/dashboard/quotes/new')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Plus size={16} /> Créer un devis
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100 bg-slate-50/60">
                  <tr>
                    <th className="w-12 px-4 py-3.5 pl-6">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={togglePage}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </th>
                    <SortHeader label="Client" k="client" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                    <SortHeader label="Émis le" k="date" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} className="hidden md:table-cell" />
                    <SortHeader label="Échéance" k="due" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} className="hidden lg:table-cell" />
                    <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Statut</th>
                    <SortHeader label="Montant" k="amount" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} align="right" className="pr-6" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((quote) => {
                    const status = effectiveStatus(quote);
                    const cfg = STATUS[status];
                    const StatusIcon = cfg.icon;
                    const due = describeDue(quote, status);
                    const isSel = selected.has(quote.id);

                    return (
                      <tr
                        key={quote.id}
                        onClick={() => navigate(`/dashboard/quotes/${quote.id}`)}
                        className={`group cursor-pointer transition ${isSel ? 'bg-slate-50' : 'hover:bg-slate-50/70'}`}
                      >
                        <td className="px-4 py-4 pl-6" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={() => toggleOne(quote.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3.5">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600">
                              {initials(quote.client_name)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{quote.client_name || '—'}</p>
                              <p className="truncate text-xs text-slate-500">
                                <span className="font-mono">{quote.number}</span>
                                {quote.client_email && <span className="hidden sm:inline"> · {quote.client_email}</span>}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden px-4 py-4 text-sm text-slate-600 md:table-cell">{formatShortDate(quote.date)}</td>

                        <td className={`hidden px-4 py-4 text-sm font-medium lg:table-cell ${due.tone}`}>{due.text}</td>

                        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                          {/* Changement de statut en ligne */}
                          <div className={`relative inline-flex items-center rounded-full ring-1 ring-inset ${cfg.pill}`}>
                            <StatusIcon size={13} className="pointer-events-none absolute left-2.5" />
                            <select
                              value={quote.status === 'draft' || quote.status === 'sent' ? status : quote.status}
                              onChange={(e) => updateStatus([quote.id], e.target.value as QuoteStatus)}
                              aria-label="Changer le statut"
                              className="cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pl-8 pr-7 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                            >
                              {STATUS_ORDER.map(s => (
                                <option key={s} value={s} className="text-slate-900">{STATUS[s].label}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 opacity-60" />
                          </div>
                        </td>

                        <td className="px-4 py-4 pr-6 text-right">
                          <span className="text-sm font-semibold tabular-nums text-slate-900">
                            {formatCurrency(quote.total, quote.currency)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900 tabular-nums">
                  {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                </span>{' '}
                sur <span className="font-semibold text-slate-900 tabular-nums">{filtered.length}</span> {plural(filtered.length, 'devis', 'devis')}
              </p>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Page précédente"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-2 text-sm font-medium tabular-nums text-slate-600">{page} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Page suivante"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* --------------------- Barre d'actions groupées ---------------------- */}
      {selected.size > 0 && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="animate-slideUp flex flex-wrap items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl ring-1 ring-white/10">
            <span className="pl-1 text-sm font-medium">
              <span className="tabular-nums">{selected.size}</span> {plural(selected.size, 'sélectionné', 'sélectionnés')}
            </span>
            <span className="hidden h-5 w-px bg-white/15 sm:block" />

            <div className="relative">
              <select
                defaultValue=""
                onChange={(e) => {
                  const v = e.target.value as QuoteStatus | '';
                  if (v) updateStatus(Array.from(selected), v);
                  e.target.value = '';
                }}
                className="h-9 cursor-pointer appearance-none rounded-lg bg-white/10 pl-3 pr-8 text-sm font-medium text-white transition hover:bg-white/15 focus:outline-none"
              >
                <option value="" disabled className="text-slate-900">Changer le statut…</option>
                {STATUS_ORDER.map(s => <option key={s} value={s} className="text-slate-900">{STATUS[s].label}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70" />
            </div>

            <button
              onClick={() => exportCSV(quotes.filter(q => selected.has(q.id)), `devis-selection-${new Date().toISOString().slice(0, 10)}.csv`)}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-sm font-medium transition hover:bg-white/15"
            >
              <Download size={14} /> Exporter
            </button>

            <button
              onClick={bulkDelete}
              disabled={busy}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-500/90 px-3 text-sm font-medium transition hover:bg-rose-500 disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Supprimer
            </button>

            <button
              onClick={() => setSelected(new Set())}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Désélectionner"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------- Toasts ----------------------------- */}
      <div className="fixed right-6 top-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slideIn flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl ${
              t.tone === 'ok' ? 'bg-slate-900' : t.tone === 'err' ? 'bg-rose-600' : 'bg-sky-600'
            }`}
          >
            {t.tone === 'ok' ? <CheckCircle2 size={16} /> : t.tone === 'err' ? <AlertCircle size={16} /> : <Info size={16} />}
            {t.msg}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn  { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.25s ease-out; }
        .animate-slideUp { animation: slideUp 0.25s ease-out; }
      `}</style>
    </div>
  );
}