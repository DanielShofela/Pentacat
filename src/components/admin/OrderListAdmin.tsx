import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  XCircle, 
  ExternalLink,
  Phone,
  MapPin,
  RefreshCw,
  Search
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';
import { formatFCFA, formatDate, sanitizePhoneForWhatsApp } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../../context/ToastContext';

export const OrderListAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { showToast } = useToast();

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      showToast({
        type: 'success',
        title: 'Statut mis à jour',
        message: `La commande est passée au statut : ${getStatusLabel(newStatus)}`,
      });
    } catch (err) {
      console.error('Update status error:', err);
      showToast({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de changer le statut.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="slate" dot>En attente</Badge>;
      case 'whatsapp_sent':
        return <Badge variant="green" dot>Transmis WhatsApp</Badge>;
      case 'confirmed':
        return <Badge variant="blue" dot>Confirmée</Badge>;
      case 'processing':
        return <Badge variant="gold" dot>En préparation</Badge>;
      case 'delivered':
        return <Badge variant="green" dot>Livrée</Badge>;
      case 'cancelled':
        return <Badge variant="neutral" dot>Annulée</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      whatsapp_sent: 'Transmis WhatsApp',
      confirmed: 'Confirmée',
      processing: 'En préparation',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return labels[status] || status;
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === 'all' || o.orderStatus === filterStatus;
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      (o.deliveryCommune && o.deliveryCommune.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
              Parcours Achat Classique
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Commandes Directes & WhatsApp ({orders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des commandes passées par les clients, enregistrées dans Firestore avant transmission WhatsApp.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadOrders}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-700" />}
        >
          Actualiser
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <Input
            placeholder="Rechercher par référence, client, téléphone, commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Tous les statuts' },
              { value: 'pending', label: 'En attente' },
              { value: 'whatsapp_sent', label: 'Transmis WhatsApp' },
              { value: 'confirmed', label: 'Confirmée' },
              { value: 'processing', label: 'En préparation' },
              { value: 'delivered', label: 'Livrée' },
              { value: 'cancelled', label: 'Annulée' },
            ]}
          />
        </div>
      </div>

      {/* Table / List */}
      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8 text-slate-400" />}
          title="Aucune commande trouvée"
          description={
            search || filterStatus !== 'all'
              ? 'Aucune commande ne correspond à vos critères de recherche.'
              : 'Les commandes passées via le panier et WhatsApp s’afficheront automatiquement ici.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const cleanPhone = sanitizePhoneForWhatsApp(order.customerPhone);
            const clientWhatsAppUrl = `https://wa.me/${cleanPhone}`;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Changer statut :</span>
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950"
                    >
                      <option value="pending">En attente</option>
                      <option value="whatsapp_sent">Transmis WhatsApp</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="processing">En préparation</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-800 block uppercase tracking-wider text-[10px]">
                      Client
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>{order.deliveryCommune || order.deliveryCity} - {order.deliveryAddress}</span>
                    </div>
                    {order.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                        "{order.notes}"
                      </p>
                    )}

                    <div className="pt-2">
                      <a
                        href={clientWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Contacter client sur WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="md:col-span-2 space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                        Articles commandés ({order.items.length})
                      </span>
                      <span className="font-black text-slate-950 text-sm">
                        Total : {formatFCFA(order.grandTotal || order.totalAmount)}
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/60 gap-3"
                        >
                          <div className="flex items-center gap-3">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-10 h-10 object-cover rounded-lg bg-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{item.productName}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                {item.productReference && (
                                  <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">
                                    {item.productReference}
                                  </span>
                                )}
                                <span>Qté : {item.quantity}</span>
                                <span>·</span>
                                <span>PU : {formatFCFA(item.unitPrice)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right font-bold text-slate-900">
                            {formatFCFA(item.totalPrice || item.unitPrice * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span>Règlement : <strong className="text-slate-800">{order.paymentMethod}</strong></span>
                      {order.deliveryFee > 0 ? (
                        <span>Frais de livraison : <strong>{formatFCFA(order.deliveryFee)}</strong></span>
                      ) : (
                        <span className="text-emerald-700 font-bold">Livraison offerte</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
