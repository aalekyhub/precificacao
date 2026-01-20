
import React from 'react';
import { Settings, Wallet, Clock, Calendar, Save, FileText, Download } from 'lucide-react';
import { Settings as SettingsType } from '../types';
import { generateManual } from '../utils/generateManual';

interface StoreSettingsProps {
  config: SettingsType;
  onUpdate: (c: SettingsType) => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ config, onUpdate }) => {
  // Use local state for form inputs to allow typing freely (strings)
  const [formData, setFormData] = React.useState({
    pro_labore: String(config.pro_labore || ''),
    work_days_per_month: String(config.work_days_per_month || ''),
    work_hours_per_day: String(config.work_hours_per_day || '')
  });

  // Sync with prop updates (initial load)
  React.useEffect(() => {
    setFormData({
      pro_labore: String(config.pro_labore || ''),
      work_days_per_month: String(config.work_days_per_month || ''),
      work_hours_per_day: String(config.work_hours_per_day || '')
    });
  }, [config]);

  const handleSave = () => {
    onUpdate({
      ...config,
      pro_labore: parseFloat(formData.pro_labore) || 0,
      work_days_per_month: parseFloat(formData.work_days_per_month) || 0,
      work_hours_per_day: parseFloat(formData.work_hours_per_day) || 0
    });
    alert('Configurações salvas!');
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
        <h2 className="text-3xl font-bold text-gray-900 font-serif">Configurações do Negócio</h2>
        <p className="text-gray-500 mt-1">Defina quanto você quer ganhar para saber quanto vale sua hora.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 h-fit">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-100">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Pro-labore e Jornada</h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Definição de Salário</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Salário Desejado (Pro-labore) R$</label>
              <input
                type="number"
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-lg"
                value={formData.pro_labore}
                onChange={(e) => setFormData({ ...formData, pro_labore: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Dias Trabalhados/Mês</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold"
                    value={formData.work_days_per_month}
                    onChange={(e) => setFormData({ ...formData, work_days_per_month: e.target.value })}
                  />
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Horas Trabalhadas/Dia</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold"
                    value={formData.work_hours_per_day}
                    onChange={(e) => setFormData({ ...formData, work_hours_per_day: e.target.value })}
                  />
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1">Valor da sua Hora</p>
                <p className="text-xs text-emerald-600/70">Baseado em {totalHoursMonth} horas mensais</p>
              </div>
              <p className="text-4xl font-black text-emerald-600 font-serif">
                R$ {hourlyRate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              <Save className="w-5 h-5" />
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Manual Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <FileText className="absolute -right-6 -bottom-6 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform duration-500" />

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
