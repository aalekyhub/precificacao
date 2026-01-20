import { supabase } from '../lib/supabase';

// Helper to map generic paths to Supabase tables
const getTable = (path: string) => {
    if (path.includes('insumos')) return 'Material'; // Legacy support
    if (path.includes('materials')) return 'Material';
    if (path.includes('produtos')) return 'Produto'; // Legacy
    if (path.includes('products')) return 'Produto';
    if (path.includes('canais')) return 'Canal';
    if (path.includes('fixos')) return 'FixedCost';
    if (path.includes('fixed-costs')) return 'FixedCost';
    if (path.includes('contacts')) return 'Contact';
    if (path.includes('settings')) return 'Settings';
    if (path.includes('orders')) return 'Order';
    if (path.includes('quotes')) return 'Order';
    return '';
};

// Simple UUID generator
const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const api = {
    async get<T>(path: string): Promise<T> {
        const table = getTable(path);
        if (!table) throw new Error(`Unknown table for path: ${path}`);

        let query = supabase.from(table).select('*');

        // Specific includes for Products
        // Specific includes for Products
        if (table === 'Produto') {
            query = supabase.from(table).select('*, bomItems:BOMItem(*, insumo:Insumo(*)), steps:ProcessoEtapa(*)');
        }
        if (table === 'Order') {
            query = supabase.from(table).select('*, items:OrderItem(*)');
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as T;
    },

    async post<T>(path: string, body: any): Promise<T> {
        if (path.includes('/precificacao/calcular')) {
            throw new Error("Pricing calculation is now client-side.");
        }

        const table = getTable(path);

        // Ensure ID is present
        // For Contacts, we expect the ID to be passed from the frontend (4 digits).
        // For others, we generate a UUID if missing.
        let id = body.id;
        if (!id && table !== 'Contact') {
            id = uuidv4();
        }

        const bodyWithId = { ...body, id };

        // Handle deep writes for Product manually since Supabase doesn't do deep inserts like Prisma
        // Handle deep writes for Product manually since Supabase doesn't do deep inserts like Prisma
        if (table === 'Produto') {
            const { bomItems, steps, ...productData } = bodyWithId;

            // 1. Create Product
            const { data: prod, error: prodErr } = await supabase.from('Produto').insert(productData).select().single();
            if (prodErr) throw prodErr;

            // 2. Insert Relations
            if (bomItems && bomItems.length) {
                const items = bomItems.map((b: any) => ({ ...b, id: uuidv4(), produtoId: prod.id }));
                const { error: bomErr } = await supabase.from('BOMItem').insert(items);
                if (bomErr) throw bomErr;
            }
            if (steps && steps.length) {
                const s = steps.map((st: any) => ({ ...st, id: uuidv4(), produtoId: prod.id }));
                const { error: stepErr } = await supabase.from('ProcessoEtapa').insert(s);
                if (stepErr) throw stepErr;
            }
            return prod as T;
        }

        const { data, error } = await supabase.from(table).insert(bodyWithId).select().single();
        if (error) throw error;
        return data as T;
    },

    async put<T>(path: string, body: any): Promise<T> {
        const table = getTable(path);
        const id = path.split('/').pop();

        if (table === 'Produto') {
            const { bomItems, steps, ...productData } = body;

            // 1. Update Product
            const { data: prod, error: prodErr } = await supabase.from('Produto').update(productData).eq('id', id).select().single();
            if (prodErr) throw prodErr;

            // 2. Replace Relations (Delete all then insert)
            if (bomItems) {
                await supabase.from('BOMItem').delete().eq('produtoId', id);
                if (bomItems.length > 0) {
                    const items = bomItems.map((b: any) => ({ ...b, id: uuidv4(), produtoId: id }));
                    await supabase.from('BOMItem').insert(items);
                }
            }
            if (steps) {
                await supabase.from('ProcessoEtapa').delete().eq('produtoId', id);
                if (steps.length > 0) {
                    const s = steps.map((st: any) => ({ ...st, id: uuidv4(), produtoId: id }));
                    await supabase.from('ProcessoEtapa').insert(s);
                }
            }
            return prod as T;
        }

        const { data, error } = await supabase.from(table).update(body).eq('id', id).select().single();
        if (error) throw error;
        return data as T;
    },

    async delete(path: string): Promise<void> {
        const table = getTable(path);
        const id = path.split('/').pop();
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
    }
};

import { Product, Material, BOMItem, ProcessoEtapa, FixedCost, Contact, Settings } from '../types';

export type Insumo = Material;
export type Produto = Product;
export type { BOMItem, ProcessoEtapa, FixedCost, Contact, Settings };

export interface Canal {
    id: string;
    name: string;
    percentFeesTotal: number;
    fixedFeePerOrder: number;
    taxIncluded: boolean;
    adsIncluded: boolean;
}

export interface FixosMensais {
    id: string;
    month: string;
    totalFixedCosts: number;
    productiveHours: number;
}
