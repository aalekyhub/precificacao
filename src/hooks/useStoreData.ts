
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

    const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
        const saved = localStorage.getItem('precifica_config');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    });



    // Sync OTHER states to localStorage
    useEffect(() => {
        localStorage.setItem('precifica_materials', JSON.stringify(materials));
        localStorage.setItem('precifica_products', JSON.stringify(products));
        localStorage.setItem('precifica_fixed_costs', JSON.stringify(fixedCosts));
        // localStorage.setItem('precifica_contacts', JSON.stringify(contacts)); // No longer syncing contacts to local
        localStorage.setItem('precifica_quotes', JSON.stringify(quotes));
        localStorage.setItem('precifica_config', JSON.stringify(storeConfig));
    }, [materials, products, fixedCosts, quotes, storeConfig]);

    // Fetch contacts from API
    const reloadContacts = async () => {
        try {
            const data = await api.get<Contact[]>('/contacts');
            setContacts(data);
        } catch (error) {
            console.error('Failed to load contacts', error);
        }
    };

    useEffect(() => {
        reloadContacts();
    }, []);

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
            // Remove ID if it's a temp ID or let backend handle it? 
            // The Client.ts generates UUID if missing. The UI generates a temp ID `Math.random...`.
            // We should probably strip the ID if it looks temp, or just let Supabase/Client handle it.
            // Client.ts: const id = body.id || uuidv4();
            // If we send the temp ID, it will try to insert it. UUID validation might fail if it's not a UUID.
            // Math.random().toString(36) is NOT a UUID.
            // So we should sanitize the ID.
            const { id, ...rest } = c;
            await api.post('/contacts', rest);
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
        storeConfig, setStoreConfig,
        addProduct, deleteProduct,
        addMaterial, updateMaterial, deleteMaterial,
        addFixedCost, updateFixedCost, deleteFixedCost,
        addContact, updateContact, deleteContact,
        addQuote, updateQuote, deleteQuote
    };
};
