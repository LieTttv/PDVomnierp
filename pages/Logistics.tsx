
import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Navigation, 
  Maximize2, 
  ChevronRight, 
  Clock, 
  BrainCircuit,
  LayoutList
} from 'lucide-react';
import { MOCK_CLIENTS, MOCK_INVOICES } from '../constants';
import { optimizeRoute } from '../services/geminiService';

const Logistics: React.FC = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<string | null>(null);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const addresses = MOCK_CLIENTS.slice(0, 3).map(c => c.address);
    const result = await optimizeRoute(addresses);
    setOptimizationResult(result);
    setIsOptimizing(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Route Planning */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Navigation className="text-blue-600" /> Planejamento de Rotas Otimizadas
              </h3>
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isOptimizing ? 'Calculando...' : 'Otimizar com IA'}
              </button>
            </div>

            {/* Simulated Map Container */}
            <div className="aspect-video bg-slate-200 rounded-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/1200/800?grayscale&blur=1')] bg-cover opacity-50"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/10">
                 <div className="bg-white/90 p-4 rounded-xl shadow-2xl backdrop-blur-sm max-w-sm">
                   <MapPin className="text-blue-600 mx-auto mb-2" size={32} />
                   <p className="text-sm font-bold text-slate-800">Visualização do Google Maps</p>
                   <p className="text-xs text-slate-500 mt-1">Integração ativa para cálculo de rotas e acompanhamento em tempo real.</p>
                 </div>
              </div>
              <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                <Maximize2 size={20} className="text-slate-600" />
              </button>
            </div>

            {/* AI Result Area */}
            {optimizationResult && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-100 rounded-xl animate-in slide-in-from-top duration-500">
                <div className="flex items-center gap-2 mb-3 text-blue-700">
                  <BrainCircuit size={20} />
                  <h4 className="font-bold">Sequência de Entrega Sugerida</h4>
                </div>
                <div className="prose prose-sm text-blue-800 whitespace-pre-wrap">
                  {optimizationResult}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm flex items-center gap-2">
               <LayoutList size={16} /> Faturas na Rota de Hoje (001-RotaA)
             </div>
             <div className="divide-y divide-slate-100">
                {MOCK_INVOICES.map((inv, idx) => (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600">{idx + 1}</div>
                      <div>
                        <p className="font-bold text-slate-900">NF {inv.number}</p>
                        <p className="text-xs text-slate-500">{MOCK_CLIENTS.find(c => c.id === inv.clientId)?.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-bold text-emerald-600 flex items-center gap-1"><Clock size={12} /> Entrega Estimada: 14:30</p>
                      </div>
                      <ChevronRight className="text-slate-300" />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Status and Active Vehicles */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800">
               <Truck size={18} className="text-blue-600" /> Frota em Operação
             </h3>
             <div className="space-y-4">
                {[
                  { plate: 'ABC-1234', driver: 'Marco Túlio', status: 'Em trânsito', progress: 65 },
                  { plate: 'XYZ-9876', driver: 'João Ferreira', status: 'Carregando', progress: 10 },
                  { plate: 'DEF-4567', driver: 'Sérgio Mendes', status: 'Concluído', progress: 100 }
                ].map((vehicle, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900">{vehicle.plate} • {vehicle.driver}</span>
                      <span className="text-slate-500">{vehicle.status}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${vehicle.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        style={{ width: `${vehicle.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <h4 className="text-lg font-bold mb-2">Desempenho Logístico</h4>
            <p className="text-sm text-emerald-100 mb-4">Você economizou 12% em combustível este mês usando as rotas otimizadas.</p>
            <div className="text-3xl font-black">98.2%</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Entregas no Prazo</div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
