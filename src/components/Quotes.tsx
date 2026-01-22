import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  X,
  User,
  Package,
  CheckCircle2,
  Printer,
  Pencil,
  DollarSign
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

  // ... (keep cost logic unchanged) ...
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

  const calculateEstimatedPrice = (prod: any) => {
    if (prod.sellingPrice && prod.sellingPrice > 0) return prod.sellingPrice;
    const matCost = (prod.bomItems || []).reduce((acc: number, pm: any) => {
      const m = materials.find((mat: any) => mat.id === pm.insumoId);
      if (!m) return acc;
      return acc + (m.price * pm.qtyPerUnit);
    }, 0);
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

  const handleEdit = (quote: Quote) => {
    setNewQuote({
      ...quote,
      items: quote.items.map(item => ({ ...item })) // Deep copy items to avoid ref issues
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!newQuote.customer_id || (newQuote.items || []).length === 0) return;

    const quotePayload: Quote = {
      id: newQuote.id || '', // If ID exists, we are updating
      created_at: newQuote.created_at || new Date().toISOString(),
      items: newQuote.items || [],
      customer_id: newQuote.customer_id || '',
      clientId: newQuote.customer_id || '',
      status: 'draft',
      total_value: quoteTotal,
      extra_costs: newQuote.extra_costs || 0,
      discount: newQuote.discount || 0,
      notes: newQuote.notes || '',
      display_id: newQuote.display_id
    };

    if (quotePayload.id) {
      await updateQuote(quotePayload);
    } else {
      await addQuote(quotePayload);
    }

    setIsModalOpen(false);
    setNewQuote({ customer_id: '', items: [], extra_costs: 0, discount: 0, status: 'draft', notes: '' });
  };

  const handlePrint = (quote: Quote) => {
    setPrintQuote(quote);
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
        {/* ... Header ... */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Orçamentos</h2>
            <p className="text-gray-500 mt-2 font-medium">Transforme cotações em vendas de sucesso.</p>
          </div>
          <button
            onClick={() => {
              setNewQuote({ customer_id: '', items: [], extra_costs: 0, discount: 0, status: 'draft', notes: '' });
              setIsModalOpen(true);
            }}
            className="bg-rose-500 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Gerar Orçamento
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
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
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                            ID: {quote.display_id ? String(quote.display_id).padStart(4, '0') : (quote.id || '').split('-')[0].toUpperCase()}
                          </span>
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
                            <button onClick={() => deleteQuote(quote.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-all" title="Excluir"><Trash2 className="w-5 h-5" /></button>
                            <button onClick={() => handleEdit(quote)} className="p-2 text-gray-300 hover:text-indigo-600 transition-all" title="Editar"><Pencil className="w-5 h-5" /></button>
                            <button onClick={() => handlePrint(quote)} className="p-2 text-gray-300 hover:text-indigo-600 transition-all" title="Imprimir / PDF"><Printer className="w-5 h-5" /></button>
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
            <div className="bg-white w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[95vh]">
              {/* Resumo lateral */}
              <div className="w-full md:w-[35%] bg-gray-900 p-12 text-white flex flex-col justify-between">
                <div>
                  <h3 className="text-4xl font-bold mb-8">Resumo do Orçamento</h3>
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Estimado</p>
                      <p className="text-5xl font-black text-rose-500">R$ {quoteTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Itens inclusos: {(newQuote.items || []).length}
                    </div>
                  </div>
                </div>
                <button onClick={handleSave} className="w-full py-5 bg-rose-500 rounded-lg font-black text-xl hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20">
                  Finalizar e Salvar
                </button>
              </div>

              {/* Editor de Orçamento */}
              <div className="w-full md:w-[65%] p-12 overflow-y-auto custom-scrollbar bg-white">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-900 tracking-tight">Configurar Cotação</h4>
                      <p className="text-sm text-gray-500 font-medium">Preencha os dados do orçamento</p>
                    </div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                </div>

                <div className="space-y-8">
                  {/* Seleção de Cliente */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1"><User className="w-3.5 h-3.5" /> Selecionar Cliente</label>
                    <select
                      className="w-full h-11 px-4 bg-white border border-gray-300 rounded-lg outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all shadow-sm font-medium text-gray-900 text-sm appearance-none"
                      value={newQuote.customer_id}
                      onChange={(e) => setNewQuote({ ...newQuote, customer_id: e.target.value })}
                    >
                      <option value="">Escolha um cliente da agenda...</option>
                      {contacts.filter(c => c.type === 'Cliente').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {/* Adição de Itens */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-gray-100 pb-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1"><Package className="w-3.5 h-3.5" /> Itens do Orçamento</label>
                    </div>

                    <div className="space-y-3">
                      {/* Add Product Select */}
                      <div className="relative">
                        <select
                          className="w-full h-11 px-4 bg-indigo-50 border border-indigo-100 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-indigo-700 text-sm appearance-none cursor-pointer"
                          onChange={(e) => handleAddItem(e.target.value)}
                          value=""
                        >
                          <option value="">+ ADICIONAR PRODUTO À LISTA</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Plus className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>

                      {newQuote.items?.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <p className="text-sm text-gray-400 font-medium">Nenhum item adicionado ainda.</p>
                        </div>
                      )}

                      {newQuote.items?.map((item, idx) => {
                        const prod = products.find(p => p.id === item.product_id);
                        return (
                          <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm group hover:border-rose-200 transition-colors">
                            <span className="flex-1 font-bold text-gray-800 text-sm">{prod?.name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                className="w-20 h-10 bg-white border border-gray-300 rounded-lg px-2 text-center text-sm font-bold text-gray-900 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all"
                                value={item.quantity}
                                onChange={(e) => {
                                  const updated = [...(newQuote.items || [])];
                                  updated[idx].quantity = parseInt(e.target.value) || 1;
                                  setNewQuote({ ...newQuote, items: updated });
                                }}
                              />
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Unid.</span>
                            </div>
                            <span className="font-black text-rose-600 min-w-[100px] text-right text-lg">R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                            <button
                              onClick={() => {
                                const updated = [...(newQuote.items || [])].filter((_, i) => i !== idx);
                                setNewQuote({ ...newQuote, items: updated });
                              }}
                              className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Ajustes Financeiros */}
                  <div className="grid grid-cols-2 gap-6 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Custos Extras</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium text-gray-900 shadow-sm"
                          value={newQuote.extra_costs}
                          onChange={(e) => setNewQuote({ ...newQuote, extra_costs: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-green-600 uppercase tracking-widest block ml-1">Desconto</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500/50" />
                        <input
                          type="number"
                          className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold text-green-600 shadow-sm"
                          value={newQuote.discount}
                          onChange={(e) => setNewQuote({ ...newQuote, discount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Observações / Notas</label>
                    <textarea
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-medium text-gray-900 shadow-sm min-h-[80px] resize-none"
                      placeholder="Adicione instruções especiais ou termos..."
                      value={newQuote.notes}
                      onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- PRINT LAYOUT --- */}
      {printQuote && (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto" id="print-area">
          <div className="max-w-4xl mx-auto border-none shadow-none text-gray-900 font-sans h-full">
            {/* Header / Brand */}
            <div className="flex justify-between items-end mb-12 pb-6 border-b-2 border-gray-900">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-900 text-white flex items-center justify-center font-black text-3xl rounded-lg">
                  {storeConfig.company_name ? storeConfig.company_name.substring(0, 1).toUpperCase() : 'P'}
                </div>
                <div>
                  <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Orçamento</h1>
                  <p className="text-sm font-bold text-gray-400 mt-0.5 uppercase tracking-widest">
                    #{printQuote.display_id ? String(printQuote.display_id).padStart(4, '0') : (printQuote.id ? printQuote.id.split('-')[0].toUpperCase() : '0000')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Data de Emissão</p>
                <p className="text-xl font-bold text-gray-900">{new Date(printQuote.date || printQuote.created_at).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Info Grid (From / To) */}
            <div className="grid grid-cols-2 gap-12 mb-16">

              {/* FROM (Company) */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Empresa</p>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{storeConfig.company_name || 'Nome da Empresa'}</h3>
                {storeConfig.company_cnpj && <p className="text-xs text-gray-500 font-medium mb-2">CNPJ: {storeConfig.company_cnpj}</p>}

                <div className="text-xs text-gray-500 space-y-1 leading-relaxed">
                  {storeConfig.company_address && <p className="whitespace-pre-line">{storeConfig.company_address}</p>}
                  <div className="mt-3 space-y-0.5 opacity-80">
                    {storeConfig.company_email && <p>{storeConfig.company_email}</p>}
                    {storeConfig.company_phone && <p>{storeConfig.company_phone}</p>}
                    {storeConfig.company_website && <p>{storeConfig.company_website}</p>}
                  </div>
                </div>
              </div>

              {/* TO (Customer) */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Cliente</p>
                {(() => {
                  const client = contacts.find(c => c.id === printQuote.customer_id || c.id === printQuote.clientId);
                  return client ? (
                    <>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{client.name}</h3>
                      {(client.document || client.phone) && (
                        <div className="text-xs text-gray-500 font-medium mb-2 space-x-3">
                          {client.document && <span>{client.document_type || 'DOC'}: {client.document}</span>}
                          {client.phone && <span>Tel: {client.phone}</span>}
                        </div>
                      )}

                      {(client.address || client.street) && (
                        <div className="text-xs text-gray-500 leading-relaxed max-w-[280px]">
                          {client.street ? (
                            <>
                              {client.street}, {client.number} {client.complement && `- ${client.complement}`}<br />
                              {client.neighborhood} - {client.city}/{client.state}<br />
                              {client.cep && `CEP: ${client.cep}`}
                            </>
                          ) : (
                            client.address
                          )}
                        </div>
                      )}
                      {client.email && <p className="text-xs text-gray-500 mt-2">{client.email}</p>}
                    </>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Cliente não identificado</p>
                  )
                })()}
              </div>
            </div>

            {/* Table Header Adjustment */}
            <div className="mb-2">
            </div>
            <table className="w-full mb-12">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-4 text-xs font-black uppercase tracking-widest text-gray-900">Descrição do Item</th>
                  <th className="text-center py-4 text-xs font-black uppercase tracking-widest text-gray-900 w-24">Qtd.</th>
                  <th className="text-right py-4 text-xs font-black uppercase tracking-widest text-gray-900 w-32">Preço Unit.</th>
                  <th className="text-right py-4 text-xs font-black uppercase tracking-widest text-gray-900 w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {printQuote.items.map((item, idx) => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <tr key={idx}>
                      <td className="py-5 text-sm font-bold text-gray-800">{product?.name || item.name}</td>
                      <td className="py-5 text-center text-sm font-medium text-gray-600">{item.quantity}</td>
                      <td className="py-5 text-right text-sm font-medium text-gray-600">R$ {item.unit_price.toFixed(2)}</td>
                      <td className="py-5 text-right text-sm font-black text-gray-900">R$ {(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Summary */}
            <div className="flex justify-end mb-20">
              <div className="w-72">
                <div className="flex justify-between py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                  <span>Subtotal</span>
                  <span>R$ {((printQuote.items || []).reduce((acc, i) => acc + (i.unit_price * i.quantity), 0)).toFixed(2)}</span>
                </div>
                {/* Fix boolean check to avoid rendering '0' */}
                {Number(printQuote.extra_costs) > 0 && (
                  <div className="flex justify-between py-2 text-sm font-medium text-gray-500 border-b border-gray-100">
                    <span>Custos Extras</span>
                    <span>+ R$ {Number(printQuote.extra_costs).toFixed(2)}</span>
                  </div>
                )}
                {Number(printQuote.discount) > 0 && (
                  <div className="flex justify-between py-2 text-sm font-medium text-green-600 border-b border-gray-100">
                    <span>Desconto</span>
                    <span>- R$ {Number(printQuote.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-4 text-2xl font-black text-gray-900 mt-2">
                  <span>Total</span>
                  <span>R$ {printQuote.total_value.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes if any */}
            {printQuote.notes && (
              <div className="mb-12 p-6 bg-yellow-50 rounded-sm border border-yellow-100 text-sm text-yellow-800">
                <p className="font-bold uppercase text-xs mb-1">Observações:</p>
                {printQuote.notes}
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-200 pt-8 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Obrigado pela preferência!</p>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Quotes;
