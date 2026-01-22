import React, { useState, useEffect } from 'react';
import { useStoreData } from '../hooks/useStoreData';
import { generateManual } from '../utils/generateManual';
import {
    Save,
    FileText,
    Download,
    Clock,
    DollarSign,
    Calendar,
    Building2,
    Wallet,
    Link as LinkIcon,
    Printer
} from 'lucide-react';

const Settings: React.FC = () => {
    const { storeConfig, setStoreConfig } = useStoreData();
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        pro_labore: '',
        work_days_per_month: '',
        work_hours_per_day: '',
        company_name: '',
        company_email: '',
        company_phone: '',
        company_address: '',
        company_cnpj: '',
        company_website: '',
        printing_cost: ''
    });

    // Sync with storeConfig on load
    useEffect(() => {
        if (storeConfig) {
            setFormData({
                pro_labore: String(storeConfig.pro_labore || ''),
                work_days_per_month: String(storeConfig.work_days_per_month || ''),
                work_hours_per_day: String(storeConfig.work_hours_per_day || ''),
                company_name: storeConfig.company_name || '',
                company_email: storeConfig.company_email || '',
                company_phone: storeConfig.company_phone || '',
                company_address: storeConfig.company_address || '',
                company_cnpj: storeConfig.company_cnpj || '',
                company_website: storeConfig.company_website || '',
                printing_cost: String(storeConfig.printing_cost || '')
            });
        }
    }, [storeConfig]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setStoreConfig({
                id: storeConfig.id,
                pro_labore: parseFloat(formData.pro_labore) || 0,
                work_days_per_month: parseFloat(formData.work_days_per_month) || 0,
                work_hours_per_day: parseFloat(formData.work_hours_per_day) || 0,
                company_name: formData.company_name,
                company_email: formData.company_email,
                company_phone: formData.company_phone,
                company_address: formData.company_address,
                company_cnpj: formData.company_cnpj,
                company_website: formData.company_website,
                printing_cost: parseFloat(formData.printing_cost) || 0
            });
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    };

    // Calculations
    const proLaboreNum = parseFloat(formData.pro_labore) || 0;
    const daysNum = parseFloat(formData.work_days_per_month) || 0;
    const hoursNum = parseFloat(formData.work_hours_per_day) || 0;
    const totalHours = daysNum * hoursNum;
    const hourlyRate = totalHours > 0 ? proLaboreNum / totalHours : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações do Negócio</h2>
                    <p className="text-sm text-gray-500 font-medium">Gerencie seus parâmetros de precificação e dados da empresa.</p>
                </div>
                <button
                    onClick={generateManual}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Baixar Manual PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* Left Column: Company Data */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5 h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 leading-tight">Dados da Empresa</h3>
                            <p className="text-[11px] text-gray-500">Informações para orçamentos e relatórios</p>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Nome da Empresa / Ateliê</label>
                            <input
                                type="text"
                                className="w-full px-3 h-9 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-xs"
                                value={formData.company_name}
                                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">CNPJ / CPF</label>
                                <input
                                    type="text"
                                    className="w-full px-3 h-9 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-xs"
                                    value={formData.company_cnpj}
                                    onChange={e => setFormData({ ...formData, company_cnpj: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Telefone</label>
                                <input
                                    type="text"
                                    className="w-full px-3 h-9 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-xs"
                                    value={formData.company_phone}
                                    onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email de Contato</label>
                            <input
                                type="email"
                                className="w-full px-3 h-9 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-xs"
                                value={formData.company_email}
                                onChange={e => setFormData({ ...formData, company_email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Endereço Completo</label>
                            <textarea
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-xs min-h-[60px] resize-none"
                                value={formData.company_address}
                                rows={3}
                                onChange={e => setFormData({ ...formData, company_address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Site / Instagram</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-3 h-9 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 text-xs"
                                    placeholder="@seu.instagram"
                                    value={formData.company_website}
                                    onChange={e => setFormData({ ...formData, company_website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center justify-center gap-2 group text-sm"
                            >
                                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Financial & Other */}
                <div className="space-y-4">

                    {/* Financial Parameters */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">Parâmetros Financeiros</h3>
                                <p className="text-[11px] text-gray-500">Definição de salário e jornada</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Pro-Labore Mensal</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-9 pr-3 h-10 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 text-sm"
                                        value={formData.pro_labore}
                                        onChange={e => setFormData({ ...formData, pro_labore: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Dias / Mês</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-9 pr-3 h-10 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 text-sm"
                                            value={formData.work_days_per_month}
                                            onChange={e => setFormData({ ...formData, work_days_per_month: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Horas / Dia</label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-9 pr-3 h-10 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 text-sm"
                                            value={formData.work_hours_per_day}
                                            onChange={e => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Green Box */}
                            <div className="bg-emerald-50 rounded-lg p-4 flex items-center justify-between border border-emerald-100">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Valor da sua Hora</p>
                                    <p className="text-[11px] text-emerald-600/70 font-medium">Baseado em {totalHours || 0}h mensais</p>
                                </div>
                                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                                    R$ {hourlyRate.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Standard COSTS (Printing) */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
                        <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 leading-tight">Custos Variáveis Padrão</h3>
                                <p className="text-[11px] text-gray-500">Custos aplicados na formação do preço</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Custo de Impressão (Por folha/unidade)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full pl-9 pr-3 h-10 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-gray-900 text-sm"
                                        value={formData.printing_cost}
                                        onChange={e => setFormData({ ...formData, printing_cost: e.target.value })}
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Este valor será sugerido automaticamente ao criar novos produtos.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
