import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, FixosMensais } from '../src/api/client';
import {
  Building2,
  Calendar,
  DollarSign,
  Clock,
  Save,
  TrendingDown,
  Receipt,
  Edit3,
  Trash2,
  X,
  Info,
  Wallet,
  Plus
} from 'lucide-react';

const FixedCostPeriodicity = z.enum(['Mensal', 'Trimestral', 'Semestral', 'Anual']);
type FixedCostPeriodicity = z.infer<typeof FixedCostPeriodicity>;
const PERIODICITIES: FixedCostPeriodicity[] = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];

const schema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato inválido (YYYY-MM)'),
  totalFixedCosts: z.number().min(0, 'Valor deve ser positivo'),
  productiveHours: z.number().min(1, 'Horas devem ser positivas')
});

type FormData = z.infer<typeof schema>;

const FixedCosts: React.FC = () => {
  const [costs, setCosts] = useState<FixosMensais[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: currentMonth,
      totalFixedCosts: 0,
      productiveHours: 160
    }
  });

  useEffect(() => {
    fetchCosts();
  }, []);

  const fetchCosts = async () => {
    try {
      const data = await api.get<FixosMensais[]>('/fixos');
      setCosts(data);
    } catch (error) { console.error(error); }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/fixos', data);
      await fetchCosts();
      setIsModalOpen(false);
      reset();
      alert('Custos atualizados com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar custos');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este registro?')) return;
    try {
      await api.delete(`/fixos/${id}`);
      fetchCosts();
    } catch (e) {
      console.error(e);
      alert('Erro ao excluir');
    }
  };

  const hourlyRate = (costs.length > 0 && costs[0].productiveHours > 0)
    ? (Number(costs[0].totalFixedCosts) / Number(costs[0].productiveHours))
    : 0;

  const totalMonthly = costs.reduce((acc, c) => acc + Number(c.totalFixedCosts), 0); // Sum of all entries? Or just current month?
  // Since the API returns a list of monthly configs, let's just sum typical monthly for now or show latest.
  // Use latest entry for display
  const latestCost = costs.length > 0 ? costs[costs.length - 1] : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Custos Fixos</h2>
          <p className="text-gray-500 mt-2 font-medium">Defina suas despesas mensais e horas de trabalho.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Custo Fixo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stats Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <Wallet className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h4 className="font-bold text-indigo-100 text-xs uppercase tracking-widest opacity-80">Custo Hora Técnica</h4>
              <p className="text-4xl font-bold mt-2">R$ {hourlyRate.toFixed(2)}</p>
              <div className="mt-6 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
                <TrendingDown className="w-3 h-3" />
                Baseado em {latestCost?.productiveHours || 0}h/mês
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[450px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mês de Referência</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horas Produtivas</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Custos</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {costs.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-gray-400">Nenhum custo registrado.</td></tr>
                  ) : (
                    costs.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-8 py-6 font-bold text-gray-800">{c.month}</td>
                        <td className="px-8 py-6 text-gray-600">{Number(c.productiveHours)}h</td>
                        <td className="px-8 py-6 font-bold text-indigo-600">R$ {Number(c.totalFixedCosts).toFixed(2)}</td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-rose-500"><Trash2 className="w-5 h-5" /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden p-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold font-serif">Novo Registro Mensal</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mês</label>
                <input type="month" {...register('month')} className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold" />
                {errors.month && <p className="text-rose-500 text-sm">{errors.month.message}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Total Custos (R$)</label>
                <input type="number" step="0.01" {...register('totalFixedCosts', { valueAsNumber: true })} className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold" />
                {errors.totalFixedCosts && <p className="text-rose-500 text-sm">{errors.totalFixedCosts.message}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Horas Produtivas</label>
                <input type="number" {...register('productiveHours', { valueAsNumber: true })} className="w-full bg-gray-50 rounded-2xl p-4 outline-none font-bold" />
                {errors.productiveHours && <p className="text-rose-500 text-sm">{errors.productiveHours.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all">
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FixedCosts;
