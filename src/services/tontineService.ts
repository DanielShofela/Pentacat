import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  getDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { 
  TontineGroup, 
  TontineMember, 
  TontineRotation, 
  TontineContribution,
  TontineContributionType,
  TontineDeliveryStatus,
  Product
} from '../types';

const GROUPS_COLLECTION = 'tontineGroups';
const MEMBERS_COLLECTION = 'tontineMembers';
const ROTATIONS_COLLECTION = 'tontineRotations';
const CONTRIBUTIONS_COLLECTION = 'tontineContributions';

export const tontineService = {
  /**
   * Generates a stable, incremental group code (e.g., TG-001, TG-002, TG-003)
   * that is never re-used.
   */
  async generateNextGroupCode(): Promise<string> {
    try {
      const snap = await getDocs(collection(db, GROUPS_COLLECTION));
      let maxNum = 0;
      snap.docs.forEach(d => {
        const data = d.data();
        const code = data.groupCode || data.code || '';
        const match = code.match(/TG-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      return `TG-${String(nextNum).padStart(3, '0')}`;
    } catch (err) {
      console.warn('Error computing next group code:', err);
      return `TG-001`;
    }
  },

  /**
   * Creates a new tontine group with fully configurable parameters.
   */
  async createTontineGroup(params: {
    name: string;
    description?: string;
    memberCount?: number; // Default 10
    rotationPeriodDays?: number; // Default 10
    totalDurationDays?: number; // Default 110
    contributionFrequency?: 'daily' | 'per_period' | 'monthly';
    startDate?: string;
    targetProductId?: string;
    targetProductName?: string;
    targetProductPrice?: number;
    allowCustomProducts?: boolean;
  }): Promise<TontineGroup> {
    const id = `tg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const groupCode = await this.generateNextGroupCode();
    
    const memberCount = params.memberCount || 10;
    const rotationPeriodDays = params.rotationPeriodDays || 10;
    const totalDurationDays = params.totalDurationDays || 110;
    const contributionFrequency = params.contributionFrequency || 'daily';

    const now = new Date();
    const startDateObj = params.startDate ? new Date(params.startDate) : now;
    const startDate = startDateObj.toISOString();

    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + totalDurationDays);
    const endDate = endDateObj.toISOString();

    const group: TontineGroup = {
      id,
      groupCode,
      name: params.name,
      description: params.description || '',
      productId: params.targetProductId,
      targetProductName: params.targetProductName,
      targetProductPrice: params.targetProductPrice,
      allowCustomProducts: params.allowCustomProducts !== false,
      memberCount,
      rotationPeriodDays,
      totalDurationDays,
      contributionFrequency,
      startDate,
      endDate,
      status: 'open',
      currentRotationPosition: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Aliases
      code: groupCode,
      title: params.name,
      totalPositions: memberCount,
      filledPositions: 0,
      durationCycles: memberCount,
      currentCycle: 1,
    };

    try {
      await setDoc(doc(db, GROUPS_COLLECTION, id), group);
      return group;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, GROUPS_COLLECTION);
    }
  },

  /**
   * Adds a member to a tontine group with a STRICTLY UNIQUE position (1..memberCount).
   * Supports distinct products per member.
   */
  async addMemberToGroup(params: {
    groupId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerWhatsApp?: string;
    position: number;
    product: Product;
    deliveryAddress?: string;
    deliveryCommune?: string;
  }): Promise<TontineMember> {
    const group = await this.getGroupById(params.groupId);
    if (!group) throw new Error('Groupe introuvable.');

    if (params.position < 1 || params.position > group.memberCount) {
      throw new Error(`La position doit être comprise entre 1 et ${group.memberCount}.`);
    }

    // 1. Check for existing position conflict (STRICT UNIQUENESS)
    const existingMembers = await this.getGroupMembers(params.groupId);
    const conflict = existingMembers.find(m => m.position === params.position);
    if (conflict) {
      throw new Error(`La position ${params.position} est déjà occupée par ${conflict.customerName}.`);
    }

    // Also check if customer is already in this group
    const customerAlreadyInGroup = existingMembers.find(m => m.customerId === params.customerId);
    if (customerAlreadyInGroup) {
      throw new Error(`Ce client est déjà inscrit dans ce groupe à la position ${customerAlreadyInGroup.position}.`);
    }

    const id = `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const productPrice = params.product.priceTontine || params.product.priceCash;

    // Calculate beneficiary date according to position & rotationPeriodDays
    const startDateObj = new Date(group.startDate);
    const beneficiaryDateObj = new Date(startDateObj);
    beneficiaryDateObj.setDate(startDateObj.getDate() + (params.position - 1) * group.rotationPeriodDays);
    const beneficiaryDate = beneficiaryDateObj.toISOString();

    const dailyAmount = Math.round(productPrice / group.totalDurationDays);

    const member: TontineMember = {
      id,
      groupId: params.groupId,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerWhatsApp: params.customerWhatsApp || params.customerPhone,
      position: params.position,
      productId: params.product.id,
      productSnapshot: {
        id: params.product.id,
        reference: params.product.reference || 'PG-REF',
        name: params.product.name,
        brand: params.product.brand || 'PENTA GAD',
        cashPrice: productPrice,
        imageUrl: params.product.images?.[0] || '',
      },
      expectedContribution: productPrice,
      dailyAmount,
      totalContributed: 0,
      remainingAmount: productPrice,
      status: 'active',
      beneficiaryDate,
      deliveryStatus: 'not_eligible',
      deliveryAddress: params.deliveryAddress || '',
      deliveryCommune: params.deliveryCommune || '',
      joinedAt: new Date().toISOString(),

      // Aliases
      assignedPosition: params.position,
      hasReceivedDelivery: false,
    };

    try {
      await setDoc(doc(db, MEMBERS_COLLECTION, id), member);

      // Update group filled count & status if full
      const newFilledCount = existingMembers.length + 1;
      const groupUpdates: Partial<TontineGroup> = {
        filledPositions: newFilledCount,
        updatedAt: new Date().toISOString(),
      };
      if (newFilledCount >= group.memberCount && group.status === 'open') {
        groupUpdates.status = 'full';
      }
      await updateDoc(doc(db, GROUPS_COLLECTION, params.groupId), groupUpdates);

      // Create / Update Rotation schedule item
      await this.upsertRotationForMember(group, member);

      return member;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, MEMBERS_COLLECTION);
    }
  },

  async upsertRotationForMember(group: TontineGroup, member: TontineMember): Promise<void> {
    const rotationId = `rot-${group.id}-${member.position}`;
    const startDateObj = new Date(group.startDate);
    
    const rotStart = new Date(startDateObj);
    rotStart.setDate(startDateObj.getDate() + (member.position - 1) * group.rotationPeriodDays);

    const rotEnd = new Date(startDateObj);
    rotEnd.setDate(startDateObj.getDate() + member.position * group.rotationPeriodDays);

    const now = new Date();
    let status: TontineRotation['status'] = 'upcoming';
    if (now >= rotEnd) {
      status = 'completed';
    } else if (now >= rotStart && now < rotEnd) {
      status = 'current';
    }

    const rotation: TontineRotation = {
      id: rotationId,
      groupId: group.id,
      position: member.position,
      memberId: member.id,
      memberName: member.customerName,
      customerId: member.customerId,
      productId: member.productId,
      productName: member.productSnapshot.name,
      startDate: rotStart.toISOString(),
      endDate: rotEnd.toISOString(),
      status,
      deliveryStatus: member.deliveryStatus,
    };

    try {
      await setDoc(doc(db, ROTATIONS_COLLECTION, rotationId), rotation);
    } catch (err) {
      console.warn('Rotation sync note:', err);
    }
  },

  /**
   * Records a member contribution (daily, grouped, partial, regularization, late).
   * Automatically updates member's totalContributed, remaining balance, and delivery eligibility.
   */
  async recordContribution(params: {
    groupId: string;
    memberId: string;
    customerId: string;
    amount: number;
    method: TontineContribution['method'];
    reference: string;
    paymentType?: TontineContributionType;
    recordedBy?: string;
    notes?: string;
    status?: TontineContribution['status'];
  }): Promise<TontineContribution> {
    const id = `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const contributionStatus = params.status || 'approved';
    const paymentType = params.paymentType || 'daily';

    const contribution: TontineContribution = {
      id,
      groupId: params.groupId,
      memberId: params.memberId,
      customerId: params.customerId,
      amount: params.amount,
      date: new Date().toISOString(),
      method: params.method,
      reference: params.reference,
      status: contributionStatus,
      paymentType,
      recordedBy: params.recordedBy || 'admin',
      notes: params.notes || '',
      createdAt: new Date().toISOString(),

      // Aliases
      paymentMethod: params.method,
      paidAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, CONTRIBUTIONS_COLLECTION, id), contribution);

      if (contributionStatus === 'approved') {
        await this.recalculateMemberFinances(params.memberId);
      }

      return contribution;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, CONTRIBUTIONS_COLLECTION);
    }
  },

  /**
   * Recalculates total paid by member and updates member status & delivery eligibility.
   */
  async recalculateMemberFinances(memberId: string): Promise<TontineMember | null> {
    try {
      const memberRef = doc(db, MEMBERS_COLLECTION, memberId);
      const memberSnap = await getDoc(memberRef);
      if (!memberSnap.exists()) return null;

      const member = memberSnap.data() as TontineMember;

      // Query all approved contributions for member
      const q = query(
        collection(db, CONTRIBUTIONS_COLLECTION),
        where('memberId', '==', memberId)
      );
      const snap = await getDocs(q);
      const contributions = snap.docs.map(d => d.data() as TontineContribution);
      const approved = contributions.filter(c => c.status === 'approved');

      const totalContributed = approved.reduce((sum, c) => sum + c.amount, 0);
      const remainingAmount = Math.max(0, member.expectedContribution - totalContributed);

      let status: TontineMember['status'] = member.status;
      if (totalContributed >= member.expectedContribution) {
        status = 'completed';
      } else {
        status = 'active';
      }

      // Check delivery trigger
      let deliveryStatus: TontineDeliveryStatus = member.deliveryStatus;
      const now = new Date();
      const beneficiaryDateObj = new Date(member.beneficiaryDate);
      
      // If member reached beneficiary date and is active or completed, or has paid significant quota
      if (now >= beneficiaryDateObj && deliveryStatus === 'not_eligible') {
        deliveryStatus = 'pending';
      }

      const updates: Partial<TontineMember> = {
        totalContributed,
        remainingAmount,
        status,
        deliveryStatus,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(memberRef, updates);

      return { ...member, ...updates };
    } catch (err) {
      console.warn('Error recalculating member finances:', err);
      return null;
    }
  },

  /**
   * Updates delivery status for a tontine member (pending -> scheduled -> shipped -> delivered).
   */
  async updateMemberDeliveryStatus(
    memberId: string, 
    deliveryStatus: TontineDeliveryStatus
  ): Promise<void> {
    try {
      await updateDoc(doc(db, MEMBERS_COLLECTION, memberId), {
        deliveryStatus,
        hasReceivedDelivery: deliveryStatus === 'delivered',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${memberId}`);
    }
  },

  /**
   * Advances group rotation position (e.g. from position 1 to position 2)
   */
  async setGroupRotationPosition(groupId: string, position: number): Promise<void> {
    try {
      await updateDoc(doc(db, GROUPS_COLLECTION, groupId), {
        currentRotationPosition: position,
        currentCycle: position,
        status: 'active',
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${GROUPS_COLLECTION}/${groupId}`);
    }
  },

  /**
   * Sets group status (open, active, completed, cancelled)
   */
  async updateGroupStatus(groupId: string, status: TontineGroup['status']): Promise<void> {
    try {
      await updateDoc(doc(db, GROUPS_COLLECTION, groupId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${GROUPS_COLLECTION}/${groupId}`);
    }
  },

  // ---------------- Queries ----------------

  async getTontineGroups(): Promise<TontineGroup[]> {
    try {
      const snap = await getDocs(collection(db, GROUPS_COLLECTION));
      const groups = snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineGroup));
      return groups.sort((a, b) => (a.groupCode || '').localeCompare(b.groupCode || ''));
    } catch (error) {
      console.warn('Error getting tontine groups:', error);
      return [];
    }
  },

  async getGroupById(groupId: string): Promise<TontineGroup | null> {
    try {
      const snap = await getDoc(doc(db, GROUPS_COLLECTION, groupId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as TontineGroup;
      }
      return null;
    } catch (error) {
      console.warn('Fallback tontine lookup:', error);
      return null;
    }
  },

  async getGroupMembers(groupId: string): Promise<TontineMember[]> {
    try {
      const q = query(
        collection(db, MEMBERS_COLLECTION),
        where('groupId', '==', groupId)
      );
      const snap = await getDocs(q);
      const members = snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineMember));
      return members.sort((a, b) => a.position - b.position);
    } catch (error) {
      console.warn('Error fetching group members:', error);
      return [];
    }
  },

  async getGroupRotations(groupId: string): Promise<TontineRotation[]> {
    try {
      const q = query(
        collection(db, ROTATIONS_COLLECTION),
        where('groupId', '==', groupId)
      );
      const snap = await getDocs(q);
      const rotations = snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineRotation));
      return rotations.sort((a, b) => a.position - b.position);
    } catch (error) {
      console.warn('Error fetching group rotations:', error);
      return [];
    }
  },

  async getGroupContributions(groupId: string): Promise<TontineContribution[]> {
    try {
      const q = query(
        collection(db, CONTRIBUTIONS_COLLECTION),
        where('groupId', '==', groupId)
      );
      const snap = await getDocs(q);
      const contributions = snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineContribution));
      return contributions.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
    } catch (error) {
      console.warn('Error fetching group contributions:', error);
      return [];
    }
  },

  async getCustomerMemberships(customerId: string): Promise<TontineMember[]> {
    try {
      const q = query(
        collection(db, MEMBERS_COLLECTION), 
        where('customerId', '==', customerId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TontineMember));
    } catch (error) {
      console.warn('Error fetching customer memberships:', error);
      return [];
    }
  },

  /**
   * Helper that calculates current and next beneficiaries based on group rotation.
   */
  async getRotationOverview(groupId: string): Promise<{
    currentBeneficiary: TontineMember | null;
    nextBeneficiary: TontineMember | null;
    currentPosition: number;
    allMembers: TontineMember[];
    rotations: TontineRotation[];
  }> {
    const group = await this.getGroupById(groupId);
    const members = await this.getGroupMembers(groupId);
    const rotations = await this.getGroupRotations(groupId);

    if (!group) {
      return {
        currentBeneficiary: null,
        nextBeneficiary: null,
        currentPosition: 1,
        allMembers: [],
        rotations: [],
      };
    }

    // Determine current active rotation position
    let currentPos = group.currentRotationPosition || 1;

    // Alternatively, calculate based on dates if active
    if (group.status === 'active' && group.startDate) {
      const start = new Date(group.startDate).getTime();
      const now = Date.now();
      const elapsedDays = Math.max(0, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
      const calculatedPos = Math.min(group.memberCount, Math.floor(elapsedDays / group.rotationPeriodDays) + 1);
      if (calculatedPos > 0) currentPos = calculatedPos;
    }

    const currentBeneficiary = members.find(m => m.position === currentPos) || null;
    const nextBeneficiary = members.find(m => m.position === currentPos + 1) || null;

    return {
      currentBeneficiary,
      nextBeneficiary,
      currentPosition: currentPos,
      allMembers: members,
      rotations,
    };
  },

  async seedInitialGroups(): Promise<void> {
    try {
      const snap = await getDocs(collection(db, GROUPS_COLLECTION));
      if (snap.empty) {
        await this.createTontineGroup({
          name: 'Groupe Confort Électroménager #01',
          description: 'Épargne collective pour téléviseurs UHD 4K, splits inverter et réfrigérateurs NoFrost.',
          memberCount: 10,
          rotationPeriodDays: 10,
          totalDurationDays: 110,
          contributionFrequency: 'daily',
          allowCustomProducts: true,
        });
      }
    } catch (err) {
      console.warn('Error in seedInitialGroups:', err);
    }
  }
};
