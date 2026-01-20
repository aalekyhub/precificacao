import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStoreData } from '../hooks/useStoreData';
import { Material } from '../types';
import {
    Package,
    Plus,
    Search,
    Trash2,
    X,
    Save,
    AlertTriangle
} from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    unit: z.string().min(1, 'Unidade é obrigatória'),
    price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
    stock: z.number().min(0, 'Estoque deve ser maior ou igual a zero'),
    min_stock: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero'),
});

type FormData = z.infer<typeof schema>;

const Materials: React.FC = () => {
    const { materials, addMaterial, updateMaterial, deleteMaterial } = useStoreData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            stock: 0,
            min_stock: 0,
            unit: 'UN'
        }
    });

    const onSubmit = async (data: FormData) => {
        try {
            if (editingId) {
                await updateMaterial({ id: editingId, ...data });
            } else {
                // Pass empty ID for new creation, it will be stripped/ignored or handled
                await addMaterial({ id: '', ...data });
            }
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save material', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        await deleteMaterial(id);
    };

    const handleEdit = (item: Material) => {
        setEditingId(item.id);
        setValue('name', item.name);
        setValue('unit', item.unit);
        setValue('price', Number(item.price));
        setValue('stock', Number(item.stock));
        setValue('min_stock', Number(item.min_stock));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset();
    };

    const filtered = materials.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Meus Materiais</h2>
                    <p className="text-gray-500 mt-2 font-medium">Cadastre tudo que você usa para produzir.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Novo Material
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-medium"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(item => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">

                        {Number(item.stock) <= Number(item.min_stock) && (
                            <div className="absolute top-0 right-0 bg-amber-100 text-amber-600 px-4 py-2 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Baixo Estoque
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-6 mt-2">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <Package className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-blue-600 transition-colors">
                                    <span className="sr-only">Editar</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">{item.unit}</p>

                        <div className="flex justify-between items-end border-t pt-4 border-gray-50">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preço Pago</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">R$ {Number(item.price).toFixed(2)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Em Estoque</p>
                                <p className={`text-xl font-bold mt-1 ${item.stock <= item.min_stock ? 'text-amber-500' : 'text-gray-700'}`}>
                                    {item.stock}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 bg-gray-50/50 flex items-center justify-between border-b">
                            <h3 className="text-2xl font-bold text-gray-900 font-serif">
                                {editingId ? 'Editar Material' : 'Novo Material'}
                            </h3>
                            <button onClick={handleCloseModal}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Nome do Material</label>
                                    <input
                                        {...register('name')}
                                        className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        placeholder="Ex: Papel Offset 180g"
                                    />
                                    {errors.name && <p className="text-rose-500 text-sm mt-1">{errors.name.message}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Unidade</label>
                                        <input
                                            {...register('unit')}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                            placeholder="UN, KG, MT"
                                        />
                                        {errors.unit && <p className="text-rose-500 text-sm mt-1">{errors.unit.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Custo Unitário (R$)</label>
                                        <input
                                            type="number" step="0.01"
                                            {...register('price', { valueAsNumber: true })}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        />
                                        {errors.price && <p className="text-rose-500 text-sm mt-1">{errors.price.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Estoque Atual</label>
                                        <input
                                            type="number" step="0.01"
                                            {...register('stock', { valueAsNumber: true })}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        />
                                        {errors.stock && <p className="text-rose-500 text-sm mt-1">{errors.stock.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Estoque Mínimo (Alerta)</label>
                                        <input
                                            type="number" step="0.01"
                                            {...register('min_stock', { valueAsNumber: true })}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="pt-6 border-t flex justify-end gap-4">
                                <button type="button" onClick={handleCloseModal} className="px-8 py-4 bg-white border-2 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-70"
                                >
                                    <Save className="w-5 h-5" />
                                    {isSubmitting ? 'Salvando...' : 'Salvar Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Materials;
