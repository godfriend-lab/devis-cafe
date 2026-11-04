'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Armchair,
  BedDouble,
  Bike,
  BookOpen,
  Building,
  Building2,
  Calculator,
  Camera,
  Car,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Code2,
  Cog,
  ConciergeBell,
  Croissant,
  DraftingCompass,
  Droplets,
  Fish,
  Flame,
  Flower,
  Flower2,
  Gem,
  GraduationCap,
  Grid3x3,
  Hammer,
  HardHat,
  HeartPulse,
  Home,
  KeyRound,
  Landmark,
  Languages,
  Laptop,
  Map as MapIcon,
  Megaphone,
  MessagesSquare,
  Mic,
  Music,
  Package,
  PaintRoller,
  Paintbrush,
  Palette,
  PawPrint,
  PenTool,
  Pill,
  Plane,
  Printer,
  Recycle,
  Ruler,
  Scale,
  Scissors,
  ShieldCheck,
  Ship,
  Shirt,
  Smartphone,
  Snowflake,
  SprayCan,
  Sparkles,
  Stethoscope,
  Sun,
  TreePine,
  Truck,
  Users,
  UtensilsCrossed,
  Video,
  Warehouse,
  Wheat,
  Wifi,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Contenu                                                            */
/* ------------------------------------------------------------------ */

// Rangée de catégories (cartes blanches avec icône)
const categories: { label: string; slug: string; Icon: LucideIcon }[] = [
  { label: 'Développement & Tech', slug: 'developpement-tech', Icon: Code2 },
  { label: 'Design & Graphisme', slug: 'design-graphisme', Icon: Palette },
  { label: 'Marketing Digital', slug: 'marketing-digital', Icon: Megaphone },
  { label: 'Rédaction & Traduction', slug: 'redaction-traduction', Icon: Languages },
  { label: 'Vidéo & Animation', slug: 'video-animation', Icon: Clapperboard },
  { label: 'IA & Automatisation', slug: 'ia-automatisation', Icon: Sparkles },
  { label: 'Audio & Musique', slug: 'audio-musique', Icon: Music },
  { label: 'Business', slug: 'business', Icon: Users },
  { label: 'Conseil', slug: 'conseil', Icon: MessagesSquare },
];

// Couleur de fond des cartes du carrousel (vert foncé, comme Fiverr)
const CARD_BG = '#0b3d1e';

// Modèles de devis populaires : chaque carte porte l'icône de son métier / service
// Couleurs (fond du visuel / icône), appliquées dans l'ordre puis en boucle
const palettes: { tone: string; accent: string }[] = [
  { tone: '#d3f5e3', accent: '#1f7a4d' },
  { tone: '#f8d9d3', accent: '#b4442f' },
  { tone: '#e6dcff', accent: '#5b3fc4' },
  { tone: '#ffe3c2', accent: '#c2661a' },
  { tone: '#dcefff', accent: '#1e6fb8' },
  { tone: '#fbd9ea', accent: '#b0286b' },
  { tone: '#ebe8c8', accent: '#6b6a1f' },
  { tone: '#d5ecee', accent: '#1c6f77' },
  { tone: '#ffeaa8', accent: '#8a6a00' },
  { tone: '#d9e4ff', accent: '#2c4fb3' },
];

