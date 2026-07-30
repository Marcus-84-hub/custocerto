import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Sparkles } from 'lucide-react';
import { CartItem, ItemCategory, UnitType } from '../types';
import { formatBRL, calculateUnitPrice, getBaseUnitLabel } from '../utils/calculator';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onSave: (id: string, updatedFields: Partial<CartItem>) => void;
  showAlert: (title: string, message: string) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Alimentos',
  'Limpeza',
  'Higiene',
  'Bebidas',
  'Hortifruti',
  'Outros',
];

const UNITS: UnitType[] = ['kg', 'g', 'L', 'mL', 'un', 'rolo', 'caixa', 'pacote'];

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
  showAlert,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitAmount, setUnitAmount] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('un');
  const [category, setCategory] = useState<ItemCategory>('Alimentos');

  // Load item data when modal opens
  useEffect(() => {
    if (item && isOpen) {
      setName(item.name || '');
      setBrand(item.brand || '');
      setPrice(item.price ? item.price.toString() : '0');
      setQuantity(item.quantity ? item.quantity.toString() : '1');
      setUnitAmount(item.unitAmount ? item.unitAmount.toString() : '1');
      setUnitType(item.unitType || 'un');
      setCategory(item.category || 'Alimentos');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  // Real-time calculations for feedback
  const numPrice = parseFloat(price.replace(',', '.')) || 0;
  const numQty = parseFloat(quantity) || 1;
  const numAmount = parseFloat(unitAmount) || 1;
  const totalCost = numPrice * numQty;

  const unitPrice = calculateUnitPrice(numPrice, numAmount, unitType);
  const baseUnit = getBaseUnitLabel(unitType);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Nome Requerido', 'Por favor, insira o nome do produto.');
      return;
    }

    onSave(item.id, {
      name: name.trim(),
      brand: brand.trim() || undefined,
      price: numPrice,
      quantity: numQty,
      unitAmount: numAmount,
      unitType,
      category,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Backdrop closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#faf9fe] dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-y-auto border border-zinc-200/80 dark:border-zinc-800">
        
        {/* Handle Bar for mobile drag-like look */}
        <div className="w-10 h-1.5 rounded-full bg-[#bccbb8] dark:bg-zinc-800 mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#006e28] dark:text-[#53e16f]">
            <ShoppingCart className="w-5 h-5 stroke-[2.2]" />
            <h3 className="text-lg font-extrabold text-[#1a1b1f] dark:text-zinc-100 tracking-tight">
              Editar Produto
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eeedf3] dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Nome */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
              NOME DO PRODUTO *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sabão em Pó, Arroz..."
              className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34c759] focus:border-transparent transition-all"
            />
          </div>

          {/* Marca */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
              MARCA / FABRICANTE
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ex: Omo, Tio João (Opcional)..."
              className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34c759] focus:border-transparent transition-all"
            />
          </div>

          {/* Preço e Qtd */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
                PREÇO UNITÁRIO (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34c759] focus:border-transparent transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
                QUANTIDADE
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
                className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34c759] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Conteúdo da Embalagem e Medida */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
                CONTEÚDO DA EMBALAGEM
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={unitAmount}
                onChange={(e) => setUnitAmount(e.target.value)}
                placeholder="Ex: 500, 1, 250"
                className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#34c759] focus:border-transparent transition-all"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
                MEDIDA
              </label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnitType(u)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                      unitType === u
                        ? 'bg-[#34c759]/20 border-[#34c759] text-[#004d1a] dark:text-[#72fe88]'
                        : 'bg-white dark:bg-zinc-900 border-[#e3e2e7] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
              CATEGORIA
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                    category === cat
                      ? 'bg-[#34c759]/20 border-[#34c759] text-[#004d1a] dark:text-[#72fe88]'
                      : 'bg-white dark:bg-zinc-900 border-[#e3e2e7] dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Card */}
          <div className="bg-[#34c759]/8 dark:bg-emerald-950/20 border border-[#34c759]/10 rounded-2xl p-4 space-y-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#3d4f3b] dark:text-zinc-400">
                Custo do Item:
              </span>
              <span className="text-base font-extrabold text-[#006e28] dark:text-[#53e16f]">
                {formatBRL(totalCost)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#3d4f3b] dark:text-zinc-400">
                Preço por Unidade:
              </span>
              <div className="flex items-center text-xs font-extrabold text-[#006e28] dark:text-[#53e16f]">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>
                  {formatBRL(unitPrice)} / {baseUnit}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-[#eeedf3] dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#1a1b1f] dark:text-zinc-200 font-bold rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[1.5] h-12 bg-[#006e28] hover:bg-[#00531c] text-white font-bold rounded-2xl shadow-md transition-all"
            >
              Salvar Alterações
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
