import { Check, Coffee } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  'Devis illimités',
  'Génération PDF professionnelle',
  'Historique complet',
  'Multi-devises (FCFA, EUR, USD)',
  'Personnalisation complète',
  'Support prioritaire',
  'Mises à jour gratuites',
  'Sauvegarde automatique',
];

export function Pricing() {
  return (
    <section className="py-24 bg-gradient-to-br from-coffee-50 to-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-coffee-900 mb-6">
            Un prix simple,
            <span className="block text-coffee-600">une valeur immense</span>
          </h2>
          <p className="text-xl text-coffee-700">
            Pas de frais cachés. Pas de surprises. Payez une fois, utilisez pendant 12 mois.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-coffee-200 overflow-hidden">
            {/* Badge */}
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-coffee-600 to-coffee-800 text-cream px-6 py-2 rounded-bl-2xl font-semibold text-sm">
                POPULAIRE
              </div>
            </div>

            <div className="p-12">
              {/* Plan name */}
              <div className="flex items-center gap-3 mb-4">
                <Coffee className="text-coffee-600" size={32} />
                <h3 className="text-3xl font-bold text-coffee-900">Plan Annuel</h3>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-bold text-coffee-900">10 000</span>
                  <span className="text-2xl text-coffee-600 font-semibold">FCFA</span>
                </div>
                <p className="text-coffee-600 mt-2">par an • Accès complet</p>
              </div>

              {/* CTA */}
              <Link
                to="/signup"
                className="block w-full text-center px-8 py-4 bg-coffee-700 text-cream rounded-xl font-semibold text-lg hover:bg-coffee-800 transition-all shadow-lg hover:shadow-xl mb-8"
              >
                Commencer maintenant
              </Link>

              {/* Features list */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-coffee-100 flex items-center justify-center">
                      <Check size={16} className="text-coffee-700" />
                    </div>
                    <span className="text-coffee-800">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer note */}
            <div className="bg-coffee-50 px-12 py-6 border-t border-coffee-100">
              <p className="text-center text-coffee-700 text-sm">
                💳 Paiement sécurisé • 🔄 Renouvellement annuel • ❌ Annulation à tout moment
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}