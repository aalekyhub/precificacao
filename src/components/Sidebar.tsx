
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings,
  X,
  Calculator,
  Receipt,
  Users,
  FileText,
  DollarSign,
  LogOut,
  Monitor
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const location = useLocation();
  const [userEmail, setUserEmail] = React.useState<string>('');

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  const links = [
    { name: 'Painel de Controle', icon: LayoutDashboard, path: '/' },
    { name: 'Meus Materiais', icon: Package, path: '/materials' },
    { name: 'Meus Produtos', icon: Layers, path: '/products' },
    { name: 'Controle Financeiro', icon: DollarSign, path: '/financial' },
    { name: 'Investimentos', icon: Monitor, path: '/equipments' },
    { name: 'Custos Fixos', icon: Calculator, path: '/fixed-costs' },
    { name: 'Clientes / Fornecedores', icon: Users, path: '/contacts' },
    { name: 'Orçamento', icon: FileText, path: '/quotes' },
    { name: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="bg-rose-500 p-2 rounded-lg shadow-lg shadow-rose-200">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">Precifica</span>
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

      <div className="absolute bottom-0 w-full p-4 space-y-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Usuário</p>
            <p className="text-xs font-bold text-gray-900 truncate" title={userEmail}>{userEmail || 'Carregando...'}</p>
          </div>
        </div>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
