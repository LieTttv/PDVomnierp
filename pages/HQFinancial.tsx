
import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle2, Calendar, Search, ArrowUpRight, ArrowDownRight, CreditCard, Activity } from 'lucide-react';

const HQFinancial: React.FC = () => {
  const billingData = [
    { id: '1', store: 'Mercado Central', value: 499.00, due: '2024-03-25', status: 'Pago', method: 'Boleto' },
    { id: '2', store: 'Farmácia Vida Longa', value: 350.00, due: '2024-03-28', status: 'Pendente', method: 'Cartão' },
    { id: '3', store: 'Distribuidora Norte', value: 890.00, due: '2024-03-15', status: 'Atrasado', method: 'PIX' },
    { id: '4', store: 'Têxtil Brasil S.A.', value: 1200.00, due: '2024-04-01', status: 'Pago', method: 'Boleto' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Gestão <span className="text-emerald-600">Financeira SaaS</span></h2>
          <p className="text-slate-500 font-bold text-sm">Monitoramento de receita e fluxo de caixa das unidades licenciadas.</p>
        </div>
        <div className="flex gap-4">
           <button className="px-6 py-4 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50">Relatórios Mensais</button>
           <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100">Conciliação Bancária</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><TrendingUp size={24}/></div>
              <ArrowUpRight className="text-emerald-500" size={20} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receita Recorrente (MRR)</p>
           <p className="text-3xl font-black text-slate-900 tracking-tighter">R$ 48.240,00</p>
        </div>
        
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center"><AlertCircle size={24}/></div>
              <ArrowDownRight className="text-rose-500" size={20} />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inadimplência Projetada</p>
           <p className="text-3xl font-black text-rose-600 tracking-tighter">R$ 1.850,00</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center"><Activity size={24}/></div>
           </div>
           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Saldo em Conta (PJ)</p>
           <p className="text-3xl font-black tracking-tighter">R$ 124.890,15</p>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
           <h3 className="font-black text-slate-900 text-lg uppercase flex items-center gap-3"><CreditCard className="text-indigo-600" /> Fluxo de Mensalidades</h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Filtrar por unidade..." className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none w-72" />
           </div>
        </div>
        
        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">
                <tr>
                   <th className="px-10 py-6">Status</th>
                   <th className="px-10 py-6">Unidade Cliente</th>
                   <th className="px-10 py-6">Vencimento</th>
                   <th className="px-10 py-6">Valor (R$)</th>
                   <th className="px-10 py-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingData.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-10 py-8">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                          item.status === 'Pago' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                          item.status === 'Atrasado' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                           {item.status}
                        </span>
                     </td>
                     <td className="px-10 py-8">
                        <p className="font-black text-slate-900 uppercase tracking-tight">{item.store}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Via {item.method}</p>
                     </td>
                     <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                           <Calendar size={14} className="text-slate-300" /> {new Date(item.due).toLocaleDateString('pt-BR')}
                        </div>
                     </td>
                     <td className="px-10 py-8 font-black text-slate-900 text-lg">R$ {item.value.toFixed(2)}</td>
                     <td className="px-10 py-8 text-right">
                        <button className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase rounded-xl hover:bg-indigo-600 transition-all">Ver Detalhes</button>
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
