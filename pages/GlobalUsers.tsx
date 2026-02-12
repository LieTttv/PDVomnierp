
import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Shield, Search, Mail, 
  Clock, Power, Key, Building2, AlertTriangle,
  Fingerprint, Settings2, Trash2, ShieldAlert, X, Save, ExternalLink, RefreshCw, Zap, UserPlus, Package, Lock,
  // Fix: Added missing DollarSign import
  DollarSign
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { impersonateStore } from '../services/authService';

const GlobalUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [globalAdmins, setGlobalAdmins] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);

  // Estado do Formulário de Implantação
  const [deployForm, setDeployForm] = useState({
    store_name: '',
    store_cnpj: '',
    store_plan: 'Premium',
    store_price: 499.00,
    admin_name: '',
    admin_email: '',
    admin_password: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, email, role, updated_at,
          store_users (
            stores ( id, nome_fantasia, status, plano_ativo )
          )
        `)
        .eq('role', 'admin');
      
      if (error) throw error;

      const formatted = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        storeId: p.store_users?.[0]?.stores?.id,
        store: p.store_users?.[0]?.stores?.nome_fantasia || 'Sem Vínculo',
        plan: p.store_users?.[0]?.stores?.plano_ativo || 'N/A',
        status: p.store_users?.[0]?.stores?.status || 'Inativo',
        lastLogin: new Date(p.updated_at).toLocaleDateString()
      }));

      setGlobalAdmins(formatted);

      // Busca planos disponíveis
      const { data: plansData } = await supabase.from('system_plans').select('*');
      setPlans(plansData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeploy = async () => {
    if (!deployForm.store_name || !deployForm.admin_email || !deployForm.admin_password) {
      alert("Preencha todos os campos da implantação.");
      return;
    }

    try {
      // 1. Criar a Loja
      const { data: store, error: storeErr } = await supabase.from('stores').insert([{
        nome_fantasia: deployForm.store_name,
        cnpj: deployForm.store_cnpj,
        plano_ativo: deployForm.store_plan,
        mensalidade: deployForm.store_price,
        status: 'Ativo'
      }]).select().single();
      
      if (storeErr) throw storeErr;

      // 2. Criar o Perfil do Admin (Simulado via Profiles, ideal usar Auth Admin em prod)
      const { data: profile, error: profileErr } = await supabase.from('profiles').insert([{
        name: deployForm.admin_name,
        email: deployForm.admin_email,
        role: 'admin',
        // No MVP, salvamos a senha no profile para o authService ler. Em PROD usar Auth do Supabase.
        password: deployForm.admin_password 
      }]).select().single();

      if (profileErr) throw profileErr;

      // 3. Vincular Admin à Loja
      await supabase.from('store_users').insert([{
        user_id: profile.id,
        store_id: store.id
      }]);

      alert("Implantação Concluída! Loja e Administrador criados com sucesso.");
      setIsDeployModalOpen(false);
      fetchClients();
    } catch (err: any) {
      alert("Erro na implantação: " + err.message);
    }
  };

  const filtered = globalAdmins.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.store.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Painel de <span className="text-indigo-600">Clientes</span></h2>
          <p className="text-slate-500 font-bold text-sm">Gestão de unidades licenciadas e administradores.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchClients} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsDeployModalOpen(true)}
            className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest"
          >
            <Zap size={20} /> Implantar Nova Unidade
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
         <Search className="text-slate-300 ml-4" size={24} />
         <input 
            type="text" 
            placeholder="Buscar por cliente, loja ou CNPJ..." 
            className="w-full py-4 bg-transparent outline-none font-bold text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(admin => (
          <div key={admin.id} className="p-8 rounded-[40px] border border-slate-100 bg-white hover:shadow-2xl transition-all flex flex-col justify-between group">
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg">
                      {admin.name.charAt(0)}
                   </div>
                   <div className="flex flex-col items-end gap-1">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${admin.status === 'Bloqueado' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                         {admin.status}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{admin.plan}</span>
                   </div>
                </div>

                <div>
                   <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{admin.name}</h4>
                   <p className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-1 uppercase italic tracking-widest"><Building2 size={12}/> {admin.store}</p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Mail size={14} className="text-slate-300" /> {admin.email}
                   </div>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Clock size={14} className="text-slate-300" /> Visto em: {admin.lastLogin}
                   </div>
                </div>
             </div>

             <div className="mt-8">
                <button 
                  onClick={() => impersonateStore(admin.storeId)}
                  className="w-full py-4 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                   Acessar Unidade <ExternalLink size={14}/>
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* MODAL DE IMPLANTAÇÃO (LOJA + ADMIN) */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-4xl rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 className="text-3xl font-black text-slate-900 uppercase italic">Implantar Licença</h3>
                 <button onClick={() => setIsDeployModalOpen(false)}><X size={32}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                 {/* Seção 1: Dados da Unidade */}
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                       <Building2 size={16} /> 1. Dados da Unidade (Licença)
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                       <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="RAZÃO SOCIAL / FANTASIA" value={deployForm.store_name} onChange={e => setDeployForm({...deployForm, store_name: e.target.value})} />
                       <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="CNPJ" value={deployForm.store_cnpj} onChange={e => setDeployForm({...deployForm, store_cnpj: e.target.value})} />
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={deployForm.store_plan} onChange={e => {
                          const p = plans.find(pl => pl.name === e.target.value);
                          setDeployForm({...deployForm, store_plan: e.target.value, store_price: p?.price || 0});
                       }}>
                          {plans.map(p => <option key={p.id} value={p.name}>Plano {p.name} - R$ {p.price}</option>)}
                       </select>
                       <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                          <DollarSign className="text-indigo-600" />
                          <div>
                             <p className="text-[9px] font-black text-indigo-400 uppercase">Mensalidade</p>
                             <p className="text-xl font-black text-indigo-900">R$ {deployForm.store_price.toFixed(2)}</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Seção 2: Dados do Administrador */}
                 <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                       <UserPlus size={16} /> 2. Administrador da Unidade
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="NOME DO ADMIN" value={deployForm.admin_name} onChange={e => setDeployForm({...deployForm, admin_name: e.target.value})} />
                       <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="E-MAIL DE LOGIN" value={deployForm.admin_email} onChange={e => setDeployForm({...deployForm, admin_email: e.target.value})} />
                       </div>
                       <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input type="password" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="SENHA INICIAL" value={deployForm.admin_password} onChange={e => setDeployForm({...deployForm, admin_password: e.target.value})} />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 border-t border-slate-100 flex items-center justify-end gap-6 bg-slate-50/50">
                 <button onClick={() => setIsDeployModalOpen(false)} className="text-xs font-black text-slate-400 uppercase">Cancelar</button>
                 <button onClick={handleDeploy} className="px-12 py-5 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-slate-900 transition-all">
                    Finalizar Implantação
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalUsers;
