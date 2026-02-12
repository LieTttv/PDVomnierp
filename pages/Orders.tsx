
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, Search, Plus, Printer, Smartphone, Store, X, User, Package, Trash2, Check, MoreVertical, FileText, MapPin, Phone, Hash, Weight, ShieldCheck
} from 'lucide-react';
import { MOCK_CLIENTS } from '../constants';
import { getProducts } from '../services/productService';
import { getOrders, saveOrder, updateOrderStatus } from '../services/orderService';
import { Order, OrderStatus, OrderItem, Sector, Product, Entity } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    clientId: '',
    clientName: '',
    items: [],
    total: 0,
    sector: Sector.DISTRIBUTOR,
    origin: 'Interno',
    status: 'Pendente'
  });

  const [productSearch, setProductSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');

  const loadAllData = async () => {
    const pData = await getProducts();
    setAvailableProducts(pData);
    setOrders([...getOrders()]);
  };

  useEffect(() => {
    loadAllData();
  }, [isNewOrderModalOpen]);

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case 'Liberado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Pendente': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Faturado': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Cancelado': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  const handleLiberate = (id: string) => {
    updateOrderStatus(id, 'Liberado');
    setOrders([...getOrders()]);
  };

  const handlePrint = (order: Order) => {
    const client = MOCK_CLIENTS.find(c => c.id === order.clientId);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let totalOrderNetWeight = 0;
    let totalOrderGrossWeight = 0;

    const itemsHtml = order.items.map(item => {
      const product = availableProducts.find(p => p.id === item.productId);
      const itemNetWeight = (product?.advanced.pesoLiquido || 0) * item.quantity;
      const itemGrossWeight = (product?.advanced.pesoBruto || 0) * item.quantity;
      
      totalOrderNetWeight += itemNetWeight;
      totalOrderGrossWeight += itemGrossWeight;

      return `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px; font-family: monospace;">${product?.codigo || 'N/A'}</td>
          <td style="padding: 8px;">${item.productName}</td>
          <td style="padding: 8px; text-align: center;">${product?.unidadeMedida || 'UN'}</td>
          <td style="padding: 8px; text-align: center; font-weight: bold;">${item.quantity}</td>
          <td style="padding: 8px; text-align: right;">${(product?.advanced.pesoBruto || 0).toFixed(3)}kg</td>
          <td style="padding: 8px; text-align: right;">${itemGrossWeight.toFixed(3)}kg</td>
          <td style="padding: 8px; text-align: right; font-weight: bold;">R$ ${item.totalPrice.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Ordem de Separação - ${order.number}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .header { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 5px; border-bottom: 1px solid #ddd; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background: #f5f5f5; text-align: left; padding: 8px; text-transform: uppercase; font-size: 9px; }
            .total-box { margin-top: 30px; border-top: 2px solid #000; padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end; }
            .weight-summary { background: #f9fafb; padding: 15px; border-radius: 8px; font-size: 12px; border: 1px solid #e5e7eb; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 style="margin: 0; font-size: 20px;">ORDEM DE SEPARAÇÃO / LOGÍSTICA</h1>
              <p style="margin: 5px 0 0 0; font-weight: bold;">PEDIDO: ${order.number}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-size: 12px;">Data: ${new Date(order.date).toLocaleDateString('pt-BR')}</p>
              <p style="margin: 5px 0 0 0; font-size: 12px;">Vendedor: <strong>${order.sellerName || 'Venda Interna'}</strong></p>
            </div>
          </div>

          <div class="grid">
            <div class="section">
              <div class="section-title">Dados do Cliente</div>
              <p style="margin: 5px 0; font-weight: bold; font-size: 14px;">${order.clientName}</p>
              <p style="margin: 2px 0; font-size: 12px;">CNPJ/CPF: ${client?.document || 'N/A'}</p>
            </div>
            <div class="section">
              <div class="section-title">Endereço de Entrega</div>
              <p style="margin: 5px 0; font-size: 12px;">${client?.address || 'N/A'}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Itens do Pedido</div>
            <table>
              <thead>
                <tr>
                  <th>Cód.</th>
                  <th>Produto</th>
                  <th style="text-align: center;">U.M.</th>
                  <th style="text-align: center;">Qtd.</th>
                  <th style="text-align: right;">P. Bruto Unit.</th>
                  <th style="text-align: right;">P. Bruto Total</th>
                  <th style="text-align: right;">V. Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <div class="total-box">
            <div class="weight-summary">
              <p style="margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase; font-size: 10px; color: #6b7280;">Resumo Logístico de Carga</p>
              <p style="margin: 2px 0;">Peso Líquido Total: <strong>${totalOrderNetWeight.toFixed(3)} kg</strong></p>
              <p style="margin: 2px 0;">Peso Bruto Total: <strong>${totalOrderGrossWeight.toFixed(3)} kg</strong></p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 5px 0; font-size: 12px;">Itens no Pedido: <strong>${order.items.length}</strong></p>
              <h2 style="margin: 0; font-size: 20px;">Valor Total: R$ ${order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>

          <div class="footer">
            <div style="border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px;">Responsável pela Separação</div>
            <div style="border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px;">Conferência de Pesos e Medidas</div>
          </div>

          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(o => 
    o.number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // REGRA DE NEGÓCIO: Somente clientes registrados e ATIVOS podem ser selecionados para venda
  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.status === 'Ativo' && (
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.document.includes(clientSearch)
    )
  );

  const filteredProducts = availableProducts.filter(p => 
    p.ativo && (p.nome.toLowerCase().includes(productSearch.toLowerCase()) || p.codigo.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const addItem = (product: Product) => {
    const existingItem = newOrder.items?.find(i => i.productId === product.id);
    let updatedItems: OrderItem[] = [];
    if (existingItem) {
      updatedItems = (newOrder.items || []).map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice } : i);
    } else {
      updatedItems = [...(newOrder.items || []), { productId: product.id, productName: product.nome, quantity: 1, unitPrice: product.preco, totalPrice: product.preco }];
    }
    const total = updatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    setNewOrder({ ...newOrder, items: updatedItems, total });
    setProductSearch('');
  };

  const currentOrderWeights = useMemo(() => {
    let net = 0;
    let gross = 0;
    newOrder.items?.forEach(item => {
      const p = availableProducts.find(prod => prod.id === item.productId);
      if (p) {
        net += (p.advanced.pesoLiquido || 0) * item.quantity;
        gross += (p.advanced.pesoBruto || 0) * item.quantity;
      }
    });
    return { net, gross };
  }, [newOrder.items, availableProducts]);

  const finalizeOrder = () => {
    if (!newOrder.clientId || (newOrder.items || []).length === 0) {
      alert("Selecione um cliente ativo e adicione itens.");
      return;
    }
    const finalOrder: Order = {
      ...newOrder as Order,
      id: `ord-${Math.random().toString(36).substr(2, 5)}`,
      number: `INT-${orders.length + 102}`,
      date: new Date().toISOString().split('T')[0],
      status: 'Pendente',
      sellerName: 'Venda Interna'
    };
    saveOrder(finalOrder);
    setIsNewOrderModalOpen(false);
    setNewOrder({ clientId: '', clientName: '', items: [], total: 0, sector: Sector.DISTRIBUTOR, origin: 'Interno', status: 'Pendente' });
    loadAllData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Módulo de Pedidos</h2>
          <p className="text-slate-500 text-sm">Central de vendas internas e externas.</p>
        </div>
        <button onClick={() => setIsNewOrderModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-100">
          <Plus size={18} /> Novo Pedido Interno
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar por número ou cliente..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Origem</th>
                <th className="px-6 py-4">Número</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic">Nenhum pedido encontrado.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group text-sm">
                    <td className="px-6 py-4 font-black">
                      {order.origin === 'Externo' ? <span className="text-emerald-600 flex items-center gap-1 uppercase text-[9px]"><Smartphone size={14} /> Mobile</span> : <span className="text-blue-600 flex items-center gap-1 uppercase text-[9px]"><Store size={14} /> Interno</span>}
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">{order.number}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{order.clientName}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handlePrint(order)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Imprimir Ordem de Separação"><Printer size={18} /></button>
                        {order.status === 'Pendente' && (
                          <button onClick={() => handleLiberate(order.id)} className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 shadow-sm uppercase">Liberar</button>
                        )}
                        <button className="p-2 text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE NOVO PEDIDO */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg"><ShoppingCart size={20} /></div>
                  <h3 className="font-black text-slate-900 text-xl">Novo Pedido Interno</h3>
               </div>
               <button onClick={() => setIsNewOrderModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
               <div className="flex-1 overflow-y-auto p-8 border-r border-slate-100 space-y-8">
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Identificação do Cliente (Somente Ativos)
                     </h4>
                     {!newOrder.clientId ? (
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                           <input 
                              type="text" 
                              placeholder="Pesquisar cliente ativo por nome ou CNPJ..."
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                              value={clientSearch}
                              onChange={e => setClientSearch(e.target.value)}
                           />
                           {clientSearch.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                 {filteredClients.length === 0 ? (
                                    <div className="p-4 text-center text-slate-400 text-xs italic">Nenhum cliente ativo encontrado.</div>
                                 ) : filteredClients.map(c => (
                                    <button 
                                       key={c.id}
                                       onClick={() => { setNewOrder({...newOrder, clientId: c.id, clientName: c.name}); setClientSearch(''); }}
                                       className="w-full p-4 flex items-center justify-between hover:bg-blue-50 transition-colors text-left"
                                    >
                                       <div>
                                          <p className="font-bold text-slate-800 text-sm">{c.name}</p>
                                          <p className="text-[10px] text-slate-400">{c.document}</p>
                                       </div>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1"><ShieldCheck size={10}/> Elegível</span>
                                          <Plus size={16} className="text-blue-600" />
                                       </div>
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-black border border-emerald-100 shadow-sm">
                                 {newOrder.clientName?.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-black text-emerald-900">{newOrder.clientName}</p>
                                 <p className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1"><ShieldCheck size={10}/> Cadastro Regular</p>
                              </div>
                           </div>
                           <button onClick={() => setNewOrder({...newOrder, clientId: '', clientName: ''})} className="text-xs font-bold text-rose-500 hover:underline">Trocar</button>
                        </div>
                     )}
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Package size={14} /> Adicionar Produtos ao Carrinho
                     </h4>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                           type="text" 
                           placeholder="Pesquisar produto..."
                           className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                           value={productSearch}
                           onChange={e => setProductSearch(e.target.value)}
                        />
                        {productSearch.length > 0 && (
                           <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
                              {filteredProducts.map(p => (
                                 <button 
                                    key={p.id}
                                    onClick={() => addItem(p)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-emerald-50 transition-colors text-left"
                                 >
                                    <div>
                                       <p className="font-bold text-slate-800 text-sm">{p.nome}</p>
                                       <p className="text-[10px] text-slate-400 uppercase font-black">{p.codigo} • P. Bruto: {p.advanced.pesoBruto}kg</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">ESTOQUE: {p.estoque}</span>
                                       <Plus size={16} className="text-emerald-600" />
                                    </div>
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               <div className="w-full lg:w-[400px] bg-slate-50 p-8 flex flex-col gap-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <ShoppingCart size={14} /> Resumo do Pedido
                  </h4>

                  <div className="flex-1 overflow-y-auto space-y-3">
                     {(newOrder.items || []).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30 p-8">
                           <ShoppingCart size={48} className="mb-4" />
                           <p className="text-sm font-bold uppercase tracking-widest">Carrinho Vazio</p>
                        </div>
                     ) : (
                        (newOrder.items || []).map(item => (
                           <div key={item.productId} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between animate-in slide-in-from-right-2">
                              <div>
                                 <p className="text-xs font-black text-slate-800">{item.productName}</p>
                                 <p className="text-[10px] text-slate-400 font-bold">{item.quantity}x • {item.unitPrice.toFixed(2)}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className="text-right">
                                    <p className="text-xs font-black text-slate-900">R$ {item.totalPrice.toFixed(2)}</p>
                                 </div>
                                 <button onClick={() => {
                                   const updatedItems = (newOrder.items || []).filter(i => i.productId !== item.productId);
                                   const total = updatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
                                   setNewOrder({ ...newOrder, items: updatedItems, total });
                                 }} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>

                  <div className="pt-6 border-t border-slate-200 space-y-4">
                     <div className="bg-slate-200/50 p-3 rounded-xl border border-slate-300 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-slate-500">
                           <Weight size={16} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Peso Total (Bruto)</span>
                        </div>
                        <span className="text-sm font-black text-slate-700">{currentOrderWeights.gross.toFixed(3)} kg</span>
                     </div>

                     <div className="flex items-center justify-between font-black text-slate-900">
                        <span className="text-xs uppercase tracking-widest">Total Geral</span>
                        <span className="text-2xl font-black">R$ {newOrder.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                     </div>

                     <button 
                        onClick={finalizeOrder}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                     >
                        <Check size={20} /> Finalizar Pedido
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
