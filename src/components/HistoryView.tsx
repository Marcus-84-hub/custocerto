import React from 'react';
import { History, TrendingUp, Calendar, ShoppingBag, PiggyBank, Store, ChevronRight } from 'lucide-react';
import { ShoppingSession } from '../types';
import { formatBRL } from '../utils/calculator';

interface HistoryViewProps {
  sessions: ShoppingSession[];
  onStartNewShopping: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onStartNewShopping }) => {
  const totalSpentAllTime = sessions.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalSavedAllTime = sessions.reduce((sum, s) => sum + s.totalSavings, 0);

  // Frequent items inflation radar
  const inflationItems = [
    { name: 'Café Orfeu 250g', oldPrice: 21.90, newPrice: 24.90, percent: 13.6 },
    { name: 'Arroz Tio João 5kg', oldPrice: 25.50, newPrice: 28.00, percent: 9.8 },
    { name: 'Detergente Ypê 500ml', oldPrice: 1.99, newPrice: 2.15, percent: 8.0 },
    { name: 'Feijão Camil 1kg', oldPrice: 8.50, newPrice: 7.80, percent: -8.2 },
  ];

  return (
    <div className="pb-36 pt-16 px-5 max-w-md mx-auto space-y-5">
      {/* Context Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest text-[#6d7b6b] dark:text-zinc-400 uppercase block mb-1">
          HISTÓRICO & RADAR INFLACIONÁRIO
        </span>
        <h2 className="text-2xl font-extrabold text-[#1a1b1f] dark:text-white tracking-tight">
          Minhas Compras
        </h2>
        <p className="text-sm text-[#3d4a3c] dark:text-zinc-400 mt-1">
          Acompanhe seu histórico de gastos nos supermercados e proteja seu bolso contra variações de preços.
        </p>
      </div>

      {/* Savings Summary Banner */}
      <div className="bg-gradient-to-br from-[#006e28] to-[#004d1a] text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-xs text-white/80 font-medium block">Economia Acumulada</span>
            <span className="text-2xl font-black text-white tracking-tight">{formatBRL(totalSavedAllTime)}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-white/70 block">Total Gasto</span>
          <span className="text-sm font-bold text-white/90">{formatBRL(totalSpentAllTime)}</span>
        </div>
      </div>

      {/* Inflation Radar Section */}
      <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-[#1a1b1f] dark:text-white">
              Radar de Inflação de Itens Recorrentes
            </h3>
          </div>
          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full">
            30 dias
          </span>
        </div>

        <div className="divide-y divide-[#f4f3f8] dark:divide-zinc-800">
          {inflationItems.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#1a1b1f] dark:text-white block">{item.name}</span>
                <span className="text-[#6d7b6b]">
                  {formatBRL(item.oldPrice)} → <strong className="text-[#1a1b1f] dark:text-white">{formatBRL(item.newPrice)}</strong>
                </span>
              </div>
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  item.percent > 0
                    ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {item.percent > 0 ? `+${item.percent}%` : `${item.percent}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Sessions History */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#6d7b6b] uppercase tracking-wider block px-1">
          Histórico de Compras ({sessions.length})
        </span>

        {sessions.length === 0 ? (
          <p className="text-sm text-[#6d7b6b] text-center py-8">Nenhuma compra finalizada ainda.</p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-xs flex items-center justify-between hover:border-[#34c759] transition-all cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#006e28] dark:text-[#53e16f]" />
                  <h4 className="font-bold text-sm text-[#1a1b1f] dark:text-white">{session.storeName}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6d7b6b]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {session.date}
                  </span>
                  <span>•</span>
                  <span>{session.itemsCount} itens</span>
                </div>
              </div>

              <div className="text-right flex items-center gap-2">
                <div>
                  <span className="font-bold text-base text-[#006e28] dark:text-[#53e16f] block">
                    {formatBRL(session.totalAmount)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    Economizou {formatBRL(session.totalSavings)}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6d7b6b]" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
