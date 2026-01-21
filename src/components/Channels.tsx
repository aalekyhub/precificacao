import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, Canal } from '../api/client';
import {
    ShoppingBag,
    Plus,
    Trash2,
    X,
    Save,
    CheckCircle2
} from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    percentFeesTotal: z.number().min(0).max(1, 'Taxa deve ser entre 0 e 1 (ex: 0.18)'),
    fixedFeePerOrder: z.number().min(0),
    taxIncluded: z.boolean(),
    adsIncluded: z.boolean()
});

type FormData = z.infer<typeof schema>;

const Channels: React.FC = () => {
    const [channels, setChannels] = useState<Canal[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            percentFeesTotal: 0,
            fixedFeePerOrder: 0,
            taxIncluded: false,
            adsIncluded: false
        }
    });

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const data = await api.get<Canal[]>('/canais');
            setChannels(data);
        } catch (error) { console.error(error); }
    };

    const onSubmit = async (data: FormData) => {
        try {
            if (editingId) {
                await api.put(`/canais/${editingId}`, data);
            } else {
                await api.post('/canais', data);
            }
            await fetchChannels();
            handleCloseModal();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar canal');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        try {
            await api.delete(`/canais/${id}`);
            await fetchChannels();
        } catch (error) { console.error(error); }
    };

    const handleEdit = (item: Canal) => {
        setEditingId(item.id);
        setValue('name', item.name);
        setValue('percentFeesTotal', Number(item.percentFeesTotal));
        setValue('fixedFeePerOrder', Number(item.fixedFeePerOrder));
        setValue('taxIncluded', item.taxIncluded);
        setValue('adsIncluded', item.adsIncluded);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Canais de Venda</h2>
                    <p className="text-gray-500 mt-2 font-medium">Marketplaces, taxas e comissões.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-green-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-xl shadow-green-100"
                >
                    <Plus className="w-5 h-5" /> Novo Canal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map(item => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-green-600 transition-colors">✎</button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>

                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Taxa Total (%)</span>
                                <span className="font-bold">{(Number(item.percentFeesTotal) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Taxa Fixa (Pedido)</span>
                                <span className="font-bold">R$ {Number(item.fixedFeePerOrder).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                            {item.adsIncluded && <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">Ads Incluso</span>}
                            {item.taxIncluded && <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-1 rounded font-bold uppercase">Imposto Incluso</span>}
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-8 bg-gray-50 flex justify-between items-center border-b">
                            <h3 className="text-2xl font-bold">{editingId ? 'Editar Canal' : 'Novo Canal'}</h3>
                            <button onClick={handleCloseModal}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-6">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Nome do Canal Marketplace</label>
                                <input {...register('name')} className="input-standard w-full p-4 bg-gray-50 rounded-xl" placeholder="Ex: Shopee, Elo7, Site Próprio" />
                                {errors.name && <p className="text-rose-500 text-sm">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Taxa Total (%)</label>
                                    <input type="number" step="0.01" {...register('percentFeesTotal', { valueAsNumber: true })} className="input-standard w-full p-4 bg-gray-50 rounded-xl" placeholder="0.18" />
                                    <span className="text-[10px] text-gray-400">0.18 = 18%</span>
                                    {errors.percentFeesTotal && <p className="text-rose-500 text-sm">{errors.percentFeesTotal.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Taxa Fixa (R$)</label>
                                    <input type="number" step="0.01" {...register('fixedFeePerOrder', { valueAsNumber: true })} className="input-standard w-full p-4 bg-gray-50 rounded-xl" placeholder="3.00" />
                                    {errors.fixedFeePerOrder && <p className="text-rose-500 text-sm">{errors.fixedFeePerOrder.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" {...register('taxIncluded')} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    <span className="text-sm font-medium text-gray-700">Imposto (DAS) incluso nesta taxa?</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" {...register('adsIncluded')} className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                                    <span className="text-sm font-medium text-gray-700">Custo de Ads/Publicidade incluso?</span>
                                </label>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-100 hover:bg-green-700 transition-all disabled:opacity-70 mt-4">
                                {isSubmitting ? 'Salvando...' : 'Salvar Canal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Channels;
