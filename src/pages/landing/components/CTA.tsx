import { LayoutTemplate, ListChecks, Palette, Stamp, Wallet, Zap, type LucideIcon } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Contenu                                                            */
/* ------------------------------------------------------------------ */

const features: { title: string; description: string; Icon: LucideIcon }[] = [
  {
    title: 'Création en 6 étapes',
    description: 'Répondez étape par étape : votre devis se génère automatiquement à la dernière, avec votre modèle par défaut.',
    Icon: ListChecks,
  },
  {
    title: "Jusqu'à 1000 modèles",
    description: 'Choisissez parmi une vaste bibliothèque de modèles adaptés à chaque métier et à chaque service.',
    Icon: LayoutTemplate,
  },
  {
    title: 'Personnalisation',
    description: 'Choisissez vos couleurs, ajoutez votre logo et créez des devis à l’image de votre activité.',
    Icon: Palette,
  },
  {
    title: 'Signature et cachet',
    description: 'Ajoutez votre signature et votre cachet pour des devis crédibles, prêts à être présentés à vos clients.',
    Icon: Stamp,
  },
  {
    title: 'Un tarif simple',
    description: '10 000 XOF par an pour tout accéder pendant 12 mois. Équivalent en euros et en dollars disponible.',
    Icon: Wallet,
  },
  {
    title: 'Plus simple que Canva',
    description: 'Pas besoin de compétences en design : vous ne partez jamais d’une page blanche pour faire un devis.',
    Icon: Zap,
  },
];

/* ------------------------------------------------------------------ */
/*  Composant                                                          */
/* ------------------------------------------------------------------ */

export function CTA() {
  return (
    <section className="cta-root bg-white py-20 text-slate-900 sm:py-28">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');
        .cta-root { font-family: 'Figtree', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* ============ Titre (occupe 2 colonnes) ============ */}
          <div className="flex flex-col justify-center pb-6 sm:col-span-2 lg:pr-12">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Fonctionnalités</p>

            <h2 className="text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-slate-950 sm:text-5xl lg:text-[3.4rem]">
              Les fonctionnalités qui font la différence
            </h2>

            <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-500">
              Devis Café vous offre tous les outils essentiels pour créer des devis professionnels, rapidement et sans
              compétences en design.
            </p>
          </div>

          {/* ============ Cartes ============ */}
          {features.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="group rounded-[28px] border border-slate-200/70 p-[7px] transition-colors duration-300 hover:border-blue-200"
            >
              <div className="flex h-full flex-col rounded-[22px] border border-slate-200 bg-white p-7 transition-shadow duration-300 group-hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.35)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                  <Icon size={26} strokeWidth={1.7} aria-hidden="true" />
                </span>

                <h3 className="mt-9 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
                <p className="mt-3 text-[17px] leading-relaxed text-slate-500">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}