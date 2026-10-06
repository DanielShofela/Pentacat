import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Package, 
  Check, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin, 
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TontineGroup, TontineMember, Product } from '../../types';
import { productService } from '../../services/productService';
import { tontineService } from '../../services/tontineService';
import { formatFCFA } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

interface TontineAddMemberModalProps {
  group: TontineGroup;
  existingMembers: TontineMember[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TontineAddMemberModal: React.FC<TontineAddMemberModalProps> = ({
  group,
  existingMembers,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Find first available position
  const occupiedPositions = new Set(existingMembers.map((m) => m.position));
  const availablePositions: number[] = [];
  for (let i = 1; i <= group.memberCount; i++) {
    if (!occupiedPositions.has(i)) {
      availablePositions.push(i);
    }
  }

  const [position, setPosition] = useState<number>(availablePositions[0] || 1);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [commune, setCommune] = useState<string>('Cocody');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const prods = await productService.getProducts();
      setProducts(prods);
      if (group.productId) {
        const found = prods.find((p) => p.id === group.productId);
        if (found) setSelectedProduct(found);
      } else if (prods.length > 0) {
        setSelectedProduct(prods[0]);
      }
    }
    loadProducts();
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Veuillez renseigner le nom et le téléphone du membre.');
      return;
    }
    if (!selectedProduct) {
      alert('Veuillez sélectionner un équipement pour ce membre.');
      return;
    }
    if (occupiedPositions.has(position)) {
      alert(`La position ${position} est déjà occupée.`);
      return;
    }

    setLoading(true);
    try {
      const pseudoCustomerId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await tontineService.addMemberToGroup({
        groupId: group.id,
        customerId: pseudoCustomerId,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerWhatsApp: whatsapp.trim() || phone.trim(),
        position,
        product: selectedProduct,
        deliveryCommune: commune,
        deliveryAddress: address,
      });

      showToast({
        type: 'success',
        title: 'Membre ajouté au groupe',
        message: `${name} attribué à la position #${position} avec l'équipement ${selectedProduct.name}.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error adding tontine member:', err);
      showToast({
        type: 'error',
        title: 'Erreur d’attribution',
        message: err.message || 'Impossible d’ajouter le membre.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attribuer une position dans le groupe"
      subtitle={`${group.name} (${group.groupCode}) · ${existingMembers.length}/${group.memberCount} membres`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Positions Grid Selector (STRICT UNIQUENESS) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Sélectionner la position dans la rotation (1 à {group.memberCount}) *</span>
            <span className="text-[11px] font-normal text-slate-500">
              {availablePositions.length} position{availablePositions.length > 1 ? 's' : ''} libre{availablePositions.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: group.memberCount }, (_, idx) => idx + 1).map((pos) => {
              const isOccupied = occupiedPositions.has(pos);
              const isSelected = position === pos;
              const occupant = existingMembers.find((m) => m.position === pos);

              return (
                <button
                  type="button"
                  key={pos}
                  disabled={isOccupied}
                  onClick={() => setPosition(pos)}
                  className={`p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative ${
                    isOccupied
                      ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-slate-950 text-white border-slate-950 ring-2 ring-[#C5A059]'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-400'
                  }`}
                  title={isOccupied ? `Occupé par ${occupant?.customerName}` : `Libre : Position ${pos}`}
                >
                  <span className="font-mono font-black text-sm">{pos}</span>
                  <span className="text-[9px] truncate max-w-full block">
                    {isOccupied ? occupant?.customerName?.split(' ')[0] : 'Libre'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-500">
            Une position détermine l'ordre de passage et ne peut jamais être attribuée à deux personnes.
          </p>
        </div>

        {/* Member Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Nom et Prénom du membre *"
            required
            placeholder="Ex: Kouamé Jean"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Numéro de Téléphone *"
            type="tel"
            required
            placeholder="Ex: 07 00 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="WhatsApp de contact"
            type="tel"
            placeholder="Ex: 07 00 00 00 00"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            leftIcon={<MessageCircle className="w-4 h-4" />}
          />

          <Input
            label="Commune de livraison *"
            required
            placeholder="Ex: Cocody Angré"
            value={commune}
            onChange={(e) => setCommune(e.target.value)}
          />
        </div>

        {/* Product selector: Distinct products support! */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Équipement affecté à ce membre *</span>
            <span className="text-[10px] text-[#9A7426] font-semibold">
              Chaque membre peut avoir son propre équipement
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50">
            {products.map((p) => {
              const isSelected = selectedProduct?.id === p.id;
              const price = p.priceTontine || p.priceCash;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setSelectedProduct(p)}
                  className={`p-2 rounded-lg text-left flex items-center justify-between gap-2 border transition-all ${
                    isSelected
                      ? 'bg-white border-slate-950 shadow-2xs ring-1 ring-slate-950'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400 shrink-0" />
                    )}
                    <div className="overflow-hidden">
                      <span className="font-bold text-[11px] text-slate-900 truncate block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.brand}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-black text-slate-900 shrink-0">
                    {formatFCFA(price)}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedProduct && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px]">Équipement retenu :</span>
                <p className="font-bold text-slate-900">{selectedProduct.name}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-500 text-[11px]">Valeur du lot :</span>
                <p className="font-black text-slate-950">
                  {formatFCFA(selectedProduct.priceTontine || selectedProduct.priceCash)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={loading}
            leftIcon={<UserPlus className="w-4 h-4 text-[#C5A059]" />}
          >
            Valider l'attribution
          </Button>
        </div>

      </form>
    </Modal>
  );
};
