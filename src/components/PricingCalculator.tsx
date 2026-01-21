import React, { useState, useEffect } from 'react';
import { api, Produto, Canal, FixosMensais } from '../api/client';
import { calculatePricing, calculateMaterialCost, calculateOverhead, CostBreakdown } from '../utils/pricing';
import {
    Calculator,
    Check,
    AlertTriangle,
    DollarSign,
    PieChart
} from 'lucide-react';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';



const PricingCalculator: React.FC = () => {
    const [products, setProducts] = useState<Produto[]>([]);
    const [channels, setChannels] = useState<Canal[]>([]);
    const [fixedCosts, setFixedCosts] = useState<FixosMensais | null>(null);

    // Inputs
    const [selectedProduct, setSelectedProduct] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('');
    const [quantity, setQuantity] = useState(10);
    const [margin, setMargin] = useState(0.20); // 20%

    // Result
    const [result, setResult] = useState<CostBreakdown | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [p, c, f] = await Promise.all([
                api.get<Produto[]>('/produtos'),
                api.get<Canal[]>('/canais'),
                api.get<FixosMensais[]>('/fixos')
            ]);
            setProducts(p);
            setChannels(c);
            // Get latest fixed cost
            if (f.length > 0) setFixedCosts(f[0]);
        } catch (e) { console.error(e); }
    };

    const handleCalculate = async () => {
        if (!selectedProduct || !selectedChannel || !fixedCosts) return;

        setLoading(true);
        try {
            // Find full objects
            const product = products.find(p => p.id === selectedProduct);
            const channel = channels.find(c => c.id === selectedChannel);

            if (!product || !channel) return;

            // 1. Calculate Materials Cost
            let materialCost = 0;
            let packagingCost = 0;

            if (product.bomItems) {
                for (const item of product.bomItems) {
                    // Insumo data might be nested or we need to ensure it's loaded. 
                    // The get products API usually includes it.
                    if (item.insumo) {
                        const cost = calculateMaterialCost(
                            Number(item.qtyPerUnit) * quantity,
                            Number(item.insumo.unitCost),
                            Number(item.insumo.lossPct)
                        );
                        if (item.appliesTo === 'PACKAGING') packagingCost += cost;
                        else materialCost += cost;
                    }
                }
            }

            // 2. Calculate Overhead
            let totalSetupMins = 0;
            let totalUnitMins = 0;
            if (product.steps) {
                for (const step of product.steps) {
                    totalSetupMins += Number(step.setupMinutes);
                    totalUnitMins += Number(step.unitMinutes);
                }
            }

            const fixedCostPerHour = Number(fixedCosts.totalFixedCosts) / Number(fixedCosts.productiveHours);
            const overheadCost = calculateOverhead(totalSetupMins, totalUnitMins, quantity, fixedCostPerHour);
            const directLaborCost = 0; // Configurable later

            // 3. Formula
            const calcResult = calculatePricing({
                materialCost: materialCost / quantity,
                packagingCost: packagingCost / quantity,
                laborCost: directLaborCost / quantity,
                setupCost: 0,
                overheadCost: overheadCost / quantity,
                channelFixedFee: Number(channel.fixedFeePerOrder) / quantity,
                channelPercentTotal: Number(channel.percentFeesTotal),
                desiredMargin: Number(margin)
            });

            setResult(calcResult);

        } catch (e) {
            console.error(e);
            alert('Erro ao calcular');
        } finally {
            setLoading(false);
        }
    };

    const chartData = result ? [
        { name: 'Custos Variáveis', value: result.variableCosts, color: '#3B82F6' }, // Blue
        { name: 'Custos Fixos (Rateio)', value: result.fixedCostsAllocated, color: '#8B5CF6' }, // Purple
        { name: 'Taxas Canal', value: (result.suggestedPrice * result.channelPercentFee) + result.channelFixedFee, color: '#F59E0B' }, // Amber
        { name: 'Margem Lucro', value: result.suggestedPrice * result.desiredMargin, color: '#10B981' }, // Emerald
    ] : [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Calculadora de Preços</h2>
                    <p className="text-gray-500 mt-2 font-medium">Simule cenários e encontre o preço ideal de venda.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-50/50 h-fit">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-indigo-600" /> Parâmetros
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Produto</label>
                            <select
                                className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                value={selectedProduct}
                                onChange={e => setSelectedProduct(e.target.value)}
                            >
                                <option value="">Selecione um produto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Canal de Venda</label>
                            <select
                                className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                value={selectedChannel}
                                onChange={e => setSelectedChannel(e.target.value)}
                            >
                                <option value="">Selecione um canal...</option>
                                {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Tamanho do Lote (Qtd)</label>
                            <input
                                type="number"
                                className="input-standard w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                value={quantity}
                                onChange={e => setQuantity(Number(e.target.value))}
                            />
                            <p className="text-[10px] text-gray-400 mt-2">A quantidade dilui o tempo de setup.</p>
                        </div>

                        <div>
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Margem de Lucro Desejada (%)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range" min="5" max="100"
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    value={margin * 100}
                                    onChange={e => setMargin(Number(e.target.value) / 100)}
                                />
                                <span className="font-bold w-12 text-right">{(margin * 100).toFixed(0)}%</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            disabled={loading || !selectedProduct || !selectedChannel}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Calculando...' : 'Calcular Preço'}
                        </button>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2 space-y-8">
                    {result ? (
                        <>
                            {/* Main Price Card */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10 opacity-10"><DollarSign className="w-64 h-64" /></div>
                                <div className="relative z-10">
                                    <h4 className="text-gray-400 font-medium text-lg mb-2">Preço de Venda Sugerido (Unitário)</h4>
                                    <div className="text-6xl md:text-7xl font-black tracking-tighter mb-8">
                                        R$ {result.suggestedPrice.toFixed(2)}
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Custos Variáveis</span>
                                            <span className="font-bold text-xl">R$ {result.variableCosts.toFixed(2)}</span>
                                        </div>
                                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                                            <span className="block text-xs text-gray-400 uppercase tracking-wider">Lucro Líquido</span>
                                            <span className="font-bold text-xl text-emerald-400">R$ {(result.suggestedPrice * result.desiredMargin).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <PieChart className="w-5 h-5 text-gray-400" />
                                        Composição do Preço
                                    </h4>
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RePie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </RePie>
                                            <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                                    <h4 className="font-bold text-gray-900 mb-6">Detalhamento de Custos</h4>

                                    <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-600">Materiais & Embalagem</span>
                                        <span className="font-bold text-gray-900">R$ {(result.materialCost + result.packagingCost).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-purple-50/50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-600">Rateio Custos Fixos</span>
                                        <span className="font-bold text-gray-900">R$ {result.fixedCostsAllocated.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-xl">
                                        <span className="text-sm font-medium text-gray-600">Taxas Marketplace</span>
                                        <span className="font-bold text-gray-900">R$ {((result.suggestedPrice * result.channelPercentFee) + result.channelFixedFee).toFixed(2)}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t text-sm text-gray-400 text-center">
                                        Valores calculados por unidade baseados no lote de {quantity} itens.
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-[3rem] border border-gray-200 border-dashed p-10 min-h-[400px]">
                            <Calculator className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Preencha os parâmetros para calcular</p>
                            <p className="text-sm opacity-60 max-w-xs text-center mt-2">Selecione produto, canal e margem para visualizar a sugestão de preço.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PricingCalculator;
