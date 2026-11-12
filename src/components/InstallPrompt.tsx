import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Download, Coffee, Zap, WifiOff, RefreshCw, Share, PlusSquare, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Status = 'idle' | 'installing' | 'done';

const SNOOZE_KEY = 'devis-cafe:pwa-snooze-until';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours
const SHOW_DELAY_MS = 3000;

const readSnooze = (): number => {
  try {
    return Number(localStorage.getItem(SNOOZE_KEY) || 0);
  } catch {
    return 0;
  }
};

const writeSnooze = () => {
  try {
    localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
  } catch {
    /* stockage indisponible : on ignore */
  }
};

const detectIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const FEATURES = [
  { icon: Zap, title: 'Lancement instantané', text: 'Ouvrez Devis Café en un geste depuis votre écran d’accueil.' },
  { icon: WifiOff, title: 'Disponible hors ligne', text: 'Consultez et préparez vos devis même sans connexion.' },
  { icon: RefreshCw, title: 'Toujours à jour', text: 'Les nouveautés arrivent automatiquement, sans rien télécharger.' },
];

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const hideTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    if (isStandalone || readSnooze() > Date.now()) return;

    const ios = detectIOS();
    setIsIOS(ios);

    let showTimer: number | undefined;
    const scheduleShow = () => {
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    };

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      scheduleShow();
    };

    const onInstalled = () => {
      writeSnooze();
      setDeferredPrompt(null);
      setStatus('done');
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    // iOS ne déclenche jamais beforeinstallprompt : on affiche le guide manuel.
    if (ios) scheduleShow();

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Ferme automatiquement la confirmation de succès
  useEffect(() => {
    if (status !== 'done') return;
    hideTimer.current = window.setTimeout(() => setIsVisible(false), 3200);
    return () => window.clearTimeout(hideTimer.current);
  }, [status]);

  const dismiss = useCallback(() => {
    writeSnooze();
    setIsVisible(false);
  }, []);

  // Échap pour fermer
  useEffect(() => {
    if (!isVisible || status === 'done') return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, status, dismiss]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setStatus('installing');
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        writeSnooze();
        setStatus('done');
      } else {
        setStatus('idle');
        dismiss();
      }
    } catch (error) {
      console.error('Erreur lors de l’installation :', error);
      setStatus('idle');
    } finally {
      setDeferredPrompt(null);
    }
  };

  if (!isVisible) return null;

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

  /* ───────── Confirmation de succès ───────── */
  if (status === 'done') {
    return (
      <>
        <div
          role="status"
          aria-live="polite"
          className="dc-install-in fixed z-50 inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[360px] flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-900/10 shadow-[0_8px_30px_rgba(15,23,42,0.18)] pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <Check size={20} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">Devis Café est installé</p>
            <p className="text-xs text-slate-500">Retrouvez l’application sur votre écran d’accueil.</p>
          </div>
        </div>
        <InstallStyles />
      </>
    );
  }

  /* ───────── Carte d’installation ───────── */
  return (
    <>
      <section
        role="dialog"
        aria-labelledby="dc-install-title"
        aria-describedby="dc-install-desc"
        className="dc-install-in fixed z-50 inset-x-0 bottom-0 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[400px] overflow-hidden rounded-t-[28px] sm:rounded-3xl bg-white ring-1 ring-slate-900/10 shadow-[0_-8px_40px_rgba(15,23,42,0.18)] sm:shadow-[0_20px_60px_-10px_rgba(15,23,42,0.35)]"
      >
        {/* Poignée mobile */}
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <span className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        <div className="p-5 sm:p-6">
          {/* En-tête */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/25 ring-1 ring-inset ring-white/20">
              <Coffee size={26} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1 pt-0.5">
              <h2 id="dc-install-title" className="text-[17px] font-semibold leading-tight tracking-tight text-slate-900">
                Installer Devis Café
              </h2>
              <p className="mt-1 truncate text-[13px] text-slate-500">
                {hostname || 'Application web'} · Gratuit
              </p>
            </div>

            <button
              onClick={dismiss}
              aria-label="Fermer"
              className="-mr-1.5 -mt-1.5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X size={18} />
            </button>
          </div>

          <p id="dc-install-desc" className="mt-4 text-sm leading-relaxed text-slate-600">
            Ajoutez l’application à votre appareil pour créer vos devis plus vite, partout.
          </p>

          {/* Avantages */}
          <ul className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-slate-50/60">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-brand-600 ring-1 ring-slate-200">
                  <Icon size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">{title}</p>
                  <p className="text-xs leading-snug text-slate-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Guide iOS */}
          {isIOS && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-[13px] font-semibold text-slate-900">Sur iPhone et iPad</p>
              <ol className="mt-3 space-y-2.5 text-[13px] text-slate-600">
                <li className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-600">
                    <Share size={15} />
                  </span>
                  Touchez le bouton Partager de Safari
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-brand-600">
                    <PlusSquare size={15} />
                  </span>
                  Choisissez « Sur l’écran d’accueil »
                </li>
              </ol>
            </div>
          )}

          {/* Actions */}
          <div className="mt-5 flex items-center gap-2 pb-[env(safe-area-inset-bottom)]">
            <button
              onClick={dismiss}
              className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Plus tard
            </button>

            {isIOS ? (
              <button
                onClick={dismiss}
                className="ml-auto flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                J’ai compris
              </button>
            ) : (
              <button
                onClick={handleInstall}
                disabled={status === 'installing' || !deferredPrompt}
                className="ml-auto flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition hover:bg-brand-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
              >
                {status === 'installing' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Installation…
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Installer
                  </>
                )}
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Sans passer par un store. Désinstallable à tout moment.
          </p>
        </div>
      </section>

      <InstallStyles />
    </>
  );
}

function InstallStyles() {
  return (
    <style>{`
      @keyframes dc-install-in {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .dc-install-in { animation: dc-install-in 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
      @media (prefers-reduced-motion: reduce) {
        .dc-install-in { animation: none; }
      }
    `}</style>
  );
}