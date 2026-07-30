import React, { useState } from 'react';
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
} from 'react-native';
import { X, Plus, ShoppingCart } from 'lucide-react-native';
import { CartItem, ItemCategory, UnitType } from '../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onAddItem }) => {
  console.log('QuickAddModal rendering!');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [unitAmount, setUnitAmount] = useState('1');
  const [unitType, setUnitType] = useState<UnitType>('kg');
  const [category, setCategory] = useState<ItemCategory>('Alimentos');

  const handleSubmit = () => {
    const parsedPrice = parseFloat(price.replace(/\./g, '').replace(',', '.')) || 0;
    const parsedAmount = parseFloat(unitAmount.replace(',', '.')) || 1;

    if (!name.trim() || parsedPrice <= 0) return;

    onAddItem({
      name: name.trim(),
      brand: brand.trim() || undefined,
      price: parsedPrice,
      quantity: 1,
      unitAmount: parsedAmount,
      unitType,
      category,
    });

    // Reset and close
    setName('');
    setBrand('');
    setPrice('');
    setUnitAmount('1');
    onClose();
  };

  const quickPresets = [
    { name: 'Arroz 5kg', price: '28,00', amount: 5, unit: 'kg' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Feijão 1kg', price: '7,80', amount: 1, unit: 'kg' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Óleo de Soja 900ml', price: '6,50', amount: 900, unit: 'mL' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Açúcar 1kg', price: '4,90', amount: 1, unit: 'kg' as UnitType, category: 'Alimentos' as ItemCategory },
    { name: 'Café 250g', price: '24,90', amount: 250, unit: 'g' as UnitType, category: 'Alimentos' as ItemCategory },
  ];

  const applyPreset = (p: typeof quickPresets[0]) => {
    setName(p.name);
    setPrice(p.price);
    setUnitAmount(p.amount.toString());
    setUnitType(p.unit);
    setCategory(p.category);
  };

  const categories: ItemCategory[] = ['Alimentos', 'Limpeza', 'Higiene', 'Bebidas', 'Hortifruti', 'Outros'];
  const units: UnitType[] = ['kg', 'g', 'L', 'mL', 'rolo', 'un'];

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBg}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleContainer}>
              <ShoppingCart size={20} color="#006e28" />
              <Text style={styles.modalTitle}>Adicionar Manualmente</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
            {/* Quick Presets */}
            <View style={styles.presetSection}>
              <Text style={styles.sectionLabel}>ATALHOS FREQUENTES</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsList}>
                {quickPresets.map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => applyPreset(p)}
                    style={styles.presetBadge}
                  >
                    <Text style={styles.presetBadgeText}>+ {p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Product Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NOME DO PRODUTO</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: Sabão Omo, Arroz, Leite..."
                placeholderTextColor="#999"
                style={styles.textInput}
              />
            </View>

            {/* Price & Brand */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>PREÇO TOTAL (R$)</Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="18,90"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  style={[styles.textInput, styles.priceInput]}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>MARCA (OPCIONAL)</Text>
                <TextInput
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Ex: Ypê, Camil"
                  placeholderTextColor="#999"
                  style={styles.textInput}
                />
              </View>
            </View>

            {/* Pack Size & Unit */}
            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>TAMANHO EMBALAGEM</Text>
                <TextInput
                  value={unitAmount}
                  onChangeText={setUnitAmount}
                  placeholder="1"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  style={styles.textInput}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>UNIDADE</Text>
                <View style={styles.selectorRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalSelector}>
                    {units.map((u) => (
                      <TouchableOpacity
                        key={u}
                        onPress={() => setUnitType(u)}
                        style={[
                          styles.selectorItem,
                          unitType === u && styles.selectorItemActive,
                        ]}
                      >
                        <Text style={[styles.selectorText, unitType === u && styles.selectorTextActive]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Category Select */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>CATEGORIA</Text>
              <View style={styles.gridSelector}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    style={[
                      styles.gridItem,
                      category === c && styles.gridItemActive,
                    ]}
                  >
                    <Text style={[styles.gridText, category === c && styles.gridTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn} activeOpacity={0.8}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.submitBtnText}>Adicionar ao Carrinho</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f3f8',
  },
  modalHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1b1f',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    paddingTop: 16,
    gap: 16,
  },
  presetSection: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  presetsList: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 4,
  },
  presetBadge: {
    backgroundColor: '#f4f3f8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1b1f',
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7b6b',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#f4f3f8',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1b1f',
  },
  priceInput: {
    color: '#006e28',
    fontWeight: '800',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  selectorRow: {
    height: 42,
    justifyContent: 'center',
  },
  horizontalSelector: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  selectorItem: {
    backgroundColor: '#f4f3f8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e3e2e7',
  },
  selectorItemActive: {
    backgroundColor: '#006e28',
    borderColor: '#006e28',
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3d4a3c',
  },
  selectorTextActive: {
    color: '#ffffff',
  },
  gridSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  gridItem: {
    backgroundColor: '#f4f3f8',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  gridItemActive: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderColor: '#006e28',
  },
  gridText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1b1f',
  },
  gridTextActive: {
    color: '#006e28',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#006e28',
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
});
