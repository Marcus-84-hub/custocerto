import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { CartItem, ViewTab } from './src/types';
import { useCartStore } from './src/store/useCartStore';
import { Header } from './src/components/Header';
import { Navigation } from './src/components/Navigation';
import { CartView } from './src/components/CartView';
import { BarcodeScannerModal } from './src/components/BarcodeScannerModal';
import { UnitComparatorView } from './src/components/UnitComparatorView';
import { HistoryView } from './src/components/HistoryView';
import { BudgetProfileView } from './src/components/BudgetProfileView';
import { QuickAddModal } from './src/components/QuickAddModal';
import { AnalyticalListView } from './src/components/AnalyticalListView';
import { EditItemModal } from './src/components/EditItemModal';
import { CartSpreadsheetModal } from './src/components/CartSpreadsheetModal';

// Evita que a tela de splash suma antes de o bundle React Native carregar
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  console.log('1. App render start!');
  const [activeTab, setActiveTab] = useState<ViewTab>('cart');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [itemToCompare, setItemToCompare] = useState<CartItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  console.log('2. useState hooks done!');

  // Consome a store Zustand para obter estado global e ações persistentes
  const store = useCartStore();
  console.log('3. useCartStore hook completed!', store ? 'Store carregada' : 'Store nula');

  const {
    cart,
    history,
    budgetLimit,
    selectedStore,
    listName,
    listCreatedAt,
    addItem,
    removeItem,
    updateQuantity,
    updateCartItem,
    setBudgetLimit,
    setSelectedStore,
    setListName,
    finishShopping,
    resetData,
    loadItemsFromHistory,
    planningList,
    addPlanningItem,
    removePlanningItem,
    updatePlanningItem,
    clearPlanningList,
    copyPlanningListToCart,
    togglePlanningItemCheck,
    movePlanningItem,
  } = store;

  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  console.log('4. Calculos do carrinho concluídos. Total:', totalCartAmount, 'Itens:', totalCartItemsCount);

  React.useEffect(() => {
    console.log('5. App useEffect disparado (ciclo de vida nativo ativo)!');
    // Oculta a tela de splash do Expo Go assim que o componente renderiza
    SplashScreen.hideAsync().catch(() => {});
    
    const timer = setTimeout(() => {
      console.log('6. Disparando Alert.alert nativo...');
      Alert.alert('CustoCerto', 'Aplicativo iniciado com sucesso!');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleCompareItem = (item: CartItem) => {
    setItemToCompare(item);
    setActiveTab('comparator');
  };

  const handleFinishShopping = () => {
    const result = finishShopping();
    if (result) {
      Alert.alert(
        'Compra Finalizada!',
        `Sua compra de R$ ${result.totalAmount.toFixed(2)} com ${result.itemCount} itens foi registrada com sucesso no histórico.`,
        [{ text: 'Ver Histórico', onPress: () => setActiveTab('history') }]
      );
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Restaurar Dados?',
      'Deseja restaurar os dados iniciais de demonstração do CustoCerto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restaurar',
          onPress: () => {
            resetData();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ExpoStatusBar style="dark" />
      
      {/* Header com indicador de progresso de orçamento */}
      <Header
        totalCartAmount={totalCartAmount}
        budgetLimit={budgetLimit}
        itemCount={totalCartItemsCount}
        onOpenBudgetModal={() => setActiveTab('profile')}
        onOpenMenu={() => setActiveTab('profile')}
      />

      {/* Área Principal de Abas */}
      <View style={styles.mainContent}>
        {activeTab === 'cart' && (
          <CartView
            items={cart}
            budgetLimit={budgetLimit}
            listName={listName}
            listCreatedAt={listCreatedAt}
            onUpdateListName={setListName}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenManualAdd={() => setIsQuickAddOpen(true)}
            onFinishShopping={handleFinishShopping}
            onCompareItem={handleCompareItem}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsEditModalOpen(true);
            }}
            onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)}
          />
        )}

        {activeTab === 'planning' && (
          <AnalyticalListView
            planningList={planningList}
            budgetLimit={budgetLimit}
            onAddPlanningItem={addPlanningItem}
            onRemovePlanningItem={removePlanningItem}
            onUpdatePlanningItem={updatePlanningItem}
            onClearPlanningList={clearPlanningList}
            onCopyPlanningListToCart={copyPlanningListToCart}
            onTogglePlanningItemCheck={togglePlanningItemCheck}
            onMovePlanningItem={movePlanningItem}
            onSwitchToCartTab={() => setActiveTab('cart')}
          />
        )}

        {activeTab === 'comparator' && (
          <UnitComparatorView
            initialItemToCompare={itemToCompare}
            onSelectOptionForCart={(item) => {
              addItem(item);
              setItemToCompare(null);
              setActiveTab('cart');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={history}
            onStartNewShopping={() => setActiveTab('cart')}
            onCloneSession={(session) => {
              Alert.alert(
                'Montar Nova Lista?',
                `Deseja iniciar uma nova compra com os mesmos itens da compra "${session.listName || session.storeName}"?\nSeu carrinho atual será substituído.`,
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Criar Lista',
                    onPress: () => {
                      loadItemsFromHistory(session.items, session.listName || session.storeName);
                      setActiveTab('cart');
                    },
                  },
                ]
              );
            }}
          />
        )}

        {activeTab === 'profile' && (
          <BudgetProfileView
            budgetLimit={budgetLimit}
            onUpdateBudget={setBudgetLimit}
            selectedStore={selectedStore}
            onUpdateStore={setSelectedStore}
            onResetData={handleResetData}
          />
        )}
      </View>

      {/* Navegação Inferior estilo iOS */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modal do Scanner de Código de Barras / Fotos */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddToCart={addItem}
        onOpenCompareWithOptions={(item) => {
          handleCompareItem(item);
          setIsScannerOpen(false);
        }}
      />

      {/* Modal de Adição Manual Rápida */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddItem={addItem}
      />

      {/* Modal de Edição de Item */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemToEdit(null);
        }}
        item={itemToEdit}
        onSave={updateCartItem}
      />

      {/* Modal da Planilha Excel do Carrinho */}
      <CartSpreadsheetModal
        isOpen={isSpreadsheetOpen}
        onClose={() => setIsSpreadsheetOpen(false)}
        items={cart}
        onRemoveItem={removeItem}
        onUpdateQuantity={updateQuantity}
        onUpdateItemFields={updateCartItem}
        onEditItem={(item) => {
          setItemToEdit(item);
          setIsEditModalOpen(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fe',
  },
  mainContent: {
    flex: 1,
    paddingBottom: 72, // Espaço para a barra de navegação no rodapé
  },
});
