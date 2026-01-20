export const api = {
    baseUrl: '/api',

    async get<T>(path: string): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`);
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
    },

    async post<T>(path: string, body: any): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async put<T>(path: string, body: any): Promise<T> {
        const res = await fetch(`${this.baseUrl}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async delete(path: string): Promise<void> {
        const res = await fetch(`${this.baseUrl}${path}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(res.statusText);
    }
};

export interface Insumo {
    id: string;
    name: string;
    unit: string;
    unitCost: number; // Decimal string from backend usually, logic converts
    lossPct: number;
    yieldNotes?: string;
    supplier?: string;
}

export interface Produto {
    id: string;
    name: string;
    category: string;
    unit: string;
    description?: string;
    bomItems?: BOMItem[];
    steps?: ProcessoEtapa[];
}

export interface BOMItem {
    id?: string;
    insumoId: string;
    qtyPerUnit: number;
    appliesTo: 'PRODUCT' | 'PACKAGING';
    insumo?: Insumo;
}

export interface ProcessoEtapa {
    id?: string;
    name: string;
    setupMinutes: number;
    unitMinutes: number;
}

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
