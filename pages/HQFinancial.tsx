
import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Calendar, Search, ArrowUpRight, ArrowDownRight, CreditCard, Activity, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Store } from '../types';

const HQFinancial: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('stores').select('*');
      if (error) throw error;
      setStores(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const totalMRR = stores.reduce((acc, s) => acc + (Number(s.mensalidade) || 0), 0);
  const projectedLoss = stores.filter(s => s.status === 'Bloqueado').reduce((acc, s) => acc + (Number(s.mensalidade) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Gestão <span className="text-emerald-600">Financeira SaaS</span></h2>
          <p className="text-slate-500 font-bold text-sm">Monitoramento de receita e fluxo de caixa consolidado.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={fetchFinanceData} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all"><RefreshCw size={20} className={loading ? 'animate-spin' : ''}/></button>
           <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">Conciliação Global</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24}/></div>
              <ArrowUpRight className="text-emerald-500" size={20} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Faturamento Recorrente (MRR)</p>
           <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><AlertCircle size={24}/></div>
              <ArrowDownRight className="text-rose-500" size={20} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inadimplência (Bloqueados)</p>
           <p className="text-3xl font-black text-rose-600 tracking-tighter">R$ {projectedLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center"><Activity size={24}/></div>
           </div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Unidades Implantadas</p>
           <p className="text-3xl font-black tracking-tighter">{stores.length} Unid.</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-3"><CreditCard className="text-indigo-600" /> Fluxo de Mensalidades</h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar unidade..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none w-72" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                <tr>
                   <th className="px-10 py-6">Status Comercial</th>
                   <th className="px-10 py-6">Unidade Cliente</th>
                   <th className="px-10 py-6">Próximo Vencimento</th>
                   <th className="px-10 py-6">Valor Contrato (R$)</th>
                   <th className="px-10 py-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-10 py-8">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                          item.status === 'Ativo' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                          'bg-rose-50 border-rose-100 text-rose-600'
                        }`}>
                           {item.status}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <p className="font-black text-slate-900 uppercase tracking-tight">{item.nome_fantasia}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">CNPJ: {item.cnpj}</p>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                           <Calendar size={14} className="text-slate-300" /> {new Date(item.vencimento_mensalidade).toLocaleDateString('pt-BR')}
                        </div>
                     </td>
                     <td className="px-10 py-8 font-black text-slate-900 text-lg">R$ {Number(item.mensalidade).toFixed(2)}</td>
                     <td className="px-10 py-8 text-right">
                        <button className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all">Gestão Billing</button>
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

export default HQFinancial;
