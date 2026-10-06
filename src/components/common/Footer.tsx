import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  CreditCard,
  MessageCircle,
  Clock
} from 'lucide-react';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { PENTA_GAD_CONTACTS } from '../../utils/formatters';
import { companySettingsService } from '../../services/companySettingsService';

export const Footer: React.FC = () => {
  const { setActiveDomain } = useAppNavigation();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      
      {/* 4 Pillars of Trust */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 border-b border-slate-900">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 text-[#C5A059] border border-slate-800 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight">Garantie & SAV Certifié</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Appareils neufs avec garantie constructeur officielle de 1 à 3 ans.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight">3 Formules d'Acquisition</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Achat comptant direct, paiement échelonné ou tontine rotative à 0% d'intérêt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 border border-slate-800 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight">Livraison Abidjan & Intérieur</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Acheminement rapide à domicile et expéditions régionales sécurisées.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight">Service Commercial Dédié</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Conseillers disponibles par WhatsApp et téléphone du lundi au samedi.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Presentation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-extrabold text-sm">
                <span className="text-[#9A7426]">P</span>
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                PENTA GAD Distribution
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Distributeur d'équipements pour la maison en Côte d'Ivoire : gros électroménager, téléviseurs 4K, climatisation inverter et mobilier moderne.
            </p>
            <div className="pt-1 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
                <span>{PENTA_GAD_CONTACTS.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{PENTA_GAD_CONTACTS.openingHours}</span>
              </div>
            </div>
          </div>

          {/* Solutions & Formules */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Nos Formules</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActiveDomain('store')}
                  className="hover:text-white transition-colors text-left"
                >
                  Achat Direct (Comptant)
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
                  Espace & Suivi Client
                </button>
              </li>
            </ul>
          </div>

          {/* Rayons */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Rayons Principaux</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setActiveDomain('store')} className="hover:text-white transition-colors text-left">
                  Gros Électroménager
                </button>
              </li>
              <li>
                <button onClick={() => setActiveDomain('store')} className="hover:text-white transition-colors text-left">
                  Smart TV & Son UHD
                </button>
              </li>
              <li>
                <button onClick={() => setActiveDomain('store')} className="hover:text-white transition-colors text-left">
                  Climatisation Inverter
                </button>
              </li>
              <li>
                <button onClick={() => setActiveDomain('store')} className="hover:text-white transition-colors text-left">
                  Mobilier & Salons
                </button>
              </li>
            </ul>
          </div>

          {/* WhatsApp Direct CTA */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-200">Service Commercial</h5>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{PENTA_GAD_CONTACTS.phoneDisplay}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{PENTA_GAD_CONTACTS.email}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={companySettingsService.buildWhatsAppUrl("Bonjour PENTA GAD Distribution, je souhaite vous contacter pour une commande.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Commander sur WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal / Minimal bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
        <p>© {new Date().getFullYear()} PENTA GAD Distribution. Tous droits réservés.</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveDomain('admin')}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Console Administrateur
          </button>
          <span>·</span>
          <span>Abidjan, Côte d'Ivoire</span>
        </div>
      </div>

    </footer>
  );
};
