import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User as UserIcon, 
  Search, 
  Menu, 
  Phone, 
  ShieldCheck, 
  MapPin,
  LogOut,
  MessageCircle
} from 'lucide-react';
import { useAppNavigation, AppDomain } from '../../context/AppNavigationContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SearchBar } from '../ui/SearchBar';
import { MobileMenu } from './MobileMenu';
import { PENTA_GAD_CONTACTS } from '../../utils/formatters';

export const Header: React.FC = () => {
  const { 
    activeDomain, 
    setActiveDomain, 
    searchQuery, 
    setSearchQuery, 
    setIsAuthModalOpen 
  } = useAppNavigation();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const navLinks: { domain: AppDomain; label: string; accent?: string }[] = [
    { domain: 'store', label: 'Accueil' },
    { domain: 'catalog', label: 'Catalogue' },
    { domain: 'installment', label: 'Paiement Échelonné', accent: 'Facilité' },
    { domain: 'tontine', label: 'Tontine Rotative', accent: '0%' },
    { domain: 'customer', label: 'Mon Espace' },
  ];

  const handleNavClick = (domain: AppDomain) => {
    setActiveDomain(domain);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all duration-200">
        
        {/* Top Minimal Info Bar */}
        <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3 h-3 text-[#C5A059]" />
                <span className="hidden sm:inline">Showroom & Entrepôt :</span> Abidjan, Côte d'Ivoire
              </span>
              <span className="hidden md:flex items-center gap-1 text-slate-400">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>Support : {PENTA_GAD_CONTACTS.phoneDisplay}</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3 h-3" />
                <span>Garantie constructeur & SAV certifié</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">|</span>
              <span className="text-[#C5A059] font-bold hidden sm:inline">FCFA</span>
            </div>
          </div>
        </div>

        {/* Main Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            
            {/* Left: Mobile Menu Trigger + Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 -ml-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Menu de navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div
                onClick={() => handleNavClick('store')}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center font-black text-lg border border-slate-900 group-hover:scale-105 transition-transform duration-200">
                  <span className="text-[#C5A059]">P</span>
                </div>
                <div className="leading-tight">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-950 group-hover:text-slate-800 transition-colors">
                    PENTA GAD
                  </span>
                  <span className="block text-[10px] uppercase font-bold tracking-widest text-[#9A7426]">
                    Distribution
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const isActive = activeDomain === item.domain;
                return (
                  <button
                    key={item.domain}
                    onClick={() => handleNavClick(item.domain)}
                    className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 ${
                      isActive
                        ? 'text-slate-950 bg-slate-100/90'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.accent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FBF7EE] text-[#9A7426] border border-[#E8DAB7]">
                        {item.accent}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-xs xl:max-w-sm">
              <SearchBar
                value={searchQuery}
                onChange={(q) => {
                  setSearchQuery(q);
                  if (activeDomain !== 'store') setActiveDomain('store');
                }}
                className="w-full"
              />
            </div>

            {/* Right: Actions (Cart & Auth) */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              
              {/* Mobile Search Toggle */}
              <button
                type="button"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-950 rounded-xl hover:bg-slate-100"
                aria-label="Recherche"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center gap-2 px-3 py-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors duration-150"
                aria-label="Panier d'achat"
              >
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 text-slate-800" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-slate-950 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center shadow-xs">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-semibold text-xs text-slate-800">Panier</span>
              </button>

              {/* User Account / Auth */}
              {user ? (
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
                  <button
                    onClick={() => handleNavClick('customer')}
                    className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-slate-800 hover:text-slate-950"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-[11px] uppercase">
                      {user.displayName ? user.displayName.charAt(0) : 'U'}
                    </div>
                    <span className="hidden md:inline max-w-[100px] truncate text-xs font-semibold">
                      {user.displayName?.split(' ')[0] || 'Compte'}
                    </span>
                  </button>
                  <button
                    onClick={() => logout()}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Déconnexion"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span className="hidden sm:inline">Connexion</span>
                </button>
              )}
            </div>

          </div>

          {/* Expandable Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="md:hidden pb-3 pt-1 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
              <SearchBar
                value={searchQuery}
                onChange={(q) => {
                  setSearchQuery(q);
                  if (activeDomain !== 'store') setActiveDomain('store');
                }}
                className="w-full"
              />
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slide-Out Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};
