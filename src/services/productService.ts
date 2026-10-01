import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Product, ProductFilterMode } from '../types';
import { INITIAL_PRODUCTS } from '../firebase/seedData';

const PRODUCTS_COLLECTION = 'products';

export const productService = {
  async getProducts(mode: ProductFilterMode = 'all'): Promise<Product[]> {
    try {
      const snap = await getDocs(collection(db, PRODUCTS_COLLECTION));
      let products: Product[] = [];
      
      if (!snap.empty) {
        products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      } else {
        // First-run automatic hydration to Firestore
        products = INITIAL_PRODUCTS;
        // Background try seeding
        this.seedInitialProducts().catch(() => {});
      }

      // Filter by commercial mode
      if (mode === 'cash') {
        return products.filter(p => p.isCashEligible);
      } else if (mode === 'installment') {
        return products.filter(p => p.isInstallmentEligible);
      } else if (mode === 'tontine') {
        return products.filter(p => p.isTontineEligible);
      }
      return products;
    } catch (error) {
      // If error occurs, fallback to INITIAL_PRODUCTS for resilience while logging error
      console.warn('Fallback to local catalog products due to Firestore status:', error);
      let products = INITIAL_PRODUCTS;
      if (mode === 'cash') return products.filter(p => p.isCashEligible);
      if (mode === 'installment') return products.filter(p => p.isInstallmentEligible);
      if (mode === 'tontine') return products.filter(p => p.isTontineEligible);
      return products;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Product;
      }
      // Fallback
      const local = INITIAL_PRODUCTS.find(p => p.id === id);
      return local || null;
    } catch (error) {
      console.warn('Fallback product lookup:', error);
      return INITIAL_PRODUCTS.find(p => p.id === id) || null;
    }
  },

  async seedInitialProducts(): Promise<void> {
    try {
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, PRODUCTS_COLLECTION, prod.id), prod, { merge: true });
      }
    } catch (err) {
      // Non-fatal on read-only/unauthenticated initial load
      console.info('Seed info:', err);
    }
  }
};
