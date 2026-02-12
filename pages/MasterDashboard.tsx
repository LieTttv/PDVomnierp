
import React, { useEffect, useState } from 'react';
import { 
  Building2, Plus, X, Globe, DollarSign, 
  AlertCircle, ArrowRight, TrendingUp,
  Activity, Search, ShieldCheck, Zap,
  ExternalLink, CreditCard
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { isMaster, impersonateStore, getMasterRole } from '../services/authService';
import { Store } from '../types';

const MasterDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [newStore, setNewStore] = useState({ 
    nome: '', 
    cnpj: '', 
    admin_email: '', 
    admin_password: '',
    plan: 'Premium',
    mensalidade: 499.00
  });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('stores')
        .select(`*, store_modules (module_id)`)
        .order('created_at', { ascending: false });
      if (data) setStores(data as any[]);
    } catch (e) {
      console.warn("Using local store buffer.");
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

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 1500));
    
    const storeId = crypto.randomUUID();
    const createdStore = {
      id: storeId,
      nome_fantasia: newStore.nome,
      cnpj: newStore.cnpj,
      plano_ativo: newStore.plan,
      mensalidade: newStore.mensalidade,
      status: 'Ativo',
      created_at: new Date().toISOString(),
    } as any;

    setStores(prev => [createdStore, ...prev]);
    setIsDeploying(false);
    setIsModalOpen(false);
  };

  const totalMRR = stores.reduce((acc, s) => acc + (s.mensalidade || 0), 0);
  const hqRole = getMasterRole();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest">HQ Command Center</span>
            <span className="text-slate-400 font-bold text-[10px] uppercase">v2.5 Enterprise</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">OmniERP <span className="text-indigo-600">HQ</span></h2>
        </div>
        
        {hqRole === 'master_admin' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest"
          >
            <Zap size={20} /> Nova Implementação
          </button>
        )}
      </div>

      {/* HQ Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center"><Globe size={24} /></div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unidades Ativas</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{stores.length}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><DollarSign size={24} /></div>
            <Activity size={20} className="text-blue-500" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Recorrente (MRR)</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">R$ {totalMRR.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
          <div className="w-12 h-12 bg-white/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6"><ShieldCheck size={24} /></div>
          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Time Interno OmniERP</p>
          <p className="text-2xl font-black mt-1">Gestão Central</p>
        </div>
        
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <CreditCard size={24} className="mb-6 opacity-60" />
            <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Inadimplência Global</p>
            <p className="text-4xl font-black tracking-tighter">0.8%</p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform"></div>
        </div>
      </div>

      {/* Control List */}
      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight flex items-center gap-3">
             <Activity className="text-indigo-600" size={20} /> Gestão de Licenciamento
           </h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar por CNPJ ou Nome Fantasia..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 w-96 shadow-sm" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Unidade / Cliente</th>
                <th className="px-10 py-6">Plano / MRR</th>
                <th className="px-10 py-6 text-right">Ações do Time Omni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-8">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${store.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                          {store.nome_fantasia.charAt(0)}
                       </div>
                       <div>
                          <p className="font-black text-slate-900 text-lg tracking-tight uppercase">{store.nome_fantasia}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CNPJ: {store.cnpj}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div>
                       <p className="text-sm font-black text-slate-700">{store.plano_ativo}</p>
                       <p className="text-xs font-bold text-slate-400">R$ {store.mensalidade?.toFixed(2)} / mensal</p>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => impersonateStore(store.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-slate-900 transition-all active:scale-95"
                      >
                         Acessar Painel <ExternalLink size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
            <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Implantar Nova Unidade</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all"><X size={32}/></button>
            </div>
            
            <form onSubmit={handleCreateStore} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Empresa</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={newStore.nome} onChange={e => setNewStore({...newStore, nome: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={newStore.cnpj} onChange={e => setNewStore({...newStore, cnpj: e.target.value})} />
                </div>
              </div>
              
              <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Configuração Financeira SaaS</p>
                <div className="grid grid-cols-2 gap-6">
                   <select className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-xs outline-none" value={newStore.plan} onChange={e => setNewStore({...newStore, plan: e.target.value})}>
                      <option>Basic</option>
                      <option>Premium</option>
                      <option>Enterprise</option>
                   </select>
                   <input required type="number" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-xs text-emerald-400" placeholder="MENSALIDADE (R$)" value={newStore.mensalidade} onChange={e => setNewStore({...newStore, mensalidade: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              <button disabled={isDeploying} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all">
                 {isDeploying ? "Deploying Assets..." : "Executar Implantação"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
