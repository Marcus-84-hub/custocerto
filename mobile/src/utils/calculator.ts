import { ComparisonItem, UnitType } from '../types';

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseBRLInput(input: string): number {
  if (!input) return 0;
  const clean = input.replace(/[^\d,. ]/g, '').trim();
  if (clean.includes(',')) {
    // Formato brasileiro 1.234,56
    const normalized = clean.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  }
  return parseFloat(clean) || 0;
}

export function getBaseUnitLabel(unitType: UnitType): string {
  switch (unitType) {
    case 'g':
    case 'kg':
      return 'kg';
    case 'mL':
    case 'L':
      return 'L';
    case 'rolo':
      return 'rolo';
    case 'caixa':
      return 'cx';
    case 'pacote':
      return 'pct';
    case 'un':
    default:
      return 'un';
  }
}

/**
 * Normaliza o tamanho da embalagem na unidade base correspondente (kg, L, un, rolo, etc.)
 */
export function getNormalizedQuantity(packageSize: number, unitType: UnitType): number {
  if (packageSize <= 0) return 1;
  if (unitType === 'g' || unitType === 'mL') {
    return packageSize / 1000;
  }
  return packageSize;
}

/**
 * Calcula o preço unitário por unidade base (ex: por 1kg, por 1L, por 1 un)
 */
export function calculateUnitPrice(totalPrice: number, packageSize: number, unitType: UnitType): number {
  const normQty = getNormalizedQuantity(packageSize, unitType);
  if (normQty <= 0) return totalPrice;
  return totalPrice / normQty;
}

export interface ComparisonResult {
  items: ComparisonItem[];
  bestOption: ComparisonItem | null;
  worstOption: ComparisonItem | null;
  unitSavings: number; // Economia absoluta por unidade base
  percentageSavings: number; // Porcentagem de economia da melhor vs pior opção
  baseUnitLabel: string;
}

export function evaluateComparison(
  rawOptions: { id: string; name: string; brand?: string; totalPrice: number; packageSize: number; unitType: UnitType }[]
): ComparisonResult {
  if (rawOptions.length === 0) {
    return {
      items: [],
      bestOption: null,
      worstOption: null,
      unitSavings: 0,
      percentageSavings: 0,
      baseUnitLabel: 'un',
    };
  }

  const baseUnitLabel = getBaseUnitLabel(rawOptions[0].unitType);

  // Calcula o preço unitário para cada item
  const calculatedItems: ComparisonItem[] = rawOptions.map((opt) => {
    const unitPrice = calculateUnitPrice(opt.totalPrice, opt.packageSize, opt.unitType);
    return {
      id: opt.id,
      name: opt.name,
      brand: opt.brand,
      totalPrice: opt.totalPrice,
      packageSize: opt.packageSize,
      unitType: opt.unitType,
      calculatedUnitPrice: unitPrice,
      normalizedUnitLabel: `${formatBRL(unitPrice)} / ${baseUnitLabel}`,
    };
  });

  // Ordena pelo preço calculado de forma crescente
  const sorted = [...calculatedItems].sort((a, b) => a.calculatedUnitPrice - b.calculatedUnitPrice);
  const cheapest = sorted[0];
  const expensive = sorted[sorted.length - 1];

  const unitSavings = expensive.calculatedUnitPrice - cheapest.calculatedUnitPrice;
  const percentageSavings =
    expensive.calculatedUnitPrice > 0
      ? Math.round(((expensive.calculatedUnitPrice - cheapest.calculatedUnitPrice) / expensive.calculatedUnitPrice) * 100)
      : 0;

  const finalItems = calculatedItems.map((item) => {
    const isBest = item.id === cheapest.id && sorted.length > 1;
    let itemSavings = 0;
    if (expensive.calculatedUnitPrice > 0 && item.calculatedUnitPrice < expensive.calculatedUnitPrice) {
      itemSavings = Math.round(
        ((expensive.calculatedUnitPrice - item.calculatedUnitPrice) / expensive.calculatedUnitPrice) * 100
      );
    }
    return {
      ...item,
      isBestChoice: isBest,
      savingsPercent: itemSavings,
    };
  });

  return {
    items: finalItems,
    bestOption: cheapest,
    worstOption: expensive,
    unitSavings,
    percentageSavings,
    baseUnitLabel,
  };
}

/**
 * Calcula a porcentagem de inflação entre o preço atual e o anterior
 */
export function calculateInflation(currentPrice: number, previousPrice?: number): { percent: number; isHigher: boolean } {
  if (!previousPrice || previousPrice <= 0) return { percent: 0, isHigher: false };
  const diff = currentPrice - previousPrice;
  const percent = Math.round((diff / previousPrice) * 100);
  return {
    percent: Math.abs(percent),
    isHigher: diff > 0,
  };
}

export interface ProductItem {
  ean: string;
  name: string;
  price: number;
  totalQuantity: number;
  unitOfMeasure: 'g' | 'kg' | 'ml' | 'l' | 'm' | 'unit';
}

export class EconomicsEngine {
  private static normalize(quantity: number, unit: string) {
    if (unit === 'g') return { qty: quantity / 1000, base: 'kg' };
    if (unit === 'ml') return { qty: quantity / 1000, base: 'l' };
    return { qty: quantity, base: unit };
  }

  public static calculateUnitPrice(price: number, quantity: number, unit: string) {
    const { qty, base } = this.normalize(quantity, unit);
    if (qty <= 0) throw new Error("Quantidade inválida");
    return { pricePerUnit: Number((price / qty).toFixed(2)), formattedUnit: `R$ / ${base}` };
  }

  public static comparePackages(itemA: ProductItem, itemB: ProductItem) {
    const calcA = this.calculateUnitPrice(itemA.price, itemA.totalQuantity, itemA.unitOfMeasure);
    const calcB = this.calculateUnitPrice(itemB.price, itemB.totalQuantity, itemB.unitOfMeasure);

    const isAWinner = calcA.pricePerUnit < calcB.pricePerUnit;
    const winner = isAWinner ? itemA : itemB;
    const loser = isAWinner ? itemB : itemA;
    
    const saving = Number((((Math.max(calcA.pricePerUnit, calcB.pricePerUnit) - Math.min(calcA.pricePerUnit, calcB.pricePerUnit)) / Math.max(calcA.pricePerUnit, calcB.pricePerUnit)) * 100).toFixed(1));

    return {
      recommendedEan: winner.ean,
      savingsPercentage: saving,
      message: `A opção "${winner.name}" está ${saving}% mais barata por unidade comparada à outra.`
    };
  }
}