const trades: { title: string; slug: string; Icon: LucideIcon }[] = [
  { title: 'BTP & Construction', slug: 'construction', Icon: HardHat },
  { title: 'Artisanat & Métiers manuels', slug: 'Métiers manuels', Icon: Hammer },
  { title: 'Services', slug: 'services', Icon: ConciergeBell },
  { title: 'Restauration & Métiers de bouche', slug: 'Métiers de bouche', Icon: ChefHat },
  { title: 'Transport & Automobile', slug: 'Automobile', Icon: Car },
  { title: 'Ingénierie', slug: 'Ingénierie', Icon: DraftingCompass },
  { title: 'Informatique & Digital', slug: 'Digital', Icon: Laptop },
  { title: 'Plâtrerie & staff', slug: 'staff', Icon: PaintRoller },
  { title: 'Aménagement intérieur', slug: 'Aménagement intérieur', Icon: Armchair },
  { title: 'Forage & puits', slug: 'puits', Icon: Droplets },

  // ---- Bâtiment & artisanat ----
  { title: 'Électricité & Domotique', slug: 'electricite', Icon: Zap },
  { title: 'Plomberie & Sanitaire', slug: 'plomberie', Icon: Wrench },
  { title: 'Soudure & Métallurgie', slug: 'soudure', Icon: Flame },
  { title: 'Carrelage & Revêtements', slug: 'carrelage', Icon: Grid3x3 },
  { title: 'Peinture en bâtiment', slug: 'peinture', Icon: Paintbrush },
  { title: 'Toiture & Charpente', slug: 'toiture', Icon: Home },
  { title: 'Climatisation & Froid', slug: 'climatisation', Icon: Snowflake },
  { title: 'Menuiserie & Ébénisterie', slug: 'menuiserie', Icon: Ruler },
  { title: 'Serrurerie & Ferronnerie', slug: 'serrurerie', Icon: KeyRound },
  { title: 'Énergie solaire', slug: 'solaire', Icon: Sun },

  // ---- Agriculture, alimentation & hôtellerie ----
  { title: 'Jardinage & Paysagisme', slug: 'jardinage', Icon: TreePine },
  { title: 'Agriculture & Élevage', slug: 'agriculture', Icon: Wheat },
  { title: 'Pêche & Aquaculture', slug: 'peche', Icon: Fish },
  { title: 'Boulangerie & Pâtisserie', slug: 'boulangerie', Icon: Croissant },
  { title: 'Traiteur & Événementiel', slug: 'traiteur', Icon: UtensilsCrossed },
  { title: 'Hôtellerie & Hébergement', slug: 'hotellerie', Icon: BedDouble },
  { title: 'Fleuriste & Décoration', slug: 'fleuriste', Icon: Flower },
  { title: 'Tourisme & Voyages', slug: 'tourisme', Icon: Plane },

  // ---- Transport & logistique ----
  { title: 'Livraison & Transport', slug: 'livraison', Icon: Truck },
  { title: 'Logistique & Entrepôt', slug: 'logistique', Icon: Warehouse },
  { title: 'Mécanique & Garage', slug: 'mecanique', Icon: Cog },
  { title: 'Moto & Cycles', slug: 'moto', Icon: Bike },
  { title: 'Maritime & Navigation', slug: 'maritime', Icon: Ship },
  { title: 'Déménagement', slug: 'demenagement', Icon: Package },

  // ---- Beauté, mode & création ----
  { title: 'Coiffure & Barbier', slug: 'coiffure', Icon: Scissors },
  { title: 'Esthétique & Beauté', slug: 'beaute', Icon: Flower2 },
  { title: 'Couture & Mode', slug: 'couture', Icon: Shirt },
  { title: 'Bijouterie & Orfèvrerie', slug: 'bijouterie', Icon: Gem },
  { title: 'Photographie', slug: 'photographie', Icon: Camera },
  { title: 'Production vidéo', slug: 'production-video', Icon: Video },
  { title: 'Musique & Sonorisation', slug: 'sonorisation', Icon: Mic },
  { title: 'Imprimerie & Impression', slug: 'imprimerie', Icon: Printer },
  { title: 'Graphisme & Design', slug: 'graphisme', Icon: PenTool },

  // ---- Immobilier, finance & droit ----
  { title: 'Architecture', slug: 'architecture', Icon: Building2 },
  { title: 'Topographie & Géomètre', slug: 'topographie', Icon: MapIcon },
  { title: 'Immobilier', slug: 'immobilier', Icon: Building },
  { title: 'Comptabilité & Gestion', slug: 'comptabilite', Icon: Calculator },
  { title: 'Juridique & Notariat', slug: 'juridique', Icon: Scale },
  { title: 'Banque & Assurance', slug: 'banque-assurance', Icon: Landmark },

  // ---- Santé, éducation & autres services ----
  { title: 'Santé & Médical', slug: 'sante', Icon: Stethoscope },
  { title: 'Pharmacie', slug: 'pharmacie', Icon: Pill },
  { title: 'Vétérinaire', slug: 'veterinaire', Icon: PawPrint },
  { title: 'Bien-être & Kinésithérapie', slug: 'bien-etre', Icon: HeartPulse },
  { title: 'Éducation & Formation', slug: 'formation', Icon: GraduationCap },
  { title: 'Édition & Librairie', slug: 'edition', Icon: BookOpen },
  { title: 'Sécurité & Gardiennage', slug: 'securite', Icon: ShieldCheck },
  { title: 'Nettoyage & Entretien', slug: 'nettoyage', Icon: SprayCan },
  { title: 'Télécoms & Réseaux', slug: 'telecoms', Icon: Wifi },
  { title: 'Réparation mobile & Électronique', slug: 'reparation-mobile', Icon: Smartphone },
  { title: 'Recyclage & Environnement', slug: 'recyclage', Icon: Recycle },
];

