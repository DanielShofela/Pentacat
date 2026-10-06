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
  InstallmentContract, 
  InstallmentPayment, 
  InstallmentPaymentStatus, 
  InstallmentDeliveryStatus,
  Product
} from '../types';

const CONTRACTS_COLLECTION = 'installmentContracts';
const PAYMENTS_COLLECTION = 'installmentPayments';

export const installmentService = {
  generateContractNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PG-CTR-${year}-${rand}`;
  },

  async createContract(params: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    product: Product;
    duration: number; // e.g. 3, 6, 8 months
    frequency?: 'monthly' | 'biweekly';
    deliveryAddress?: string;
    deliveryCommune?: string;
    deliveryNotes?: string;
  }): Promise<InstallmentContract> {
    const id = `ctr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const contractNumber = this.generateContractNumber();
    const totalAmount = params.product.priceInstallment || params.product.priceCash;
    const duration = params.duration || 6;
    const frequency = params.frequency || 'monthly';
    const monthlyPayment = Math.round(totalAmount / duration);

    const now = new Date();
    const startDate = now.toISOString();

    const endDateObj = new Date(now);
    endDateObj.setMonth(endDateObj.getMonth() + duration);
    const expectedEndDate = endDateObj.toISOString();

    const nextDueDateObj = new Date(now);
    nextDueDateObj.setMonth(nextDueDateObj.getMonth() + 1);
    const nextPaymentDueDate = nextDueDateObj.toISOString();

    const contract: InstallmentContract = {
      id,
      contractNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      productId: params.product.id,
      productSnapshot: {
        id: params.product.id,
        reference: params.product.reference || 'PG-REF',
        name: params.product.name,
        brand: params.product.brand || 'PENTA GAD',
        categoryName: params.product.categoryName,
        imageUrl: params.product.images?.[0] || '',
        cashPrice: params.product.priceCash,
      },
      totalAmount,
      amountPaid: 0,
      remainingAmount: totalAmount,
      progressPercentage: 0,
      duration,
      frequency,
      startDate,
      expectedEndDate,
      monthlyPayment,
      nextPaymentDueDate,
      status: 'pending',
      deliveryAddress: params.deliveryAddress || '',
      deliveryCommune: params.deliveryCommune || '',
      deliveryNotes: params.deliveryNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // Aliases
      productName: params.product.name,
      productPrice: totalAmount,
      remainingBalance: totalAmount,
      durationMonths: duration,
    };

    try {
      await setDoc(doc(db, CONTRACTS_COLLECTION, id), contract);
      return contract;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, CONTRACTS_COLLECTION);
    }
  },

  async recordPayment(params: {
    contractId: string;
    customerId: string;
    amount: number;
    method: InstallmentPayment['method'];
    reference: string;
    recordedBy?: string;
    status?: InstallmentPaymentStatus; // Default to 'approved' for demo/admin or 'pending'
    notes?: string;
  }): Promise<InstallmentPayment> {
    const id = `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const paymentStatus: InstallmentPaymentStatus = params.status || 'approved';

    const payment: InstallmentPayment = {
      id,
      contractId: params.contractId,
      customerId: params.customerId,
      amount: params.amount,
      date: new Date().toISOString(),
      method: params.method,
      reference: params.reference,
      status: paymentStatus,
      recordedBy: params.recordedBy || 'client',
      notes: params.notes || '',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, PAYMENTS_COLLECTION, id), payment);

      // Recalculate contract financials if approved
      if (paymentStatus === 'approved') {
        await this.recalculateContractFinancials(params.contractId);
      }

      return payment;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, PAYMENTS_COLLECTION);
    }
  },

  async recalculateContractFinancials(contractId: string): Promise<InstallmentContract | null> {
    try {
      const contractRef = doc(db, CONTRACTS_COLLECTION, contractId);
      const contractSnap = await getDoc(contractRef);
      if (!contractSnap.exists()) return null;

      const contract = contractSnap.data() as InstallmentContract;

      // Query all approved payments for this contract
      const paymentsQuery = query(
        collection(db, PAYMENTS_COLLECTION),
        where('contractId', '==', contractId)
      );
      const paymentsSnap = await getDocs(paymentsQuery);
      const payments = paymentsSnap.docs.map(d => d.data() as InstallmentPayment);

      const approvedPayments = payments.filter(p => p.status === 'approved');
      const amountPaid = approvedPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingAmount = Math.max(0, contract.totalAmount - amountPaid);
      const progressPercentage = Math.min(100, Math.round((amountPaid / contract.totalAmount) * 100));

      let newStatus: InstallmentContract['status'] = contract.status;
      let newDeliveryStatus: InstallmentDeliveryStatus | undefined = contract.deliveryStatus;

      // Auto-transition when completed
      if (amountPaid >= contract.totalAmount) {
        newStatus = 'completed';
        if (!newDeliveryStatus) {
          newDeliveryStatus = 'pending';
        }
      } else if (contract.status === 'pending' && amountPaid > 0) {
        newStatus = 'active';
      }

      const updates: Partial<InstallmentContract> = {
        amountPaid,
        remainingAmount,
        remainingBalance: remainingAmount,
        progressPercentage,
        status: newStatus,
        deliveryStatus: newDeliveryStatus,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(contractRef, updates);

      return {
        ...contract,
        ...updates,
      } as InstallmentContract;
    } catch (error) {
      console.warn('Error recalculating contract financials:', error);
      return null;
    }
  },

  async approvePayment(paymentId: string, contractId: string): Promise<void> {
    try {
      await updateDoc(doc(db, PAYMENTS_COLLECTION, paymentId), {
        status: 'approved',
      });
      await this.recalculateContractFinancials(contractId);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${PAYMENTS_COLLECTION}/${paymentId}`);
    }
  },

  async updateDeliveryStatus(
    contractId: string, 
    deliveryStatus: InstallmentDeliveryStatus, 
    notes?: string
  ): Promise<void> {
    try {
      const updates: Record<string, any> = {
        deliveryStatus,
        updatedAt: new Date().toISOString(),
      };
      if (notes !== undefined) {
        updates.deliveryNotes = notes;
      }
      await updateDoc(doc(db, CONTRACTS_COLLECTION, contractId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${CONTRACTS_COLLECTION}/${contractId}`);
    }
  },

  async getCustomerContracts(customerId: string): Promise<InstallmentContract[]> {
    try {
      const q = query(
        collection(db, CONTRACTS_COLLECTION), 
        where('customerId', '==', customerId)
      );
      const snap = await getDocs(q);
      const contracts = snap.docs.map(d => ({ id: d.id, ...d.data() } as InstallmentContract));
      return contracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, CONTRACTS_COLLECTION);
    }
  },

  async getAllContracts(): Promise<InstallmentContract[]> {
    try {
      const snap = await getDocs(collection(db, CONTRACTS_COLLECTION));
      const contracts = snap.docs.map(d => ({ id: d.id, ...d.data() } as InstallmentContract));
      return contracts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Error loading all contracts:', error);
      return [];
    }
  },

  async getContractById(contractId: string): Promise<InstallmentContract | null> {
    try {
      const snap = await getDoc(doc(db, CONTRACTS_COLLECTION, contractId));
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as InstallmentContract;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${CONTRACTS_COLLECTION}/${contractId}`);
    }
  },

  async getContractPayments(contractId: string): Promise<InstallmentPayment[]> {
    try {
      const q = query(
        collection(db, PAYMENTS_COLLECTION), 
        where('contractId', '==', contractId)
      );
      const snap = await getDocs(q);
      const payments = snap.docs.map(d => ({ id: d.id, ...d.data() } as InstallmentPayment));
      return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PAYMENTS_COLLECTION);
    }
  }
};
