
import { useState, useEffect } from 'react';
import { Product, Material, Unit, FixedCost, StoreConfig, Contact, Quote } from '../types';
import { api } from '../api/client';

const INITIAL_MATERIALS: Material[] = [
    { id: '1', name: 'Papel Offset 180g', category: 'Papelaria', cost: 55.20, quantity: 200, unit: Unit.UN, stock: 1000, minStock: 200 },
    { id: '2', name: 'Papel Fotográfico 135g', category: 'Papelaria', cost: 45.00, quantity: 50, unit: Unit.UN, stock: 150, minStock: 20 },
    { id: '3', name: 'Cola Pano 60g', category: 'Aviamentos', cost: 12.50, quantity: 1, unit: Unit.UN, stock: 5, minStock: 2 },
];

const INITIAL_FIXED_COSTS: FixedCost[] = [
    { id: 'fc1', name: 'Aluguel do Ateliê', value: 800, periodicity: 'Mensal' },
    { id: 'fc2', name: 'Energia Elétrica', value: 150, periodicity: 'Mensal' },
    { id: 'fc3', name: 'Internet / Software', value: 120, periodicity: 'Mensal' },
];

const INITIAL_CONTACTS: Contact[] = [
    { id: 'c1', name: 'Ana Silva (Cliente)', type: 'Cliente', phone: '11999999999', email: 'ana@email.com', address: 'Rua das Flores, 123' },
    { id: 'c2', name: 'Papelaria Central (Fornecedor)', type: 'Fornecedor', phone: '1144445555', email: 'contato@papelariacentral.com' },
];

const DEFAULT_CONFIG: StoreConfig = {
    laborRateDefault: 35,
    monthlyWorkingHours: 160,
    inkKitCost: 250,
    inkYieldPages: 4500,
    defaultMarkup: 50
};

export const useStoreData = () => {
    const [materials, setMaterials] = useState<Material[]>(() => {
        const saved = localStorage.getItem('precifica_materials');
        return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
    });

    const [products, setProducts] = useState<Product[]>(() => {
        const saved = localStorage.getItem('precifica_products');
        return saved ? JSON.parse(saved) : [];
    });

    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(() => {
        const saved = localStorage.getItem('precifica_fixed_costs');
        return saved ? JSON.parse(saved) : INITIAL_FIXED_COSTS;
    });

    // Contacts now managed by Supabase state
    const [contacts, setContacts] = useState<Contact[]>([]);

    const [quotes, setQuotes] = useState<Quote[]>(() => {
        const saved = localStorage.getItem('precifica_quotes');
        return saved ? JSON.parse(saved) : [];
    });

    const [storeConfig, setStoreConfig] = useState<Settings>({
        pro_labore: 0,
        work_days_per_month: 20,
        work_hours_per_day: 8
    });

    const reloadSettings = async () => {
        try {
            const data = await api.get<Settings[]>('/settings');
            if (data && data.length > 0) {
                setStoreConfig(data[0]);
            } else {
                // Initialize default settings if none exist
                const defaultSettings = { pro_labore: 2000, work_days_per_month: 20, work_hours_per_day: 8 };
                const newSettings = await api.post<Settings>('/settings', defaultSettings);
                setStoreConfig(newSettings);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
        }
    };

    const updateStoreConfig = async (newConfig: Settings) => {
        try {
            if (newConfig.id) {
                await api.put(`/settings/${newConfig.id}`, newConfig);
            } else {
                await api.post('/settings', newConfig);
            }
            reloadSettings();
        } catch (error) {
            console.error('Failed to update settings', error);
            alert('Erro ao salvar configurações');
        }
    };

    useEffect(() => {
        reloadSettings();
        reloadContacts();
    }, []);

    // ... (rest of the code for products/materials/etc remains the same, just removing config from local storage sync)


    const addProduct = (p: Product) => setProducts([...products, p]);
    const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

    const addMaterial = (m: Material) => setMaterials([...materials, m]);
    const updateMaterial = (updatedM: Material) => setMaterials(materials.map(m => m.id === updatedM.id ? updatedM : m));
    const deleteMaterial = (id: string) => setMaterials(materials.filter(m => m.id !== id));

    const addFixedCost = (fc: FixedCost) => setFixedCosts([...fixedCosts, fc]);
    const updateFixedCost = (updatedFc: FixedCost) => setFixedCosts(fixedCosts.map(fc => fc.id === updatedFc.id ? updatedFc : fc));
    const deleteFixedCost = (id: string) => setFixedCosts(fixedCosts.filter(fc => fc.id !== id));

    const addContact = async (c: Contact) => {
        try {
            // Generate a 4-digit ID (1000 to 9999)
            const customId = Math.floor(1000 + Math.random() * 9000).toString();

            // Overwrite the temporary ID from the UI with our custom ID
            const contactWithId = { ...c, id: customId };

            await api.post('/contacts', contactWithId);
            reloadContacts();
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar contato');
        }
    };

    const updateContact = async (updatedC: Contact) => {
        try {
            await api.put(`/contacts/${updatedC.id}`, updatedC);
            reloadContacts();
        } catch (e) {
            console.error(e);
            alert('Erro ao atualizar contato');
        }
    };

    const deleteContact = async (id: string) => {
        try {
            await api.delete(`/contacts/${id}`);
            reloadContacts();
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir contato');
        }
    };

    const addQuote = (q: Quote) => setQuotes([...quotes, q]);
    const updateQuote = (updatedQ: Quote) => setQuotes(quotes.map(q => q.id === updatedQ.id ? updatedQ : q));
    const deleteQuote = (id: string) => setQuotes(quotes.filter(q => q.id !== id));

    return {
        materials, setMaterials,
        products, setProducts,
        fixedCosts, setFixedCosts,
        contacts, setContacts,
        quotes, setQuotes,
        storeConfig, setStoreConfig: updateStoreConfig, // Expose the async update function as setStoreConfig
        addProduct, deleteProduct,
        addMaterial, updateMaterial, deleteMaterial,
        addFixedCost, updateFixedCost, deleteFixedCost,
        addContact, updateContact, deleteContact,
        addQuote, updateQuote, deleteQuote
    };
};
