import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { formatFCFA } from '../../utils/formatters';
import { ProductFormModal } from './ProductFormModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../context/ToastContext';

export const ProductListAdmin: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = (p: Product) => {
    setProductToEdit(p);
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setProductToEdit(null);
    setModalOpen(true);
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Confirmez-vous la suppression du produit "${p.name}" (${p.reference}) dans Firestore ?`)) {
      return;
    }

    try {
      await productService.deleteProduct(p.id);
      showToast({
        type: 'info',
        title: 'Produit supprimé',
        message: `${p.name} a été retiré de la base Firestore.`,
      });
      loadProducts();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Gestion du Catalogue Central ({products.length})
          </h3>
          <p className="text-xs text-slate-500">
            Source de données officielle Firestore · Synchronisation instantanée
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadProducts}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Actualiser
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNew}
            leftIcon={<Plus className="w-4 h-4 text-[#C5A059]" />}
          >
            Nouveau Produit
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Rechercher par nom, réf, marque..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-slate-950"
        />
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-4">Produit & Référence</th>
              <th className="py-3.5 px-4">Catégorie</th>
              <th className="py-3.5 px-4">Prix Comptant</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4">Éligibilités</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  {loading ? 'Chargement des produits...' : 'Aucun produit trouvé dans Firestore.'}
                </td>
              </tr>
            ) : (
              filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Photo + Name + Ref */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={prod.images[0] || 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=150&q=80'}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate max-w-xs">{prod.name}</span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          <span className="font-mono text-slate-600 font-semibold">{prod.reference}</span>
                          <span>·</span>
                          <span>{prod.brand}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-4 text-slate-600 font-medium">
                    {prod.categoryName}
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-950 font-mono">
                      {formatFCFA(prod.price)}
                    </span>
                    {prod.oldPrice && (
                      <span className="text-[10px] text-slate-400 line-through block">
                        {formatFCFA(prod.oldPrice)}
                      </span>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-3 px-4">
                    {prod.stock > 0 ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                        {prod.stock} en stock
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded text-[11px]">
                        Épuisé
                      </span>
                    )}
                  </td>

                  {/* Eligibilities */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {prod.isCashEligible && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          Comptant
                        </span>
                      )}
                      {prod.isInstallmentEligible && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Échelonné
                        </span>
                      )}
                      {prod.isTontineEligible && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
                          Tontine
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadProducts}
        productToEdit={productToEdit}
      />

    </div>
  );
};
