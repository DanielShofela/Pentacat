import { collection, doc, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { TontineGroup, TontineMember } from '../types';
import { INITIAL_TONTINE_GROUPS } from '../firebase/seedData';

const GROUPS_COLLECTION = 'tontineGroups';
const MEMBERS_COLLECTION = 'tontineMembers';

export const tontineService = {
  async getTontineGroups(): Promise<TontineGroup[]> {
    try {
      const snap = await getDocs(collection(db, GROUPS_COLLECTION));
      if (!snap.empty) {
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineGroup));
      }
      this.seedInitialGroups().catch(() => {});
      return INITIAL_TONTINE_GROUPS;
    } catch (error) {
      console.warn('Fallback to local tontine groups:', error);
      return INITIAL_TONTINE_GROUPS;
    }
  },

  async getGroupById(groupId: string): Promise<TontineGroup | null> {
    try {
      const snap = await getDoc(doc(db, GROUPS_COLLECTION, groupId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as TontineGroup;
      }
      return INITIAL_TONTINE_GROUPS.find(g => g.id === groupId) || null;
    } catch (error) {
      console.warn('Fallback tontine lookup:', error);
      return INITIAL_TONTINE_GROUPS.find(g => g.id === groupId) || null;
    }
  },

  async joinTontineGroup(params: {
    groupId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
  }): Promise<TontineMember> {
    const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const group = await this.getGroupById(params.groupId);
    const assignedPosition = (group?.filledPositions || 0) + 1;

    const member: TontineMember = {
      id,
      groupId: params.groupId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      assignedPosition,
      joinedAt: new Date().toISOString(),
      hasReceivedDelivery: false,
      status: 'pending',
    };

    try {
      await setDoc(doc(db, MEMBERS_COLLECTION, id), member);
      return member;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, MEMBERS_COLLECTION);
    }
  },

  async getCustomerMemberships(customerId: string): Promise<TontineMember[]> {
    try {
      const q = query(collection(db, MEMBERS_COLLECTION), where('customerId', '==', customerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineMember));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, MEMBERS_COLLECTION);
    }
  },

  async seedInitialGroups(): Promise<void> {
    try {
      for (const grp of INITIAL_TONTINE_GROUPS) {
        await setDoc(doc(db, GROUPS_COLLECTION, grp.id), grp, { merge: true });
      }
    } catch (err) {
      console.info('Seed tontine note:', err);
    }
  }
};
