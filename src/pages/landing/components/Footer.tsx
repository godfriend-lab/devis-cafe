import { Link } from 'react-router-dom';
import { ArrowUp, Coffee, Mail, Check } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
// =========================================================================
// DONNÉES DU FOOTER (Organisation exacte demandée)
// =========================================================================
const footerData = {
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Our Services', to: '/services' },
    { label: 'Our Projects', to: '/projects' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact Us', to: '/contact' },
  ],
  partnerships: [
    { label: 'Become a Partner', to: '/become-partner' },
    { label: 'Business Partnerships', to: '/partnerships/business' },
    { label: 'Technology Partnerships', to: '/partnerships/tech' },
    { label: 'Strategic Alliances', to: '/partnerships/strategic' },
  ],
  resources: [
    { label: 'Blog', to: '/blog' },
    { label: 'FAQs', to: '/faq' },
    { label: 'Help Center', to: '/help' },
  ],
  legal: [
    { label: 'Legal Notice', to: '/legal-notice' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
};

// =========================================================================
// COMPOSANT : Newsletter
// =========================================================================
function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setStatus('loading');
    await new Promise((r) => setTimeout(r, 1000));
    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <Check size={20} className="text-emerald-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-white">Inscription confirmée</p>
          <p className="text-xs text-slate-400 mt-1">Bienvenue dans la communauté Devis Café.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="relative">
        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="email"
          required
          placeholder="votre@email.com"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full h-12 rounded-xl bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition disabled:opacity-70"
      >
        {status === 'loading' ? '...' : 'S\'abonner à la newsletter'}
      </button>
    </form>
  );
}

// =========================================================================
// COMPOSANT PRINCIPAL : Footer
// =========================================================================
export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="relative bg-slate-950 text-slate-400 border-t border-white/5 overflow-hidden">
      {/* Effet de lueur high-tech en arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        
        {/* 1. Section Principale : Branding + Newsletter + Colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Colonne 1-4 : Branding & Newsletter */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Coffee className="text-white" size={22} />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Devis Café</span>
            </div>
            
            <p className="text-sm leading-relaxed max-w-xs">
              La plateforme de référence pour créer, gérer et exporter des devis professionnels en quelques secondes.
            </p>

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Restez informé
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Colonne 5-12 : Liens de navigation */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Company</h3>
              <ul className="space-y-3">
                {footerData.company.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Partnerships */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Partnerships</h3>
              <ul className="space-y-3">
                {footerData.partnerships.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm hover:text-brand-400 transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Resources</h3>
              <ul className="space-y-3">
                {footerData.resources.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-3">
                {footerData.legal.map((link) => (
                  <li key={link.label}>
                    <Link 
                      to={link.to} 
                      className="text-sm hover:text-white transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 2. Ligne de séparation */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

        {/* 3. Bas de page : Copyright & Back to top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Devis Café. All rights reserved.</p>
          
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            <span>Back to top</span>
            <ArrowUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </footer>
  );
}