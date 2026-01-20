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
    purchase_price: z.number().optional(),
    pack_quantity: z.number().optional(),
    observations: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const Materials: React.FC = () => {
    const { materials, addMaterial, updateMaterial, deleteMaterial } = useStoreData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            stock: 0,
            min_stock: 0,
            unit: 'UN',
            purchase_price: 0,
            pack_quantity: 1,
            price: 0
        }
    });

    const purchasePrice = watch('purchase_price');
    const packQuantity = watch('pack_quantity');

    useEffect(() => {
        if (purchasePrice && packQuantity && packQuantity > 0) {
            const calculated = purchasePrice / packQuantity;
            setValue('price', parseFloat(calculated.toFixed(4)));
        }
    }, [purchasePrice, packQuantity, setValue]);

    const onSubmit = async (data: FormData) => {
        console.log('Submitting Material Data:', data);
        try {
            if (editingId) {
                await updateMaterial({ id: editingId, ...data } as Material);
            } else {
                // Pass empty ID for new creation, it will be stripped/ignored or handled
                await addMaterial({ id: '', ...data } as Material);
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
        console.log('Editing Material Item:', item);
        setEditingId(item.id);
        setValue('name', item.name);
        setValue('unit', item.unit);
        setValue('price', Number(item.price));
        setValue('stock', Number(item.stock));
        setValue('min_stock', Number(item.min_stock));
        setValue('purchase_price', Number(item.purchase_price || 0));
        setValue('pack_quantity', Number(item.pack_quantity || 1));
        setValue('observations', item.observations || '');
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
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 font-serif">
                                    {editingId ? 'Editar Material' : 'Novo Material'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">Preencha os detalhes do insumo.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Identificação</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <input
                                                    {...register('name')}
                                                    className="w-full text-sm font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                    placeholder="Nome do Material (ex: Papel Offset)"
                                                />
                                                {errors.name && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    {...register('unit')}
                                                    className="w-full text-sm font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                                                    placeholder="Unidade"
                                                    list="units"
                                                />
                                                <datalist id="units">
                                                    <option value="UN">Unidade</option>
                                                    <option value="KG">Quilograma</option>
                                                    <option value="MT">Metro</option>
                                                    <option value="CX">Caixa</option>
                                                    <option value="L">Litro</option>
                                                </datalist>
                                                {errors.unit && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.unit.message}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Section */}
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                                    <h4 className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Precificação e Custos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Preço Pago (Total)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                                                <input
                                                    type="number" step="0.01"
                                                    {...register('purchase_price', { valueAsNumber: true })}
                                                    className="w-full text-sm font-bold text-gray-900 pl-8 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Qtd na Embalagem</label>
                                            <input
                                                type="number" step="0.01"
                                                {...register('pack_quantity', { valueAsNumber: true })}
                                                className="w-full text-sm font-bold text-gray-900 px-4 py-2.5 bg-white border border-blue-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-blue-100 mt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Custo Unitário Final</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-blue-300 font-medium">Auto-calculado</span>
                                                <div className="bg-white px-4 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                                                    <span className="text-sm font-black text-blue-600">
                                                        R$ {watch('price')?.toFixed(4) || '0.0000'}
                                                    </span>
                                                    {/* Hidden input to ensure value is registered */}
                                                    <input type="hidden" {...register('price', { valueAsNumber: true })} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock & Details */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Controle de Estoque</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-gray-400 block mb-1">Atual</label>
                                                <input
                                                    type="number" step="0.01"
                                                    {...register('stock', { valueAsNumber: true })}
                                                    className="w-full text-sm font-bold text-gray-700 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all"
                                                />
                                                {errors.stock && <p className="text-rose-500 text-[10px] mt-1">{errors.stock.message}</p>}
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 block mb-1">Mínimo</label>
                                                <input
                                                    type="number" step="0.01"
                                                    {...register('min_stock', { valueAsNumber: true })}
                                                    className="w-full text-sm font-bold text-amber-600 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:bg-white focus:border-amber-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Observações</label>
                                        <textarea
                                            {...register('observations')}
                                            className="w-full text-sm text-gray-600 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 transition-all resize-none h-[88px]"
                                            placeholder="..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all text-sm">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200/50 transition-all disabled:opacity-70 disabled:shadow-none text-sm active:scale-95 transform"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? 'Salvando...' : 'Salvar Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Materials;
