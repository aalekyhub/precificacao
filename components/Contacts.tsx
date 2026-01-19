
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Save, 
  Phone, 
  Mail, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Contact, ContactType } from '../types';

interface ContactsProps {
  contacts: Contact[];
  onAdd: (c: Contact) => void;
  onUpdate: (c: Contact) => void;
  onDelete: (id: string) => void;
}

const Contacts: React.FC<ContactsProps> = ({ contacts, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'Todos' | ContactType>('Todos');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const [formState, setFormState] = useState<Partial<Contact>>({
    name: '',
    type: 'Cliente',
    phone: '',
    email: '',
    address: '',
    observations: ''
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'Todos' || c.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [contacts, search, filterType]);

  const openModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormState(contact);
    } else {
      setEditingContact(null);
      setFormState({ name: '', type: 'Cliente', phone: '', email: '', address: '', observations: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.name) return;
    const data = {
      ...formState,
      id: editingContact ? editingContact.id : Math.random().toString(36).substr(2, 9),
    } as Contact;

    if (editingContact) onUpdate(data);
    else onAdd(data);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 font-serif tracking-tight">Agenda de Contatos</h2>
          <p className="text-gray-500 mt-2 font-medium">Clientes e fornecedores em um só lugar.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Contato
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-50 p-1 rounded-2xl w-full md:w-auto">
          {['Todos', 'Cliente', 'Fornecedor'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t as any)}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${filterType === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map(contact => (
          <div key={contact.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${contact.type === 'Cliente' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                <Users className="w-7 h-7" />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${contact.type === 'Cliente' ? 'bg-rose-500 text-white' : 'bg-blue-500 text-white'}`}>
                {contact.type}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-4">{contact.name}</h3>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                {contact.phone || 'N/A'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                {contact.email || 'N/A'}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex gap-2">
                <button onClick={() => openModal(contact)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 rounded-xl transition-all">
                  <Edit3 className="w-5 h-5" />
                </button>
                <button onClick={() => onDelete(contact.id)} className="p-2.5 bg-gray-50 text-gray-400 hover:text-rose-600 rounded-xl transition-all">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              {contact.phone && (
                <a 
                  href={`https://wa.me/${contact.phone.replace(/\D/g,'')}`} 
                  target="_blank" 
                  className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-4 py-2 rounded-xl"
                >
                  WhatsApp <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden">
            <div className="px-10 py-8 bg-gray-50/50 flex items-center justify-between border-b">
              <h3 className="text-2xl font-bold text-gray-900 font-serif">{editingContact ? 'Editar Contato' : 'Novo Contato'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormState({...formState, type: 'Cliente'})}
                  className={`py-4 rounded-2xl font-bold border-2 transition-all ${formState.type === 'Cliente' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 text-gray-400'}`}
                >
                  Cliente
                </button>
                <button 
                  onClick={() => setFormState({...formState, type: 'Fornecedor'})}
                  className={`py-4 rounded-2xl font-bold border-2 transition-all ${formState.type === 'Fornecedor' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                >
                  Fornecedor
                </button>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                  value={formState.name}
                  onChange={(e) => setFormState({...formState, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Telefone / WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                    value={formState.phone}
                    onChange={(e) => setFormState({...formState, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">E-mail</label>
                  <input 
                    type="email" 
                    className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                    value={formState.email}
                    onChange={(e) => setFormState({...formState, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Endereço (Opcional)</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                  value={formState.address}
                  onChange={(e) => setFormState({...formState, address: e.target.value})}
                />
              </div>
            </div>
            <div className="p-10 bg-gray-50/50 border-t flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-white border-2 rounded-2xl font-bold text-gray-500">Cancelar</button>
              <button onClick={handleSave} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center gap-2">
                <Save className="w-5 h-5" /> Salvar Contato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
