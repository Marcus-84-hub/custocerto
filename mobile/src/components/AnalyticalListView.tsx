import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Plus,
  Trash2,
  ClipboardList,
  ShoppingCart,
  ChevronUp,
  ChevronDown,
  Square,
  CheckSquare,
} from 'lucide-react-native';
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
    // If selectedFilter is not 'Todas' and is different from the current category, skip it
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

  const handleAddItem = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, digite o nome do produto.');
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
      price: 0, // Inicia zerado, pois os preços serão informados no mercado
      isChecked: false,
    });

    // Reset fields
    setName('');
    setQuantity('1');
    setUnitAmount('1');
  };

  const handleClearList = () => {
    Alert.alert(
      'Iniciar Nova Lista?',
      'Isso removerá todos os produtos planejados da sua lista prévia atual.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: onClearPlanningList },
      ]
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Informação */}
        <View style={styles.infoBanner}>
          <ClipboardList size={22} color="#006e28" />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Planejamento Prévio</Text>
            <Text style={styles.infoDesc}>
              Monte sua lista. No mercado, tique os itens para mandá-los ao carrinho principal e digite os preços para calcular o custo.
            </Text>
          </View>
        </View>

        {/* Formulário de Adição Rápida */}
        <View style={styles.addCard}>
          <Text style={styles.cardTitle}>Planejar Novo Item</Text>
          
          <TextInput
            placeholder="Ex: Arroz Tipo 1, Feijão Preto..."
            value={name}
            onChangeText={setName}
            style={styles.nameInput}
            placeholderTextColor="#8a898e"
          />

          <View style={styles.row}>
            {/* Categoria Selector */}
            <View style={styles.selectGroup}>
              <Text style={styles.selectLabel}>CATEGORIA</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[styles.chip, category === cat && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.row}>
            {/* Unidade Selector */}
            <View style={[styles.selectGroup, { flex: 2, marginRight: 8 }]}>
              <Text style={styles.selectLabel}>UNIDADE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    onPress={() => setUnitType(u)}
                    style={[styles.chip, unitType === u && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, unitType === u && styles.chipTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Qtd */}
            <View style={[styles.fieldGroup, { flex: 1 }]}>
              <Text style={styles.selectLabel}>QUANTIDADE</Text>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                style={styles.numericInput}
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleAddItem} style={styles.addBtn} activeOpacity={0.8}>
            <Plus size={18} color="#004d1a" />
            <Text style={styles.addBtnText}>Adicionar ao Planejamento</Text>
          </TouchableOpacity>
        </View>

        {/* Filtros de Categoria da Lista */}
        {planningList.length > 0 && (
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Filtrar Categoria:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <TouchableOpacity
                onPress={() => setSelectedFilter('Todas')}
                style={[styles.filterChip, selectedFilter === 'Todas' && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, selectedFilter === 'Todas' && styles.filterChipTextActive]}>
                  Todas ({planningList.length})
                </Text>
              </TouchableOpacity>
              {CATEGORIES.map((cat) => {
                const count = planningList.filter((item) => item.category === cat).length;
                if (count === 0) return null;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedFilter(cat)}
                    style={[styles.filterChip, selectedFilter === cat && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, selectedFilter === cat && styles.filterChipTextActive]}>
                      {cat} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Tabela de Lista por Categorias */}
        {planningList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>Sua lista prévia está vazia.</Text>
            <Text style={styles.emptySub}>Adicione itens acima para começar a planejar suas compras!</Text>
          </View>
        ) : Object.keys(groupedItems).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>Nenhum item nesta categoria.</Text>
            <Text style={styles.emptySub}>Selecione "Todas" ou adicione novos produtos.</Text>
          </View>
        ) : (
          Object.keys(groupedItems).map((catName) => {
            const items = groupedItems[catName as ItemCategory];
            return (
              <View key={catName} style={styles.categoryCard}>
                <Text style={styles.categoryTitle}>{catName}</Text>
                
                {/* Table Header */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.thText, styles.colCheck]}></Text>
                  <Text style={[styles.thText, styles.colName]}>Item</Text>
                  <Text style={[styles.thText, styles.colQty, { textAlign: 'center' }]}>Qtd</Text>
                  <Text style={[styles.thText, styles.colPrice, { textAlign: 'center' }]}>Preço (R$)</Text>
                  <Text style={[styles.thText, styles.colCost, { textAlign: 'right' }]}>Custo</Text>
                  <Text style={[styles.thText, styles.colOrder, { textAlign: 'center' }]}>Ordem</Text>
                  <Text style={styles.colAction}></Text>
                </View>

                {/* Table Body Rows */}
                {items.map((item) => {
                  const cost = item.price * item.quantity;
                  const isChecked = !!item.isChecked;
                  return (
                    <View key={item.id} style={[styles.tableBodyRow, isChecked && styles.rowChecked]}>
                      {/* Checkbox (Ticar para colocar no carrinho) */}
                      <TouchableOpacity
                        onPress={() => onTogglePlanningItemCheck(item.id)}
                        style={styles.colCheck}
                        activeOpacity={0.7}
                      >
                        {isChecked ? (
                          <CheckSquare size={18} color="#34c759" />
                        ) : (
                          <Square size={18} color="#8a898e" />
                        )}
                      </TouchableOpacity>

                      {/* Name / Unit */}
                      <View style={styles.colName}>
                        <Text
                          style={[styles.itemNameText, isChecked && styles.textChecked]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.itemUnitText}>
                          {item.unitAmount} {item.unitType}
                        </Text>
                      </View>

                      {/* Quantity Input */}
                      <View style={styles.colQty}>
                        <TextInput
                          defaultValue={item.quantity.toString()}
                          onChangeText={(val) => updateItemQty(item.id, val)}
                          keyboardType="numeric"
                          style={styles.cellInput}
                          textAlign="center"
                          editable={!isChecked}
                        />
                      </View>

                      {/* Price Input */}
                      <View style={styles.colPrice}>
                        <TextInput
                          placeholder="0,00"
                          defaultValue={item.price > 0 ? item.price.toString() : ''}
                          onChangeText={(val) => updateItemPrice(item.id, val)}
                          keyboardType="numeric"
                          style={styles.cellInput}
                          textAlign="center"
                          placeholderTextColor="#bccbb8"
                          editable={!isChecked}
                        />
                      </View>

                      {/* Total Cost */}
                      <Text style={[styles.colCost, styles.costText, isChecked && styles.textChecked]}>
                        {formatBRL(cost)}
                      </Text>

                      {/* Reorder Arrows (Chevrons up and down) */}
                      <View style={styles.colOrder}>
                        <TouchableOpacity
                          onPress={() => onMovePlanningItem(item.id, 'up')}
                          style={styles.orderBtn}
                          disabled={isChecked}
                        >
                          <ChevronUp size={14} color={isChecked ? '#e3e2e7' : '#006e28'} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => onMovePlanningItem(item.id, 'down')}
                          style={styles.orderBtn}
                          disabled={isChecked}
                        >
                          <ChevronDown size={14} color={isChecked ? '#e3e2e7' : '#006e28'} />
                        </TouchableOpacity>
                      </View>

                      {/* Delete Action */}
                      <TouchableOpacity
                        onPress={() => onRemovePlanningItem(item.id)}
                        style={[styles.colAction, styles.deleteBtn]}
                      >
                        <Trash2 size={15} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}

        {/* Resumo Final Planejado */}
        {planningList.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Total Planejado:</Text>
                <Text style={styles.summarySubText}>
                  No carrinho: {formatBRL(totalTickedCost)}
                </Text>
              </View>
              <Text style={styles.summaryValue}>{formatBRL(totalPlannedCost)}</Text>
            </View>

            <View style={styles.summaryActions}>
              <TouchableOpacity onPress={handleClearList} style={styles.clearBtn}>
                <Trash2 size={16} color="#850000" />
                <Text style={styles.clearBtnText}>Nova Lista (Limpar)</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={onSwitchToCartTab} style={styles.cartBtn}>
                <ShoppingCart size={16} color="#ffffff" />
                <Text style={styles.cartBtnText}>Ver Carrinho Ativo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fe',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#004d1a',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 11,
    color: '#3d4f3b',
    lineHeight: 15,
  },
  addCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e3e2e7',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1b1f',
    marginBottom: 12,
  },
  nameInput: {
    backgroundColor: '#eeedf3',
    borderRadius: 12,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#1a1b1f',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  selectGroup: {
    flex: 1,
  },
  fieldGroup: {
    justifyContent: 'flex-end',
  },
  selectLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    backgroundColor: '#eeedf3',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.25)',
  },
  chipText: {
    fontSize: 11,
    color: '#1a1b1f',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#004d1a',
    fontWeight: '800',
  },
  numericInput: {
    backgroundColor: '#eeedf3',
    borderRadius: 12,
    height: 32,
    width: '100%',
    textAlign: 'center',
    fontSize: 13,
    color: '#1a1b1f',
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34c759',
    borderRadius: 14,
    height: 42,
    gap: 6,
    marginTop: 6,
  },
  addBtnText: {
    color: '#004d1a',
    fontSize: 13,
    fontWeight: '800',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6d7b6b',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3e2e7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#006e28',
    borderColor: '#006e28',
  },
  filterChipText: {
    fontSize: 12,
    color: '#6d7b6b',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1b1f',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#6d7b6b',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e3e2e7',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#006e28',
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeedf3',
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  rowChecked: {
    backgroundColor: '#faf9fe50',
  },
  colCheck: {
    width: 28,
    alignItems: 'flex-start',
  },
  colName: {
    flex: 3,
  },
  colQty: {
    width: 36,
    marginHorizontal: 2,
  },
  colPrice: {
    width: 50,
    marginHorizontal: 2,
  },
  colCost: {
    width: 60,
    textAlign: 'right',
  },
  colOrder: {
    width: 24,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  colAction: {
    width: 24,
    alignItems: 'flex-end',
  },
  itemNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1b1f',
  },
  itemUnitText: {
    fontSize: 9,
    color: '#6d7b6b',
    marginTop: 1,
  },
  cellInput: {
    backgroundColor: '#f4f3f8',
    borderRadius: 8,
    height: 28,
    fontSize: 11,
    color: '#1a1b1f',
    fontWeight: '700',
    padding: 2,
  },
  costText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  textChecked: {
    textDecorationLine: 'line-through',
    color: '#8a898e',
    opacity: 0.6,
  },
  orderBtn: {
    padding: 1,
  },
  deleteBtn: {
    paddingVertical: 4,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e3e2e7',
    marginTop: 8,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  summarySubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d7b6b',
    marginTop: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#006e28',
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  clearBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b3010',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 14,
    height: 42,
    gap: 6,
  },
  clearBtnText: {
    color: '#850000',
    fontSize: 12,
    fontWeight: '700',
  },
  cartBtn: {
    flex: 1.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006e28',
    borderRadius: 14,
    height: 42,
    gap: 6,
  },
  cartBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  thText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
});
