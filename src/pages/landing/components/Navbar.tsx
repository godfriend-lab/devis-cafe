import { Coffee } from 'lucide-react';

const navLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Fonctionnalités', href: '/features' },
  { label: 'Tarifs', href: '/pricing' },
  { label: 'FAQ', href: '/faq' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <Coffee className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900">Devis Café</span>
          </a>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-brand-600 transition"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-slate-700 hover:text-brand-600 transition"
            >
              Se connecter
            </a>
            <a
              href="/signup"
              className="inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition"
            >
              Créer un compte
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}