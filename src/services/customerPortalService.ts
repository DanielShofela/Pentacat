import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { orderService } from './orderService';
import { installmentService } from './installmentService';
import { tontineService } from './tontineService';
import { 
  Order, 
  InstallmentContract, 
  InstallmentPayment, 
  TontineMember, 
  TontineGroup, 
  TontineContribution 
} from '../types';

export interface UnifiedPaymentItem {
  id: string;
  sourceType: 'installment' | 'tontine';
  sourceTitle: string;
  sourceCodeOrRef: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: 'approved' | 'pending' | 'rejected';
  notes?: string;
}

export interface UnifiedDeliveryItem {
  id: string;
  sourceType: 'order' | 'installment' | 'tontine';
  sourceTitle: string;
  productName: string;
  productImage?: string;
  productBrand?: string;
  productReference?: string;
  status: 'pending' | 'scheduled' | 'shipped' | 'delivered';
  destinationAddress: string;
  destinationCommune: string;
  estimatedDate?: string;
  deliveredDate?: string;
  createdAt: string;
}

export interface CustomerDashboardMetrics {
  activeOrdersCount: number;
  activeContractsCount: number;
  activeTontinesCount: number;
  totalRemainingBalance: number;
  nextPaymentDueDate: string | null;
  nextPaymentDueAmount: number | null;
  nextRotationDate: string | null;
  nextRotationGroupName: string | null;
}

