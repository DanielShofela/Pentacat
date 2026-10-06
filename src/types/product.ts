export type ProductStatus = 'active' | 'out_of_stock' | 'discontinued' | 'draft';

export interface Product {
  id: string;
  reference: string; // Ex: PG-REF-1001
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  model?: string;

  // Tarification
  price: number; // Prix courant / comptant (FCFA)
  priceCash: number; // Alias pour compatibilité
  oldPrice?: number; // Ancien prix barré (FCFA)
  promotionalPrice?: number; // Prix promotionnel si actif (FCFA)
  priceInstallment?: number; // Prix de référence pour crédit échelonné (FCFA)
  priceTontine?: number; // Valeur cible en tontine (FCFA)

  // Descriptions & Médias
  shortDescription: string;
  fullDescription: string;
  description?: string; // Alias pour compatibilité
  images: string[]; // Galerie (la 1ère est l'image principale)
  features: string[]; // Caractéristiques techniques

  // Stock & Statut
  stock: number;
  status: ProductStatus;
  isActive: boolean; // Alias compatibilité
  isFeatured: boolean; // Produit vedette / sélection
  warrantyMonths?: number;

  // Eligibilités aux 3 systèmes commerciaux PENTA GAD
  isCashEligible: boolean;
  isInstallmentEligible: boolean;
  isTontineEligible: boolean;

  // Paramètres d'échelonnement si éligible
  installmentMaxMonths?: number; // ex: 3, 6, 8 mois
  installmentMinDepositPercent?: number; // ex: 25%

  // Dates
  createdAt: string;
  updatedAt: string;

  // Extensibilité libre pour champs futurs
  metadata?: Record<string, string | number | boolean | null>;
}

export type ProductFilterMode = 'all' | 'cash' | 'installment' | 'tontine';

export type ProductSortOption = 
  | 'featured' 
  | 'recent' 
  | 'price_asc' 
  | 'price_desc' 
  | 'name_asc';

export interface ProductFilters {
  categoryId?: string | null;
  brand?: string | null;
  searchQuery?: string;
  commercialMode?: ProductFilterMode;
  inStockOnly?: boolean;
  promotionsOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSortOption;
}
