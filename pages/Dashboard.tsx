
import React from 'react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  BrainCircuit,
  Store,
  Calendar
} from 'lucide-react';
import { CHART_DATA } from '../constants';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</span>
      <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={18} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-black text-slate-900">{value}</span>
      {trend && (
        <span className={`text-[10px] font-black flex items-center px-2 py-0.5 rounded-lg ${trend > 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center text-blue-600"><Store size={28}/></div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Painel Operacional</h3>
               <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><Calendar size={12}/> Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
            </div>
         </div>
         <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all">Relatório Completo</button>
      </div>

      {/* KPIs Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento Bruto" value="R$ 142.380" icon={TrendingUp} trend={12.5} color="blue" />
        <StatCard title="Estoque Crítico" value="14 Itens" icon={AlertTriangle} trend={-2} color="amber" />
        <StatCard title="Vencimentos" value="3 Itens" icon={Clock} color="rose" />
        <StatCard title="Pedidos do Dia" value="28 Und" icon={Package} trend={5.2} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Volume de Vendas Semanal</h3>
             <div className="flex gap-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Vendas</div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Impostos</div>
             </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                />
                <Bar dataKey="vendas" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="impostos" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] shadow-2xl text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md"><BrainCircuit className="text-indigo-200" size={24} /></div>
              <h3 className="text-xl font-black uppercase tracking-tight">OmniAI Insight</h3>
            </div>
            <p className="text-indigo-50 text-sm leading-relaxed mb-8 font-medium">
              "Detectamos que sua categoria de <strong>Têxteis</strong> teve um aumento de demanda de 22%. Recomendamos aumentar o estoque de segurança para evitar rupturas."
            </p>
            <button className="w-full bg-white text-indigo-700 py-4 rounded-2xl font-black text-xs hover:bg-indigo-50 transition-all uppercase tracking-widest active:scale-95">
              Aplicar Estratégia
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
