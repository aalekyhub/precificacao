import React, { useState, useEffect } from 'react';
import { Settings, Wallet, Clock, Calendar, Save, FileText, Download, DollarSign, Building2 } from 'lucide-react';
import { useStoreData } from '../hooks/useStoreData';
import { generateManual } from '../utils/generateManual';

// Replaced props with useStoreData hook for consistency and independence
const StoreSettings: React.FC = () => {
  const { storeConfig, setStoreConfig } = useStoreData();
  const [isSaving, setIsSaving] = useState(false);

  // Use local state for form inputs
  const [formData, setFormData] = useState({
    pro_labore: String(storeConfig.pro_labore || ''),
    work_days_per_month: String(storeConfig.work_days_per_month || ''),
    work_hours_per_day: String(storeConfig.work_hours_per_day || ''),
    company_name: storeConfig.company_name || '',
    company_email: storeConfig.company_email || '',
    company_phone: storeConfig.company_phone || '',
    company_address: storeConfig.company_address || '',
    company_cnpj: storeConfig.company_cnpj || '',
    company_website: storeConfig.company_website || ''
  });

  // Sync with storeConfig updates
  useEffect(() => {
    setFormData({
      pro_labore: String(storeConfig.pro_labore || ''),
      work_days_per_month: String(storeConfig.work_days_per_month || ''),
      work_hours_per_day: String(storeConfig.work_hours_per_day || ''),
      company_name: storeConfig.company_name || '',
      company_email: storeConfig.company_email || '',
      company_phone: storeConfig.company_phone || '',
      company_address: storeConfig.company_address || '',
      company_cnpj: storeConfig.company_cnpj || '',
      company_website: storeConfig.company_website || ''
    });
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
        company_website: formData.company_website
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  // Derived for display
  const days = parseFloat(formData.work_days_per_month) || 0;
  const hours = parseFloat(formData.work_hours_per_day) || 0;
  const salary = parseFloat(formData.pro_labore) || 0;
  const totalHoursMonth = days * hours;
  const hourlyRate = totalHoursMonth > 0 ? salary / totalHoursMonth : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Configurações do Negócio</h2>
        <p className="text-gray-500 mt-1">Gerencie seus parâmetros de precificação e dados da empresa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Left Column: Financial Parameters */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
              <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Parâmetros Financeiros</h3>
                <p className="text-sm text-gray-500">Definição de salário e jornada</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Pro-labore Mensal</label>
                <div className="relative group">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900 text-lg"
                    value={formData.pro_labore}
                    onChange={e => setFormData({ ...formData, pro_labore: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Dias / Mês</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900"
                      value={formData.work_days_per_month}
                      onChange={e => setFormData({ ...formData, work_days_per_month: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Horas / Dia</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-900"
                      value={formData.work_hours_per_day}
                      onChange={e => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest mb-1">Valor da sua Hora</p>
                  <p className="text-sm text-emerald-600/70 font-medium">Baseado em {totalHoursMonth}h mensais</p>
                </div>
                <p className="text-4xl font-black text-emerald-600 tracking-tight">
                  R$ {hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Card (Moved to left column bottom) */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-2xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
            <FileText className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-500" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Manual do Sistema</h3>
              <p className="text-indigo-100 mb-6 max-w-xs text-sm leading-relaxed">Baixe o tutorial completo em PDF explicando como cadastrar materiais, precificar e gerar orçamentos.</p>
              <button
                onClick={generateManual}
                className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-indigo-50 transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Baixar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Company Data */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8 h-fit">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Dados da Empresa</h3>
              <p className="text-sm text-gray-500">Informações para orçamentos e relatórios</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Nome da Empresa / Ateliê</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
                placeholder="Ex: Doce Encanto Ateliê"
                value={formData.company_name}
                onChange={e => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">CNPJ / CPF</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
                  placeholder="00.000.000/0001-00"
                  value={formData.company_cnpj}
                  onChange={e => setFormData({ ...formData, company_cnpj: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Telefone</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
                  placeholder="(00) 00000-0000"
                  value={formData.company_phone}
                  onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Email de Contato</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
                placeholder="contato@empresa.com"
                value={formData.company_email}
                onChange={e => setFormData({ ...formData, company_email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Endereço Completo</label>
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 resize-none h-24"
                placeholder="Rua das Flores, 123 - Centro&#10;São Paulo - SP&#10;CEP: 01234-567"
                value={formData.company_address}
                onChange={e => setFormData({ ...formData, company_address: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Site / Instagram</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900"
                placeholder="@seu.instagram"
                value={formData.company_website}
                onChange={e => setFormData({ ...formData, company_website: e.target.value })}
              />
            </div>

            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">Todas as informações serão usadas na geração de orçamentos.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StoreSettings;
