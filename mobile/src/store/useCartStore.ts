import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, ShoppingSession } from '../types';
import { INITIAL_CART, INITIAL_HISTORY } from '../data/mockDatabase';

interface CartState {
  cart: CartItem[];
  history: ShoppingSession[];
  budgetLimit: number;
  selectedStore: string;
  listName: string;
  listId: string;
  listCreatedAt: string;
  planningList: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  updateCartItem: (id: string, updatedFields: Partial<CartItem>) => void;
  setBudgetLimit: (limit: number) => void;
  setSelectedStore: (store: string) => void;
  setListName: (name: string) => void;
  finishShopping: () => { totalAmount: number; itemCount: number } | null;
  resetData: () => void;
  loadItemsFromHistory: (historyItems: CartItem[], newListName?: string) => void;
  
  // Planning actions
  addPlanningItem: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removePlanningItem: (id: string) => void;
  updatePlanningItem: (id: string, field: keyof CartItem, value: any) => void;
  clearPlanningList: () => void;
  copyPlanningListToCart: () => void;
  togglePlanningItemCheck: (id: string) => void;
  movePlanningItem: (id: string, direction: 'up' | 'down') => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: INITIAL_CART,
      history: INITIAL_HISTORY,
      budgetLimit: 200.00,
      selectedStore: 'Carrefour - Morumbi',
      listName: 'Meu Carrinho',
      listId: `list-${Date.now()}`,
      listCreatedAt: new Date().toISOString(),
      planningList: [],

