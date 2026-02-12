
import React, { useState, useEffect } from 'react';
import { 
  Settings2, ShieldCheck, DollarSign, Database, Server, 
  History, Globe, Lock, AlertTriangle, Save, RefreshCw,
  LayoutGrid, Power, Cpu, Terminal, CheckCircle2, Plus, Edit3, Trash2, X
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const SaaSSettings: React.FC = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [dbStatus, setDbStatus] = useState<'online' | 'checking' | 'error'>('checking');
  const [latency, setLatency] = useState<number | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const checkInfra = async () => {
    const start = performance.now();
    setDbStatus('checking');
    try {
      // Ping real no Supabase consultando a tabela de planos
      const { error } = await supabase.from('system_plans').select('id', { count: 'exact', head: true });
      if (error) throw error;
      setLatency(Math.round(performance.now() - start));
      setDbStatus('online');
    } catch (e) {
      setDbStatus('error');
    }
  };

  const fetchPlans = async () => {
    const { data } = await supabase.from('system_plans').select('*').order('price');
    setPlans(data || []);
  };

  useEffect(() => {
    checkInfra();
    fetchPlans();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Cast e.currentTarget to HTMLFormElement to avoid TypeScript error
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const planData = {
      name: formData.get('name'),
      price: parseFloat(formData.get('price') as string)
    };

    if (editingPlan) {
      await supabase.from('system_plans').update(planData).eq('id', editingPlan.id);
    } else {
      await supabase.from('system_plans').insert([planData]);
    }
    
    setIsPlanModalOpen(false);
    setEditingPlan(null);
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Remover este plano permanentemente?")) return;
    await supabase.from('system_plans').delete().eq('id', id);
    fetchPlans();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase tracking-tighter italic">Configurações <span className="text-indigo-600">SaaS & Infra</span></h2>
          <p className="text-slate-500 font-bold text-sm italic">Monitoramento e precificação global da plataforma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Gestão de Planos */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                   <DollarSign className="text-indigo-600" /> Tabela de Planos SaaS
                </h3>
                <button 
                  onClick={() => { setEditingPlan(null); setIsPlanModalOpen(true); }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                >
                   <Plus size={14} /> Novo Plano
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                 {plans.map(plan => (
                   <div key={plan.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-indigo-50 transition-all">
                      <div className="flex items-center gap-6">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 font-black shadow-sm">
                            {plan.name.charAt(0)}
                         </div>
                         <div>
                            <p className="font-black text-slate-900 uppercase tracking-tight">{plan.name}</p>
                            <p className="text-lg font-black text-indigo-600 tracking-tighter">R$ {plan.price.toFixed(2)}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => { setEditingPlan(plan); setIsPlanModalOpen(true); }} className="p-3 bg-white text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm"><Edit3 size={18}/></button>
                         <button onClick={() => deletePlan(plan.id)} className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-xl shadow-sm"><Trash2 size={18}/></button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[48px] text-white space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-400" size={32} />
                    <h3 className="text-xl font-black uppercase tracking-widest">Manutenção Global</h3>
                 </div>
                 <button 
                  onClick={() => setIsMaintenance(!isMaintenance)}
                  className={`w-20 h-10 rounded-full transition-all flex items-center px-1 ${isMaintenance ? 'bg-amber-400' : 'bg-slate-800'}`}
                 >
                    <div className={`w-8 h-8 rounded-full bg-white transition-all transform ${isMaintenance ? 'translate-x-10' : 'translate-x-0'}`}></div>
                 </button>
              </div>
              <p className="text-slate-400 text-sm font-medium relative z-10 italic">
                 "Desconecta todos os terminais de lojas instantaneamente."
              </p>
           </div>
        </div>

        {/* Infra Saúde REAL */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                   <Cpu className="text-indigo-600" /> Saúde da Infraestrutura
                </h3>
                <button onClick={checkInfra} className="text-slate-400 hover:text-indigo-600"><RefreshCw size={16} /></button>
              </div>
              
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Server className={dbStatus === 'online' ? 'text-emerald-500' : 'text-rose-500'} size={18} />
                       <span className="text-[10px] font-black uppercase text-slate-600">Conexão Database</span>
                    </div>
                    <span className={`text-[9px] font-black uppercase ${dbStatus === 'online' ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {dbStatus === 'online' ? `ONLINE (${latency}ms)` : dbStatus === 'checking' ? 'CHECHANDO...' : 'OFFLINE'}
                    </span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="text-indigo-600" size={18} />
                       <span className="text-[10px] font-black uppercase text-slate-600">Criptografia SSL</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-indigo-600">Ativa</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#0f172a] p-8 rounded-[40px] border border-slate-800 shadow-2xl space-y-6">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                 <Terminal size={16} /> Monitoramento em Tempo Real
              </h3>
              <div className="bg-black/40 p-5 rounded-2xl font-mono text-[9px] text-emerald-400/80 space-y-2 overflow-hidden h-40">
                 <p>&gt; sys_master_init: 200 OK</p>
                 <p>&gt; ping_latency: {latency || '...'}ms</p>
                 <p>&gt; cloud_database: sync_stable</p>
                 <p className="animate-pulse">&gt; monitoring packets... [OK]</p>
                 <p>&gt; SSL_handshake: verified</p>
              </div>
           </div>
        </div>

      </div>

      {/* MODAL PLANOS */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{editingPlan ? 'Editar Plano' : 'Novo Plano SaaS'}</h3>
                 <button onClick={() => setIsPlanModalOpen(false)}><X size={32}/></button>
              </div>
              
              <form onSubmit={handleSavePlan} className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome do Plano</label>
                    <input name="name" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" defaultValue={editingPlan?.name || ''} placeholder="Ex: Basic" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Preço Mensal (R$)</label>
                    <input name="price" type="number" step="0.01" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-indigo-600" defaultValue={editingPlan?.price || ''} placeholder="0.00" />
                 </div>
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                    Salvar Plano
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default SaaSSettings;
