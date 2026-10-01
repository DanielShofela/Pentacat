import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Category } from '../types';
import { INITIAL_CATEGORIES } from '../firebase/seedData';

const CATEGORIES_COLLECTION = 'categories';

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(db, CATEGORIES_COLLECTION));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category))
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      }
      this.seedInitialCategories().catch(() => {});
      return INITIAL_CATEGORIES;
    } catch (error) {
      console.warn('Fallback to local categories:', error);
      return INITIAL_CATEGORIES;
    }
  },

  async seedInitialCategories(): Promise<void> {
    try {
      for (const cat of INITIAL_CATEGORIES) {
        await setDoc(doc(db, CATEGORIES_COLLECTION, cat.id), cat, { merge: true });
      }
    } catch (err) {
      console.info('Seed categories note:', err);
    }
  }
};
