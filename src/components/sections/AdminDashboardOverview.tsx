import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Package, 
  ShoppingBag, 
  CreditCard, 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  FileText,
  AlertTriangle,
  Activity,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { tontineService } from '../../services/tontineService';
import { testConnection } from '../../firebase/config';

export const AdminDashboardOverview: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'offline'>('checking');
  
  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    tontines: 0,
  });

  useEffect(() => {
    async function checkStatus() {
      const ok = await testConnection();
      setConnectionStatus(ok ? 'connected' : 'offline');

      try {
        const [prods, cats, tnts] = await Promise.all([
          productService.getProducts(),
          categoryService.getCategories(),
          tontineService.getTontineGroups(),
        ]);
        setCounts({
          products: prods.length,
          categories: cats.length,
          tontines: tnts.length,
        });
      } catch (err) {
        console.warn('Error reading counts:', err);
      }
    }
    checkStatus();
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await Promise.all([
        productService.seedInitialProducts(),
        categoryService.seedInitialCategories(),
        tontineService.seedInitialGroups(),
      ]);
      setSeedSuccess(true);
      const [prods, cats, tnts] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
        tontineService.getTontineGroups(),
      ]);
      setCounts({
        products: prods.length,
        categories: cats.length,
        tontines: tnts.length,
      });
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-20">
      
      {/* Admin Header */}
      <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400 font-bold text-xs uppercase">
              Supervision
            </span>
            <span className="text-xs text-slate-400">• PENTA GAD Distribution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1">Console d'Administration & Métriques</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Architecture centrale Firestore, synchronisation des données et gestion multi-systèmes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 rounded-xl text-xs border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>Firestore : {connectionStatus === 'connected' ? 'Connecté' : 'En veille'}</span>
          </div>
        </div>
      </div>

      {/* Admin Privilege Notification */}
      <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
        isAdmin 
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        {isAdmin ? (
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="font-bold">
            {isAdmin 
              ? 'Session Administrateur active (pentagad.distribution@gmail.com)' 
              : 'Mode consultation opérateur'}
          </p>
          <p className="text-[11px] leading-relaxed">
            {isAdmin 
              ? 'Vous disposez des droits complets d\'écriture et de gestion sur l\'ensemble des collections Firestore (produits, contrats, tontines, utilisateurs).'
              : 'Pour bénéficier des privilèges d\'administration complets, connectez-vous avec le compte administrateur officiel pentagad.distribution@gmail.com.'}
          </p>
        </div>
      </div>

      {/* Live System Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Catalogue Produits</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.products}</div>
          <p className="text-[11px] text-slate-500">Références actives prêtes pour achat, crédit ou tontine</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Rayons & Catégories</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.categories}</div>
          <p className="text-[11px] text-slate-500">Électroménager, TV, Climatisation, Mobilier...</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Groupes de Tontine</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{counts.tontines}</div>
          <p className="text-[11px] text-slate-500">Formules rotatives d'épargne avec suivi des cycles</p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Système Commercial</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">3 en 1</div>
          <p className="text-[11px] text-slate-500">Comptant • Échelonné • Tontine unifiés</p>
        </div>

      </div>

      {/* Database Management & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Hydration / Sync Action Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">Initialisation & Données de Démonstration</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Synchronisez le catalogue initial des équipements PENTA GAD (réfrigérateurs Hisense, Smart TV Samsung, climatiseurs Midea, salons d'angle, cuisinières) et les groupes de tontine dans Firestore.
          </p>

          {seedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Base Firestore synchronisée avec succès !</span>
            </div>
          )}

          <button
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Synchronisation en cours...' : 'Synchroniser / Réinitialiser le catalogue Firestore'}</span>
          </button>
        </div>

        {/* Next Steps / Architecture Roadmap */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-base text-slate-900">Architecture Établie & Prochaines Étapes</h3>
          </div>

          <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <p className="font-semibold text-slate-800">
              ✓ Étape 1 complétée avec succès :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Modèles de données Firestore complets (13 entités déclarées et typées).</li>
              <li>Règles de sécurité Firestore Zero-Trust déployées.</li>
              <li>Catalogue unifié pour les 3 systèmes (Achat, Échelonné, Tontine).</li>
              <li>Panier local sans compte obligatoire + génération de commande WhatsApp.</li>
              <li>Authentication Google Firebase avec profil client synchronisé.</li>
            </ul>

            <p className="font-semibold text-slate-800 pt-2">
              → Prochaines étapes planifiées :
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500">
              <li>Workflow avancé d'approbation et signature électronique des contrats d'échelonnement.</li>
              <li>Moteur d'automatisation des tirages au sort pour les tontines rotatives.</li>
              <li>Passerelle de paiement en ligne (API Wave, Orange Money, MTN MoMo).</li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