export const customerPortalService = {
  /**
   * Fetches unified data for the logged-in customer.
   */
  async getCustomerPortalData(customerId: string): Promise<{
    orders: Order[];
    contracts: InstallmentContract[];
    memberships: (TontineMember & { group?: TontineGroup | null })[];
    unifiedPayments: UnifiedPaymentItem[];
    unifiedDeliveries: UnifiedDeliveryItem[];
    metrics: CustomerDashboardMetrics;
  }> {
    // 1. Fetch orders, contracts, tontine memberships
    const [orders, contracts, rawMemberships] = await Promise.all([
      orderService.getCustomerOrders(customerId).catch(() => []),
      installmentService.getCustomerContracts(customerId).catch(() => []),
      tontineService.getCustomerMemberships(customerId).catch(() => []),
    ]);

    // 2. Fetch associated tontine groups for each membership
    const memberships = await Promise.all(
      rawMemberships.map(async (m) => {
        const group = await tontineService.getGroupById(m.groupId);
        return { ...m, group };
      })
    );

    // 3. Fetch all installment payments for customer's contracts
    const contractPaymentsPromises = contracts.map((c) =>
      installmentService.getContractPayments(c.id).catch(() => [])
    );
    const contractPaymentsArrays = await Promise.all(contractPaymentsPromises);
    const allContractPayments = contractPaymentsArrays.flat();

    // 4. Fetch all tontine contributions for customer
    let allTontineContributions: TontineContribution[] = [];
    try {
      const q = query(
        collection(db, 'tontineContributions'),
        where('customerId', '==', customerId)
      );
      const snap = await getDocs(q);
      allTontineContributions = snap.docs.map((d) => ({ id: d.id, ...d.data() } as TontineContribution));
    } catch (err) {
      console.warn('Error fetching tontine contributions for portal:', err);
    }

    // 5. Build Unified Payments List
    const unifiedPayments: UnifiedPaymentItem[] = [];

    allContractPayments.forEach((p) => {
      const parentContract = contracts.find((c) => c.id === p.contractId);
      unifiedPayments.push({
        id: p.id,
        sourceType: 'installment',
        sourceTitle: parentContract?.productSnapshot.name || 'Contrat Échelonné',
        sourceCodeOrRef: parentContract?.contractNumber || p.contractId.slice(0, 8),
        amount: p.amount,
        date: p.date || p.createdAt,
        method: p.method,
        reference: p.reference,
        status: p.status,
        notes: p.notes,
      });
    });

    allTontineContributions.forEach((tc) => {
      const parentMembership = memberships.find((m) => m.id === tc.memberId);
      unifiedPayments.push({
        id: tc.id,
        sourceType: 'tontine',
        sourceTitle: parentMembership?.group?.name || 'Groupe Tontine',
        sourceCodeOrRef: parentMembership?.group?.groupCode || tc.groupId.slice(0, 8),
        amount: tc.amount,
        date: tc.date || tc.createdAt,
        method: tc.method,
        reference: tc.reference,
        status: tc.status,
        notes: tc.notes,
      });
    });

    unifiedPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // 6. Build Unified Deliveries List
    const unifiedDeliveries: UnifiedDeliveryItem[] = [];

    // From classic orders
    orders.forEach((ord) => {
      const statusMap: Record<string, UnifiedDeliveryItem['status']> = {
        delivered: 'delivered',
        shipped: 'shipped',
        processing: 'scheduled',
        pending: 'pending',
      };
      const deliveryStatus = statusMap[ord.orderStatus] || 'pending';
      const firstItem = ord.items[0];

      unifiedDeliveries.push({
        id: `del-ord-${ord.id}`,
        sourceType: 'order',
        sourceTitle: `Commande #${ord.orderNumber}`,
        productName: firstItem ? `${firstItem.productName} (${ord.items.length} article${ord.items.length > 1 ? 's' : ''})` : 'Commande PENTA GAD',
        productImage: undefined,
        status: deliveryStatus,
        destinationAddress: ord.deliveryAddress || 'Showroom PENTA GAD',
        destinationCommune: ord.deliveryCommune || ord.deliveryCity || 'Abidjan',
        createdAt: ord.createdAt,
      });
    });

    // From installment contracts (soldés or in delivery)
    contracts.forEach((ctr) => {
      const isPaid = ctr.status === 'completed' || ctr.amountPaid >= ctr.totalAmount;
      if (isPaid || ctr.deliveryStatus) {
        const rawStatus = ctr.deliveryStatus || 'pending';
        unifiedDeliveries.push({
          id: `del-ctr-${ctr.id}`,
          sourceType: 'installment',
          sourceTitle: `Contrat #${ctr.contractNumber || ctr.id.slice(0, 8)} (Soldé à 100%)`,
          productName: ctr.productSnapshot.name,
          productImage: ctr.productSnapshot.imageUrl,
          productBrand: ctr.productSnapshot.brand,
          productReference: ctr.productSnapshot.reference,
          status: rawStatus,
          destinationAddress: ctr.deliveryAddress || 'Showroom PENTA GAD',
          destinationCommune: ctr.deliveryCommune || 'Abidjan',
          createdAt: ctr.updatedAt || ctr.createdAt,
        });
      }
    });

    // From tontine memberships
    memberships.forEach((mem) => {
      if (mem.deliveryStatus && mem.deliveryStatus !== 'not_eligible') {
        unifiedDeliveries.push({
          id: `del-tnt-${mem.id}`,
          sourceType: 'tontine',
          sourceTitle: `Tontine ${mem.group?.groupCode || ''} (Tour #${mem.position})`,
          productName: mem.productSnapshot.name,
          productImage: mem.productSnapshot.imageUrl,
          productBrand: mem.productSnapshot.brand,
          productReference: mem.productSnapshot.reference,
          status: mem.deliveryStatus as any,
          destinationAddress: mem.deliveryAddress || 'Showroom PENTA GAD',
          destinationCommune: mem.deliveryCommune || 'Abidjan',
          estimatedDate: mem.beneficiaryDate,
          createdAt: mem.joinedAt,
        });
      }
    });

    unifiedDeliveries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 7. Calculate Key Dashboard Metrics
    const activeOrders = orders.filter((o) => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled');
    const activeContracts = contracts.filter((c) => c.status === 'active' || c.status === 'pending');
    const activeMemberships = memberships.filter((m) => m.status === 'active');

    // Total remaining balance
    const contractsRemaining = contracts.reduce((sum, c) => sum + Math.max(0, c.remainingAmount), 0);
    const tontinesRemaining = memberships.reduce((sum, m) => sum + Math.max(0, m.remainingAmount), 0);
    const totalRemainingBalance = contractsRemaining + tontinesRemaining;

    // Next installment due date
    let nextDueDate: string | null = null;
    let nextDueAmount: number | null = null;
    const activeContractsWithDue = contracts.filter((c) => c.status !== 'completed' && c.remainingAmount > 0 && c.nextPaymentDueDate);
    if (activeContractsWithDue.length > 0) {
      activeContractsWithDue.sort((a, b) => new Date(a.nextPaymentDueDate!).getTime() - new Date(b.nextPaymentDueDate!).getTime());
      nextDueDate = activeContractsWithDue[0].nextPaymentDueDate!;
      nextDueAmount = activeContractsWithDue[0].monthlyPayment;
    }

    // Next rotation date
    let nextRotationDate: string | null = null;
    let nextRotationGroupName: string | null = null;
    const activeTontinesWithDate = memberships.filter((m) => m.beneficiaryDate && m.status !== 'completed');
    if (activeTontinesWithDate.length > 0) {
      activeTontinesWithDate.sort((a, b) => new Date(a.beneficiaryDate).getTime() - new Date(b.beneficiaryDate).getTime());
      nextRotationDate = activeTontinesWithDate[0].beneficiaryDate;
      nextRotationGroupName = activeTontinesWithDate[0].group?.name || activeTontinesWithDate[0].group?.groupCode || 'Tontine PENTA';
    }

    const metrics: CustomerDashboardMetrics = {
      activeOrdersCount: activeOrders.length,
      activeContractsCount: activeContracts.length,
      activeTontinesCount: activeMemberships.length,
      totalRemainingBalance,
      nextPaymentDueDate: nextDueDate,
      nextPaymentDueAmount: nextDueAmount,
      nextRotationDate,
      nextRotationGroupName,
    };

    return {
      orders,
      contracts,
      memberships,
      unifiedPayments,
      unifiedDeliveries,
      metrics,
    };
  }
};
