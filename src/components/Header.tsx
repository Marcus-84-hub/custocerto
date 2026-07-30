import { ShoppingBag, SlidersHorizontal, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { formatBRL } from '../utils/calculator';

interface HeaderProps {
  totalCartAmount: number;
  budgetLimit: number;
  itemCount: number;
  onOpenBudgetModal: () => void;
  onOpenMenu: () => void;
  onOpenNewListModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCartAmount,
  budgetLimit,
  itemCount,
  onOpenBudgetModal,
  onOpenMenu,
  onOpenNewListModal,
}) => {
  const isOverBudget = totalCartAmount > budgetLimit;
  const budgetPercent = Math.min(Math.round((totalCartAmount / budgetLimit) * 100), 100);
  const remaining = budgetLimit - totalCartAmount;

  return (
    <header className="fixed top-0 w-full z-40 bg-[#faf9fe]/85 dark:bg-[#121212]/85 backdrop-blur-xl border-b border-[#e3e2e7] dark:border-zinc-800 transition-all duration-300">
      <div className="max-w-md mx-auto px-5 h-14 flex items-center justify-between">
        {/* Brand Logo & Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenMenu}
            className="p-1.5 -ml-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#006e28] dark:text-[#53e16f] transition-colors"
            aria-label="Menu"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-[#006e28] dark:text-[#53e16f]">
              CustoCerto
            </span>
            {itemCount > 0 && (
              <span className="bg-[#006e28]/10 text-[#006e28] dark:text-[#53e16f] text-xs font-bold px-2 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>
        </div>

        {/* Start New List Icon Button */}
        <button
          onClick={onOpenNewListModal}
          className="p-2 rounded-xl bg-[#006e28]/5 hover:bg-[#006e28]/10 text-[#006e28] dark:text-[#53e16f] dark:bg-white/5 dark:hover:bg-white/10 transition-all duration-300 active:scale-95 flex items-center justify-center border border-[#006e28]/10 dark:border-white/5"
          title="Iniciar Nova Lista de Compras"
        >
          <FileSpreadsheet className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        {/* Budget Pill Badge */}
        <button
          onClick={onOpenBudgetModal}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
            isOverBudget
              ? 'bg-red-500 text-white animate-pulse'
              : 'bg-[#34c759]/20 text-[#004d1a] dark:text-[#72fe88] hover:bg-[#34c759]/30'
          }`}
        >
          {isOverBudget && <AlertCircle className="w-3.5 h-3.5" />}
          <span>{formatBRL(totalCartAmount)}</span>
        </button>
      </div>

      {/* Budget Health Bar Indicator */}
      <div className="w-full bg-[#eeedf3] dark:bg-zinc-800 h-1 relative overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isOverBudget
              ? 'bg-red-500'
              : budgetPercent > 80
              ? 'bg-amber-500'
              : 'bg-[#006e28] dark:bg-[#53e16f]'
          }`}
          style={{ width: `${budgetPercent}%` }}
        />
      </div>
    </header>
  );
};
