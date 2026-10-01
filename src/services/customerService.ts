import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Customer } from '../types';

const CUSTOMERS_COLLECTION = 'customers';

export const customerService = {
  async getCustomer(uid: string): Promise<Customer | null> {
    try {
      const snap = await getDoc(doc(db, CUSTOMERS_COLLECTION, uid));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Customer;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${CUSTOMERS_COLLECTION}/${uid}`);
    }
  },

  async syncCustomerProfile(user: { uid: string; email?: string | null; displayName?: string | null; phoneNumber?: string | null }): Promise<Customer> {
    try {
      const existing = await this.getCustomer(user.uid);
      if (existing) {
        return existing;
      }
      const newCustomer: Customer = {
        id: user.uid,
        uid: user.uid,
        fullName: user.displayName || 'Client PENTA GAD',
        email: user.email || '',
        phone: user.phoneNumber || '',
        city: 'Abidjan',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, CUSTOMERS_COLLECTION, user.uid), newCustomer);
      return newCustomer;
    } catch (error) {
      console.warn('Customer profile sync notice:', error);
      return {
        id: user.uid,
        uid: user.uid,
        fullName: user.displayName || 'Client PENTA GAD',
        email: user.email || '',
        phone: user.phoneNumber || '',
        city: 'Abidjan',
        createdAt: new Date().toISOString(),
      };
    }
  },

  async updateCustomer(uid: string, updates: Partial<Customer>): Promise<void> {
    try {
      await setDoc(doc(db, CUSTOMERS_COLLECTION, uid), { ...updates, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${CUSTOMERS_COLLECTION}/${uid}`);
    }
  }
};
