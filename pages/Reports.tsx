
import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, FileText, Download, Search, Calendar, Filter, History, Package, DollarSign, TrendingUp, UserCheck, AlertCircle, ArrowRight, Shield, Eye, RefreshCw, Layers, Activity, Clock, ShoppingCart, Truck, AlertTriangle
} from 'lucide-react';
import { getAuditLogs, getProducts } from '../services/productService';
import { getOrders } from '../services/orderService';
import { MOCK_CLIENTS, MOCK_INVOICES } from '../constants';
import { AuditLog, Product, Order, Entity, Invoice } from '../types';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [l, p] = await Promise.all([getAuditLogs(), getProducts()]);
      setLogs(l);
      setProducts(p);
      setOrders(getOrders());
    };
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setOrders(getOrders());
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // Lógica dos Relatórios Customizados
  const reportData = useMemo(() => {
    if (!activeReport) return null;

    const filteredOrders = orders.filter(o => o.date >= startDate && o.date <= endDate);

    switch (activeReport) {
      case 'clientes_sem_venda':
        const clientsWithSales = new Set(filteredOrders.map(o => o.clientId));
        return MOCK_CLIENTS.filter(c => !clientsWithSales.has(c.id));

      case 'vendas_por_produto':
        const prodMap: Record<string, { name: string, qty: number, total: number }> = {};
        filteredOrders.forEach(o => {
          o.items.forEach(item => {
            if (!prodMap[item.productId]) prodMap[item.productId] = { name: item.productName, qty: 0, total: 0 };
            prodMap[item.productId].qty += item.quantity;
            prodMap[item.productId].total += item.totalPrice;
          });
        });
        return Object.values(prodMap).sort((a, b) => b.total - a.total);

      case 'vendas_por_vendedor':
        const sellerMap: Record<string, { name: string, total: number, count: number }> = {};
        filteredOrders.forEach(o => {
          const seller = o.sellerName || 'Venda Interna';
          if (!sellerMap[seller]) sellerMap[seller] = { name: seller, total: 0, count: 0 };
          sellerMap[seller].total += o.total;
          sellerMap[seller].count += 1;
        });
        return Object.values(sellerMap).sort((a, b) => b.total - a.total);

      case 'vendas_por_rota':
        const routeMap: Record<string, { name: string, total: number }> = {};
        filteredOrders.forEach(o => {
          const route = o.sector || 'Geral';
          if (!routeMap[route]) routeMap[route] = { name: route, total: 0 };
          routeMap[route].total += o.total;
        });
        return Object.values(routeMap).sort((a, b) => b.total - a.total);

      case 'atraso_pagamento':
        const today = new Date();
        return MOCK_INVOICES
          .filter(inv => !inv.paymentDate && new Date(inv.dueDate || inv.date) < today)
          .map(inv => {
            const diffTime = Math.abs(today.getTime() - new Date(inv.dueDate || inv.date).getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return { ...inv, daysLate: diffDays };
          });

      default: return null;
    }
  }, [activeReport, orders, startDate, endDate]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios & Inteligência</h2>
          <p className="text-slate-500 text-sm font-medium">Análise comercial, logística e financeira por período.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2">
             <Calendar size={16} className="text-slate-400" />
             <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs font-bold border-none bg-transparent outline-none" />
             <span className="text-slate-300">até</span>
             <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs font-bold border-none bg-transparent outline-none" />
           </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button onClick={() => { setActiveTab('overview'); setActiveReport(null); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><Activity size={18} /> Visão Geral</button>
        <button onClick={() => { setActiveTab('comercial'); setActiveReport(null); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'comercial' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><ShoppingCart size={18} /> Comercial</button>
        <button onClick={() => { setActiveTab('financeiro'); setActiveReport(null); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'financeiro' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><DollarSign size={18} /> Financeiro</button>
        <button onClick={() => { setActiveTab('audit'); setActiveReport(null); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}><History size={18} /> Auditoria</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Sidebar Selection */}
        <div className="lg:col-span-1 space-y-3">
          {activeTab === 'comercial' && (
            <>
              <button onClick={() => setActiveReport('clientes_sem_venda')} className={`w-full text-left p-4 rounded-2xl border text-xs font-black uppercase transition-all ${activeReport === 'clientes_sem_venda' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>Clientes s/ Venda</button>
              <button onClick={() => setActiveReport('vendas_por_produto')} className={`w-full text-left p-4 rounded-2xl border text-xs font-black uppercase transition-all ${activeReport === 'vendas_por_produto' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>Vendas p/ Produto</button>
              <button onClick={() => setActiveReport('vendas_por_vendedor')} className={`w-full text-left p-4 rounded-2xl border text-xs font-black uppercase transition-all ${activeReport === 'vendas_por_vendedor' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>Ranking Vendedores</button>
              <button onClick={() => setActiveReport('vendas_por_rota')} className={`w-full text-left p-4 rounded-2xl border text-xs font-black uppercase transition-all ${activeReport === 'vendas_por_rota' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>Vendas p/ Rota</button>
            </>
          )}
          {activeTab === 'financeiro' && (
            <button onClick={() => setActiveReport('atraso_pagamento')} className={`w-full text-left p-4 rounded-2xl border text-xs font-black uppercase transition-all ${activeReport === 'atraso_pagamento' ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-rose-300'}`}>Boletos em Atraso</button>
          )}
          {!activeReport && activeTab !== 'overview' && (
            <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 italic text-slate-400 text-xs">Selecione um template de relatório.</div>
          )}
        </div>

        {/* Report Content Display */}
        <div className="lg:col-span-3">
          {!activeReport ? (
             <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                <FileText size={48} className="text-slate-100 mb-4" />
                <h4 className="text-xl font-black text-slate-400 uppercase">Aguardando Seleção</h4>
                <p className="text-xs font-bold text-slate-300 mt-2">Escolha um dos relatórios ao lado para processar os dados do período.</p>
             </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-4">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h4 className="font-black text-slate-900 uppercase text-sm tracking-tighter">
                  {activeReport.replace(/_/g, ' ')} ({reportData?.length || 0})
                </h4>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100"><Download size={14}/> Exportar CSV</button>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      {activeReport === 'clientes_sem_venda' && (
                        <><th className="px-6 py-4">Nome do Cliente</th><th className="px-6 py-4">Documento</th><th className="px-6 py-4">Setor</th><th className="px-6 py-4">Contato</th></>
                      )}
                      {activeReport === 'vendas_por_produto' && (
                        <><th className="px-6 py-4">Produto</th><th className="px-6 py-4 text-center">Qtd Vendida</th><th className="px-6 py-4 text-right">Valor Total</th></>
                      )}
                      {activeReport === 'vendas_por_vendedor' && (
                        <><th className="px-6 py-4">Vendedor</th><th className="px-6 py-4 text-center">Nº Pedidos</th><th className="px-6 py-4 text-right">Total Vendido</th></>
                      )}
                      {activeReport === 'vendas_por_rota' && (
                        <><th className="px-6 py-4">Rota / Setor</th><th className="px-6 py-4 text-right">Volume de Vendas (R$)</th></>
                      )}
                      {activeReport === 'atraso_pagamento' && (
                        <><th className="px-6 py-4">Fatura</th><th className="px-6 py-4">Cliente</th><th className="px-6 py-4 text-center">Dias de Atraso</th><th className="px-6 py-4 text-right">Valor</th></>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(reportData as any[]).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors text-xs font-bold text-slate-700">
                        {activeReport === 'clientes_sem_venda' && (
                          <><td className="px-6 py-4">{row.name}</td><td className="px-6 py-4">{row.document}</td><td className="px-6 py-4">{row.sector}</td><td className="px-6 py-4">{row.phone}</td></>
                        )}
                        {activeReport === 'vendas_por_produto' && (
                          <><td className="px-6 py-4">{row.name}</td><td className="px-6 py-4 text-center">{row.qty} un</td><td className="px-6 py-4 text-right">R$ {row.total.toFixed(2)}</td></>
                        )}
                        {activeReport === 'vendas_por_vendedor' && (
                          <><td className="px-6 py-4">{row.name}</td><td className="px-6 py-4 text-center">{row.count}</td><td className="px-6 py-4 text-right">R$ {row.total.toFixed(2)}</td></>
                        )}
                        {activeReport === 'vendas_por_rota' && (
                          <><td className="px-6 py-4">{row.name}</td><td className="px-6 py-4 text-right font-black">R$ {row.total.toFixed(2)}</td></>
                        )}
                        {activeReport === 'atraso_pagamento' && (
                          <><td className="px-6 py-4">#{row.number}</td><td className="px-6 py-4">{MOCK_CLIENTS.find(c => c.id === row.clientId)?.name}</td><td className="px-6 py-4 text-center"><span className="text-rose-600 bg-rose-50 px-2 py-1 rounded">{row.daysLate} dias</span></td><td className="px-6 py-4 text-right text-rose-600 font-black">R$ {row.total.toFixed(2)}</td></>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
