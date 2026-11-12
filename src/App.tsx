import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from './lib/supabase';

// =========================================================================
// COMPOSANTS GLOBAUX (PWA & Hors ligne)
// =========================================================================
import { InstallPrompt } from './components/InstallPrompt';
import { OfflinePage } from './components/OfflinePage';

// =========================================================================
// PAGES PUBLIQUES
// =========================================================================
import { LandingPage } from './pages/landing/LandingPage';
import { FeaturesPage } from './pages/features/FeaturesPage';
import { PricingPage } from './pages/pricing/PricingPage';
import { FAQPage } from './pages/faq/FAQPage';

// =========================================================================
// PARTENARIATS
// =========================================================================
import { BecomePartner } from './pages/partnerships/BecomePartner';

// =========================================================================
// PAGES LÉGALES
// =========================================================================
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { AboutUs } from './pages/company/AboutUs';
import { OurServices } from './pages/company/OurServices';
import { OurProjects } from './pages/company/OurProjects';

// =========================================================================
// AUTHENTIFICATION
// =========================================================================
import { RegisterPage } from './pages/auth/RegisterPage';
import { LoginPage } from './pages/auth/LoginPage';

// =========================================================================
// DASHBOARD
// =========================================================================
import { DashboardLayout } from './pages/dashboard/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { CreateQuotePage } from './pages/dashboard/CreateQuotePage';
import { QuotesHistoryPage } from './pages/dashboard/QuotesHistoryPage';
import { QuoteDetailPage } from './pages/dashboard/QuoteDetailPage';
import { EditQuotePage } from './pages/dashboard/EditQuotePage';
import { ComingSoonPage } from './pages/dashboard/ComingSoonPage';

// =========================================================================
// COMPOSANT : Route protégée (nécessite une session active)
// =========================================================================
function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <p className="text-sm text-slate-500 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// =========================================================================
// COMPOSANT : Route publique (redirige si déjà connecté)
// =========================================================================
function PublicRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// =========================================================================
// COMPOSANT : Page 404
// =========================================================================
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50/30 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-brand-100 mb-6">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-6xl font-bold text-slate-900 mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Page introuvable</h2>
        <p className="text-slate-600 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20"
          >
            Retour à l'accueil
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition"
          >
            Tableau de bord
          </a>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// APPLICATION PRINCIPALE
// =========================================================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================================= */}
        {/* 1. PAGES PUBLIQUES (accessibles sans connexion)                   */}
        {/* ================================================================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faq" element={<FAQPage />} />
        {/* ================================================================= */}
        {/* COMPANY                                                             */}
        {/* ================================================================= */}
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<OurServices />} />
        <Route path="/projects" element={<OurProjects />} />

        {/* ================================================================= */}
        {/* 2. PARTENARIATS                                                   */}
        {/* ================================================================= */}
        <Route path="/become-partner" element={<BecomePartner />} />

        {/* ================================================================= */}
        {/* 3. PAGES LÉGALES                                                  */}
        {/* ================================================================= */}
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* ================================================================= */}
        {/* 4. AUTHENTIFICATION (redirige vers /dashboard si déjà connecté)   */}
        {/* ================================================================= */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* ================================================================= */}
        {/* 5. DASHBOARD (protégé - nécessite une connexion active)           */}
        {/* ================================================================= */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="quotes" element={<QuotesHistoryPage />} />
          <Route path="quotes/new" element={<CreateQuotePage />} />
          <Route path="quotes/:id" element={<QuoteDetailPage />} />
          <Route path="quotes/:id/edit" element={<EditQuotePage />} />
          <Route path="coming-soon/:featureId" element={<ComingSoonPage />} />
          <Route path="settings" element={
            <div className="p-8 text-center text-slate-500">
              <h2 className="text-xl font-semibold mb-2">Paramètres</h2>
              <p>Page en cours de développement</p>
            </div>
          } />
        </Route>

        {/* ================================================================= */}
        {/* 6. REDIRECTIONS UTILES                                            */}
        {/* ================================================================= */}
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* ================================================================= */}
        {/* 7. 404 - PAGE NON TROUVÉE (doit toujours être la dernière route)  */}
        {/* ================================================================= */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* ========================================================================= */}
      {/* COMPOSANTS GLOBAUX (Affichés par-dessus toutes les routes)                */}
      {/* ========================================================================= */}
      <InstallPrompt />
      <OfflinePage />
    </BrowserRouter>
  );
}