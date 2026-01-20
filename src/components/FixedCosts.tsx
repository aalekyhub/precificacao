import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, FixosMensais } from '../api/client';
import {
    Building2,
    Calendar,
    DollarSign,
    Clock,
    Save,
    TrendingDown
} from 'lucide-react';

const schema = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/, 'Formato inválido (YYYY-MM)'),
    totalFixedCosts: z.number().min(1, 'Valor deve ser positivo'),
    productiveHours: z.number().min(1, 'Horas devem ser positivas')
});

type FormData = z.infer<typeof schema>;

const FixedCosts: React.FC = () => {
    const [costs, setCosts] = useState<FixosMensais[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));

    const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            month: currentMonth,
            totalFixedCosts: 0,
            productiveHours: 0
        }
    });

    useEffect(() => {
        fetchCosts();
    }, []);

    const fetchCosts = async () => {
        try {
            const data = await api.get<FixosMensais[]>('/fixos');
            setCosts(data);

            // Auto-load current month if exists
            const existing = data.find(c => c.month === currentMonth);
            if (existing) {
                setValue('month', existing.month);
                setValue('totalFixedCosts', Number(existing.totalFixedCosts));
                setValue('productiveHours', Number(existing.productiveHours));
            }
        } catch (error) { console.error(error); }
    };

    const onSubmit = async (data: FormData) => {
        try {
            await api.post('/fixos', data);
            await fetchCosts();
            alert('Custos atualizados com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar custos');
        }
    };

    const hourlyRate = (watch('totalFixedCosts') || 0) / (watch('productiveHours') || 1);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Custos Fixos</h2>
                    <p className="text-gray-500 mt-2 font-medium">Defina suas despesas mensais e horas de trabalho.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-indigo-50">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Configuração Mensal</h3>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Mês de Referência</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="month"
                                    {...register('month')}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all font-medium"
                                />
                            </div>
                            {errors.month && <p className="text-rose-500 text-sm mt-1">{errors.month.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Total Custos Fixos (R$)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number" step="0.01"
                                        {...register('totalFixedCosts', { valueAsNumber: true })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all font-medium"
                                        placeholder="Ex: 1500.00"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Aluguel, Luz, Internet, MEI, etc.</p>
                                {errors.totalFixedCosts && <p className="text-rose-500 text-sm mt-1">{errors.totalFixedCosts.message}</p>}
                            </div>

                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Horas Produtivas / Mês</label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        {...register('productiveHours', { valueAsNumber: true })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:bg-white focus:border-indigo-500 border-2 border-transparent transition-all font-medium"
                                        placeholder="Ex: 120"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2">Ex: 6h/dia * 20 dias = 120h</p>
                                {errors.productiveHours && <p className="text-rose-500 text-sm mt-1">{errors.productiveHours.message}</p>}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
                            >
                                <Save className="w-5 h-5" />
                                {isSubmitting ? 'Salvando...' : 'Salvar Configuração Mensal'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200">
                        <h4 className="text-lg font-medium opacity-80 mb-1">Custo da Hora Técnica</h4>
                        <div className="text-5xl font-black tracking-tight mb-2">
                            R$ {hourlyRate.toFixed(2)}
                        </div>
                        <p className="text-sm opacity-70">Este valor será usado para calcular o custo de mão de obra (overhead) em cada produto, baseado no tempo de produção.</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingDown className="w-5 h-5 text-gray-400" />
                            Histórico Recente
                        </h4>
                        <div className="space-y-4">
                            {costs.length === 0 && <p className="text-gray-400 text-center py-4">Nenhum registro encontrado.</p>}
                            {costs.slice(0, 5).map(c => (
                                <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                    <div className="font-bold text-gray-700">{c.month}</div>
                                    <div className="text-right">
                                        <div className="font-bold text-indigo-600">R$ {Number(c.totalFixedCosts).toFixed(2)}</div>
                                        <div className="text-xs text-gray-400">{Number(c.productiveHours)} horas</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default FixedCosts;
