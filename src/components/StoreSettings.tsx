import React, { useState, useEffect } from 'react';
import { Settings, Wallet, Clock, Calendar, Save, FileText, Download, DollarSign } from 'lucide-react';
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
    company_phone: storeConfig.company_phone || ''
  });

  // Sync with storeConfig updates
  useEffect(() => {
    setFormData({
      pro_labore: String(storeConfig.pro_labore || ''),
      work_days_per_month: String(storeConfig.work_days_per_month || ''),
      work_hours_per_day: String(storeConfig.work_hours_per_day || ''),
      company_name: storeConfig.company_name || '',
      company_email: storeConfig.company_email || '',
      company_phone: storeConfig.company_phone || ''
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
        company_phone: formData.company_phone
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Configurações do Negócio</h2>
        <p className="text-gray-500 mt-1">Defina quanto você quer ganhar para saber quanto vale sua hora.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm md:col-span-1 space-y-8">
          {/* Parâmetros de Produção */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Parâmetros de Produção</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Salário Desejado (Pro-labore) R$</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-md outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900 text-lg"
                    value={formData.pro_labore}
                    onChange={e => setFormData({ ...formData, pro_labore: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Dias / Mês</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-md outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900"
                      value={formData.work_days_per_month}
                      onChange={e => setFormData({ ...formData, work_days_per_month: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Horas / Dia</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-100 rounded-md outline-none focus:bg-white focus:border-indigo-500 font-bold text-gray-900"
                      value={formData.work_hours_per_day}
                      onChange={e => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between mt-6">
                <div>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Valor da sua Hora</p>
                  <p className="text-xs text-emerald-600/70">Baseado em {totalHoursMonth} horas mensais</p>
                </div>
                <p className="text-4xl font-black text-emerald-600">
                  R$ {hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Dados da Empresa */}
          <div className="pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Dados da Empresa</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Nome do Ateliê / Empresa</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-md outline-none focus:bg-white focus:border-indigo-500 font-medium text-gray-900"
                  value={formData.company_name}
                  placeholder="Ex: Doce Ateliê"
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Email de Contato</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-md outline-none focus:bg-white focus:border-indigo-500 font-medium text-gray-900"
                  value={formData.company_email}
                  placeholder="contato@atelie.com"
                  onChange={e => setFormData({ ...formData, company_email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Telefone / WhatsApp</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-md outline-none focus:bg-white focus:border-indigo-500 font-medium text-gray-900"
                  value={formData.company_phone}
                  placeholder="(00) 00000-0000"
                  onChange={e => setFormData({ ...formData, company_phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 bg-gray-900 text-white rounded-md font-bold text-lg hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-[0.98] flex items-center justify-center gap-3"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>

        {/* Manual Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-lg text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <FileText className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-500" />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">Manual do Sistema</h3>
              <p className="text-indigo-100 mb-8 max-w-xs">Baixe o tutorial completo em PDF explicando como cadastrar materiais, precificar e gerar orçamentos.</p>

              <button
                onClick={generateManual}
                className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-all active:scale-95"
              >
                <Download className="w-5 h-5" />
                Baixar Tutorial PDF
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2">Precisa de Ajuda?</h4>
            <p className="text-sm text-gray-500">O manual explica o passo a passo de:</p>
            <ul className="mt-4 space-y-2 text-sm font-medium text-gray-600">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Cadastro de Materiais</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Criação de Receitas</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>Cálculo de Lucro Real</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
