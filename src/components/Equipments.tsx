import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api/client';
import { Equipment } from '../types';
import {
    Monitor,
    Plus,
    Trash2,
    X,
    Save,
    TrendingDown
} from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    value: z.number().min(0, 'Valor deve ser positivo'),
    lifespan_years: z.number().min(1, 'Vida útil mínima de 1 ano')
});

type FormData = z.infer<typeof schema>;

const Equipments: React.FC = () => {
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            value: 0,
            lifespan_years: 5
        }
    });

    const fetchEquipments = async () => {
        try {
            const data = await api.get<Equipment[]>('/equipments');
            setEquipments(data || []);
        } catch (error) {
            console.error('Failed to fetch equipments', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipments();
    }, []);

    const onSubmit = async (data: FormData) => {
        try {
            await api.post('/equipments', data);
            await fetchEquipments();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save equipment', error);
            alert('Erro ao salvar equipamento');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este equipamento?')) return;
        try {
            await api.delete(`/equipments/${id}`);
            setEquipments(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Failed to delete equipment', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        reset();
    };

    // Calculate Monthly Depreciation: Value / (Years * 12)
    const calculateDepreciation = (value: number, years: number) => {
        if (!years) return 0;
        return value / (years * 12);
    };

    const totalDepreciation = equipments.reduce((acc, item) => {
        return acc + calculateDepreciation(Number(item.value), Number(item.lifespan_years));
    }, 0);

    const totalInvested = equipments.reduce((acc, item) => acc + Number(item.value), 0);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Carregando investimentos...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Investimentos & Equipamentos</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gerencie seus equipamentos e a depreciação mensal automática.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-600 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-sky-700 transition-all shadow-xl shadow-sky-100 hover:-translate-y-0.5 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Novo Equipamento
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Section */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Depreciation Card */}
                    <div className="bg-gradient-to-br from-rose-500 to-orange-600 p-8 rounded-lg text-white shadow-2xl shadow-rose-200 relative overflow-hidden">
                        <TrendingDown className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10" />
                        <div className="relative z-10">
                            <h4 className="font-bold text-rose-100 text-xs uppercase tracking-widest opacity-90">Depreciação Mensal (Total)</h4>
                            <p className="text-4xl font-bold mt-2">R$ {totalDepreciation.toFixed(2)}</p>
                            <p className="text-sm text-rose-100 mt-4 opacity-80">
                                Esse valor é adicionado automaticamente aos seus custos fixos para garantir a reposição dos equipamentos.
                            </p>
                        </div>
                    </div>

                    {/* Total Invested */}
                    <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
                        <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Total Investido</h4>
                        <p className="text-3xl font-bold text-gray-900 mt-2">R$ {totalInvested.toFixed(2)}</p>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    {equipments.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
                            <Monitor className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">Nenhum equipamento cadastrado ainda.</p>
                        </div>
                    ) : (
                        equipments.map(item => {
                            const monthly = calculateDepreciation(Number(item.value), Number(item.lifespan_years));
                            return (
                                <div key={item.id} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-sky-50 rounded-lg flex items-center justify-center text-sky-600">
                                            <Monitor className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                R$ {Number(item.value).toFixed(2)} • {item.lifespan_years} anos de vida
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Depreciação</p>
                                            <p className="font-bold text-rose-500 text-lg">R$ {monthly.toFixed(2)}<span className="text-xs text-gray-400">/mês</span></p>
                                        </div>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">Novo Equipamento</h3>
                            <button onClick={handleCloseModal}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Nome do Equipamento</label>
                                <input
                                    {...register('name')}
                                    placeholder="Ex: Máquina de Costura Industrial"
                                    className="w-full bg-gray-50 border-2 border-transparent rounded-lg px-6 py-4 outline-none focus:bg-white focus:border-sky-500 transition-all font-bold text-gray-700"
                                />
                                {errors.name && <p className="text-rose-500 text-sm mt-1 ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Valor Pago (R$)</label>
                                    <input
                                        type="number" step="0.01"
                                        {...register('value', { valueAsNumber: true })}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-lg px-6 py-4 outline-none focus:bg-white focus:border-sky-500 transition-all font-bold text-gray-700 text-lg"
                                    />
                                    {errors.value && <p className="text-rose-500 text-sm mt-1 ml-1">{errors.value.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Vida Útil (Anos)</label>
                                    <input
                                        type="number" step="1"
                                        {...register('lifespan_years', { valueAsNumber: true })}
                                        className="w-full bg-gray-50 border-2 border-transparent rounded-lg px-6 py-4 outline-none focus:bg-white focus:border-sky-500 transition-all font-bold text-gray-700 text-lg"
                                    />
                                    {errors.lifespan_years && <p className="text-rose-500 text-sm mt-1 ml-1">{errors.lifespan_years.message}</p>}
                                </div>
                            </div>

                            <div className="bg-sky-50 p-4 rounded-lg text-sky-700 text-sm font-medium">
                                O sistema dividirá o valor pela vida útil ({watch('lifespan_years') || 0} anos) para encontrar o custo mensal.
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-sky-600 text-white rounded-lg font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2">
                                <Save className="w-5 h-5" />
                                {isSubmitting ? 'Salvando...' : 'Salvar Equipamento'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default Equipments;
