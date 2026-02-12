
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

  const totalMRR = stores.reduce((acc, s) => acc + (Number(s.mensalidade) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-full tracking-widest shadow-lg shadow-indigo-100">HQ Control</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">OmniERP <span className="text-indigo-600">HQ</span></h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Monitoramento de Ecossistema SaaS</p>
        </div>
        
        <div className="flex gap-4">
          <button onClick={fetchStores} className="p-5 bg-white border border-slate-200 rounded-[24px] text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
             <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Unidades Ativas</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter">{stores.filter(s => s.status === 'Ativo').length}</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MRR Global</p>
          <p className="text-4xl font-black text-emerald-600 tracking-tighter">R$ {totalMRR.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl flex flex-col justify-center border border-slate-800">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status Tenancy</p>
          <p className="text-xl font-black uppercase tracking-widest">Ativo (Multi-DB)</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
           <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-3">Visão Geral de Unidades</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Unidade Cliente</th>
                <th className="px-10 py-6">Plano SaaS</th>
                <th className="px-10 py-6 text-right">Ações</th>
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
                  <td className="px-10 py-8 text-sm font-bold text-slate-600 uppercase tracking-widest italic">{store.plano_ativo}</td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => impersonateStore(store.id)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-slate-900 transition-all"
                      >
                         Acessar Unidade
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
    </div>
  );
};

export default MasterDashboard;
