import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  Phone, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  Users, 
  Store, 
  Settings,
  MapPin,
  LogOut
} from 'lucide-react';
import { useAppNavigation, AppDomain } from '../../context/AppNavigationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PENTA_GAD_CONTACTS } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { 
    activeDomain, 
    setActiveDomain, 
    searchQuery, 
    setSearchQuery, 
    setIsAuthModalOpen,
    setSelectedCategoryId 
  } = useAppNavigation();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { domain: AppDomain; label: string; icon: React.ReactNode; badge?: string }[] = [
    { domain: 'store', label: 'Achat Classique', icon: <Store className="w-4 h-4" /> },
    { domain: 'installment', label: 'Paiement Échelonné', icon: <CreditCard className="w-4 h-4" />, badge: 'Facilité' },
    { domain: 'tontine', label: 'Tontine Rotative', icon: <Users className="w-4 h-4" />, badge: 'Populaire' },
    { domain: 'customer', label: 'Espace Client', icon: <UserIcon className="w-4 h-4" /> },
    { domain: 'admin', label: 'Administration', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (domain: AppDomain) => {
    setActiveDomain(domain);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      {/* Top Banner - Ivory Coast Contact & Trust */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Abidjan, Côte d'Ivoire</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Support : {PENTA_GAD_CONTACTS.phoneDisplay}</span>
            </span>
            <span className="hidden md:flex items-center gap-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{PENTA_GAD_CONTACTS.openingHours}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantie constructeur & SAV officiel</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-semibold">Devise : FCFA</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('store')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">PENTA GAD</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">CI</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 tracking-wider uppercase">Distribution & Équipements</p>
            </div>
          </div>

          {/* Search Bar (Store mode) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher électroménager, TV, split, mobilier..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeDomain !== 'store') setActiveDomain('store');
                }}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions (Cart & Auth) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Voir mon panier"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-xs animate-pulse">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-semibold text-sm">Panier</span>
            </button>

            {/* Auth / Profile button */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg">
                <button
                  onClick={() => handleNavClick('customer')}
                  className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-800 hover:text-amber-600"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{user.displayName || 'Mon compte'}</span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                  title="Déconnexion"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs"
              >
                <UserIcon className="w-4 h-4 text-amber-400" />
                <span>Connexion</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mt-2 pt-2 border-t border-slate-100">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher électroménager, TV, mobilier..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeDomain !== 'store') setActiveDomain('store');
              }}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Domain Navigation Bar (Desktop) */}
      <nav className="hidden lg:block bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = activeDomain === item.domain;
                return (
                  <button
                    key={item.domain}
                    onClick={() => handleNavClick(item.domain)}
                    className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'text-amber-700 bg-white font-semibold border-b-2 border-amber-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className={isActive ? 'text-amber-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick WhatsApp helper button */}
            <a
              href={`https://wa.me/2250700000000?text=${encodeURIComponent('Bonjour PENTA GAD Distribution, je souhaite des renseignements sur vos produits et modalités.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Assistance WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-150">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
            Modes d'achat & Services
          </div>
          {navItems.map((item) => {
            const isActive = activeDomain === item.domain;
            return (
              <button
                key={item.domain}
                onClick={() => handleNavClick(item.domain)}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-amber-50 text-amber-800 font-semibold border border-amber-200'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-600' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 border-t border-slate-100">
            <a
              href="https://wa.me/2250700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-xs shadow-xs"
            >
              <span>Contacter un conseiller WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
