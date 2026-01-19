
export enum Unit {
  CM = 'CM',
  G = 'G',
  KG = 'KG',
  LT = 'LT',
  M2 = 'M2',
  ML = 'ML',
  MT = 'MT',
  PCT = 'PCT',
  UN = 'UN'
}

export type MaterialCategory = 'Papelaria' | 'Tecidos' | 'Aviamentos' | 'Embalagens' | 'Outros';

export interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  cost: number;
  quantity: number;
  unit: Unit;
  observations?: string;
  stock: number;
  minStock: number;
}

export type FixedCostPeriodicity = 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';

export interface FixedCost {
  id: string;
  name: string;
  value: number;
  periodicity: FixedCostPeriodicity;
  observations?: string;
}

export interface StoreConfig {
  laborRateDefault: number;
  monthlyWorkingHours: number;
  inkKitCost: number;
  inkYieldPages: number;
  defaultMarkup: number;
}

export interface ProductMaterial {
  materialId: string;
  quantityUsed: number;
}

export interface Product {
  id: string;
  name: string;
  materials: ProductMaterial[];
  printedPages: number;
  laborHours: number;
  laborRate: number;
  markup: number; 
  fixedCosts: number;
}

// Novos Tipos
export type ContactType = 'Cliente' | 'Fornecedor';

export interface Contact {
  id: string;
  name: string;
  type: ContactType;
  phone: string;
  email: string;
  address?: string;
  observations?: string;
}

export type QuoteStatus = 'Pendente' | 'Enviado' | 'Aprovado' | 'Cancelado';

export interface QuoteItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Quote {
  id: string;
  clientId: string;
  date: string;
  items: QuoteItem[];
  extraCosts: number;
  discount: number;
  total: number;
  status: QuoteStatus;
  notes?: string;
}

export interface CalculationResult {
  materialCost: number;
  laborCost: number;
  printingCost: number;
  fixedCostShare: number;
  totalCost: number;
  suggestedPrice: number;
  profit: number;
}
