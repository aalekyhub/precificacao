import React, { useState } from 'react';
import { useStoreData } from '../hooks/useStoreData';
import { generateManual } from '../utils/generateManual';
import {
    Settings as SettingsIcon,
    Save,
    FileText,
    Download,
    Clock,
    DollarSign,
    Calendar
} from 'lucide-react';

const Settings: React.FC = () => {
    const { storeConfig, setStoreConfig } = useStoreData();
    const [isSaving, setIsSaving] = useState(false);

    // Local state for form to avoid debouncing issues on global state if we wanted, 
    // but storeConfig updates are usually fast enough relative to blur.
    // For simplicity, we'll control inputs directly with storeConfig values for now,
    // or better, use local state and save on button click to be safe.
    const [formData, setFormData] = useState({
        pro_labore: storeConfig.pro_labore,
        work_days_per_month: storeConfig.work_days_per_month,
        work_hours_per_day: storeConfig.work_hours_per_day
    });

    // Sync when storeConfig loads initial data
    React.useEffect(() => {
        setFormData({
            pro_labore: storeConfig.pro_labore,
            work_days_per_month: storeConfig.work_days_per_month,
            work_hours_per_day: storeConfig.work_hours_per_day
        });
    }, [storeConfig]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setStoreConfig({
                id: storeConfig.id,
                ...formData
            });
            alert('Configurações salvas com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Configurações</h2>
                    <p className="text-gray-500 mt-2 font-medium">Definições globais do seu negócio.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Configuration Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm md:col-span-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-indigo-600" />
                        Parâmetros de Produção
                    </h3>

                    <div className="space-y-6">
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-50">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Pro-Labore Mensal (Salário)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                                <input
                                    type="number"
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-indigo-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 text-lg"
                                    value={formData.pro_labore}
                                    onChange={e => setFormData({ ...formData, pro_labore: Number(e.target.value) })}
                                />
                            </div>
                            <p className="text-xs text-indigo-400 mt-2 font-medium">Define o valor base da sua hora de trabalho.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Dias / Mês</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900"
                                        value={formData.work_days_per_month}
                                        onChange={e => setFormData({ ...formData, work_days_per_month: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Horas / Dia</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900"
                                        value={formData.work_hours_per_day}
                                        onChange={e => setFormData({ ...formData, work_hours_per_day: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </div>

                {/* Documentation Card */}
                <div className="space-y-6 md:col-span-1">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
                        <FileText className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Manual do Sistema</h3>
                            <p className="text-indigo-100 mb-8 max-w-xs">Baixe o tutorial completo em PDF explicando como cadastrar materiais, precificar e gerar orçamentos.</p>

                            <button
                                onClick={generateManual}
                                className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
                            >
                                <Download className="w-5 h-5" />
                                Baixar Tutorial PDF
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-4">Resumo da sua Hora</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Horas Mensais</span>
                                <span className="font-bold text-gray-900">{formData.work_days_per_month * formData.work_hours_per_day}h</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-sm text-gray-500">Valor Hora (Mão de Obra)</span>
                                <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    R$ {((formData.pro_labore / (formData.work_days_per_month * formData.work_hours_per_day)) || 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
