import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ClipboardList,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Square,
  CheckSquare,
} from 'lucide-react';
import { CartItem, ItemCategory, UnitType } from '../types';
import { formatBRL } from '../utils/calculator';

interface AnalyticalListViewProps {
  planningList: CartItem[];
  budgetLimit: number;
  onAddPlanningItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  onRemovePlanningItem: (id: string) => void;
  onUpdatePlanningItem: (id: string, field: keyof CartItem, value: any) => void;
  onClearPlanningList: () => void;
  onCopyPlanningListToCart: () => void;
  onTogglePlanningItemCheck: (id: string) => void;
  onMovePlanningItem: (id: string, direction: 'up' | 'down') => void;
  onSwitchToCartTab: () => void;
  showAlert: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
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

export const AnalyticalListView: React.FC<AnalyticalListViewProps> = ({
  planningList,
  budgetLimit,
  onAddPlanningItem,
  onRemovePlanningItem,
  onUpdatePlanningItem,
  onClearPlanningList,
  onCopyPlanningListToCart,
  onTogglePlanningItemCheck,
  onMovePlanningItem,
  onSwitchToCartTab,
  showAlert,
  showConfirm,
}) => {
  // Input states for adding new planning items
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Alimentos');
  const [unitType, setUnitType] = useState<UnitType>('un');
  const [unitAmount, setUnitAmount] = useState('1');
  const [quantity, setQuantity] = useState('1');

  // Filter state for categories
  const [selectedFilter, setSelectedFilter] = useState<'Todas' | ItemCategory>('Todas');

  // Group items by category, taking the filter into account
  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    if (selectedFilter !== 'Todas' && selectedFilter !== cat) {
      return acc;
    }

    const items = planningList.filter((item) => item.category === cat);
    if (items.length > 0) {
      acc[cat] = items;
    }
    return acc;
  }, {} as Record<ItemCategory, CartItem[]>);

  // Calculates planning totals
  const totalPlannedCost = planningList.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const totalTickedCost = planningList
    .filter((item) => item.isChecked)
    .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showAlert('Nome Requerido', 'Por favor, digite o nome do produto.');
      return;
    }

    const parsedQty = parseFloat(quantity) || 1;
    const parsedAmount = parseFloat(unitAmount) || 1;

    onAddPlanningItem({
      name: name.trim(),
      category,
      unitType,
      unitAmount: parsedAmount,
      quantity: parsedQty,
      price: 0, // Starts at 0, prices are filled in the supermarket
      isChecked: false,
    });

    // Reset fields
    setName('');
    setQuantity('1');
    setUnitAmount('1');
  };

  const handleClearList = () => {
    showConfirm(
      'Iniciar Nova Lista?',
      'Isso removerá todos os produtos planejados da sua lista prévia atual. Deseja continuar?',
      onClearPlanningList
    );
  };

  const updateItemQty = (id: string, qtyStr: string) => {
    const qty = parseFloat(qtyStr) || 0;
    onUpdatePlanningItem(id, 'quantity', qty);
  };

  const updateItemPrice = (id: string, priceStr: string) => {
    const cleanStr = priceStr.replace(',', '.');
    const price = parseFloat(cleanStr) || 0;
    onUpdatePlanningItem(id, 'price', price);
  };

  return (
    <div className="pb-36 pt-16 px-5 max-w-md mx-auto space-y-4">
      {/* Banner Informação */}
      <div className="flex bg-[#34c759]/12 border border-[#34c759]/10 rounded-2xl p-4 gap-3 items-start shadow-sm">
        <ClipboardList className="w-5 h-5 text-[#006e28] dark:text-[#53e16f] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-extrabold text-[#004d1a] dark:text-[#72fe88] mb-0.5">
            Planejamento Prévio
          </h4>
          <p className="text-[11px] font-semibold text-[#3d4f3b] dark:text-zinc-400 leading-normal">
            Monte sua lista de compras. No supermercado, marque os itens e digite seus preços reais para acompanhar o orçamento atualizado.
          </p>
        </div>
      </div>

      {/* Formulário de Adição Rápida */}
      <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-[#1a1b1f] dark:text-zinc-150 uppercase tracking-wide">
          Planejar Novo Item
        </h3>

        <form onSubmit={handleAddItem} className="space-y-3">
          <input
            type="text"
            placeholder="Ex: Arroz Tipo 1, Feijão Preto..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#eeedf3] dark:bg-zinc-800 border-none rounded-xl h-10 px-4 text-xs font-semibold text-[#1a1b1f] dark:text-white placeholder-[#8a898e] focus:outline-none focus:ring-1 focus:ring-[#34c759]"
          />

          {/* Categoria Chips */}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
              CATEGORIA
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin select-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 ${
                    category === cat
                      ? 'bg-[#34c759]/20 border border-[#34c759] text-[#004d1a] dark:text-[#72fe88]'
                      : 'bg-[#eeedf3] dark:bg-zinc-800 text-[#1a1b1f] dark:text-zinc-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Unidade Selector */}
            <div className="col-span-2 flex flex-col">
              <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
                MEDIDA
              </span>
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin select-none">
                {UNITS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnitType(u)}
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex-shrink-0 ${
                      unitType === u
                        ? 'bg-[#34c759]/20 border border-[#34c759] text-[#004d1a] dark:text-[#72fe88]'
                        : 'bg-[#eeedf3] dark:bg-zinc-800 text-[#1a1b1f] dark:text-zinc-300'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>

            {/* Qtd */}
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
                QUANTIDADE
              </span>
              <input
                type="number"
                min="0.01"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-[#eeedf3] dark:bg-zinc-800 border-none rounded-xl h-8 text-center text-xs font-bold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#34c759]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center bg-[#34c759] hover:bg-[#2cb24e] text-[#004d1a] font-bold rounded-xl h-10 gap-1.5 transition-all text-xs shadow-sm mt-1"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar ao Planejamento</span>
          </button>
        </form>
      </div>

      {/* Filtros de Categoria da Lista */}
      {planningList.length > 0 && (
        <div className="flex flex-col gap-1.5 select-none">
          <span className="text-[9px] font-bold text-[#6d7b6b] dark:text-zinc-400 uppercase tracking-wider px-1">
            Filtrar Categoria:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedFilter('Todas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 ${
                selectedFilter === 'Todas'
                  ? 'bg-[#006e28] border-[#006e28] text-white'
                  : 'bg-white border-[#e3e2e7] dark:bg-zinc-900 dark:border-zinc-800 text-[#6d7b6b]'
              }`}
            >
              Todas ({planningList.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = planningList.filter((item) => item.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 ${
                    selectedFilter === cat
                      ? 'bg-[#006e28] border-[#006e28] text-white'
                      : 'bg-white border-[#e3e2e7] dark:bg-zinc-900 dark:border-zinc-800 text-[#6d7b6b]'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabela de Lista por Categorias */}
      {planningList.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <span className="text-3xl">📝</span>
          <h3 className="font-bold text-sm text-[#1a1b1f] dark:text-white">Sua lista prévia está vazia</h3>
          <p className="text-xs text-[#6d7b6b] dark:text-zinc-400 px-4">
            Adicione itens acima para começar a planejar suas compras!
          </p>
        </div>
      ) : Object.keys(groupedItems).length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <span className="text-3xl">🔍</span>
          <h3 className="font-bold text-sm text-[#1a1b1f] dark:text-white">Nenhum item encontrado</h3>
          <p className="text-xs text-[#6d7b6b] dark:text-zinc-400 px-4">
            Selecione "Todas" ou adicione novos produtos nessa categoria.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.keys(groupedItems).map((catName) => {
            const items = groupedItems[catName as ItemCategory];
            return (
              <div
                key={catName}
                className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-sm"
              >
                <h3 className="text-xs font-extrabold text-[#006e28] dark:text-[#53e16f] uppercase mb-3 tracking-wider">
                  {catName}
                </h3>

                {/* Table Header */}
                <div className="grid grid-cols-[0.4fr_1.8fr_0.6fr_0.9fr_0.8fr_0.4fr_0.4fr] gap-1 pb-1.5 border-b border-[#eeedf3] dark:border-zinc-800 font-bold text-[8px] text-[#6d7b6b] uppercase tracking-wider items-center">
                  <span></span>
                  <span>Item</span>
                  <span className="text-center">Qtd</span>
                  <span className="text-center">Preço (R$)</span>
                  <span className="text-right">Custo</span>
                  <span className="text-center">Ord</span>
                  <span></span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-[#eeedf3]/30 dark:divide-zinc-850">
                  {items.map((item) => {
                    const cost = (item.price || 0) * item.quantity;
                    const isChecked = !!item.isChecked;

                    return (
                      <div
                        key={item.id}
                        className={`grid grid-cols-[0.4fr_1.8fr_0.6fr_0.9fr_0.8fr_0.4fr_0.4fr] gap-1 py-2 items-center text-xs font-semibold ${
                          isChecked ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <button
                          onClick={() => onTogglePlanningItemCheck(item.id)}
                          className="flex justify-start text-zinc-400 dark:text-zinc-600 hover:text-[#34c759]"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-[#34c759] fill-[#34c759]/10" />
                          ) : (
                            <Square className="w-4.5 h-4.5" />
                          )}
                        </button>

                        {/* Name and Measure */}
                        <div className="flex flex-col min-w-0 pr-1">
                          <span
                            className={`font-bold text-zinc-900 dark:text-zinc-100 truncate ${
                              isChecked ? 'line-through text-zinc-400' : ''
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-[9px] text-[#6d7b6b] dark:text-zinc-400">
                            {item.unitAmount} {item.unitType}
                          </span>
                        </div>

                        {/* Quantity */}
                        <div className="flex justify-center">
                          <input
                            type="number"
                            disabled={isChecked}
                            value={item.quantity}
                            onChange={(e) => updateItemQty(item.id, e.target.value)}
                            className="w-full max-w-[36px] text-center bg-[#f4f3f8] dark:bg-zinc-800 border-none rounded px-0.5 py-0.5 text-[11px] font-bold disabled:opacity-60"
                          />
                        </div>

                        {/* Price */}
                        <div className="flex justify-center">
                          <input
                            type="text"
                            disabled={isChecked}
                            placeholder="0,00"
                            value={item.price > 0 ? item.price : ''}
                            onChange={(e) => updateItemPrice(item.id, e.target.value)}
                            className="w-full max-w-[54px] text-center bg-[#f4f3f8] dark:bg-zinc-800 border-none rounded px-0.5 py-0.5 text-[11px] font-bold placeholder-[#bccbb8] disabled:opacity-60"
                          />
                        </div>

                        {/* Cost */}
                        <span
                          className={`text-right font-extrabold text-zinc-900 dark:text-zinc-100 ${
                            isChecked ? 'line-through text-zinc-400' : ''
                          }`}
                        >
                          {formatBRL(cost)}
                        </span>

                        {/* Reorder Up/Down */}
                        <div className="flex flex-col items-center justify-center">
                          <button
                            disabled={isChecked}
                            onClick={() => onMovePlanningItem(item.id, 'up')}
                            className="disabled:opacity-20 text-[#006e28] dark:text-[#53e16f]"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={isChecked}
                            onClick={() => onMovePlanningItem(item.id, 'down')}
                            className="disabled:opacity-20 text-[#006e28] dark:text-[#53e16f] -mt-1.5"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Delete button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => onRemovePlanningItem(item.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resumo Final Planejado */}
      {planningList.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Total Planejado:
              </span>
              <span className="text-[11px] font-bold text-[#6d7b6b] dark:text-zinc-400 block mt-0.5">
                No Carrinho (Marcados): {formatBRL(totalTickedCost)}
              </span>
            </div>
            <span className="text-xl font-black text-[#006e28] dark:text-[#53e16f]">
              {formatBRL(totalPlannedCost)}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClearList}
              className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 border border-red-500 text-red-700 dark:text-red-400 font-bold rounded-xl h-11 text-xs hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Lista</span>
            </button>

            <button
              onClick={onCopyPlanningListToCart}
              disabled={planningList.filter((item) => item.isChecked).length === 0}
              className="flex-[1.5] flex items-center justify-center gap-1.5 bg-[#34c759] disabled:bg-zinc-200 disabled:text-zinc-400 dark:disabled:bg-zinc-800 hover:bg-[#2cb24e] text-[#004d1a] disabled:shadow-none font-bold rounded-xl h-11 text-xs transition-all shadow-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Trazer para o Carrinho</span>
            </button>
          </div>

          <button
            onClick={onSwitchToCartTab}
            className="w-full text-center text-xs font-bold text-[#006e28] dark:text-[#53e16f] hover:underline block pt-1 border-t border-zinc-150/40 dark:border-zinc-800"
          >
            Ver Carrinho Ativo
          </button>
        </div>
      )}
    </div>
  );
};