const popular = trades.map((trade, i) => ({ ...trade, ...palettes[i % palettes.length] }));

/* ------------------------------------------------------------------ */
/*  Visuel : icône du métier dans la carte                             */
/* ------------------------------------------------------------------ */

function TradeIcon({ Icon, tone, accent }: { Icon: LucideIcon; tone: string; accent: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg" style={{ backgroundColor: tone }}>
      {/* Anneaux décoratifs */}
      <span
        aria-hidden="true"
        className="absolute h-36 w-36 rounded-full border opacity-25"
        style={{ borderColor: accent }}
      />
      <span
        aria-hidden="true"
        className="absolute h-56 w-56 rounded-full border opacity-15"
        style={{ borderColor: accent }}
      />

      {/* Icône */}
      <span className="relative flex h-[84px] w-[84px] items-center justify-center rounded-2xl bg-white shadow-[0_8px_22px_-8px_rgba(0,0,0,0.35)]">
        <Icon size={44} strokeWidth={1.6} color={accent} aria-hidden="true" />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function WhyChoose() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, [updateArrows]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="wc-root bg-white pb-20 pt-10 text-[#404145]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        .wc-root { font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif; }
        .wc-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wc-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        {/* ============ 1. Rangée de catégories ============ */}
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {categories.map(({ label, slug, Icon }) => (
            <li key={slug}>
              <a
                href={`/devis/nouveau?categorie=${slug}`}
                className="flex h-[104px] flex-col justify-between rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d1f23]"
              >
                <Icon size={24} strokeWidth={1.5} className="text-[#404145]" />
                <span className="text-[13px] font-medium leading-tight text-[#404145]">{label}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* ============ 2. Services populaires ============ */}
        <h2 className="mb-8 mt-16 text-[2.4rem] font-normal leading-tight tracking-[-0.02em] text-[#404145] sm:text-5xl">
          Devis populaires
        </h2>

        <div className="relative">
          <div
            ref={scrollerRef}
            onScroll={updateArrows}
            className="wc-scroll -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1"
          >
            {popular.map(({ title, slug, Icon, tone, accent }) => (
              <a
                key={slug}
                href={`/devis/nouveau?modele=${encodeURIComponent(slug)}`}
                className="group flex h-[216px] w-[165px] shrink-0 snap-start flex-col rounded-xl p-[5px] outline-offset-2 transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1d1f23] lg:w-[calc((100%-5rem)/6)]"
                style={{ backgroundColor: CARD_BG }}
              >
                <h3 className="px-2.5 pb-2 pt-3 text-[15px] font-bold leading-snug text-white">{title}</h3>
                <div className="min-h-0 flex-1">
                  <TradeIcon Icon={Icon} tone={tone} accent={accent} />
                </div>
              </a>
            ))}
          </div>

          {/* Flèches */}
          {canPrev && (
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Voir les devis précédents"
              className="absolute left-1 top-[56%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#404145] shadow-[0_2px_12px_rgba(0,0,0,0.18)] transition-colors hover:bg-slate-50 sm:-left-5"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {canNext && (
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Voir les devis suivants"
              className="absolute right-1 top-[56%] z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-[#404145] shadow-[0_2px_12px_rgba(0,0,0,0.18)] transition-colors hover:bg-slate-50 sm:-right-5"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}