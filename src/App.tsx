import React, { useState } from 'react';
import {
    LayoutDashboard,
    Package,
    Box,
    ShoppingBag,
    Building2,
    Calculator,
    Menu,
    X,
    FileText,

    Settings as SettingsIcon,
    DollarSign,
    Monitor
} from 'lucide-react';
import Materials from './components/Materials';
import Products from './components/Products';
import Channels from './components/Channels';
import FixedCosts from './components/FixedCosts';
import PricingCalculator from './components/PricingCalculator';
import Quotes from './components/Quotes';
import Settings from './components/Settings';
import FinancialControl from './components/FinancialControl';
import Equipments from './components/Equipments';

// Simple Dashboard Component
const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Visão Geral</h2>
            <p className="text-gray-500 mt-2 font-medium">Bem-vindo ao sistema de precificação estratégica.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button onClick={() => onNavigate('calculator')} className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 text-left hover:scale-[1.02] transition-transform">
                <Calculator className="w-8 h-8 opacity-80 mb-4" />
                <h3 className="text-2xl font-bold mb-1">Calculadora</h3>
                <p className="opacity-70 text-sm">Simular preços de venda</p>
            </button>

            <button onClick={() => onNavigate('quotes')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Orçamentos</h3>
                <p className="text-gray-400 text-sm mt-1">Gerar propostas em PDF</p>
            </button>

            <button onClick={() => onNavigate('products')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Box className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Produtos</h3>
                <p className="text-gray-400 text-sm mt-1">Gerenciar catálogo e receitas</p>
            </button>

            <button onClick={() => onNavigate('materials')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                    <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Materiais</h3>
                <p className="text-gray-400 text-sm mt-1">Custos de insumos e perdas</p>
            </button>

            <button onClick={() => onNavigate('channels')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Canais de Venda</h3>
                <p className="text-gray-400 text-sm mt-1">Taxas de marketplaces</p>
            </button>

            <button onClick={() => onNavigate('fixed-costs')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 mb-4 group-hover:scale-110 transition-transform">
                    <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Custos Fixos</h3>
                <p className="text-gray-400 text-sm mt-1">Despesas e horas produtivas</p>
            </button>

            <button onClick={() => onNavigate('settings')} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm text-left hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 mb-4 group-hover:scale-110 transition-transform">
                    <SettingsIcon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Configurações</h3>
                <p className="text-gray-400 text-sm mt-1">Manual e Global</p>
            </button>
        </div>
    </div>
);

function App() {
    // Initialize from localStorage or default to 'dashboard'
    const [currentPage, setCurrentPage] = useState(() => {
        return localStorage.getItem('precificacao_last_page') || 'dashboard';
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Persist navigation
    React.useEffect(() => {
        localStorage.setItem('precificacao_last_page', currentPage);
    }, [currentPage]);

    const NavItem = ({ page, icon: Icon, label }: any) => (
        <button
            onClick={() => { setCurrentPage(page); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-bold ${currentPage === page
                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );

    return (
        <div className="flex min-h-screen bg-[#F8F9FC]">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-100 p-8 fixed h-full z-10 print:hidden">
                <div className="flex items-center gap-3 px-4 mb-12">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
                    <span className="text-2xl font-black text-gray-900 tracking-tight">Precificação</span>
                </div>

                <nav className="space-y-2 flex-1">
                    <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <div className="pt-8 pb-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Vendas</div>
                    <NavItem page="quotes" icon={FileText} label="Orçamentos" />
                    <div className="pt-8 pb-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Cadastros</div>
                    <NavItem page="products" icon={Box} label="Produtos" />
                    <NavItem page="materials" icon={Package} label="Materiais" />
                    <NavItem page="channels" icon={ShoppingBag} label="Canais de Venda" />
                    <NavItem page="financial" icon={DollarSign} label="Controle Financeiro" />
                    <NavItem page="fixed-costs" icon={Building2} label="Custos Fixos" />
                    <NavItem page="settings" icon={SettingsIcon} label="Configurações" />
                    <div className="pt-8 pb-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Estratégia</div>
                    <NavItem page="calculator" icon={Calculator} label="Calculadora" />
                </nav>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 px-6 py-4 flex justify-between items-center print:hidden">
                <span className="text-xl font-black text-gray-900">Precificação</span>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white pt-24 px-6 space-y-4 print:hidden">
                    <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem page="quotes" icon={FileText} label="Orçamentos" />
                    <NavItem page="products" icon={Box} label="Produtos" />
                    <NavItem page="materials" icon={Package} label="Materiais" />
                    <NavItem page="channels" icon={ShoppingBag} label="Canais de Venda" />
                    <NavItem page="financial" icon={DollarSign} label="Controle Financeiro" />
                    <NavItem page="fixed-costs" icon={Building2} label="Custos Fixos" />
                    <NavItem page="settings" icon={SettingsIcon} label="Configurações" />
                    <NavItem page="calculator" icon={Calculator} label="Calculadora" />
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 lg:ml-80 p-6 lg:p-12 pt-24 lg:pt-12 overflow-x-hidden print:p-0 print:m-0">
                <div className="max-w-7xl mx-auto print:max-w-none print:w-full">
                    {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
                    {currentPage === 'quotes' && <Quotes />}
                    {currentPage === 'materials' && <Materials />}
                    {currentPage === 'products' && <Products />}
                    {currentPage === 'channels' && <Channels />}
                    {currentPage === 'financial' && <FinancialControl />}
                    {currentPage === 'equipments' && <Equipments />}
                    {currentPage === 'fixed-costs' && <FixedCosts />}
                    {currentPage === 'settings' && <Settings />}
                    {currentPage === 'calculator' && <PricingCalculator />}
                </div>
            </main>
        </div>
    );
}

export default App;
