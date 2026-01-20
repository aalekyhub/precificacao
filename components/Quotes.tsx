
import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  X,
  Save,
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Printer
} from 'lucide-react';
import { Quote, Product, Contact, QuoteItem, QuoteStatus, StoreConfig, Material, FixedCost } from '../types';

interface QuotesProps {
  quotes: Quote[];
  products: Product[];
  contacts: Contact[];
  materials: Material[];
  fixedCosts: FixedCost[];
  storeConfig: StoreConfig;
  onAdd: (q: Quote) => void;
  onUpdate: (q: Quote) => void;
  onDelete: (id: string) => void;
}

const Quotes: React.FC<QuotesProps> = ({ quotes, products, contacts, materials, fixedCosts, storeConfig, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuote, setNewQuote] = useState<Partial<Quote>>({
    clientId: '',
    items: [],
    extraCosts: 0,
    discount: 0,
    status: 'Pendente',
    notes: ''
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

  const calculateProductPrice = (prod: Product) => {
    const matCost = prod.materials.reduce((acc, pm) => {
      const m = materials.find(mat => mat.id === pm.materialId);
      if (!m) return acc;
      return acc + (m.cost / m.quantity) * pm.quantityUsed;
    }, 0);
    const printingCost = (prod.printedPages || 0) * inkCostPerPage;
    const laborCost = (prod.laborHours || 0) * (prod.laborRate || 0);
    const fixedCostShare = (prod.laborHours || 0) * fixedCostPerHour;
    const totalCost = matCost + laborCost + printingCost + fixedCostShare;
    return totalCost * (1 + (prod.markup / 100));
  };

  const quoteTotal = useMemo(() => {
    const subtotal = (newQuote.items || []).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    return subtotal + (Number(newQuote.extraCosts) || 0) - (Number(newQuote.discount) || 0);
  }, [newQuote.items, newQuote.extraCosts, newQuote.discount]);

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const price = calculateProductPrice(product);
    setNewQuote({
      ...newQuote,
      items: [...(newQuote.items || []), { productId, quantity: 1, unitPrice: price }]
    });
  };

  const handleSave = () => {
    if (!newQuote.clientId || (newQuote.items || []).length === 0) return;
    const quote: Quote = {
      ...newQuote as Quote,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      total: quoteTotal
    };
    onAdd(quote);
    setIsModalOpen(false);
    setNewQuote({ clientId: '', items: [], extraCosts: 0, discount: 0, status: 'Pendente' });
  };

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case 'Aprovado': return 'bg-green-100 text-green-600';
      case 'Pendente': return 'bg-orange-100 text-orange-600';
      case 'Enviado': return 'bg-blue-100 text-blue-600';
      case 'Cancelado': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Orçamentos</h2>
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
                  const client = contacts.find(c => c.id === quote.clientId);
                  return (
                    <tr key={quote.id} className="hover:bg-gray-50/50 transition-all group">
                      <td className="px-8 py-6">
                        <span className="font-bold text-gray-800 block">{new Date(quote.date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">ID: {quote.id.toUpperCase()}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-bold text-gray-700">{client?.name || 'Cliente Removido'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-rose-600 font-black text-lg">R$ {quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => onDelete(quote.id)} className="p-3 text-gray-300 hover:text-rose-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                          <button className="p-3 text-gray-300 hover:text-indigo-600 transition-all"><Printer className="w-5 h-5" /></button>
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
                <h3 className="text-4xl font-bold font-serif mb-8">Resumo do Orçamento</h3>
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
                    value={newQuote.clientId}
                    onChange={(e) => setNewQuote({ ...newQuote, clientId: e.target.value })}
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
                      const prod = products.find(p => p.id === item.productId);
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
                          <span className="font-black text-rose-600 min-w-[80px] text-right">R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
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
  );
};

export default Quotes;
