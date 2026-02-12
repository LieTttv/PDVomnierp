
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Building2, Truck, Factory, UserCheck,
  MoreVertical, Eye, FileText, TrendingUp, Download, Mail, Phone,
  CheckCircle2, XCircle, MapPin, Briefcase, X, Save, FileSignature,
  CreditCard, Globe, Building, Info, ShieldCheck, Star, ArrowRight, RefreshCw, Trash2
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

  const [formData, setFormData] = useState<any>({
    type: 'CLIENTE',
    status: 'Ativo',
    sector: Sector.DISTRIBUTOR,
    rating: 5,
    credit_limit: 0
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
      console.error("Erro:", e);
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

  const handleOpenForm = (entity?: any) => {
    if (entity) {
      setFormData(entity);
    } else {
      setFormData({
        type: activeTab,
        status: 'Ativo',
        sector: Sector.DISTRIBUTOR,
        rating: 5,
        credit_limit: 0
      });
    }
    setIsFormOpen(true);
  };

  const handleDeleteEntity = async (id: string, name: string) => {
    if (!confirm(`Excluir permanentemente "${name}"?`)) return;
    try {
      const { error } = await supabase.from('entities').delete().eq('id', id);
      if (error) throw error;
      setEntities(entities.filter(e => e.id !== id));
      if (selectedEntity?.id === id) setSelectedEntity(null);
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.document) {
      alert("Nome e Documento são obrigatórios.");
      return;
    }

    const storeId = getActiveStoreId();
    if (!storeId) return;

    try {
      const payload = {
        ...formData,
        store_id: storeId,
        type: activeTab
      };

      if (formData.id) {
        const { error } = await supabase.from('entities').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('entities').insert([payload]);
        if (error) throw error;
      }

      await fetchEntities();
      setIsFormOpen(false);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
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
          <p className="text-slate-500 text-sm">Controle de Clientes e Parceiros (Sincronizado na Nuvem).</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchEntities} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg"
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
            className={`p-4 rounded-2xl border transition-all text-left ${
              activeTab === stat.type 
                ? `bg-${stat.color}-600 border-${stat.color}-600 text-white shadow-lg scale-105 z-10` 
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <stat.icon size={24} className={activeTab === stat.type ? 'text-white' : `text-${stat.color}-500`} />
              <span className={`text-2xl font-black ${activeTab === stat.type ? 'text-white' : 'text-slate-900'}`}>{stat.count}</span>
            </div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === stat.type ? 'text-white/80' : 'text-slate-400'}`}>
              {stat.label}
            </p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
           <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Buscar ${activeTab.toLowerCase()}...`} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-6 py-4">Identificação</th>
                <th className="px-6 py-4">CNPJ / CPF</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntities.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">Sem registros no banco de dados.</td></tr>
              ) : (
                filteredEntities.map((entity) => (
                  <tr key={entity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black bg-${getTabColor(entity.type)}-100 text-${getTabColor(entity.type)}-700`}>
                          {entity.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{entity.name}</span>
                          {/* Fix: Property 'trade_name' does not exist on type 'Entity'. Did you mean 'tradeName'? */}
                          <span className="text-[10px] text-slate-400 uppercase font-black">{entity.tradeName || '---'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{entity.document}</td>
                    <td className="px-6 py-4">
                       <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">{entity.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenForm(entity)} className="p-2 text-slate-400 hover:text-blue-600"><FileSignature size={16} /></button>
                        <button onClick={() => handleDeleteEntity(entity.id, entity.name)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <h3 className="font-black text-slate-900 text-2xl uppercase tracking-tighter">{formData.id ? 'Editar ' : 'Novo '} {activeTab}</h3>
               <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Razão Social</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Documento (CNPJ/CPF)</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.document || ''} onChange={e => setFormData({...formData, document: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">E-mail</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Telefone</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 flex items-center justify-end gap-4">
               <button onClick={() => setIsFormOpen(false)} className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Cancelar</button>
               <button onClick={handleSave} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl flex items-center gap-2 uppercase tracking-widest"><Save size={20} /> Salvar no Banco</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Entities;
