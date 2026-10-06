import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Package, 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  FileText, 
  AlertTriangle, 
  Layers, 
  ShoppingBag, 
  Settings, 
  MessageCircle,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { tontineService } from '../../services/tontineService';
import { orderService } from '../../services/orderService';
import { installmentService } from '../../services/installmentService';
import { testConnection } from '../../firebase/config';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProductListAdmin } from '../admin/ProductListAdmin';
import { CompanySettingsAdmin } from '../admin/CompanySettingsAdmin';
import { OrderListAdmin } from '../admin/OrderListAdmin';
import { InstallmentListAdmin } from '../admin/InstallmentListAdmin';
import { TontineDashboardView } from '../tontine/TontineDashboardView';

export const AdminDashboardOverview: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'contracts' | 'tontines' | 'settings' | 'sync'>('products');
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  const [counts, setCounts] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    contracts: 0,
    tontines: 0,
  });

  const refreshCounts = async () => {
    try {
      const [prods, cats, tnts, ords, ctrs] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
        tontineService.getTontineGroups(),
        orderService.getAllOrders(),
        installmentService.getAllContracts(),
      ]);
      setCounts({
        products: prods.length,
        categories: cats.length,
        orders: ords.length,
        contracts: ctrs.length,
        tontines: tnts.length,
      });
    } catch (err) {
      console.warn('Error reading counts:', err);
    }
  };

  useEffect(() => {
    async function checkStatus() {
      const ok = await testConnection();
      setConnectionStatus(ok ? 'connected' : 'offline');
      await refreshCounts();
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
      await refreshCounts();
    } catch (err) {
      console.error('Seeding error:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8 pb-24">
      
      {/* Header */}
      <div className="p-8 bg-slate-950 text-white rounded-3xl border border-slate-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
              Console Opérateurs
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400">PENTA GAD Distribution</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
            Administration Centrale & Paramètres
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            Gestion du catalogue, commandes WhatsApp, contrats échelonnés et numéros officiels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={connectionStatus === 'connected' ? 'green' : 'slate'} dot>
            Firestore {connectionStatus === 'connected' ? 'Opérationnel' : 'Hors-ligne'}
          </Badge>
        </div>
      </div>

      {/* Admin Notice */}
      <div className={`p-5 rounded-2xl border text-xs flex items-start gap-3.5 ${
        isAdmin 
          ? 'bg-slate-50 border-slate-200 text-slate-900' 
          : 'bg-[#FBF7EE] border-[#E8DAB7] text-[#9A7426]'
      }`}>
        {isAdmin ? (
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <p className="font-bold text-slate-900">
            {isAdmin 
              ? 'Administrateur connecté (pentagad.distribution@gmail.com)' 
              : 'Accès Opérateur Standard'}
          </p>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            {isAdmin
              ? 'Droits complets d\'administration : création produits, validation des paiements échelonnés, livraisons et numéro WhatsApp.'
              : 'Pour administrer l\'ensemble des paramètres et collections, connectez-vous avec l\'adresse pentagad.distribution@gmail.com.'}
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <button
          onClick={() => setActiveTab('products')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'products'
              ? 'bg-white border-slate-950 shadow-xs ring-1 ring-slate-950'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Produits</span>
            <Package className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-black text-slate-950 tracking-tight">{counts.products}</div>
          <p className="text-[10px] text-slate-400 mt-1">Catalogue actif</p>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'orders'
              ? 'bg-white border-slate-950 shadow-xs ring-1 ring-slate-950'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Commandes</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-950 tracking-tight">{counts.orders}</div>
          <p className="text-[10px] text-slate-400 mt-1">Achats WhatsApp</p>
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'contracts'
              ? 'bg-white border-slate-950 shadow-xs ring-1 ring-slate-950'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Contrats</span>
            <CreditCard className="w-4 h-4 text-[#C5A059]" />
          </div>
          <div className="text-2xl font-black text-slate-950 tracking-tight">{counts.contracts}</div>
          <p className="text-[10px] text-slate-400 mt-1">Paiements échelonnés</p>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeTab === 'settings'
              ? 'bg-white border-slate-950 shadow-xs ring-1 ring-slate-950'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">WhatsApp</span>
            <MessageCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 truncate tracking-tight">Paramètres</div>
          <p className="text-[10px] text-slate-400 mt-1">Numéro +225 & infos</p>
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`p-4 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
            activeTab === 'sync'
              ? 'bg-white border-slate-950 shadow-xs ring-1 ring-slate-950'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Firestore</span>
            <Database className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xs font-bold text-slate-900 tracking-tight">Synchronisation</div>
          <p className="text-[10px] text-slate-400 mt-1">Données initiales</p>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200/80 space-x-1 sm:space-x-4 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Gestion du Catalogue ({counts.products})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Commandes Directes ({counts.orders})
        </button>

        <button
          onClick={() => setActiveTab('contracts')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'contracts'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Contrats Échelonnés ({counts.contracts})
        </button>

        <button
          onClick={() => setActiveTab('tontines')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'tontines'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Tontines Rotatives ({counts.tontines})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Configuration Entreprise & WhatsApp
        </button>

        <button
          onClick={() => setActiveTab('sync')}
          className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sync'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Base de Référence & Firestore
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'products' && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
          <ProductListAdmin />
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
          <OrderListAdmin />
        </div>
      )}

      {activeTab === 'contracts' && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
          <InstallmentListAdmin />
        </div>
      )}

      {activeTab === 'tontines' && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
          <TontineDashboardView isAdmin={true} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-2xs">
          <CompanySettingsAdmin />
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#C5A059]" />
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Catalogue de Référence</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Synchronisez ou rechargez les données d'équipements PENTA GAD (réfrigérateurs Hisense, téléviseurs Samsung UHD, climatiseurs Midea, salons, machines à laver) dans Firestore.
            </p>

            {seedSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Base Firestore synchronisée avec succès !</span>
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              isLoading={seeding}
              onClick={handleSeedDatabase}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-700" />}
            >
              Synchroniser les données avec Firestore
            </Button>
          </div>

          <div className="p-6 sm:p-8 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-700" />
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Charte & Principes UI</h3>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>• Identité visuelle PENTA GAD : Bleu profond, blanc épuré et accents dorés.</p>
              <p>• Clarté & Sobriété : Espaces généreux, zéro animation superflue, typographie Jakarta Sans.</p>
              <p>• Sécurité des données : Commandes, contrats et versements certifiés côté serveur.</p>
              <p>• Numéro WhatsApp centralisé : <strong>+225 07 03 39 79 21</strong>.</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
