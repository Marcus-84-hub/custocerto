import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Sparkles, ArrowDown, CheckCircle, Plus, Trash2, HelpCircle } from 'lucide-react-native';
import { CartItem, UnitType } from '../types';
import { evaluateComparison, formatBRL } from '../utils/calculator';

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

const windowWidth = Dimensions.get('window').width;

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

  // Sync if initial item passed
  useEffect(() => {
    if (initialItemToCompare) {
      setProductCategoryName(initialItemToCompare.name);
      if (initialItemToCompare.imageUrl) {
        setBannerImageUrl(initialItemToCompare.imageUrl);
      }
      setOptions([
        {
          id: 'opt-1',
          name: `Emb. ${initialItemToCompare.unitAmount}${initialItemToCompare.unitType}`,
          price: initialItemToCompare.price.toFixed(2).replace('.', ','),
          size: initialItemToCompare.unitAmount.toString(),
          unit: initialItemToCompare.unitType,
        },
        {
          id: 'opt-2',
          name: `Emb. ${initialItemToCompare.unitAmount * 2}${initialItemToCompare.unitType} (Econ.)`,
          price: (initialItemToCompare.price * 1.75).toFixed(2).replace('.', ','),
          size: (initialItemToCompare.unitAmount * 2).toString(),
          unit: initialItemToCompare.unitType,
        },
      ]);
    }
  }, [initialItemToCompare]);

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
        { id: 'opt-2', name: 'Pack 6 Pague 5 (3L)', price: '12,90', size: '3000', unit: 'mL' },
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
      { id: `opt-${Date.now()}`, name: `Opção ${nextIdx}`, price: '10,00', size: '1', unit: options[0]?.unit || 'kg' },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((opt) => opt.id !== id));
  };

  // Evaluate
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
      name: `${productCategoryName} (${chosenInput?.name || 'Melhor Escolha'})`,
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

  const presets = [
    { id: 'sabao', label: 'Sabão em Pó' },
    { id: 'detergente', label: 'Detergente' },
    { id: 'papel', label: 'Papel Hig.' },
    { id: 'cerveja', label: 'Cerveja' },
    { id: 'azeite', label: 'Azeite' },
  ];

  const units: UnitType[] = ['kg', 'g', 'L', 'mL', 'rolo', 'un'];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Context Header */}
      <View style={styles.header}>
        <Text style={styles.sublabel}>ANÁLISE DE PREÇO POR UNIDADE</Text>
        <Text style={styles.title}>Comparação Inteligente</Text>
        <Text style={styles.description}>
          Descubra qual tamanho de embalagem oferece a verdadeira economia por kg, Litro ou rolo ("Leve Mais, Pague Menos").
        </Text>
      </View>

      {/* Preset Pills */}
      <View style={styles.presetContainer}>
        <Text style={styles.presetLabel}>Exemplos:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
          {presets.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => loadPreset(p.id as any)}
              style={styles.presetPill}
            >
              <Text style={styles.presetPillText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image source={{ uri: bannerImageUrl }} style={styles.bannerImage as any} />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>{productCategoryName}</Text>
        </View>
      </View>

      {/* Options Grid */}
      <View style={styles.gridContainer}>
        {options.map((opt) => {
          const evalItem = comparison.items.find((i) => i.id === opt.id);
          const isWinner = evalItem?.isBestChoice;

          return (
            <View
              key={opt.id}
              style={[
                styles.optionCard,
                isWinner ? styles.optionCardWinner : styles.optionCardNormal,
              ]}
            >
              {isWinner && (
                <View style={styles.winnerBadge}>
                  <Sparkles size={10} color="#004d1a" />
                  <Text style={styles.winnerBadgeText}>Melhor Escolha</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <TextInput
                  value={opt.name}
                  onChangeText={(val) => handleUpdateOption(opt.id, 'name', val)}
                  style={styles.optionNameInput}
                  numberOfLines={1}
                />
                {options.length > 2 && (
                  <TouchableOpacity onPress={() => handleRemoveOption(opt.id)}>
                    <Trash2 size={14} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Edit Fields */}
              <View style={styles.fieldContainer}>
                <View style={styles.inputFieldGroup}>
                  <Text style={styles.fieldLabel}>PREÇO (R$)</Text>
                  <TextInput
                    value={opt.price}
                    onChangeText={(val) => handleUpdateOption(opt.id, 'price', val)}
                    keyboardType="numeric"
                    style={styles.cardTextInput}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.inputFieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>TAMANHO</Text>
                    <TextInput
                      value={opt.size}
                      onChangeText={(val) => handleUpdateOption(opt.id, 'size', val)}
                      keyboardType="numeric"
                      style={styles.cardTextInputSmall}
                    />
                  </View>
                  <View style={[styles.inputFieldGroup, { flex: 1.2 }]}>
                    <Text style={styles.fieldLabel}>UNID</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.miniUnitScroll}>
                      {units.map((u) => (
                        <TouchableOpacity
                          key={u}
                          onPress={() => handleUpdateOption(opt.id, 'unit', u)}
                          style={[
                            styles.miniUnitBtn,
                            opt.unit === u && styles.miniUnitBtnActive,
                          ]}
                        >
                          <Text style={[styles.miniUnitText, opt.unit === u && styles.miniUnitTextActive]}>
                            {u}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>

              {/* Calculated Outputs */}
              <View style={styles.priceOutput}>
                <Text style={[styles.totalPriceText, isWinner && styles.winnerGreenText]}>
                  {formatBRL(evalItem?.totalPrice || 0)}
                </Text>
                <Text style={[styles.unitPriceText, isWinner ? styles.winnerGreenText : styles.grayText]}>
                  {evalItem?.normalizedUnitLabel}
                </Text>

                {isWinner && (evalItem?.savingsPercent || 0) > 0 && (
                  <View style={styles.savingsTag}>
                    <ArrowDown size={10} color="#004d1a" />
                    <Text style={styles.savingsTagText}>{evalItem?.savingsPercent}% mais barato</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Add Button */}
      <TouchableOpacity onPress={handleAddOption} style={styles.addOptionBtn} activeOpacity={0.7}>
        <Plus size={14} color="#006e28" />
        <Text style={styles.addOptionBtnText}>Comparar Outra Embalagem</Text>
      </TouchableOpacity>

      {/* Unit Savings Banner */}
      {comparison.unitSavings > 0 && (
        <View style={styles.savingsBanner}>
          <View style={styles.savingsIconBg}>
            <Sparkles size={18} color="#f59e0b" />
          </View>
          <View style={styles.savingsBannerContent}>
            <Text style={styles.savingsBannerLabel}>ECONOMIA ESTIMADA POR UNIDADE</Text>
            <Text style={styles.savingsBannerText}>
              Pague {formatBRL(comparison.unitSavings)} a menos no {comparison.baseUnitLabel}!
            </Text>
          </View>
        </View>
      )}

      {/* Success Notice */}
      {addedNotice && (
        <View style={styles.noticeBanner}>
          <CheckCircle size={16} color="#004d1a" />
          <Text style={styles.noticeBannerText}>
            Opção econômica adicionada ao carrinho!
          </Text>
        </View>
      )}

      {/* Add Action Button */}
      <TouchableOpacity
        onPress={handleSelectBestOption}
        style={styles.chooseBtn}
        activeOpacity={0.8}
      >
        <CheckCircle size={20} color="#ffffff" />
        <Text style={styles.chooseBtnText}>Escolher Opção Econômica</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // Leave room for nav bar
    gap: 16,
  },
  header: {
    gap: 4,
  },
  sublabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1b1f',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 13,
    color: '#6d7b6b',
    lineHeight: 18,
  },
  presetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6d7b6b',
  },
  presetScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  presetPill: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1b1f',
  },
  bannerContainer: {
    position: 'relative',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e3e2e7',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: (windowWidth - 44) / 2, // 2-column layout
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  optionCardNormal: {
    backgroundColor: '#f4f3f8',
    borderColor: '#e3e2e7',
  },
  optionCardWinner: {
    backgroundColor: '#ffffff',
    borderColor: '#34c759',
    borderWidth: 2,
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  winnerBadge: {
    position: 'absolute',
    top: -12,
    right: 12,
    backgroundColor: '#34c759',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  winnerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#004d1a',
    textTransform: 'uppercase',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionNameInput: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6d7b6b',
    flex: 1,
    padding: 0,
  },
  fieldContainer: {
    gap: 6,
  },
  inputFieldGroup: {
    gap: 2,
  },
  fieldLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6d7b6b',
  },
  cardTextInput: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  cardTextInputSmall: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
    color: '#1a1b1f',
    textAlign: 'center',
  },
  miniUnitScroll: {
    flexDirection: 'row',
    height: 28,
  },
  miniUnitBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3e2e7',
    borderRadius: 6,
    paddingHorizontal: 6,
    justifyContent: 'center',
    marginRight: 4,
  },
  miniUnitBtnActive: {
    backgroundColor: '#006e28',
    borderColor: '#006e28',
  },
  miniUnitText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3d4a3c',
  },
  miniUnitTextActive: {
    color: '#ffffff',
  },
  priceOutput: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e3e2e7',
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  unitPriceText: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  winnerGreenText: {
    color: '#006e28',
  },
  grayText: {
    color: '#6d7b6b',
  },
  savingsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
    gap: 2,
  },
  savingsTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#004d1a',
  },
  addOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bccbb8',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 10,
    gap: 6,
  },
  addOptionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006e28',
  },
  savingsBanner: {
    backgroundColor: '#006e28',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savingsIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savingsBannerContent: {
    flex: 1,
  },
  savingsBannerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  savingsBannerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginTop: 2,
  },
  noticeBanner: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004d1a',
  },
  chooseBtn: {
    backgroundColor: '#006e28',
    borderRadius: 28,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#006e28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  chooseBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
});
