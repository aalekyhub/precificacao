
import React, { useState, useMemo, useEffect } from 'react';
import {
  Package,
  Plus,
  Calculator,
  ChevronRight,
  BrainCircuit,
  Trash2,
  X,
  Info,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Clock,
  Printer,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { getPricingAdvice } from '../services/geminiService';
import { Product, Material, CalculationResult, Unit, StoreConfig, FixedCost } from '../types';
import { calculateProductPrice } from '../utils/calculations';

interface ProductsProps {
  products: Product[];
  materials: Material[];
  fixedCosts: FixedCost[];
  storeConfig: StoreConfig;
  onAdd: (p: Product) => void;
  onDelete: (id: string) => void;
}

const Products: React.FC<ProductsProps> = ({ products, materials, fixedCosts, storeConfig, onAdd, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    laborHours: 0,
    laborRate: storeConfig.laborRateDefault,
    markup: storeConfig.defaultMarkup,
    fixedCosts: 0,
    materials: [],
    printedPages: 0
  });

  const inkCostPerPage = storeConfig.inkKitCost / storeConfig.inkYieldPages;

  const totalFixedMonthly = useMemo(() => {
    return fixedCosts.reduce((acc, fc) => {
      if (fc.periodicity === 'Anual') return acc + (fc.value / 12);
      if (fc.periodicity === 'Semestral') return acc + (fc.value / 6);
      if (fc.periodicity === 'Trimestral') return acc + (fc.value / 3);
      return acc + fc.value;
    }, 0);
  }, [fixedCosts]);


  const fixedCostPerHour = totalFixedMonthly / (storeConfig.monthlyWorkingHours || 1);

  // Use the utility function for display in the grid
  const getProductPrice = (prod: Product) => {
    const result = calculateProductPrice(prod, materials, fixedCostPerHour, inkCostPerPage);
    return result.suggestedPrice;
  };

  const currentResult = useMemo(() => {
    return calculateProductPrice(newProduct, materials, fixedCostPerHour, inkCostPerPage);
  }, [newProduct, materials, inkCostPerPage, fixedCostPerHour]);

  const handleSave = () => {
    if (!newProduct.name) return;
    const prod: Product = {
      ...newProduct as Product,
      id: Math.random().toString(36).substr(2, 9),
      materials: newProduct.materials || [],
      fixedCosts: currentResult.fixedCostShare
    };
    onAdd(prod);
    setIsModalOpen(false);
    setNewProduct({ name: '', laborHours: 0, laborRate: storeConfig.laborRateDefault, markup: storeConfig.defaultMarkup, fixedCosts: 0, materials: [], printedPages: 0 });
  };

  const addMaterialToProduct = (matId: string) => {
    const existing = newProduct.materials?.find(m => m.materialId === matId);
    if (existing) return;
    setNewProduct({
      ...newProduct,
      materials: [...(newProduct.materials || []), { materialId: matId, quantityUsed: 1 }]
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Catálogo de Produtos</h2>
          <p className="text-gray-500 mt-1 font-medium">Transforme sua criatividade em lucro sustentável.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-500 text-white px-8 py-4 rounded-[1.5rem] font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(prod => (
          <div key={prod.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all duration-500 p-8">
            <h3 className="text-2xl font-bold text-gray-900 font-serif mb-4">{prod.name}</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Preço Sugerido</p>
                <p className="text-2xl font-black text-rose-600">
                  R$ {getProductPrice(prod).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button onClick={() => onDelete(prod.id)} className="p-3 text-gray-300 hover:text-rose-500 transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh]">

            {/* Painel Esquerdo (Dark) */}
            <div className="w-full md:w-[40%] bg-[#1a1f2c] p-12 text-white flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-rose-500/20">
                  <Calculator className="w-3.5 h-3.5" /> CALCULADORA INTELIGENTE
                </div>
                <h3 className="text-5xl font-bold font-serif mb-4 tracking-tight">Novo Produto</h3>

                <div className="space-y-10 mt-12">
                  <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-4">PREÇO FINAL ESTIMADO</p>
                    <p className="text-7xl font-black text-white font-serif tracking-tighter">
                      R$ {currentResult.suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="mt-8 flex items-center gap-3 text-rose-400 text-sm font-black">
                      <TrendingUp className="w-4 h-4" />
                      Lucro Líquido: R$ {currentResult.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">CUSTO FIXO (ABS)</p>
                      <p className="text-xl font-bold text-white">R$ {currentResult.fixedCostShare.toFixed(2)}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">MÃO DE OBRA</p>
                      <p className="text-xl font-bold text-white">R$ {currentResult.laborCost.toFixed(2)}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">TINTA/IMPRESSÃO</p>
                      <p className="text-xl font-bold text-white">R$ {currentResult.printingCost.toFixed(2)}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">MATERIAIS</p>
                      <p className="text-xl font-bold text-white">R$ {currentResult.materialCost.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-8">
                <ShieldCheck className="w-4 h-4" />
                Custo de tinta e custos fixos incluídos automaticamente
              </div>
            </div>

            {/* Painel Direito (Light) */}
            <div className="w-full md:w-[60%] p-14 overflow-y-auto bg-white custom-scrollbar">
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-all">
                  <X className="w-7 h-7" />
                </button>
              </div>

              <div className="space-y-12">
                <section className="space-y-6">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">INFORMAÇÕES BÁSICAS</h4>
                  <input
                    type="text"
                    placeholder="NOME DO PRODUTO"
                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-8 py-5 outline-none focus:bg-white focus:border-rose-500 transition-all font-bold text-gray-800 text-lg shadow-inner"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </section>

                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">MATERIAIS</h4>
                    <select
                      className="text-[10px] font-black uppercase tracking-widest bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-2"
                      onChange={(e) => addMaterialToProduct(e.target.value)}
                      value=""
                    >
                      <option value="" disabled>+ Adicionar Material</option>
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    {newProduct.materials?.map((pm, idx) => {
                      const m = materials.find(mat => mat.id === pm.materialId);
                      return (
                        <div key={pm.materialId} className="flex items-center gap-4 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
                          <span className="flex-1 font-bold text-gray-700">{m?.name}</span>
                          <input
                            type="number"
                            className="w-20 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center font-bold"
                            value={pm.quantityUsed}
                            onChange={(e) => {
                              const updated = [...(newProduct.materials || [])];
                              updated[idx].quantityUsed = parseFloat(e.target.value) || 0;
                              setNewProduct({ ...newProduct, materials: updated });
                            }}
                          />
                          <button onClick={() => setNewProduct({ ...newProduct, materials: newProduct.materials?.filter(i => i.materialId !== pm.materialId) })}><X className="w-4 h-4 text-gray-300" /></button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Clock className="w-3 h-3" /> TEMPO DE PRODUÇÃO (HRS)
                    </label>
                    <input
                      type="number" step="0.1"
                      className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 font-bold"
                      value={newProduct.laborHours}
                      onChange={(e) => setNewProduct({ ...newProduct, laborHours: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <Printer className="w-3 h-3" /> PÁGINAS IMPRESSAS
                    </label>
                    <input
                      type="number"
                      className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 font-bold"
                      value={newProduct.printedPages}
                      onChange={(e) => setNewProduct({ ...newProduct, printedPages: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </section>

                <section className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">MARGEM DE LUCRO (%)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-6 py-4 outline-none focus:border-rose-500 font-bold"
                    value={newProduct.markup}
                    onChange={(e) => setNewProduct({ ...newProduct, markup: parseFloat(e.target.value) || 0 })}
                  />
                </section>

                <div className="bg-indigo-50 p-6 rounded-[2rem] border-2 border-indigo-100/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-500 p-2 rounded-xl text-white">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Custo Fixo (Absorção)</p>
                      <p className="text-xs text-indigo-400 font-medium">Preenchido automaticamente com base no tempo</p>
                    </div>
                  </div>
                  <p className="text-2xl font-black text-indigo-600">R$ {currentResult.fixedCostShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!newProduct.name}
                  className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black text-xl hover:bg-rose-600 shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  Salvar Produto e Finalizar
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
