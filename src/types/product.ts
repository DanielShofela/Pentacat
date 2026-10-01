export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  model?: string;
  priceCash: number; // Prix achat comptant / classique (FCFA)
  priceInstallment?: number; // Prix de référence pour crédit échelonné (FCFA)
  priceTontine?: number; // Valeur cible de référence en tontine (FCFA)
  stock: number;
  images: string[];
  features?: string[];
  warrantyMonths?: number;
  
  // Eligibilités pour les 3 systèmes commerciaux de PENTA GAD
  isCashEligible: boolean;
  isInstallmentEligible: boolean;
  isTontineEligible: boolean;

  // Paramètres par défaut de paiement échelonné si éligible
  installmentMaxMonths?: number; // ex: 3, 6, 9 mois
  installmentMinDepositPercent?: number; // ex: 20%, 30% d'acompte initial

  isActive: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProductFilterMode = 'all' | 'cash' | 'installment' | 'tontine';
