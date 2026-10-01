import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errorHandler';
import { Order } from '../types';
import { generateWhatsAppOrderMessage, PENTA_GAD_CONTACTS, sanitizePhoneForWhatsApp } from '../utils/formatters';

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
      // Even if Firestore write is blocked, user should still be able to complete purchase via WhatsApp
    }

    const message = generateWhatsAppOrderMessage({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      deliveryCity: newOrder.deliveryCity,
      deliveryCommune: newOrder.deliveryCommune,
      items: newOrder.items,
      totalAmount: newOrder.totalAmount,
      deliveryFee: newOrder.deliveryFee,
      paymentMethod: newOrder.paymentMethod,
    });

    const cleanDestPhone = sanitizePhoneForWhatsApp(PENTA_GAD_CONTACTS.whatsapp);
    const whatsappUrl = `https://wa.me/${cleanDestPhone}?text=${encodeURIComponent(message)}`;

    return {
      order: newOrder,
      whatsappUrl,
    };
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    try {
      const q = query(collection(db, ORDERS_COLLECTION), where('customerId', '==', customerId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
    }
  }
};
