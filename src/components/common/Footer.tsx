import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RefreshCcw, 
  CreditCard,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { PENTA_GAD_CONTACTS } from '../../utils/formatters';

export const Footer: React.FC = () => {
  const { setActiveDomain } = useAppNavigation();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      {/* Guarantees & Value Propositions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Garantie & SAV Certifié</h4>
              <p className="text-xs text-slate-400 mt-0.5">Produits neufs d'origine avec garantie constructeur de 1 à 3 ans.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Facilités de Paiement</h4>
              <p className="text-xs text-slate-400 mt-0.5">Achat comptant, paiement échelonné ou tontine rotative selon vos besoins.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Livraison Abidjan & Intérieur</h4>
              <p className="text-xs text-slate-400 mt-0.5">Livraison rapide à domicile et expédition sécurisée dans toute la Côte d'Ivoire.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Tontine Transparente</h4>
              <p className="text-xs text-slate-400 mt-0.5">Groupes rotatifs d'épargne supervisés avec contrat et remise garantie.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand & Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-white font-black text-lg shadow-md">
                P
              </div>
              <span className="font-bold text-lg text-white">PENTA GAD Distribution</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Entreprise ivoirienne de référence pour la distribution et la vente d'équipements pour la maison : électroménager, téléviseurs, climatisation, mobilier et confort moderne.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{PENTA_GAD_CONTACTS.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{PENTA_GAD_CONTACTS.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Nos 3 Systèmes Commerciaux */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">Nos 3 Systèmes</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => setActiveDomain('store')}
                  className="hover:text-white transition-colors text-left"
                >
                  Achat Classique Direct
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveDomain('installment')}
                  className="hover:text-white transition-colors text-left"
                >
                  Paiement Échelonné (Crédit)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveDomain('tontine')}
                  className="hover:text-white transition-colors text-left"
                >
                  Tontine Rotative d'Équipement
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveDomain('customer')}
                  className="hover:text-white transition-colors text-left"
                >
                  Suivi des contrats & cotisations
                </button>
              </li>
            </ul>
          </div>

          {/* Catégories de produits */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">Rayons & Produits</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><span className="hover:text-white cursor-pointer" onClick={() => setActiveDomain('store')}>Gros Électroménager</span></li>
              <li><span className="hover:text-white cursor-pointer" onClick={() => setActiveDomain('store')}>Téléviseurs & Smart TV</span></li>
              <li><span className="hover:text-white cursor-pointer" onClick={() => setActiveDomain('store')}>Climatisation Inverter</span></li>
              <li><span className="hover:text-white cursor-pointer" onClick={() => setActiveDomain('store')}>Mobilier & Salons</span></li>
              <li><span className="hover:text-white cursor-pointer" onClick={() => setActiveDomain('store')}>Équipements de Cuisine</span></li>
            </ul>
          </div>

          {/* Contact Direct & WhatsApp */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">Service Client</h5>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{PENTA_GAD_CONTACTS.phoneDisplay}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>{PENTA_GAD_CONTACTS.email}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/2250700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Écrire sur WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>© {new Date().getFullYear()} PENTA GAD Distribution. Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveDomain('admin')}
            className="hover:text-slate-400 text-[11px] underline"
          >
            Portail Opérateurs & Admin
          </button>
          <span>•</span>
          <span>Abidjan - Côte d'Ivoire</span>
        </div>
      </div>
    </footer>
  );
};
