import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStoreData } from '../hooks/useStoreData';
import { Produto } from '../api/client'; // Keeping type for now to avoid breaking handleEdit
import {
    Package,
    Plus,
    Search,
    Trash2,
    X,
    Save,
    Layers,
    Clock,
    Box
} from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    unit: z.string().default('UN'),
    description: z.string().optional(),
    bomItems: z.array(z.object({
        insumoId: z.string(),
        qtyPerUnit: z.number().min(0.0001, 'Quantidade inválida'),
        appliesTo: z.enum(['PRODUCT', 'PACKAGING']),
        notes: z.string().optional()
    })),
    steps: z.array(z.object({
        name: z.string().min(1, 'Nome da etapa obrigatório'),
        setupMinutes: z.number().min(0),
        unitMinutes: z.number().min(0)
    })),
    profitMargin: z.number().min(0).max(100),
    sellingPrice: z.number().optional()
});

type FormData = z.infer<typeof schema>;

const Products: React.FC = () => {
    const { products, materials: insumos, addProduct, updateProduct, deleteProduct } = useStoreData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'info' | 'bom' | 'steps' | 'pricing'>('info');

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            unit: 'UN',
            bomItems: [],
            steps: [],
            profitMargin: 50, // Default margin
            sellingPrice: 0
        }
    });

    const { fields: bomFields, append: appendBom, remove: removeBom } = useFieldArray({
        control,
        name: 'bomItems'
    });

    const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
        control,
        name: 'steps'
    });

    // --- PRICING CALCULATION LOGIC ---
    const watchedBom = watch('bomItems');
    const watchedSteps = watch('steps');
    const watchedMargin = watch('profitMargin');
    const { storeConfig } = useStoreData();

    const calculateTotals = () => {
        // 1. Material Cost
        const matCost = (watchedBom || []).reduce((acc, item) => {
            const mat = insumos.find(i => i.id === item.insumoId);
            return acc + (item.qtyPerUnit * (mat?.price || 0));
        }, 0);

        // 2. Labor Cost
        // Hourly Rate = Pro Labore / (Days * Hours)
        const totalHoursMonth = (storeConfig.work_days_per_month * storeConfig.work_hours_per_day) || 160;
        const hourlyRate = (storeConfig.pro_labore / totalHoursMonth) || 0;

        const laborMinutes = (watchedSteps || []).reduce((acc, step) => acc + (step.setupMinutes || 0) + (step.unitMinutes || 0), 0);
        const laborCost = (laborMinutes / 60) * hourlyRate;

        const totalCost = matCost + laborCost;

        // 3. Selling Price based on Margin
        // Margin = (Price - Cost) / Price  =>  Price * Margin = Price - Cost  =>  Price * (1 - Margin) = Cost  => Price = Cost / (1 - Margin)
        // WAIT: User usually thinks in Markup? No, Profit Margin is usually (Price - Cost) / Price.
        // Let's use Margin % input.
        const marginDecimal = (watchedMargin || 0) / 100;
        const suggestedPrice = marginDecimal >= 1 ? 0 : totalCost / (1 - marginDecimal);

        return { matCost, laborCost, totalCost, suggestedPrice, hourlyRate };
    };

    const { matCost, laborCost, totalCost, suggestedPrice, hourlyRate } = calculateTotals();

    const onSubmit = async (data: FormData) => {
        try {
            // Save calculated price even if user didn't touch it? 
            // Better to respect the input if we add a manual override, but for now let's just save.
            const payload = {
                ...data,
                sellingPrice: suggestedPrice, // Auto-calculate for now (simplification)
                profitMargin: data.profitMargin
            };

            if (editingId) {
                await updateProduct({ id: editingId, ...payload } as any);
            } else {
                await addProduct({ id: '', ...payload } as any);
            }
            handleCloseModal();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza?')) return;
        await deleteProduct(id);
    };

    const handleEdit = (item: Produto) => {
        setEditingId(item.id);
        setValue('name', item.name);
        setValue('category', item.category);
        setValue('unit', item.unit);
        setValue('description', item.description || '');
        setValue('profitMargin', item.profit_margin || 50);
        // Map BOM and Steps
        setValue('bomItems', (item.bomItems || []).map(b => ({
            insumoId: b.insumoId,
            qtyPerUnit: Number(b.qtyPerUnit),
            appliesTo: b.appliesTo as 'PRODUCT' | 'PACKAGING', // simplified cast
            notes: (b as any).notes || ''
        })));
        setValue('steps', (item.steps || []).map(s => ({
            name: s.name,
            setupMinutes: Number(s.setupMinutes),
            unitMinutes: Number(s.unitMinutes)
        })));

        setIsModalOpen(true);
        setActiveTab('info');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset({ unit: 'UN', bomItems: [], steps: [], profitMargin: 50 });
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Produtos</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gerencie seu catálogo, receitas e processos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                >
                    <Plus className="w-5 h-5" /> Novo Produto
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all"
                        placeholder="Buscar produtos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(item => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                                <Box className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-indigo-600"><span className="sr-only">Edit</span>✎</button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-600"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{item.category}</p>
                        <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 w-max px-3 py-1 rounded-lg text-sm mb-4">
                            <span>R$ {item.selling_price?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                            <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {(item.bomItems || []).length} Insumos</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {(item.steps || []).length} Etapas</span>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-10 py-6 bg-gray-50 flex justify-between items-center border-b">
                            <h3 className="text-2xl font-bold font-serif">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                            <button onClick={handleCloseModal}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <div className="flex border-b px-10 overflow-x-auto">
                            <button onClick={() => setActiveTab('info')} className={`py-4 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'} ${(errors.name || errors.category || errors.unit) ? 'text-rose-500' : ''}`}>
                                Informações {(errors.name || errors.category || errors.unit) && '!'}
                            </button>
                            <button onClick={() => setActiveTab('bom')} className={`py-4 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'bom' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'} ${errors.bomItems ? 'text-rose-500' : ''}`}>
                                Receita {errors.bomItems && '!'}
                            </button>
                            <button onClick={() => setActiveTab('steps')} className={`py-4 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'steps' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'} ${errors.steps ? 'text-rose-500' : ''}`}>
                                Processo {errors.steps && '!'}
                            </button>
                            <button onClick={() => setActiveTab('pricing')} className={`py-4 px-6 font-bold text-sm uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'pricing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Precificação</button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                            {activeTab === 'info' && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Nome do Produto</label>
                                        <input {...register('name')} className="input-standard w-full p-4 bg-gray-50 rounded-xl" placeholder="Nome do Produto" />
                                        {errors.name && <p className="error-msg">{errors.name.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Categoria</label>
                                            <input {...register('category')} className="input-standard w-full p-4 bg-gray-50 rounded-xl" placeholder="Categoria" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Unidade</label>
                                            <input {...register('unit')} className="input-standard w-full p-4 bg-gray-50 rounded-xl" placeholder="UN" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Descrição</label>
                                        <textarea {...register('description')} rows={3} className="input-standard w-full p-4 bg-gray-50 rounded-xl resize-none" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bom' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-700">Lista de Materiais e Embalagens</h4>
                                        <button type="button" onClick={() => appendBom({ insumoId: '', qtyPerUnit: 1, appliesTo: 'PRODUCT' })} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100">+ Adicionar Item</button>
                                    </div>
                                    {bomFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Material</label>
                                                <select {...register(`bomItems.${index}.insumoId`)} className="w-full bg-white p-2 rounded-lg mt-1 border border-gray-200">
                                                    <option value="">Selecione...</option>
                                                    {insumos.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Qtd</label>
                                                <input type="number" step="0.001" {...register(`bomItems.${index}.qtyPerUnit`, { valueAsNumber: true })} className="w-full bg-white p-2 rounded-lg mt-1 border border-gray-200 text-center" />
                                            </div>
                                            <div className="w-32">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Tipo</label>
                                                <select {...register(`bomItems.${index}.appliesTo`)} className="w-full bg-white p-2 rounded-lg mt-1 border border-gray-200">
                                                    <option value="PRODUCT">Produto</option>
                                                    <option value="PACKAGING">Embalagem</option>
                                                </select>
                                            </div>
                                            <button type="button" onClick={() => removeBom(index)} className="mt-6 text-rose-500 hover:bg-rose-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'steps' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-700">Etapas de Produção</h4>
                                        <button type="button" onClick={() => appendStep({ name: '', setupMinutes: 0, unitMinutes: 0 })} className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100">+ Adicionar Etapa</button>
                                    </div>
                                    {stepFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Nome da Etapa</label>
                                                <input {...register(`steps.${index}.name`)} className="w-full bg-white p-2 rounded-lg mt-1 border border-gray-200" placeholder="Ex: Corte" />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Setup (Min)</label>
                                                <input type="number" {...register(`steps.${index}.setupMinutes`, { valueAsNumber: true })} className="w-full bg-white p-2 rounded-lg mt-1 border border-gray-200 text-center" />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] uppercase font-bold text-gray-400">Unit (Min)</label>
                                                <input type="number" {...register(`steps.${index}.unitMinutes`, { valueAsNumber: true })} className="w-full bg-white p-2 rounded-lg mt-1 border border-gray-200 text-center" />
                                            </div>
                                            <button type="button" onClick={() => removeStep(index)} className="mt-6 text-rose-500 hover:bg-rose-50 p-2 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'pricing' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Custo Materiais</p>
                                            <p className="text-xl font-bold text-gray-800">R$ {matCost.toFixed(2)}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Custo Mão de Obra</p>
                                            <p className="text-xl font-bold text-gray-800">R$ {laborCost.toFixed(2)}</p>
                                            <p className="text-[10px] text-gray-400">Minuto: R$ {(hourlyRate / 60).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs uppercase font-bold text-indigo-400 mb-1">Custo Total</p>
                                            <p className="text-3xl font-bold text-indigo-900">R$ {totalCost.toFixed(2)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-indigo-400">Margem Alvo (%)</p>
                                            <input
                                                type="number"
                                                className="text-right text-2xl font-bold text-indigo-900 bg-transparent border-b-2 border-indigo-200 w-24 focus:outline-none focus:border-indigo-500"
                                                {...register('profitMargin', { valueAsNumber: true })}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gray-900 rounded-2xl shadow-xl text-center">
                                        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Preço de Venda Sugerido</p>
                                        <p className="text-5xl font-bold text-white tracking-tight">R$ {suggestedPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 mt-6 border-t flex items-center justify-end gap-4">
                                {Object.keys(errors).length > 0 && (
                                    <span className="text-sm font-bold text-rose-500 animate-pulse">
                                        Corrija os erros nas abas acima!
                                    </span>
                                )}
                                <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-xl border font-bold text-gray-500">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">{isSubmitting ? 'Salvando...' : 'Salvar Produto'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Products;
