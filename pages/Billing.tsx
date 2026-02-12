
import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Send, 
  Download, 
  Eye, 
  CheckCircle, 
  Plus, 
  ArrowRight, 
  PackageCheck, 
  ShieldCheck, 
  Info, 
  X, 
  Printer, 
  FileJson, 
  RefreshCw, 
  Search,
  Truck,
  CreditCard,
  Percent,
  Calculator,
  Trash2,
  CalendarDays,
  Hash,
  AlertTriangle,
  Weight
} from 'lucide-react';
import { MOCK_INVOICES, MOCK_CLIENTS } from '../constants';
import { getOrders, updateOrderStatus } from '../services/orderService';
import { getProducts } from '../services/productService';
import { Sector, Order, Invoice, OrderItem, Product } from '../types';

const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES as any);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'notas' | 'pedidos'>('notas');
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [transmissionStep, setTransmissionStep] = useState<number>(0); // 0: Review, 1: Process, 2: Success
  const [searchTerm, setSearchTerm] = useState('');

  // Estados do Formulário de Checkout Fiscal
  const [billingItems, setBillingItems] = useState<OrderItem[]>([]);
  const [paymentCondition, setPaymentCondition] = useState('À vista');
  const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
  const [discountValue, setDiscountValue] = useState(0);
  const [freightType, setFreightType] = useState('9'); // 9: Sem Frete
  const [freightValue, setFreightValue] = useState(0);
  const [freightInfo, setFreightInfo] = useState({ plate: '', qty: 1, species: 'VOLUME', netWeight: 0, grossWeight: 0 });
  const [additionalInfo, setAdditionalInfo] = useState('');

  const loadAllData = async () => {
    const orders = getOrders().filter(o => o.status === 'Liberado');
    const pData = await getProducts();
    setPendingOrders(orders);
    setAvailableProducts(pData);
  };

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  // Lógica: Se a condição for em dias, o meio DEVE ser boleto
  useEffect(() => {
    if (paymentCondition.toLowerCase().includes('dias')) {
      setPaymentMethod('Boleto Bancário');
    }
  }, [paymentCondition]);

  const handleStartBilling = (order: Order) => {
    setCurrentOrder(order);
    const items = JSON.parse(JSON.stringify(order.items));
    setBillingItems(items);
    
    // Cálculo automático de pesos para inicializar o frete
    let totalNet = 0;
    let totalGross = 0;
    items.forEach((item: OrderItem) => {
      const p = availableProducts.find(prod => prod.id === item.productId);
      if (p) {
        totalNet += (p.advanced.pesoLiquido || 0) * item.quantity;
        totalGross += (p.advanced.pesoBruto || 0) * item.quantity;
      }
    });

    setDiscountValue(0);
    setFreightValue(0);
    setPaymentCondition('À vista');
    setPaymentMethod('Boleto Bancário');
    setFreightType('9');
    setFreightInfo({ 
      plate: '', 
      qty: 1, 
      species: 'VOLUME', 
      netWeight: Number(totalNet.toFixed(3)), 
      grossWeight: Number(totalGross.toFixed(3)) 
    });
    setAdditionalInfo('');
    setTransmissionStep(0);
    setIsBillingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBillingModalOpen(false);
    setCurrentOrder(null);
    setTransmissionStep(0);
  };

  const subtotal = useMemo(() => billingItems.reduce((acc, item) => acc + item.totalPrice, 0), [billingItems]);
  const totalInvoice = useMemo(() => Math.max(0, (subtotal - discountValue) + freightValue), [subtotal, discountValue, freightValue]);
  
  // Recalcula pesos se o faturista alterar as quantidades (corte)
  useEffect(() => {
    let totalNet = 0;
    let totalGross = 0;
    billingItems.forEach((item: OrderItem) => {
      const p = availableProducts.find(prod => prod.id === item.productId);
      if (p) {
        totalNet += (p.advanced.pesoLiquido || 0) * item.quantity;
        totalGross += (p.advanced.pesoBruto || 0) * item.quantity;
      }
    });
    setFreightInfo(prev => ({ 
      ...prev, 
      netWeight: Number(totalNet.toFixed(3)), 
      grossWeight: Number(totalGross.toFixed(3)) 
    }));
  }, [billingItems, availableProducts]);

  const installments = useMemo(() => {
    const list: { date: string, value: number }[] = [];
    const today = new Date();
    
    const addDays = (days: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString('pt-BR');
    };

    if (paymentCondition === '7 dias') {
      list.push({ date: addDays(7), value: totalInvoice });
    } else if (paymentCondition === '7 e 14 dias') {
      list.push({ date: addDays(7), value: totalInvoice / 2 });
      list.push({ date: addDays(14), value: totalInvoice / 2 });
    } else if (paymentCondition === '7, 14, 21 e 28 dias') {
      list.push({ date: addDays(7), value: totalInvoice / 4 });
      list.push({ date: addDays(14), value: totalInvoice / 4 });
      list.push({ date: addDays(21), value: totalInvoice / 4 });
      list.push({ date: addDays(28), value: totalInvoice / 4 });
    } else {
      list.push({ date: today.toLocaleDateString('pt-BR'), value: totalInvoice });
    }
    return list;
  }, [paymentCondition, totalInvoice]);

  const handleUpdateQty = (idx: number, qty: number) => {
    const newItems = [...billingItems];
    if (qty < 0) return;
    newItems[idx].quantity = qty;
    newItems[idx].totalPrice = qty * newItems[idx].unitPrice;
    setBillingItems(newItems);
  };

  const removeItem = (idx: number) => {
    const newItems = billingItems.filter((_, i) => i !== idx);
    setBillingItems(newItems);
  };

  const simulateTransmission = async () => {
    if (billingItems.length === 0) return alert("Adicione ao menos um item para faturar.");
    setTransmissionStep(1);
    await new Promise(r => setTimeout(r, 2500));
    
    if (currentOrder) {
      updateOrderStatus(currentOrder.id, 'Faturado');
      const newInv: Invoice = {
        id: `inv-${Math.random().toString(36).substr(2, 5)}`,
        number: (invoices.length + 1048).toString().padStart(6, '0'),
        serie: '001',
        clientId: currentOrder.clientId,
        sector: currentOrder.sector,
        date: new Date().toISOString().split('T')[0],
        dueDate: installments[installments.length - 1].date.split('/').reverse().join('-'),
        total: totalInvoice,
        tax: totalInvoice * 0.18,
        status: 'Emitida',
        naturezaOperacao: 'Venda de Mercadoria',
        items: billingItems
      };
      setInvoices([newInv, ...invoices]);
      loadAllData();
      setTransmissionStep(2);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Faturamento Fiscal NF-e</h2>
          <p className="text-slate-500 text-sm">Controle de emissão, transmissão SEFAZ e gestão de documentos fiscais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="flex gap-4 border-b border-slate-200">
            <button onClick={() => setActiveTab('notas')} className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'notas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              Documentos Emitidos ({invoices.length})
            </button>
            <button onClick={() => setActiveTab('pedidos')} className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'pedidos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              Aguardando Faturamento ({pendingOrders.length})
            </button>
          </div>

          {activeTab === 'notas' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4">NF / Série</th>
                    <th className="px-6 py-4">Destinatário</th>
                    <th className="px-6 py-4 text-right">Valor Total</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors group text-sm">
                      <td className="px-6 py-4 font-black">{inv.number}</td>
                      <td className="px-6 py-4 font-bold text-slate-700">{MOCK_CLIENTS.find(c => c.id === inv.clientId)?.name}</td>
                      <td className="px-6 py-4 text-right font-black">R$ {inv.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Emitida</span>
                      </td>
                      <td className="px-6 py-4 text-right"><button className="p-2 text-slate-400 hover:text-blue-600"><Printer size={18}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              {pendingOrders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><PackageCheck size={24}/></div>
                    <div>
                      <p className="font-black text-slate-900 text-lg">{order.number}</p>
                      <p className="font-bold text-slate-700">{order.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <p className="text-2xl font-black text-slate-900">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <button onClick={() => handleStartBilling(order)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-lg">
                      Faturar Agora <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
            <ShieldCheck className="text-blue-400" size={32} />
            <h3 className="font-bold text-lg">Ambiente SEFAZ: Produção</h3>
            <div className="p-4 bg-slate-800 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Documentos Emitidos</p>
              <p className="text-2xl font-black">{invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CHECKOUT FISCAL */}
      {isBillingModalOpen && currentOrder && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-7xl h-[95vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100"><FileText size={24} /></div>
                  <div>
                    <h3 className="font-black text-slate-900 text-2xl tracking-tight">Checkout Fiscal: {currentOrder.number}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Conferência final antes da autorização</p>
                  </div>
               </div>
               <button onClick={handleCloseModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={32} /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
              {transmissionStep === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Coluna Esquerda: Itens e Logistica */}
                  <div className="lg:col-span-8 space-y-8">
                    {/* Revisão de Itens */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         <PackageCheck className="text-blue-600" size={18} /> 1. Revisão e Corte de Mercadorias
                       </h4>
                       <div className="overflow-hidden rounded-2xl border border-slate-100">
                          <table className="w-full text-left text-xs">
                             <thead className="bg-slate-50 font-black text-slate-400 uppercase">
                                <tr>
                                   <th className="px-4 py-4">Produto</th>
                                   <th className="px-4 py-4 text-center">Qtd. Faturada</th>
                                   <th className="px-4 py-4 text-right">V. Unit</th>
                                   <th className="px-4 py-4 text-right">P. Bruto Total</th>
                                   <th className="px-4 py-4 text-right">Subtotal</th>
                                   <th className="px-4 py-4 text-center">Corte</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-50">
                                {billingItems.map((item, idx) => {
                                   const p = availableProducts.find(prod => prod.id === item.productId);
                                   return (
                                   <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                                      <td className="px-4 py-4 font-bold text-slate-700">{item.productName}</td>
                                      <td className="px-4 py-4 text-center">
                                         <input type="number" className="w-20 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-black" value={item.quantity} onChange={e => handleUpdateQty(idx, parseFloat(e.target.value) || 0)} />
                                      </td>
                                      <td className="px-4 py-4 text-right font-medium text-slate-500">R$ {item.unitPrice.toFixed(2)}</td>
                                      <td className="px-4 py-4 text-right font-bold text-slate-400">
                                         {((p?.advanced.pesoBruto || 0) * item.quantity).toFixed(3)}kg
                                      </td>
                                      <td className="px-4 py-4 text-right font-black text-slate-900">R$ {item.totalPrice.toFixed(2)}</td>
                                      <td className="px-4 py-4 text-center">
                                         <button onClick={() => removeItem(idx)} className="p-2 text-rose-300 hover:text-rose-600"><Trash2 size={16}/></button>
                                      </td>
                                   </tr>
                                )})}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {/* Logística */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         <Truck className="text-blue-600" size={18} /> 2. Logística e Transporte
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-2 space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Modalidade de Frete</label>
                             <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={freightType} onChange={e => setFreightType(e.target.value)}>
                                <option value="0">0 - CIF (Emitente)</option>
                                <option value="1">1 - FOB (Destinatário)</option>
                                <option value="9">9 - Sem Ocorrência</option>
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Valor Frete (R$)</label>
                             <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" value={freightValue} onChange={e => setFreightValue(parseFloat(e.target.value) || 0)} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Placa Veículo</label>
                             <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" placeholder="ABC-1234" value={freightInfo.plate} onChange={e => setFreightInfo({...freightInfo, plate: e.target.value})} />
                          </div>
                          
                          {/* Campos de Peso Sincronizados */}
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                <Weight size={10} className="text-blue-600" /> Peso Líquido Total
                             </label>
                             <div className="flex items-center gap-2">
                                <input type="number" step="0.001" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl font-black text-sm text-blue-700" value={freightInfo.netWeight} onChange={e => setFreightInfo({...freightInfo, netWeight: parseFloat(e.target.value) || 0})} />
                                <span className="text-xs font-bold text-slate-400">KG</span>
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                <Weight size={10} className="text-blue-600" /> Peso Bruto Total
                             </label>
                             <div className="flex items-center gap-2">
                                <input type="number" step="0.001" className="w-full p-3 bg-blue-50/50 border border-blue-100 rounded-xl font-black text-sm text-blue-700" value={freightInfo.grossWeight} onChange={e => setFreightInfo({...freightInfo, grossWeight: parseFloat(e.target.value) || 0})} />
                                <span className="text-xs font-bold text-slate-400">KG</span>
                             </div>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Espécie</label>
                             <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" value={freightInfo.species} onChange={e => setFreightInfo({...freightInfo, species: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Volumes</label>
                             <input type="number" className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-sm" value={freightInfo.qty} onChange={e => setFreightInfo({...freightInfo, qty: parseInt(e.target.value) || 1})} />
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Coluna Direita: Financeiro */}
                  <div className="lg:col-span-4 space-y-8">
                    {/* Pagamento */}
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-6 shadow-2xl">
                       <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                         <CreditCard size={18} /> 3. Financeiro
                       </h4>
                       <div className="space-y-4">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase">Condição de Pagamento</label>
                             <select className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs" value={paymentCondition} onChange={e => setPaymentCondition(e.target.value)}>
                                <option>À vista</option>
                                <option>7 dias</option>
                                <option>7 e 14 dias</option>
                                <option>7, 14, 21 e 28 dias</option>
                             </select>
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-500 uppercase">Meio de Pagamento</label>
                             <select className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl font-bold text-xs" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} disabled={paymentCondition.includes('dias')}>
                                <option>Dinheiro</option>
                                <option>Boleto Bancário</option>
                                <option>Cartão de Crédito</option>
                                <option>PIX</option>
                                <option>Cheque</option>
                             </select>
                             {paymentCondition.includes('dias') && (
                               <p className="text-[9px] text-amber-400 font-bold mt-1 uppercase flex items-center gap-1"><Info size={10}/> Boleto obrigatório para prazos</p>
                             )}
                          </div>

                          <div className="pt-4 border-t border-slate-800 space-y-3">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><CalendarDays size={14}/> Vencimentos Previstos</p>
                             {installments.map((parc, i) => (
                               <div key={i} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-xs font-bold">
                                  <span className="text-slate-400">{parc.date}</span>
                                  <span>R$ {parc.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Descontos e Adicionais */}
                    <div className="bg-white p-8 rounded-[32px] border border-slate-200 space-y-6">
                       <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         <Percent className="text-rose-500" size={18} /> 4. Ajustes e Notas
                       </h4>
                       <div className="space-y-4">
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Desconto Global (R$)</label>
                             <input type="number" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm text-rose-600" value={discountValue} onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)} />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] font-black text-slate-400 uppercase">Informações Complementares</label>
                             <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium h-24 outline-none" placeholder="Opcional: Ex. Isenções, prazos especiais..." value={additionalInfo} onChange={e => setAdditionalInfo(e.target.value)} />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {transmissionStep === 1 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in zoom-in duration-500">
                   <div className="w-32 h-32 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-8"></div>
                   <h4 className="text-3xl font-black text-slate-900 mb-2">Transmitindo para SEFAZ</h4>
                   <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Validando assinaturas e autorizando documento...</p>
                </div>
              )}

              {transmissionStep === 2 && (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 animate-in bounce-in duration-700 space-y-8">
                   <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"><CheckCircle size={64} /></div>
                   <h4 className="text-4xl font-black text-slate-900">NF-e Emitida com Sucesso!</h4>
                   <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                      <button className="flex flex-col items-center gap-3 p-8 bg-slate-50 rounded-[32px] border border-slate-200 hover:border-blue-600 hover:bg-blue-50 transition-all group">
                         <Printer className="text-slate-400 group-hover:text-blue-600" size={32} />
                         <span className="text-xs font-black text-slate-600 uppercase">Imprimir DANFE</span>
                      </button>
                      <button className="flex flex-col items-center gap-3 p-8 bg-slate-50 rounded-[32px] border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all group">
                         <FileJson className="text-slate-400 group-hover:text-emerald-600" size={32} />
                         <span className="text-xs font-black text-slate-600 uppercase">Baixar XML</span>
                      </button>
                   </div>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
               {transmissionStep === 0 ? (
                 <>
                   <div className="flex items-center gap-12">
                      <div className="text-left">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subtotal Itens</p>
                         <p className="text-lg font-bold text-slate-600">R$ {subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-left">
                         <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Valor Final da Nota</p>
                         <p className="text-3xl font-black text-slate-900">R$ {totalInvoice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={handleCloseModal} className="px-8 py-4 text-xs font-black text-slate-400 uppercase">Cancelar</button>
                      <button onClick={simulateTransmission} className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 uppercase tracking-widest">
                        Autorizar NF-e <Send size={20} />
                      </button>
                   </div>
                 </>
               ) : (
                 <button onClick={handleCloseModal} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest">Concluir Processo</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
