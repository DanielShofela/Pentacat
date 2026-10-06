import { collection, doc, setDoc, getDocs, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Order, OrderStatus } from '../types';
import { generateWhatsAppOrderMessage } from '../utils/formatters';
import { companySettingsService } from './companySettingsService';

const ORDERS_COLLECTION = 'orders';

export const orderService = {
  generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 7).replace('-', '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `PG-${dateStr}-${rand}`;
  },

  async createClassicOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'orderStatus' | 'paymentStatus'>): Promise<{ order: Order; whatsappUrl: string }> {
    const orderNumber = this.generateOrderNumber();
    const id = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber,
      orderStatus: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, ORDERS_COLLECTION, id), newOrder);
    } catch (error) {
      console.warn('Error saving order to Firestore (continuing with WhatsApp generation):', error);
      // Even if Firestore write is blocked or network is offline, user is NEVER blocked from completing purchase via WhatsApp
    }

    const message = generateWhatsAppOrderMessage({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      deliveryCity: newOrder.deliveryCity,
      deliveryCommune: newOrder.deliveryCommune || newOrder.deliveryCity,
      deliveryAddress: newOrder.deliveryAddress,
      notes: newOrder.notes,
      items: newOrder.items.map(item => ({
        productName: item.productName,
        productReference: item.productReference,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      })),
      totalAmount: newOrder.totalAmount,
      deliveryFee: newOrder.deliveryFee,
      paymentMethod: newOrder.paymentMethod,
    });

    const whatsappUrl = companySettingsService.buildWhatsAppUrl(message);

    return {
      order: newOrder,
      whatsappUrl,
    };
  },

  async markOrderAsWhatsAppSent(orderId: string): Promise<void> {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        orderStatus: 'whatsapp_sent',
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Could not update order status to whatsapp_sent:', err);
    }
  },

  async updateOrderStatus(orderId: string, orderStatus: OrderStatus): Promise<void> {
    try {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        orderStatus,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${ORDERS_COLLECTION}/${orderId}`);
    }
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), where('customerId', '==', customerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  },

  async getAllOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, ORDERS_COLLECTION));
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      // Sort newest first
      return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.warn('Could not load all orders:', error);
      return [];
    }
  }
};
