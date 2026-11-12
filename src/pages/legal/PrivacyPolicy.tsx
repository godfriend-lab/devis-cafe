import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Politique de confidentialité</h1>
          <p className="text-slate-500 mb-8">Dernière mise à jour : Novembre 2026</p>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
              <p>
                Bienvenue sur Devis Café. Nous nous engageons à protéger votre vie privée et à traiter vos données personnelles avec le plus grand soin. 
                Cette politique décrit comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Données collectées</h2>
              <p className="mb-3">Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Données de compte :</strong> Adresse e-mail et mot de passe (chiffré) pour l'authentification.</li>
                <li><strong>Données professionnelles :</strong> Nom de l'entreprise, logo, coordonnées et informations fiscales que vous renseignez pour générer vos devis.</li>
                <li><strong>Données d'utilisation :</strong> Informations techniques anonymisées (type de navigateur, pages visitées) pour améliorer l'expérience utilisateur.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">3. Utilisation des données</h2>
              <p>
                Vos données sont utilisées exclusivement pour :
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Vous permettre de créer, gérer et exporter des devis professionnels.</li>
                <li>Assurer la sécurité et l'intégrité de votre compte.</li>
                <li>Vous informer des mises à jour importantes du service.</li>
              </ul>
              <p className="mt-3">
                <strong>Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers à des fins commerciales.</strong>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Sécurité et hébergement</h2>
              <p>
                Vos données sont hébergées de manière sécurisée via notre partenaire infrastructurel Supabase, qui garantit le chiffrement des données en transit (SSL/TLS) et au repos. 
                Nous utilisons des politiques de sécurité au niveau des lignes (RLS) pour garantir que vos données restent strictement isolées et accessibles uniquement par vous.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Vos droits</h2>
              <p className="mb-3">Conformément à la réglementation en vigueur, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Droit d'accès :</strong> Obtenir une copie des données que nous détenons à votre sujet.</li>
                <li><strong>Droit de rectification :</strong> Modifier ou mettre à jour vos informations.</li>
                <li><strong>Droit à l'effacement :</strong> Demander la suppression complète de votre compte et de toutes les données associées.</li>
              </ul>
              <p className="mt-3">
                Pour exercer ces droits, contactez-nous à l'adresse indiquée en bas de cette page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter à :<br />
                <strong>Email :</strong> contact@deviscafe.com (à remplacer par votre email réel)<br />
                <strong>Adresse :</strong> [Votre Adresse ou Ville, Pays]
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}