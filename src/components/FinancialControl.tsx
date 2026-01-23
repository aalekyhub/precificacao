import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { FinancialTransaction } from '../types';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Plus,
    Trash2,
    X,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    PieChart
} from 'lucide-react';

const FinancialControl: React.FC = () => {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
    const [filterMode, setFilterMode] = useState<'month' | 'custom'>('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const [form, setForm] = useState<Partial<FinancialTransaction>>({
        description: '',
        amount: 0,
        type: 'expense',
        category: 'Outros',
        status: 'paid',
        date: new Date().toISOString().split('T')[0],
        observations: '',
        periodicity: 'none',
        payment_method: 'Pix'
    });

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await api.get<FinancialTransaction[]>('/financial_transaction'); // Assuming API endpoint matches table name roughly or as mapped
            // If direct Supabase table mapping, it's typically pluralized or exact. Let's assume '/financial_transaction' or we might need to adjust client.ts
            // For now, using '/financial_transaction' as generic resource path.
            // If the user meant "FinancialTransaction" table, Supabase auto-routes often use table name.
            setTransactions(data || []);
        } catch (error) {
            console.error('Error loading transactions', error);
        }
    };

    const handleSave = async () => {
        if (!form.description || !form.amount) return;
        try {
            await api.post('/financial_transaction', form);
            setIsModalOpen(false);
            setForm({
                description: '',
                amount: 0,
                type: 'expense',
                category: 'Outros',
                status: 'paid',
                date: new Date().toISOString().split('T')[0],
                periodicity: 'none',
                payment_method: 'Pix'
            });
            loadTransactions();
        } catch (error: any) {
            console.error('Error saving transaction', error);
            alert('Erro ao salvar transação: ' + (error.message || JSON.stringify(error)));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return;
        try {
            await api.delete(`/financial_transaction/${id}`);
            loadTransactions();
        } catch (error) {
            console.error('Error deleting transaction', error);
        }
    };

    const handleMarkAsPaid = async (t: FinancialTransaction) => {
        try {
            await api.post(`/financial_transaction`, { ...t, status: 'paid' });
            loadTransactions();
        } catch (error) {
            console.error('Error updating status', error);
        }
    };

    const handleClone = (t: FinancialTransaction) => {
        setForm({
            ...t,
            id: undefined,
            date: new Date().toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const changeMonth = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    const isInPeriod = (dateStr: string) => {
        const d = new Date(dateStr);
        if (filterMode === 'month') {
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        } else {
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            d.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return d >= start && d <= end;
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchPeriod = isInPeriod(t.date);
            const matchType = filterType === 'all' || t.type === filterType;
            const matchStatus = filterStatus === 'all' || t.status === filterStatus;
            return matchPeriod && matchType && matchStatus;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterType, filterStatus, currentMonth, currentYear, filterMode, dateRange]);

    const summary = useMemo(() => {
        const periodTransactions = transactions.filter(t => isInPeriod(t.date));
        const income = periodTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
        const expense = periodTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
        const pending = periodTransactions.filter(t => t.status === 'pending').reduce((acc, t) => acc + Number(t.amount), 0);
        return { income, expense, balance: income - expense, pending };
    }, [transactions, currentMonth, currentYear, filterMode, dateRange]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Controle Financeiro</h2>
                    <p className="text-gray-500 mt-2 font-medium">Gestão completa de receitas e despesas.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nova Transação
                </button>
            </div>

            {/* Período e Resumo */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between flex-1">
                        <div className="flex bg-gray-50 p-1 rounded-lg mr-4">
                            <button
                                onClick={() => setFilterMode('month')}
                                title="Filtro por Mês"
                                className={`p-2 rounded-md transition-all ${filterMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Calendar className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFilterMode('custom')}
                                title="Intervalo Personalizado"
                                className={`p-2 rounded-md transition-all ${filterMode === 'custom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <Filter className="w-5 h-5" />
                            </button>
                        </div>

                        {filterMode === 'month' ? (
                            <div className="flex items-center justify-between flex-1">
                                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-400">
                                    <ArrowDownLeft className="w-5 h-5 rotate-45" />
                                </button>
                                <div className="text-center">
                                    <h3 className="text-lg font-bold text-gray-900">{months[currentMonth]}</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{currentYear}</p>
                                </div>
                                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-50 rounded-lg transition-all text-gray-400">
                                    <ArrowUpRight className="w-5 h-5 -rotate-45" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 flex-1 justify-center">
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">Início</label>
                                    <input
                                        type="date"
                                        className="bg-gray-50 border-none rounded-lg p-2 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                        value={dateRange.start}
                                        onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                </div>
                                <div className="text-gray-300 mt-4">---</div>
                                <div className="flex flex-col">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-1">Fim</label>
                                    <input
                                        type="date"
                                        className="bg-gray-50 border-none rounded-lg p-2 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                        value={dateRange.end}
                                        onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Receitas</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">R$ {summary.income.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <TrendingDown className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Despesas</span>
                        </div>
                        <p className="text-3xl font-black text-gray-900">R$ {summary.expense.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100 bg-amber-50/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-amber-500 uppercase tracking-wider">Pendente</span>
                        </div>
                        <p className="text-3xl font-black text-amber-600">R$ {summary.pending.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl shadow-xl text-white">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 text-white rounded-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Saldo</span>
                        </div>
                        <p className={`text-3xl font-black ${summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            R$ {summary.balance.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Listagem */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 items-center">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" />
                        Histórico de Transações
                    </h3>
                    <div className="flex bg-gray-50 p-1 rounded-md">
                        {(['all', 'income', 'expense'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${filterType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {type === 'all' ? 'Todas' : type === 'income' ? 'Receitas' : 'Despesas'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Data</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Valor</th>
                                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-4 text-sm font-medium text-gray-600">
                                        {new Date(t.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-8 py-4 text-sm font-bold text-gray-900">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            {t.description}
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 text-sm text-gray-500">
                                        <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {t.status === 'paid' ? 'Pago' : 'Pendente'}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-4 text-right font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                                        {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                                    </td>
                                    <td className="px-8 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {t.status === 'pending' && (
                                                <button
                                                    onClick={() => handleMarkAsPaid(t)}
                                                    className="p-2 text-gray-300 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                    title="Marcar como Pago"
                                                >
                                                    <DollarSign className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleClone(t)}
                                                className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Duplicar"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg rounded-lg shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Nova Transação</h3>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setForm({ ...form, type: 'income' })}
                                    className={`py-3 rounded-md font-bold border-2 transition-all ${form.type === 'income' ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-100 text-gray-400'}`}
                                >
                                    Receita
                                </button>
                                <button
                                    onClick={() => setForm({ ...form, type: 'expense' })}
                                    className={`py-3 rounded-md font-bold border-2 transition-all ${form.type === 'expense' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 text-gray-400'}`}
                                >
                                    Despesa
                                </button>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Descrição</label>
                                <input
                                    type="text"
                                    className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Ex: Venda de Produto, Aluguel..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Valor (R$)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Data</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.date}
                                        onChange={e => setForm({ ...form, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Categoria</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                    >
                                        <option value="Venda">Venda</option>
                                        <option value="Serviço">Serviço</option>
                                        <option value="Material">Material</option>
                                        <option value="Aluguel">Aluguel</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Impostos">Impostos</option>
                                        <option value="Pro-labore">Pro-labore</option>
                                        <option value="Outros">Outros</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Status</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.status}
                                        onChange={e => setForm({ ...form, status: e.target.value as any })}
                                    >
                                        <option value="paid">Pago / Recebido</option>
                                        <option value="pending">Pendente</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Periodicidade</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.periodicity}
                                        onChange={e => setForm({ ...form, periodicity: e.target.value as any })}
                                    >
                                        <option value="none">Nenhuma (Única)</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="quarterly">Trimestral</option>
                                        <option value="semiannual">Semestral</option>
                                        <option value="annual">Anual</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Forma de Pagto.</label>
                                    <select
                                        className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        value={form.payment_method}
                                        onChange={e => setForm({ ...form, payment_method: e.target.value })}
                                    >
                                        <option value="Pix">Pix</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                                        <option value="Cartão de Débito">Cartão de Débito</option>
                                        <option value="Boleto">Boleto</option>
                                        <option value="Transferência">Transferência</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Observações (Opcional)</label>
                                <textarea
                                    className="w-full bg-gray-50 border-none rounded-md p-4 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
                                    value={form.observations}
                                    onChange={e => setForm({ ...form, observations: e.target.value })}
                                    placeholder="..."
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                            >
                                Salvar Transação
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialControl;
