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

    const [form, setForm] = useState<Partial<FinancialTransaction>>({
        description: '',
        amount: 0,
        type: 'expense',
        category: 'Outros',
        status: 'paid',
        date: new Date().toISOString().split('T')[0],
        observations: ''
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
                date: new Date().toISOString().split('T')[0]
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

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchType = filterType === 'all' || t.type === filterType;
            const matchStatus = filterStatus === 'all' || t.status === filterStatus;
            return matchType && matchStatus;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterType, filterStatus]);

    const summary = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
        return { income, expense, balance: income - expense };
    }, [transactions]);

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

            {/* Config Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Receitas</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">R$ {summary.income.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Despesas</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900">R$ {summary.expense.toFixed(2)}</p>
                </div>
                <div className="bg-gray-900 p-6 rounded-lg shadow-xl text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/10 text-white rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Saldo Total</span>
                    </div>
                    <p className={`text-3xl font-black ${summary.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        R$ {summary.balance.toFixed(2)}
                    </p>
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
                                        <button onClick={() => handleDelete(t.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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
