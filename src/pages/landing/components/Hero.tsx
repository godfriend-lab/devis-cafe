'use client';

import { useEffect, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  SiAccenture,
  SiAdidas,
  SiAirbnb,
  SiAirbus,
  SiApple,
  SiAudi,
  SiBmw,
  SiCitroen,
  SiDropbox,
  SiEricsson,
  SiFerrari,
  SiFiat,
  SiGoogle,
  SiIkea,
  SiIntel,
  SiKlarna,
  SiLamborghini,
  SiLufthansa,
  SiMastercard,
  SiMeta,
  SiNetflix,
  SiNike,
  SiNokia,
  SiPayoneer,
  SiPaypal,
  SiPeugeot,
  SiPorsche,
  SiPuma,
  SiRenault,
  SiRevolut,
  SiSamsung,
  SiSap,
  SiShopify,
  SiSiemens,
  SiSkoda,
  SiSony,
  SiSpotify,
  SiStripe,
  SiTesla,
  SiToyota,
  SiUber,
  SiVisa,
  SiVodafone,
  SiVolkswagen,
  SiVolvo,
} from 'react-icons/si';
import { ArrowRight, Briefcase, Coffee, HardHat, Hammer, Pause, Play, Ruler } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Vidéo                                                              */
/*  Fichier à placer ici : public/videos/hero-tech-background.mp4      */
/* ------------------------------------------------------------------ */

const VIDEO_SRC = '/videos/hero-tech-background.mp4';

/* ------------------------------------------------------------------ */
/*  Contenu                                                            */
/* ------------------------------------------------------------------ */

// Décoratif uniquement : ces éléments ne sont ni cliquables ni des liens.
const categories = [
  { label: 'Devis pour Maçon', Icon: HardHat },
  { label: 'Devis pour Menuisier', Icon: Hammer },
  { label: 'Devis pour Ingénieur', Icon: Ruler },
  { label: 'Devis Professionnel', Icon: Briefcase },
  { label: 'Devis Café pour tous', Icon: Coffee },
];

type Brand = { name: string; Icon: IconType; color: string };

