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
    Box,
    Printer
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
    printingQty: z.number().min(0).default(0),
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
            printingQty: 0,
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

        // 3. Printing Cost
        const printingCostTotal = (watch('printingQty') || 0) * (storeConfig.printing_cost || 0);

        const totalCost = matCost + laborCost + fixedCostShare + printingCostTotal;

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
                steps: data.steps,
                printing_qty: data.printingQty
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
        setValue('printingQty', item.printing_qty || 0);

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
                        <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{editingId ? 'Editar Produto' : 'Novo Produto'}</h3>
                            </div>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">

                                {/* SECTION: PRODUTO (INFO) */}
                                <section className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-1.5 border-b border-gray-50 pb-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">1</div>
                                        <h4 className="text-sm font-bold text-gray-900">Informações Básicas</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
                                        <div className="md:col-span-6 space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 ml-1">Nome</label>
                                            <input {...register('name')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-900 text-xs shadow-sm" placeholder="Ex: Caderno" />
                                            {errors.name && <p className="text-rose-500 text-[10px] mt-0.5 font-medium">{errors.name.message}</p>}
                                        </div>
                                        <div className="md:col-span-4 space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 ml-1">Categoria</label>
                                            <input {...register('category')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-900 text-xs shadow-sm" placeholder="Ex: Papelaria" />
                                            {errors.category && <p className="text-rose-500 text-[10px] mt-0.5 font-medium">{errors.category.message}</p>}
                                        </div>
                                        <div className="md:col-span-2 space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 ml-1">Unidade</label>
                                            <input {...register('unit')} className="w-full px-2 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-900 text-xs text-center shadow-sm" placeholder="UN" />
                                        </div>
                                        <div className="md:col-span-12 space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 ml-1">Descrição</label>
                                            <input {...register('description')} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-900 text-xs shadow-sm" placeholder="Descrição opcional..." />
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION: CUSTOS EXTRAS (IMPRESSÃO) */}
                                <section className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-1.5 border-b border-gray-50 pb-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                            <Printer className="w-3 h-3" />
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900">Custos de Impressão</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 ml-1">Quantidade de Impressões</label>
                                            <input type="number" step="1" {...register('printingQty', { valueAsNumber: true })} className="w-full px-3 h-8 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-purple-500 transition-all font-medium text-gray-900 text-xs shadow-sm" placeholder="0" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <label className="text-[10px] font-semibold text-gray-500 ml-1">Custo Unitário (Config)</label>
                                            <div className="w-full px-3 h-8 bg-purple-50 border border-purple-100 rounded-lg flex items-center text-xs font-bold text-purple-700">
                                                R$ {Number(storeConfig.printing_cost || 0).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* SECTION: MATERIAIS (RECEITA) */}
                                <section className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-1.5 border-b border-gray-50 pb-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">2</div>
                                            <h4 className="text-sm font-bold text-gray-900">Material de Produção</h4>
                                        </div>
                                        <button type="button" onClick={() => appendBom({ insumoId: '', qtyPerUnit: 1, appliesTo: 'PRODUCT' })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1.5 active:scale-95 border border-indigo-200/50">
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        {bomFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-center p-1.5 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all group/item">
                                                <div className="flex-1">
                                                    <select {...register(`bomItems.${index}.insumoId`)} className="w-full bg-white h-7 px-2 rounded border border-gray-200 outline-none focus:border-indigo-500 font-medium text-xs text-gray-700 shadow-sm">
                                                        <option value="">Selecione...</option>
                                                        {insumos.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                                                    </select>
                                                </div>
                                                <div className="w-20">
                                                    <input type="number" step="0.001" {...register(`bomItems.${index}.qtyPerUnit`, { valueAsNumber: true })} className="w-full bg-white h-7 px-2 rounded border border-gray-200 outline-none focus:border-indigo-500 text-center font-bold text-xs text-gray-700 shadow-sm" placeholder="Qtd" />
                                                </div>
                                                <div className="w-24">
                                                    <select {...register(`bomItems.${index}.appliesTo`)} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 font-medium text-[10px] text-gray-700 shadow-sm">
                                                        <option value="PRODUCT">Produto</option>
                                                        <option value="PACKAGING">Emb.</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => removeBom(index)} className="text-gray-300 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                        {bomFields.length === 0 && (
                                            <div className="text-center py-1.5 border-dashed border border-gray-200 rounded-lg bg-gray-50/30">
                                                <p className="text-[10px] font-medium text-gray-400">Nenhum material</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                {/* SECTION: PROCESSO */}
                                <section className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-1.5 border-b border-gray-50 pb-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">3</div>
                                            <h4 className="text-sm font-bold text-gray-900">Processo de Produção</h4>
                                        </div>
                                        <button type="button" onClick={() => appendStep({ name: '', setupMinutes: 0, unitMinutes: 0 })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all flex items-center gap-1.5 active:scale-95 border border-indigo-200/50">
                                            <Plus className="w-3 h-3" /> Add
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        {stepFields.map((field, index) => (
                                            <div key={field.id} className="flex gap-2 items-center p-1.5 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-indigo-200 hover:bg-white transition-all group/item">
                                                <div className="flex-1">
                                                    <input {...register(`steps.${index}.name`)} className="w-full bg-white h-7 px-2 rounded border border-gray-200 outline-none focus:border-indigo-500 font-medium text-xs text-gray-700 shadow-sm" placeholder="Nome da Etapa" />
                                                </div>
                                                <div className="w-20">
                                                    <input type="number" {...register(`steps.${index}.setupMinutes`, { valueAsNumber: true })} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 text-center font-bold text-xs text-gray-700 shadow-sm" placeholder="Setup" />
                                                </div>
                                                <div className="w-20">
                                                    <input type="number" {...register(`steps.${index}.unitMinutes`, { valueAsNumber: true })} className="w-full bg-white h-7 px-1 rounded border border-gray-200 outline-none focus:border-indigo-500 text-center font-bold text-xs text-gray-700 shadow-sm" placeholder="Unit" />
                                                </div>
                                                <button type="button" onClick={() => removeStep(index)} className="text-gray-300 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        ))}
                                        {stepFields.length === 0 && (
                                            <div className="text-center py-1.5 border-dashed border border-gray-200 rounded-lg bg-gray-50/30">
                                                <p className="text-[10px] font-medium text-gray-400">Nenhuma etapa</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <div className="flex items-center gap-3 mb-1.5 border-b border-gray-50 pb-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">4</div>
                                        <h4 className="text-sm font-bold text-gray-900">Precificação Final</h4>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-2">
                                        {/* Left Column: Cost Summary + Inputs */}
                                        <div className="flex-1 space-y-3">
                                            {/* Cost Summary Cards */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                                    <p className="text-[9px] uppercase font-bold text-indigo-400 mb-0.5 tracking-wider">Direto</p>
                                                    <p className="text-sm font-bold text-indigo-900">R$ {totalCost.toFixed(2)}</p>
                                                </div>
                                                <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-100">
                                                    <p className="text-[9px] uppercase font-bold text-rose-400 mb-0.5 tracking-wider">Imp/Tax</p>
                                                    <p className="text-sm font-bold text-rose-900">R$ {(taxValue + commValue + marketValue).toFixed(2)}</p>
                                                </div>
                                                <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                                                    <p className="text-[9px] uppercase font-bold text-emerald-500 mb-0.5 tracking-wider">Lucro</p>
                                                    <p className="text-sm font-bold text-emerald-900">R$ {netProfitValue.toFixed(2)}</p>
                                                </div>
                                            </div>

                                            {/* Input Variables */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="border border-gray-200 rounded-lg p-2 hover:border-indigo-300 transition-colors bg-white">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Margem</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <input type="number" className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none p-0" {...register('profitMargin', { valueAsNumber: true })} />
                                                        <span className="text-gray-400 font-bold text-[9px]">%</span>
                                                    </div>
                                                </div>
                                                <div className="border border-gray-200 rounded-lg p-2 hover:border-indigo-300 transition-colors bg-white">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Imp.</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <input type="number" className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none p-0" {...register('taxRate', { valueAsNumber: true })} />
                                                        <span className="text-gray-400 font-bold text-[9px]">%</span>
                                                    </div>
                                                </div>
                                                <div className="border border-gray-200 rounded-lg p-2 hover:border-indigo-300 transition-colors bg-white">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Com.</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <input type="number" className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none p-0" {...register('commissionRate', { valueAsNumber: true })} />
                                                        <span className="text-gray-400 font-bold text-[9px]">%</span>
                                                    </div>
                                                </div>
                                                <div className="border border-gray-200 rounded-lg p-2 hover:border-indigo-300 transition-colors bg-white">
                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Mkt</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <input type="number" className="w-full bg-transparent text-sm font-bold text-gray-900 outline-none p-0" {...register('marketplaceRate', { valueAsNumber: true })} />
                                                        <span className="text-gray-400 font-bold text-[9px]">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column: Final Price Display */}
                                        <div className="lg:w-1/3 relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 flex flex-col items-center justify-center text-center shadow-lg group cursor-default min-h-[100px]">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <Package className="w-20 h-20 text-white" />
                                            </div>
                                            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-0.5 relative z-10">Preço Sugerido</p>
                                            <div className="relative z-10 flex items-baseline gap-1">
                                                <span className="text-base font-medium text-gray-400">R$</span>
                                                <span className="text-3xl font-black text-white tracking-tight shadow-black drop-shadow-md">
                                                    {suggestedPrice.toFixed(2)}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-gray-500 mt-1 relative z-10 leading-tight">Margem: {(watchedMargin || 0)}%</p>
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
