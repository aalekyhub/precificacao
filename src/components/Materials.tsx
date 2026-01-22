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
    AlertTriangle,
    Pencil,
    LayoutGrid,
    List
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
        try {
            const isDuplicate = materials.some(m =>
                m.name.toLowerCase() === data.name.toLowerCase() &&
                m.id !== (editingId || '')
            );

            if (isDuplicate) {
                alert("Já existe um material cadastrado com este nome!");
                return;
            }

            if (editingId) {
                await updateMaterial({ id: editingId, ...data } as Material);
            } else {
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
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Meus Materiais</h2>
                    <p className="text-gray-500 mt-2 font-medium">Cadastre tudo que você usa para produzir.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Novo Material
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar material..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-lg outline-none focus:bg-white focus:border-blue-500 transition-all font-medium h-12"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Layout */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Material / Item</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Unid.</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custo Unit.</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Estoque</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center text-gray-400 font-medium">
                                        Nenhum material encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 font-bold">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="font-bold text-gray-900 block text-sm">{item.name}</span>
                                                    {item.observations && <span className="text-xs text-gray-400 line-clamp-1">{item.observations}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.unit}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="font-black text-gray-900 text-sm">R$ {Number(item.price).toFixed(4)}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`font-bold text-sm ${item.stock <= item.min_stock ? 'text-amber-500' : 'text-gray-700'}`}>
                                                    {item.stock}
                                                </span>
                                                {item.stock <= item.min_stock && (
                                                    <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide bg-amber-50 px-1.5 py-0.5 rounded mt-0.5">Baixo</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Editar">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Excluir">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                                        {editingId ? 'Editar Material' : 'Novo Material'}
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium">Preencha os dados do insumo</p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Identificação</label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="col-span-2">
                                                <input
                                                    {...register('name')}
                                                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-sm shadow-sm"
                                                    placeholder="Nome do Material (ex: Papel Offset)"
                                                />
                                                {errors.name && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
                                            </div>
                                            <div>
                                                <input
                                                    {...register('unit')}
                                                    className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-sm shadow-sm"
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
                                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Precificação e Custos
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Preço Pago (Total)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">R$</span>
                                                <input
                                                    type="number" step="0.01"
                                                    {...register('purchase_price', { valueAsNumber: true })}
                                                    className="w-full h-10 pl-8 pr-4 bg-white border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-gray-900 text-sm"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Qtd na Embalagem</label>
                                            <input
                                                type="number" step="0.01"
                                                {...register('pack_quantity', { valueAsNumber: true })}
                                                className="w-full h-10 px-4 bg-white border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-gray-900 text-sm"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-blue-100 mt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Custo Unitário Final</label>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-blue-300 font-medium">Auto-calculado</span>
                                                <div className="bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm min-w-[100px] text-center">
                                                    <span className="text-lg font-black text-blue-600">
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
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Estoque</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Atual</label>
                                                <input
                                                    type="number" step="0.01"
                                                    {...register('stock', { valueAsNumber: true })}
                                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-bold text-gray-700 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Mínimo</label>
                                                <input
                                                    type="number" step="0.01"
                                                    {...register('min_stock', { valueAsNumber: true })}
                                                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-bold text-amber-600 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-1.5 ml-1">Observações</label>
                                        <textarea
                                            {...register('observations')}
                                            className="w-full h-[72px] px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-600 text-sm resize-none shadow-sm"
                                            placeholder="..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-white border border-gray-200 rounded-lg font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all text-sm">
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200/50 transition-all disabled:opacity-70 disabled:shadow-none text-sm active:scale-95 transform"
                                >
                                    <Save className="w-5 h-5" />
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
