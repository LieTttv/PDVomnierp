
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Building2, Truck, Factory, UserCheck,
  MoreVertical, Eye, FileText, TrendingUp, Download, Mail, Phone,
  CheckCircle2, XCircle, MapPin, Briefcase, X, Save, FileSignature,
  CreditCard, Globe, Building, Info, ShieldCheck, Star, ArrowRight, RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { getActiveStoreId } from '../services/authService';
import { Entity, EntityType, Sector } from '../types';

const Entities: React.FC = () => {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [activeTab, setActiveTab] = useState<EntityType>('CLIENTE');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<Entity>>({
    type: 'CLIENTE',
    status: 'Ativo',
    sector: Sector.DISTRIBUTOR,
    rating: 5,
    creditLimit: 0
  });

  const fetchEntities = async () => {
    setLoading(true);
    const storeId = getActiveStoreId();
    if (!storeId) return;

    try {
      const { data, error } = await supabase
        .from('entities')
        .select('*')
        .eq('store_id', storeId)
        .order('name');
      
      if (error) throw error;
      setEntities(data || []);
    } catch (e) {
      console.error("Erro ao carregar entidades:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntities();
  }, []);

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

  const handleSave = async () => {
    if (!formData.name || !formData.document) {
      alert("Nome e Documento (CNPJ/CPF) são obrigatórios.");
      return;
    }

    const storeId = getActiveStoreId();
    if (!storeId) return;

    try {
      const entityData = {
        ...formData,
        store_id: storeId,
        type: activeTab
      };

      if (formData.id) {
        const { error } = await supabase.from('entities').update(entityData).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('entities').insert([entityData]);
        if (error) throw error;
      }

      await fetchEntities();
      setIsFormOpen(false);
    } catch (err: any) {
      alert("Erro ao salvar entidade: " + err.message);
    }
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
        <div className="flex gap-3">
          <button onClick={fetchEntities} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-100 active:scale-95"
          >
            <UserPlus size={18} /> Novo {activeTab.toLowerCase()}
          </button>
        </div>
      </div>

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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
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
              {loading ? (
                <div className="p-20 text-center text-slate-400 font-bold animate-pulse">Consultando Banco de Dados...</div>
              ) : (
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
                      <tr><td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold italic">Nenhum registro encontrado.</td></tr>
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
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenForm(entity); }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"><FileSignature size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"><MoreVertical size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {selectedEntity ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right duration-300 h-fit">
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
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-center gap-1"><CreditCard size={10}/> Limite Crédito</p>
                    <p className="text-lg font-black text-slate-900">R$ {(selectedEntity.creditLimit || 0).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1 flex items-center justify-center gap-1"><TrendingUp size={10}/> Rating</p>
                    <div className="flex justify-center gap-1 text-amber-400">
                       {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= (selectedEntity.rating || 0) ? "fill-amber-400" : "text-slate-200"} />)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><Mail size={14} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">E-mail Comercial</span>
                        <span className="text-xs font-bold text-slate-700">{selectedEntity.email || 'Não informado'}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100"><Phone size={14} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Telefone</span>
                        <span className="text-xs font-bold text-slate-700">{selectedEntity.phone || 'Não informado'}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100"><MapPin size={14} /></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Endereço Principal</span>
                        <span className="text-xs font-bold text-slate-700 leading-tight">{selectedEntity.address || 'Não informado'}</span>
                      </div>
                   </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                   <button className="w-full flex items-center justify-between p-4 bg-slate-900 text-white hover:bg-slate-800 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">
                      Emitir Extrato <ArrowRight size={16} />
                   </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center h-[500px]">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-200 shadow-sm mb-6 border border-slate-100">
                  <Briefcase size={40} />
               </div>
               <p className="text-slate-400 font-bold text-sm max-w-xs uppercase tracking-tight">Selecione uma entidade para visualizar detalhes permanentes.</p>
            </div>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100"><UserPlus size={24} /></div>
                  <h3 className="font-black text-slate-900 text-2xl tracking-tighter uppercase">{formData.id ? 'Editar ' : 'Novo '} {activeTab.toLowerCase()}</h3>
               </div>
               <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nome / Razão Social</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Documento (CNPJ/CPF)</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.document || ''} onChange={e => setFormData({...formData, document: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">E-mail</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Telefone</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
                 <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Endereço Completo</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Limite de Crédito (R$)</label>
                    <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.creditLimit || 0} onChange={e => setFormData({...formData, creditLimit: parseFloat(e.target.value) || 0})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Status</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                       <option value="Ativo">Ativo</option>
                       <option value="Bloqueado">Bloqueado</option>
                       <option value="Inativo">Inativo</option>
                    </select>
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-end gap-4 shrink-0">
               <button onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Cancelar</button>
               <button onClick={handleSave} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest"><Save size={20} /> Efetivar Cadastro</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entities;
