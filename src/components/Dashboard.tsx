
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, Produto, Insumo, FixosMensais } from '../api/client';



const data = [
  { name: 'Jan', revenue: 4000, costs: 2400 },
  { name: 'Fev', revenue: 3000, costs: 1398 },
  { name: 'Mar', revenue: 2000, costs: 2800 },
  { name: 'Abr', revenue: 2780, costs: 3908 },
  { name: 'Mai', revenue: 1890, costs: 4800 },
  { name: 'Jun', revenue: 2390, costs: 3800 },
];

const StatCard = ({ title, value, icon: Icon, trend, color, subtext }: any) => (
  <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`${color} p-4 rounded-2xl shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-green-100">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 font-serif">{value}</h3>
      {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [products, setProducts] = React.useState<Produto[]>([]);
  const [materials, setMaterials] = React.useState<Insumo[]>([]);
  const [fixedCosts, setFixedCosts] = React.useState<FixosMensais[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, m, f] = await Promise.all([
          api.get<Produto[]>('/produtos'),
          api.get<Insumo[]>('/insumos'),
          api.get<FixosMensais[]>('/fixos')
        ]);
        setProducts(p);
        setMaterials(m);
        setFixedCosts(f);
      } catch (e) { console.error("Dashboard fetch error", e); }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalInvested = materials.reduce((acc, m) => acc + (Number(m.unitCost) * 1), 0); // Assuming 1 unit stock for now as stock isn't in Insumo model yet
    const activeProducts = products.length;
    const totalFixed = fixedCosts.length > 0 ? Number(fixedCosts[0].totalFixedCosts) : 0;

    return {
      totalInvested: `R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      totalFixed: `R$ ${totalFixed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      activeProducts: activeProducts.toString(),
      avgMargin: '20%' // Placeholder as margin is calculated per deal
    };
  }, [products, materials, fixedCosts]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Painel de Controle</h2>
          <p className="text-gray-500 mt-2 font-medium">Bom dia, Mariana! Aqui está o resumo do seu ateliê hoje.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Receita Prevista" value="R$ 8.240,00" icon={DollarSign} trend="+12%" color="bg-rose-500" subtext="Estimativa baseada em estoque" />
        <StatCard title="Despesa Fixa" value={stats.totalFixed} icon={Receipt} color="bg-orange-400" subtext="Soma de custos recorrentes" />
        <StatCard title="Produtos Ativos" value={stats.activeProducts} icon={Package} color="bg-indigo-500" subtext="No catálogo online" />
        <StatCard title="Investido em Insumos" value={stats.totalInvested} icon={Package} color="bg-teal-500" subtext="Soma de materiais estocados" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 font-serif">Performace de Vendas</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block mr-1"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-4">Receita</span>
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block mr-1"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custos</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="costs" stroke="#cbd5e1" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>


      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-gray-900 font-serif">Catálogo Ativo</h3>
          <Link to="/products" className="text-rose-500 font-bold text-sm hover:underline flex items-center gap-2">
            Ver Todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produto</th>
                <th className="pb-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Sugerido</th>
                <th className="pb-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Margem (%)</th>
                <th className="pb-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-400 font-medium">Cadastre seu primeiro produto para ver aqui.</td>
                </tr>
              ) : (
                products.slice(0, 5).map((item, i) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${item.id}/100/100`} alt="" />
                        </div>
                        <span className="font-bold text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-gray-400 text-sm">Calculado na venda</span>
                    </td>
                    <td className="py-5">
                      <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-[10px] font-bold border border-rose-100">Var.</span>
                    </td>
                    <td className="py-5 text-right">
                      <Link to="/products" className="text-gray-400 hover:text-gray-900 font-bold text-xs">Editar</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
