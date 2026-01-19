
import React from 'react';
import { Settings, Printer, Clock, TrendingUp, Save, Wallet } from 'lucide-react';
import { StoreConfig } from '../types';

interface StoreSettingsProps {
  config: StoreConfig;
  onUpdate: (c: StoreConfig) => void;
}

const StoreSettings: React.FC<StoreSettingsProps> = ({ config, onUpdate }) => {
  const inkCostPerPage = config.inkKitCost / config.inkYieldPages;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 font-serif">Configurações do Ateliê</h2>
        <p className="text-gray-500 mt-1">Ajuste os valores base que serão usados nos seus cálculos de precificação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
              <Printer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Custo de Impressão</h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Calculadora de Tinta</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Preço do Kit de Tintas (R$)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                value={config.inkKitCost}
                onChange={(e) => onUpdate({...config, inkKitCost: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Rendimento Médio (Páginas)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold"
                value={config.inkYieldPages}
                onChange={(e) => onUpdate({...config, inkYieldPages: parseFloat(e.target.value) || 1})}
              />
            </div>

            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
              <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Custo por Página Impressa</p>
              <p className="text-3xl font-black text-blue-600 font-serif">R$ {inkCostPerPage.toLocaleString('pt-BR', { minimumFractionDigits: 4 })}</p>
              <p className="text-[10px] text-blue-400 mt-2 italic">* Este valor será somado automaticamente ao Produto quando você indicar páginas impressas.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-100">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Mão de Obra e Escala</h3>
              <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Padrões do Negócio</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Valor da Hora Base (R$)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold"
                value={config.laborRateDefault}
                onChange={(e) => onUpdate({...config, laborRateDefault: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Horas Produtivas/Mês</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold"
                  value={config.monthlyWorkingHours}
                  onChange={(e) => onUpdate({...config, monthlyWorkingHours: parseFloat(e.target.value) || 1})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Margem Padrão (%)</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:bg-white focus:border-rose-500 outline-none transition-all font-bold"
                  value={config.defaultMarkup}
                  onChange={(e) => onUpdate({...config, defaultMarkup: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>

            <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-rose-400" />
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Absorção de Custo Fixo</p>
              </div>
              <p className="text-xs text-rose-500 leading-relaxed">
                Suas horas produtivas servem para diluir o aluguel, luz e internet. Quanto mais horas você trabalha, menor o custo fixo por peça.
              </p>
            </div>
            
            <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
               <Save className="w-5 h-5" />
               Salvar Preferências
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
