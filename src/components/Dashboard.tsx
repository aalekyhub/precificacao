
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
import { api, Produto, Insumo } from '../api/client';
import { Order, FixedCost } from '../types';

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
  const [fixedCosts, setFixedCosts] = React.useState<FixedCost[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, m, f, o] = await Promise.all([
          api.get<Produto[]>('/produtos'),
          api.get<Insumo[]>('/insumos'),
          api.get<FixedCost[]>('/fixos'),
          api.get<Order[]>('/orders')
        ]);
        setProducts(p);
        setMaterials(m);
        setFixedCosts(f);
        setOrders(o);
      } catch (e) {
        console.error("Dashboard fetch error", e);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    // 1. Calculate Active Products
    const activeProducts = products.length;

    // 2. Calculate Total Invested in Materials (Stock * Price)
    // Note: Since 'stock' is on Material interface, we use it directly.
    const totalInvested = materials.reduce((acc, m) => acc + (Number(m.price) * (m.stock || 0)), 0);

    // 3. Calculate Fixed Expenses (Sum of individual fixed costs)
    // As these are recurring monthly costs, the "Total Fixed Cost" is the sum of all items in the FixedCost table.
    const currentFixedCost = fixedCosts.reduce((acc, fc) => acc + Number(fc.value), 0);

    // 4. Calculate Total Revenue (All time or Monthly? Let's do All Time for the card, or Current Month)
    // Card says "Receita Prevista". Let's use "Receita Total Confirmada" (Approved/Completed)
    const totalRevenue = orders
      .filter(o => o.status === 'approved' || o.status === 'completed')
      .reduce((acc, o) => acc + Number(o.total_value), 0);

    // Trend calc could be done if we had comparison. For now, static.

    return {
      totalInvested: `R$ ${totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      totalFixed: `R$ ${currentFixedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      activeProducts: activeProducts.toString(),
      totalRevenue: `R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      avgMargin: '20%'
    };
  }, [products, materials, fixedCosts, orders]);

  const chartData = useMemo(() => {
    // Group last 6 months
    const today = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      return {
        month: d.toLocaleString('pt-BR', { month: 'short' }),
        year: d.getFullYear(),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        revenue: 0,
        costs: 0
      };
    }).reverse();

    // Map to access easily
    const dataMap = new Map(last6Months.map(m => [m.key, m]));

    // Fill Revenue from Orders
    orders.forEach(order => {
      if (order.status === 'canceled') return;
      const date = new Date(order.created_at || order.date || new Date());
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const item = dataMap.get(key);
      if (item) {
        item.revenue += Number(order.total_value);

        // Calculate Variable Costs (Material) for this order
        // We need to iterate over items -> product -> bomItems
        let orderMaterialCost = 0;
        if (order.items && order.items.length > 0) {
          order.items.forEach(orderItem => {
            const product = products.find(p => p.id === orderItem.product_id || p.name === orderItem.name); // Try match by ID or Name
            if (product && product.bomItems) {
              const unitMatCost = product.bomItems.reduce((acc, bom) => {
                const mat = materials.find(m => m.id === bom.insumoId);
                return acc + (Number(bom.qtyPerUnit) * (Number(mat?.price) || 0));
              }, 0);
              orderMaterialCost += unitMatCost * orderItem.quantity;
            }
          });
        }
        item.costs += orderMaterialCost;
      }
    });

    // Add Fixed Costs to each month (Base cost)
    // Since fixed costs are recurring monthly, we add the total monthly fixed cost to every month.
    const monthlyFixedCost = fixedCosts.reduce((acc, fc) => acc + Number(fc.value), 0);

    last6Months.forEach(m => {
      m.costs += monthlyFixedCost;
    });

    return last6Months.map(m => ({
      name: m.month,
      revenue: m.revenue,
      costs: m.costs
    }));
  }, [orders, fixedCosts, products, materials]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Painel de Controle</h2>
          <p className="text-gray-500 mt-2 font-medium">Bom dia, Mariana! Aqui está o resumo do seu ateliê hoje.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Receita (Realizada)" value={stats.totalRevenue} icon={DollarSign} trend="" color="bg-rose-500" subtext="Vendas aprovadas/concluídas" />
        <StatCard title="Despesa Fixa (Mês)" value={stats.totalFixed} icon={Receipt} color="bg-orange-400" subtext="Custos recorrentes atuais" />
        <StatCard title="Produtos Ativos" value={stats.activeProducts} icon={Package} color="bg-indigo-500" subtext="No catálogo online" />
        <StatCard title="Investido (Estoque)" value={stats.totalInvested} icon={Package} color="bg-teal-500" subtext="Valor em materiais" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 font-serif">Performance de Vendas</h3>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block mr-1"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-4">Receita</span>
              <span className="w-3 h-3 rounded-full bg-gray-300 inline-block mr-1"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Custos</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
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
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
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
                <th className="pb-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Venda</th>
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
                          {/* Placeholder image */}
                          <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300 font-bold text-xs">{item.name.substring(0, 2).toUpperCase()}</div>
                        </div>
                        <span className="font-bold text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <span className="text-gray-600 text-sm font-bold">R$ {Number(item.selling_price || 0).toFixed(2)}</span>
                    </td>
                    <td className="py-5">
                      <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-100">{item.profit_margin || 0}%</span>
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
