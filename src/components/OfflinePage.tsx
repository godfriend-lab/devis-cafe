import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Coffee, Signal } from 'lucide-react';

export function OfflinePage() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      setIsReconnecting(false);
    };

    const handleOnline = () => {
      setIsReconnecting(true);
      // Attendre 2 secondes pour vérifier que la connexion est stable
      setTimeout(() => {
        if (navigator.onLine) {
          setIsOffline(false);
          setIsReconnecting(false);
        }
      }, 2000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex items-center justify-center p-6">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes signal-wave {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0.2, 0.7, 0.2, 1) infinite; }
        .animate-signal { animation: signal-wave 1.5s ease-in-out infinite; }
      `}</style>

      <div className="max-w-md w-full text-center">
        {/* Icône principale avec animation */}
        <div className="relative inline-flex items-center justify-center mb-8">
          {/* Anneaux pulsants */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-red-100 animate-pulse-ring" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center" style={{ animationDelay: '0.5s' }}>
            <div className="w-32 h-32 rounded-full bg-red-100 animate-pulse-ring" />
          </div>

          {/* Cercle principal */}
          <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl shadow-red-500/30 animate-float">
            {isReconnecting ? (
              <RefreshCw size={48} className="text-white animate-spin" />
            ) : (
              <WifiOff size={48} className="text-white" />
            )}
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {isReconnecting ? 'Reconnexion...' : 'Vous êtes hors ligne'}
        </h1>

        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          {isReconnecting 
            ? 'Nous rétablissons la connexion. Veuillez patienter...'
            : 'Pas de souci, vos données sont sauvegardées localement. Reconnectez-vous pour synchroniser.'}
        </p>

        {/* Indicateur de statut */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
            <Signal size={20} className="text-slate-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-signal" />
          </div>
          <div className="text-left">
            <p className="text-xs text-slate-500">Statut de connexion</p>
            <p className="text-sm font-semibold text-slate-900">
              {isReconnecting ? 'Tentative de reconnexion' : 'Aucune connexion'}
            </p>
          </div>
        </div>

        {/* Conseils */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Que pouvez-vous faire ?
          </p>
          <ul className="space-y-2.5">
            {[
              'Vérifiez votre connexion Wi-Fi ou mobile',
              'Consultez vos devis déjà chargés',
              'Les modifications seront synchronisées automatiquement',
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-600" />
                </div>
                <span className="text-sm text-slate-700">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer avec logo */}
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <Coffee size={16} className="text-brand-600" />
          <span className="text-xs font-medium">Devis Café</span>
        </div>
      </div>
    </div>
  );
}