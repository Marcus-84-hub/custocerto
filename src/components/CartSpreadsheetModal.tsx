import React, { useState } from 'react';
import { X, Trash2, SlidersHorizontal } from 'lucide-react';
import { CartItem, ItemCategory } from '../types';
import { formatBRL } from '../utils/calculator';

interface CartSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onUpdateItemFields: (id: string, updatedFields: Partial<CartItem>) => void;
  onEditItem?: (item: CartItem) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Alimentos',
  'Limpeza',
  'Higiene',
  'Bebidas',
  'Hortifruti',
  'Outros',
];

export const CartSpreadsheetModal: React.FC<CartSpreadsheetModalProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onUpdateQuantity,
  onUpdateItemFields,
  onEditItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | ItemCategory>('Todas');

  if (!isOpen) return null;

  // Calculates spreadsheet totals
  const totalCost = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Filters items
  const filteredItems = items.filter(
    (item) => selectedCategory === 'Todas' || item.category === selectedCategory
  );

  // Group and order categories to render
  const categoriesToRender = CATEGORIES.filter((cat) =>
    filteredItems.some((item) => item.category === cat)
  );

  // Include any extra categories present in items that are not in the predefined list
  filteredItems.forEach((item) => {
    if (!categoriesToRender.includes(item.category)) {
      categoriesToRender.push(item.category);
    }
  });

  const handleQtyChange = (id: string, qtyStr: string) => {
    const qty = parseFloat(qtyStr) || 0;
    onUpdateItemFields(id, { quantity: qty });
  };

  const handlePriceChange = (id: string, priceStr: string) => {
    const cleanStr = priceStr.replace(',', '.');
    const price = parseFloat(cleanStr) || 0;
    onUpdateItemFields(id, { price });
  };

  const handleItemDoubleClick = (item: CartItem) => {
    if (onEditItem) {
      onEditItem(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Backdrop closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom duration-300 flex flex-col h-[90vh] sm:h-[80vh] border border-zinc-200/80 dark:border-zinc-800">
        
        {/* Drag handle for mobile view */}
        <div className="w-10 h-1.5 rounded-full bg-[#bccbb8] dark:bg-zinc-800 mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-base font-extrabold text-[#1a1b1f] dark:text-zinc-100 tracking-tight">
              Planilha Excel do Carrinho
            </h3>
            <p className="text-[11px] font-semibold text-[#6d7b6b] dark:text-zinc-400">
              Edição direta em formato de grid (Duplo clique no nome para editar detalhes)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eeedf3] dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Total Panel */}
        <div className="flex justify-between items-center bg-[#eeedf3] dark:bg-zinc-900 rounded-2xl p-4 mb-4">
          <div>
            <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider uppercase block">
              VALOR TOTAL ACUMULADO
            </span>
            <span className="text-2xl font-black text-[#006e28] dark:text-[#53e16f]">
              {formatBRL(totalCost)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider uppercase block">
              PRODUTOS
            </span>
            <span className="text-lg font-black text-[#1a1b1f] dark:text-zinc-200">
              {items.length}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 scrollbar-thin select-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#6d7b6b] dark:text-zinc-400 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory('Todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
              selectedCategory === 'Todas'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            Todas ({items.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = items.filter((item) => item.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Grid Sheet */}
        {filteredItems.length === 0 ? (
          <div className="flex-1 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl bg-[#faf9fe] dark:bg-zinc-900 flex items-center justify-center mb-4">
            <span className="text-sm font-semibold text-[#6d7b6b] dark:text-zinc-400">
              Sem produtos nesta visualização.
            </span>
          </div>
        ) : (
          <div className="flex-1 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl bg-[#faf9fe] dark:bg-zinc-900 overflow-hidden flex flex-col mb-4">
            
            {/* Table Header */}
            <div className="grid grid-cols-[1.8fr_0.9fr_0.6fr_0.9fr_0.9fr_0.4fr] gap-1 bg-[#eeedf3] dark:bg-zinc-800/80 px-4 py-2.5 border-b border-[#bccbb8]/40 dark:border-zinc-700 font-bold text-[10px] text-zinc-700 dark:text-zinc-300 tracking-wider">
              <span>Item / Produto</span>
              <span className="text-center">Medida</span>
              <span className="text-center">Qtd</span>
              <span className="text-center">Preço (R$)</span>
              <span className="text-right">Custo</span>
              <span></span>
            </div>

            {/* Scrollable Table Body */}
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {categoriesToRender.map((category) => {
                const categoryItems = filteredItems.filter((item) => item.category === category);
                const categoryTotal = categoryItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );

                return (
                  <div key={category} className="contents">
                    {/* Category Divider */}
                    <div className="grid grid-cols-1 bg-[#eaf4eb] dark:bg-emerald-950/20 px-4 py-1.5 border-b border-[#bccbb8]/20 dark:border-zinc-800 text-[11px] font-extrabold text-[#006e28] dark:text-[#53e16f]">
                      <span>
                        {category} (Subtotal: {formatBRL(categoryTotal)})
                      </span>
                    </div>

                    {/* Category Items */}
                    {categoryItems.map((item, idx) => {
                      const itemCost = item.price * item.quantity;
                      return (
                        <div
                          key={item.id}
                          className={`grid grid-cols-[1.8fr_0.9fr_0.6fr_0.9fr_0.9fr_0.4fr] gap-1 items-center px-4 py-2 border-b border-[#eeedf3]/60 dark:border-zinc-900/60 text-xs font-semibold ${
                            idx % 2 === 1 ? 'bg-zinc-50/50 dark:bg-zinc-900/30' : 'bg-white dark:bg-zinc-950'
                          }`}
                        >
                          {/* Name (Double Click Edit) */}
                          <div
                            onDoubleClick={() => handleItemDoubleClick(item)}
                            title="Duplo clique para editar completo"
                            className="cursor-pointer font-bold text-zinc-900 dark:text-zinc-100 truncate hover:text-[#006e28] dark:hover:text-[#53e16f] transition-colors select-none"
                          >
                            {item.name}
                          </div>

                          {/* Medida */}
                          <span className="text-center text-zinc-600 dark:text-zinc-400 truncate">
                            {item.unitAmount} {item.unitType}
                          </span>

                          {/* Qty Input */}
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.quantity}
                              onChange={(e) => handleQtyChange(item.id, e.target.value)}
                              className="w-full max-w-[40px] text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#34c759]"
                            />
                          </div>

                          {/* Price Input */}
                          <div className="flex justify-center">
                            <input
                              type="text"
                              value={item.price || ''}
                              onChange={(e) => handlePriceChange(item.id, e.target.value)}
                              placeholder="0,00"
                              className="w-full max-w-[64px] text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#34c759]"
                            />
                          </div>

                          {/* Total Cost */}
                          <span className="text-right font-bold text-[#006e28] dark:text-[#53e16f]">
                            {formatBRL(itemCost)}
                          </span>

                          {/* Delete Btn */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1 text-red-500 hover:text-red-700 active:scale-90 transition-transform"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-zinc-950 font-bold transition-all shadow-md flex items-center justify-center"
        >
          Concluído
        </button>

      </div>
    </div>
  );
};
