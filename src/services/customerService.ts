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
      const displayName = user.displayName || 'Client PENTA GAD';
      const phone = user.phoneNumber || '';
      const newCustomer: Customer = {
        id: user.uid,
        uid: user.uid,
        nom: displayName,
        fullName: displayName,
        email: user.email || '',
        téléphone: phone,
        phone: phone,
        whatsapp: phone,
        whatsappNumber: phone,
        commune: 'Cocody',
        adresse: 'Abidjan',
        address: 'Abidjan',
        city: 'Abidjan',
        statut: 'active',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, CUSTOMERS_COLLECTION, user.uid), newCustomer);
      return newCustomer;
    } catch (error) {
      console.warn('Customer profile sync notice:', error);
      const displayName = user.displayName || 'Client PENTA GAD';
      return {
        id: user.uid,
        uid: user.uid,
        nom: displayName,
        fullName: displayName,
        email: user.email || '',
        téléphone: user.phoneNumber || '',
        phone: user.phoneNumber || '',
        whatsapp: user.phoneNumber || '',
        whatsappNumber: user.phoneNumber || '',
        commune: 'Cocody',
        adresse: 'Abidjan',
        address: 'Abidjan',
        city: 'Abidjan',
        statut: 'active',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    }
  },

  async updateCustomer(uid: string, updates: Partial<Customer>): Promise<void> {
    try {
      const sanitizedUpdates: Partial<Customer> = { ...updates };
      if (updates.nom && !updates.fullName) sanitizedUpdates.fullName = updates.nom;
      if (updates.fullName && !updates.nom) sanitizedUpdates.nom = updates.fullName;
      if (updates.phone && !updates.téléphone) sanitizedUpdates.téléphone = updates.phone;
      if (updates.téléphone && !updates.phone) sanitizedUpdates.phone = updates.téléphone;
      if (updates.whatsapp && !updates.whatsappNumber) sanitizedUpdates.whatsappNumber = updates.whatsapp;
      if (updates.adresse && !updates.address) sanitizedUpdates.address = updates.adresse;

      await setDoc(doc(db, CUSTOMERS_COLLECTION, uid), { 
        ...sanitizedUpdates, 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${CUSTOMERS_COLLECTION}/${uid}`);
    }
  }
};
