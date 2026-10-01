import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, ShieldCheck, MapPin, Phone, User, CreditCard } from 'lucide-react';
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
  const [completedOrder, setCompletedOrder] = useState<{ orderNumber: string; whatsappUrl: string } | null>(null);

  if (!isCheckoutModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      alert('Veuillez renseigner votre nom complet et numéro de téléphone.');
      return;
    }

    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
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
        orderNumber: result.order.orderNumber,
        whatsappUrl: result.whatsappUrl,
      });
      clearCart();
    } catch (err) {
      console.error('Order creation error:', err);
      alert('Une erreur est survenue. Vous pouvez contacter directement notre service WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutModalOpen(false);
    setCompletedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base">Finaliser ma commande PENTA GAD</h3>
              <p className="text-xs text-slate-300">Achat direct • Validation sur WhatsApp</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h4 className="font-bold text-lg text-slate-900">Commande enregistrée avec succès !</h4>
              <p className="text-xs text-slate-500 mt-1">
                Numéro de commande : <span className="font-bold text-amber-700">{completedOrder.orderNumber}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
              <p>• Votre commande est sauvegardée dans le système central PENTA GAD.</p>
              <p>• Cliquez ci-dessous pour transmettre automatiquement les détails à notre agent commercial sur WhatsApp.</p>
              <p>• Un conseiller confirmera immédiatement l'horaire de livraison.</p>
            </div>

            <div className="pt-2 space-y-2">
              <a
                href={completedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Ouvrir WhatsApp pour confirmer</span>
              </a>

              <button
                onClick={handleClose}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Order Recap Banner */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-amber-800 font-semibold">{items.length} produit(s)</span>
                <p className="text-slate-500">Sous-total : {formatFCFA(subtotal)}</p>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Total à régler :</span>
                <p className="font-black text-amber-800 text-sm">{formatFCFA(total)}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom et Prénom *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: Jean Kouadio"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone WhatsApp *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 07 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ville</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Abidjan">Abidjan</option>
                    <option value="Bouaké">Bouaké</option>
                    <option value="Yamoussoukro">Yamoussoukro</option>
                    <option value="San-Pédro">San-Pédro</option>
                    <option value="Korhogo">Korhogo</option>
                    <option value="Daloa">Daloa</option>
                    <option value="Autre ville">Autre ville</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Commune / Quartier</label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                  >
                    <option value="Cocody">Cocody</option>
                    <option value="Yopougon">Yopougon</option>
                    <option value="Marcory">Marcory</option>
                    <option value="Koumassi">Koumassi</option>
                    <option value="Plateau">Plateau</option>
                    <option value="Abobo">Abobo</option>
                    <option value="Treichville">Treichville</option>
                    <option value="Riviera">Riviera</option>
                    <option value="Angré">Angré</option>
                    <option value="Autre">Autre zone</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse de livraison précise (Repère)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: Angré 8ème tranche, carrefour prière, près de la pharmacie"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mode de règlement souhaité
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${paymentMethod === 'wave' ? 'border-amber-500 bg-amber-50 font-bold text-amber-900' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'wave'}
                      onChange={() => setPaymentMethod('wave')}
                      className="text-amber-600"
                    />
                    <span>Wave CI</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${paymentMethod === 'orange_money' ? 'border-amber-500 bg-amber-50 font-bold text-amber-900' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'orange_money'}
                      onChange={() => setPaymentMethod('orange_money')}
                      className="text-amber-600"
                    />
                    <span>Orange Money</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${paymentMethod === 'mtn_momo' ? 'border-amber-500 bg-amber-50 font-bold text-amber-900' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'mtn_momo'}
                      onChange={() => setPaymentMethod('mtn_momo')}
                      className="text-amber-600"
                    />
                    <span>MTN MoMo</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${paymentMethod === 'cash_on_delivery' ? 'border-amber-500 bg-amber-50 font-bold text-amber-900' : 'border-slate-200'}`}>
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'cash_on_delivery'}
                      onChange={() => setPaymentMethod('cash_on_delivery')}
                      className="text-amber-600"
                    />
                    <span>À la livraison</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{loading ? 'Génération de la commande...' : 'Générer & Transmettre sur WhatsApp'}</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Validation instantanée sans démarche complexe</span>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
