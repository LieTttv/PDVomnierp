
import React, { useEffect, useState } from 'react';
import { 
  Building2, Plus, ShieldCheck, X, Trash2, 
  LayoutGrid, Activity, MoreVertical, Search, Globe,
  Lock, Mail, Settings2, CheckCircle2, AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Store } from '../types';

const MasterDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  
  const [newStore, setNewStore] = useState({ 
    nome: '', 
    cnpj: '', 
    admin_email: '', 
    admin_password: '' 
  });

  const availableModules = [
    { id: 'faturamento', label: 'Faturamento NF-e' },
    { id: 'estoque', label: 'Controle de Estoque' },
    { id: 'pedidos', label: 'Gestão de Pedidos' },
    { id: 'vendas_externas', label: 'Vendas Externas (App)' },
    { id: 'logistica', label: 'Roteirização Logística' },
    { id: 'relatorios', label: 'Relatórios BI' }
  ];

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('stores')
      .select(`
        *,
        store_modules (
          module_id
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) setStores(data as any[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Criar a Loja
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([{ 
          nome_fantasia: newStore.nome, 
          cnpj: newStore.cnpj, 
          plano_ativo: 'Enterprise' 
        }])
        .select()
        .single();

      if (storeError) throw storeError;

      // 2. Criar usuário admin no Auth (Nota: Em um app real usaríamos Edge Functions aqui)
      alert(`Loja "${newStore.nome}" criada! Use o e-mail ${newStore.admin_email} para configurar o acesso no Supabase Auth.`);
      
      setIsModalOpen(false);
      setNewStore({ nome: '', cnpj: '', admin_email: '', admin_password: '' });
      fetchStores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleModule = async (storeId: string, moduleId: string, currentStatus: boolean) => {
    if (currentStatus) {
      await supabase.from('store_modules').delete().eq('store_id', storeId).eq('module_id', moduleId);
    } else {
      await supabase.from('store_modules').insert([{ store_id: storeId, module_id: moduleId }]);
    }
    fetchStores();
  };

  const handleDeleteStore = async (id: string) => {
    if (confirm('ATENÇÃO: Isso excluirá permanentemente a loja e todos os seus dados. Continuar?')) {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (!error) fetchStores();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Painel de Controle Master</h2>
          <p className="text-slate-500 font-bold text-sm">Gestão global de licenciamento e infraestrutura.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-[24px] font-black text-sm shadow-2xl hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus size={20} /> Nova Unidade de Negócio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <Globe className="text-blue-600 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Clientes</p>
          <p className="text-3xl font-black text-slate-900">{stores.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <Activity className="text-emerald-600 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status dos Sistemas</p>
          <p className="text-xl font-black text-emerald-600 uppercase">100% Online</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-black text-slate-900 text-lg">Lojas e Licenciamento</h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar por CNPJ ou Nome..." className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900 w-80" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <tr>
                <th className="px-10 py-6">Unidade / CNPJ</th>
                <th className="px-10 py-6">Módulos Ativos</th>
                <th className="px-10 py-6">Data de Criação</th>
                <th className="px-10 py-6 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Building2 size={24}/></div>
                       <div>
                          <p className="font-black text-slate-900 text-xl">{store.nome_fantasia}</p>
                          <p className="text-xs text-slate-400 font-bold tracking-tight">{store.cnpj}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-2 max-w-xs">
                       {availableModules.map(mod => {
                         const isActive = store.store_modules?.some(sm => sm.module_id === mod.id);
                         return (
                           <button 
                             key={mod.id}
                             onClick={() => toggleModule(store.id, mod.id, !!isActive)}
                             className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border transition-all ${isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-300 hover:text-slate-500'}`}
                           >
                             {mod.label}
                           </button>
                         )
                       })}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-xs font-bold text-slate-500">{new Date(store.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handleDeleteStore(store.id)} className="p-3 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={20}/></button>
                      <button className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm"><Settings2 size={20}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastro de Nova Loja + Admin */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl"><Building2 size={28} /></div>
                    <h3 className="text-2xl font-black text-slate-900">Nova Unidade Omni</h3>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
              </div>
              <form onSubmit={handleCreateStore} className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia</label>
                       <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900" value={newStore.nome} onChange={e => setNewStore({...newStore, nome: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                       <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-slate-900" placeholder="00.000.000/0001-00" value={newStore.cnpj} onChange={e => setNewStore({...newStore, cnpj: e.target.value})} />
                    </div>
                 </div>

                 <div className="bg-slate-900 p-8 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-2 text-blue-400">
                       <Lock size={20} />
                       <h4 className="text-xs font-black uppercase tracking-widest">Acesso do Administrador</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-mail do Admin</label>
                          <div className="relative">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                             <input required type="email" className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500" placeholder="admin@loja.com" value={newStore.admin_email} onChange={e => setNewStore({...newStore, admin_email: e.target.value})} />
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha Inicial</label>
                          <div className="relative">
                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                             <input required type="text" className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500" value={newStore.admin_password} onChange={e => setNewStore({...newStore, admin_password: e.target.value})} />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-700 rounded-2xl">
                    <AlertCircle size={20} />
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Nota: Os módulos iniciais poderão ser configurados imediatamente após a criação na lista principal.</p>
                 </div>

                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3">
                    Concluir e Criar Tenant <CheckCircle2 size={24} />
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
