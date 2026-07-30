import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { X, Trash2, SlidersHorizontal } from 'lucide-react-native';
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
  const [lastTap, setLastTap] = useState<{ id: string; timestamp: number }>({ id: '', timestamp: 0 });

  const handleItemTap = (item: CartItem) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    
    if (lastTap.id === item.id && now - lastTap.timestamp < DOUBLE_PRESS_DELAY) {
      // Double tap -> Open full edit details
      if (onEditItem) {
        onClose(); // Close spreadsheet first so edit modal is visible
        onEditItem(item);
      }
    } else {
      // Single tap -> Show full description quickly in an Alert
      const details = [
        `Produto: ${item.name}`,
        item.brand ? `Marca: ${item.brand}` : null,
        `Categoria: ${item.category}`,
        `Medida: ${item.unitAmount} ${item.unitType}`,
        `Quantidade: ${item.quantity}`,
        `Preço Unitário: ${formatBRL(item.price)}`,
        `Custo Total: ${formatBRL(item.price * item.quantity)}`,
        item.barcode ? `Código de Barras: ${item.barcode}` : null,
        item.previousPrice ? `Preço Anterior: ${formatBRL(item.previousPrice)}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      Alert.alert('Detalhes do Produto', details, [{ text: 'Fechar', style: 'cancel' }]);
    }
    
    setLastTap({ id: item.id, timestamp: now });
  };

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
    // Direct value update (different from delta delta quantity)
    const item = items.find((i) => i.id === id);
    if (item) {
      onUpdateItemFields(id, { quantity: qty });
    }
  };

  const handlePriceChange = (id: string, priceStr: string) => {
    const cleanStr = priceStr.replace(',', '.');
    const price = parseFloat(cleanStr) || 0;
    onUpdateItemFields(id, { price });
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContent}>
            {/* Grabber Handle */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleWrapper}>
                <Text style={styles.modalTitle}>Planilha Excel do Carrinho</Text>
                <Text style={styles.modalSubtitle}>Edição direta e resumo analítico</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#1a1b1f" />
              </TouchableOpacity>
            </View>

            {/* Total Panel (Valor Total no Topo) */}
            <View style={styles.totalPanel}>
              <View style={styles.totalBlock}>
                <Text style={styles.totalLabel}>VALOR TOTAL ACUMULADO</Text>
                <Text style={styles.totalValue}>{formatBRL(totalCost)}</Text>
              </View>
              <View style={styles.itemCountBlock}>
                <Text style={styles.itemCountLabel}>PRODUTOS</Text>
                <Text style={styles.itemCountValue}>{items.length}</Text>
              </View>
            </View>

            {/* Category Filter Chips */}
            <View style={styles.filterSection}>
              <SlidersHorizontal size={12} color="#6d7b6b" style={{ marginRight: 6 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory('Todas')}
                  style={[styles.filterChip, selectedCategory === 'Todas' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, selectedCategory === 'Todas' && styles.filterChipTextActive]}>
                    Todas ({items.length})
                  </Text>
                </TouchableOpacity>
                {CATEGORIES.map((cat) => {
                  const count = items.filter((item) => item.category === cat).length;
                  if (count === 0) return null;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={[styles.filterChip, selectedCategory === cat && styles.filterChipActive]}
                    >
                      <Text style={[styles.filterChipText, selectedCategory === cat && styles.filterChipTextActive]}>
                        {cat} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Spreadsheet Table Sheet */}
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sem produtos nesta visualização.</Text>
              </View>
            ) : (
              <View style={styles.tableBorderContainer}>
                <View style={styles.spreadsheetGrid}>
                    
                    {/* Header Row */}
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.thText, styles.colName]}>Item / Produto</Text>
                      <Text style={[styles.thText, styles.colSize, { textAlign: 'center' }]}>Medida</Text>
                      <Text style={[styles.thText, styles.colQty, { textAlign: 'center' }]}>Qtd</Text>
                      <Text style={[styles.thText, styles.colPrice, { textAlign: 'center' }]}>Preço (R$)</Text>
                      <Text style={[styles.thText, styles.colCost, { textAlign: 'right' }]}>Custo</Text>
                      <Text style={[styles.thText, styles.colAction]}></Text>
                    </View>

                    {/* Table Body */}
                    <ScrollView showsVerticalScrollIndicator={true} style={styles.tableScroll}>
                      {categoriesToRender.map((category) => {
                        const categoryItems = filteredItems.filter((item) => item.category === category);
                        const categoryTotal = categoryItems.reduce(
                          (sum, item) => sum + item.price * item.quantity,
                          0
                        );

                        return (
                          <React.Fragment key={category}>
                            {/* Category Group Header Row */}
                            <View style={styles.categoryHeaderRow}>
                              <Text style={styles.categoryHeaderText}>
                                {category} (Total: {formatBRL(categoryTotal)})
                              </Text>
                            </View>

                            {/* Category Items */}
                            {categoryItems.map((item, index) => {
                              const itemCost = item.price * item.quantity;
                              return (
                                <View
                                  key={item.id}
                                  style={[
                                    styles.tableBodyRow,
                                    index % 2 === 1 && styles.rowAlternative,
                                  ]}
                                >
                                  {/* Name Cell */}
                                  <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => handleItemTap(item)}
                                    style={styles.colName}
                                  >
                                    <Text style={[styles.cellText, styles.boldCellText]} numberOfLines={1}>
                                      {item.name}
                                    </Text>
                                  </TouchableOpacity>

                                  {/* Size Cell */}
                                  <Text style={[styles.cellText, styles.colSize, { textAlign: 'center' }]} numberOfLines={1}>
                                    {item.unitAmount} {item.unitType}
                                  </Text>

                                  {/* Qtd Cell Input */}
                                  <View style={styles.colQty}>
                                    <TextInput
                                      defaultValue={item.quantity.toString()}
                                      onChangeText={(val) => handleQtyChange(item.id, val)}
                                      keyboardType="numeric"
                                      style={styles.cellInput}
                                      textAlign="center"
                                    />
                                  </View>

                                  {/* Price Cell Input */}
                                  <View style={styles.colPrice}>
                                    <TextInput
                                      defaultValue={item.price > 0 ? item.price.toString() : ''}
                                      onChangeText={(val) => handlePriceChange(item.id, val)}
                                      keyboardType="numeric"
                                      style={styles.cellInput}
                                      textAlign="center"
                                      placeholder="0,00"
                                      placeholderTextColor="#bccbb8"
                                    />
                                  </View>

                                  {/* Cost Cell */}
                                  <Text style={[styles.cellText, styles.colCost, styles.costText, { textAlign: 'right' }]}>
                                    {formatBRL(itemCost)}
                                  </Text>

                                  {/* Actions Cell */}
                                  <TouchableOpacity
                                    onPress={() => onRemoveItem(item.id)}
                                    style={[styles.colAction, styles.deleteBtn]}
                                    activeOpacity={0.7}
                                  >
                                    <Trash2 size={13} color="#ef4444" />
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </ScrollView>
                  </View>
              </View>
            )}

            {/* Bottom Actions */}
            <TouchableOpacity onPress={onClose} style={styles.doneBtn} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Concluído</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const windowWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    height: '85%',
  },
  handleBar: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#bccbb8',
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleWrapper: {
    flexDirection: 'column',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#6d7b6b',
    marginTop: 2,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eeedf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalPanel: {
    flexDirection: 'row',
    backgroundColor: '#eeedf3',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalBlock: {
    flexDirection: 'column',
  },
  totalLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#006e28',
    marginTop: 2,
  },
  itemCountBlock: {
    alignItems: 'flex-end',
  },
  itemCountLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  itemCountValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1a1b1f',
    marginTop: 2,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#faf9fe',
    borderWidth: 1,
    borderColor: '#e3e2e7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterChipText: {
    fontSize: 11,
    color: '#6d7b6b',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  tableBorderContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e3e2e7',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#faf9fe',
    marginBottom: 16,
  },
  spreadsheetGrid: {
    flexDirection: 'column',
    width: '100%',
    flex: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#eeedf3',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bccbb8',
  },
  categoryHeaderRow: {
    backgroundColor: '#eaf4eb',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#bccbb8',
    borderTopWidth: 1,
    borderTopColor: '#eeedf3',
  },
  categoryHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006e28',
  },
  thText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  tableScroll: {
    flex: 1,
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eeedf3',
    backgroundColor: '#ffffff',
  },
  rowAlternative: {
    backgroundColor: '#faf9fe',
  },
  cellText: {
    fontSize: 12,
    color: '#1a1b1f',
  },
  boldCellText: {
    fontWeight: '700',
  },
  cellInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bccbb8',
    borderRadius: 6,
    height: 26,
    fontSize: 11,
    color: '#1a1b1f',
    fontWeight: '700',
    padding: 2,
    width: '100%',
  },
  costText: {
    fontWeight: '800',
    color: '#006e28',
  },
  deleteBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  colName: {
    flex: 2.3,
    paddingRight: 4,
  },
  colSize: {
    flex: 1.2,
    paddingHorizontal: 2,
  },
  colQty: {
    flex: 0.9,
    marginHorizontal: 2,
  },
  colPrice: {
    flex: 1.3,
    marginHorizontal: 2,
  },
  colCost: {
    flex: 1.3,
    paddingLeft: 2,
  },
  colAction: {
    flex: 0.7,
    alignItems: 'flex-end',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e3e2e7',
    borderRadius: 16,
    backgroundColor: '#faf9fe',
    marginBottom: 16,
  },
  emptyText: {
    color: '#6d7b6b',
    fontSize: 13,
  },
  doneBtn: {
    height: 48,
    borderRadius: 16,
    backgroundColor: '#1a1b1f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
