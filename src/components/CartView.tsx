import React from 'react';
import { Plus, Minus, Trash2, Camera, PlusCircle, Sparkles, TrendingUp, CheckCircle, ShoppingBag, ClipboardList } from 'lucide-react';
import { CartItem } from '../types';
import { formatBRL, calculateUnitPrice, getBaseUnitLabel, calculateInflation } from '../utils/calculator';
import { motion, AnimatePresence } from 'motion/react';

interface CartViewProps {
  items: CartItem[];
  budgetLimit: number;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenScanner: () => void;
  onOpenManualAdd: () => void;
  onFinishShopping: () => void;
  onCompareItem?: (item: CartItem) => void;
  onEditItem?: (item: CartItem) => void;
  onOpenSpreadsheet: () => void;
  listName?: string;
  selectedStore?: string;
  storeAddress?: string;
  listProtocol?: string;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  budgetLimit,
  onUpdateQuantity,
  onRemoveItem,
  onOpenScanner,
  onOpenManualAdd,
  onFinishShopping,
  onCompareItem,
  onEditItem,
  onOpenSpreadsheet,
  listName,
  selectedStore,
  storeAddress,
  listProtocol,
}) => {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const remaining = budgetLimit - totalAmount;
  const isOverBudget = remaining < 0;

  // Items with inflation alerts
  const itemsWithInflation = items.filter((item) => {
    if (!item.previousPrice) return false;
    return item.price > item.previousPrice;
  });

  return (
    <div className="pb-36 pt-16 px-5 max-w-md mx-auto space-y-4">
      {/* Budget Summary Card */}
      <div className="bg-[#ffffff] dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#6d7b6b] dark:text-zinc-400 uppercase">
              BLINDAGEM DE CAIXA
            </span>
            <h2 className="text-2xl font-bold text-[#1a1b1f] dark:text-white tracking-tight">
              {formatBRL(totalAmount)}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-medium text-[#6d7b6b] dark:text-zinc-400 block">
              Meta: {formatBRL(budgetLimit)}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                isOverBudget
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : 'bg-[#34c759]/15 text-[#006e28] dark:text-[#72fe88]'
              }`}
            >
              {isOverBudget ? `Excedeu ${formatBRL(Math.abs(remaining))}` : `Resta ${formatBRL(remaining)}`}
            </span>
          </div>
        </div>

        {/* Inflation Alert Banner */}
        {itemsWithInflation.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[#f4f3f8] dark:border-zinc-800/80 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 -mx-4 -mb-4 px-4 py-2.5 rounded-b-2xl">
            <div className="flex items-center gap-1.5 font-medium">
              <TrendingUp className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>{itemsWithInflation.length}</strong> {itemsWithInflation.length === 1 ? 'item subiu' : 'itens subiram'} de preço vs última compra.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* List ID Card */}
      {listProtocol && (
        <div className="bg-[#ffffff] dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2.5 text-xs">
          <div className="flex justify-between items-start">
            <div className="min-w-0 pr-2">
              <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider uppercase block">
                LISTA DE COMPRAS
              </span>
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-150 mt-0.5 truncate">
                {listName || 'Minha Compra'}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[9px] font-bold text-indigo-600 dark:text-[#7f75ff] tracking-wider uppercase block">
                PROTOCOLO
              </span>
              <span className="font-mono font-bold text-[10px] text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded mt-0.5 inline-block">
                {listProtocol}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#f4f3f8] dark:border-zinc-800/80 flex items-start gap-1.5 text-zinc-600 dark:text-zinc-400">
            <span className="text-[10px] font-bold uppercase text-[#6d7b6b] dark:text-zinc-500 mt-0.5">LOCAL:</span>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 block leading-tight">{selectedStore}</span>
              {storeAddress && <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block truncate mt-0.5 leading-tight">{storeAddress}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Cart Items List */}
      {items.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="w-20 h-20 bg-[#eeedf3] dark:bg-zinc-800/60 rounded-full flex items-center justify-center mx-auto text-[#6d7b6b]">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-[#1a1b1f] dark:text-white">Seu carrinho está vazio</h3>
            <p className="text-sm text-[#3d4a3c] dark:text-zinc-400 max-w-[260px] mx-auto">
              Bipe o código de barras ou adicione produtos para acompanhar o total em tempo real no corredor.
            </p>
          </div>
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-2 bg-[#006e28] hover:bg-[#00531c] text-white px-6 py-3 rounded-full font-bold shadow-md active:scale-95 transition-all text-sm"
          >
            <Camera className="w-4 h-4" />
            <span>Bipar Primeiro Produto</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-[#6d7b6b] uppercase tracking-wider">
              Itens no Carrinho ({totalItemsCount})
            </span>
            <button
              onClick={onOpenManualAdd}
              className="text-xs font-semibold text-[#006e28] dark:text-[#53e16f] flex items-center gap-1 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Adicionar Manual</span>
            </button>
          </div>

          <AnimatePresence>
            {items.map((item) => {
              const unitPrice = calculateUnitPrice(item.price, item.unitAmount, item.unitType);
              const baseUnit = getBaseUnitLabel(item.unitType);
              const inflation = calculateInflation(item.price, item.previousPrice);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white dark:bg-zinc-900/90 rounded-2xl p-3.5 border border-[#e3e2e7] dark:border-zinc-800 shadow-sm flex items-center gap-3 relative"
                >
                  {/* Thumbnail & Product Details (Click to Edit) */}
                  <div
                    onClick={() => onEditItem?.(item)}
                    className="flex-grow flex items-center gap-3 min-w-0 cursor-pointer select-none"
                    title="Editar item"
                  >
                    {/* Thumbnail / Category Icon */}
                    <div className="w-14 h-14 rounded-xl bg-[#f4f3f8] dark:bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-black/5">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl">🛒</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-[#1a1b1f] dark:text-white text-base leading-tight truncate">
                          {item.name}
                        </h3>
                        {inflation.isHigher && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />+{inflation.percent}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-lg font-bold text-[#006e28] dark:text-[#53e16f]">
                          {formatBRL(item.price)}
                        </span>
                        <span className="text-xs text-[#6d7b6b] font-medium">
                          {formatBRL(unitPrice)} / {baseUnit}
                        </span>
                      </div>

                      {/* Quick compare trigger */}
                      {onCompareItem && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening edit modal
                            onCompareItem(item);
                          }}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1 mt-0.5 hover:underline"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Comparar embalagens</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 active:scale-90 transition-transform"
                      aria-label="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center bg-[#eeedf3] dark:bg-zinc-800 rounded-full px-1 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-[#006e28] dark:text-[#53e16f] font-bold rounded-full hover:bg-white/50 active:scale-90 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 font-bold text-sm text-[#1a1b1f] dark:text-white min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#006e28] dark:text-[#53e16f] font-bold rounded-full hover:bg-white/50 active:scale-90 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Finish Shopping Button */}
          <button
            onClick={onFinishShopping}
            className="w-full mt-4 bg-white dark:bg-zinc-900 border border-[#34c759] text-[#006e28] dark:text-[#53e16f] py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-[#34c759]/10 active:scale-98 transition-all"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Finalizar Compra & Salvar no Histórico</span>
          </button>

          {/* Spreadsheet Button */}
          <button
            onClick={onOpenSpreadsheet}
            className="w-full mt-2 bg-white dark:bg-zinc-900 border border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-950/20 active:scale-98 transition-all text-sm"
          >
            <ClipboardList className="w-5 h-5" />
            <span>Ver Planilha de Itens</span>
          </button>
        </div>
      )}

      {/* Floating Action Bar (Scanner & Add CTA) */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-5 flex justify-center">
        <button
          onClick={onOpenScanner}
          className="bg-[#006e28] hover:bg-[#00531c] text-white px-6 py-3.5 rounded-full shadow-[0_8px_30px_rgba(0,110,40,0.35)] flex items-center justify-center gap-2.5 font-bold text-base active:scale-95 transition-all w-auto min-w-[240px]"
        >
          <Camera className="w-5 h-5 stroke-[2.2]" />
          <span>Bipar Código de Barras</span>
        </button>
      </div>
    </div>
  );
};
