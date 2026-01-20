
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
    // TODO: persist products to supabase

    const addProduct = (p: Product) => setProducts([...products, p]);
    const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));

    // --- FIXED COSTS STATE ---
    const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
    // TODO: persist fixed costs to supabase

    const addFixedCost = (fc: FixedCost) => setFixedCosts([...fixedCosts, fc]);
    const updateFixedCost = (updatedFc: FixedCost) => setFixedCosts(fixedCosts.map(fc => fc.id === updatedFc.id ? updatedFc : fc));
    const deleteFixedCost = (id: string) => setFixedCosts(fixedCosts.filter(fc => fc.id !== id));

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
    const addQuote = (q: Quote) => setQuotes([...quotes, q]);
    const updateQuote = (updatedQ: Quote) => setQuotes(quotes.map(q => q.id === updatedQ.id ? updatedQ : q));
    const deleteQuote = (id: string) => setQuotes(quotes.filter(q => q.id !== id));

    // --- INITIAL LOAD ---
    useEffect(() => {
        reloadSettings();
        reloadContacts();
        reloadMaterials();
        reloadFixedCosts();
    }, []);

    return {
        materials, setMaterials,
        products, setProducts,
        fixedCosts, setFixedCosts,
        contacts, setContacts,
        quotes, setQuotes,
        storeConfig, setStoreConfig: updateStoreConfig,
        addProduct, deleteProduct,
        addMaterial, updateMaterial, deleteMaterial,
        addFixedCost, updateFixedCost, deleteFixedCost,
        addContact, updateContact, deleteContact,
        addQuote, updateQuote, deleteQuote
    };
};
