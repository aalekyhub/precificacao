// Database Types

export interface Settings {
  id?: string;
  pro_labore: number;
  work_days_per_month: number;
  work_hours_per_day: number;
}

export interface FixedCost {
  id: string;
  name: string;
  value: number;
}

export interface Material {
  id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  min_stock: number;
  purchase_price?: number;
  pack_quantity?: number;
  observations?: string;
}

// Product Composition Types
export interface ProcessoEtapa {
  id?: string;
  name: string;
  setupMinutes: number;
  unitMinutes: number;
}

export interface BOMItem {
  id?: string;
  insumoId: string;
  qtyPerUnit: number;
  appliesTo: 'PRODUCT' | 'PACKAGING';
  insumo?: Material;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  description?: string;
  bomItems?: BOMItem[];
  steps?: ProcessoEtapa[];
  selling_price?: number; // Optional until calculation logic is implemented
  profit_margin?: number;
}

export type ContactType = 'Cliente' | 'Fornecedor';

export interface Contact {
  id: string; // 4-digit custom ID
  name: string;
  type: ContactType;
  phone: string;
  email: string;
  address?: string;
  observations?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  product_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  customer_id?: string;
  clientId?: string; // Alias for compatibility during refactor
  customer_name?: string; // For display
  status: 'draft' | 'approved' | 'completed' | 'canceled';
  total_value: number;
  items: OrderItem[];
  created_at: string;
  date?: string; // Alias
  extra_costs?: number;
  discount?: number;
  notes?: string;
}

// Re-export aliases for compatibility if needed during migration
export type Quote = Order;
export type QuoteStatus = Order['status'];
export type Insumo = Material;
export type Produto = Product;
