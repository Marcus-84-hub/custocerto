import React, { useState } from 'react';
import { Shield, Target, Store, Bell, Check, RotateCcw, Award, PieChart, Sparkles } from 'lucide-react';
import { formatBRL } from '../utils/calculator';

interface BudgetProfileViewProps {
  budgetLimit: number;
  onUpdateBudget: (newLimit: number) => void;
  selectedStore: string;
  onUpdateStore: (store: string) => void;
  onResetData: () => void;
}

export const BudgetProfileView: React.FC<BudgetProfileViewProps> = ({
  budgetLimit,
  onUpdateBudget,
  selectedStore,
  onUpdateStore,
  onResetData,
}) => {
  const [inputLimit, setInputLimit] = useState(budgetLimit.toString());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const stores = [
    'Carrefour - Morumbi',
    'Pão de Açúcar - Jardins',
    'Atacadão - Santo Amaro',
    'Assaí Atacadista',
    'Supermercado Guanabara',
    'Mercado Local do Bairro',
  ];

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputLimit.replace(/\./g, '').replace(',', '.')) || 200;
    onUpdateBudget(parsed);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="pb-36 pt-16 px-5 max-w-md mx-auto space-y-5">
      {/* Context Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest text-[#6d7b6b] dark:text-zinc-400 uppercase block mb-1">
          CONFIGURAÇÃO & BLINDAGEM
        </span>
        <h2 className="text-2xl font-extrabold text-[#1a1b1f] dark:text-white tracking-tight">
          Perfil & Teto de Gastos
        </h2>
        <p className="text-sm text-[#3d4a3c] dark:text-zinc-400 mt-1">
          Ajuste o limite máximo da sua compra atual e selecione o supermercado para calibrar a inteligência de preços.
        </p>
      </div>

      {/* Budget Limit Form */}
      <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#006e28] dark:text-[#53e16f]" />
          <h3 className="font-bold text-base text-[#1a1b1f] dark:text-white">
            Limite do Carrinho (Teto MÁX)
          </h3>
        </div>

        <form onSubmit={handleSaveBudget} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#6d7b6b] block mb-1">
              Valor em Reais (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 font-bold text-gray-400 text-lg">R$</span>
              <input
                type="text"
                value={inputLimit}
                onChange={(e) => setInputLimit(e.target.value)}
                placeholder="200,00"
                className="w-full bg-[#f4f3f8] dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-xl font-bold text-[#1a1b1f] dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#006e28] hover:bg-[#00531c] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <span>Atualizar Limite de Compra</span>
            )}
          </button>
        </form>
      </div>

      {/* Supermarket Selection */}
      <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-[#006e28] dark:text-[#53e16f]" />
          <h3 className="font-bold text-base text-[#1a1b1f] dark:text-white">
            Supermercado Atual
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {stores.map((st) => (
            <button
              key={st}
              onClick={() => onUpdateStore(st)}
              className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                selectedStore === st
                  ? 'border-[#34c759] bg-[#34c759]/10 text-[#004d1a] dark:text-[#72fe88]'
                  : 'border-[#e3e2e7] dark:border-zinc-800 text-[#1a1b1f] dark:text-zinc-300 hover:bg-[#f4f3f8]'
              }`}
            >
              <span>{st}</span>
              {selectedStore === st && <Check className="w-4 h-4 text-[#006e28] dark:text-[#53e16f]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Offline Mode Status Card */}
      <div className="bg-[#f4f3f8] dark:bg-zinc-800/80 rounded-2xl p-4 border border-[#e3e2e7] dark:border-zinc-700 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#006e28]/10 text-[#006e28] dark:text-[#53e16f] flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-[#1a1b1f] dark:text-white">Operação 100% Offline-First</h4>
          <p className="text-xs text-[#6d7b6b] mt-0.5">
            Seus dados são salvos com segurança diretamente no seu dispositivo, garantindo velocidade total sem sinal de internet no mercado.
          </p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-2">
        <button
          onClick={onResetData}
          className="w-full text-xs font-bold text-red-500 hover:text-red-700 border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/20 py-2.5 rounded-xl flex items-center justify-center gap-1.5 active:scale-95 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restaurar Dados Iniciais de Demonstração</span>
        </button>
      </div>
    </div>
  );
};
