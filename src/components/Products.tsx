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
                    <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-6 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-gray-900">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure todos os detalhes em um só lugar.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">

                                {/* SECTION: PRODUTO (INFO) */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">1</div>
                                        <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Produto</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                                        <div className="md:col-span-2">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Nome</label>
                                            <input {...register('name')} className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all" placeholder="Nome do Produto" />
                                            {errors.name && <p className="error-msg text-rose-500 text-xs mt-1">{errors.name.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Categoria</label>
                                            <input {...register('category')} className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all" placeholder="Categoria" />
                                            {errors.category && <p className="error-msg text-rose-500 text-xs mt-1">{errors.category.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Unidade</label>
                                            <input {...register('unit')} className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all" placeholder="UN" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Descrição</label>
                                            <textarea {...register('description')} rows={2} className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all resize-none" />
                                        </div>
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* SECTION: MATERIAIS (RECEITA) */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">2</div>
                                            <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Materiais (Receita)</h4>
                                        </div>
                                        <button type="button" onClick={() => appendBom({ insumoId: '', qtyPerUnit: 1, appliesTo: 'PRODUCT' })} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">+ Adicionar Material</button>
                                    </div>

                                    <div className="pl-11 space-y-3">
                                        {bomFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Material</label>
                                                    <select {...register(`bomItems.${index}.insumoId`)} className="w-full bg-white p-3 rounded-xl mt-1 border border-gray-200 outline-none focus:border-indigo-500">
                                                        <option value="">Selecione...</option>
                                                        {insumos.map(i => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Qtd</label>
                                                    <input type="number" step="0.001" {...register(`bomItems.${index}.qtyPerUnit`, { valueAsNumber: true })} className="w-full bg-white p-3 rounded-xl mt-1 border border-gray-200 outline-none focus:border-indigo-500 text-center" />
                                                </div>
                                                <div className="w-40">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Aplicar em</label>
                                                    <select {...register(`bomItems.${index}.appliesTo`)} className="w-full bg-white p-3 rounded-xl mt-1 border border-gray-200 outline-none focus:border-indigo-500">
                                                        <option value="PRODUCT">Produto</option>
                                                        <option value="PACKAGING">Embalagem</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => removeBom(index)} className="mt-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                        {bomFields.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum material adicionado à receita.</p>}
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* SECTION: PROCESSO */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">3</div>
                                            <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Processo (Tempo)</h4>
                                        </div>
                                        <button type="button" onClick={() => appendStep({ name: '', setupMinutes: 0, unitMinutes: 0 })} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors">+ Adicionar Etapa</button>
                                    </div>

                                    <div className="pl-11 space-y-3">
                                        {stepFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-colors">
                                                <div className="flex-1">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Nome da Etapa</label>
                                                    <input {...register(`steps.${index}.name`)} className="w-full bg-white p-3 rounded-xl mt-1 border border-gray-200 outline-none focus:border-indigo-500" placeholder="Ex: Corte" />
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Setup (Min)</label>
                                                    <input type="number" {...register(`steps.${index}.setupMinutes`, { valueAsNumber: true })} className="w-full bg-white p-3 rounded-xl mt-1 border border-gray-200 outline-none focus:border-indigo-500 text-center" />
                                                </div>
                                                <div className="w-32">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Unitário (Min)</label>
                                                    <input type="number" {...register(`steps.${index}.unitMinutes`, { valueAsNumber: true })} className="w-full bg-white p-3 rounded-xl mt-1 border border-gray-200 outline-none focus:border-indigo-500 text-center" />
                                                </div>
                                                <button type="button" onClick={() => removeStep(index)} className="mt-8 text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                                            </div>
                                        ))}
                                        {stepFields.length === 0 && <p className="text-sm text-gray-400 italic">Nenhuma etapa de produção definida.</p>}
                                    </div>
                                </section>

                                <hr className="border-gray-100" />

                                {/* SECTION: PRECIFICAÇÃO */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">4</div>
                                        <h4 className="text-lg font-bold text-gray-800 uppercase tracking-wide">Precificação</h4>
                                    </div>

                                    <div className="pl-11">
                                        <div className="bg-gray-900 rounded-[2rem] p-8 text-white shadow-xl">
                                            <div className="grid grid-cols-2 gap-8 mb-8">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Custo Materiais</p>
                                                    <p className="text-2xl font-bold">R$ {matCost.toFixed(2)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Custo Mão de Obra</p>
                                                    <p className="text-2xl font-bold">R$ {laborCost.toFixed(2)}</p>
                                                    <p className="text-[10px] text-gray-600 mt-1">H.Rate: {hourlyRate.toFixed(2)}/h</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-800 pt-6">
                                                <div>
                                                    <p className="text-xs uppercase font-bold text-gray-500 mb-2">Custo Total</p>
                                                    <p className="text-3xl font-bold text-indigo-400">R$ {totalCost.toFixed(2)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <label className="text-xs uppercase font-bold text-gray-500 mb-2 block">Margem Alvo (%)</label>
                                                    <input
                                                        type="number"
                                                        className="text-right text-3xl font-bold text-white bg-transparent border-b-2 border-gray-700 w-32 focus:outline-none focus:border-indigo-500 transition-colors"
                                                        {...register('profitMargin', { valueAsNumber: true })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-8 bg-gray-800/50 p-6 rounded-2xl flex justify-between items-center border border-gray-700">
                                                <span className="text-sm font-medium text-gray-400">Preço de Venda Sugerido</span>
                                                <span className="text-4xl font-bold text-white">R$ {suggestedPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>

                            <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 z-10">
                                {Object.keys(errors).length > 0 && (
                                    <span className="text-sm font-bold text-rose-500 animate-pulse self-center mr-auto">
                                        Corrija os erros no formulário antes de salvar!
                                    </span>
                                )}
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center gap-2">
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? 'Salvando...' : 'Salvar Produto'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Products;
