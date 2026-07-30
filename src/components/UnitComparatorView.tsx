import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowDown, CheckCircle, Plus, Trash2, Scale, Info, HelpCircle } from 'lucide-react';
import { CartItem, UnitType } from '../types';
import { evaluateComparison, formatBRL } from '../utils/calculator';
import { motion } from 'motion/react';

interface UnitComparatorViewProps {
  onSelectOptionForCart?: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  initialItemToCompare?: CartItem | null;
}

interface OptionInput {
  id: string;
  name: string;
  price: string;
  size: string;
  unit: UnitType;
}

export const UnitComparatorView: React.FC<UnitComparatorViewProps> = ({
  onSelectOptionForCart,
  initialItemToCompare,
}) => {
  const [productCategoryName, setProductCategoryName] = useState('Sabão em Pó');
  const [bannerImageUrl, setBannerImageUrl] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBo8kS2AdfvWJxoxozhK0-DIFJoucmjBuA1bc_sClCdcJ9Kr3y4GgDwie9OnzKWM_mD7jcGHKxICAs5NkqJE01JjvPDkXsqA1UvWxkLA508KPtWXMNGmd8wsUye_ll7ieKs2v3IKY-193nZwuvJpIO1tRZ-UhWksEvK3htIbxiSg94gs9OhE4KEWY3JaPQjYBf-5IajlAIOJWKRKxPWoFjUf55Affg1uXpCpexreBLDlEXNulgoYKa-bQ'
  );

  const [options, setOptions] = useState<OptionInput[]>([
    { id: 'opt-1', name: 'Embalagem 1kg', price: '18,90', size: '1', unit: 'kg' },
    { id: 'opt-2', name: 'Embalagem 2kg', price: '32,50', size: '2', unit: 'kg' },
  ]);

  const [addedNotice, setAddedNotice] = useState(false);

  // If initial item passed, initialize comparison with realistic package options
  useEffect(() => {
    if (initialItemToCompare) {
      setProductCategoryName(initialItemToCompare.name);
      if (initialItemToCompare.imageUrl) {
        setBannerImageUrl(initialItemToCompare.imageUrl);
      }
      setOptions([
        {
          id: 'opt-1',
          name: `Embalagem ${initialItemToCompare.unitAmount}${initialItemToCompare.unitType}`,
          price: initialItemToCompare.price.toFixed(2).replace('.', ','),
          size: initialItemToCompare.unitAmount.toString(),
          unit: initialItemToCompare.unitType,
        },
        {
          id: 'opt-2',
          name: `Embalagem ${initialItemToCompare.unitAmount * 2}${initialItemToCompare.unitType} (Econômica)`,
          price: (initialItemToCompare.price * 1.75).toFixed(2).replace('.', ','),
          size: (initialItemToCompare.unitAmount * 2).toString(),
          unit: initialItemToCompare.unitType,
        },
      ]);
    }
  }, [initialItemToCompare]);

  // Preset selector
  const loadPreset = (type: 'sabao' | 'detergente' | 'papel' | 'cerveja' | 'azeite') => {
    if (type === 'sabao') {
      setProductCategoryName('Sabão em Pó');
      setBannerImageUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuBo8kS2AdfvWJxoxozhK0-DIFJoucmjBuA1bc_sClCdcJ9Kr3y4GgDwie9OnzKWM_mD7jcGHKxICAs5NkqJE01JjvPDkXsqA1UvWxkLA508KPtWXMNGmd8wsUye_ll7ieKs2v3IKY-193nZwuvJpIO1tRZ-UhWksEvK3htIbxiSg94gs9OhE4KEWY3JaPQjYBf-5IajlAIOJWKRKxPWoFjUf55Affg1uXpCpexreBLDlEXNulgoYKa-bQ');
      setOptions([
        { id: 'opt-1', name: 'Embalagem 1kg', price: '18,90', size: '1', unit: 'kg' },
        { id: 'opt-2', name: 'Embalagem 2kg', price: '32,50', size: '2', unit: 'kg' },
      ]);
    } else if (type === 'detergente') {
      setProductCategoryName('Detergente Líquido');
      setBannerImageUrl('https://lh3.googleusercontent.com/aida-public/AB6AXuBRnpdYhZN7OlrYqstbZqfwwBXG7X_qpolOY9yvKZU3_mnpZre3YFzy2l7KnRbD8nyAk727ebVKIVmu9CKrRWajQvsMm-j0us0OfXl76t6gkAKEFSaHl4COL1j2uXGo46vxVVK7l1Sl-GWsjnyQWjScywsgMCCnpD9c3CKjak3jg5csFzsfvI1Advjf8ma0b2vGr-whzLr5BMQuwHvYnmNevOkfYyILUGFAdAaO-lYNWwpONWFBrlPBqg');
      setOptions([
        { id: 'opt-1', name: 'Frasco 500ml', price: '2,50', size: '500', unit: 'mL' },
        { id: 'opt-2', name: 'Pack Leve 6 Pague 5 (3L)', price: '12,90', size: '3000', unit: 'mL' },
      ]);
    } else if (type === 'papel') {
      setProductCategoryName('Papel Higiênico Folha Dupla');
      setBannerImageUrl('https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&auto=format&fit=crop&q=80');
      setOptions([
        { id: 'opt-1', name: 'Pacote 12 rolos', price: '22,90', size: '12', unit: 'rolo' },
        { id: 'opt-2', name: 'Pacote 24 rolos', price: '39,90', size: '24', unit: 'rolo' },
      ]);
    } else if (type === 'cerveja') {
      setProductCategoryName('Cerveja Puro Malte');
      setBannerImageUrl('https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400&auto=format&fit=crop&q=80');
      setOptions([
        { id: 'opt-1', name: 'Lata 350ml', price: '4,20', size: '350', unit: 'mL' },
        { id: 'opt-2', name: 'Latão 473ml', price: '5,10', size: '473', unit: 'mL' },
      ]);
    } else if (type === 'azeite') {
      setProductCategoryName('Azeite de Oliva Extra Virgem');
      setBannerImageUrl('https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80');
      setOptions([
        { id: 'opt-1', name: 'Garrafa 500ml', price: '38,90', size: '500', unit: 'mL' },
        { id: 'opt-2', name: 'Lata 1 Litro', price: '68,00', size: '1000', unit: 'mL' },
      ]);
    }
  };

  const handleUpdateOption = (id: string, field: keyof OptionInput, value: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, [field]: value } : opt))
    );
  };

  const handleAddOption = () => {
    const nextIdx = options.length + 1;
    setOptions((prev) => [
      ...prev,
      { id: `opt-${Date.now()}`, name: `Opção ${nextIdx}`, price: '10,00', size: '1', unit: 'kg' },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  // Convert inputs to calculation options
  const numericOptions = options.map((opt) => {
    const p = parseFloat(opt.price.replace(/\./g, '').replace(',', '.')) || 0;
    const s = parseFloat(opt.size.replace(',', '.')) || 1;
    return {
      id: opt.id,
      name: opt.name,
      totalPrice: p,
      packageSize: s,
      unitType: opt.unit,
    };
  });

  const comparison = evaluateComparison(numericOptions);

  const handleSelectBestOption = () => {
    if (!comparison.bestOption || !onSelectOptionForCart) return;

    const chosenInput = options.find((o) => o.id === comparison.bestOption?.id);
    onSelectOptionForCart({
      name: `${productCategoryName} (${chosenInput?.name || 'Econômica'})`,
      price: comparison.bestOption.totalPrice,
      quantity: 1,
      unitAmount: comparison.bestOption.packageSize,
      unitType: comparison.bestOption.unitType,
      category: 'Limpeza',
      imageUrl: bannerImageUrl,
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  return (
    <div className="pb-36 pt-16 px-5 max-w-md mx-auto space-y-5">
      {/* Context Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest text-[#6d7b6b] dark:text-zinc-400 uppercase block mb-1">
          ANÁLISE DE PREÇO POR UNIDADE
        </span>
        <h2 className="text-2xl font-extrabold text-[#1a1b1f] dark:text-white tracking-tight">
          Comparação Inteligente
        </h2>
        <p className="text-sm text-[#3d4a3c] dark:text-zinc-400 mt-1">
          Descubra qual tamanho de embalagem oferece a verdadeira economia por kg, Litro ou rolo ("Leve Mais, Pague Menos").
        </p>
      </div>

      {/* Quick Presets Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs text-[#6d7b6b] font-medium whitespace-nowrap">Exemplos:</span>
        {[
          { id: 'sabao', label: 'Sabão em Pó' },
          { id: 'detergente', label: 'Detergente' },
          { id: 'papel', label: 'Papel Higiênico' },
          { id: 'cerveja', label: 'Cerveja' },
          { id: 'azeite', label: 'Azeite' },
        ].map((p) => (
          <button
            key={p.id}
            onClick={() => loadPreset(p.id as any)}
            className="text-xs font-semibold bg-white dark:bg-zinc-800 text-[#1a1b1f] dark:text-white border border-[#e3e2e7] dark:border-zinc-700 px-3 py-1 rounded-full whitespace-nowrap hover:bg-[#eeedf3] active:scale-95 transition-all shadow-xs"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Product Category Visual Banner */}
      <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-sm border border-[#e3e2e7] dark:border-zinc-800">
        <img src={bannerImageUrl} alt={productCategoryName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-4">
          <h3 className="text-xl font-bold text-white tracking-tight">{productCategoryName}</h3>
        </div>
      </div>

      {/* Comparison Options Cards */}
      <div className="grid grid-cols-2 gap-3.5 items-stretch">
        {options.map((opt) => {
          const evalItem = comparison.items.find((i) => i.id === opt.id);
          const isWinner = evalItem?.isBestChoice;

          return (
            <div
              key={opt.id}
              className={`rounded-2xl p-4 flex flex-col justify-between transition-all relative ${
                isWinner
                  ? 'bg-white dark:bg-zinc-900 border-2 border-[#34c759] shadow-lg ring-4 ring-[#34c759]/10'
                  : 'bg-[#f4f3f8] dark:bg-zinc-900/60 border border-[#e3e2e7] dark:border-zinc-800 opacity-90'
              }`}
            >
              {/* Highlight Seal */}
              {isWinner && (
                <div className="absolute -top-3 right-3 bg-[#34c759] text-[#004d1a] text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md uppercase tracking-tight flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Melhor Escolha</span>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-semibold text-[#6d7b6b] truncate">{opt.name}</span>
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(opt.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Edit Inputs */}
                <div className="space-y-1.5 mt-2">
                  <div>
                    <label className="text-[10px] text-[#6d7b6b] font-bold block">Preço Total (R$)</label>
                    <input
                      type="text"
                      value={opt.price}
                      onChange={(e) => handleUpdateOption(opt.id, 'price', e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-lg px-2 py-1 text-sm font-bold text-[#1a1b1f] dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-1">
                    <div>
                      <label className="text-[10px] text-[#6d7b6b] font-bold block">Qtd</label>
                      <input
                        type="text"
                        value={opt.size}
                        onChange={(e) => handleUpdateOption(opt.id, 'size', e.target.value)}
                        className="w-full bg-white dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-[#1a1b1f] dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6d7b6b] font-bold block">Unid</label>
                      <select
                        value={opt.unit}
                        onChange={(e) => handleUpdateOption(opt.id, 'unit', e.target.value as UnitType)}
                        className="w-full bg-white dark:bg-zinc-800 border border-[#e3e2e7] dark:border-zinc-700 rounded-lg px-1 py-1 text-xs font-semibold text-[#1a1b1f] dark:text-white"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="mL">mL</option>
                        <option value="rolo">rolo</option>
                        <option value="un">un</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Calculated Unit Price Output */}
              <div className="mt-4 pt-3 border-t border-[#e3e2e7] dark:border-zinc-800">
                <p className={`text-xl font-bold ${isWinner ? 'text-[#006e28] dark:text-[#53e16f]' : 'text-[#1a1b1f] dark:text-white'}`}>
                  {formatBRL(evalItem?.totalPrice || 0)}
                </p>
                <p className={`text-xs font-bold mt-0.5 ${isWinner ? 'text-[#006e28] dark:text-[#53e16f]' : 'text-[#6d7b6b]'}`}>
                  {evalItem?.normalizedUnitLabel}
                </p>

                {isWinner && (evalItem?.savingsPercent || 0) > 0 && (
                  <div className="mt-2 inline-flex items-center gap-1 bg-[#34c759]/20 text-[#004d1a] dark:text-[#72fe88] px-2 py-0.5 rounded-full text-[11px] font-bold">
                    <ArrowDown className="w-3 h-3" />
                    <span>{evalItem?.savingsPercent}% mais barato</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add another option button */}
      <button
        onClick={handleAddOption}
        className="w-full py-2 border border-dashed border-[#bccbb8] dark:border-zinc-700 rounded-2xl text-xs font-bold text-[#006e28] dark:text-[#53e16f] flex items-center justify-center gap-1.5 hover:bg-black/5 active:scale-98 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar Outra Embalagem para Comparar</span>
      </button>

      {/* Estimated Savings Banner */}
      {comparison.unitSavings > 0 && (
        <div className="bg-[#006e28] text-white p-4 rounded-2xl shadow-lg flex items-center gap-3 relative overflow-hidden">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-white/80 block uppercase">
              Economia Estimada por Unidade
            </span>
            <p className="text-base font-extrabold text-white leading-tight">
              Pague {formatBRL(comparison.unitSavings)} a menos no {comparison.baseUnitLabel}!
            </p>
          </div>
        </div>
      )}

      {/* Feedback Notice */}
      {addedNotice && (
        <div className="bg-[#34c759] text-[#004d1a] px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md animate-bounce">
          <CheckCircle className="w-4 h-4" />
          <span>Opção econômica adicionada ao seu carrinho com sucesso!</span>
        </div>
      )}

      {/* Main Action Button */}
      <div className="pt-2">
        <button
          onClick={handleSelectBestOption}
          className="w-full bg-[#006e28] hover:bg-[#00531c] text-white font-bold h-14 rounded-full flex items-center justify-center gap-2 text-base shadow-[0_4px_20px_rgba(0,110,40,0.3)] active:scale-98 transition-all"
        >
          <CheckCircle className="w-5 h-5" />
          <span>Escolher Opção Econômica</span>
        </button>
      </div>
    </div>
  );
};
