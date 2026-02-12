import React, { useEffect, useState } from 'react';
import { 
  Building2, Plus, X, Trash2, Globe, Lock, Mail, 
  CheckCircle2, AlertCircle, ArrowRight, DollarSign, 
  CalendarClock, Layers, Power, Send, Edit3, TrendingUp,
  Activity, Users as UsersIcon, ShieldCheck,
  // Fix: Added missing Search icon to resolve "Cannot find name 'Search'" error
  Search
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { isMaster } from '../services/authService';
import { Store } from '../types';

const MasterDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModulesOpen, setIsEditModulesOpen] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState<any>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [storeToEdit, setStoreToEdit] = useState<Store | null>(null);
  
  const [newStore, setNewStore] = useState({ 
    nome: '', 
    cnpj: '', 
    endereco: '',
    mensalidade: 299.90,
    admin_email: '', 
    admin_password: '',
    modules: ['faturamento', 'estoque', 'pedidos']
  });

  const availableModules = [
    { id: 'faturamento', label: 'FATURAMENTO NF-E' },
    { id: 'estoque', label: 'CONTROLE DE ESTOQUE' },
    { id: 'pedidos', label: 'GESTÃO DE PEDIDOS' },
    { id: 'vendas_externas', label: 'VENDAS EXTERNAS (APP)' },
    { id: 'logistica', label: 'ROTEIRIZAÇÃO LOGÍSTICA' },
    { id: 'relatorios', label: 'RELATÓRIOS BI' }
  ];

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('stores')
        .select(`*, store_modules (module_id)`)
        .order('created_at', { ascending: false });
      if (data) setStores(data as any[]);
    } catch (e) {
      console.warn("API offline, usando dados em memória.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isMaster()) {
      window.location.href = '#/login';
      return;
    }
    fetchStores();
  }, []);

  const calculateDaysLeft = (dateStr?: string) => {
    if (!dateStr) return 30;
    const diffTime = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    // Simulação de delay de infraestrutura
    await new Promise(r => setTimeout(r, 2000));
    
    const storeId = crypto.randomUUID();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    const createdStore = {
      id: storeId,
      nome_fantasia: newStore.nome,
      cnpj: newStore.cnpj,
      mensalidade: newStore.mensalidade,
      vencimento_mensalidade: expiry.toISOString(),
      status: 'Ativo',
      created_at: new Date().toISOString(),
      store_modules: newStore.modules.map(m => ({ module_id: m, store_id: storeId }))
    } as any;

    setStores(prev => [createdStore, ...prev]);
    setDeploymentSuccess({ ...newStore, id: storeId, vencimento_mensalidade: expiry.toISOString() });
    setIsDeploying(false);
  };

  const totalMRR = stores.reduce((acc, s) => acc + (s.mensalidade || 0), 0);
  const criticalStores = stores.filter(s => calculateDaysLeft(s.vencimento_mensalidade) <= 5).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">OmniMaster <span className="text-indigo-600">HQ</span></h2>
          <p className="text-slate-500 font-bold text-sm">Controle central de licenciamento e saúde da plataforma.</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setDeploymentSuccess(null); }}
          className="flex items-center gap-3 px-8 py-5 bg-indigo-600 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus size={24} /> Implantar Nova Loja
        </button>
      </div>

      {/* Métricas Master */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Globe size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lojas Licenciadas</p>
            <p className="text-3xl font-black text-slate-900">{stores.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><DollarSign size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MRR (Faturamento SaaS)</p>
            <p className="text-3xl font-black text-emerald-600">R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><AlertCircle size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Licenças Vencendo</p>
            <p className="text-3xl font-black text-rose-600">{criticalStores}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] text-white flex flex-col justify-between">
          <div className="w-12 h-12 bg-white/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-4"><TrendingUp size={24} /></div>
          <div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Taxa de Churn</p>
            <p className="text-3xl font-black">1.2%</p>
          </div>
        </div>
      </div>

      {/* Lista de Lojas */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-3">
             <Activity className="text-indigo-600" size={20} /> Painel de Tenência
           </h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Localizar loja..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 w-80" />
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Loja / Status</th>
                <th className="px-10 py-6">Faturamento SaaS</th>
                <th className="px-10 py-6">Módulos Ativos</th>
                <th className="px-10 py-6 text-right">Controle Master</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold italic">Nenhuma loja cadastrada para licenciamento.</td></tr>
              ) : stores.map(store => {
                const daysLeft = calculateDaysLeft(store.vencimento_mensalidade);
                const isInactive = store.status === 'Inativo';
                return (
                <tr key={store.id} className={`transition-all ${isInactive ? 'bg-slate-50 grayscale opacity-60' : 'hover:bg-indigo-50/20'}`}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isInactive ? 'bg-slate-400 text-white' : 'bg-slate-900 text-white'}`}>
                          <Building2 size={24}/>
                       </div>
                       <div>
                          <p className="font-black text-slate-900 text-xl tracking-tight uppercase">{store.nome_fantasia}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] text-slate-400 font-bold tracking-tight">{store.cnpj}</span>
                             <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${!isInactive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                {store.status}
                             </span>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                       <p className="text-sm font-black text-slate-700">R$ {store.mensalidade?.toFixed(2)} / mês</p>
                       <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border w-fit ${
                         daysLeft <= 5 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                       }`}>
                          <CalendarClock size={12} /> {daysLeft <= 0 ? 'VENCIDO' : `Vence em ${daysLeft} dias`}
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                       <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm border border-indigo-100">{store.store_modules?.length || 0}</span>
                       <button onClick={() => { setStoreToEdit(store); setIsEditModulesOpen(true); }} className="text-[10px] font-black text-indigo-400 uppercase underline hover:text-indigo-600 transition-colors">Gerenciar Módulos</button>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl transition-all shadow-sm"><Send size={18}/></button>
                      <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-2xl transition-all shadow-sm"><Power size={18}/></button>
                      <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm"><Edit3 size={18}/></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: IMPLANTAR NOVA LOJA (Conforme já implementado com foco em infra) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-[850px] rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
              {!deploymentSuccess ? (
                <>
                  <div className="p-10 flex items-center justify-between shrink-0 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200"><Building2 size={32} /></div>
                        <div>
                          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Implantar Nova Unidade</h3>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">ESTA AÇÃO GERA UM NOVO TENANT E CREDENCIAIS DE ADMIN</p>
                        </div>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
                  </div>
                  
                  <form onSubmit={handleCreateStore} className="p-10 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NOME DA LOJA</label>
                          <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={newStore.nome} onChange={e => setNewStore({...newStore, nome: e.target.value})} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                          <input required type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={newStore.cnpj} onChange={e => setNewStore({...newStore, cnpj: e.target.value})} />
                        </div>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[40px] space-y-6 text-white">
                        <div className="flex items-center gap-2 text-indigo-400">
                           <Lock size={18} />
                           <h4 className="text-[11px] font-black uppercase tracking-widest">Credenciais Administrativas Iniciais</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <input required type="email" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-sm outline-none" placeholder="E-MAIL DO DONO" value={newStore.admin_email} onChange={e => setNewStore({...newStore, admin_email: e.target.value})} />
                          <input required type="text" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-white font-bold text-sm outline-none" placeholder="SENHA TEMPORÁRIA" value={newStore.admin_password} onChange={e => setNewStore({...newStore, admin_password: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" disabled={isDeploying} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 text-sm">
                        {isDeploying ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <>FINALIZAR IMPLANTAÇÃO <ArrowRight size={24} /></>}
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-12 text-center space-y-10 animate-in bounce-in duration-700">
                   <div className="w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-2xl rotate-12"><CheckCircle2 size={48} /></div>
                   <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">TENANT CONFIGURADO!</h3>
                   <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100 text-left space-y-5 max-w-md mx-auto">
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase">PRIMEIRO VENCIMENTO</span>
                         <span className="text-xs font-black text-slate-800">{new Date(deploymentSuccess.vencimento_mensalidade).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-4">
                         <span className="text-[10px] font-black text-slate-400 uppercase">E-MAIL DO ADMIN</span>
                         <span className="text-xs font-black text-indigo-600">{deploymentSuccess.admin_email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase">SENHA PROVISÓRIA</span>
                         <span className="text-xs font-black text-indigo-600">{deploymentSuccess.admin_password}</span>
                      </div>
                   </div>
                   <button onClick={() => { setIsModalOpen(false); setDeploymentSuccess(null); }} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest shadow-xl">RETORNAR AO HQ</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
