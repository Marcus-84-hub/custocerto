import React, { useState } from 'react';
import { X, Plus, ShoppingCart, Tag } from 'lucide-react';
import { CartItem, ItemCategory, UnitType } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddItem }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [unitAmount, setUnitAmount] = useState('1');
  const [unitType, setUnitType] = useState<UnitType>('kg');
  const [category, setCategory] = useState<ItemCategory>('Alimentos');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price.replace(/\./g, '').replace(',', '.')) || 0;
    const parsedAmount = parseFloat(unitAmount.replace(',', '.')) || 1;

    if (!name.trim() || parsedPrice <= 0) return;

    onAddItem({
      name: name.trim(),
      brand: brand.trim() || undefined,
      price: parsedPrice,
      quantity: 1,
      unitAmount: parsedAmount,
      unitType,
      category,
    });

    // Reset and close
    setName('');
    setBrand('');
    setPrice('');
    setUnitAmount('1');
    onClose();
  };

  const quickPresets = [
    { name: 'Arroz 5kg', price: '28,00', amount: 5, unit: 'kg' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Feijão 1kg', price: '7,80', amount: 1, unit: 'kg' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Óleo de Soja 900ml', price: '6,50', amount: 900, unit: 'mL' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Açúcar 1kg', price: '4,90', amount: 1, unit: 'kg' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Café 250g', price: '24,90', amount: 250, unit: 'g' as UnitType, category: 'Alimentos' as ItemCategory },
  ];

  const applyPreset = (p: typeof quickPresets[0]) => {
    setName(p.name);
    setPrice(p.price);
    setUnitAmount(p.amount.toString());
    setUnitType(p.unit);
    setCategory(p.category);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 max-w-md mx-auto w-full space-y-4 border-t border-[#e3e2e7] dark:border-zinc-800 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-2 border-b border-[#f4f3f8] dark:border-zinc-800">
          <h3 className="font-bold text-lg text-[#1a1b1f] dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#006e28] dark:text-[#53e16f]" />
            <span>Adicionar Produto Manual</span>
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div>
          <span className="text-[11px] font-bold text-[#6d7b6b] uppercase block mb-1.5">Atalhos Frequentes</span>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {quickPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => applyPreset(p)}
                className="text-xs font-semibold bg-[#f4f3f8] dark:bg-zinc-800 text-[#1a1b1f] dark:text-white px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-[#34c759]/20"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-[#6d7b6b] block mb-1">Nome do Produto</label>
            <input
              type="text"
              required
              placeholder="Ex: Sabão Omo, Arroz, Leite..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-[#1a1b1f] dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-[#6d7b6b] block mb-1">Preço Total (R$)</label>
              <input
                type="text"
                required
                placeholder="18,90"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-bold text-[#006e28] dark:text-[#53e16f]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6d7b6b] block mb-1">Marca (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Ypê, Camil"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-[#1a1b1f] dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold text-[#6d7b6b] block mb-1">Tamanho da Embalagem</label>
              <input
                type="text"
                value={unitAmount}
                onChange={(e) => setUnitAmount(e.target.value)}
                className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-semibold text-[#1a1b1f] dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6d7b6b] block mb-1">Unidade</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value as UnitType)}
                className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl px-2 py-2 text-sm font-semibold text-[#1a1b1f] dark:text-white"
              >
                <option value="kg">Quilograma (kg)</option>
                <option value="g">Grama (g)</option>
                <option value="L">Litro (L)</option>
                <option value="mL">Mililitro (mL)</option>
                <option value="rolo">Rolo</option>
                <option value="un">Unidade (un)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6d7b6b] block mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ItemCategory)}
              className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl px-2 py-2 text-sm font-semibold text-[#1a1b1f] dark:text-white"
            >
              <option value="Alimentos">Alimentos</option>
              <option value="Limpeza">Limpeza</option>
              <option value="Higiene">Higiene</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Hortifruti">Hortifruti</option>
              <option value="Outros">Outros</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#006e28] hover:bg-[#00531c] text-white font-bold h-12 rounded-2xl flex items-center justify-center gap-2 text-base active:scale-98 transition-all mt-2"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar ao Carrinho</span>
          </button>
        </form>
      </div>
    </div>
  );
};
