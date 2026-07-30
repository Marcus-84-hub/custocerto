import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartItem, ShoppingSession } from '../types';

export interface PreseedProduct {
  barcode: string;
  name: string;
  brand: string;
  price: number;
  unitAmount: number;
  unitType: 'kg' | 'g' | 'L' | 'mL' | 'un' | 'rolo' | 'caixa' | 'pacote';
  category: 'Alimentos' | 'Limpeza' | 'Higiene' | 'Bebidas' | 'Hortifruti' | 'Outros';
  imageUrl: string;
  previousPrice?: number;
}

export const POPULAR_BARCODES: PreseedProduct[] = [
  {
    barcode: '7891000100101',
    name: 'Detergente Ypê Clean 500ml',
    brand: 'Ypê',
    price: 2.15,
    unitAmount: 500,
    unitType: 'mL',
    category: 'Limpeza',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRnpdYhZN7OlrYqstbZqfwwBXG7X_qpolOY9yvKZU3_mnpZre3YFzy2l7KnRbD8nyAk727ebVKIVmu9CKrRWajQvsMm-j0us0OfXl76t6gkAKEFSaHl4COL1j2uXGo46vxVVK7l1Sl-GWsjnyQWjScywsgMCCnpD9c3CKjak3jg5csFzsfvI1Advjf8ma0b2vGr-whzLr5BMQuwHvYnmNevOkfYyILUGFAdAaO-lYNWwpONWFBrlPBqg',
    previousPrice: 1.99,
  },
  {
    barcode: '7896006700012',
    name: 'Arroz Tio João Tipo 1',
    brand: 'Tio João',
    price: 28.00,
    unitAmount: 5,
    unitType: 'kg',
    category: 'Alimentos',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShCRPz2t4tjQBrFfCum_QS23DUQZhYEvkJKsZ-iI5fKekd31dQUvUyv6GZ2nVPKtmSjIR-RDrXKeSB8AKX2nxeRYD78zJLF_ToxrIaj4A1uyfsIGwEn67i0rn6-FLymtWY-SGsBvu06Vl4K4aDa7QWij4jnzYd-VIiNs01kEKO-y44GAUO2heW_-4Stc3qDYgCQTLUZ71TDjJPwg8pZcF2akG4Qq5F77an5vjg1eOCU8tM5vndAUP8Q',
    previousPrice: 25.50,
  },
  {
    barcode: '7898012345678',
    name: 'Café Orfeu Gourmet 250g',
    brand: 'Orfeu',
    price: 24.90,
    unitAmount: 250,
    unitType: 'g',
    category: 'Alimentos',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMgJaRvUn5-6TqK85-OGtpcbBfrOTP-aj1WpJS-qQFQaYGjCrwEiR6LRtWkFrG1weXHIvNVdkFz8C724t00rnjO333XGUXosvFwlbpfD9ppkUiPA8wPNGYAvbhJq7iKQkXOb4R58cW-usxgWVhjylSO5ygA_8ZtFwb85zqzT53kekuLTC-ILDbxMSXB1KSD0sl8ynrah9obyCF5EKHQ4oIeN9PWmZficAugzidMU1fKggujvgWeF7Jng',
    previousPrice: 21.90,
  },
  {
    barcode: '7891000200202',
    name: 'Leite Integral Ninho 1L',
    brand: 'Nestlé',
    price: 5.50,
    unitAmount: 1,
    unitType: 'L',
    category: 'Bebidas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSyvLz2GaBKOQKph9Q9rx8zgH6YftsE-0Y7sv718j4xPp5jUuHyJfJL70AbCaZCRfeM7lXMQxIUoc9bSUZwRxd85tjsyquYBYkp7kApuJdFp_duyW5c9Zn0ofMvcfO7LNoYyUjvE8kaR-eVhN99UHeb4Uvs66MHsmGwB3r6UYQbhQ3AhOz7McZjCOSIKqZWAZExhZtaVJ5ddFhFBFb0r9V6K1vmJe4HOnbslAlgwedFrbfjPpsjn5NJA',
    previousPrice: 5.20,
  },
  {
    barcode: '7891000300303',
    name: 'Sabão em Pó Omo Sanitizante 1kg',
    brand: 'Omo',
    price: 18.90,
    unitAmount: 1,
    unitType: 'kg',
    category: 'Limpeza',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBo8kS2AdfvWJxoxozhK0-DIFJoucmjBuA1bc_sClCdcJ9Kr3y4GgDwie9OnzKWM_mD7jcGHKxICAs5NkqJE01JjvPDkXsqA1UvWxkLA508KPtWXMNGmd8wsUye_ll7ieKs2v3IKY-193nZwuvJpIO1tRZ-UhWksEvK3htIbxiSg94gs9OhE4KEWY3JaPQjYBf-5IajlAIOJWKRKxPWoFjUf55Affg1uXpCpexreBLDlEXNulgoYKa-bQ',
    previousPrice: 17.50,
  },
  {
    barcode: '7891000400404',
    name: 'Feijão Carioca Camil 1kg',
    brand: 'Camil',
    price: 7.80,
    unitAmount: 1,
    unitType: 'kg',
    category: 'Alimentos',
    imageUrl: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?w=300&auto=format&fit=crop&q=80',
    previousPrice: 8.50,
  },
  {
    barcode: '7891000500505',
    name: 'Papel Higiênico Neve 12 rolos',
    brand: 'Neve',
    price: 22.90,
    unitAmount: 12,
    unitType: 'rolo',
    category: 'Higiene',
    imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=300&auto=format&fit=crop&q=80',
    previousPrice: 19.90,
  }
];

