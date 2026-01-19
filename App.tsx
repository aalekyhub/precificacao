
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  TrendingUp, 
  Settings, 
  Menu, 
  X,
  Calculator,
  Receipt,
  Users,
  FileText
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Materials from './components/Materials';
import FixedCosts from './components/FixedCosts';
import StoreSettings from './components/StoreSettings';
import Contacts from './components/Contacts';
import Quotes from './components/Quotes';
import { Product, Material, Unit, FixedCost, StoreConfig, Contact, Quote } from './types';

const INITIAL_MATERIALS: Material[] = [
  { id: '1', name: 'Papel Offset 180g', category: 'Papelaria', cost: 55.20, quantity: 200, unit: Unit.UN, stock: 1000, minStock: 200 },
  { id: '2', name: 'Papel Fotográfico 135g', category: 'Papelaria', cost: 45.00, quantity: 50, unit: Unit.UN, stock: 150, minStock: 20 },
  { id: '3', name: 'Cola Pano 60g', category: 'Aviamentos', cost: 12.50, quantity: 1, unit: Unit.UN, stock: 5, minStock: 2 },
];

const INITIAL_FIXED_COSTS: FixedCost[] = [
  { id: 'fc1', name: 'Aluguel do Ateliê', value: 800, periodicity: 'Mensal' },
  { id: 'fc2', name: 'Energia Elétrica', value: 150, periodicity: 'Mensal' },
  { id: 'fc3', name: 'Internet / Software', value: 120, periodicity: 'Mensal' },
];

const INITIAL_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Ana Silva (Cliente)', type: 'Cliente', phone: '11999999999', email: 'ana@email.com', address: 'Rua das Flores, 123' },
  { id: 'c2', name: 'Papelaria Central (Fornecedor)', type: 'Fornecedor', phone: '1144445555', email: 'contato@papelariacentral.com' },
];

const DEFAULT_CONFIG: StoreConfig = {
  laborRateDefault: 35,
  monthlyWorkingHours: 160,
  inkKitCost: 250,
  inkYieldPages: 4500,
  defaultMarkup: 50
};

const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Produtos', icon: Package, path: '/products' },
    { name: 'Materiais', icon: Layers, path: '/materials' },
    { name: 'Orçamentos', icon: FileText, path: '/quotes' },
    { name: 'Contatos', icon: Users, path: '/contacts' },
    { name: 'Custos Fixos', icon: Receipt, path: '/fixed-costs' },
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
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
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

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('precifica_materials');
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('precifica_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(() => {
    const saved = localStorage.getItem('precifica_fixed_costs');
    return saved ? JSON.parse(saved) : INITIAL_FIXED_COSTS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('precifica_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem('precifica_quotes');
    return saved ? JSON.parse(saved) : [];
  });

  const [storeConfig, setStoreConfig] = useState<StoreConfig>(() => {
    const saved = localStorage.getItem('precifica_config');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem('precifica_materials', JSON.stringify(materials));
    localStorage.setItem('precifica_products', JSON.stringify(products));
    localStorage.setItem('precifica_fixed_costs', JSON.stringify(fixedCosts));
    localStorage.setItem('precifica_contacts', JSON.stringify(contacts));
    localStorage.setItem('precifica_quotes', JSON.stringify(quotes));
    localStorage.setItem('precifica_config', JSON.stringify(storeConfig));
  }, [materials, products, fixedCosts, contacts, quotes, storeConfig]);

  const addProduct = (p: Product) => setProducts([...products, p]);
  const deleteProduct = (id: string) => setProducts(products.filter(p => p.id !== id));
  
  const addMaterial = (m: Material) => setMaterials([...materials, m]);
  const updateMaterial = (updatedM: Material) => setMaterials(materials.map(m => m.id === updatedM.id ? updatedM : m));
  const deleteMaterial = (id: string) => setMaterials(materials.filter(m => m.id !== id));

  const addFixedCost = (fc: FixedCost) => setFixedCosts([...fixedCosts, fc]);
  const updateFixedCost = (updatedFc: FixedCost) => setFixedCosts(fixedCosts.map(fc => fc.id === updatedFc.id ? updatedFc : fc));
  const deleteFixedCost = (id: string) => setFixedCosts(fixedCosts.filter(fc => fc.id !== id));

  const addContact = (c: Contact) => setContacts([...contacts, c]);
  const updateContact = (updatedC: Contact) => setContacts(contacts.map(c => c.id === updatedC.id ? updatedC : c));
  const deleteContact = (id: string) => setContacts(contacts.filter(c => c.id !== id));

  const addQuote = (q: Quote) => setQuotes([...quotes, q]);
  const updateQuote = (updatedQ: Quote) => setQuotes(quotes.map(q => q.id === updatedQ.id ? updatedQ : q));
  const deleteQuote = (id: string) => setQuotes(quotes.filter(q => q.id !== id));

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(false)} />
        
        <main className="lg:ml-64 transition-all duration-300">
          <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:px-4">
               <h1 className="text-lg font-bold text-gray-800">PrecificaMaster</h1>
            </div>
          </header>

          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard products={products} materials={materials} fixedCosts={fixedCosts} />} />
              <Route path="/products" element={<Products products={products} materials={materials} fixedCosts={fixedCosts} storeConfig={storeConfig} onAdd={addProduct} onDelete={deleteProduct} />} />
              <Route path="/materials" element={<Materials materials={materials} onAdd={addMaterial} onUpdate={updateMaterial} onDelete={deleteMaterial} />} />
              <Route path="/fixed-costs" element={<FixedCosts fixedCosts={fixedCosts} onAdd={addFixedCost} onUpdate={updateFixedCost} onDelete={deleteFixedCost} />} />
              <Route path="/contacts" element={<Contacts contacts={contacts} onAdd={addContact} onUpdate={updateContact} onDelete={deleteContact} />} />
              <Route path="/quotes" element={<Quotes quotes={quotes} products={products} materials={materials} contacts={contacts} fixedCosts={fixedCosts} storeConfig={storeConfig} onAdd={addQuote} onUpdate={updateQuote} onDelete={deleteQuote} />} />
              <Route path="/settings" element={<StoreSettings config={storeConfig} onUpdate={setStoreConfig} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
