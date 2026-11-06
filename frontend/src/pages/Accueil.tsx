import { AlertTriangle, Server, Database, Activity, ShieldCheck } from 'lucide-react';

export const Accueil = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Détection de Fraude Publicitaire par Machine Learning
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Bienvenue sur le dashboard interactif de détection de clics suspects. 
          Cette plateforme utilise un modèle <strong>XGBoost</strong> préalablement entraîné sur le jeu de données 
          <em> TalkingData AdTracking Fraud Detection</em> pour analyser en temps réel la qualité du trafic publicitaire et optimiser le Retour sur Investissement (ROI).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="text-blue-600 w-6 h-6" />
            Le Problème de la Fraude au Clic
          </h3>
          <p className="text-gray-600 mb-4">
            Dans la publicité digitale, les annonceurs paient souvent par clic (CPC). Des acteurs malveillants utilisent des bots ou des fermes à clics pour générer du faux trafic, épuisant le budget sans générer de conversions réelles.
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              Gaspillage du budget marketing.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              Baisse artificielle des taux de conversion.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              Mauvaises décisions stratégiques.
            </li>
          </ul>
        </div>

        <div className="bg-orange-50 border border-orange-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Avertissement Méthodologique
          </h3>
          <p className="text-orange-700 leading-relaxed">
            Ce système calcule un <strong>Score de Risque</strong> basé sur des schémas comportementaux statistiques. 
            Il permet de filtrer ou de surveiller le trafic de faible qualité en temps réel.
            <br /><br />
            <strong>Important :</strong> Une décision "Block" ou "Monitor" n'est pas une preuve légale absolue de fraude, mais une mesure de protection basée sur la probabilité de non-conversion.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-8 flex items-center gap-2">
          <Server className="text-blue-600 w-6 h-6" />
          Architecture de la Solution
        </h3>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded shadow-sm flex-1 w-full border border-gray-200">
            <MousePointerClick className="w-8 h-8 text-indigo-500" />
            <span className="font-medium text-gray-800 text-center">Dashboard / Web</span>
            <span className="text-xs text-gray-500 text-center">Simulation de clic</span>
          </div>
          
          <div className="text-gray-400 rotate-90 md:rotate-0">➔</div>
          
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded shadow-sm flex-1 w-full border border-gray-200">
            <Server className="w-8 h-8 text-green-500" />
            <span className="font-medium text-gray-800 text-center">FastAPI Backend</span>
            <span className="text-xs text-gray-500 text-center">Exposition du modèle</span>
          </div>
          
          <div className="text-gray-400 rotate-90 md:rotate-0">➔</div>
          
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded shadow-sm flex-1 w-full border border-gray-200">
            <ShieldCheck className="w-8 h-8 text-red-500" />
            <span className="font-medium text-gray-800 text-center">Modèle XGBoost</span>
            <span className="text-xs text-gray-500 text-center">Scoring Temps Réel</span>
          </div>
          
          <div className="text-gray-400 rotate-90 md:rotate-0">➔</div>
          
          <div className="flex flex-col items-center gap-2 p-4 bg-white rounded shadow-sm flex-1 w-full border border-gray-200">
            <Database className="w-8 h-8 text-blue-500" />
            <span className="font-medium text-gray-800 text-center">SQLite DB</span>
            <span className="text-xs text-gray-500 text-center">Archivage des scores</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Also importing MousePointerClick to fix the missing import inside the code above.
import { MousePointerClick } from 'lucide-react';
