import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Product, ProductFilters, ProductSortOption } from '../types';
import { INITIAL_PRODUCTS } from '../firebase/seedData';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  /**
   * Fetches products from Firestore with optional filtering and sorting
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
      let products: Product[] = [];

      if (!snap.empty) {
        products = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            reference: data.reference || `PG-${d.id.substring(0, 6).toUpperCase()}`,
            name: data.name || '',
            slug: data.slug || d.id,
            categoryId: data.categoryId || '',
            categoryName: data.categoryName || '',
            brand: data.brand || '',
            model: data.model || '',
            price: Number(data.price || data.priceCash || 0),
            priceCash: Number(data.priceCash || data.price || 0),
            oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
            promotionalPrice: data.promotionalPrice ? Number(data.promotionalPrice) : undefined,
            priceInstallment: data.priceInstallment ? Number(data.priceInstallment) : undefined,
            priceTontine: data.priceTontine ? Number(data.priceTontine) : undefined,
            shortDescription: data.shortDescription || data.description || '',
            fullDescription: data.fullDescription || data.description || '',
            description: data.description || data.shortDescription || '',
            images: Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'],
            features: Array.isArray(data.features) ? data.features : [],
            stock: Number(data.stock ?? 0),
            status: data.status || (Number(data.stock) > 0 ? 'active' : 'out_of_stock'),
            isActive: Boolean(data.isActive ?? true),
            isFeatured: Boolean(data.isFeatured ?? false),
            warrantyMonths: data.warrantyMonths ? Number(data.warrantyMonths) : undefined,
            isCashEligible: Boolean(data.isCashEligible ?? true),
            isInstallmentEligible: Boolean(data.isInstallmentEligible ?? false),
            isTontineEligible: Boolean(data.isTontineEligible ?? false),
            installmentMaxMonths: data.installmentMaxMonths ? Number(data.installmentMaxMonths) : undefined,
            installmentMinDepositPercent: data.installmentMinDepositPercent ? Number(data.installmentMinDepositPercent) : undefined,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
            metadata: data.metadata || {},
          } as Product;
        });
      } else {
        // First run automatic hydration to Firestore
        products = INITIAL_PRODUCTS;
        this.seedInitialProducts().catch(() => {});
      }

      // Apply Client/Query Filters
      if (filters) {
        if (filters.categoryId) {
          products = products.filter((p) => p.categoryId === filters.categoryId);
        }

        if (filters.brand) {
          products = products.filter((p) => p.brand.toLowerCase() === filters.brand?.toLowerCase());
        }

        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase().trim();
          products = products.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.reference.toLowerCase().includes(q) ||
            p.shortDescription.toLowerCase().includes(q) ||
            p.categoryName.toLowerCase().includes(q)
          );
        }

        if (filters.commercialMode && filters.commercialMode !== 'all') {
          if (filters.commercialMode === 'cash') products = products.filter((p) => p.isCashEligible);
          if (filters.commercialMode === 'installment') products = products.filter((p) => p.isInstallmentEligible);
          if (filters.commercialMode === 'tontine') products = products.filter((p) => p.isTontineEligible);
        }

        if (filters.inStockOnly) {
          products = products.filter((p) => p.stock > 0 && p.status === 'active');
        }

        if (filters.promotionsOnly) {
          products = products.filter((p) => Boolean(p.oldPrice && p.oldPrice > p.price));
        }

        if (typeof filters.minPrice === 'number') {
          products = products.filter((p) => p.price >= filters.minPrice!);
        }

        if (typeof filters.maxPrice === 'number') {
          products = products.filter((p) => p.price <= filters.maxPrice!);
        }

        // Sorting
        products = this.sortProducts(products, filters.sortBy || 'featured');
      }

      return products;
    } catch (error) {
      console.warn('Fallback to local catalog products due to Firestore error:', error);
      let products = INITIAL_PRODUCTS;
      if (filters?.commercialMode === 'cash') return products.filter((p) => p.isCashEligible);
      if (filters?.commercialMode === 'installment') return products.filter((p) => p.isInstallmentEligible);
      if (filters?.commercialMode === 'tontine') return products.filter((p) => p.isTontineEligible);
      return products;
    }
  },

  /**
   * Sort helper
   */
  sortProducts(products: Product[], sortBy: ProductSortOption): Product[] {
    const copy = [...products];
    switch (sortBy) {
      case 'price_asc':
        return copy.sort((a, b) => a.price - b.price);
      case 'price_desc':
        return copy.sort((a, b) => b.price - a.price);
      case 'name_asc':
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case 'recent':
        return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'featured':
      default:
        return copy.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return {
          id: snap.id,
          reference: data.reference || `PG-${snap.id.substring(0, 6).toUpperCase()}`,
          name: data.name || '',
          slug: data.slug || snap.id,
          categoryId: data.categoryId || '',
          categoryName: data.categoryName || '',
          brand: data.brand || '',
          model: data.model || '',
          price: Number(data.price || data.priceCash || 0),
          priceCash: Number(data.priceCash || data.price || 0),
          oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
          promotionalPrice: data.promotionalPrice ? Number(data.promotionalPrice) : undefined,
          priceInstallment: data.priceInstallment ? Number(data.priceInstallment) : undefined,
          priceTontine: data.priceTontine ? Number(data.priceTontine) : undefined,
          shortDescription: data.shortDescription || data.description || '',
          fullDescription: data.fullDescription || data.description || '',
          description: data.description || data.shortDescription || '',
          images: Array.isArray(data.images) && data.images.length > 0
            ? data.images
            : ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'],
          features: Array.isArray(data.features) ? data.features : [],
          stock: Number(data.stock ?? 0),
          status: data.status || 'active',
          isActive: Boolean(data.isActive ?? true),
          isFeatured: Boolean(data.isFeatured ?? false),
          warrantyMonths: data.warrantyMonths ? Number(data.warrantyMonths) : undefined,
          isCashEligible: Boolean(data.isCashEligible ?? true),
          isInstallmentEligible: Boolean(data.isInstallmentEligible ?? false),
          isTontineEligible: Boolean(data.isTontineEligible ?? false),
          installmentMaxMonths: data.installmentMaxMonths ? Number(data.installmentMaxMonths) : undefined,
          installmentMinDepositPercent: data.installmentMinDepositPercent ? Number(data.installmentMinDepositPercent) : undefined,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          metadata: data.metadata || {},
        } as Product;
      }

      // Fallback
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    } catch (error) {
      console.warn('Fallback product lookup:', error);
      return INITIAL_PRODUCTS.find((p) => p.id === id) || null;
    }
  },

  /**
   * Create new product in Firestore (Admin)
   */
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `prod-${slug}-${Date.now().toString(36)}`;
    const now = new Date().toISOString();

    const newProduct: Product = {
      ...productData,
      id,
      slug,
      priceCash: productData.price, // ensure synchronicity
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, PRODUCTS_COLLECTION, id), newProduct);
      return newProduct;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PRODUCTS_COLLECTION);
    }
  },

  /**
   * Update existing product in Firestore (Admin)
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    try {
      const ref = doc(db, PRODUCTS_COLLECTION, id);
      const payload: any = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      if (typeof updates.price === 'number') {
        payload.priceCash = updates.price;
      }
      await updateDoc(ref, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${id}`);
    }
  },

  /**
   * Delete product in Firestore (Admin)
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${PRODUCTS_COLLECTION}/${id}`);
    }
  },

  /**
   * Extract distinct brand list
   */
  async getAvailableBrands(): Promise<string[]> {
    try {
      const products = await this.getProducts();
      const brandsSet = new Set<string>();
      products.forEach((p) => {
        if (p.brand) brandsSet.add(p.brand);
      });
      return Array.from(brandsSet).sort();
    } catch {
      return ['Hisense', 'Samsung', 'Midea', 'Solstar', 'LG', 'PENTA Living', 'Westpool'];
    }
  },

  /**
   * Seed / Initial Sync
   */
  async seedInitialProducts(): Promise<void> {
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod, { merge: true });
      }
    } catch (err) {
      console.info('Seed info notice:', err);
    }
  }
};
