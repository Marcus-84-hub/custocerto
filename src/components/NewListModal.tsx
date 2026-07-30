import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, History, Calendar, MapPin, Store, FileText, ClipboardList } from 'lucide-react';
import { CartItem, ShoppingSession, UnitType, ItemCategory } from '../types';
import { formatBRL } from '../utils/calculator';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: ShoppingSession[];
  onConfirm: (data: {
    listName: string;
    storeName: string;
    storeAddress: string;
    protocol: string;
    items: CartItem[];
  }) => void;
  showAlert: (title: string, message: string) => void;
}

interface ListTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: Omit<CartItem, 'id' | 'addedAt'>[];
}

const TEMPLATES: ListTemplate[] = [
  {
    id: 'basica',
    name: 'Básica (Essenciais)',
    description: 'Arroz, feijão, leite, café, óleo e produtos de limpeza essenciais.',
    icon: '🌾',
    items: [
      { name: 'Arroz Tio João Tipo 1 5kg', brand: 'Tio João', price: 28.00, quantity: 1, unitAmount: 5, unitType: 'kg', category: 'Alimentos' },
      { name: 'Feijão Carioca Camil 1kg', brand: 'Camil', price: 7.80, quantity: 1, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
      { name: 'Detergente Ypê Clean 500ml', brand: 'Ypê', price: 2.15, quantity: 3, unitAmount: 500, unitType: 'mL', category: 'Limpeza' },
      { name: 'Leite Integral Ninho 1L', brand: 'Nestlé', price: 5.50, quantity: 4, unitAmount: 1, unitType: 'L', category: 'Bebidas' },
      { name: 'Café Orfeu Gourmet 250g', brand: 'Orfeu', price: 24.90, quantity: 1, unitAmount: 250, unitType: 'g', category: 'Alimentos' },
      { name: 'Óleo de Soja Liza 900ml', brand: 'Liza', price: 6.80, quantity: 2, unitAmount: 900, unitType: 'mL', category: 'Alimentos' },
      { name: 'Sabão em Pó Omo Sanitizante 1kg', brand: 'Omo', price: 18.90, quantity: 1, unitAmount: 1, unitType: 'kg', category: 'Limpeza' },
    ]
  },
  {
    id: 'churrasco',
    name: 'Churrasco Fim de Semana',
    description: 'Picanha, linguiça toscana, pão de alho, carvão e bebidas geladas.',
    icon: '🔥',
    items: [
      { name: 'Pão de Alho Zinho', brand: 'Zinho', price: 12.50, quantity: 2, unitAmount: 1, unitType: 'pacote', category: 'Alimentos' },
      { name: 'Carvão Vegetal 5kg', brand: 'Preto', price: 24.90, quantity: 1, unitAmount: 5, unitType: 'kg', category: 'Outros' },
      { name: 'Cerveja Heineken Lata 350ml', brand: 'Heineken', price: 6.49, quantity: 12, unitAmount: 350, unitType: 'mL', category: 'Bebidas' },
      { name: 'Refrigerante Coca-Cola 2L', brand: 'Coca-Cola', price: 9.99, quantity: 2, unitAmount: 2, unitType: 'L', category: 'Bebidas' },
      { name: 'Carne Picanha kg', brand: 'Friboi', price: 79.90, quantity: 2, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
      { name: 'Linguiça Toscana kg', brand: 'Perdigão', price: 26.90, quantity: 1.5, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
    ]
  },
  {
    id: 'limpeza',
    name: 'Higiene & Limpeza Completa',
    description: 'Papel higiênico, amaciante, desinfetante, sabonetes e creme dental.',
    icon: '✨',
    items: [
      { name: 'Papel Higiênico Neve 12 rolos', brand: 'Neve', price: 22.90, quantity: 1, unitAmount: 12, unitType: 'rolo', category: 'Higiene' },
      { name: 'Sabão em Pó Omo Sanitizante 1kg', brand: 'Omo', price: 18.90, quantity: 1, unitAmount: 1, unitType: 'kg', category: 'Limpeza' },
      { name: 'Detergente Ypê Clean 500ml', brand: 'Ypê', price: 2.15, quantity: 5, unitAmount: 500, unitType: 'mL', category: 'Limpeza' },
      { name: 'Desinfetante Pinho Sol 1L', brand: 'Pinho Sol', price: 9.90, quantity: 1, unitAmount: 1, unitType: 'L', category: 'Limpeza' },
      { name: 'Creme Dental Colgate', brand: 'Colgate', price: 4.55, quantity: 3, unitAmount: 1, unitType: 'un', category: 'Higiene' },
      { name: 'Sabonete Rexona', brand: 'Rexona', price: 2.80, quantity: 6, unitAmount: 1, unitType: 'un', category: 'Higiene' },
      { name: 'Amaciante Concentrado Downy 1L', brand: 'Downy', price: 16.90, quantity: 1, unitAmount: 1, unitType: 'L', category: 'Limpeza' },
    ]
  },
  {
    id: 'bebe',
    name: 'Cuidados com Bebê',
    description: 'Fraldas confortáveis, lenços umedecidos, pomada e fórmula infantil.',
    icon: '👶',
    items: [
      { name: 'Fralda Pampers Confort Sec M 44un', brand: 'Pampers', price: 69.90, quantity: 1, unitAmount: 44, unitType: 'un', category: 'Higiene' },
      { name: 'Lenço Umedecido Johnson\'s 48un', brand: 'Johnson\'s', price: 14.50, quantity: 2, unitAmount: 48, unitType: 'un', category: 'Higiene' },
      { name: 'Pomada Hipoglós Amêndoas 80g', brand: 'Hipoglós', price: 28.90, quantity: 1, unitAmount: 80, unitType: 'g', category: 'Higiene' },
      { name: 'Fórmula Infantil Aptamil Profutura 2 800g', brand: 'Danone', price: 74.90, quantity: 2, unitAmount: 800, unitType: 'g', category: 'Alimentos' },
      { name: 'Sabonete Líquido Cabeça aos Pés 200ml', brand: 'Johnson\'s', price: 19.90, quantity: 1, unitAmount: 200, unitType: 'mL', category: 'Higiene' }
    ]
  },
  {
    id: 'idoso',
    name: 'Cuidados com Idoso',
    description: 'Fralda geriátrica, suplemento alimentar Ensure, hidratante e chá.',
    icon: '🧓',
    items: [
      { name: 'Fralda Geriátrica Plenitud G/XG 16un', brand: 'Plenitud', price: 54.90, quantity: 1, unitAmount: 16, unitType: 'un', category: 'Higiene' },
      { name: 'Suplemento Ensure Baunilha 850g', brand: 'Abbott', price: 89.90, quantity: 2, unitAmount: 850, unitType: 'g', category: 'Alimentos' },
      { name: 'Sabonete de Glicerina Granado 90g', brand: 'Granado', price: 4.80, quantity: 3, unitAmount: 90, unitType: 'g', category: 'Higiene' },
      { name: 'Loção Hidratante Fisiogel A.I. 400ml', brand: 'Fisiogel', price: 134.90, quantity: 1, unitAmount: 400, unitType: 'mL', category: 'Higiene' },
      { name: 'Chá de Camomila Leão 15 saquinhos', brand: 'Leão', price: 6.50, quantity: 2, unitAmount: 15, unitType: 'un', category: 'Alimentos' }
    ]
  },
  {
    id: 'parto',
    name: 'Mala de Parto & Maternidade',
    description: 'Absorvente pós-parto, rosquinhas de amamentação e cuidados íntimos.',
    icon: '🤰',
    items: [
      { name: 'Absorvente Pós-Parto Plenitud 10un', brand: 'Plenitud', price: 18.90, quantity: 2, unitAmount: 10, unitType: 'un', category: 'Higiene' },
      { name: 'Concha de Amamentação Mamy12', brand: 'Mamy', price: 42.00, quantity: 1, unitAmount: 2, unitType: 'un', category: 'Outros' },
      { name: 'Rosquinhas Protetoras de Mamilo par', brand: 'Amamente', price: 35.00, quantity: 1, unitAmount: 2, unitType: 'un', category: 'Outros' },
      { name: 'Sabonete Íntimo Neutro Dermacyd 200ml', brand: 'Dermacyd', price: 21.90, quantity: 1, unitAmount: 200, unitType: 'mL', category: 'Higiene' },
      { name: 'Álcool em Gel 70% Giovanna Baby 500ml', brand: 'Giovanna Baby', price: 9.90, quantity: 1, unitAmount: 500, unitType: 'mL', category: 'Limpeza' }
    ]
  },
  {
    id: 'fitness',
    name: 'Foco Fitness (Alimentação Saudável)',
    description: 'Whey Protein, pasta de amendoim, ovos, batata doce e frango.',
    icon: '🥑',
    items: [
      { name: 'Whey Protein Concentrado 80% 1kg', brand: 'Growth', price: 99.00, quantity: 1, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
      { name: 'Pasta de Amendoim Integral 1kg.g', brand: 'Dr. Peanut', price: 34.90, quantity: 1, unitAmount: 1000, unitType: 'g', category: 'Alimentos' },
      { name: 'Filé de Peito de Frango kg', brand: 'Seara', price: 18.90, quantity: 3, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
      { name: 'Batata Doce Roxa kg', brand: 'Feira', price: 5.90, quantity: 2, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
      { name: 'Ovos Brancos Placa 30un', brand: 'Granja', price: 22.00, quantity: 1, unitAmount: 30, unitType: 'un', category: 'Alimentos' },
      { name: 'Banana Prata kg', brand: 'Feira', price: 7.50, quantity: 1.5, unitAmount: 1, unitType: 'kg', category: 'Alimentos' },
      { name: 'Iogurte Natural Desnatado Nestlé 170g', brand: 'Nestlé', price: 3.20, quantity: 6, unitAmount: 170, unitType: 'g', category: 'Alimentos' }
    ]
  },
  {
    id: 'pet',
    name: 'Cuidados com o Pet',
    description: 'Ração de qualidade, sachês nutritivos, petiscos e areia higiênica.',
    icon: '🐾',
    items: [
      { name: 'Ração Golden Cães Adultos Frango 10kg', brand: 'Premier', price: 139.90, quantity: 1, unitAmount: 10, unitType: 'kg', category: 'Outros' },
      { name: 'Sachê Whiskas Carne Gatos 85g', brand: 'Whiskas', price: 3.80, quantity: 6, unitAmount: 85, unitType: 'g', category: 'Outros' },
      { name: 'Petisco Doguito Bifinho Carne 65g', brand: 'Purina', price: 8.50, quantity: 3, unitAmount: 65, unitType: 'g', category: 'Outros' },
      { name: 'Areia Sanitária Pipicat Clássica 4kg', brand: 'Pipicat', price: 18.90, quantity: 2, unitAmount: 4, unitType: 'kg', category: 'Outros' }
    ]
  }
];

export const NewListModal: React.FC<NewListModalProps> = ({
  isOpen,
  onClose,
  history,
  onConfirm,
  showAlert,
}) => {
  const [listName, setListName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [protocol, setProtocol] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  
  // Selection mode states
  const [selectionMode, setSelectionMode] = useState<'clean' | 'template' | 'history'>('clean');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');

  // Auto-generate protocol and timestamp on open
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Personalized protocol CC-YYYYMMDD-HHMMSS-RAND
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const prot = `CC-${year}${month}${day}-${hours}${minutes}${seconds}-${rand}`;
      
      setProtocol(prot);
      setCreatedAt(now.toISOString());
      
      // Defaults
      setListName(`Minha Compra - ${day}/${month}`);
      setStoreName('Carrefour - Morumbi');
      setStoreAddress('Av. Alberto Augusto Alves, 50 - Morumbi');
      setSelectionMode('clean');
      setSelectedTemplateId('');
      setSelectedHistoryId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) {
      showAlert('Nome Requerido', 'Por favor, informe um nome para a lista de compras.');
      return;
    }
    if (!storeName.trim()) {
      showAlert('Estabelecimento Requerido', 'Por favor, informe o estabelecimento comercial.');
      return;
    }

    let itemsToLoad: CartItem[] = [];

    if (selectionMode === 'template') {
      const templ = TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (templ) {
        itemsToLoad = templ.items.map((item, idx) => ({
          ...item,
          id: `item-${Date.now()}-${idx}`,
          addedAt: new Date().toISOString(),
        }));
      }
    } else if (selectionMode === 'history') {
      const pastSession = history.find((s) => s.id === selectedHistoryId);
      if (pastSession && pastSession.items) {
        itemsToLoad = pastSession.items.map((item, idx) => ({
          ...item,
          id: `item-${Date.now()}-${idx}`,
          addedAt: new Date().toISOString(),
          isChecked: false, // Reset checked status
        }));
      }
    }

    onConfirm({
      listName: listName.trim(),
      storeName: storeName.trim(),
      storeAddress: storeAddress.trim(),
      protocol,
      items: itemsToLoad,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      {/* Backdrop Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#faf9fe] dark:bg-zinc-950 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl z-10 animate-in fade-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-y-auto border border-zinc-200/80 dark:border-zinc-800">
        
        {/* Handle for mobile view */}
        <div className="w-10 h-1.5 rounded-full bg-[#bccbb8] dark:bg-zinc-800 mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-[#006e28] dark:text-[#53e16f]">
            <ClipboardList className="w-5 h-5 stroke-[2.2]" />
            <h3 className="text-lg font-extrabold text-[#1a1b1f] dark:text-zinc-100 tracking-tight">
              Iniciar Nova Compra
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#eeedf3] dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Protocol Alert Panel */}
        <div className="bg-[#006e28]/5 border border-[#006e28]/10 rounded-2xl p-4 space-y-1 mb-5">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#006e28] dark:text-[#53e16f] tracking-wider">
            <span>PROTOCOLO INDIVIDUAL AUTOMÁTICO</span>
            <span className="flex items-center gap-1 font-extrabold">
              <Sparkles className="w-3.5 h-3.5" /> NOVO REGISTRO
            </span>
          </div>
          <p className="text-sm font-black text-[#004d1a] dark:text-[#72fe88] font-mono tracking-tight break-all">
            {protocol}
          </p>
          <span className="text-[9px] font-bold text-zinc-500 block pt-0.5">
            Gerado às {new Date(createdAt).toLocaleDateString('pt-BR')} {new Date(createdAt).toLocaleTimeString('pt-BR')}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirm} className="space-y-4">
          
          {/* Nome da Lista */}
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase">
              Nome da Lista de Compras
            </label>
            <input
              type="text"
              required
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex: Compra Mensal, Churrasco de Domingo..."
              className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006e28] focus:border-transparent transition-all"
            />
          </div>

          {/* Supermercado / Estabelecimento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase flex items-center gap-1">
                <Store className="w-3.5 h-3.5" /> Estabelecimento
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Carrefour, Pão de Açúcar..."
                className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006e28] focus:border-transparent transition-all"
              />
            </div>
            
            {/* Endereço */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-1.5 uppercase flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Endereço
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Rua, Número - Bairro..."
                className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-xl h-11 px-4 text-sm font-semibold text-[#1a1b1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006e28] focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Recurso de Importar Itens (Modos de Lista) */}
          <div className="flex flex-col pt-2">
            <label className="text-[10px] font-bold text-[#6d7b6b] dark:text-zinc-400 tracking-wider mb-2.5 uppercase">
              Como deseja criar seu carrinho?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectionMode('clean')}
                className={`py-2 px-3 border rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                  selectionMode === 'clean'
                    ? 'bg-[#006e28] text-white border-[#006e28] shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                }`}
              >
                <span>🆕</span>
                <span>Vazio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectionMode('template');
                  setSelectedTemplateId(TEMPLATES[0].id);
                }}
                className={`py-2 px-3 border rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                  selectionMode === 'template'
                    ? 'bg-[#006e28] text-white border-[#006e28] shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                }`}
              >
                <span>📋</span>
                <span>Template</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectionMode('history');
                  if (history.length > 0) {
                    setSelectedHistoryId(history[0].id);
                  }
                }}
                className={`py-2 px-3 border rounded-xl text-xs font-extrabold flex flex-col items-center justify-center gap-1 transition-all ${
                  selectionMode === 'history'
                    ? 'bg-[#006e28] text-white border-[#006e28] shadow-sm'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                }`}
              >
                <span>⏳</span>
                <span>Histórico</span>
              </button>
            </div>
          </div>

          {/* Subpanels depending on Selection Mode */}
          {selectionMode === 'template' && (
            <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] font-bold text-zinc-400 block tracking-wider uppercase">
                Selecione um Template de Lista:
              </span>
              <div className="flex flex-col gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      selectedTemplateId === t.id
                        ? 'border-[#006e28] bg-[#006e28]/5 dark:bg-[#006e28]/10'
                        : 'border-zinc-150 dark:border-zinc-800'
                    }`}
                  >
                    <span className="text-xl mt-0.5">{t.icon}</span>
                    <div className="flex-grow">
                      <h4 className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                        {t.name}
                      </h4>
                      <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">
                        {t.description}
                      </p>
                      <span className="inline-block bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5">
                        {t.items.length} produtos inclusos
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectionMode === 'history' && (
            <div className="bg-white dark:bg-zinc-900 border border-[#e3e2e7] dark:border-zinc-800 rounded-2xl p-4 space-y-3">
              <span className="text-[9px] font-bold text-zinc-400 block tracking-wider uppercase">
                Selecione do Histórico de Compras:
              </span>
              {history.length === 0 ? (
                <p className="text-xs font-semibold text-zinc-500 text-center py-4">
                  Nenhuma compra anterior registrada para importar.
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin">
                  {history.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedHistoryId(s.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        selectedHistoryId === s.id
                          ? 'border-[#006e28] bg-[#006e28]/5 dark:bg-[#006e28]/10'
                          : 'border-zinc-150 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-zinc-800 dark:text-zinc-200">
                          <Store className="w-3 h-3 text-[#006e28]" />
                          <span>{s.storeName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" /> {s.date}
                          </span>
                          <span>• {s.itemsCount} itens</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-[#006e28] dark:text-[#53e16f]">
                        {formatBRL(s.totalAmount)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 bg-[#eeedf3] dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#1a1b1f] dark:text-zinc-200 font-bold rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-[1.5] h-12 bg-[#006e28] hover:bg-[#00531c] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Confirmar & Iniciar</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
