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
  ExternalLink,
  User,
  Building2,
  Map,
  Loader2
} from 'lucide-react';
import { Contact, ContactType } from '../types';
import { masks } from '../utils/masks';
import { brasilApi } from '../services/brasilApi';

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
  const [isLoadingCnpj, setIsLoadingCnpj] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const [formState, setFormState] = useState<Partial<Contact>>({
    name: '',
    type: 'Cliente',
    document_type: 'CPF',
    document: '',
    phone: '',
    email: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    complement: '',
    observations: ''
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const normalizedSearch = search.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(normalizedSearch) ||
        c.email.toLowerCase().includes(normalizedSearch) ||
        (c.document && c.document.includes(normalizedSearch));
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
      setFormState({
        name: '',
        type: 'Cliente',
        document_type: 'CPF',
        document: '',
        phone: '',
        email: '',
        cep: '',
        street: '',
        number: '',
        neighborhood: '',
        city: '',
        state: '',
        complement: '',
        observations: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formState.name) {
      alert("O nome é obrigatório!");
      return;
    }

    // Combine address for legacy display compatibility if needed
    const fullAddress = formState.street ? `${formState.street}, ${formState.number} - ${formState.neighborhood}, ${formState.city}/${formState.state}` : formState.address;

    const data = {
      ...formState,
      address: fullAddress, // Update legacy field just in case
      id: editingContact ? editingContact.id : Math.random().toString(36).substr(2, 9),
    } as Contact;

    if (editingContact) onUpdate(data);
    else onAdd(data);
    setIsModalOpen(false);
  };

  // --- AUTO FILL LOGIC ---
  const handleCnpjBlur = async () => {
    if (formState.document_type === 'CNPJ' && formState.document && formState.document.length >= 14) {
      setIsLoadingCnpj(true);
      const data = await brasilApi.fetchCnpj(formState.document);
      setIsLoadingCnpj(false);

      if (data) {
        setFormState(prev => ({
          ...prev,
          name: data.nome_fantasia || data.razao_social,
          phone: prev.phone || masks.phone(data.ddd_telefone_1),
          cep: masks.cep(data.cep),
          street: data.logradouro,
          number: data.numero,
          neighborhood: data.bairro,
          city: data.municipio,
          state: data.uf,
          complement: data.complemento,
          observations: prev.observations || `Razão Social: ${data.razao_social}`
        }));
      } else {
        alert('CNPJ não encontrado ou inválido.');
      }
    }
  };

  const handleCepBlur = async () => {
    if (formState.cep && formState.cep.length >= 8) {
      setIsLoadingCep(true);
      const data = await brasilApi.fetchCep(formState.cep);
      setIsLoadingCep(false);

      if (data) {
        setFormState(prev => ({
          ...prev,
          street: data.street,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state
        }));
        // Focus number field via ID if possible, or just user flows naturally
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Contatos</h2>
          <p className="text-gray-500 mt-2 font-medium">Clientes e fornecedores com cadastro completo.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Contato
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, documento ou e-mail..."
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

      {/* List Grid */}
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

            <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">{contact.name}</h3>
            {contact.document && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                {contact.document_type}: {contact.document}
              </p>
            )}

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                {contact.phone || 'Sem telefone'}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{contact.city && contact.state ? `${contact.city}/${contact.state}` : (contact.address || 'Sem endereço')}</span>
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
                  href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  className="flex items-center gap-2 text-green-600 font-bold text-xs bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition-all"
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
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 bg-gray-50/50 flex items-center justify-between border-b">
              <h3 className="text-xl font-bold text-gray-900">{editingContact ? 'Editar Contato' : 'Novo Contato'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">

              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormState({ ...formState, type: 'Cliente' })}
                  className={`py-3 rounded-md font-bold border-2 transition-all ${formState.type === 'Cliente' ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-400'}`}
                >
                  Cliente
                </button>
                <button
                  onClick={() => setFormState({ ...formState, type: 'Fornecedor' })}
                  className={`py-3 rounded-md font-bold border-2 transition-all ${formState.type === 'Fornecedor' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-400'}`}
                >
                  Fornecedor
                </button>
              </div>

              {/* Document Section */}
              <div className="bg-indigo-50/30 p-6 rounded-lg border border-indigo-100 space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="docType"
                      checked={formState.document_type === 'CPF'}
                      onChange={() => setFormState({ ...formState, document_type: 'CPF', document: '' })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-bold text-gray-600">Pessoa Física (CPF)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="docType"
                      checked={formState.document_type === 'CNPJ'}
                      onChange={() => setFormState({ ...formState, document_type: 'CNPJ', document: '' })}
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-bold text-gray-600">Pessoa Jurídica (CNPJ)</span>
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    className="w-full text-lg font-bold text-gray-900 pl-4 pr-12 py-3 bg-white border border-indigo-100 rounded-md outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    placeholder={formState.document_type === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                    value={formState.document}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormState({
                        ...formState,
                        document: formState.document_type === 'CPF' ? masks.cpf(val) : masks.cnpj(val)
                      });
                    }}
                    onBlur={handleCnpjBlur}
                  />
                  {isLoadingCnpj && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    </div>
                  )}
                  {!isLoadingCnpj && formState.document_type === 'CNPJ' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-1 rounded pointer-events-none">
                      AUTO
                    </div>
                  )}
                </div>
                {formState.document_type === 'CNPJ' && (
                  <p className="text-xs text-indigo-500 font-medium ml-1">
                    * Digite o CNPJ para buscar os dados automaticamente.
                  </p>
                )}
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Nome Completo / Razão Social</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full font-bold text-gray-700 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Telefone</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full font-medium text-gray-700 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: masks.phone(e.target.value) })}
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">E-mail</label>
                    <div className="relative">
                      <input
                        type="email"
                        className="w-full font-medium text-gray-700 pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  Endereço
                </h4>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">CEP</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full font-bold text-gray-700 pl-3 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                        placeholder="00000-000"
                        value={formState.cep}
                        onChange={(e) => setFormState({ ...formState, cep: masks.cep(e.target.value) })}
                        onBlur={handleCepBlur}
                      />
                      {isLoadingCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      className="w-full font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      value={formState.street}
                      onChange={(e) => setFormState({ ...formState, street: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Número</label>
                    <input
                      type="text"
                      className="w-full font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      value={formState.number}
                      onChange={(e) => setFormState({ ...formState, number: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Bairro</label>
                    <input
                      type="text"
                      className="w-full font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      value={formState.neighborhood}
                      onChange={(e) => setFormState({ ...formState, neighborhood: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Cidade</label>
                    <input
                      type="text"
                      className="w-full font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      value={formState.city}
                      onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1 block mb-1">Estado (UF)</label>
                    <input
                      type="text"
                      className="w-full font-medium text-gray-700 px-4 py-3 bg-gray-50 border border-gray-200 rounded-md outline-none focus:bg-white focus:border-indigo-500 transition-all"
                      value={formState.state}
                      maxLength={2}
                      onChange={(e) => setFormState({ ...formState, state: e.target.value.toUpperCase() })}
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="px-8 py-6 bg-gray-50/50 border-t flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 bg-white border border-gray-300 rounded-md font-bold text-gray-600 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-indigo-600 text-white rounded-md font-bold shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
              >
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
