import { useEffect, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Contenu                                                            */
/*                                                                     */
/*  Vos images : placez-les dans public/images/ avec ces noms.         */
/*  Utilisez des PNG détourés (fond transparent) : la personne se      */
/*  pose directement sur la couleur de la bande, sans carré ni carte.  */
/* ------------------------------------------------------------------ */

type Testimonial = {
  label: string;
  title: string;
  text: string;
  name: string;
  role: string;
  initials: string;
  image: string;
  bg: string; // couleur de la bande
  tint: string; // couleur du repli (visible seulement si l'image manque)
};

const testimonials: Testimonial[] = [
  {
    label: '...',
    title: 'Un temps fou gagné sur chaque devis.',
    text: 'Devis Café m’a fait gagner un temps fou. L’interface est vraiment simple et les devis sont super pros. Je recommande à 100 % !',
    name: 'Zegbla Ludovic',
    role: '(Assistant medical au centre de Sante d Adakpame)',
    initials: 'ZL',
    image: '/images/temoignage-koffi.png',
    bg: '#f8e578',
    tint: '#e9d25a',
  },
  {
    label: '...',
    title: 'Un outil qui comprend vos besoins.',
    text: 'Une plateforme intuitive qui met à votre disposition de magnifiques modèles premium, une interface moderne et des outils pratiques pour concevoir des devis élégants en quelques clics. Plus besoin de perdre du temps avec des outils complexes. Que vous soyez entrepreneur, artisan, indépendant ou dirigeant.',
    name: 'Wilson Botoyiye',
    role: 'Entrepreneur digital',
    initials: 'WB',
    image: '/images/temoignage-amina.png',
    bg: '#bfe6e1',
    tint: '#9fd2cb',
  },
  {
    label: '...',
    title: 'Vos devis prêts depuis votre téléphone.',
    text: 'Je crée mes devis en quelques minutes depuis mon téléphone. C’est devenu un indispensable pour mon activité.',
    name: 'Alejandro Santofimio',
    role: 'Artisan électricien',
    initials: 'AS',
    image: '/images/temoignage-david.png',
    bg: '#f7cfdc',
    tint: '#eeb0c4',
  },
];

/* ------------------------------------------------------------------ */
/*  Apparition douce au défilement                                     */
/* ------------------------------------------------------------------ */

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Une bande de témoignage                                            */
/* ------------------------------------------------------------------ */

function TestimonialBand({ item, reverse }: { item: Testimonial; reverse: boolean }) {
  const { ref, visible } = useInView<HTMLDivElement>();
  const [imageFailed, setImageFailed] = useState(false);

  return (
    // Pas de marge en bas : la personne « pose les pieds » sur le bord de la bande
    <div className="overflow-hidden px-6 pt-14 sm:px-10 sm:pt-20 lg:pt-[90px]" style={{ backgroundColor: item.bg }}>
      <div
        ref={ref}
        className={`mx-auto grid max-w-[1128px] gap-x-[60px] gap-y-10 transition-all duration-700 ease-out motion-reduce:transition-none ${
          reverse ? 'lg:grid-cols-[minmax(0,1fr)_520px]' : 'lg:grid-cols-[520px_minmax(0,1fr)]'
        } ${visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100'}`}
      >
        {/* Personne détourée, collée au bas de la bande */}
        <div className={`order-2 flex items-end justify-center ${reverse ? 'lg:order-2' : 'lg:order-1'}`}>
          {imageFailed ? (
            // Repli discret si l'image n'est pas encore en place
            <div
              className="mb-10 flex h-[260px] w-[260px] items-center justify-center rounded-full text-[88px] font-bold text-[#2c2c2c]/30"
              style={{ backgroundColor: item.tint }}
              aria-hidden="true"
            >
              {item.initials}
            </div>
          ) : (
            <img
              src={item.image}
              alt={`${item.name}, ${item.role}`}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="block h-[420px] w-auto max-w-full object-contain object-bottom sm:h-[500px] lg:h-[560px]"
            />
          )}
        </div>

        {/* Texte, centré verticalement */}
        <div
          className={`order-1 max-w-[565px] self-center pb-2 text-[#2c2c2c] lg:pb-[90px] ${
            reverse ? 'lg:order-1' : 'lg:order-2'
          }`}
        >
          <p className="text-[17px] leading-snug">{item.label}</p>
          <h3 className="mt-5 text-[1.9rem] font-bold leading-[1.22] tracking-[-0.005em] sm:text-[2.15rem]">
            {item.title}
          </h3>
          <p className="mt-5 text-[1.1rem] leading-[1.55]">{item.text}</p>
          <p className="mt-6 text-base">
            <span className="font-bold">{item.name}</span>
            <span className="text-[#2c2c2c]/75">, {item.role}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                            */
/* ------------------------------------------------------------------ */

export function Testimonials() {
  return (
    <section className="testimonials-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700&display=swap');
        .testimonials-root { font-family: 'Source Sans 3', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      {testimonials.map((item, i) => (
        <TestimonialBand key={item.name} item={item} reverse={i % 2 === 1} />
      ))}
    </section>
  );
}