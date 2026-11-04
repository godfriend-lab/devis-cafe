import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Côté Gauche : Branding avec Vidéo */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Vidéo d'arrière-plan */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="/videos/hero-tech-background.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>
        
        {/* Overlay dégradé pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/80 via-slate-950/70 to-slate-950/85" />
        
        {/* Contenu */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
              <Coffee className="text-white" size={28} />
            </div>
            <span className="text-3xl font-bold tracking-tight">Devis Café</span>
          </div>
          
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Bon retour parmi nous !
          </h1>
          
          <p className="text-slate-300 text-lg max-w-md leading-relaxed">
            Vos devis vous attendent. Créez, gérez et exportez en quelques clics avec une simplicité déconcertante.
          </p>
        </div>
        
        <div className="relative z-10 text-slate-400 text-sm">
          © {new Date().getFullYear()} Devis Café. Tous droits réservés.
        </div>
      </div>

      {/* Côté Droit : Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium text-sm transition-colors">
              <ArrowRight size={16} className="rotate-180" /> Retour à l'accueil
            </Link>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xl shadow-slate-900/5">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Connexion</h1>
              <p className="text-slate-600">Accédez à votre espace Devis Café.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    placeholder="vous@entreprise.com"
                    required
                    autoComplete="email"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-slate-950 text-white rounded-xl font-semibold hover:bg-slate-800 transition shadow-lg shadow-slate-950/10 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Pas encore de compte ?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}