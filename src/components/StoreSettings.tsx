
import React from 'react';
import { Settings, Wallet, Clock, Calendar, Save } from 'lucide-react';
import { Settings as SettingsType } from '../types';

interface StoreSettingsProps {
  config: SettingsType;
  onUpdate: (c: SettingsType) => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ config, onUpdate }) => {
  const totalHoursMonth = config.work_days_per_month * config.work_hours_per_day;
  const hourlyRate = totalHoursMonth > 0 ? config.pro_labore / totalHoursMonth : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 font-serif">Configurações do Negócio</h2>
        <p className="text-gray-500 mt-1">Defina quanto você quer ganhar para saber quanto vale sua hora.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
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
              value={config.pro_labore}
              onChange={(e) => onUpdate({ ...config, pro_labore: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Dias Trabalhados/Mês</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold"
                  value={config.work_days_per_month}
                  onChange={(e) => onUpdate({ ...config, work_days_per_month: parseFloat(e.target.value) || 0 })}
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
                  value={config.work_hours_per_day}
                  onChange={(e) => onUpdate({ ...config, work_hours_per_day: parseFloat(e.target.value) || 0 })}
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
            onClick={() => onUpdate(config)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <Save className="w-5 h-5" />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
