
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Building2, 
  Truck, 
  Factory, 
  UserCheck,
  MoreVertical,
  Eye,
  FileText,
  TrendingUp,
  Download,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  MapPin,
  Briefcase,
  X,
  Save,
  FileSignature,
  CreditCard,
  Globe,
  Building,
  Info,
  ShieldCheck,
  Star,
  // Added missing ArrowRight icon
  ArrowRight
} from 'lucide-react';
import { MOCK_ENTITIES } from '../constants';
import { Entity, EntityType, Sector } from '../types';

const Entities: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>(MOCK_ENTITIES);
  const [activeTab, setActiveTab] = useState<EntityType>('CLIENTE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Entity>>({
    type: 'CLIENTE',
    status: 'Ativo',
    sector: Sector.DISTRIBUTOR,
    rating: 5,
    creditLimit: 0
  });

  const getTabColor = (type: EntityType) => {
    switch (type) {
      case 'CLIENTE': return 'blue';
      case 'FORNECEDOR': return 'amber';
      case 'TRANSPORTADORA': return 'emerald';
      case 'FABRICA': return 'rose';
      default: return 'slate';
    }
  };

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case 'CLIENTE': return <UserCheck size={20} />;
      case 'FORNECEDOR': return <Building2 size={20} />;
      case 'TRANSPORTADORA': return <Truck size={20} />;
      case 'FABRICA': return <Factory size={20} />;
    }
  };

  const handleOpenForm = (entity?: Entity) => {
    if (entity) {
      setFormData(entity);
    } else {
      setFormData({
        type: activeTab,
        status: 'Ativo',
        sector: Sector.DISTRIBUTOR,
        rating: 5,
        creditLimit: 0
      });
    }
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.document) {
      alert("Nome e Documento (CNPJ/CPF) são obrigatórios por lei.");
      return;
    }

    if (formData.id) {
      setEntities(entities.map(e => e.id === formData.id ? { ...e, ...formData } as Entity : e));
    } else {
      const newEntity = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString().split('T')[0],
      } as Entity;
      setEntities([newEntity, ...entities]);
    }
    setIsFormOpen(false);
  };

  const filteredEntities = entities.filter(e => 
    e.type === activeTab && 
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.document.includes(searchTerm))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestão de Entidades</h2>
          <p className="text-slate-500 text-sm">Prontuário completo de Clientes, Fornecedores e Parceiros Comerciais.</p>
        </div>
        <button 
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-100 active:scale-95"
        >
          <UserPlus size={18} /> Novo {activeTab.toLowerCase()}
        </button>
      </div>

      {/* Tabs / Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { type: 'CLIENTE', label: 'Clientes', count: entities.filter(e => e.type === 'CLIENTE').length, icon: Users, color: 'blue' },
          { type: 'FORNECEDOR', label: 'Fornecedores', count: entities.filter(e => e.type === 'FORNECEDOR').length, icon: Building2, color: 'amber' },
          { type: 'TRANSPORTADORA', label: 'Transportadoras', count: entities.filter(e => e.type === 'TRANSPORTADORA').length, icon: Truck, color: 'emerald' },
          { type: 'FABRICA', label: 'Fábricas', count: entities.filter(e => e.type === 'FABRICA').length, icon: Factory, color: 'rose' },
        ].map((stat) => (
          <button 
            key={stat.type}
            onClick={() => setActiveTab(stat.type as EntityType)}
            className={`p-4 rounded-2xl border transition-all text-left group overflow-hidden relative ${
              activeTab === stat.type 
                ? `bg-${stat.color}-600 border-${stat.color}-600 text-white shadow-lg shadow-${stat.color}-100 scale-105 z-10` 
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2 relative z-10">
              <stat.icon size={24} className={activeTab === stat.type ? 'text-white' : `text-${stat.color}-500`} />
              <span className={`text-2xl font-black ${activeTab === stat.type ? 'text-white' : 'text-slate-900'}`}>{stat.count}</span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest relative z-10 ${activeTab === stat.type ? 'text-white/80' : 'text-slate-400'}`}>
              {stat.label}
            </p>
            {activeTab === stat.type && (
              <div className="absolute -right-2 -bottom-2 opacity-20 transform rotate-12">
                <stat.icon size={64} />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Buscar ${activeTab.toLowerCase()} por nome ou documento...`} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
              <Filter size={16} /> Filtros Avançados
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Identificação</th>
                    <th className="px-6 py-4">CNPJ / CPF</th>
                    <th className="px-6 py-4">Setor Fiscal</th>
                    <th className="px-6 py-4">Crédito</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntities.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">Nenhuma entidade encontrada para os filtros aplicados.</td></tr>
                  ) : (
                    filteredEntities.map((entity) => (
                      <tr 
                        key={entity.id} 
                        onClick={() => setSelectedEntity(entity)}
                        className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedEntity?.id === entity.id ? 'bg-blue-50/50' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm bg-${getTabColor(entity.type)}-100 text-${getTabColor(entity.type)}-700 border border-${getTabColor(entity.type)}-200`}>
                              {entity.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 leading-tight">{entity.name}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase">{entity.tradeName || 'Sem Fantasia'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 font-bold">{entity.document}</td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black uppercase text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">{entity.sector}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-900">R$ {(entity.creditLimit || 0).toLocaleString('pt-BR')}</span>
                             <div className="flex gap-0.5">
                               {[1,2,3,4,5].map(s => <Star key={s} size={8} className={s <= (entity.rating || 0) ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}
                             </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenForm(entity)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><FileSignature size={16} /></button>
                            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><MoreVertical size={16} /></button>
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

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {selectedEntity ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right duration-300">
              <div className={`h-24 bg-${getTabColor(selectedEntity.type)}-600 relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10 flex items-center justify-center transform scale-150">
                   {getEntityIcon(selectedEntity.type)}
                </div>
                <div className="absolute -bottom-8 left-6">
                   <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl flex items-center justify-center text-3xl font-black text-slate-800 border-4 border-white">
                      {selectedEntity.name.charAt(0)}
                   </div>
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border border-white/30 bg-white/20 text-white backdrop-blur-md`}>
                    {selectedEntity.status}
                  </span>
                </div>
              </div>
              <div className="pt-12 p-8 space-y-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tighter">{selectedEntity.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 mt-1 uppercase tracking-widest">
                    {getEntityIcon(selectedEntity.type)} {selectedEntity.type} • {selectedEntity.sector}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><CreditCard size={10}/> Limite de Crédito</p>
                    <p className="text-lg font-black text-slate-900">R$ {(selectedEntity.creditLimit || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><TrendingUp size={10}/> Pontuação</p>
                    <div className="flex gap-1 text-amber-400">
                       {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= (selectedEntity.rating || 0) ? "fill-amber-400" : "text-slate-200"} />)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Mail size={14} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">E-mail Comercial</span>
                        <span className="text-xs font-bold text-slate-700">{selectedEntity.email}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Phone size={14} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Telefone de Contato</span>
                        <span className="text-xs font-bold text-slate-700">{selectedEntity.phone}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:bg-amber-600 group-hover:text-white transition-colors"><MapPin size={14} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Endereço Principal</span>
                        <span className="text-xs font-bold text-slate-700 leading-tight">{selectedEntity.address}</span>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Ações Estratégicas</h4>
                   <button className="w-full flex items-center justify-between p-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200">
                      Emitir Extrato Financeiro <ArrowRight size={16} />
                   </button>
                   <button className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-2xl text-xs font-black text-slate-600 uppercase tracking-widest transition-all">
                      Análise de Histórico <TrendingUp size={16} />
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center h-full min-h-[500px]">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm mb-6 border border-slate-100">
                  <Briefcase size={40} />
               </div>
               <p className="text-slate-400 font-bold text-sm max-w-xs">Selecione uma entidade na lista para visualizar o dossiê detalhado e ações comerciais.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CADASTRO DETALHADO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl h-[95vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
               <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-2xl tracking-tighter">
                      {formData.id ? 'Editar ' : 'Novo Cadastro de '} {activeTab.toLowerCase()}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preenchimento Obrigatório para Conformidade Fiscal (SPED/NF-e)</p>
                  </div>
               </div>
               <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={32} /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-white space-y-12 scrollbar-hide">
              {/* Sessão 1: Dados Básicos */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 border-b border-blue-50 pb-2">
                  <Building size={18} /> 1. Identificação Jurídica / Comercial
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Razão Social / Nome Completo</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600"
                      value={formData.name || ''}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Ex: Omni Tech Soluções LTDA"
                    />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Nome Fantasia</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none"
                      value={formData.tradeName || ''}
                      onChange={e => setFormData({...formData, tradeName: e.target.value})}
                      placeholder="Ex: OmniERP"
                    />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">CNPJ / CPF</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-black text-sm outline-none"
                      value={formData.document || ''}
                      onChange={e => setFormData({...formData, document: e.target.value})}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Setor de Atuação</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none"
                      value={formData.sector || ''}
                      onChange={e => setFormData({...formData, sector: e.target.value as Sector})}
                    >
                      {Object.values(Sector).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Status Operacional</label>
                    <div className="flex gap-2">
                       <button onClick={() => setFormData({...formData, status: 'Ativo'})} className={`flex-1 p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${formData.status === 'Ativo' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white text-slate-400'}`}>Ativo</button>
                       <button onClick={() => setFormData({...formData, status: 'Inativo'})} className={`flex-1 p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${formData.status === 'Inativo' ? 'bg-rose-600 border-rose-600 text-white' : 'bg-white text-slate-400'}`}>Inativo</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sessão 2: Fiscal Avançado */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <ShieldCheck size={18} /> 2. Parâmetros Fiscais (SPED / NF-e)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Inscrição Estadual (IE)</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" placeholder="Isento / Números" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Inscrição Municipal (IM)</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Regime Tributário</label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none">
                       <option>Simples Nacional</option>
                       <option>Lucro Presumido</option>
                       <option>Lucro Real</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Cód. SUFRAMA</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" />
                  </div>
                </div>
              </div>

              {/* Sessão 3: Endereço e Logística */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 border-b border-amber-50 pb-2">
                  <MapPin size={18} /> 3. Endereço Principal e Entrega
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">CEP</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" placeholder="00000-000" />
                  </div>
                  <div className="md:col-span-7 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Logradouro / Rua</label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none"
                      value={formData.address || ''}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Número</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" />
                  </div>
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Bairro</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" />
                  </div>
                  <div className="md:col-span-5 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Cidade / Município</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" />
                  </div>
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Código IBGE</label>
                    <input type="text" className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-sm outline-none" placeholder="3550308" />
                  </div>
                </div>
              </div>

              {/* Sessão 4: Crédito e Rating */}
              <div className="space-y-6">
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 border-b border-emerald-50 pb-2">
                  <CreditCard size={18} /> 4. Gestão Comercial e de Risco
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Limite de Crédito Disponível (R$)</label>
                    <input 
                      type="number" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-lg outline-none text-emerald-600"
                      value={formData.creditLimit || 0}
                      onChange={e => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Classificação de Risco (Rating)</label>
                    <div className="flex items-center gap-4 h-full pt-1">
                       {[1,2,3,4,5].map(s => (
                         <button 
                            key={s} 
                            onClick={() => setFormData({...formData, rating: s})}
                            className={`transition-all hover:scale-125 ${s <= (formData.rating || 0) ? 'text-amber-400' : 'text-slate-200'}`}
                         >
                           <Star size={32} className={s <= (formData.rating || 0) ? "fill-amber-400" : ""} />
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Vendedor Responsável</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none" placeholder="Selecione um consultor..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Info size={16} /> Auditoria Ativa: Registro Manual via Backoffice
               </div>
               <div className="flex items-center gap-4">
                  <button onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Descartar</button>
                  <button 
                    onClick={handleSave}
                    className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                  >
                    <Save size={20} /> Efetivar Registro
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entities;
