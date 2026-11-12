import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

// =========================================================================
// SERVICE WORKER — Enregistrement intelligent avec fallback
// =========================================================================
async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker non supporté par ce navigateur');
    return;
  }

  try {
    // Essai avec le module virtuel de vite-plugin-pwa
    const { registerSW } = await import('virtual:pwa-register');

    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW: (swUrl: string, registration?: ServiceWorkerRegistration) => {
        console.log('✅ Service Worker enregistré avec succès');
        console.log('📦 URL:', swUrl);
        console.log('🌐 Scope:', registration?.scope);

        // Rafraîchissement automatique toutes les heures
        if (registration?.active?.state === 'activated') {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError: (error: unknown) => {
        console.error('❌ Erreur d\'enregistrement:', error);
      },
      onNeedRefresh: () => {
        console.log('🔄 Nouvelle version disponible');
        const shouldUpdate = window.confirm(
          'Une nouvelle version de Devis Café est disponible. Mettre à jour ?'
        );
        if (shouldUpdate) {
          updateSW(true);
        }
      },
      onOfflineReady: () => {
        console.log('✅ Mode hors ligne activé — L\'app fonctionne sans internet');
      },
    });
  } catch (error) {
    // Fallback : enregistrement manuel du Service Worker
    console.warn('⚠️ Module virtuel indisponible, utilisation du fallback');
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker enregistré (fallback):', registration.scope);
    } catch (fallbackError) {
      console.error('❌ Échec de l\'enregistrement fallback:', fallbackError);
    }
  }
}

// =========================================================================
// INITIALISATION DE L'APPLICATION
// =========================================================================
function bootstrap(): void {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    throw new Error(
      'Élément #root introuvable dans le DOM. Vérifiez le fichier index.html.'
    );
  }

  const root = createRoot(rootElement);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Enregistrer le Service Worker après le rendu initial
  // (pour ne pas bloquer le chargement de la page)
  window.addEventListener('load', () => {
    registerServiceWorker();
  });
}

// =========================================================================
// LANCEMENT
// =========================================================================
bootstrap();