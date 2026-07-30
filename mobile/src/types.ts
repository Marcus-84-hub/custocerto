export type UnitType = 'kg' | 'g' | 'L' | 'mL' | 'un' | 'rolo' | 'caixa' | 'pacote';

export type ItemCategory = 'Alimentos' | 'Limpeza' | 'Higiene' | 'Bebidas' | 'Hortifruti' | 'Outros';

export interface CartItem {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  unitAmount: number; // e.g. 1 for 1kg, 500 for 500g
  unitType: UnitType;
  category: ItemCategory;
  imageUrl?: string;
  previousPrice?: number; // Last paid price for inflation comparison
  lastPurchasedDate?: string;
  addedAt: string;
  isChecked?: boolean;
}

export interface ComparisonItem {
  id: string;
  name: string;
  brand?: string;
  totalPrice: number;
  packageSize: number;
  unitType: UnitType;
  calculatedUnitPrice: number; // Price per base unit (e.g. per 1kg or 1L)
  normalizedUnitLabel: string; // "R$ 16,25 / kg"
  savingsPercent?: number; // e.g. 14%
  isBestChoice?: boolean;
}

export interface ShoppingSession {
  id: string;
  date: string;
  storeName: string;
  listName?: string;
  listId?: string;
  listCreatedAt?: string;
  itemsCount: number;
  totalAmount: number;
  budgetLimit: number;
  totalSavings: number;
  items: CartItem[];
}

export type ViewTab = 'cart' | 'comparator' | 'history' | 'profile' | 'planning';
