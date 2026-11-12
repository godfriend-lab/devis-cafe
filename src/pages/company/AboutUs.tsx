import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------------ */
/* Données                                                             */
/* ------------------------------------------------------------------ */

type Country = [code: string, name: string, lon: number, lat: number];

const flag = (code: string, w = 80) => `https://flagcdn.com/w${w}/${code}.png`;

// [code ISO, nom, longitude, latitude]
const COUNTRIES: Country[] = [
  ['ma', 'Maroc', -6.5, 32], ['dz', 'Algérie', 2.5, 28], ['tn', 'Tunisie', 9.5, 34.2],
  ['ly', 'Libye', 17, 27], ['eg', 'Égypte', 30, 26.5], ['mr', 'Mauritanie', -10.5, 20],
  ['ml', 'Mali', -3.5, 17], ['ne', 'Niger', 9, 17], ['td', 'Tchad', 18.5, 15.5],
  ['sd', 'Soudan', 30, 15.5], ['sn', 'Sénégal', -14.8, 14.6], ['gn', 'Guinée', -11, 10.6],
  ['ci', "Côte d'Ivoire", -5.8, 7.4], ['bf', 'Burkina Faso', -1.8, 12.6], ['gh', 'Ghana', -2.6, 8.6],
  ['bj', 'Bénin', 3.4, 10.4], ['ng', 'Nigeria', 8.5, 9.2], ['cm', 'Cameroun', 12.8, 5.6],
  ['cf', 'Centrafrique', 21, 6.6], ['ga', 'Gabon', 11.8, -0.8], ['cg', 'Congo', 15.4, -0.6],
  ['cd', 'RD Congo', 23.5, -3], ['et', 'Éthiopie', 40, 8.5], ['ke', 'Kenya', 37.8, 0.6],
  ['tz', 'Tanzanie', 34.8, -6.3], ['ao', 'Angola', 17.5, -12], ['za', 'Afrique du Sud', 25, -29],
];
const HQ: Country = ['tg', 'Togo', 1.2, 7.4];

// Contour simplifié du continent (longitude, latitude)
const OUTLINE: [number, number][] = [
  [-5.9, 35.8], [-2, 35.1], [3, 36.8], [10, 37.3], [11, 33.5], [15, 32.3], [20, 33], [23, 32.6], [25, 31.6],
  [30, 31.3], [32.3, 31.2], [32.6, 29.9], [33.5, 27.5], [35.5, 24], [37.2, 21], [38.5, 18], [40, 15.5],
  [42.5, 12.8], [43.3, 11.5], [47, 11.2], [51.2, 11.8], [50.8, 10], [49, 6], [47, 3], [43.5, 0], [41.5, -2],
  [39.5, -5], [39.3, -8], [40.5, -11], [40.5, -15], [36, -19], [35.5, -24], [33, -26], [32.8, -28.5],
  [30, -31], [27, -33.5], [22, -34.1], [19, -34.5], [18.4, -34], [17.5, -31], [15, -27], [14.5, -22],
  [12, -17], [13.5, -12], [13, -8], [12, -5], [9.5, -1], [9.5, 3], [8.5, 4.5], [6, 4.3], [4, 6.3], [1, 6],
  [-2, 4.8], [-4.5, 5.2], [-7.5, 4.4], [-11, 6.8], [-13.5, 9.5], [-15, 11], [-16.7, 12.5], [-17.5, 14.7],
  [-16.5, 19], [-17, 21], [-15, 24.5], [-13, 27.7], [-10, 29.5], [-9.6, 31], [-9.8, 33], [-6.8, 34],
];

const LON0 = -18, LAT0 = 38, SPAN_LON = 70, SPAN_LAT = 73;

const inside = (x: number, y: number): boolean => {
  let c = false;
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i];
    const [xj, yj] = OUTLINE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

interface StatItem {
  value: number;
  label: string;
  fmt: (n: number) => string;
}

const STATS: StatItem[] = [
  { value: 2023, label: 'Année de création', fmt: (n: number) => String(n) },
  { value: 5000, label: 'Startups accompagnées', fmt: (n: number) => `${n.toLocaleString('fr-FR')}+` },
  { value: 27, label: 'Pays africains représentés', fmt: (n: number) => `${n}+` },
  { value: 1, label: 'Siège, à Lomé', fmt: () => 'Togo' },
];

