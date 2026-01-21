import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStoreData } from '../hooks/useStoreData';
import { FixedCost, Equipment } from '../types';
import { api } from '../api/client';
import {
  Wallet,
  Plus,
  Trash2,
  X,
  Save,
  DollarSign,
  Monitor
} from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  value: z.number().min(0, 'Valor deve ser positivo')
});

type FormData = z.infer<typeof schema>;

const FixedCosts: React.FC = () => {
  const { fixedCosts, addFixedCost, updateFixedCost, deleteFixedCost } = useStoreData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // State for depreciation
  const [equipmentDepreciation, setEquipmentDepreciation] = useState(0);

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      value: 0
    }
  });

  useEffect(() => {
    // Fetch equipment depreciation totals
    api.get<Equipment[]>('/equipments').then(data => {
      if (data) {
        const total = data.reduce((acc, item) => {
          const monthly = Number(item.value) / (Number(item.lifespan_years) * 12);
          return acc + (item.lifespan_years ? monthly : 0);
        }, 0);
        setEquipmentDepreciation(total);
      }
    }).catch(err => console.error('Failed to load depreciation', err));
  }, [fixedCosts]); // Re-fetch when costs change? Maybe just on mount is fine, or better yet, separate. 
  // Actually, equipments change rarely. Just on mount is fine.

  const onSubmit = async (data: FormData) => {
    try {
      if (editingId) {
        await updateFixedCost({ id: editingId, ...data });
      } else {
        await addFixedCost({ id: '', ...data });
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save fixed cost', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este custo?')) return;
    await deleteFixedCost(id);
  };

  const handleEdit = (item: FixedCost) => {
    setEditingId(item.id);
    setValue('name', item.name);
    setValue('value', Number(item.value));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    reset();
  };

  const manualTotal = fixedCosts.reduce((acc, c) => acc + Number(c.value), 0);
  const totalMonthly = manualTotal + equipmentDepreciation;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Custos Fixos Mensais</h2>
          <p className="text-gray-500 mt-2 font-medium">Cadastre suas despesas recorrentes (Aluguel, Luz, Internet).</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Custo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-lg text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <Wallet className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h4 className="font-bold text-indigo-100 text-xs uppercase tracking-widest opacity-80">Total Mensal</h4>
              <p className="text-4xl font-bold mt-2">R$ {totalMonthly.toFixed(2)}</p>

              <div className="mt-4 space-y-1">
                <p className="text-xs text-indigo-200 flex justify-between">
                  <span>Despesas Fixas:</span>
                  <span>R$ {manualTotal.toFixed(2)}</span>
                </p>
                <p className="text-xs text-indigo-200 flex justify-between">
                  <span>Depreciação:</span>
                  <span>R$ {equipmentDepreciation.toFixed(2)}</span>
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full text-[10px] font-bold border border-white/10">
                <DollarSign className="w-3 h-3" />
                {fixedCosts.length} despesas + Equipamentos
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">

          {/* Automatic Depreciation Entry */}
          {equipmentDepreciation > 0 && (
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-lg">Depreciação de Equipamentos</h3>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Cálculo Automático</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <p className="font-bold text-indigo-900 text-xl">R$ {equipmentDepreciation.toFixed(2)}</p>
                <div className="w-9 h-9"></div> {/* Spacer to align with delete buttons */}
              </div>
            </div>
          )}

          {fixedCosts.length === 0 && equipmentDepreciation === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-400 font-medium">Nenhuma despesa cadastrada ainda.</p>
            </div>
          ) : (
            fixedCosts.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Despesa Mensal</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <p className="font-bold text-gray-900 text-xl">R$ {Number(item.value).toFixed(2)}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)} className="p-2 text-gray-300 hover:text-indigo-600 transition-colors">
                      <span className="sr-only">Editar</span>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingId ? 'Editar Despesa' : 'Nova Despesa'}
              </h3>
              <button onClick={handleCloseModal}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nome da Despesa</label>
                <input
                  {...register('name')}
                  placeholder="Ex: Conta de Luz"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-lg px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-700"
                />
                {errors.name && <p className="text-rose-500 text-sm mt-1 ml-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Valor Mensal (R$)</label>
                <input
                  type="number" step="0.01"
                  {...register('value', { valueAsNumber: true })}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-lg px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-700 text-lg"
                />
                {errors.value && <p className="text-rose-500 text-sm mt-1 ml-1">{errors.value.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FixedCosts;