// Une seule ligne : monde + Europe, avec la couleur officielle de chaque marque.
const brands: Brand[] = [
  { name: 'Toyota', Icon: SiToyota, color: '#EB0A1E' },
  { name: 'BMW', Icon: SiBmw, color: '#0066B1' },
  { name: 'Apple', Icon: SiApple, color: '#000000' },
  { name: 'Audi', Icon: SiAudi, color: '#BB0A30' },
  { name: 'Google', Icon: SiGoogle, color: '#4285F4' },
  { name: 'Porsche', Icon: SiPorsche, color: '#B12B28' },
  { name: 'Meta', Icon: SiMeta, color: '#0866FF' },
  { name: 'Volkswagen', Icon: SiVolkswagen, color: '#151F5D' },
  { name: 'Netflix', Icon: SiNetflix, color: '#E50914' },
  { name: 'Ferrari', Icon: SiFerrari, color: '#D40000' },
  { name: 'Tesla', Icon: SiTesla, color: '#CC0000' },
  { name: 'Airbus', Icon: SiAirbus, color: '#00205B' },
  { name: 'Samsung', Icon: SiSamsung, color: '#1428A0' },
  { name: 'Renault', Icon: SiRenault, color: '#E6B800' },
  { name: 'Sony', Icon: SiSony, color: '#000000' },
  { name: 'Peugeot', Icon: SiPeugeot, color: '#00205B' },
  { name: 'Intel', Icon: SiIntel, color: '#0071C5' },
  { name: 'Citroën', Icon: SiCitroen, color: '#DA291C' },
  { name: 'Nike', Icon: SiNike, color: '#111111' },
  { name: 'Siemens', Icon: SiSiemens, color: '#009999' },
  { name: 'Adidas', Icon: SiAdidas, color: '#000000' },
  { name: 'SAP', Icon: SiSap, color: '#0FAAFF' },
  { name: 'Airbnb', Icon: SiAirbnb, color: '#FF5A5F' },
  { name: 'Volvo', Icon: SiVolvo, color: '#003057' },
  { name: 'Uber', Icon: SiUber, color: '#000000' },
  { name: 'Lamborghini', Icon: SiLamborghini, color: '#DDB320' },
  { name: 'Spotify', Icon: SiSpotify, color: '#1DB954' },
  { name: 'Škoda', Icon: SiSkoda, color: '#4BA82E' },
  { name: 'Shopify', Icon: SiShopify, color: '#7AB55C' },
  { name: 'Fiat', Icon: SiFiat, color: '#9B1B30' },
  { name: 'Dropbox', Icon: SiDropbox, color: '#0061FF' },
  { name: 'Ericsson', Icon: SiEricsson, color: '#0082F0' },
  { name: 'Stripe', Icon: SiStripe, color: '#635BFF' },
  { name: 'Nokia', Icon: SiNokia, color: '#124191' },
  { name: 'PayPal', Icon: SiPaypal, color: '#003087' },
  { name: 'Accenture', Icon: SiAccenture, color: '#A100FF' },
  { name: 'Payoneer', Icon: SiPayoneer, color: '#FF4800' },
  { name: 'Lufthansa', Icon: SiLufthansa, color: '#05164D' },
  { name: 'Visa', Icon: SiVisa, color: '#1A1F71' },
  { name: 'Revolut', Icon: SiRevolut, color: '#0075EB' },
  { name: 'Mastercard', Icon: SiMastercard, color: '#EB001B' },
  { name: 'Klarna', Icon: SiKlarna, color: '#111111' },
  { name: 'IKEA', Icon: SiIkea, color: '#0058A3' },
  { name: 'Puma', Icon: SiPuma, color: '#000000' },
  { name: 'Vodafone', Icon: SiVodafone, color: '#E60000' },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  // React n'écrit pas toujours l'attribut "muted" dans le DOM, et sans lui
  // les navigateurs bloquent la lecture automatique. On le force ici.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.play().catch(() => setPlaying(false));
  }, []);

  const toggleVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setPlaying(false));
    } else {
      video.pause();
    }
  };

  return (
    <section className="hero-root relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden bg-[#07070a] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

        .hero-root {
          --blue: #4d8dff;
          font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif;
        }
        .hero-serif { font-family: 'Cormorant Garamond', 'Times New Roman', serif; }

        /* Apparition en fondu, décalée */
        @keyframes hero-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hero-rise { opacity: 0; animation: hero-rise 1.1s cubic-bezier(.2,.7,.2,1) forwards; }
        .d1 { animation-delay: .15s; } .d2 { animation-delay: .35s; }
        .d3 { animation-delay: .55s; } .d4 { animation-delay: .8s; }

        /* Bouton principal */
        .hero-cta {
          display: inline-flex; align-items: center; gap: .75rem;
          padding: 1rem 1.9rem; border-radius: 999px; color: #ffffff;
          font-weight: 600; font-size: 15px; letter-spacing: .02em;
          background: linear-gradient(135deg, #5b9bff 0%, #2f6bff 55%, #1d4ed8 100%);
          box-shadow: 0 10px 40px -12px rgba(47,107,255,.65), inset 0 1px 0 rgba(255,255,255,.35);
          transition: transform .35s ease, box-shadow .35s ease;
        }
        .hero-cta:hover { transform: translateY(-2px); box-shadow: 0 18px 50px -12px rgba(47,107,255,.8), inset 0 1px 0 rgba(255,255,255,.35); }

        /* Cartes « Devis pour » : purement décoratives */
        .hero-tag {
          pointer-events: none; user-select: none; cursor: default;
          display: flex; flex-shrink: 0; align-items: center; gap: .65rem; white-space: nowrap;
          padding: .55rem .9rem .55rem .55rem;
          border-radius: 12px;
          background: linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.02));
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.12);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .hero-tag-icon {
          display: flex; height: 1.75rem; width: 1.75rem; flex-shrink: 0;
          align-items: center; justify-content: center; border-radius: 8px;
          color: var(--blue);
          background: rgba(77,141,255,.14);
          border: 1px solid rgba(77,141,255,.35);
        }

        .hero-tags { scrollbar-width: none; -ms-overflow-style: none; }
        .hero-tags::-webkit-scrollbar { display: none; }

        /* Défilement infini : la liste est dupliquée, on avance de 50 % */
        @keyframes hero-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .hero-marquee-track { display: flex; width: max-content; gap: 1rem; padding-right: 1rem; animation: hero-marquee 120s linear infinite; }
        .hero-marquee:hover .hero-marquee-track { animation-play-state: paused; }
        .hero-marquee {
          -webkit-mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent);
                  mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent);
        }

        /* Tuiles de logos : fond clair pour que chaque couleur de marque reste lisible */
        .hero-logo {
          display: flex; flex-shrink: 0; align-items: center; gap: .8rem;
          height: 4.25rem; padding: 0 1.6rem; border-radius: 16px;
          background: linear-gradient(180deg, #ffffff, #f1efe9);
          box-shadow: 0 10px 30px -14px rgba(0,0,0,.7), inset 0 0 0 1px rgba(255,255,255,.6);
        }
        .hero-logo-name { font-size: 13px; font-weight: 600; letter-spacing: .06em; color: #2a2a2e; }

        @media (prefers-reduced-motion: reduce) {
          .hero-marquee-track { animation: none; }
          .hero-marquee { overflow-x: auto; }
          .hero-rise { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ============ Vidéo de fond (en boucle) ============ */}
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#07070a]/55" />
        <div className="absolute inset-0 bg-linear-to-r from-[#07070a]/90 via-[#07070a]/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-[#07070a]/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-linear-to-t from-[#07070a] via-[#07070a]/85 to-transparent" />
      </div>

      {/* ============ Contenu principal ============ */}
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center px-6 sm:px-10 lg:px-[4.5rem]">
        <div className="hero-rise d1 mb-7 flex items-center gap-4">
          <span className="h-px w-12 bg-[var(--blue)]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--blue)]">
        
          </span>
        </div>

        <h1 className="hero-rise d2 hero-serif max-w-5xl text-[3rem] font-normal leading-[1.03] tracking-[-0.02em] sm:text-[4.6rem] lg:text-[5.8rem]">
          Vos devis professionnels.
          <br />
          <em className="font-normal italic text-[var(--blue)]">Inscrivez-vous,</em>
          <br />
          on s’occupe du reste.
        </h1>

        <div className="hero-rise d3 mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 sm:mt-10">
          <a
            href="/register"
            className="hero-cta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Inscrivez-vous
            <ArrowRight size={18} />
          </a>
        </div>

        {/* Décoratif : ni liens, ni boutons */}
        <div aria-hidden="true" className="hero-rise d4 hero-tags mt-10 flex flex-nowrap gap-2.5 overflow-x-auto sm:mt-12">
          {categories.map(({ label, Icon }) => (
            <div key={label} className="hero-tag">
              <span className="hero-tag-icon">
                <Icon size={16} strokeWidth={1.7} />
              </span>
              <span className="text-[11.5px] font-medium uppercase tracking-[0.08em] text-white/90">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ============ Bandeau « Ils nous font confiance » ============ */}
      <div className="relative w-full pb-7 sm:pb-9">
        <div className="mx-auto mb-5 flex w-full max-w-[1400px] items-center gap-6 px-6 sm:px-10 lg:px-[4.5rem]">
          <p className="hero-serif shrink-0 text-xl italic text-white/90 sm:text-2xl">Ils nous font confiance</p>
          <span className="h-px flex-1 bg-linear-to-r from-[rgba(77,141,255,0.5)] to-transparent" />

          {/* Pause / lecture de la vidéo */}
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={playing ? 'Mettre la vidéo en pause' : 'Relancer la vidéo'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 backdrop-blur-md transition-colors hover:border-[var(--blue)] hover:text-[var(--blue)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
          </button>
        </div>

        {/* Une seule ligne de défilement */}
        <div className="hero-marquee min-w-0 overflow-hidden py-3">
          <ul className="hero-marquee-track">
            {[...brands, ...brands].map(({ name, Icon, color }, i) => (
              <li key={`${name}-${i}`} aria-hidden={i >= brands.length} title={name} className="hero-logo">
                <Icon size={34} color={color} aria-hidden="true" />
                <span className="hero-logo-name">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}