export const INITIAL_CART: CartItem[] = [
  {
    id: 'item-1',
    barcode: '7896006700012',
    name: 'Arroz Tio João',
    brand: 'Tio João',
    price: 28.00,
    quantity: 1,
    unitAmount: 5,
    unitType: 'kg',
    category: 'Alimentos',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAShCRPz2t4tjQBrFfCum_QS23DUQZhYEvkJKsZ-iI5fKekd31dQUvUyv6GZ2nVPKtmSjIR-RDrXKeSB8AKX2nxeRYD78zJLF_ToxrIaj4A1uyfsIGwEn67i0rn6-FLymtWY-SGsBvu06Vl4K4aDa7QWij4jnzYd-VIiNs01kEKO-y44GAUO2heW_-4Stc3qDYgCQTLUZ71TDjJPwg8pZcF2akG4Qq5F77an5vjg1eOCU8tM5vndAUP8Q',
    previousPrice: 25.50,
    lastPurchasedDate: '15/06/2026',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'item-2',
    barcode: '7898012345678',
    name: 'Café Orfeu',
    brand: 'Orfeu',
    price: 24.90,
    quantity: 2,
    unitAmount: 250,
    unitType: 'g',
    category: 'Alimentos',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMgJaRvUn5-6TqK85-OGtpcbBfrOTP-aj1WpJS-qQFQaYGjCrwEiR6LRtWkFrG1weXHIvNVdkFz8C724t00rnjO333XGUXosvFwlbpfD9ppkUiPA8wPNGYAvbhJq7iKQkXOb4R58cW-usxgWVhjylSO5ygA_8ZtFwb85zqzT53kekuLTC-ILDbxMSXB1KSD0sl8ynrah9obyCF5EKHQ4oIeN9PWmZficAugzidMU1fKggujvgWeF7Jng',
    previousPrice: 21.90,
    lastPurchasedDate: '10/06/2026',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'item-3',
    barcode: '7891000200202',
    name: 'Leite Integral',
    brand: 'Ninho',
    price: 5.50,
    quantity: 4,
    unitAmount: 1,
    unitType: 'L',
    category: 'Bebidas',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSyvLz2GaBKOQKph9Q9rx8zgH6YftsE-0Y7sv718j4xPp5jUuHyJfJL70AbCaZCRfeM7lXMQxIUoc9bSUZwRxd85tjsyquYBYkp7kApuJdFp_duyW5c9Zn0ofMvcfO7LNoYyUjvE8kaR-eVhN99UHeb4Uvs66MHsmGwB3r6UYQbhQ3AhOz7McZjCOSIKqZWAZExhZtaVJ5ddFhFBFb0r9V6K1vmJe4HOnbslAlgwedFrbfjPpsjn5NJA',
    previousPrice: 5.20,
    lastPurchasedDate: '20/06/2026',
    addedAt: new Date().toISOString(),
  },
  {
    id: 'item-4',
    barcode: '7891000100101',
    name: 'Detergente Ypê',
    brand: 'Ypê',
    price: 2.15,
    quantity: 3,
    unitAmount: 500,
    unitType: 'mL',
    category: 'Limpeza',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRnpdYhZN7OlrYqstbZqfwwBXG7X_qpolOY9yvKZU3_mnpZre3YFzy2l7KnRbD8nyAk727ebVKIVmu9CKrRWajQvsMm-j0us0OfXl76t6gkAKEFSaHl4COL1j2uXGo46vxVVK7l1Sl-GWsjnyQWjScywsgMCCnpD9c3CKjak3jg5csFzsfvI1Advjf8ma0b2vGr-whzLr5BMQuwHvYnmNevOkfYyILUGFAdAaO-lYNWwpONWFBrlPBqg',
    previousPrice: 1.99,
    lastPurchasedDate: '12/06/2026',
    addedAt: new Date().toISOString(),
  }
];

