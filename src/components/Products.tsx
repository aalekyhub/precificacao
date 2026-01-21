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
    taxRate: z.number().min(0).max(100).default(0),
    commissionRate: z.number().min(0).max(100).default(0),
    marketplaceRate: z.number().min(0).max(100).default(0),
    sellingPrice: z.number().optional()
});

type FormData = z.infer<typeof schema>;

const Products: React.FC = () => {
    const { products, materials: insumos, fixedCosts, addProduct, updateProduct, deleteProduct } = useStoreData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            unit: 'UN',
            bomItems: [],
            steps: [],
            profitMargin: 50, // Default margin (Net Target)
            taxRate: 4, // Default Simple Nacional approx
            commissionRate: 0,
            marketplaceRate: 0,
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

        // 2. Labor Cost & Fixed Cost Share
        // Hourly Rate = Pro Labore / (Days * Hours)
        const totalHoursMonth = (storeConfig.work_days_per_month * storeConfig.work_hours_per_day) || 160;

        // Hourly Rates
        const hourlyLaborRate = (storeConfig.pro_labore / totalHoursMonth) || 0;

        // Fixed Costs Rate (Rateio de Custos Fixos)
        const totalFixedMonthly = (fixedCosts || []).reduce((acc, fc) => acc + fc.value, 0);
        const hourlyFixedRate = (totalFixedMonthly / totalHoursMonth) || 0;

        const laborMinutes = (watchedSteps || []).reduce((acc, step) => acc + (step.setupMinutes || 0) + (step.unitMinutes || 0), 0);

        const laborCost = (laborMinutes / 60) * hourlyLaborRate;
        const fixedCostShare = (laborMinutes / 60) * hourlyFixedRate;

        const totalCost = matCost + laborCost + fixedCostShare;

        // 3. Selling Price based on "Perfect Pricing" (Markup Multiplier approach for Target Net Profit)
        // Formula: Price = Cost / (1 - (Tax% + Fee% + NetProfit%))
        const taxDecimal = (watch('taxRate') || 0) / 100;
        const commDecimal = (watch('commissionRate') || 0) / 100;
        const marketDecimal = (watch('marketplaceRate') || 0) / 100;
        const profitDecimal = (watchedMargin || 0) / 100;

        const variableCostsRate = taxDecimal + commDecimal + marketDecimal + profitDecimal;

        // Prevent division by zero or negative divisor if overheads > 100%
        const divisor = 1 - variableCostsRate;
        const suggestedPrice = divisor <= 0.01 ? 0 : totalCost / divisor; // Safety check

        const taxValue = suggestedPrice * taxDecimal;
        const commValue = suggestedPrice * commDecimal;
        const marketValue = suggestedPrice * marketDecimal;
        const netProfitValue = suggestedPrice * profitDecimal;

        return { matCost, laborCost, totalCost, suggestedPrice, hourlyRate: hourlyLaborRate, taxValue, commValue, marketValue, netProfitValue };
    };

    const { matCost, laborCost, totalCost, suggestedPrice, hourlyRate, taxValue, commValue, marketValue, netProfitValue } = calculateTotals();

    const onSubmit = async (data: FormData) => {
        try {
            // Check for duplicate product name
            const isDuplicate = products.some(p =>
                (p.name || '').toLowerCase() === data.name.toLowerCase() &&
                p.id !== (editingId || '')
            );

            if (isDuplicate) {
                alert("Já existe um produto cadastrado com este nome!");
                return;
            }

            const payload = {
                name: data.name,
                category: data.category,
                unit: data.unit,
                description: data.description,
                selling_price: suggestedPrice,
                profit_margin: data.profitMargin,
                tax_rate: data.taxRate,
                commission_rate: data.commissionRate,
                marketplace_rate: data.marketplaceRate,
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
        setValue('taxRate', item.tax_rate || 0);
        setValue('commissionRate', item.commission_rate || 0);
        setValue('marketplaceRate', item.marketplace_rate || 0);

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
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Produtos</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gerencie seu catálogo, receitas e processos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Novo Produto
                </button>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-lg outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all font-medium"
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
                        <div key={item.id} className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
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
                    <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                        <div className="px-10 py-6 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                                <p className="text-sm text-gray-500 mt-1">Configure todos os detalhes em um só lugar.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">

                                {/* SECTION: PRODUTO (INFO) */}
                                <section className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">1</div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900">Informações Básicas</h4>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                        <div className="md:col-span-6">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Nome do Produto</label>
                                            <input {...register('name')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-gray-900 text-xs" placeholder="Ex: Caderno Personalizado A5" />
                                            {errors.name && <p className="text-rose-500 text-[10px] mt-0.5 ml-1 font-bold">{errors.name.message}</p>}
                                        </div>
                                        <div className="md:col-span-4">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Categoria</label>
                                            <input {...register('category')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-gray-900 text-xs" placeholder="Ex: Papelaria" />
                                            {errors.category && <p className="text-rose-500 text-[10px] mt-0.5 ml-1 font-bold">{errors.category.message}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Unidade</label>
                                            <input {...register('unit')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-gray-900 text-xs text-center" placeholder="UN" />
                                        </div>
                                        <div className="md:col-span-12">
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Descrição</label>
                                            <input {...register('description')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-medium text-gray-900 text-xs" placeholder="Breve descrição do produto..." />
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION: MATERIAIS (RECEITA) */}
                                <section className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">2</div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">Material de Produção</h4>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => appendBom({ insumoId: '', qtyPerUnit: 1, appliesTo: 'PRODUCT' })} className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5 active:scale-95">
                                            <Plus className="w-3 h-3" /> Adicionar
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {bomFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-start p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all group/item">
                                                <div className="flex-1">
                                                    <label className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">Material</label>
                                                    <select {...register(`bomItems.${index}.insumoId`)} className="w-full bg-white h-7 px-2 rounded border border-gray-200 outline-none focus:border-indigo-500 font-medium text-xs">
                                                        <option value="">Selecione...</option>
                                                        {insumos.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-20">
                                                    <label className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">Qtd</label>
                                                    <input type="number" step="0.001" {...register(`bomItems.${index}.qtyPerUnit`, { valueAsNumber: true })} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 text-center font-bold text-xs" />
                                                </div>
                                                <div className="w-28">
                                                    <label className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">Aplicar</label>
                                                    <select {...register(`bomItems.${index}.appliesTo`)} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 font-medium text-[10px]">
                                                        <option value="PRODUCT">Produto</option>
                                                        <option value="PACKAGING">Embalagem</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => removeBom(index)} className="mt-4 text-gray-300 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {bomFields.length === 0 && (
                                            <div className="text-center py-2 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                                <Layers className="w-4 h-4 text-gray-300 mx-auto mb-0.5" />
                                                <p className="text-[10px] font-bold text-gray-400">Nenhum material</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* SECTION: PROCESSO */}
                                <section className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">3</div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">Processo de Produção</h4>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => appendStep({ name: '', setupMinutes: 0, unitMinutes: 0 })} className="text-[10px] font-bold text-white bg-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-1.5 active:scale-95">
                                            <Plus className="w-3 h-3" /> Adicionar
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {stepFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-start p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-white hover:shadow-sm transition-all group/item">
                                                <div className="flex-1">
                                                    <label className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">Nome da Etapa</label>
                                                    <input {...register(`steps.${index}.name`)} className="w-full bg-white h-7 px-2 rounded border border-gray-200 outline-none focus:border-indigo-500 font-medium text-xs" placeholder="Ex: Impressão" />
                                                </div>
                                                <div className="w-20">
                                                    <label className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">Minutos</label>
                                                    <input type="number" {...register(`steps.${index}.setupMinutes`, { valueAsNumber: true })} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 text-center font-bold text-xs" />
                                                </div>
                                                <div className="w-20">
                                                    <label className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">Unit</label>
                                                    <input type="number" {...register(`steps.${index}.unitMinutes`, { valueAsNumber: true })} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 text-center font-bold text-xs" />
                                                </div>
                                                <button type="button" onClick={() => removeStep(index)} className="mt-4 text-gray-300 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                        {stepFields.length === 0 && (
                                            <div className="text-center py-2 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                                <Clock className="w-4 h-4 text-gray-300 mx-auto mb-0.5" />
                                                <p className="text-[10px] font-bold text-gray-400">Nenhuma etapa</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className=" rounded-md overflow-hidden shadow-sm border border-gray-100 bg-white">
                                    <div className="px-3 py-1.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-[9px] shadow-sm">4</div>
                                            <div>
                                                <h4 className="text-[10px] font-bold">Precificação Final (Contábil)</h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-2">
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            <div className="py-1 px-1 bg-indigo-50/50 rounded border border-indigo-50">
                                                <p className="text-[7px] uppercase font-bold text-indigo-400 mb-0 tracking-wider truncate">Custo Direto</p>
                                                <p className="text-xs font-bold text-gray-900">R$ {totalCost.toFixed(2)}</p>
                                            </div>
                                            <div className="py-1 px-1 bg-rose-50 rounded border border-rose-100">
                                                <p className="text-[7px] uppercase font-bold text-rose-400 mb-0 tracking-wider truncate">Taxas/Imp</p>
                                                <p className="text-xs font-bold text-rose-600">R$ {(taxValue + commValue + marketValue).toFixed(2)}</p>
                                            </div>
                                            <div className="py-1 px-1 bg-emerald-50 rounded border border-emerald-100">
                                                <p className="text-[7px] uppercase font-bold text-emerald-500 mb-0 tracking-wider truncate">Lucro Real</p>
                                                <p className="text-xs font-bold text-emerald-700">R$ {netProfitValue.toFixed(2)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                                            <div className="border border-gray-100 rounded p-1 bg-gray-50">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Margem Líquida</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        className="flex-1 min-w-0 bg-transparent text-sm font-black text-indigo-600 outline-none border-none p-0"
                                                        {...register('profitMargin', { valueAsNumber: true })}
                                                    />
                                                    <span className="text-indigo-400 font-bold text-[10px]">%</span>
                                                </div>
                                            </div>
                                            <div className="border border-gray-100 rounded p-1 bg-gray-50">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Impostos (NF)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        className="flex-1 min-w-0 bg-transparent text-sm font-black text-gray-600 outline-none border-none p-0"
                                                        {...register('taxRate', { valueAsNumber: true })}
                                                    />
                                                    <span className="text-gray-400 font-bold text-[10px]">%</span>
                                                </div>
                                            </div>
                                            <div className="border border-gray-100 rounded p-1 bg-gray-50">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Taxas (Cartão)</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        className="flex-1 min-w-0 bg-transparent text-sm font-black text-gray-600 outline-none border-none p-0"
                                                        {...register('commissionRate', { valueAsNumber: true })}
                                                    />
                                                    <span className="text-gray-400 font-bold text-[10px]">%</span>
                                                </div>
                                            </div>
                                            <div className="border border-gray-100 rounded p-1 bg-gray-50">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Marketplace</span>
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        className="flex-1 min-w-0 bg-transparent text-sm font-black text-gray-600 outline-none border-none p-0"
                                                        {...register('marketplaceRate', { valueAsNumber: true })}
                                                    />
                                                    <span className="text-gray-400 font-bold text-[10px]">%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 bg-indigo-600 p-2 rounded-lg shadow-sm shadow-indigo-200 text-center relative overflow-hidden flex flex-col items-center justify-center group cursor-default">
                                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                                            <p className="text-[8px] uppercase tracking-[0.2em] text-indigo-100 mb-0 font-bold relative z-10">Preço Sugerido</p>
                                            <p className="text-xl font-black text-white tracking-tight relative z-10 group-hover:scale-105 transition-transform duration-300">
                                                R$ {suggestedPrice.toFixed(2)}
                                            </p>
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
                                <button type="button" onClick={handleCloseModal} className="px-6 py-3 bg-white border border-gray-200 rounded-md font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancelar</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-indigo-600 text-white rounded-md font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-70 flex items-center gap-2">
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
