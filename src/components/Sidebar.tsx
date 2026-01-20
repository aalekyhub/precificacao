
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  X,
  Calculator,
  Receipt,
  Users,
  FileText
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const location = useLocation();

  const links = [
    { name: 'Painel de Controle', icon: LayoutDashboard, path: '/' },
    { name: 'Meus Materiais', icon: Package, path: '/materials' },
    { name: 'Meus Produtos', icon: Layers, path: '/products' },
    { name: 'Custos Fixos', icon: Calculator, path: '/fixed-costs' },
    { name: 'Clientes / Fornecedores', icon: Users, path: '/contacts' },
    { name: 'Fluxo de Caixa', icon: FileText, path: '/quotes' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-2 rounded-lg shadow-lg shadow-rose-200">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 font-serif tracking-tight">Precifica</span>
        </div>
        <button onClick={toggle} className="lg:hidden text-gray-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="mt-8 px-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => toggle()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                  ? 'bg-rose-50 text-rose-600 font-semibold shadow-sm shadow-rose-100'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className="w-5 h-5" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl shadow-xl">
          <p className="text-[10px] text-rose-400 font-bold uppercase tracking-widest mb-1">Assinatura</p>
          <p className="text-sm font-semibold text-white font-serif">Artesã Profissional</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden mr-3">
              <div className="h-full bg-rose-500 w-3/4"></div>
            </div>
            <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">75%</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
