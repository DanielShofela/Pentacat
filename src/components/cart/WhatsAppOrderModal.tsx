import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, ShieldCheck, MapPin, Phone, User } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useCart } from '../../context/CartContext';
import { useAppNavigation } from '../../context/AppNavigationContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { formatFCFA } from '../../utils/formatters';
import { PaymentMethod } from '../../types';

export const WhatsAppOrderModal: React.FC = () => {
  const { isCheckoutModalOpen, setIsCheckoutModalOpen } = useAppNavigation();
  const { items, subtotal, deliveryFee, total, clearCart } = useCart();
  const { user, customer } = useAuth();

  const [fullName, setFullName] = useState(customer?.fullName || user?.displayName || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [city, setCity] = useState(customer?.city || 'Abidjan');
  const [commune, setCommune] = useState(customer?.commune || 'Cocody');
  const [address, setAddress] = useState(customer?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wave');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; orderNumber: string; whatsappUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Veuillez renseigner votre nom complet et votre numéro de téléphone.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        productReference: item.product.reference,
        productName: item.product.name,
        unitPrice: item.product.priceCash,
        quantity: item.quantity,
        totalPrice: item.product.priceCash * item.quantity,
        imageUrl: item.product.images[0],
      }));

      const result = await orderService.createClassicOrder({
        customerId: user?.uid,
        customerName: fullName,
        customerPhone: phone,
        customerEmail: user?.email || undefined,
        deliveryAddress: address || 'À convenir avec le service livraison',
        deliveryCity: city,
        deliveryCommune: commune,
        items: orderItems,
        totalAmount: subtotal,
        deliveryFee,
        grandTotal: total,
        paymentMethod,
        source: 'whatsapp',
        notes: notes || undefined,
      });

      setCompletedOrder({
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        whatsappUrl: result.whatsappUrl,
      });
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Une erreur est survenue lors de la validation.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setCompletedOrder(null);
  };

  const handleOpenWhatsApp = () => {
    if (completedOrder) {
      orderService.markOrderAsWhatsAppSent(completedOrder.id);
    }
    handleClose();
  };

  const cityOptions = [
    { value: 'Abidjan', label: 'Abidjan' },
    { value: 'Bouaké', label: 'Bouaké' },
    { value: 'Yamoussoukro', label: 'Yamoussoukro' },
    { value: 'San-Pédro', label: 'San-Pédro' },
    { value: 'Korhogo', label: 'Korhogo' },
    { value: 'Daloa', label: 'Daloa' },
    { value: 'Autre', label: 'Autre ville' },
  ];

  const communeOptions = [
    { value: 'Cocody', label: 'Cocody' },
    { value: 'Yopougon', label: 'Yopougon' },
    { value: 'Marcory', label: 'Marcory' },
    { value: 'Koumassi', label: 'Koumassi' },
    { value: 'Plateau', label: 'Plateau' },
    { value: 'Abobo', label: 'Abobo' },
    { value: 'Treichville', label: 'Treichville' },
    { value: 'Riviera', label: 'Riviera' },
    { value: 'Angré', label: 'Angré' },
    { value: 'Autre', label: 'Autre commune' },
  ];

  return (
    <Modal
      isOpen={isCheckoutModalOpen}
      onClose={handleClose}
      title={completedOrder ? 'Commande Confirmée' : 'Finaliser ma Commande'}
      subtitle={completedOrder ? undefined : 'Validation directe avec un conseiller commercial WhatsApp'}
      maxWidth="md"
    >
      {completedOrder ? (
        <div className="text-center space-y-4 py-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h4 className="font-extrabold text-base text-slate-900 tracking-tight">
              Commande enregistrée avec succès
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Référence PENTA GAD :{' '}
              <span className="font-mono font-bold text-slate-950 bg-slate-100 px-2 py-0.5 rounded">
                {completedOrder.orderNumber}
              </span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800">Prochaine étape :</p>
            <p>1. Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp avec le message pré-rempli.</p>
            <p>2. Un conseiller commercial confirmera l'adresse exacte et l'horaire de livraison.</p>
          </div>

          <div className="pt-2 space-y-2">
            <a
              href={completedOrder.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenWhatsApp}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Transmettre sur WhatsApp</span>
            </a>

            <Button variant="ghost" fullWidth size="sm" onClick={handleClose}>
              Fermer
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Order Summary Strip */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-900">{items.length} article(s)</span>
              <p className="text-slate-400 text-[11px]">Sous-total : {formatFCFA(subtotal)}</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">Total à régler :</span>
              <p className="font-black text-slate-950 text-sm">{formatFCFA(total)}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              label="Nom et Prénom *"
              required
              placeholder="Ex: Jean Kouadio"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Numéro WhatsApp de contact *"
              type="tel"
              required
              placeholder="Ex: 07 XX XX XX XX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Ville"
                options={cityOptions}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <Select
                label="Commune"
                options={communeOptions}
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
              />
            </div>

            <Input
              label="Adresse ou localisation *"
              required
              placeholder="Ex: Cocody Angré 8ème tranche, carrefour prière"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />

            <Input
              label="Informations complémentaires"
              placeholder="Ex: Précision d'étage, disponibilité horaire..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            {/* Payment Options */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-tight">
                Mode de règlement souhaité
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'wave', label: 'Wave' },
                  { id: 'orange_money', label: 'Orange Money' },
                  { id: 'mtn_momo', label: 'MTN MoMo' },
                  { id: 'cash_on_delivery', label: 'À la livraison' },
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-slate-950 bg-slate-50 font-bold text-slate-950 shadow-2xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={isSelected}
                        onChange={() => setPaymentMethod(m.id as PaymentMethod)}
                        className="text-slate-950 focus:ring-slate-950"
                      />
                      <span className="text-xs">{m.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={loading}
              leftIcon={<MessageCircle className="w-4 h-4 text-[#C5A059]" />}
            >
              Valider la commande sur WhatsApp
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Garantie constructeur & facture fournies à la livraison</span>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
