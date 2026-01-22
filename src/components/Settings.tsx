import React, { useState, useEffect } from 'react';
import { useStoreData } from '../hooks/useStoreData';
import { generateManual } from '../utils/generateManual';
import {
    Save,
    Download,
    Clock,
    DollarSign,
    Calendar,
    Building2,
    Wallet,
    Link as LinkIcon
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
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Configurações do Negócio</h2>
                    <p className="text-xs text-gray-500 font-medium">Gerencie seus parâmetros de precificação.</p>
                </div>
                <button
                    onClick={generateManual}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-[10px] font-bold hover:bg-indigo-100 transition-colors uppercase tracking-wide"
                >
                    <Download className="w-3 h-3" />
                    Baixar Manual PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

                {/* Left Column: Company Data */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3 h-full">
                    {/* Header */}
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                        <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-600">
                            <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-800">Dados da Empresa</h3>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2 space-y-0.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Nome da Empresa</label>
                                <input
                                    type="text"
                                    className="w-full px-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-900 text-xs"
                                    value={formData.company_name}
                                    placeholder="Ex: Meu Ateliê"
                                    onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-1 space-y-0.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">CNPJ / CPF</label>
                                <input
                                    type="text"
                                    className="w-full px-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-900 text-xs"
                                    value={formData.company_cnpj}
                                    onChange={e => setFormData({ ...formData, company_cnpj: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-900 text-xs"
                                    value={formData.company_email}
                                    onChange={e => setFormData({ ...formData, company_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-0.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Telefone</label>
                                <input
                                    type="text"
                                    className="w-full px-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-900 text-xs"
                                    value={formData.company_phone}
                                    onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Endereço</label>
                            <textarea
                                className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-900 text-xs min-h-[40px] resize-none"
                                value={formData.company_address}
                                rows={2}
                                onChange={e => setFormData({ ...formData, company_address: e.target.value })}
                            />
                        </div>

                        <div className="space-y-0.5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Site / Instagram</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-7 pr-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-gray-900 text-xs"
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
                                className="w-full py-2 bg-gray-900 text-white rounded-md font-bold hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 text-xs"
                            >
                                <Save className="w-3.5 h-3.5" />
                                {isSaving ? 'Salvando...' : 'Salvar Dados'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Financial & Other */}
                <div className="space-y-4">

                    {/* Financial Parameters */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                            <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Wallet className="w-3.5 h-3.5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800">Financeiro</h3>
                        </div>

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Pro-Labore</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-7 pr-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-xs"
                                            value={formData.pro_labore}
                                            onChange={e => setFormData({ ...formData, pro_labore: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Custo Impressão</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-7 pr-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-bold text-gray-900 text-xs"
                                            value={formData.printing_cost}
                                            onChange={e => setFormData({ ...formData, printing_cost: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Dias / Mês</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-7 pr-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-xs"
                                            value={formData.work_days_per_month}
                                            onChange={e => setFormData({ ...formData, work_days_per_month: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block ml-0.5">Horas / Dia</label>
                                    <div className="relative">
                                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                        <input
                                            type="number"
                                            className="w-full pl-7 pr-2 h-7 bg-white border border-gray-300 rounded outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-bold text-gray-900 text-xs"
                                            value={formData.work_hours_per_day}
                                            onChange={e => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Green Box */}
                            <div className="bg-emerald-50 rounded border border-emerald-100 p-2 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Valor da sua Hora</p>
                                    <p className="text-[9px] text-emerald-600/70">{totalHours || 0}h mensais</p>
                                </div>
                                <div className="text-lg font-black text-emerald-600 tracking-tight">
                                    R$ {hourlyRate.toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
