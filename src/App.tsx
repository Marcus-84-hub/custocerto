import React, { useState, useEffect } from 'react';
import { CartItem, ShoppingSession, ViewTab } from './types';
import {
  getStoredCart,
  saveStoredCart,
  getStoredHistory,
  saveStoredHistory,
  getStoredBudget,
  saveStoredBudget,
  INITIAL_CART,
  INITIAL_HISTORY,
} from './data/mockDatabase';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CartView } from './components/CartView';
import { BarcodeScannerModal, initAudioContext } from './components/BarcodeScannerModal';
import { UnitComparatorView } from './components/UnitComparatorView';
import { HistoryView } from './components/HistoryView';
import { BudgetProfileView } from './components/BudgetProfileView';
import { QuickAddModal } from './components/QuickAddModal';
import { AnalyticalListView } from './components/AnalyticalListView';
import { CartSpreadsheetModal } from './components/CartSpreadsheetModal';
import { EditItemModal } from './components/EditItemModal';
import { NewListModal } from './components/NewListModal';
import { CustomToastContainer, CustomConfirmModal, CustomAlertModal, ToastMessage } from './components/CustomDialogs';
import { evaluateComparison } from './utils/calculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('cart');
  const [cart, setCart] = useState<CartItem[]>(getStoredCart);
  const [history, setHistory] = useState<ShoppingSession[]>(getStoredHistory);
  const [budgetLimit, setBudgetLimit] = useState<number>(getStoredBudget);
  
  const [selectedStore, setSelectedStore] = useState<string>(() => {
    return localStorage.getItem('custocerto_store_name_v2') || 'Carrefour - Morumbi';
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [itemToCompare, setItemToCompare] = useState<CartItem | null>(null);

  // New states for mobile features on Web
  const [planningList, setPlanningList] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem('custocerto_planning_v2');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // State hooks for list registration & metadata
  const [listName, setListName] = useState<string>(() => {
    return localStorage.getItem('custocerto_list_name_v2') || 'Meu Carrinho';
  });
  const [listProtocol, setListProtocol] = useState<string>(() => {
    return localStorage.getItem('custocerto_list_protocol_v2') || '';
  });
  const [listCreatedAt, setListCreatedAt] = useState<string>(() => {
    return localStorage.getItem('custocerto_list_created_v2') || '';
  });
  const [storeAddress, setStoreAddress] = useState<string>(() => {
    return localStorage.getItem('custocerto_store_address_v2') || '';
  });

  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CartItem | null>(null);
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);

  // States for custom notifications and dialogs
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToasts((prev) => [...prev, { id: `toast-${Date.now()}-${Math.random()}`, message, type }]);
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmConfig({ title, message, onConfirm });
  };

  const showAlert = (title: string, message: string) => {
    setAlertConfig({ title, message });
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync cart to local storage
  useEffect(() => {
    saveStoredCart(cart);
  }, [cart]);

  // Sync history
  useEffect(() => {
    saveStoredHistory(history);
  }, [history]);

  // Sync budget
  useEffect(() => {
    saveStoredBudget(budgetLimit);
  }, [budgetLimit]);

  // Sync planning list
  useEffect(() => {
    try {
      localStorage.setItem('custocerto_planning_v2', JSON.stringify(planningList));
    } catch (e) {
      console.error('Failed to save planning list:', e);
    }
  }, [planningList]);

  // Sync store name
  useEffect(() => {
    localStorage.setItem('custocerto_store_name_v2', selectedStore);
  }, [selectedStore]);

  // Sync listName
  useEffect(() => {
    localStorage.setItem('custocerto_list_name_v2', listName);
  }, [listName]);

  // Sync listProtocol
  useEffect(() => {
    localStorage.setItem('custocerto_list_protocol_v2', listProtocol);
  }, [listProtocol]);

  // Sync listCreatedAt
  useEffect(() => {
    localStorage.setItem('custocerto_list_created_v2', listCreatedAt);
  }, [listCreatedAt]);

  // Sync storeAddress
  useEffect(() => {
    localStorage.setItem('custocerto_store_address_v2', storeAddress);
  }, [storeAddress]);

  const totalCartAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (newItem: Omit<CartItem, 'id' | 'addedAt'>) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.name.toLowerCase() === newItem.name.toLowerCase() || (newItem.barcode && item.barcode === newItem.barcode)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + (newItem.quantity || 1),
          price: newItem.price,
        };
        return updated;
      }

      return [
        {
          ...newItem,
          id: `item-${Date.now()}`,
          addedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const handleBulkAddToCart = (newItems: Omit<CartItem, 'id' | 'addedAt'>[]) => {
    setCart((prev) => {
      const updated = [...prev];
      newItems.forEach((newItem) => {
        const existingIdx = updated.findIndex(
          (item) => item.name.toLowerCase() === newItem.name.toLowerCase() || (newItem.barcode && item.barcode === newItem.barcode)
        );

        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + (newItem.quantity || 1),
            price: newItem.price,
          };
        } else {
          updated.unshift({
            ...newItem,
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            addedAt: new Date().toISOString(),
          } as CartItem);
        }
      });
      return updated;
    });
    showToast(`${newItems.length} itens importados com sucesso!`, 'success');
  };

  // Update specific fields of a cart item (detailed edit & spreadsheet edit)
  const handleUpdateCartItem = (id: string, updatedFields: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const handleCompareItem = (item: CartItem) => {
    setItemToCompare(item);
    setActiveTab('comparator');
  };

  const handleFinishShopping = () => {
    if (cart.length === 0) return;

    const estimatedSavings = cart.reduce((sum, item) => sum + item.price * 0.12 * item.quantity, 0);

    const newSession: ShoppingSession = {
      id: `session-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      storeName: selectedStore,
      listName: listName,
      listCreatedAt: listCreatedAt,
      itemsCount: totalCartItemsCount,
      totalAmount: totalCartAmount,
      budgetLimit,
      totalSavings: parseFloat(estimatedSavings.toFixed(2)),
      items: [...cart],
    };

    setHistory((prev) => [newSession, ...prev]);
    setCart([]);
    showToast(`Compra de ${totalCartItemsCount} itens finalizada com sucesso! Salva no histórico.`, 'success');
    setActiveTab('history');
  };

  const handleResetData = () => {
    const executeReset = () => {
      setCart(INITIAL_CART);
      setHistory(INITIAL_HISTORY);
      setBudgetLimit(200.00);
      setPlanningList([]);
      setListName('Meu Carrinho');
      setSelectedStore('Carrefour - Morumbi');
      setStoreAddress('Av. Alberto Augusto Alves, 50 - Morumbi');
      setListProtocol('');
      setListCreatedAt('');
      localStorage.clear();
      showToast('Dados restaurados com sucesso!', 'success');
      setTimeout(() => window.location.reload(), 1500);
    };

    showConfirm(
      'Restaurar Dados?',
      'Deseja restaurar os dados iniciais de demonstração do CustoCerto? Isso apagará suas listas atuais.',
      executeReset
    );
  };

  // Start new shopping list handler
  const handleStartNewList = (data: {
    listName: string;
    storeName: string;
    storeAddress: string;
    protocol: string;
    items: CartItem[];
  }) => {
    setListName(data.listName);
    setSelectedStore(data.storeName);
    setStoreAddress(data.storeAddress);
    setListProtocol(data.protocol);
    setListCreatedAt(new Date().toISOString());
    setCart(data.items);
    showToast('Nova lista de compras criada com sucesso!', 'success');
    setActiveTab('cart');
  };

  // Planning List Action Handlers
  const handleAddPlanningItem = (newItem: Omit<CartItem, 'id' | 'addedAt'>) => {
    setPlanningList((prev) => [
      {
        ...newItem,
        id: `plan-${Date.now()}`,
        addedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleRemovePlanningItem = (id: string) => {
    setPlanningList((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdatePlanningItem = (id: string, field: keyof CartItem, value: any) => {
    setPlanningList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleClearPlanningList = () => {
    setPlanningList([]);
  };

  const handleTogglePlanningItemCheck = (id: string) => {
    setPlanningList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isChecked: !item.isChecked } : item))
    );
  };

  const handleMovePlanningItem = (id: string, direction: 'up' | 'down') => {
    setPlanningList((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;
      
      const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;

      const updated = [...prev];
      const [moved] = updated.splice(idx, 1);
      updated.splice(nextIdx, 0, moved);
      return updated;
    });
  };

  const handleCopyPlanningListToCart = () => {
    const checkedItems = planningList.filter((item) => item.isChecked);
    if (checkedItems.length === 0) return;

    setCart((prev) => {
      let updated = [...prev];
      checkedItems.forEach((item) => {
        const existingIdx = updated.findIndex(
          (cartItem) => cartItem.name.toLowerCase() === item.name.toLowerCase()
        );

        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + item.quantity,
            price: item.price || updated[existingIdx].price,
          };
        } else {
          updated = [
            {
              ...item,
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              addedAt: new Date().toISOString(),
              isChecked: false,
            },
            ...updated,
          ];
        }
      });
      return updated;
    });

    setPlanningList((prev) => prev.filter((item) => !item.isChecked));
    showToast('Itens selecionados foram importados para o carrinho principal!', 'success');
    setActiveTab('cart');
  };

  return (
    <div className="min-h-screen bg-[#faf9fe] dark:bg-[#121212] text-[#1a1b1f] dark:text-zinc-100 font-sans selection:bg-[#34c759] selection:text-white antialiased">
      <Header
        totalCartAmount={totalCartAmount}
        budgetLimit={budgetLimit}
        itemCount={totalCartItemsCount}
        onOpenBudgetModal={() => setActiveTab('profile')}
        onOpenMenu={() => setActiveTab('profile')}
        onOpenNewListModal={() => setIsNewListModalOpen(true)}
      />

      <main className="min-h-[85vh]">
        {activeTab === 'cart' && (
          <CartView
            items={cart}
            budgetLimit={budgetLimit}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onOpenScanner={() => {
              initAudioContext();
              setIsScannerOpen(true);
            }}
            onOpenManualAdd={() => setIsQuickAddOpen(true)}
            onFinishShopping={handleFinishShopping}
            onCompareItem={handleCompareItem}
            onEditItem={(item) => {
              setItemToEdit(item);
              setIsEditModalOpen(true);
            }}
            onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)}
            listName={listName}
            selectedStore={selectedStore}
            storeAddress={storeAddress}
            listProtocol={listProtocol}
          />
        )}

        {activeTab === 'planning' && (
          <AnalyticalListView
            planningList={planningList}
            budgetLimit={budgetLimit}
            onAddPlanningItem={handleAddPlanningItem}
            onRemovePlanningItem={handleRemovePlanningItem}
            onUpdatePlanningItem={handleUpdatePlanningItem}
            onClearPlanningList={handleClearPlanningList}
            onCopyPlanningListToCart={handleCopyPlanningListToCart}
            onTogglePlanningItemCheck={handleTogglePlanningItemCheck}
            onMovePlanningItem={handleMovePlanningItem}
            onSwitchToCartTab={() => setActiveTab('cart')}
            showAlert={showAlert}
            showConfirm={showConfirm}
          />
        )}

        {activeTab === 'comparator' && (
          <UnitComparatorView
            initialItemToCompare={itemToCompare}
            onSelectOptionForCart={(item) => {
              handleAddToCart(item);
              setItemToCompare(null);
              setActiveTab('cart');
            }}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            sessions={history}
            onStartNewShopping={() => setActiveTab('cart')}
          />
        )}

        {activeTab === 'profile' && (
          <BudgetProfileView
            budgetLimit={budgetLimit}
            onUpdateBudget={(newLimit) => setBudgetLimit(newLimit)}
            selectedStore={selectedStore}
            onUpdateStore={(store) => setSelectedStore(store)}
            onResetData={handleResetData}
          />
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddToCart={handleAddToCart}
        onBulkAdd={handleBulkAddToCart}
        onOpenCompareWithOptions={(item) => {
          handleCompareItem(item);
          setIsScannerOpen(false);
        }}
      />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onAddItem={handleAddToCart}
      />

      <CartSpreadsheetModal
        isOpen={isSpreadsheetOpen}
        onClose={() => setIsSpreadsheetOpen(false)}
        items={cart}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onUpdateItemFields={handleUpdateCartItem}
        onEditItem={(item) => {
          setItemToEdit(item);
          setIsEditModalOpen(true);
        }}
      />

      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemToEdit(null);
        }}
        item={itemToEdit}
        onSave={handleUpdateCartItem}
        showAlert={showAlert}
      />

      <NewListModal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        history={history}
        onConfirm={handleStartNewList}
        showAlert={showAlert}
      />

      {/* Custom Dialogs / Toast System */}
      <CustomToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <CustomConfirmModal
        isOpen={confirmConfig !== null}
        title={confirmConfig?.title || ''}
        message={confirmConfig?.message || ''}
        onConfirm={confirmConfig?.onConfirm || (() => {})}
        onCancel={() => setConfirmConfig(null)}
      />

      <CustomAlertModal
        isOpen={alertConfig !== null}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        onClose={() => setAlertConfig(null)}
      />
    </div>
  );
}
