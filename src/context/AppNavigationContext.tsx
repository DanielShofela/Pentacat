import React, { createContext, useContext, useState } from 'react';
import { Product, TontineGroup } from '../types';

export type AppDomain = 'store' | 'installment' | 'tontine' | 'customer' | 'admin';

interface AppNavigationContextType {
  activeDomain: AppDomain;
  setActiveDomain: (domain: AppDomain) => void;
  selectedCategoryId: string | null;
  setSelectedCategoryId: (categoryId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeProductModal: Product | null;
  setActiveProductModal: (product: Product | null) => void;
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
  const [activeDomain, setActiveDomain] = useState<AppDomain>('store');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeProductModal, setActiveProductModal] = useState<Product | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedInstallmentProduct, setSelectedInstallmentProduct] = useState<Product | null>(null);
  const [selectedTontineGroup, setSelectedTontineGroup] = useState<TontineGroup | null>(null);

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
