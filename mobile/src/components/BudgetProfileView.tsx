import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Shield, Target, Store, Check, RotateCcw } from 'lucide-react-native';
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

  const handleSaveBudget = () => {
    const parsed = parseFloat(inputLimit.replace(/\./g, '').replace(',', '.')) || 200;
    onUpdateBudget(parsed);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Context Header */}
      <View style={styles.header}>
        <Text style={styles.sublabel}>CONFIGURAÇÃO & BLINDAGEM</Text>
        <Text style={styles.title}>Perfil & Teto de Gastos</Text>
        <Text style={styles.description}>
          Ajuste o limite máximo da sua compra atual e selecione o supermercado para calibrar a inteligência de preços.
        </Text>
      </View>

      {/* Budget Limit Form */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Target size={18} color="#006e28" />
          <Text style={styles.cardTitle}>Limite do Carrinho (Teto MÁX)</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.fieldLabel}>VALOR EM REAIS (R$)</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.currencyPrefix}>R$</Text>
            <TextInput
              value={inputLimit}
              onChangeText={setInputLimit}
              placeholder="200,00"
              keyboardType="numeric"
              style={styles.textInput}
            />
          </View>

          <TouchableOpacity onPress={handleSaveBudget} style={styles.saveBtn} activeOpacity={0.8}>
            {savedSuccess ? (
              <View style={styles.btnContent}>
                <Check size={16} color="#72fe88" />
                <Text style={styles.saveBtnText}>Salvo com Sucesso!</Text>
              </View>
            ) : (
              <Text style={styles.saveBtnText}>Atualizar Limite de Compra</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Supermarket Selection */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Store size={18} color="#006e28" />
          <Text style={styles.cardTitle}>Supermercado Atual</Text>
        </View>

        <View style={styles.storeList}>
          {stores.map((st) => {
            const isSelected = selectedStore === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => onUpdateStore(st)}
                style={[
                  styles.storeBtn,
                  isSelected ? styles.storeBtnSelected : styles.storeBtnNormal,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.storeBtnText,
                    isSelected ? styles.storeBtnTextSelected : styles.storeBtnTextNormal,
                  ]}
                >
                  {st}
                </Text>
                {isSelected && <Check size={16} color="#006e28" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Offline Mode Status Card */}
      <View style={styles.offlineCard}>
        <View style={styles.shieldBg}>
          <Shield size={20} color="#006e28" />
        </View>
        <View style={styles.offlineContent}>
          <Text style={styles.offlineTitle}>Operação 100% Offline-First</Text>
          <Text style={styles.offlineDescription}>
            Seus dados são salvos com segurança diretamente no seu dispositivo, garantindo velocidade total sem sinal de internet no mercado.
          </Text>
        </View>
      </View>

      {/* Danger Zone */}
      <TouchableOpacity onPress={onResetData} style={styles.resetBtn} activeOpacity={0.8}>
        <RotateCcw size={14} color="#ff3b30" />
        <Text style={styles.resetBtnText}>Restaurar Dados Iniciais</Text>
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
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1b1f',
    letterSpacing: -0.3,
  },
  form: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6d7b6b',
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  currencyPrefix: {
    position: 'absolute',
    left: 12,
    fontSize: 18,
    fontWeight: '800',
    color: '#999',
  },
  textInput: {
    backgroundColor: '#f4f3f8',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 38,
    paddingRight: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  saveBtn: {
    backgroundColor: '#006e28',
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  storeList: {
    gap: 8,
  },
  storeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  storeBtnNormal: {
    borderColor: '#e3e2e7',
    backgroundColor: '#ffffff',
  },
  storeBtnSelected: {
    borderColor: '#34c759',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  storeBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  storeBtnTextNormal: {
    color: '#1a1b1f',
  },
  storeBtnTextSelected: {
    color: '#004d1a',
  },
  offlineCard: {
    backgroundColor: '#f4f3f8',
    borderColor: '#e3e2e7',
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 110, 40, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineContent: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1a1b1f',
  },
  offlineDescription: {
    fontSize: 11,
    color: '#6d7b6b',
    marginTop: 2,
    lineHeight: 15,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 59, 48, 0.25)',
    borderWidth: 1,
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    paddingVertical: 10,
    gap: 6,
  },
  resetBtnText: {
    color: '#ff3b30',
    fontSize: 12,
    fontWeight: '700',
  },
});
