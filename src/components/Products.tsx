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
        const marginDecimal = (watchedMargin || 0) / 100;
        const suggestedPrice = marginDecimal >= 1 ? 0 : totalCost / (1 - marginDecimal);

        return { matCost, laborCost, totalCost, suggestedPrice, hourlyRate };
    };

    const { matCost, laborCost, totalCost, suggestedPrice, hourlyRate } = calculateTotals();

    const onSubmit = async (data: FormData) => {
        try {
            const payload = {
                name: data.name,
                category: data.category,
                unit: data.unit,
                description: data.description,
                selling_price: suggestedPrice,
                profit_margin: data.profitMargin,
                bomItems: data.bomItems,
                steps: data.steps
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

        setValue('bomItems', (item.bomItems || []).map(b => ({
            insumoId: b.insumoId,
            qtyPerUnit: Number(b.qtyPerUnit),
            appliesTo: b.appliesTo as 'PRODUCT' | 'PACKAGING',
            notes: (b as any).notes || ''
        })));

        setValue('steps', (item.steps || []).map(s => ({
            name: s.name,
            setupMinutes: Number(s.setupMinutes),
            unitMinutes: Number(s.unitMinutes)
        })));

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        reset({ unit: 'UN', bomItems: [], steps: [], profitMargin: 50 });
    };

    const filtered = products.filter(p =>
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Produtos</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gerencie seu catálogo, receitas e processos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Novo Produto
                </button>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all font-medium"
                        placeholder="Buscar produtos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-xl font-bold text-gray-400">Nenhum produto encontrado</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                    <Box className="w-7 h-7" />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors"><span className="sr-only">Edit</span>✎</button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1" title={item.name}>{item.name}</h3>
                            <p className="text-sm text-gray-500 mb-4">{item.category}</p>
                            <div className="flex items-center gap-2 text-indigo-600 font-bold bg-indigo-50 w-max px-3 py-1 rounded-lg text-sm mb-4">
                                <span>R$ {Number(item.selling_price).toFixed(2) || '0.00'}</span>
                            </div>
                            <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {(item.bomItems || []).length} Materiais</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {(item.steps || []).length} Etapas</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-7xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] animate-in zoom-in-95 duration-200">

                        {/* Header */}
                        <div className="px-8 py-5 bg-white border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                            <div>
                                <h3 className="text-xl font-bold font-serif text-gray-900">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors">Cancelar</button>
                                <button form="product-form" type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white text-sm rounded-lg font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </div>

                        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-gray-50/50">

                            {/* Left Column: Inputs */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

                                {/* Info Section */}
                                <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4 text-gray-900">
                                        <Box className="w-5 h-5 text-indigo-600" />
                                        <h4 className="font-bold text-base">Informações Básicas</h4>
                                    </div>
                                    <div className="grid grid-cols-12 gap-4">
                                        <div className="col-span-8">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Nome do Produto</label>
                                            <input {...register('name')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm" placeholder="Nome do produto" />
                                            {errors.name && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.name.message}</p>}
                                        </div>
                                        <div className="col-span-4">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Categoria</label>
                                            <input {...register('category')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm" placeholder="Categoria" />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Unidade</label>
                                            <input {...register('unit')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm text-center" placeholder="UN" />
                                        </div>
                                        <div className="col-span-9">
                                            <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Descrição</label>
                                            <input {...register('description')} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-sm" placeholder="Descrição opcional" />
                                        </div>
                                    </div>
                                </section>

                                {/* Grid for Materials and Process */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                                    {/* Materials Section */}
                                    <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Layers className="w-5 h-5 text-indigo-600" />
                                                <h4 className="font-bold text-base">Materiais</h4>
                                            </div>
                                            <button type="button" onClick={() => appendBom({ insumoId: '', qtyPerUnit: 1, appliesTo: 'PRODUCT' })} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            {bomFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-center p-2 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                                                    <div className="flex-1 min-w-0">
                                                        <select {...register(`bomItems.${index}.insumoId`)} className="w-full bg-transparent p-1 outline-none text-xs font-medium text-gray-700 truncate cursor-pointer">
                                                            <option value="">Selecione...</option>
                                                            {insumos.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="w-16">
                                                        <input type="number" step="0.001" {...register(`bomItems.${index}.qtyPerUnit`, { valueAsNumber: true })} className="w-full bg-white px-2 py-1 rounded border border-gray-200 text-xs font-bold text-center outline-none focus:border-indigo-500" placeholder="Qtd" />
                                                    </div>
                                                    <button type="button" onClick={() => removeBom(index)} className="text-gray-300 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            {bomFields.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">Nenhum material adicionado.</p>}
                                        </div>
                                    </section>

                                    {/* Process Section */}
                                    <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2 text-gray-900">
                                                <Clock className="w-5 h-5 text-indigo-600" />
                                                <h4 className="font-bold text-base">Processo</h4>
                                            </div>
                                            <button type="button" onClick={() => appendStep({ name: '', setupMinutes: 0, unitMinutes: 0 })} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            {stepFields.map((field, index) => (
                                                <div key={field.id} className="flex gap-2 items-center p-2 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                                                    <div className="flex-1 min-w-0">
                                                        <input {...register(`steps.${index}.name`)} className="w-full bg-transparent p-1 outline-none text-xs font-medium text-gray-700 placeholder-gray-400" placeholder="Nome da etapa" />
                                                    </div>
                                                    <div className="flex gap-1 items-center">
                                                        <input type="number" {...register(`steps.${index}.setupMinutes`, { valueAsNumber: true })} className="w-12 bg-white px-1 py-1 rounded border border-gray-200 text-xs font-bold text-center outline-none focus:border-indigo-500" placeholder="Set" title="Setup (min)" />
                                                        <span className="text-[10px] text-gray-400">+</span>
                                                        <input type="number" {...register(`steps.${index}.unitMinutes`, { valueAsNumber: true })} className="w-12 bg-white px-1 py-1 rounded border border-gray-200 text-xs font-bold text-center outline-none focus:border-indigo-500" placeholder="Unit" title="Unitário (min)" />
                                                    </div>
                                                    <button type="button" onClick={() => removeStep(index)} className="text-gray-300 hover:text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            {stepFields.length === 0 && <p className="text-xs text-gray-400 text-center py-4 italic">Nenhuma etapa definida.</p>}
                                        </div>
                                    </section>
                                </div>
                            </div>

                            {/* Right Column: Pricing Sidebar */}
                            <div className="w-full lg:w-80 bg-white border-l border-gray-100 p-6 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] z-10 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 opacity-30 pointer-events-none"></div>

                                <h4 className="text-lg font-bold text-gray-900 font-serif mb-6">Precificação</h4>

                                <div className="space-y-6 flex-1">
                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Custos Variáveis</span>
                                            <span className="text-sm font-bold text-gray-800">R$ {matCost.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                            <div className="bg-indigo-400 h-1 rounded-full" style={{ width: `${Math.min((matCost / (totalCost || 1)) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-center mb-1">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Mão de Obra</span>
                                                <span className="text-[10px] text-gray-400">(Estimada)</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-800">R$ {laborCost.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                            <div className="bg-orange-400 h-1 rounded-full" style={{ width: `${Math.min((laborCost / (totalCost || 1)) * 100, 100)}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Custo Total</span>
                                            <span className="text-xl font-bold text-gray-700">R$ {totalCost.toFixed(2)}</span>
                                        </div>

                                        <div className="flex items-center justify-between bg-indigo-50 rounded-xl p-3 mb-6 border border-indigo-100">
                                            <span className="text-xs font-bold text-indigo-800 uppercase">Margem (%)</span>
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    {...register('profitMargin', { valueAsNumber: true })}
                                                    className="w-12 bg-white text-right font-bold text-indigo-700 outline-none border-b border-indigo-300 focus:border-indigo-600 text-sm py-1"
                                                />
                                                <span className="text-indigo-600 font-bold">%</span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-900 rounded-2xl p-6 text-center shadow-xl shadow-gray-200">
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Preço Sugerido</p>
                                            <p className="text-4xl font-black text-white">R$ {suggestedPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Products;
