
import React, { useEffect, useState } from 'react';
import { 
  Building2, Plus, X, Globe, DollarSign, 
  AlertCircle, ArrowRight, TrendingUp,
  Activity, Search, ShieldCheck, Zap,
  ExternalLink, CreditCard, Trash2, RefreshCw
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
    plan: 'Premium',
    mensalidade: 499.00
  });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stores')
        .select(`*`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStores(data || []);
    } catch (e) {
      console.error("Erro sync:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMaster()) {
      window.location.href = '#/login';
      return;
    }
    fetchStores();
  }, []);

  const handleDeleteStore = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente remover a unidade "${name}"?`)) return;
    try {
      const { error } = await supabase.from('stores').delete().eq('id', id);
      if (error) throw error;
      await fetchStores();
    } catch (err: any) {
      alert("Erro ao deletar: " + err.message);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    
    // IMPORTANTE: Não enviamos o campo ID. O banco UUID gera sozinho.
    const storeData = {
      nome_fantasia: newStore.nome,
      cnpj: newStore.cnpj.trim(),
      plano_ativo: newStore.plan,
      mensalidade: newStore.mensalidade,
      status: 'Ativo',
      vencimento_mensalidade: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
    };

    try {
      const { error } = await supabase.from('stores').insert([storeData]);
      if (error) throw error;
      
      await fetchStores();
      setIsModalOpen(false);
      setNewStore({ nome: '', cnpj: '', plan: 'Premium', mensalidade: 499.00 });
      alert("Unidade implantada com sucesso via UUID!");
    } catch (err: any) {
      alert("Erro ao criar unidade: " + err.message);
    } finally {
      setIsDeploying(false);
    }
  };

  const totalMRR = stores.reduce((acc, s) => acc + (Number(s.mensalidade) || 0), 0);
  const hqRole = getMasterRole();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest">HQ Center</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">OmniERP <span className="text-indigo-600">HQ</span></h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Painel Administrativo do Sistema</p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={fetchStores} className="p-5 bg-white border border-slate-200 rounded-[24px] text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
             <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
          {hqRole === 'master_admin' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 uppercase tracking-widest"
            >
              <Zap size={20} /> Nova Unidade
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unidades Totais</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{stores.length}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MRR Consolidado</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">R$ {totalMRR.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-center">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status Database</p>
          <p className="text-xl font-black uppercase">Conectado (Cloud)</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-3">Unidades Licenciadas</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Unidade</th>
                <th className="px-10 py-6">Plano</th>
                <th className="px-10 py-6 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.length === 0 && !loading && (
                <tr><td colSpan={4} className="p-20 text-center text-slate-400 font-bold uppercase text-xs">Nenhuma unidade implantada.</td></tr>
              )}
              {stores.map(store => (
                <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-10 py-8 text-xs">
                    <span className={`px-3 py-1 rounded-full font-black uppercase border ${store.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                      {store.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div>
                      <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{store.nome_fantasia}</p>
                      <p className="text-[10px] text-slate-400 font-bold">CNPJ: {store.cnpj}</p>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-sm font-bold text-slate-600">{store.plano_ativo}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => impersonateStore(store.id)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-slate-900 transition-all"
                      >
                         Gerenciar
                      </button>
                      <button 
                        onClick={() => handleDeleteStore(store.id, store.nome_fantasia)}
                        className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <h3 className="text-3xl font-black text-slate-900 uppercase italic">Nova Unidade</h3>
               <button onClick={() => setIsModalOpen(false)}><X size={32}/></button>
            </div>
            
            <form onSubmit={handleCreateStore} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razão Social</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newStore.nome} onChange={e => setNewStore({...newStore, nome: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ</label>
                  <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={newStore.cnpj} onChange={e => setNewStore({...newStore, cnpj: e.target.value})} />
                </div>
              </div>
              
              <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Contrato de Licenciamento</p>
                <div className="grid grid-cols-2 gap-6">
                   <select className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-xs" value={newStore.plan} onChange={e => setNewStore({...newStore, plan: e.target.value})}>
                      <option>Basic</option>
                      <option>Premium</option>
                      <option>Enterprise</option>
                   </select>
                   <input required type="number" className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl font-bold text-xs text-emerald-400" placeholder="VALOR" value={newStore.mensalidade} onChange={e => setNewStore({...newStore, mensalidade: parseFloat(e.target.value) || 0})} />
                </div>
              </div>

              <button disabled={isDeploying} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all active:scale-95">
                 {isDeploying ? "Implantando..." : "Finalizar Implantação"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDashboard;
