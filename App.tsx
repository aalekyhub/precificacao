
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Menu, Cloud, CloudOff } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Materials from './components/Materials';
import FixedCosts from './components/FixedCosts';
import StoreSettings from './components/StoreSettings';
import Contacts from './components/Contacts';
import Quotes from './components/Quotes';
import Sidebar from './components/Sidebar';
import { useStoreData } from './hooks/useStoreData';
import { api } from './src/api/client';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const storeData = useStoreData();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch('/api/health'); // Direct fetch to avoid error throwing
        setIsConnected(res.ok);
      } catch (e) {
        setIsConnected(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-[#FAFAFA]">
        <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(false)} />

        <main className="lg:ml-64 transition-all duration-300">
          <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:px-4 flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-800">PrecificaMaster</h1>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${isConnected ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                {isConnected ? <Cloud className="w-3 h-3" /> : <CloudOff className="w-3 h-3" />}
                {isConnected ? 'Nuvem Ativa' : 'Desconectado'}
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Dashboard products={storeData.products} materials={storeData.materials} fixedCosts={storeData.fixedCosts} />} />
              <Route path="/products" element={
                <Products
                  products={storeData.products}
                  materials={storeData.materials}
                  fixedCosts={storeData.fixedCosts}
                  storeConfig={storeData.storeConfig}
                  onAdd={storeData.addProduct}
                  onDelete={storeData.deleteProduct}
                />
              } />
              <Route path="/materials" element={
                <Materials
                  materials={storeData.materials}
                  onAdd={storeData.addMaterial}
                  onUpdate={storeData.updateMaterial}
                  onDelete={storeData.deleteMaterial}
                />
              } />
              <Route path="/fixed-costs" element={
                <FixedCosts
                  fixedCosts={storeData.fixedCosts}
                  onAdd={storeData.addFixedCost}
                  onUpdate={storeData.updateFixedCost}
                  onDelete={storeData.deleteFixedCost}
                />
              } />
              <Route path="/contacts" element={
                <Contacts
                  contacts={storeData.contacts}
                  onAdd={storeData.addContact}
                  onUpdate={storeData.updateContact}
                  onDelete={storeData.deleteContact}
                />
              } />
              <Route path="/quotes" element={
                <Quotes
                  quotes={storeData.quotes}
                  products={storeData.products}
                  materials={storeData.materials}
                  contacts={storeData.contacts}
                  fixedCosts={storeData.fixedCosts}
                  storeConfig={storeData.storeConfig}
                  onAdd={storeData.addQuote}
                  onUpdate={storeData.updateQuote}
                  onDelete={storeData.deleteQuote}
                />
              } />
              <Route path="/settings" element={<StoreSettings config={storeData.storeConfig} onUpdate={storeData.setStoreConfig} />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
