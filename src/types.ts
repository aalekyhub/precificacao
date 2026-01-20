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
}

export interface ProductMaterial {
  id: string;
  product_id: string;
  material_id: string; // ID of the Material
  quantity: number; // Qty used
  material?: Material; // Joined data
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  selling_price: number;
  profit_margin: number;
  labor_time: number; // in minutes
  materials?: ProductMaterial[];
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
  customer_name?: string; // For display
  status: 'draft' | 'approved' | 'completed';
  total_value: number;
  items: OrderItem[];
  created_at: string;
}

// Re-export aliases for compatibility if needed during migration
export type Quote = Order;
export type Insumo = Material;
export type Produto = Product;
