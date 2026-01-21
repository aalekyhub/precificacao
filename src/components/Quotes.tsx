import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  X,
  User,
  Package,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { Quote, QuoteStatus } from '../types';
import { useStoreData } from '../hooks/useStoreData';

const Quotes: React.FC = () => {
  const { quotes, products, contacts, materials, fixedCosts, storeConfig, addQuote, updateQuote, deleteQuote } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState<Partial<Quote>>({
    customer_id: '',
    items: [],
    extra_costs: 0,
    discount: 0,
    status: 'draft',
    notes: ''
  });
  const [printQuote, setPrintQuote] = useState<Quote | null>(null);

  const inkCostPerPage = storeConfig.inkKitCost / storeConfig.inkYieldPages;
  const totalFixedMonthly = useMemo(() => {
    return fixedCosts.reduce((acc, fc) => {
      if (fc.periodicity === 'Anual') return acc + (fc.value / 12);
      if (fc.periodicity === 'Semestral') return acc + (fc.value / 6);
      if (fc.periodicity === 'Trimestral') return acc + (fc.value / 3);
      return acc + fc.value;
    }, 0);
  }, [fixedCosts]);
  const fixedCostPerHour = totalFixedMonthly / ((storeConfig.work_days_per_month * storeConfig.work_hours_per_day) || 160);

  // Helper to estimate cost if product doesn't have a fixed price
  const calculateEstimatedPrice = (prod: any) => {
    // If product has a defined selling price, use it
    if (prod.sellingPrice && prod.sellingPrice > 0) return prod.sellingPrice;

    // Fallback to on-the-fly calculation
    const matCost = (prod.bomItems || []).reduce((acc: number, pm: any) => {
      const m = materials.find((mat: any) => mat.id === pm.insumoId);
      if (!m) return acc;
      return acc + (m.price * pm.qtyPerUnit);
    }, 0);

    // Labor
    const laborMinutes = (prod.steps || []).reduce((acc: number, s: any) => acc + s.setupMinutes + s.unitMinutes, 0);
    const hourlyRate = storeConfig.pro_labore / ((storeConfig.work_days_per_month * storeConfig.work_hours_per_day) || 160);
    const laborCost = (laborMinutes / 60) * hourlyRate;

    const totalCost = matCost + laborCost;
    const margin = (prod.profitMargin || 50) / 100;
    return margin >= 1 ? totalCost * 2 : totalCost / (1 - margin);
  };

  const quoteTotal = useMemo(() => {
    const subtotal = (newQuote.items || []).reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    return subtotal + (Number(newQuote.extra_costs) || 0) - (Number(newQuote.discount) || 0);
  }, [newQuote.items, newQuote.extra_costs, newQuote.discount]);

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const price = calculateEstimatedPrice(product);
    setNewQuote({
      ...newQuote,
      items: [...(newQuote.items || []), {
        id: Math.random().toString(36).substr(2, 9),
        name: product.name,
        product_id: productId,
        quantity: 1,
        unit_price: price,
        total_price: price
      }]
    });
  };

  const handleSave = async () => {
    if (!newQuote.customer_id || (newQuote.items || []).length === 0) return;
    const quote: Quote = {
      id: '',
      created_at: new Date().toISOString(),
      date: new Date().toISOString(),
      items: newQuote.items || [],
      customer_id: newQuote.customer_id || '',
      clientId: newQuote.customer_id || '',
      status: 'draft',
      total_value: quoteTotal,
      extra_costs: newQuote.extra_costs || 0,
      discount: newQuote.discount || 0,
      notes: newQuote.notes || ''
    };
    await addQuote(quote as Quote);
    setIsModalOpen(false);
    setNewQuote({ customer_id: '', items: [], extra_costs: 0, discount: 0, status: 'draft', notes: '' });
  };

  const handleDataUpdate = async () => {
    // Implement update logic if needed
    // validated if there is an ID
    if (newQuote.id) {
      // await updateQuote(newQuote as Quote);
    }
  }

  const handlePrint = (quote: Quote) => {
    setPrintQuote(quote);
    // Submit a small timeout to allow state to update and render the print view
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusLabel = (status: string) => {
    const map: any = { 'draft': 'Pendente', 'approved': 'Aprovado', 'completed': 'Concluído', 'canceled': 'Cancelado' };
    return map[status] || status;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-600';
      case 'draft': return 'bg-orange-100 text-orange-600';
      case 'completed': return 'bg-blue-100 text-blue-600';
      case 'canceled': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Orçamentos</h2>
            <p className="text-gray-500 mt-2 font-medium">Transforme cotações em vendas de sucesso.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Gerar Orçamento
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data / Ref</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-32 text-center text-gray-400 font-medium">Sem orçamentos realizados ainda.</td>
                  </tr>
                ) : (
                  quotes.map(quote => {
                    const client = contacts.find(c => c.id === quote.customer_id || c.id === quote.clientId);
                    return (
                      <tr key={quote.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <span className="font-bold text-gray-800 block">{new Date(quote.created_at || quote.date || '').toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">ID: {(quote.id || '').split('-')[0].toUpperCase()}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="font-bold text-gray-700">{client?.name || 'Cliente Removido'}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-rose-600 font-black text-lg">R$ {(quote.total_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                            {getStatusLabel(quote.status)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => deleteQuote(quote.id)} className="p-3 text-gray-300 hover:text-rose-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                            <button onClick={() => handlePrint(quote)} className="p-3 text-gray-300 hover:text-indigo-600 transition-all" title="Imprimir / PDF"><Printer className="w-5 h-5" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xl">
            <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh]">
              {/* Resumo lateral */}
              <div className="w-full md:w-[35%] bg-gray-900 p-12 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-4xl font-bold mb-8">Resumo do Orçamento</h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Estimado</p>
                      <p className="text-5xl font-black text-rose-500">R$ {quoteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Itens inclusos: {(newQuote.items || []).length}
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} className="w-full py-5 bg-rose-500 rounded-2xl font-black text-xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">
                  Finalizar e Salvar
                </button>
              </div>

              {/* Editor de Orçamento */}
              <div className="w-full md:w-[65%] p-12 overflow-y-auto custom-scrollbar bg-white">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-3 rounded-2xl text-rose-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Configurar Cotação</h4>
                  </div>
                  <button onClick={() => setIsModalOpen(false)}><X className="w-8 h-8 text-gray-300" /></button>
                </div>

                <div className="space-y-10">
                  {/* Seleção de Cliente */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><User className="w-3 h-3" /> Selecionar Cliente</label>
                    <select
                      className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
                      value={newQuote.customer_id}
                      onChange={(e) => setNewQuote({ ...newQuote, customer_id: e.target.value })}
                    >
                      <option value="">Escolha um cliente da agenda...</option>
                      {contacts.filter(c => c.type === 'Cliente').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Adição de Itens */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Package className="w-3 h-3" /> Adicionar Produtos</label>
                      <select
                        className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg outline-none uppercase tracking-wide cursor-pointer hover:bg-indigo-100 transition-colors"
                        onChange={(e) => handleAddItem(e.target.value)}
                        value=""
                      >
                        <option value="">+ Selecionar</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      {newQuote.items?.map((item, idx) => {
                        const prod = products.find(p => p.id === item.product_id);
                        return (
                          <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <span className="flex-1 font-bold text-gray-700">{prod?.name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-center text-sm font-medium text-gray-700 outline-none focus:border-rose-500 transition-all"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = [...(newQuote.items || [])];
                                  updated[idx].quantity = parseInt(e.target.value) || 1;
                                  setNewQuote({ ...newQuote, items: updated });
                                }}
                              />
                              <span className="text-[10px] font-bold text-gray-400">UN</span>
                            </div>
                            <span className="font-black text-rose-600 min-w-[80px] text-right">R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                            <button onClick={() => {
                              const updated = [...(newQuote.items || [])].filter((_, i) => i !== idx);
                              setNewQuote({ ...newQuote, items: updated });
                            }}><X className="w-4 h-4 text-gray-300" /></button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Ajustes Financeiros */}
                  <div className="grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Custos Extras</label>
                      <input
                        type="number"
                        className="w-full text-sm font-medium text-gray-700 px-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm"
                        value={newQuote.extraCosts}
                        onChange={(e) => setNewQuote({ ...newQuote, extraCosts: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold text-green-600 uppercase tracking-wider block">Desconto</label>
                      <input
                        type="number"
                        className="w-full text-sm font-medium text-green-700 px-4 py-2.5 bg-white border border-green-200 rounded-xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all shadow-sm"
                        value={newQuote.discount}
                        onChange={(e) => setNewQuote({ ...newQuote, discount: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- PRINT LAYOUT --- */}
      {printQuote && (
        <div className="hidden print:block p-8 max-w-4xl mx-auto bg-white text-gray-900" id="print-area">
          {/* Header */}
          <div className="flex justify-between items-center mb-12 border-b-2 border-gray-100 pb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ORÇAMENTO</h1>
              <p className="text-sm text-gray-500 mt-1">Ref: #{printQuote.id.split('-')[0].toUpperCase()}</p>
              <p className="text-sm text-gray-500">Data: {new Date(printQuote.date).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-gray-900">Sua Empresa</p>
              <p className="text-sm text-gray-500">contato@empresa.com</p>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-12 bg-gray-50/50 p-6 rounded-lg border border-gray-100">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Cliente</p>
            <p className="text-xl font-bold text-gray-800">{contacts.find(c => c.id === printQuote.customer_id || c.id === printQuote.clientId)?.name}</p>
            <p className="text-sm text-gray-500">{contacts.find(c => c.id === printQuote.customer_id || c.id === printQuote.clientId)?.email}</p>
            <p className="text-sm text-gray-500">{contacts.find(c => c.id === printQuote.customer_id || c.id === printQuote.clientId)?.phone}</p>
          </div>

          {/* Items Table */}
          <table className="w-full mb-12">
            <thead>
              <tr className="border-b-2 border-gray-900">
                <th className="text-left py-3 text-xs font-bold uppercase tracking-wider">Item</th>
                <th className="text-center py-3 text-xs font-bold uppercase tracking-wider">Qtd</th>
                <th className="text-right py-3 text-xs font-bold uppercase tracking-wider">Preço Unit.</th>
                <th className="text-right py-3 text-xs font-bold uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {printQuote.items.map((item, idx) => {
                const product = products.find(p => p.id === item.product_id);
                return (
                  <tr key={idx}>
                    <td className="py-4 text-sm font-medium">{product?.name || item.name || 'Item Removido'}</td>
                    <td className="py-4 text-center text-sm">{item.quantity}</td>
                    <td className="py-4 text-right text-sm">R$ {item.unit_price.toFixed(2)}</td>
                    <td className="py-4 text-right text-sm font-bold">R$ {(item.quantity * item.unit_price).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>R$ {((printQuote.items || []).reduce((acc, i) => acc + (i.unit_price * i.quantity), 0)).toFixed(2)}</span>
              </div>
              {printQuote.extra_costs && printQuote.extra_costs > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Custos Extras</span>
                  <span>+ R$ {printQuote.extra_costs.toFixed(2)}</span>
                </div>
              )}
              {printQuote.discount && printQuote.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>- R$ {printQuote.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t-2 border-gray-900 pt-3">
                <span>Total</span>
                <span>R$ {printQuote.total_value.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            <p>Este orçamento é válido por 15 dias. Obrigado pela preferência!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Quotes;