      addItem: (newItem) => set((state) => {
        const existingIdx = state.cart.findIndex(
          (item) =>
            item.name.toLowerCase() === newItem.name.toLowerCase() ||
            (newItem.barcode && item.barcode === newItem.barcode)
        );

        if (existingIdx >= 0) {
          const updated = [...state.cart];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + (newItem.quantity || 1),
            price: newItem.price, // Atualiza para o preço mais recente
          };
          return { cart: updated };
        }

        const createdItem: CartItem = {
          ...newItem,
          id: `item-${Date.now()}`,
          addedAt: new Date().toISOString(),
        } as CartItem;

        return {
          cart: [createdItem, ...state.cart],
        };
      }),

      removeItem: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id),
      })),

      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart
          .map((item) => {
            if (item.id === id) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[],
      })),

      updateCartItem: (id, updatedFields) => set((state) => {
        const originalItem = state.cart.find((c) => c.id === id);
        if (!originalItem) return {};

        const nextCart = state.cart.map((item) => {
          if (item.id === id) {
            return { ...item, ...updatedFields };
          }
          return item;
        });

        const nextPlanningList = state.planningList.map((planItem) => {
          if (planItem.name.toLowerCase() === originalItem.name.toLowerCase()) {
            return {
              ...planItem,
              ...updatedFields,
            };
          }
          return planItem;
        });

        return {
          cart: nextCart,
          planningList: nextPlanningList,
        };
      }),

      setBudgetLimit: (limit) => set({ budgetLimit: limit }),

      setSelectedStore: (store) => set({ selectedStore: store }),

      setListName: (name) => set({ listName: name }),

      finishShopping: () => {
        const state = get();
        if (state.cart.length === 0) return null;

        const totalAmount = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalCartItemsCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const estimatedSavings = state.cart.reduce((sum, item) => sum + item.price * 0.12 * item.quantity, 0);

        const newSession: ShoppingSession = {
          id: `session-${Date.now()}`,
          date: new Date().toLocaleDateString('pt-BR'),
          storeName: state.selectedStore,
          listName: state.listName || 'Meu Carrinho',
          listId: state.listId,
          listCreatedAt: state.listCreatedAt,
          itemsCount: totalCartItemsCount,
          totalAmount: totalAmount,
          budgetLimit: state.budgetLimit,
          totalSavings: parseFloat(estimatedSavings.toFixed(2)),
          items: [...state.cart],
        };

        set({
          history: [newSession, ...state.history],
          cart: [],
          listName: 'Meu Carrinho',
          listId: `list-${Date.now()}`,
          listCreatedAt: new Date().toISOString(),
        });

        return { totalAmount, itemCount: totalCartItemsCount };
      },

      resetData: () => set({
        cart: INITIAL_CART,
        history: INITIAL_HISTORY,
        budgetLimit: 200.00,
        selectedStore: 'Carrefour - Morumbi',
        listName: 'Meu Carrinho',
        listId: `list-${Date.now()}`,
        listCreatedAt: new Date().toISOString(),
        planningList: [],
      }),

      loadItemsFromHistory: (historyItems, newListName) => set({
        cart: historyItems.map((item) => ({
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          addedAt: new Date().toISOString(),
        })),
        listName: newListName ? `Nova ${newListName}` : 'Novo Carrinho de Compra',
        listId: `list-${Date.now()}`,
        listCreatedAt: new Date().toISOString(),
      }),

      addPlanningItem: (newItem) => set((state) => {
        const existingIdx = state.planningList.findIndex(
          (item) => item.name.toLowerCase() === newItem.name.toLowerCase()
        );

        if (existingIdx >= 0) {
          const updated = [...state.planningList];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + (newItem.quantity || 1),
            price: newItem.price !== 0 ? newItem.price : updated[existingIdx].price,
          };
          return { planningList: updated };
        }

        const createdItem: CartItem = {
          ...newItem,
          id: `plan-${Date.now()}`,
          addedAt: new Date().toISOString(),
        } as CartItem;

        return {
          planningList: [...state.planningList, createdItem],
        };
      }),

      removePlanningItem: (id) => set((state) => ({
        planningList: state.planningList.filter((item) => item.id !== id),
      })),

      updatePlanningItem: (id, field, value) => set((state) => ({
        planningList: state.planningList.map((item) => {
          if (item.id === id) {
            return { ...item, [field]: value };
          }
          return item;
        }),
      })),

      clearPlanningList: () => set({ planningList: [] }),

      copyPlanningListToCart: () => set((state) => {
        const cartCopy = [...state.cart];
        state.planningList.forEach((planItem) => {
          const existingIdx = cartCopy.findIndex(
            (item) => item.name.toLowerCase() === planItem.name.toLowerCase()
          );

          if (existingIdx >= 0) {
            cartCopy[existingIdx] = {
              ...cartCopy[existingIdx],
              quantity: cartCopy[existingIdx].quantity + planItem.quantity,
              price: planItem.price !== 0 ? planItem.price : cartCopy[existingIdx].price,
            };
          } else {
            cartCopy.push({
              ...planItem,
              id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              addedAt: new Date().toISOString(),
            });
          }
        });
        return { cart: cartCopy };
      }),

      togglePlanningItemCheck: (id) => set((state) => {
        let targetItem: CartItem | undefined;
        const nextPlanningList = state.planningList.map((item) => {
          if (item.id === id) {
            targetItem = { ...item, isChecked: !item.isChecked };
            return targetItem;
          }
          return item;
        });

        if (!targetItem) return {};

        let nextCart = [...state.cart];
        if (targetItem.isChecked) {
          // Adiciona ou incrementa no carrinho principal
          const existingIdx = nextCart.findIndex(
            (c) => c.name.toLowerCase() === targetItem!.name.toLowerCase() || (targetItem!.barcode && c.barcode === targetItem!.barcode)
          );

          if (existingIdx >= 0) {
            nextCart[existingIdx] = {
              ...nextCart[existingIdx],
              price: targetItem.price !== 0 ? targetItem.price : nextCart[existingIdx].price,
            };
          } else {
            nextCart.push({
              ...targetItem,
              id: `item-${Date.now()}`,
              addedAt: new Date().toISOString(),
            });
          }
        } else {
          // Remove do carrinho principal ao desmarcar
          nextCart = nextCart.filter(
            (c) => c.name.toLowerCase() !== targetItem!.name.toLowerCase() && (!targetItem!.barcode || c.barcode !== targetItem!.barcode)
          );
        }

        return {
          planningList: nextPlanningList,
          cart: nextCart,
        };
      }),

      movePlanningItem: (id, direction) => set((state) => {
        const list = [...state.planningList];
        const index = list.findIndex((item) => item.id === id);
        if (index === -1) return {};

        const item = list[index];
        const sameCatIndices = list
          .map((x, i) => (x.category === item.category ? i : -1))
          .filter((i) => i !== -1);

        const catPosition = sameCatIndices.indexOf(index);
        if (direction === 'up' && catPosition > 0) {
          const targetIndex = sameCatIndices[catPosition - 1];
          list[index] = list[targetIndex];
          list[targetIndex] = item;
        } else if (direction === 'down' && catPosition < sameCatIndices.length - 1) {
          const targetIndex = sameCatIndices[catPosition + 1];
          list[index] = list[targetIndex];
          list[targetIndex] = item;
        }
        return { planningList: list };
      }),
    }),
    {
      name: 'custocerto-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