const PRODUCT_POINTS = [
  { t: 'Spécialisé métier', d: 'Chaque fonction est pensée pour le devis, la facture et le commerce, pas pour le design générique.' },
  { t: 'Sécurité de niveau entreprise', d: 'Vos données financières sont chiffrées et protégées par des infrastructures de pointe.' },
  { t: 'Support local et réactif', d: 'Une équipe qui comprend les réalités du marché africain et mondial.' },
  { t: 'Prêt en quelques minutes', d: 'Aucune courbe d’apprentissage : créez, envoyez et suivez vos documents immédiatement.' },
];

const COMMITMENTS = [
  'Excellence technique et sécurité des données',
  'Accessibilité des outils professionnels pour tous',
  'Souveraineté et fierté technologique africaine',
  'Innovation continue au service de l’utilisateur',
];

const STEPS = ['Créez votre compte gratuitement', 'Choisissez l’offre adaptée à votre activité', 'Générez votre premier document en quelques minutes'];

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration = 1600) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setN(target); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (t: number) => {
        const p = Math.min((t - t0) / duration, 1);
        setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return [ref, n] as const;
}

/* ------------------------------------------------------------------ */
/* Composants                                                          */
/* ------------------------------------------------------------------ */

function Stat({ value, label, fmt }: StatItem) {
  const [ref, n] = useCountUp(value);
  return (
    <div ref={ref}>
      <p className="text-5xl sm:text-6xl font-light tracking-tight text-slate-900 tabular-nums">{fmt(n)}</p>
      <p className="mt-3 text-base text-slate-600">{label}</p>
    </div>
  );
}

function AfricaMap() {
  const dots = useMemo(() => {
    const out: [number, number][] = [];
    const step = 1.7;
    for (let lat = 37; lat > -35; lat -= step) {
      for (let lon = -17.5; lon < 52; lon += step) {
        if (inside(lon, lat)) {
          out.push([((lon - LON0) / SPAN_LON) * 700, ((LAT0 - lat) / SPAN_LAT) * 730]);
        }
      }
    }
    return out;
  }, []);

  const pos = (lon: number, lat: number): CSSProperties => ({
    left: `${((lon - LON0) / SPAN_LON) * 100}%`,
    top: `${((LAT0 - lat) / SPAN_LAT) * 100}%`,
  });

  return (
    <div className="relative mx-auto w-full max-w-155" style={{ aspectRatio: '700 / 730' }}>
      <svg viewBox="0 0 700 730" className="absolute inset-0 h-full w-full" role="img" aria-label="Carte de l’Afrique représentée par des points">
        {dots.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.1" fill="#cbd5e1" />
        ))}
      </svg>

      {COUNTRIES.map(([code, name, lon, lat]) => (
        <div key={code} className="group absolute -translate-x-1/2 -translate-y-1/2 hover:z-30" style={pos(lon, lat)}>
          <img
            src={flag(code, 40)}
            alt={`Drapeau : ${name}`}
            loading="lazy"
            className="h-3.25 w-5 sm:h-4 sm:w-6 rounded-[3px] object-cover shadow-md ring-1 ring-white transition-transform duration-200 group-hover:scale-[1.8]"
          />
          <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
            {name}
          </span>
        </div>
      ))}

      {/* Siège : Togo */}
      <div className="group absolute z-20 -translate-x-1/2 -translate-y-1/2" style={pos(HQ[2], HQ[3])}>
        <span className="mt-pulse absolute inset-0 -m-3 rounded-full bg-brand-500/40" />
        <img
          src={flag(HQ[0], 80)}
          alt="Drapeau : Togo, siège de MATUNEQHYD"
          className="relative h-5.5 w-8.5 sm:h-7 sm:w-10.5 rounded-[4px] object-cover shadow-xl ring-2 ring-white"
        />
        <span className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white">
          Togo, siège
        </span>
      </div>
    </div>
  );
}

const MOSAIC = [
  { c: 'tg', top: '30%', left: '0%', w: '52%', r: -4, z: 5, d: '0s' },
  { c: 'ng', top: '4%', left: '38%', w: '44%', r: 3, z: 3, d: '0.8s' },
  { c: 'sn', top: '56%', left: '44%', w: '40%', r: -2, z: 4, d: '1.4s' },
  { c: 'ci', top: '0%', left: '4%', w: '30%', r: 5, z: 2, d: '0.4s' },
  { c: 'gh', top: '76%', left: '6%', w: '30%', r: 3, z: 2, d: '1.1s' },
  { c: 'ke', top: '28%', left: '66%', w: '32%', r: -5, z: 1, d: '1.8s' },
];