export const INITIAL_HISTORY: ShoppingSession[] = [
  {
    id: 'session-1',
    date: '18/07/2026',
    storeName: 'Carrefour - Morumbi',
    itemsCount: 14,
    totalAmount: 210.40,
    budgetLimit: 250.00,
    totalSavings: 28.50,
    items: [],
  },
  {
    id: 'session-2',
    date: '02/07/2026',
    storeName: 'Pão de Açúcar - Jardins',
    itemsCount: 9,
    totalAmount: 165.90,
    budgetLimit: 180.00,
    totalSavings: 19.20,
    items: [],
  },
  {
    id: 'session-3',
    date: '18/06/2026',
    storeName: 'Atacadão - Santo Amaro',
    itemsCount: 22,
    totalAmount: 340.00,
    budgetLimit: 350.00,
    totalSavings: 54.00,
    items: [],
  }
];

const CART_KEY = '@custocerto:cart';
const HISTORY_KEY = '@custocerto:history';
const BUDGET_KEY = '@custocerto:budget';
const STORE_KEY = '@custocerto:store_name';

export async function getStoredCart(): Promise<CartItem[]> {
  try {
    const raw = await AsyncStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : INITIAL_CART;
  } catch {
    return INITIAL_CART;
  }
}

export async function saveStoredCart(cart: CartItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Failed to save cart:', e);
  }
}

export async function getStoredHistory(): Promise<ShoppingSession[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : INITIAL_HISTORY;
  } catch {
    return INITIAL_HISTORY;
  }
}

export async function saveStoredHistory(history: ShoppingSession[]): Promise<void> {
  try {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history:', e);
  }
}

export async function getStoredBudget(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(BUDGET_KEY);
    return raw ? parseFloat(raw) : 200.00;
  } catch {
    return 200.00;
  }
}

export async function saveStoredBudget(limit: number): Promise<void> {
  try {
    await AsyncStorage.setItem(BUDGET_KEY, limit.toString());
  } catch (e) {
    console.error('Failed to save budget:', e);
  }
}

export async function getStoredStoreName(): Promise<string> {
  try {
    const raw = await AsyncStorage.getItem(STORE_KEY);
    return raw ? raw : 'Carrefour - Morumbi';
  } catch {
    return 'Carrefour - Morumbi';
  }
}

export async function saveStoredStoreName(storeName: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORE_KEY, storeName);
  } catch (e) {
    console.error('Failed to save store name:', e);
  }
}
