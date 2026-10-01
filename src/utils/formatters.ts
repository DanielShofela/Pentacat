/**
 * Utility functions for PENTA GAD Distribution
 * Tailored for Ivory Coast (FCFA, Abidjan phone format, WhatsApp)
 */

export function formatFCFA(amount: number): string {
  if (isNaN(amount)) return '0 FCFA';
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function formatIvorianPhone(phone: string): string {
  // Cleans and formats Ivorian 10-digit telephone numbers (ex: 07 00 00 00 00)
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
}

export function sanitizePhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  // If local 10 digits starting with 0, add 225
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '225' + cleaned;
  } else if (!cleaned.startsWith('225') && cleaned.length === 8) {
    cleaned = '225' + cleaned;
  }
  return cleaned;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export const PENTA_GAD_CONTACTS = {
  name: 'PENTA GAD Distribution',
  whatsapp: '2250700000000', // Numéro commercial officiel WhatsApp
  phoneDisplay: '+225 07 00 00 00 00 / 05 00 00 00 00',
  email: 'pentagad.distribution@gmail.com',
  address: 'Abidjan, Côte d\'Ivoire - Showroom & Entrepôt Central',
  openingHours: 'Lun - Sam : 08h00 - 18h30',
};

export function generateWhatsAppOrderMessage(params: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryCity: string;
  deliveryCommune?: string;
  items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  totalAmount: number;
  deliveryFee: number;
  paymentMethod: string;
}): string {
  let msg = `*NOUVELLE COMMANDE PENTA GAD DISTRIBUTION*\n`;
  msg += `*Réf:* ${params.orderNumber}\n\n`;
  msg += `👤 *Client:* ${params.customerName}\n`;
  msg += `📞 *Téléphone:* ${params.customerPhone}\n`;
  msg += `📍 *Livraison:* ${params.deliveryCity}${params.deliveryCommune ? ' - ' + params.deliveryCommune : ''}\n\n`;
  msg += `🛍️ *Articles commandés:*\n`;
  
  params.items.forEach((item, index) => {
    msg += `${index + 1}. ${item.productName} (x${item.quantity}) : ${formatFCFA(item.unitPrice * item.quantity)}\n`;
  });

  msg += `\n💵 *Sous-total:* ${formatFCFA(params.totalAmount)}`;
  if (params.deliveryFee > 0) {
    msg += `\n🚚 *Frais de livraison:* ${formatFCFA(params.deliveryFee)}`;
  }
  msg += `\n💰 *TOTAL À PAYER:* ${formatFCFA(params.totalAmount + params.deliveryFee)}\n`;
  msg += `💳 *Mode de règlement:* ${params.paymentMethod}\n\n`;
  msg += `Bonjour PENTA GAD, je souhaite finaliser et confirmer la livraison de cette commande. Merci !`;

  return msg;
}
