
import { useState, useEffect } from 'react';
import { Product, Material, FixedCost, Settings, Contact, Quote } from '../types';
import { api } from '../api/client';

export const useStoreData = () => {
    // --- SETTINGS STATE ---
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

    // --- MATERIALS STATE ---
    const [materials, setMaterials] = useState<Material[]>([]);

    const reloadMaterials = async () => {
        try {
            const data = await api.get<Material[]>('/materials');
            setMaterials(data);
        } catch (error) {
            console.error('Failed to load materials', error);
        }
    };

    const addMaterial = async (m: Material) => {
        try {
            const { id, ...rest } = m;
            await api.post('/materials', rest);
            reloadMaterials();
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar material');
        }
    };

    const updateMaterial = async (updatedM: Material) => {
        try {
            await api.put(`/materials/${updatedM.id}`, updatedM);
            reloadMaterials();
        } catch (e) {
            console.error(e);
            alert('Erro ao atualizar material');
        }
    };

    const deleteMaterial = async (id: string) => {
        try {
            await api.delete(`/materials/${id}`);
            reloadMaterials();
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir material');
        }
    };

    // --- PRODUCTS STATE ---
    const [products, setProducts] = useState<Product[]>([]);

    const reloadProducts = async () => {
        try {
            const data = await api.get<Product[]>('/products');
            setProducts(data);
        } catch (error: any) {
            console.error('Failed to load products', error);
            alert('Debug: Falha ao carregar produtos: ' + (error.message || JSON.stringify(error)));
        }
    };

    const addProduct = async (p: Product) => {
        try {
            const { id, ...rest } = p;
            await api.post('/products', rest);
            reloadProducts();
        } catch (e: any) {
            console.error(e);
            alert(`Erro ao salvar produto: ${e.message || JSON.stringify(e)}`);
        }
    };

    const updateProduct = async (updatedP: Product) => {
        try {
            await api.put(`/products/${updatedP.id}`, updatedP);
            reloadProducts();
        } catch (e) {
            console.error(e);
            alert('Erro ao atualizar produto');
        }
    };

    const deleteProduct = async (id: string) => {
        try {
            await api.delete(`/products/${id}`);
            reloadProducts();
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir produto');
        }
    };

    // --- FIXED COSTS STATE ---
    // --- FIXED COSTS STATE ---
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);

    const reloadFixedCosts = async () => {
        try {
            const data = await api.get<FixedCost[]>('/fixed-costs');
            setFixedCosts(data);
        } catch (error) {
            console.error('Failed to load fixed costs', error);
        }
    };

    const addFixedCost = async (fc: FixedCost) => {
        try {
            const { id, ...rest } = fc;
            await api.post('/fixed-costs', rest);
            reloadFixedCosts();
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar custo fixo');
        }
    };

    const updateFixedCost = async (updatedFc: FixedCost) => {
        try {
            await api.put(`/fixed-costs/${updatedFc.id}`, updatedFc);
            reloadFixedCosts();
        } catch (e) {
            console.error(e);
            alert('Erro ao atualizar custo fixo');
        }
    };

    const deleteFixedCost = async (id: string) => {
        try {
            await api.delete(`/fixed-costs/${id}`);
            reloadFixedCosts();
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir custo fixo');
        }
    };

    // --- CONTACTS STATE ---
    const [contacts, setContacts] = useState<Contact[]>([]);

    const reloadContacts = async () => {
        try {
            const data = await api.get<Contact[]>('/contacts');
            setContacts(data);
        } catch (error) {
            console.error('Failed to load contacts', error);
        }
    };

    const addContact = async (c: Contact) => {
        try {
            const customId = Math.floor(1000 + Math.random() * 9000).toString();
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

    // --- QUOTES STATE ---
    const [quotes, setQuotes] = useState<Quote[]>([]);

    const reloadQuotes = async () => {
        try {
            const data = await api.get<Quote[]>('/quotes');
            setQuotes(data);
        } catch (error) {
            console.error('Failed to load quotes', error);
        }
    };

    const addQuote = async (q: Quote) => {
        try {
            const { id, ...rest } = q;
            // Allow frontend to generate weird IDs or let backend do it? 
            // If ID is random string from frontend, we pass it. 
            // But usually we prefer backend UUIDs. 
            // Let's rely on api client logic: if ID is present, use it.
            await api.post('/quotes', q);
            reloadQuotes();
        } catch (e) {
            console.error(e);
            alert('Erro ao salvar orçamento');
        }
    };

    const updateQuote = async (updatedQ: Quote) => {
        try {
            await api.put(`/quotes/${updatedQ.id}`, updatedQ);
            reloadQuotes();
        } catch (e) {
            console.error(e);
            alert('Erro ao atualizar orçamento');
        }
    };

    const deleteQuote = async (id: string) => {
        try {
            await api.delete(`/quotes/${id}`);
            reloadQuotes();
        } catch (e) {
            console.error(e);
            alert('Erro ao excluir orçamento');
        }
    };

    // --- INITIAL LOAD ---
    useEffect(() => {
        reloadSettings();
        reloadContacts();
        reloadMaterials();
        reloadFixedCosts();
        reloadProducts();
        reloadQuotes();
    }, []);

    return {
        materials, setMaterials,
        products, setProducts,
        fixedCosts, setFixedCosts,
        contacts, setContacts,
        quotes, setQuotes,
        storeConfig, setStoreConfig: updateStoreConfig,
        addProduct, updateProduct, deleteProduct,
        addMaterial, updateMaterial, deleteMaterial,
        addFixedCost, updateFixedCost, deleteFixedCost,
        addContact, updateContact, deleteContact,
        addQuote, updateQuote, deleteQuote
    };
};
