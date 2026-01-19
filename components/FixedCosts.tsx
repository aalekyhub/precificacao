
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Receipt, 
  Trash2, 
  X, 
  ArrowRight, 
  Wallet, 
  Edit3, 
  Calendar, 
  Info, 
  Save,
  TrendingDown
} from 'lucide-react';
import { FixedCost, FixedCostPeriodicity } from '../types';

interface FixedCostsProps {
  fixedCosts: FixedCost[];
  onAdd: (fc: FixedCost) => void;
  onUpdate: (fc: FixedCost) => void;
  onDelete: (id: string) => void;
}

const PERIODICITIES: FixedCostPeriodicity[] = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];

const FixedCosts: React.FC<FixedCostsProps> = ({ fixedCosts, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FixedCost | null>(null);

  const [formState, setFormState] = useState<Partial<FixedCost>>({
    name: '',
    value: 0,
    periodicity: 'Mensal',
    observations: ''
  });

  const totalMonthly = useMemo(() => {
    return fixedCosts.reduce((acc, fc) => {
      if (fc.periodicity === 'Anual') return acc + (fc.value / 12);
      if (fc.periodicity === 'Semestral') return acc + (fc.value / 6);
      if (fc.periodicity === 'Trimestral') return acc + (fc.value / 3);
      return acc + fc.value;
    }, 0);
  }, [fixedCosts]);

  const openModal = (cost?: FixedCost) => {
    if (cost) {
      setEditingCost(cost);
      setFormState(cost);
    } else {
      setEditingCost(null);
      setFormState({ name: '', value: 0, periodicity: 'Mensal', observations: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.name || !formState.value) return;
    
    const costData = {
      ...formState,
      id: editingCost ? editingCost.id : Math.random().toString(36).substr(2, 9),
      name: formState.name,
      value: Number(formState.value),
      periodicity: formState.periodicity || 'Mensal',
      observations: formState.observations || ''
    } as FixedCost;

    if (editingCost) {
      onUpdate(costData);
    } else {
      onAdd(costData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Custos Fixos</h2>
          <p className="text-gray-500 mt-2 font-medium">Mantenha a saúde financeira do seu ateliê sob controle total.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Custo Fixo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
             <Wallet className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-700" />
             <div className="relative z-10">
               <h4 className="font-bold text-indigo-100 text-xs uppercase tracking-widest opacity-80">Total de Gastos Fixos</h4>
               <p className="text-4xl font-bold mt-2">R$ {totalMonthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               <div className="mt-6 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
                 <TrendingDown className="w-3 h-3" />
                 Peso mensal no orçamento
               </div>
             </div>
          </div>

          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm">Dica de Gestão</h4>
             </div>
             <p className="text-xs text-gray-500 leading-relaxed font-medium">
               Custos fixos são aqueles que não variam com o volume de produção. Reduzi-los aumenta diretamente sua margem de lucro.
             </p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[450px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição da Despesa</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Frequência</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor do Custo</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fixedCosts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-40 text-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Receipt className="w-10 h-10" />
                        </div>
                        <p className="text-gray-400 font-bold text-lg">Sem custos fixos registrados</p>
                        <p className="text-gray-300 text-sm">Clique em 'Novo Custo Fixo' para começar a organizar.</p>
                      </td>
                    </tr>
                  ) : (
                    fixedCosts.map((fc) => (
                      <tr key={fc.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:border-indigo-100 group-hover:scale-110 transition-all shadow-sm">
                              <Receipt className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block text-base">{fc.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                {fc.observations ? 'Com observações' : 'Sem notas adicionais'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                            <Calendar className="w-3 h-3" />
                            {fc.periodicity}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-black text-lg">
                              R$ {fc.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">Impacto mensal direto</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openModal(fc)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button onClick={() => onDelete(fc.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            {/* Header */}
            <div className="px-10 py-8 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-100 text-white">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-serif">
                    {editingCost ? 'Editar Custo Fixo' : 'Novo Custo Fixo'}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Financeiro & Operacional</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="px-10 py-10 space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-700 shadow-inner"
                  placeholder="Ex: Aluguel, Luz, Internet, etc."
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Valor do Custo</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</div>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-14 pr-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-800 text-lg shadow-inner"
                    placeholder="0,00"
                    value={formState.value}
                    onChange={(e) => setFormState({...formState, value: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Periodicidade</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-700 appearance-none shadow-inner"
                    value={formState.periodicity}
                    onChange={(e) => setFormState({...formState, periodicity: e.target.value as FixedCostPeriodicity})}
                  >
                    {PERIODICITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Observação</label>
                <textarea 
                  rows={3}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium text-gray-700 resize-none shadow-inner"
                  placeholder="Notas adicionais sobre este custo..."
                  value={formState.observations}
                  onChange={(e) => setFormState({...formState, observations: e.target.value})}
                />
              </div>
            </div>

            <div className="px-10 py-10 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95 shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                disabled={!formState.name || !formState.value}
                className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95"
              >
                <Save className="w-5 h-5" />
                {editingCost ? 'Atualizar Custo' : 'Salvar Custo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FixedCosts;
