import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, MouseEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUp, Check, Coffee, Loader2 } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*  Données (à adapter)                                                        */
/* -------------------------------------------------------------------------- */

// Remplacez par votre vraie adresse de contact
const CONTACT_EMAIL = 'contact@devis-cafe.com';

type FooterItem = { label: string; to?: string; href?: string };

const navigation: FooterItem[] = [
  { label: 'Accueil', to: '/' },
  { label: 'Fonctionnalités', to: '/features' },
  { label: 'Tarifs', to: '/pricing' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Contact', href: `mailto:${CONTACT_EMAIL}` },
];

const account: FooterItem[] = [
  { label: 'Se connecter', to: '/login' },
  { label: 'Créer un compte', to: '/register' },
];

// Ces pages n'existent pas encore dans vos routes : créez-les, ou laissez « # »
const legal: FooterItem[] = [
  { label: 'Conditions d’utilisation', href: '#' },
  { label: 'Politique de confidentialité', href: '#' },
];

const benefits = [
  'Les nouveautés du produit en avant-première',
  'Des conseils pour mieux chiffrer vos projets',
  'Un e-mail par mois, jamais plus',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const linkClass =
  'relative w-fit text-[15px] text-slate-400 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white after:transition-all after:duration-300 hover:after:w-full focus-visible:outline-none focus-visible:text-white';

/* -------------------------------------------------------------------------- */
/*  Logos des réseaux sociaux (tracés officiels)                               */
/* -------------------------------------------------------------------------- */

function PathLogo({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const LinkedInLogo = ({ className }: { className?: string }) => (
  <PathLogo
    className={className}
    d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  />
);

const XLogo = ({ className }: { className?: string }) => (
  <PathLogo
    className={className}
    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
  />
);

const YouTubeLogo = ({ className }: { className?: string }) => (
  <PathLogo
    className={className}
    d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
  />
);

const FacebookLogo = ({ className }: { className?: string }) => (
  <PathLogo className={className} d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
);

const WhatsAppLogo = ({ className }: { className?: string }) => (
  <PathLogo className={className} d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
);

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Remplacez les « # » par vos vrais liens
const socials = [
  {
    name: 'WhatsApp',
    href: '#',
    Logo: WhatsAppLogo,
    hover: 'hover:border-[#25D366] hover:bg-[#25D366] hover:text-white',
  },
  {
    name: 'Facebook',
    href: '#',
    Logo: FacebookLogo,
    hover: 'hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white',
  },
  {
    name: 'LinkedIn',
    href: '#',
    Logo: LinkedInLogo,
    hover: 'hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white',
  },
  {
    name: 'X',
    href: '#',
    Logo: XLogo,
    hover: 'hover:border-white hover:bg-white hover:text-slate-950',
  },
  {
    name: 'YouTube',
    href: '#',
    Logo: YouTubeLogo,
    hover: 'hover:border-[#FF0000] hover:bg-[#FF0000] hover:text-white',
  },
  {
    name: 'Instagram',
    href: '#',
    Logo: InstagramLogo,
    hover:
      'hover:border-transparent hover:[background:linear-gradient(45deg,#FEDA75,#D62976,#4F5BD5)] hover:text-white',
  },
];

/* -------------------------------------------------------------------------- */
/*  Petits composants                                                          */
/* -------------------------------------------------------------------------- */

function FooterLink({ item }: { item: FooterItem }) {
  return (
    <li className="flex">
      {item.to ? (
        <Link to={item.to} className={linkClass}>
          {item.label}
        </Link>
      ) : (
        <a href={item.href} className={linkClass}>
          {item.label}
        </a>
      )}
    </li>
  );
}

/** Panneau en verre dont un halo suit le curseur */
function SpotlightPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/10 backdrop-blur-xl ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.01))',
        boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      {/* Halo qui suit la souris */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(520px circle at var(--mx, 50%) var(--my, 0%), rgba(99,102,241,0.16), transparent 45%)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Newsletter                                                                 */
/* -------------------------------------------------------------------------- */

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'loading') return;

    if (!EMAIL_RE.test(email.trim())) {
      setError('Saisissez une adresse e-mail valide.');
      return;
    }

    setError('');
    setStatus('loading');

    // Remplacez ce délai par l'appel à votre service (Brevo, Mailchimp, table Supabase…).
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setStatus('success');
  };

  if (status === 'success') {
    return (
      <div
        role="status"
        className="flex items-start gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-6"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
          <Check size={20} strokeWidth={2.5} className="text-emerald-300" />
        </span>
        <div>
          <p className="text-lg font-semibold text-white">Inscription confirmée</p>
          <p className="mt-1 leading-relaxed text-slate-300">
            Un e-mail de bienvenue a été envoyé à{' '}
            <span className="font-medium text-white">{email.trim()}</span>.
          </p>
          <button
            type="button"
            onClick={() => {
              setEmail('');
              setStatus('idle');
            }}
            className="mt-3 text-sm font-medium text-slate-300 underline underline-offset-4 transition hover:text-white"
          >
            Inscrire une autre adresse
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse e-mail
      </label>
      <div
        className={`flex flex-col gap-2 rounded-2xl border bg-black/40 p-2 shadow-inner transition sm:flex-row ${
          error
            ? 'border-red-400/60'
            : 'border-white/10 focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/20'
        }`}
      >
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="vous@entreprise.com"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby="newsletter-help"
          className="h-12 min-w-0 flex-1 bg-transparent px-4 text-base text-white outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/40 disabled:opacity-70"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Inscription
            </>
          ) : (
            'S’abonner'
          )}
        </button>
      </div>

      <p
        id="newsletter-help"
        className={`mt-3 text-sm ${error ? 'text-red-300' : 'text-slate-400'}`}
        role={error ? 'alert' : undefined}
      >
        {error || 'Désinscription en un clic, à tout moment.'}
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                     */
/* -------------------------------------------------------------------------- */

export function Footer() {
  return (
    <footer className="footer-root relative overflow-hidden bg-[#05070d] text-slate-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');

        .footer-root { font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif; }

        @keyframes footer-shine {
          from { background-position: 0% 0; }
          to   { background-position: 100% 0; }
        }
        .footer-shine { animation: footer-shine 9s ease-in-out infinite alternate; }

        @keyframes footer-sheen {
          0%   { transform: translateX(-130%) skewX(-20deg); }
          60%, 100% { transform: translateX(260%) skewX(-20deg); }
        }
        .footer-sheen { animation: footer-sheen 3.6s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .footer-shine, .footer-sheen { animation: none; }
        }
      `}</style>

      {/* ---------- Décor : grille, halos, filet lumineux ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 22%, #000 30%, transparent 100%)',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 22%, #000 30%, transparent 100%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10rem] h-[22rem] w-[44rem] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: 'rgba(37,99,235,0.32)' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 bottom-24 h-[26rem] w-[26rem] rounded-full blur-[130px]"
        style={{ background: 'rgba(124,58,237,0.18)' }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(96,165,250,0.7), transparent)' }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ---------- 1. Appel à l'action ---------- */}
        <div className="pb-16 pt-24 text-center sm:pt-28">
          <p className="mx-auto inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-xs tracking-[0.18em] text-slate-300 uppercase backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Gratuit pour commencer
          </p>

          <h2 className="mx-auto mt-8 max-w-4xl text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            Des devis plus simples.
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #93c5fd, #c4b5fd 55%, #f0abfc)' }}
            >
              Des projets plus grands.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Créez, envoyez et suivez vos devis en quelques minutes. Sans carte bancaire, sans prise de tête.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/register"
              className="group/cta relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-8 py-4 text-base font-bold text-slate-950 shadow-[0_10px_40px_-8px_rgba(147,197,253,0.55)] transition hover:shadow-[0_14px_50px_-6px_rgba(147,197,253,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <span
                aria-hidden="true"
                className="footer-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.25), transparent)' }}
              />
              <span className="relative">Créer mon premier devis</span>
              <ArrowRight
                size={20}
                className="relative transition-transform group-hover/cta:translate-x-1 motion-reduce:transition-none"
              />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Se connecter
            </Link>
          </div>
        </div>

        {/* ---------- 2. Panneau principal ---------- */}
        <SpotlightPanel>
          {/* Newsletter */}
          <div className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:p-14">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-blue-300 uppercase">// Newsletter</p>
              <h3 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                La lettre Devis Café
              </h3>
              <ul className="mt-6 space-y-3">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-slate-300">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-400/15">
                      <Check size={12} strokeWidth={3} className="text-blue-300" />
                    </span>
                    <span className="leading-snug">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <NewsletterForm />
          </div>

          <div className="mx-8 h-px sm:mx-12 lg:mx-14" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)' }} />

          {/* Liens */}
          <div className="grid gap-12 p-8 sm:p-12 md:grid-cols-[1.6fr_1fr_1fr_1fr] lg:p-14">
            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 shadow-lg shadow-brand-600/30">
                  <Coffee className="text-white" size={22} />
                </span>
                <span className="text-xl font-bold text-white">Devis Café</span>
              </Link>
              <p className="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
                L’outil de devis pensé pour les indépendants, les artisans et les petites agences.
              </p>

              <ul className="mt-8 flex flex-wrap gap-2.5">
                {socials.map(({ name, href, Logo, hover }) => (
                  <li key={name}>
                    <a
                      href={href}
                      aria-label={name}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/20 motion-reduce:transition-none ${hover}`}
                    >
                      <Logo className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label="Navigation du pied de page">
              <h3 className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Navigation</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {navigation.map((item) => (
                  <FooterLink key={item.label} item={item} />
                ))}
              </ul>
            </nav>

            <nav aria-label="Compte">
              <h3 className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Compte</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {account.map((item) => (
                  <FooterLink key={item.label} item={item} />
                ))}
              </ul>
            </nav>

            <nav aria-label="Informations légales">
              <h3 className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Légal</h3>
              <ul className="mt-6 flex flex-col gap-4">
                {legal.map((item) => (
                  <FooterLink key={item.label} item={item} />
                ))}
              </ul>
            </nav>
          </div>
        </SpotlightPanel>

        {/* ---------- 3. Bas de page ---------- */}
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-sm text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Devis Café. Tous droits réservés.</p>
          <p>Paiements sécurisés par Stripe et PayPal</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group/top inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-2 pl-4 pr-3 text-slate-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Haut de page
            <ArrowUp
              size={16}
              className="transition-transform group-hover/top:-translate-y-0.5 motion-reduce:transition-none"
            />
          </button>
        </div>
      </div>

      {/* ---------- 4. Grand logotype animé ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative select-none overflow-hidden text-center font-extrabold leading-[0.8] tracking-tighter"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, #000 15%, transparent 95%)',
          maskImage: 'linear-gradient(to bottom, #000 15%, transparent 95%)',
        }}
      >
        <span
          className="footer-shine block translate-y-[10%] bg-clip-text text-[clamp(4.5rem,21vw,19rem)] text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(255,255,255,0.07), rgba(147,197,253,0.42), rgba(255,255,255,0.07))',
            backgroundSize: '200% 100%',
          }}
        >
          Devis Café
        </span>
      </div>
    </footer>
  );
}