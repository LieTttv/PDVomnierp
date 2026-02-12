
import React, { useState } from 'react';
import { 
  Settings2, ShieldCheck, DollarSign, Database, Server, 
  History, Globe, Lock, AlertTriangle, Save, RefreshCw,
  LayoutGrid, Power, Cpu, Terminal,
  // Fix: Added missing CheckCircle2 icon
  CheckCircle2
} from 'lucide-react';

const SaaSSettings: React.FC = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Configurações SaaS</h2>
          <p className="text-slate-500 font-bold text-sm italic">HQ Master: Parâmetros globais do sistema e infraestrutura.</p>
        </div>
        <button className="flex items-center gap-2 px-10 py-5 bg-emerald-600 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-emerald-700 transition-all uppercase tracking-widest">
           <Save size={20} /> Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Parametrização Comercial */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl space-y-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                 <DollarSign className="text-indigo-600" /> Tabela de Preços Global
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensalidade Base (Plano Padrão)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={18} />
                       <input type="number" step="0.01" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none focus:ring-2 focus:ring-indigo-600" defaultValue={299.90} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Taxa de Implantação (Setup)</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-600" size={18} />
                       <input type="number" step="0.01" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-3xl font-black text-lg outline-none" defaultValue={150.00} />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Módulos do Plano Base</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Faturamento NF-e', 'Gestão de Estoque', 'Pedidos Internos'].map(mod => (
                       <div key={mod} className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between text-indigo-700 font-bold text-xs uppercase italic">
                          {mod} <CheckCircle2 size={16} />
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="bg-slate-900 p-10 rounded-[48px] text-white space-y-8 shadow-2xl overflow-hidden relative group">
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex items-center gap-3">
                    <AlertTriangle className="text-amber-400" size={32} />
                    <h3 className="text-xl font-black uppercase">Modo de Manutenção Global</h3>
                 </div>
                 <button 
                  onClick={() => setIsMaintenance(!isMaintenance)}
                  className={`w-20 h-10 rounded-full transition-all flex items-center px-1 ${isMaintenance ? 'bg-amber-400' : 'bg-slate-800'}`}
                 >
                    <div className={`w-8 h-8 rounded-full bg-white transition-all transform ${isMaintenance ? 'translate-x-10' : 'translate-x-0'}`}></div>
                 </button>
              </div>
              <p className="text-slate-400 text-sm font-medium relative z-10 italic">
                 "Ao ativar, todos os terminais operacionais das lojas serão desconectados. Apenas o painel Master HQ permanecerá acessível."
              </p>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-amber-400/10 rounded-full blur-[100px]"></div>
           </div>
        </div>

        {/* Infra e Segurança */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-xl space-y-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                 <Cpu className="text-indigo-600" /> Saúde da Infraestrutura
              </h3>
              
              <div className="space-y-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Server className="text-emerald-500" size={18} />
                       <span className="text-[10px] font-black uppercase text-slate-600">Servidores Cloud</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-600">Online 99.9%</span>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Database className="text-blue-500" size={18} />
                       <span className="text-[10px] font-black uppercase text-slate-600">Storage Tenancy</span>
                       <span className="text-[10px] font-black text-slate-300">248 GB / 1 TB</span>
                    </div>
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
              <div className="flex items-center justify-between">
                 <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={16} /> Console do Master
                 </h3>
                 <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase">Limpar Logs</button>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl font-mono text-[10px] text-emerald-400/80 space-y-2 overflow-hidden h-40">
                 <p>&gt; sys_master_init: 200 OK</p>
                 <p>&gt; sync_tenancy_buffer: complete</p>
                 <p>&gt; active_connections: 128 nodes</p>
                 <p className="animate-pulse">&gt; monitoring infra... [stable]</p>
                 <p>&gt; daily_backup: scheduled 03:00AM</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SaaSSettings;
