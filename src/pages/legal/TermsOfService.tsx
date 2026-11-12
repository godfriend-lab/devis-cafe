import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition mb-8"
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Conditions d'utilisation</h1>
          <p className="text-slate-500 mb-8">Dernière mise à jour : Novembre 2026</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Acceptation des conditions</h2>
              <p>
                En accédant et en utilisant l'application Devis Café, vous acceptez sans réserve les présentes conditions d'utilisation. 
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Description du service</h2>
              <p>
                Devis Café est une application web permettant aux freelances, artisans et petites entreprises de créer, personnaliser, gérer et exporter des documents commerciaux (devis, factures). 
                Le service est fourni "en l'état" et peut évoluer sans préavis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Compte utilisateur et responsabilités</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
                <li>Vous vous engagez à fournir des informations exactes et à jour lors de votre inscription.</li>
                <li>Vous êtes seul responsable de l'exactitude légale et comptable des documents que vous générez via l'application.</li>
                <li>Il est strictement interdit d'utiliser le service à des fins illégales, frauduleuses ou pour générer de faux documents.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Propriété intellectuelle</h2>
              <p>
                L'application Devis Café, son code source, son design, son logo et l'ensemble de son contenu sont la propriété exclusive de Godfriend Lab. 
                Les documents (devis) que vous créez vous appartiennent entièrement. Nous ne revendiquons aucun droit sur vos données commerciales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Limitation de responsabilité</h2>
              <p>
                Devis Café s'efforce de maintenir un service disponible et sécurisé. Cependant, nous ne pouvons garantir une disponibilité ininterrompue. 
                Nous ne saurions être tenus responsables des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le service, 
                ni de la perte de données, sauf en cas de faute lourde de notre part.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Modification des conditions</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements majeurs par e-mail ou via une notification dans l'application. 
                L'utilisation continue du service après la publication des modifications vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Droit applicable et juridiction</h2>
              <p>
                Les présentes conditions sont régies par le droit en vigueur dans votre pays de résidence. En cas de litige, une solution amiable sera recherchée en priorité avant toute action judiciaire.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}