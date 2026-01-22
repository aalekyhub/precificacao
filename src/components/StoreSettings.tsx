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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">

      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações do Negócio</h2>
          <p className="text-gray-500 mt-1 font-medium">Gerencie seus parâmetros de precificação.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* Left Column: Company Data */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Dados da Empresa</h3>
          </div>

          {/* Inputs */}
          <div className="space-y-4 flex-1">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Nome da Empresa</label>
                <input
                  type="text"
                  className="w-full px-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 shadow-sm"
                  value={formData.company_name}
                  placeholder="Ex: Meu Ateliê"
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              <div className="col-span-1 space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">CNPJ / CPF</label>
                <input
                  type="text"
                  className="w-full px-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 shadow-sm"
                  value={formData.company_cnpj}
                  onChange={e => setFormData({ ...formData, company_cnpj: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 shadow-sm"
                  value={formData.company_email}
                  onChange={e => setFormData({ ...formData, company_email: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Telefone</label>
                <input
                  type="text"
                  className="w-full px-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 shadow-sm"
                  value={formData.company_phone}
                  onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Endereço</label>
              <textarea
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 shadow-sm min-h-[80px] resize-none"
                value={formData.company_address}
                rows={2}
                onChange={e => setFormData({ ...formData, company_address: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Site / Instagram</label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 shadow-sm"
                  placeholder="@seu.instagram"
                  value={formData.company_website}
                  onChange={e => setFormData({ ...formData, company_website: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-2 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Salvando...' : 'Salvar Dados da Empresa'}
            </button>
          </div>
        </div>

        {/* Right Column: Financial & Other */}
        <div className="flex flex-col gap-4 h-full">

          {/* Financial Parameters */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Wallet className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Parâmetros Financeiros</h3>
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Pro-Labore</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 shadow-sm"
                      value={formData.pro_labore}
                      onChange={e => setFormData({ ...formData, pro_labore: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Custo Impressão</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-gray-900 shadow-sm"
                      value={formData.printing_cost}
                      onChange={e => setFormData({ ...formData, printing_cost: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Dias / Mês</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 shadow-sm"
                      value={formData.work_days_per_month}
                      onChange={e => setFormData({ ...formData, work_days_per_month: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block ml-1">Horas / Dia</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-10 pr-4 h-11 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 shadow-sm"
                      value={formData.work_hours_per_day}
                      onChange={e => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Green Box */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-100 p-4 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Valor da sua Hora</p>
                  <p className="text-xs text-emerald-600/70">{totalHours || 0}h mensais</p>
                </div>
                <div className="text-2xl font-black text-emerald-600 tracking-tight">
                  R$ {hourlyRate.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={generateManual}
            className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-all border border-indigo-100 flex items-center justify-center gap-2 group"
          >
            <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
            BAIXAR MANUAL DO SISTEMA (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
