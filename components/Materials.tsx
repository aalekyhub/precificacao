
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Trash2, 
  Filter, 
  X, 
  ArrowRight, 
  Edit3, 
  Tag, 
  Save, 
  Info,
  Package,
  AlertTriangle,
  // Fix: Added missing Calculator import
  Calculator
} from 'lucide-react';
import { Material, Unit, MaterialCategory } from '../types';

interface MaterialsProps {
  materials: Material[];
  onAdd: (m: Material) => void;
  onUpdate: (m: Material) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: MaterialCategory[] = ['Papelaria', 'Tecidos', 'Aviamentos', 'Embalagens', 'Outros'];

const UNIT_LABELS: Record<Unit, string> = {
  [Unit.CM]: 'Centímetro (CM) - fitas de cetim, cordões',
  [Unit.G]: 'Gramas (G) - manteiga, cacau em pó, queijo',
  [Unit.KG]: 'quilograma (KG) - farinha, açucar, chocolate barra',
  [Unit.LT]: 'Litro (LT) - cola, tinta acrílica, verniz',
  [Unit.M2]: 'Metro quadrado (M2) - papel scrapbook, tecido estampado',
  [Unit.ML]: 'Mililitro (ML) - essência perfumada, glitter líquido',
  [Unit.MT]: 'Metro (MT) - papel cartão, juta, TNT',
  [Unit.PCT]: 'Pacote (PCT) - miçangas, pérolas, botões',
  [Unit.UN]: 'Unidade (UN) - tags, envelopes, brindes'
};

const Materials: React.FC<MaterialsProps> = ({ materials, onAdd, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [formState, setFormState] = useState<Partial<Material>>({
    name: '',
    category: 'Outros',
    cost: 0,
    quantity: 1,
    unit: Unit.UN,
    observations: '',
    stock: 0,
    minStock: 0
  });

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [materials, search, categoryFilter]);

  const openModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormState(material);
    } else {
      setEditingMaterial(null);
      setFormState({ 
        name: '', 
        category: 'Outros', 
        cost: 0, 
        quantity: 1, 
        unit: Unit.UN,
        observations: '',
        stock: 0,
        minStock: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.name) return;
    
    const materialData = {
      ...formState,
      id: editingMaterial ? editingMaterial.id : Math.random().toString(36).substr(2, 9),
      category: formState.category || 'Outros',
      cost: Number(formState.cost) || 0,
      quantity: Number(formState.quantity) || 1,
      stock: Number(formState.stock) || 0,
      minStock: Number(formState.minStock) || 0,
      unit: formState.unit || Unit.UN
    } as Material;

    if (editingMaterial) {
      onUpdate(materialData);
    } else {
      onAdd(materialData);
    }
    setIsModalOpen(false);
  };

  const unitPrice = useMemo(() => {
    const cost = Number(formState.cost) || 0;
    const qty = Number(formState.quantity) || 1;
    return cost / qty;
  }, [formState.cost, formState.quantity]);

  const totalInvested = useMemo(() => {
    return materials.reduce((acc, m) => acc + m.cost, 0);
  }, [materials]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Insumos e Materiais</h2>
          <p className="text-gray-500 mt-2 font-medium">Gerencie sua matéria-prima e controle de estoque com precisão.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 hover:-translate-y-0.5 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Material
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-500" /> Filtros Rápidos
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Pesquisar</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Nome do insumo..." 
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-transparent border-2 rounded-2xl text-sm focus:bg-white focus:border-rose-500 outline-none transition-all font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Categoria</label>
                <select 
                  className="w-full px-4 py-3.5 bg-gray-50 border-transparent border-2 rounded-2xl text-sm outline-none font-medium text-gray-600 cursor-pointer focus:bg-white focus:border-rose-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="Todas">Todas as Categorias</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
             <div className="relative z-10">
               <div className="bg-rose-500 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-rose-200">
                 <Package className="w-6 h-6 text-white" />
               </div>
               <h4 className="font-bold text-gray-400 text-xs uppercase tracking-widest">Valor em Estoque</h4>
               <p className="text-3xl font-bold mt-1 text-gray-900">R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
             </div>
             <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-gray-50 rounded-full scale-150 blur-3xl opacity-50 group-hover:bg-rose-50 transition-colors duration-500"></div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Material</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Categoria</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estoque Atual</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custo Unitário</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-40 text-center">
                        <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Layers className="w-10 h-10" />
                        </div>
                        <p className="text-gray-400 font-bold text-lg">Nenhum material encontrado</p>
                        <p className="text-gray-300 text-sm">Tente ajustar seus filtros ou cadastrar um novo item.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:scale-110 group-hover:text-rose-500 group-hover:border-rose-100 transition-all shadow-sm">
                              <Layers className="w-6 h-6" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 block text-base">{m.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Ref: {m.id.toUpperCase()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 px-3.5 py-1.5 rounded-full text-[10px] font-bold">
                            <Tag className="w-3 h-3" />
                            {m.category}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                             <div className="flex items-center gap-2">
                               <span className={`font-black text-base ${m.stock <= m.minStock ? 'text-rose-500' : 'text-gray-700'}`}>
                                 {m.stock} {m.unit}
                               </span>
                               {m.stock <= m.minStock && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                             </div>
                             {m.stock <= m.minStock && <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Reposição Necessária</span>}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-black text-lg">
                              R$ {(m.cost / m.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold uppercase">por {m.unit}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button onClick={() => openModal(m)} className="p-3 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Editar">
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button onClick={() => onDelete(m.id)} className="p-3 bg-gray-50 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Excluir">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Modal Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
            {/* Header */}
            <div className="px-10 py-8 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-100 text-white">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-serif">
                    {editingMaterial ? 'Editar Material' : 'Cadastrar Material'}
                  </h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Gestão de Insumos</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="px-10 py-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome do Material</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-700"
                    placeholder="Ex: Tecido Algodão Premium"
                    value={formState.name}
                    onChange={(e) => setFormState({...formState, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-700 appearance-none"
                    value={formState.category}
                    onChange={(e) => setFormState({...formState, category: e.target.value as MaterialCategory})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Unidade de Compra</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-700 appearance-none"
                    value={formState.unit}
                    onChange={(e) => setFormState({...formState, unit: e.target.value as Unit})}
                  >
                    <option value="" disabled>Selecione uma unidade</option>
                    {Object.entries(UNIT_LABELS).map(([unit, label]) => (
                      <option key={unit} value={unit}>{label}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Price and Quantity Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preço Total Pago</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</div>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-14 pr-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800 text-lg"
                        placeholder="0,00"
                        value={formState.cost}
                        onChange={(e) => setFormState({...formState, cost: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantidade por Embalagem</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-800"
                      value={formState.quantity}
                      onChange={(e) => setFormState({...formState, quantity: parseFloat(e.target.value) || 1})}
                    />
                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-wider ml-1 italic">
                      Conversão: Qtd de {formState.unit} por embalagem
                    </p>
                  </div>
                </div>

                {/* Calculation Preview Card */}
                <div className="bg-blue-50/50 p-8 rounded-[2rem] border-2 border-blue-100/50 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-xl text-white">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Custo Unitário</span>
                  </div>
                  <p className="text-4xl font-black text-blue-700 tracking-tight">
                    R$ {unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-400 font-bold mt-2 uppercase tracking-wide italic">Preço por {formState.unit}</p>
                </div>
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Observações do Insumo</label>
                <textarea 
                  rows={3}
                  className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-medium text-gray-700 resize-none"
                  placeholder="Notas sobre qualidade, fornecedor ou armazenamento..."
                  value={formState.observations}
                  onChange={(e) => setFormState({...formState, observations: e.target.value})}
                />
              </div>

              {/* Stock Group */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Estoque Atual</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700"
                    value={formState.stock}
                    onChange={(e) => setFormState({...formState, stock: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 text-rose-500">Aviso de Estoque Mínimo</label>
                  <input 
                    type="number" 
                    className="w-full bg-rose-50/30 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-rose-500 transition-all font-bold text-rose-500"
                    value={formState.minStock}
                    onChange={(e) => setFormState({...formState, minStock: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-10 py-10 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <div className="hidden sm:flex items-center gap-3 text-gray-400">
                <Info className="w-5 h-5 text-blue-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Custo calculado em tempo real</span>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 sm:flex-none px-8 py-4 bg-white border-2 border-gray-200 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={!formState.name}
                  className="flex-1 sm:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 active:scale-95"
                >
                  <Save className="w-5 h-5" />
                  {editingMaterial ? 'Atualizar Material' : 'Salvar Material'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
