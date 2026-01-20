import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, Insumo } from '../api/client';
import {
    Package,
    Plus,
    Search,
    Trash2,
    X,
    Save,
    AlertCircle
} from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    unit: z.string().min(1, 'Unidade é obrigatória'),
    unitCost: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
    lossPct: z.number().min(0).max(1, 'Perda deve ser entre 0 e 1 (ex: 0.1 para 10%)'),
    yieldNotes: z.string().optional(),
    supplier: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const Materials: React.FC = () => {
    const [materials, setMaterials] = useState<Insumo[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            lossPct: 0,
            unit: 'UN'
        }
    });

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const data = await api.get<Insumo[]>('/insumos');
            setMaterials(data);
        } catch (error) {
            console.error('Failed to fetch materials', error);
        }
    };

    const onSubmit = async (data: FormData) => {
        try {
            if (editingId) {
                await api.put(`/insumos/${editingId}`, data);
            } else {
                await api.post('/insumos', data);
            }
            await fetchMaterials();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save material', error);
            alert('Erro ao salvar material');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        try {
            await api.delete(`/insumos/${id}`);
            await fetchMaterials();
        } catch (error) {
            console.error('Failed to delete', error);
            alert('Erro ao excluir');
        }
    };

    const handleEdit = (item: Insumo) => {
        setEditingId(item.id);
        setValue('name', item.name);
        setValue('unit', item.unit);
        setValue('unitCost', Number(item.unitCost));
        setValue('lossPct', Number(item.lossPct));
        setValue('yieldNotes', item.yieldNotes || '');
        setValue('supplier', item.supplier || '');
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
                    <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Materiais e Insumos</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gerencie seus custos de matéria-prima e perdas.</p>
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
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
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

                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">Custo por {item.unit}</p>
                                <p className="text-2xl font-black text-gray-900 mt-1">R$ {Number(item.unitCost).toFixed(2)}</p>
                            </div>
                            {Number(item.lossPct) > 0 && (
                                <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Perda: {(Number(item.lossPct) * 100).toFixed(0)}%
                                </span>
                            )}
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
                                            {...register('unitCost', { valueAsNumber: true })}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        />
                                        {errors.unitCost && <p className="text-rose-500 text-sm mt-1">{errors.unitCost.message}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Perda (%)</label>
                                        <input
                                            type="number" step="0.01"
                                            {...register('lossPct', { valueAsNumber: true })}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                            placeholder="0.10 para 10%"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 ml-1">Ex: 0.10 = 10% de perda</p>
                                        {errors.lossPct && <p className="text-rose-500 text-sm mt-1">{errors.lossPct.message}</p>}
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Fornecedor (Opcional)</label>
                                        <input
                                            {...register('supplier')}
                                            className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider ml-1 block mb-2">Notas sobre Rendimento (Opcional)</label>
                                    <textarea
                                        {...register('yieldNotes')}
                                        rows={3}
                                        className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm resize-none"
                                    />
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
