import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, ShoppingCart, Sparkles } from 'lucide-react-native';
import { CartItem, ItemCategory, UnitType } from '../types';
import { formatBRL, calculateUnitPrice, getBaseUnitLabel } from '../utils/calculator';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onSave: (id: string, updatedFields: Partial<CartItem>) => void;
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

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  item,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitAmount, setUnitAmount] = useState('');
  const [unitType, setUnitType] = useState<UnitType>('un');
  const [category, setCategory] = useState<ItemCategory>('Alimentos');

  // Load item data when modal opens
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setBrand(item.brand || '');
      setPrice(item.price ? item.price.toString() : '0');
      setQuantity(item.quantity ? item.quantity.toString() : '1');
      setUnitAmount(item.unitAmount ? item.unitAmount.toString() : '1');
      setUnitType(item.unitType || 'un');
      setCategory(item.category || 'Alimentos');
    }
  }, [item, isOpen]);

  if (!item) return null;

  // Real-time calculations for feedback
  const numPrice = parseFloat(price.replace(',', '.')) || 0;
  const numQty = parseFloat(quantity) || 1;
  const numAmount = parseFloat(unitAmount) || 1;
  const totalCost = numPrice * numQty;

  const unitPrice = calculateUnitPrice(numPrice, numAmount, unitType);
  const baseUnit = getBaseUnitLabel(unitType);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do produto.');
      return;
    }

    onSave(item.id, {
      name: name.trim(),
      brand: brand.trim() || undefined,
      price: numPrice,
      quantity: numQty,
      unitAmount: numAmount,
      unitType,
      category,
    });

    onClose();
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContent}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <ShoppingCart size={18} color="#006e28" />
                <Text style={styles.title}>Editar Produto</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#1a1b1f" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContainer}
              keyboardShouldPersistTaps="handled"
            >
              {/* Nome */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NOME DO PRODUTO *</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex: Sabão em Pó, Arroz..."
                  style={styles.textInput}
                  placeholderTextColor="#8a898e"
                />
              </View>

              {/* Marca */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>MARCA / FABRICANTE</Text>
                <TextInput
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Ex: Omo, Tio João (Opcional)..."
                  style={styles.textInput}
                  placeholderTextColor="#8a898e"
                />
              </View>

              <View style={styles.row}>
                {/* Preço */}
                <View style={[styles.inputGroup, { flex: 1.2, marginRight: 8 }]}>
                  <Text style={styles.label}>PREÇO UNITÁRIO (R$)</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                    style={styles.textInput}
                    placeholderTextColor="#8a898e"
                  />
                </View>

                {/* Quantidade */}
                <View style={[styles.inputGroup, { flex: 0.8 }]}>
                  <Text style={styles.label}>QUANTIDADE</Text>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="1"
                    style={styles.textInput}
                    placeholderTextColor="#8a898e"
                  />
                </View>
              </View>

              <View style={styles.row}>
                {/* Tamanho Embalagem */}
                <View style={[styles.inputGroup, { flex: 1.2, marginRight: 8 }]}>
                  <Text style={styles.label}>CONTEÚDO DA EMBALAGEM</Text>
                  <TextInput
                    value={unitAmount}
                    onChangeText={setUnitAmount}
                    keyboardType="numeric"
                    placeholder="Ex: 500, 1, 250"
                    style={styles.textInput}
                    placeholderTextColor="#8a898e"
                  />
                </View>

                {/* Unidade */}
                <View style={[styles.inputGroup, { flex: 0.8 }]}>
                  <Text style={styles.label}>MEDIDA</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setUnitType(u)}
                        style={[styles.unitChip, unitType === u && styles.unitChipActive]}
                      >
                        <Text style={[styles.unitChipText, unitType === u && styles.unitChipTextActive]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Categorias */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CATEGORIA</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[styles.catChip, category === cat && styles.catChipActive]}
                    >
                      <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Calculadora em Tempo Real / Resumo */}
              <View style={styles.feedbackCard}>
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackLabel}>Custo do Item:</Text>
                  <Text style={styles.feedbackValue}>{formatBRL(totalCost)}</Text>
                </View>
                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackLabel}>Preço por Unidade:</Text>
                  <View style={styles.unitValContainer}>
                    <Sparkles size={11} color="#006e28" style={{ marginRight: 4 }} />
                    <Text style={styles.feedbackUnitValue}>
                      {formatBRL(unitPrice)} / {baseUnit}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.cancelBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.saveBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Salvar Alterações</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#faf9fe',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#bccbb8',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eeedf3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1a1b1f',
  },
  row: {
    flexDirection: 'row',
  },
  unitScroll: {
    flexDirection: 'row',
  },
  unitChip: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 6,
    height: 32,
  },
  unitChipActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.25)',
    borderColor: '#34c759',
  },
  unitChipText: {
    fontSize: 11,
    color: '#1a1b1f',
    fontWeight: '600',
  },
  unitChipTextActive: {
    color: '#004d1a',
    fontWeight: '800',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catChip: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  catChipActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.25)',
    borderColor: '#34c759',
  },
  catChipText: {
    fontSize: 12,
    color: '#1a1b1f',
    fontWeight: '600',
  },
  catChipTextActive: {
    color: '#004d1a',
    fontWeight: '800',
  },
  feedbackCard: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
    borderRadius: 20,
    padding: 16,
    marginVertical: 8,
    gap: 8,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d4f3b',
  },
  feedbackValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#006e28',
  },
  feedbackUnitValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#006e28',
  },
  unitValContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#eeedf3',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#1a1b1f',
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: '#006e28',
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
