import React from 'react';
import { X, Store, CreditCard, Users, User, Settings, Phone, MessageCircle, ShieldCheck, MapPin } from 'lucide-react';
import { useAppNavigation, AppDomain } from '../../context/AppNavigationContext';
import { useAuth } from '../../context/AuthContext';
import { PENTA_GAD_CONTACTS } from '../../utils/formatters';
import { companySettingsService } from '../../services/companySettingsService';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { activeDomain, setActiveDomain, setIsAuthModalOpen } = useAppNavigation();
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  const handleSelectDomain = (domain: AppDomain) => {
    setActiveDomain(domain);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems: { domain: AppDomain; label: string; icon: React.ReactNode; tag?: string }[] = [
    { domain: 'store', label: 'Accueil', icon: <Store className="w-4 h-4" /> },
    { domain: 'catalog', label: 'Catalogue Produits', icon: <Store className="w-4 h-4" /> },
    { domain: 'installment', label: 'Paiement Échelonné', icon: <CreditCard className="w-4 h-4" />, tag: 'Crédit' },
    { domain: 'tontine', label: 'Tontine Rotative', icon: <Users className="w-4 h-4" />, tag: '0%' },
    { domain: 'customer', label: 'Espace Client', icon: <User className="w-4 h-4" /> },
    { domain: 'admin', label: 'Console Opérateurs', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-extrabold text-sm border border-slate-800">
              P
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm tracking-tight">PENTA GAD</span>
              <p className="text-[10px] text-slate-400 font-medium">Distribution • CI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card if logged in */}
        {user ? (
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-900 block truncate">
                {user.displayName || 'Mon Compte'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">{user.email}</span>
            </div>
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-[11px] text-slate-500 hover:text-rose-600 font-semibold"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Se connecter</span>
            </button>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
            Navigation
          </span>
          {navItems.map((item) => {
            const isActive = activeDomain === item.domain;
            return (
              <button
                key={item.domain}
                onClick={() => handleSelectDomain(item.domain)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#C5A059]' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.tag && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Support */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="space-y-1 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Abidjan, Côte d'Ivoire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{PENTA_GAD_CONTACTS.phoneDisplay}</span>
            </div>
          </div>

          <a
            href={companySettingsService.buildWhatsAppUrl("Bonjour PENTA GAD Distribution, je souhaite une assistance.")}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Assistance WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
};
