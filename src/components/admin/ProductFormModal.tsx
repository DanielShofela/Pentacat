import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../context/ToastContext';

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productToEdit?: Product | null;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  productToEdit,
}) => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [reference, setReference] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [oldPrice, setOldPrice] = useState<string>('');
  const [stock, setStock] = useState<number>(10);
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState<number>(24);

  // Gallery
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  
  // Features
  const [features, setFeatures] = useState<string[]>(['']);

  // Commercial eligibilities
  const [isCashEligible, setIsCashEligible] = useState(true);
  const [isInstallmentEligible, setIsInstallmentEligible] = useState(true);
  const [installmentMaxMonths, setInstallmentMaxMonths] = useState(6);
  const [installmentMinDepositPercent, setInstallmentMinDepositPercent] = useState(25);
  const [isTontineEligible, setIsTontineEligible] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      const cats = await categoryService.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (productToEdit) {
      setReference(productToEdit.reference || '');
      setName(productToEdit.name || '');
      setCategoryId(productToEdit.categoryId || '');
      setBrand(productToEdit.brand || '');
      setModel(productToEdit.model || '');
      setPrice(productToEdit.price || productToEdit.priceCash || 0);
      setOldPrice(productToEdit.oldPrice ? String(productToEdit.oldPrice) : '');
      setStock(productToEdit.stock ?? 10);
      setShortDescription(productToEdit.shortDescription || productToEdit.description || '');
      setFullDescription(productToEdit.fullDescription || productToEdit.description || '');
      setWarrantyMonths(productToEdit.warrantyMonths || 24);
      setImageUrls(productToEdit.images && productToEdit.images.length > 0 ? productToEdit.images : ['']);
      setFeatures(productToEdit.features && productToEdit.features.length > 0 ? productToEdit.features : ['']);
      setIsCashEligible(productToEdit.isCashEligible ?? true);
      setIsInstallmentEligible(productToEdit.isInstallmentEligible ?? false);
      setInstallmentMaxMonths(productToEdit.installmentMaxMonths || 6);
      setInstallmentMinDepositPercent(productToEdit.installmentMinDepositPercent || 25);
      setIsTontineEligible(productToEdit.isTontineEligible ?? false);
      setIsFeatured(productToEdit.isFeatured ?? false);
    } else {
      // Auto-generate a clean reference for new product
      const randRef = Math.floor(1000 + Math.random() * 9000);
      setReference(`PG-REF-${randRef}`);
      setName('');
      setBrand('Hisense');
      setModel('');
      setPrice(150000);
      setOldPrice('');
      setStock(10);
      setShortDescription('');
      setFullDescription('');
      setImageUrls(['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80']);
      setFeatures(['Garantie constructeur officielle', 'Tropicalisé haute durabilité']);
      setIsCashEligible(true);
      setIsInstallmentEligible(true);
      setInstallmentMaxMonths(6);
      setInstallmentMinDepositPercent(25);
      setIsTontineEligible(false);
      setIsFeatured(false);
    }
  }, [productToEdit]);

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleUpdateImageUrl = (index: number, val: string) => {
    const updated = [...imageUrls];
    updated[index] = val;
    setImageUrls(updated);
  };

  const handleRemoveImageUrl = (index: number) => {
    if (imageUrls.length <= 1) return;
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddFeature = () => {
    setFeatures([...features, '']);
  };

  const handleUpdateFeature = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    if (features.length <= 1) return;
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      alert('Veuillez remplir le nom, le prix et la catégorie.');
      return;
    }

    setLoading(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      const cleanedImages = imageUrls.filter((u) => u.trim().length > 0);
      if (cleanedImages.length === 0) {
        cleanedImages.push('https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1000&q=80');
      }

      const cleanedFeatures = features.filter((f) => f.trim().length > 0);

      const payload = {
        reference: reference || `PG-REF-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        categoryId,
        categoryName: selectedCat?.name || 'Équipements',
        brand,
        model: model || undefined,
        price: Number(price),
        priceCash: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : undefined,
        promotionalPrice: oldPrice && Number(oldPrice) > Number(price) ? Number(price) : undefined,
        priceInstallment: isInstallmentEligible ? Math.round(Number(price) * 1.05) : undefined,
        priceTontine: isTontineEligible ? Number(price) : undefined,
        shortDescription: shortDescription || name,
        fullDescription: fullDescription || shortDescription || name,
        description: shortDescription || name,
        images: cleanedImages,
        features: cleanedFeatures,
        stock: Number(stock),
        status: Number(stock) > 0 ? ('active' as const) : ('out_of_stock' as const),
        isActive: true,
        isFeatured,
        warrantyMonths: Number(warrantyMonths),
        isCashEligible,
        isInstallmentEligible,
        installmentMaxMonths: isInstallmentEligible ? Number(installmentMaxMonths) : undefined,
        installmentMinDepositPercent: isInstallmentEligible ? Number(installmentMinDepositPercent) : undefined,
        isTontineEligible,
      };

      if (productToEdit) {
        await productService.updateProduct(productToEdit.id, payload);
        showToast({
          type: 'success',
          title: 'Produit mis à jour',
          message: `${name} a été modifié avec succès.`,
        });
      } else {
        await productService.createProduct(payload);
        showToast({
          type: 'success',
          title: 'Produit créé dans Firebase',
          message: `${name} ajouté au catalogue central.`,
        });
      }

      onSaved();
      onClose();
    } catch (err) {
      console.error('Save product error:', err);
      alert('Erreur lors de l\'enregistrement dans Firebase.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productToEdit ? 'Modifier le produit' : 'Ajouter un produit au catalogue Firebase'}
      subtitle="Les modifications sont enregistrées en temps réel dans Firestore"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        
        {/* Row 1: Reference, Name, Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Référence Produit *"
            required
            placeholder="Ex: PG-REF-1001"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />

          <div className="sm:col-span-2">
            <Input
              label="Nom commercial de l'équipement *"
              required
              placeholder="Ex: Réfrigérateur No Frost Hisense 260L"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Row 2: Category, Brand, Model */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Catégorie *"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />

          <Input
            label="Marque *"
            required
            placeholder="Ex: Hisense, Samsung, Midea..."
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />

          <Input
            label="Modèle (Optionnel)"
            placeholder="Ex: RD-35WR"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </div>

        {/* Row 3: Pricing & Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Prix Comptant (FCFA) *
            </label>
            <input
              type="number"
              required
              min="1000"
              step="500"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:border-slate-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Ancien Prix (Barré)
            </label>
            <input
              type="number"
              placeholder="Ex: 235000"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Quantité en Stock *
            </label>
            <input
              type="number"
              required
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Garantie (Mois)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={warrantyMonths}
              onChange={(e) => setWarrantyMonths(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-slate-950 focus:outline-none"
            />
          </div>
        </div>

        {/* Descriptions */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Description courte (accroche pour fiche & cartes)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Réfrigérateur combiné tropicalisé avec technologie Total No Frost et distributeur d'eau en façade..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-slate-950 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Description détaillée complète
            </label>
            <textarea
              rows={4}
              placeholder="Présentation complète, technologies embarquées, conseils d'utilisation..."
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-slate-950 focus:outline-none"
            />
          </div>
        </div>

        {/* Image URLs Gallery */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900">
              Galerie Photos (URLs des images)
            </label>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-xs font-bold text-[#9A7426] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une photo</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            La 1ère image est l'image principale. Les suivantes constituent la galerie de la fiche produit.
          </p>

          <div className="space-y-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={url}
                  onChange={(e) => handleUpdateImageUrl(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-950 focus:outline-none font-mono"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Features */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900">
              Caractéristiques Techniques (Points forts)
            </label>
            <button
              type="button"
              onClick={handleAddFeature}
              className="text-xs font-bold text-[#9A7426] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une caractéristique</span>
            </button>
          </div>

          <div className="space-y-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: Capacité 260 Litres, Moteur Inverter tropicalisé..."
                  value={feat}
                  onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-slate-950 focus:outline-none"
                />
                {features.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Commercial Eligibilities Section */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <label className="text-xs font-bold text-slate-900 block">
            Règles d'Éligibilité Commerciale (PENTA GAD)
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            {/* Cash */}
            <label className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-2.5 ${
              isCashEligible ? 'bg-white border-slate-950 text-slate-950 font-bold' : 'border-slate-200 bg-white text-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={isCashEligible}
                onChange={(e) => setIsCashEligible(e.target.checked)}
                className="rounded mt-0.5 text-slate-950 focus:ring-slate-950"
              />
              <div>
                <span>Achat Comptant</span>
                <p className="text-[10px] text-slate-400 font-normal">Disponible pour commande directe</p>
              </div>
            </label>

            {/* Installment */}
            <label className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-2.5 ${
              isInstallmentEligible ? 'bg-white border-slate-950 text-slate-950 font-bold' : 'border-slate-200 bg-white text-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={isInstallmentEligible}
                onChange={(e) => setIsInstallmentEligible(e.target.checked)}
                className="rounded mt-0.5 text-slate-950 focus:ring-slate-950"
              />
              <div>
                <span>Paiement Échelonné</span>
                <p className="text-[10px] text-slate-400 font-normal">Crédit 3, 6 ou 8 mois avec acompte</p>
              </div>
            </label>

            {/* Tontine */}
            <label className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-2.5 ${
              isTontineEligible ? 'bg-white border-slate-950 text-slate-950 font-bold' : 'border-slate-200 bg-white text-slate-500'
            }`}>
              <input
                type="checkbox"
                checked={isTontineEligible}
                onChange={(e) => setIsTontineEligible(e.target.checked)}
                className="rounded mt-0.5 text-slate-950 focus:ring-slate-950"
              />
              <div>
                <span>Tontine Rotative</span>
                <p className="text-[10px] text-slate-400 font-normal">Éligible aux groupes rotatifs (0%)</p>
              </div>
            </label>

          </div>

          <div className="pt-2 flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded text-slate-950 focus:ring-slate-950"
              />
              <span>Mettre en avant sur la page d'accueil (Produit Vedette)</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <Button variant="outline" size="md" type="button" onClick={onClose}>
            Annuler
          </Button>

          <Button variant="primary" size="md" type="submit" isLoading={loading}>
            {productToEdit ? 'Enregistrer les modifications' : 'Créer et publier dans Firestore'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};
