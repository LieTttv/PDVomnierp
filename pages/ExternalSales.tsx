
import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Search, 
  RefreshCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MapPin,
  User,
  Package,
  ArrowRight,
  Printer,
  FileText,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { Order, Product } from '../types';
import { getExternalBuffer, approveExternalSale } from '../services/orderService';
import { getProducts } from '../services/productService';
import { MOCK_CLIENTS } from '../constants';

const ExternalSales: React.FC = () => {
  const [syncedOrders, setSyncedOrders] = useState<Order[]>(getExternalBuffer());
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const pData = await getProducts();
      setAvailableProducts(pData);
    };
    loadProducts();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSyncedOrders(getExternalBuffer());
      setIsRefreshing(false);
    }, 1000);
  };

  const handleApprove = (id: string) => {
    const order = syncedOrders.find(o => o.id === id);
    const client = MOCK_CLIENTS.find(c => c.id === order?.clientId);
    
    // REGRA DE NEGÓCIO: Bloquear aprovação de vendas externas para clientes inativos
    if (client?.status === 'Inativo') {
      alert(`⚠️ Bloqueio Comercial: O cliente "${client.name}" encontra-se INATIVO no sistema. Venda externa não pode ser processada.`);
      return;
    }

    const success = approveExternalSale(id);
    if (success) {
      setSyncedOrders(prev => prev.filter(o => o.id !== id));
      alert("Venda Externa aprovada e movida para o faturamento.");
    }
  };

  const handlePrintQuote = (order: Order) => {
    const client = MOCK_CLIENTS.find(c => c.id === order.clientId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const itemsHtml = order.items.map(item => {
      const product = availableProducts.find(p => p.id === item.productId);
      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px; font-family: monospace; color: #666;">${product?.codigo || '---'}</td>
          <td style="padding: 10px; font-weight: 500;">${item.productName}</td>
          <td style="padding: 10px; text-align: center;">${product?.unidadeMedida || 'UN'}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">R$ ${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 10px; text-align: right; font-weight: bold;">R$ ${item.totalPrice.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Orçamento - ${order.number}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #1e293b; }
            .header-table { width: 100%; border-bottom: 3px solid #3b82f6; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th { background: #f8fafc; text-align: left; padding: 12px; font-size: 11px; border-bottom: 2px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h1>Orçamento Comercial - ${order.number}</h1>
          <p>Cliente: ${order.clientName}</p>
          <table>
            <thead><tr><th>Código</th><th>Descrição</th><th>UN</th><th>Qtd</th><th>Unit</th><th>Total</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h2 style="text-align: right;">Total: R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
          <script>window.onload = () => { window.print(); window.close(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Vendas Externas (App Mobile)</h2>
          <p className="text-slate-500 text-sm">Monitore e aprove pedidos enviados pelos vendedores em campo.</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-bold shadow-lg shadow-emerald-100">
          <RefreshCcw size={18} className={isRefreshing ? 'animate-spin' : ''} />
          Sincronizar Agora
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {syncedOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">Nenhum pedido externo pendente.</div>
          ) : (
            syncedOrders.map(order => {
              const client = MOCK_CLIENTS.find(c => c.id === order.clientId);
              const isInactive = client?.status === 'Inativo';
              
              return (
                <div key={order.id} className={`bg-white p-6 rounded-2xl border transition-all ${isInactive ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 shadow-sm hover:shadow-md'}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${isInactive ? 'bg-rose-100 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                        {isInactive ? <XCircle size={28} /> : <User size={28} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-slate-900">{order.number}</span>
                          {isInactive && (
                            <span className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black uppercase rounded flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={10} /> Cliente Inativo
                            </span>
                          )}
                        </div>
                        <p className={`font-bold ${isInactive ? 'text-rose-900' : 'text-slate-700'}`}>{order.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Vendedor: {order.sellerName} • {order.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <div className="text-right">
                        <p className="text-2xl font-black text-slate-900">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <button onClick={() => handlePrintQuote(order)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Imprimir Orçamento"><Printer size={20} /></button>
                        <button 
                          onClick={() => handleApprove(order.id)}
                          disabled={isInactive}
                          className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${isInactive ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
                        >
                          {isInactive ? 'Venda Bloqueada' : 'Aprovar Venda'} <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ExternalSales;
