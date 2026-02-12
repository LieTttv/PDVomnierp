
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
  BrainCircuit
} from 'lucide-react';
import { CHART_DATA } from '../constants';

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</span>
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-600`}>
        <Icon size={20} />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-slate-900">{value}</span>
      {trend && (
        <span className={`text-xs font-semibold flex items-center ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Vendas Mensais" value="R$ 142.380" icon={TrendingUp} trend={12.5} color="blue" />
        <StatCard title="Itens Baixo Estoque" value="14" icon={AlertTriangle} trend={-2} color="amber" />
        <StatCard title="Produtos Vencendo" value="3" icon={Clock} color="rose" />
        <StatCard title="Pedidos Pendentes" value="28" icon={Package} trend={5.2} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Fluxo de Vendas vs Impostos</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="vendas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="impostos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="bg-blue-600 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="text-blue-200" size={24} />
              <h3 className="text-lg font-bold">Insights Inteligentes</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              "Observamos que 15% do seu estoque de farmacêuticos vencerá nos próximos 30 dias. Sugerimos uma campanha de desconto imediata para os itens: Amoxicilina e Ibuprofeno."
            </p>
            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors">
              Ver Sugestões Detalhadas
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        </div>
      </div>

      {/* Recent Activity / External Sales */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Vendas Externas Recentes</h3>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Sincronizado via App Mobile</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Valor Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { seller: 'André Silva', client: 'Mercado do João', total: 'R$ 850,00', status: 'Processado' },
                { seller: 'Carla Dias', client: 'Farmácia Saúde', total: 'R$ 1.220,00', status: 'Sincronizando' },
                { seller: 'Beto Lima', client: 'Distribuidora Leste', total: 'R$ 4.500,00', status: 'Processado' }
              ].map((order, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{order.seller}</td>
                  <td className="px-6 py-4 text-slate-600">{order.client}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Processado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600 animate-pulse'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-bold cursor-pointer hover:underline">Ver Detalhes</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
