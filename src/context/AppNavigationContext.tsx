import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, TontineGroup } from '../types';

export type AppDomain = 'store' | 'catalog' | 'installment' | 'tontine' | 'customer' | 'admin';

interface AppNavigationContextType {
  activeDomain: AppDomain;
  setActiveDomain: (domain: AppDomain) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeProductModal: Product | null;
  setActiveProductModal: (product: Product | null) => void;
  selectedProductDetail: Product | null;
  setSelectedProductDetail: (product: Product | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCheckoutModalOpen: boolean;
  setIsCheckoutModalOpen: (open: boolean) => void;
  selectedInstallmentProduct: Product | null;
  setSelectedInstallmentProduct: (product: Product | null) => void;
  selectedTontineGroup: TontineGroup | null;
  setSelectedTontineGroup: (group: TontineGroup | null) => void;
}

const AppNavigationContext = createContext<AppNavigationContextType | undefined>(undefined);

export const AppNavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialDomain = (): AppDomain => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('mon-espace') || hash.includes('mon-espace')) return 'customer';
      if (path.includes('catalogue') || hash.includes('catalogue')) return 'catalog';
      if (path.includes('echelonne') || hash.includes('echelonne')) return 'installment';
      if (path.includes('tontine') || hash.includes('tontine')) return 'tontine';
      if (path.includes('admin') || hash.includes('admin')) return 'admin';
    }
    return 'store';
  };

  const [activeDomain, setActiveDomainState] = useState<AppDomain>(getInitialDomain);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedInstallmentProduct, setSelectedInstallmentProduct] = useState<Product | null>(null);
  const [selectedTontineGroup, setSelectedTontineGroup] = useState<TontineGroup | null>(null);

  const setActiveDomain = (domain: AppDomain) => {
    setActiveDomainState(domain);
    if (typeof window !== 'undefined') {
      if (domain === 'customer') {
        window.history.replaceState(null, '', '/mon-espace');
      } else if (domain === 'store') {
        window.history.replaceState(null, '', '/');
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('mon-espace') || hash.includes('mon-espace')) {
        setActiveDomainState('customer');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  return (
    <AppNavigationContext.Provider
      value={{
        activeDomain,
        setActiveDomain,
        selectedCategoryId,
        setSelectedCategoryId,
        searchQuery,
        setSearchQuery,
        activeProductModal,
        setActiveProductModal,
        selectedProductDetail,
        setSelectedProductDetail,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCheckoutModalOpen,
        setIsCheckoutModalOpen,
        selectedInstallmentProduct,
        setSelectedInstallmentProduct,
        selectedTontineGroup,
        setSelectedTontineGroup,
      }}
    >
      {children}
    </AppNavigationContext.Provider>
  );
};

export function useAppNavigation() {
  const context = useContext(AppNavigationContext);
  if (!context) {
    throw new Error('useAppNavigation must be used within an AppNavigationProvider');
  }
  return context;
}
