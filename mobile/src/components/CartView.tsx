import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  Plus,
  Minus,
  Trash2,
  Camera,
  PlusCircle,
  TrendingUp,
  CheckCircle,
  ShoppingBag,
  Sparkles,
  ClipboardList,
} from 'lucide-react-native';
import { CartItem } from '../types';
import {
  formatBRL,
  calculateUnitPrice,
  getBaseUnitLabel,
  calculateInflation,
} from '../utils/calculator';

const formatDateTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} às ${hours}:${minutes}`;
  } catch {
    return isoString || '';
  }
};

interface CartViewProps {
  items: CartItem[];
  budgetLimit: number;
  listName?: string;
  listCreatedAt?: string;
  onUpdateListName?: (name: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenScanner: () => void;
  onOpenManualAdd: () => void;
  onFinishShopping: () => void;
  onCompareItem?: (item: CartItem) => void;
  onEditItem?: (item: CartItem) => void;
  onOpenSpreadsheet: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  items,
  budgetLimit,
  listName,
  listCreatedAt,
  onUpdateListName,
  onUpdateQuantity,
  onRemoveItem,
  onOpenScanner,
  onOpenManualAdd,
  onFinishShopping,
  onCompareItem,
  onEditItem,
  onOpenSpreadsheet,
}) => {
  console.log('CartView rendering!');
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Budget Summary Card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetSublabel}>BLINDAGEM DE CAIXA</Text>
              <Text style={styles.budgetAmount}>{formatBRL(totalAmount)}</Text>
            </View>
            <View style={styles.budgetRight}>
              <Text style={styles.budgetLimitText}>Meta: {formatBRL(budgetLimit)}</Text>
              <View
                style={[
                  styles.statusBadge,
                  isOverBudget ? styles.statusBadgeOver : styles.statusBadgeNormal,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isOverBudget ? styles.statusBadgeTextOver : styles.statusBadgeTextNormal,
                  ]}
                >
                  {isOverBudget
                    ? `Excedeu ${formatBRL(Math.abs(remaining))}`
                    : `Resta ${formatBRL(remaining)}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Inflation Alert Banner */}
          {itemsWithInflation.length > 0 && (
            <View style={styles.inflationBanner}>
              <TrendingUp size={14} color="#b45309" />
              <Text style={styles.inflationBannerText}>
                <Text style={{ fontWeight: '800' }}>{itemsWithInflation.length}</Text>{' '}
                {itemsWithInflation.length === 1 ? 'item subiu' : 'itens subiram'} de preço vs última compra.
              </Text>
            </View>
          )}
        </View>

        {/* List Name Card (Always visible to allow naming before/during shopping) */}
        <View style={styles.listNameCard}>
          <View style={styles.listNameSection}>
            <View style={styles.listNameHeaderRow}>
              <Text style={styles.listSectionLabel}>NOME DA LISTA DE COMPRAS</Text>
              {listCreatedAt ? (
                <Text style={styles.listCreatedAtText}>
                  Criada em: {formatDateTime(listCreatedAt)}
                </Text>
              ) : null}
            </View>
            <TextInput
              value={listName}
              onChangeText={onUpdateListName}
              style={styles.listNameInput}
              placeholder="Meu Carrinho"
              placeholderTextColor="#bccbb8"
            />
          </View>
        </View>

        {/* Cart Items List */}
        {items.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <ShoppingBag size={40} color="#6d7b6b" />
            </View>
            <Text style={styles.emptyTitle}>Seu carrinho está vazio</Text>
            <Text style={styles.emptyDescription}>
              Bipe o código de barras ou adicione produtos para acompanhar o total em tempo real no corredor.
            </Text>
            <TouchableOpacity onPress={onOpenScanner} style={styles.emptyScannerBtn} activeOpacity={0.8}>
              <Camera size={16} color="#ffffff" />
              <Text style={styles.emptyScannerBtnText}>Bipar Primeiro Produto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            <View style={styles.listHeader}>
              <Text style={styles.itemsListTitle}>
                ITENS NO CARRINHO ({totalItemsCount})
              </Text>
              <TouchableOpacity
                onPress={onOpenManualAdd}
                style={styles.addManualBtn}
                activeOpacity={0.7}
              >
                <PlusCircle size={14} color="#006e28" />
                <Text style={styles.addManualBtnText}>Adicionar Manual</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemsList}>
              {items.map((item) => {
                const unitPrice = calculateUnitPrice(item.price, item.unitAmount, item.unitType);
                const baseUnit = getBaseUnitLabel(item.unitType);
                const inflation = calculateInflation(item.price, item.previousPrice);

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <TouchableOpacity
                      onPress={() => onEditItem?.(item)}
                      style={styles.itemCardTouchable}
                      activeOpacity={0.7}
                    >
                      {/* Image / Thumbnail */}
                      <View style={styles.thumbnailContainer}>
                        {item.imageUrl ? (
                          <Image source={{ uri: item.imageUrl }} style={styles.thumbnailImage} />
                        ) : (
                          <Text style={styles.thumbnailPlaceholder}>🛒</Text>
                        )}
                      </View>

                      {/* Info */}
                      <View style={styles.itemInfo}>
                        <View style={styles.titleRow}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          {inflation.isHigher && (
                            <View style={styles.inflationBadge}>
                              <TrendingUp size={10} color="#92400e" />
                              <Text style={styles.inflationBadgeText}>+{inflation.percent}%</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.priceRow}>
                          <Text style={styles.itemPrice}>{formatBRL(item.price)}</Text>
                          <Text style={styles.itemUnitPrice}>
                            {formatBRL(unitPrice)} / {baseUnit}
                          </Text>
                        </View>

                        {onCompareItem && (
                          <TouchableOpacity
                            onPress={() => onCompareItem(item)}
                            style={styles.compareBtn}
                            activeOpacity={0.7}
                          >
                            <Sparkles size={11} color="#4f46e5" />
                            <Text style={styles.compareBtnText}>Comparar embalagens</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Action controls */}
                    <View style={styles.itemActions}>
                      <TouchableOpacity
                        onPress={() => onRemoveItem(item.id)}
                        style={styles.removeBtn}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color="#ff3b30" />
                      </TouchableOpacity>

                      <View style={styles.qtyContainer}>
                        <TouchableOpacity
                          onPress={() => onUpdateQuantity(item.id, -1)}
                          style={styles.qtyBtn}
                          activeOpacity={0.7}
                        >
                          <Minus size={12} color="#006e28" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => onUpdateQuantity(item.id, 1)}
                          style={styles.qtyBtn}
                          activeOpacity={0.7}
                        >
                          <Plus size={12} color="#006e28" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Finish Shopping Button */}
            <TouchableOpacity
              onPress={onFinishShopping}
              style={styles.finishBtn}
              activeOpacity={0.8}
            >
              <CheckCircle size={20} color="#006e28" />
              <Text style={styles.finishBtnText}>Finalizar Compra</Text>
            </TouchableOpacity>

            {/* Spreadsheet Button */}
            <TouchableOpacity
              onPress={onOpenSpreadsheet}
              style={styles.spreadsheetBtn}
              activeOpacity={0.8}
            >
              <ClipboardList size={20} color="#4f46e5" />
              <Text style={styles.spreadsheetBtnText}>Ver Planilha de Itens</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Bar */}
      {items.length > 0 && (
        <View style={styles.floatingBar}>
          <TouchableOpacity
            onPress={onOpenScanner}
            style={styles.floatingScanBtn}
            activeOpacity={0.85}
          >
            <Camera size={20} color="#ffffff" />
            <Text style={styles.floatingScanBtnText}>Bipar Código de Barras</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fe',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120, // Leave room for floating bar & bottom navigation
  },
  budgetCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  budgetSublabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1b1f',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  budgetRight: {
    alignItems: 'flex-end',
  },
  budgetLimitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6d7b6b',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusBadgeNormal: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  statusBadgeOver: {
    backgroundColor: '#ffebe9',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadgeTextNormal: {
    color: '#006e28',
  },
  statusBadgeTextOver: {
    color: '#ff3b30',
  },
  inflationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  inflationBannerText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eeedf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  emptyDescription: {
    fontSize: 13,
    color: '#6d7b6b',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  emptyScannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#006e28',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
    shadowColor: '#006e28',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyScannerBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    gap: 12,
  },
  listNameCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  listSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemsListTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  listNameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  listCreatedAtText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8b9b8a',
  },
  listNameSection: {
    width: '100%',
  },
  listNameInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1b1f',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eeedf3',
  },
  addManualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addManualBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#006e28',
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  itemCardTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnailContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f4f3f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  thumbnailPlaceholder: {
    fontSize: 20,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1b1f',
    flexShrink: 1,
  },
  inflationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 2,
  },
  inflationBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400e',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#006e28',
  },
  itemUnitPrice: {
    fontSize: 11,
    color: '#6d7b6b',
    fontWeight: '600',
  },
  compareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  compareBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4f46e5',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 56,
  },
  removeBtn: {
    padding: 2,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeedf3',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1b1f',
    minWidth: 16,
    textAlign: 'center',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#006e28',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#006e28',
  },
  spreadsheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#4f46e5',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 12,
    gap: 8,
    marginTop: 10,
  },
  spreadsheetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  floatingBar: {
    position: 'absolute',
    bottom: 96, // Above navigation bar
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  floatingScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#006e28',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 10,
    width: '100%',
    maxWidth: 280,
    shadowColor: '#006e28',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingScanBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