function FlagMosaic() {
  return (
    <div className="relative mx-auto h-75 w-full max-w-105 sm:h-115" aria-hidden="true">
      {MOSAIC.map((m) => (
        <div
          key={m.c}
          className="mt-float absolute overflow-hidden rounded-3xl border-[3px] border-white/70 shadow-[0_30px_60px_-20px_rgba(2,11,29,0.45)]"
          style={{ top: m.top, left: m.left, width: m.w, aspectRatio: '3 / 2', zIndex: m.z, '--r': `${m.r}deg`, animationDelay: m.d } as CSSProperties}
        >
          <img src={flag(m.c, 320)} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function DocMock() {
  return (
    <div className="mx-auto w-full max-w-105 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_30px_60px_-30px_rgba(2,11,29,0.35)]" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-3 w-28 rounded bg-slate-900" />
          <div className="mt-2 h-2 w-20 rounded bg-slate-200" />
        </div>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Devis</span>
      </div>
      <div className="mt-6 space-y-3">
        {[70, 55, 80].map((w, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="h-2 rounded bg-slate-200" style={{ width: `${w}%` }} />
            <div className="h-2 w-14 rounded bg-slate-300" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">Total</span>
        <span className="text-lg font-semibold text-slate-900 tabular-nums">125 000 FCFA</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">
      <style>{`
        @keyframes mt-float { 0%,100% { transform: translateY(0) rotate(var(--r)); } 50% { transform: translateY(-12px) rotate(var(--r)); } }
        @keyframes mt-pulse { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(2.2); opacity: 0; } }
        .mt-float { transform: rotate(var(--r)); animation: mt-float 7s ease-in-out infinite; }
        .mt-pulse { animation: mt-pulse 2.2s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .mt-float, .mt-pulse { animation: none; } }
      `}</style>

      {/* 1. HERO */}
      <section className="relative overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(203 213 225) 1px, transparent 0)', backgroundSize: '28px 28px', maskImage: 'linear-gradient(to bottom, black, transparent 85%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)' }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-5 lg:px-8 lg:pb-28">
          <div className="lg:col-span-3">
            <button
              onClick={() => navigate('/')}
              className="mb-10 text-sm font-medium text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
            >
              Retour à l’accueil
            </button>
            <p className="mb-5 inline-flex rounded-full border border-slate-200 bg-white/70 px-4 py-1.5 text-sm text-slate-700 backdrop-blur">
              Entreprise technologique africaine
            </p>
            <h1 className="max-w-3xl text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Le géant technologique de l’Afrique, pour le monde entier
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              MATUNEQHYD est une entreprise technologique de dimension mondiale, basée à Lomé. Elle conçoit des écosystèmes logiciels puissants qui digitalisent les entreprises et propulsent les startups, du Togo jusqu’aux marchés du monde entier.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/register')}
                className="rounded-full bg-brand-600 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Créer un compte gratuitement
              </button>
              <button
                onClick={() => navigate('/become-partner')}
                className="rounded-full border border-slate-900 px-7 py-3.5 text-base font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Devenir partenaire
              </button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <FlagMosaic />
          </div>
        </div>
      </section>

      {/* 2. QUI SOMMES-NOUS */}
      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-[2.5rem] bg-gradient-to-br from-orange-100 via-white to-white p-8 sm:p-10 lg:col-span-2">
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">L’entreprise</h2>
              <div className="mt-6 grid gap-6 text-base leading-relaxed text-slate-700 md:grid-cols-2">
                <p>
                  Fondée au Togo en 2023, <strong className="font-semibold text-slate-900">MATUNEQHYD SARL U</strong> est née d’une vision claire : combler le fossé technologique en Afrique et offrir des outils de classe mondiale aux professionnels et aux entrepreneurs.
                </p>
                <p>
                  Nous croyons que le logiciel est le levier ultime de la croissance. Nos produits ne sont pas des prototypes : ce sont des solutions déjà sur le marché, utilisées chaque jour par des milliers de personnes à travers le globe.
                </p>
              </div>
            </article>
            <article className="rounded-[2.5rem] bg-slate-950 p-8 text-white sm:p-10">
              <h3 className="text-2xl font-medium tracking-tight">Notre engagement</h3>
              <ul className="mt-6 space-y-4">
                {COMMITMENTS.map((c) => (
                  <li key={c} className="border-b border-white/10 pb-4 text-slate-300 last:border-0 last:pb-0">{c}</li>
                ))}
              </ul>
            </article>
          </div>

          {/* Carte + chiffres */}
          <article className="mt-6 overflow-hidden rounded-[2.5rem] bg-white p-6 sm:p-10">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">
                  Une présence sur tout le continent
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600">
                  Du Togo, notre siège, nos outils servent des professionnels dans de nombreux pays d’Afrique et au-delà. Chaque drapeau marque un pays que nous accompagnons.
                </p>
                <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10">
                  {STATS.map((s) => <Stat key={s.label} {...s} />)}
                </div>
              </div>
              <AfricaMap />
            </div>
          </article>
        </div>
      </section>

      {/* 3. PRODUIT */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl text-4xl font-medium tracking-tight sm:text-5xl">
            Simplifiez la facturation avec nos outils intelligents
          </h2>

          <div className="mt-12 grid overflow-hidden rounded-[2.5rem] border border-slate-200 lg:grid-cols-2">
            <div className="flex flex-col justify-center bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-white sm:p-14">
              <h3 className="text-4xl font-medium tracking-tight">Devis Café</h3>
              <p className="mt-4 text-lg leading-relaxed text-brand-100">
                Notre solution phare de création et de gestion de documents professionnels.
              </p>
              <p className="mt-4 leading-relaxed text-white/85">
                Alternative spécialisée aux outils de design grand public comme Canva, Devis Café est optimisé pour les entrepreneurs, freelances et PME qui doivent générer des devis et factures impeccables, conformes et rapides.
              </p>
              <button
                onClick={() => navigate('/')}
                className="mt-8 w-fit rounded-full bg-white px-7 py-3.5 font-semibold text-brand-700 transition hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-800"
              >
                Découvrir Devis Café
              </button>
            </div>
            <div className="flex items-center justify-center bg-slate-50 p-10 sm:p-14">
              <DocMock />
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PRODUCT_POINTS.map((p) => (
              <article key={p.t} className="rounded-[2rem] border border-slate-200 p-7 transition hover:border-brand-500/40 hover:shadow-lg">
                <h4 className="text-lg font-semibold">{p.t}</h4>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONFORMITÉ */}
      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 rounded-[2.5rem] bg-slate-950 p-8 text-white sm:p-14 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-medium tracking-tight sm:text-4xl">Transparence et conformité</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-slate-400">
                MATUNEQHYD opère dans le strict respect des cadres légaux en vigueur, pour garantir à ses partenaires et clients une collaboration sécurisée et durable.
              </p>
            </div>
            <dl className="divide-y divide-white/10 rounded-3xl border border-white/10 bg-white/5 px-6">
              {[
                ['Dénomination', 'MATUNEQHYD SARL U'],
                ['RCCM', 'TG-LFW-01-2023-B13-03106'],
                ['NIF', '1001884857'],
                ['Siège', 'Lomé, Togo'],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap items-center justify-between gap-2 py-4">
                  <dt className="text-sm text-slate-400">{k}</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    {k === 'Siège' && <img src={flag('tg', 40)} alt="Drapeau du Togo" className="h-4 w-6 rounded-sm object-cover" />}
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Prêt à digitaliser votre activité ?
            </h2>
            <p className="mt-5 max-w-lg text-lg text-slate-600">
              Rejoignez les milliers d’entrepreneurs qui font confiance à l’écosystème MATUNEQHYD pour développer leur business.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/register')}
                className="rounded-full bg-brand-600 px-8 py-4 font-semibold text-white transition hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Créer un compte gratuitement
              </button>
              <button
                onClick={() => navigate('/become-partner')}
                className="rounded-full border border-slate-900 px-8 py-4 font-semibold text-slate-900 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Devenir partenaire
              </button>
            </div>
          </div>
          <ol className="space-y-5">
            {STEPS.map((s, i) => (
              <li key={s} className="flex items-center gap-5 border-b border-slate-200 pb-5 text-xl font-medium">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-600 text-brand-600 tabular-nums">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}