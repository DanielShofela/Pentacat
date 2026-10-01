import { collection, doc, setDoc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { InstallmentContract, InstallmentPayment } from '../types';

const CONTRACTS_COLLECTION = 'installmentContracts';
const PAYMENTS_COLLECTION = 'installmentPayments';

export const installmentService = {
  generateContractNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CTR-${year}-${rand}`;
  },

  async createContractRequest(params: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    productId: string;
    productName: string;
    productPrice: number;
    depositAmount: number;
    durationMonths: number;
  }): Promise<InstallmentContract> {
    const id = `ctr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const contractNumber = this.generateContractNumber();
    const totalAmount = params.productPrice;
    const remainingBalance = Math.max(0, totalAmount - params.depositAmount);
    const monthlyPayment = Math.round(remainingBalance / params.durationMonths);

    const contract: InstallmentContract = {
      id,
      contractNumber,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      customerEmail: params.customerEmail,
      productId: params.productId,
      productName: params.productName,
      productPrice: params.productPrice,
      totalAmount,
      depositAmount: params.depositAmount,
      remainingBalance,
      durationMonths: params.durationMonths,
      monthlyPayment,
      paidInstallmentsCount: 0,
      totalInstallmentsCount: params.durationMonths,
      status: 'pending_approval',
      deliveryStatus: 'pending_deposit',
      startDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, CONTRACTS_COLLECTION, id), contract);
      return contract;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, CONTRACTS_COLLECTION);
    }
  },

  async getCustomerContracts(customerId: string): Promise<InstallmentContract[]> {
    try {
      const q = query(collection(db, CONTRACTS_COLLECTION), where('customerId', '==', customerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as InstallmentContract));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, CONTRACTS_COLLECTION);
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
      const q = query(collection(db, PAYMENTS_COLLECTION), where('contractId', '==', contractId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as InstallmentPayment));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, PAYMENTS_COLLECTION);
    }
  }
};
