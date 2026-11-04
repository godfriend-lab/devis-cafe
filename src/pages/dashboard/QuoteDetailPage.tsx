import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Eye, Edit, Download } from 'lucide-react';

export function QuoteDetailPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          to="/dashboard/quotes"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-coffee-700 hover:text-coffee-900"
        >
          <ArrowLeft size={16} />
          Retour aux devis
        </Link>

        <div className="rounded-2xl border border-coffee-200 bg-white p-8">
          <h1 className="font-display text-3xl font-semibold text-coffee-900">
            Aperçu du devis
          </h1>
          <p className="mt-2 text-sm text-coffee-600">
            ID : {id}
          </p>

          <div className="mt-8 rounded-xl border-2 border-dashed border-coffee-200 p-12 text-center">
            <Eye className="mx-auto mb-3 text-coffee-300" size={40} />
            <p className="text-sm text-coffee-600">
              Aperçu complet en cours d'implémentation...
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to={`/dashboard/quotes/${id}/edit`}
              className="flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-cream hover:bg-coffee-800"
            >
              <Edit size={16} />
              Modifier
            </Link>
            <button className="flex items-center gap-2 rounded-full border border-coffee-200 bg-white px-5 py-2.5 text-sm font-semibold text-coffee-700 hover:bg-coffee-50">
              <Download size={16} />
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}