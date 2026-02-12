
import React, { useEffect, useState } from 'react';
import { 
  Building2, Plus, ShieldCheck, X, Trash2, 
  LayoutGrid, Activity, MoreVertical, Search, Globe,
  Lock, Mail, Settings2, CheckCircle2, AlertCircle,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { isMaster } from '../services/authService';
import { Store } from '../types';

const MasterDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<any>(null);
  
  const [newStore, setNewStore] = useState({ 
    nome: '', 
    cnpj: '', 
    admin_email: '', 
    admin_password: '',
    modules: ['pedidos', 'estoque'] // Módulos padrão
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
    if (!isMaster()) {
      window.location.href = '#/login';
      return;
    }
    fetchStores();
  }, []);

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMaster()) return;
    
    try {
      // 1. Criar a Loja
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert([{ 
          nome_fantasia: newStore.nome, 
          cnpj: newStore.cnpj, 
          plano_ativo: 'Enterprise SaaS' 
        }])
        .select()
        .single();

      if (storeError) throw storeError;

      // 2. Vincular Módulos Selecionados
      if (newStore.modules.length > 0) {
        const moduleInserts = newStore.modules.map(modId => ({
          store_id: store.id,
          module_id: modId
        }));
        await supabase.from('store_modules').insert(moduleInserts);
      }

      // 3. Simular criação de Admin e Link (No Supabase real, isso seria uma Edge Function)
      setDeploymentSuccess({
        ...newStore,
        id: store.id,
        created_at: store.created_at
      });
      
      setNewStore({ nome: '', cnpj: '', admin_email: '', admin_password: '', modules: ['pedidos', 'estoque'] });
      fetchStores();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleModule = async (storeId: string, moduleId: string, currentStatus: boolean) => {
    if (!isMaster()) return;
    try {
      if (currentStatus) {
        await supabase.from('store_modules').delete().eq('store_id', storeId).eq('module_id', moduleId);
      } else {
        await supabase.from('store_modules').insert([{ store_id: storeId, module_id: moduleId }]);
      }
      fetchStores();
    } catch (err: any) {
      console.error("Falha ao atualizar módulo:", err);
    }
  };

  const toggleInitialModule = (id: string) => {
    setNewStore(prev => ({
      ...prev,
      modules: prev.modules.includes(id) 
        ? prev.modules.filter(m => m !== id) 
        : [...prev.modules, id]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Gestão SaaS Omni</h2>
          <p className="text-slate-500 font-bold text-sm">Controle central de unidades e provisionamento de recursos.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setDeploymentSuccess(null); }}
          className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus size={20} /> Implantar Nova Unidade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <Globe className="text-blue-600 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Ativas</p>
          <p className="text-3xl font-black text-slate-900">{stores.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <ShieldCheck className="text-purple-600 mb-4" size={32} />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nível de Autoridade</p>
          <p className="text-xl font-black text-purple-600 uppercase">Super Master</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Lojas e Licenciamento Ativo</h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar unidade..." className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-slate-900 w-80 shadow-inner" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Unidade / Identificação</th>
                <th className="px-10 py-6">Módulos Contratados</th>
                <th className="px-10 py-6 text-right">Infraestrutura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><Building2 size={24}/></div>
                       <div>
                          <p className="font-black text-slate-900 text-xl tracking-tight">{store.nome_fantasia}</p>
                          <p className="text-xs text-slate-400 font-bold tracking-tight">{store.cnpj}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-2 max-w-lg">
                       {availableModules.map(mod => {
                         const isActive = store.store_modules?.some(sm => sm.module_id === mod.id);
                         return (
                           <button 
                             key={mod.id}
                             onClick={() => toggleModule(store.id, mod.id, !!isActive)}
                             className={`text-[9px] font-black uppercase px-3 py-2 rounded-xl border transition-all flex items-center gap-2 ${isActive ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-slate-200 text-slate-300 hover:border-emerald-200'}`}
                           >
                             {isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                             {mod.label}
                           </button>
                         )
                       })}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { if(confirm('Excluir loja?')) supabase.from('stores').delete().eq('id', store.id).then(() => fetchStores()) }} className="p-3 bg-rose-50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={20}/></button>
                      <button className="p-3 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm"><Settings2 size={20}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Implantação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-3xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
              {!deploymentSuccess ? (
                <>
                  <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100"><Building2 size={28} /></div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Setup de Nova Unidade</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provisionamento completo de banco e acessos</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
                  </div>
                  
                  <form onSubmit={handleCreateStore} className="p-10 space-y-8 overflow-y-auto scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                          <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={newStore.nome} onChange={e => setNewStore({...newStore, nome: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                          <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600" placeholder="00.000.000/0001-00" value={newStore.cnpj} onChange={e => setNewStore({...newStore, cnpj: e.target.value})} />
                        </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-center gap-2 text-indigo-600">
                          <LayoutGrid size={20} />
                          <h4 className="text-xs font-black uppercase tracking-widest">Módulos Iniciais Contratados</h4>
                       </div>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {availableModules.map(mod => {
                             const isActive = newStore.modules.includes(mod.id);
                             return (
                               <button 
                                 key={mod.id} 
                                 type="button"
                                 onClick={() => toggleInitialModule(mod.id)}
                                 className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all flex items-center justify-between ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}
                               >
                                  {mod.label}
                                  {isActive ? <CheckCircle2 size={14}/> : <Plus size={14}/>}
                               </button>
                             );
                          })}
                       </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-[40px] space-y-6">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Lock size={20} />
                          <h4 className="text-xs font-black uppercase tracking-widest">Acesso Administrativo Principal</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-mail do Administrador</label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input required type="email" className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500" placeholder="admin@empresa.com" value={newStore.admin_email} onChange={e => setNewStore({...newStore, admin_email: e.target.value})} />
                              </div>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Senha Provisória</label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input required type="text" className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500" value={newStore.admin_password} onChange={e => setNewStore({...newStore, admin_password: e.target.value})} />
                              </div>
                          </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                        Finalizar Implantação e Gerar Tenant <ArrowRight size={24} />
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-12 text-center space-y-8 animate-in bounce-in duration-700">
                   <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white"><CheckCircle2 size={48} /></div>
                   <div>
                      <h3 className="text-3xl font-black text-slate-900 uppercase">Implantação Concluída!</h3>
                      <p className="text-slate-400 font-bold text-sm mt-2">A unidade "{deploymentSuccess.nome}" já pode ser acessada.</p>
                   </div>

                   <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-200 text-left space-y-4 max-w-md mx-auto">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase">Tenant ID</span>
                         <span className="text-xs font-mono font-black text-slate-900">{deploymentSuccess.id.split('-')[0]}...</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                         <span className="text-[10px] font-black text-slate-400 uppercase">Admin E-mail</span>
                         <span className="text-xs font-black text-slate-900">{deploymentSuccess.admin_email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase">Senha Padrão</span>
                         <span className="text-xs font-black text-indigo-600">{deploymentSuccess.admin_password}</span>
                      </div>
                   </div>

                   <div className="flex flex-col gap-3">
                      <button onClick={() => { setIsModalOpen(false); setDeploymentSuccess(null); }} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl">Fechar Painel</button>
                      <button className="flex items-center justify-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 uppercase transition-all"><Copy size={14}/> Copiar Credenciais</button>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
