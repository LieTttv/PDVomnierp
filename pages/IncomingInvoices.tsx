
import React, { useState, useEffect, useMemo } from 'react';
import { 
  DownloadCloud, Search, Plus, FileText, CheckCircle2, 
  X, Calculator, ShieldCheck, Database, RefreshCw, 
  Trash2, ArrowRight, Package, AlertTriangle, Info,
  Hash, Building, FileSignature
} from 'lucide-react';
import { getProducts, saveProduct } from '../services/productService';
import { Product, IncomingInvoice, IncomingInvoiceItem } from '../types';
import { MOCK_ENTITIES } from '../constants';
import ProductForm from './ProductForm';

const IncomingInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<IncomingInvoice[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado da Nota sendo importada
  const [currentInvoice, setCurrentInvoice] = useState<Partial<IncomingInvoice> | null>(null);
  const [productMappingSearch, setProductMappingSearch] = useState<Record<string, string>>({});

  const loadData = async () => {
    const pData = await getProducts();
    setAvailableProducts(pData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSimulateImport = () => {
    const mockXmlInvoice: Partial<IncomingInvoice> = {
      number: (Math.floor(Math.random() * 900000) + 100000).toString(),
      serie: '001',
      providerName: 'Textil do Brasil S.A.',
      providerId: 'p1',
      accessKey: '3524031234567800019055001000' + Math.floor(Math.random() * 100000),
      date: new Date().toISOString().split('T')[0],
      total: 5000.00,
      status: 'Pendente',
      items: [
        {
          id: 'xml-item-1',
          description: 'CAMISA MASCULINA BASICA BRANCA',
          externalCode: 'CBA-001',
          quantityReceived: 10,
          unitReceived: 'SC',
          conversionFactor: 20,
          finalQuantity: 200,
          unitPrice: 20.00,
          totalPrice: 4000.00,
          taxData: { icms: 720, ipi: 0, st: 0 }
        },
        {
          id: 'xml-item-2',
          description: 'PIGMENTO TINTA AZUL INDUSTRIAL',
          externalCode: 'PIG-992',
          quantityReceived: 50,
          unitReceived: 'LT',
          conversionFactor: 1,
          finalQuantity: 50,
          unitPrice: 20.00,
          totalPrice: 1000.00,
          taxData: { icms: 180, ipi: 50, st: 0 }
        }
      ]
    };
    setCurrentInvoice(mockXmlInvoice);
    setIsImportModalOpen(true);
  };

  const updateItemFactor = (id: string, factor: number) => {
    if (!currentInvoice || !currentInvoice.items) return;
    const items = currentInvoice.items.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          conversionFactor: factor, 
          finalQuantity: item.quantityReceived * factor 
        };
      }
      return item;
    });
    setCurrentInvoice({ ...currentInvoice, items });
  };

  const mapItemToProduct = (itemId: string, productId: string) => {
    if (!currentInvoice || !currentInvoice.items) return;
    const items = currentInvoice.items.map(item => {
      if (item.id === itemId) return { ...item, internalProductId: productId };
      return item;
    });
    setCurrentInvoice({ ...currentInvoice, items });
    setProductMappingSearch(prev => ({ ...prev, [itemId]: '' }));
  };

  const processEntry = async () => {
    if (!currentInvoice || !currentInvoice.items) return;

    // Verificar se todos itens estão mapeados
    const unmapped = currentInvoice.items.find(i => !i.internalProductId);
    if (unmapped) {
      alert(`⚠️ Erro: O item "${unmapped.description}" não foi vinculado a um produto do estoque.`);
      return;
    }

    // Processar atualização de estoque para cada item
    for (const item of currentInvoice.items) {
      const product = availableProducts.find(p => p.id === item.internalProductId);
      if (product) {
        await saveProduct({
          ...product,
          estoque: product.estoque + item.finalQuantity,
          custo: item.totalPrice / item.finalQuantity // Atualização simplificada de custo médio
        });
      }
    }

    setInvoices([currentInvoice as IncomingInvoice, ...invoices]);
    setIsImportModalOpen(false);
    setCurrentInvoice(null);
    loadData();
    alert("✅ Nota processada com sucesso! Estoque atualizado.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Notas de Entrada</h2>
          <p className="text-slate-500 text-sm font-medium">Entrada de mercadorias via XML e gestão de suprimentos.</p>
        </div>
        <button 
          onClick={handleSimulateImport}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-100"
        >
          <DownloadCloud size={18} /> Importar XML / Chave
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Buscar notas processadas..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black text-slate-500 tracking-wider">
            <tr>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Número / Série</th>
              <th className="px-6 py-4">Fornecedor</th>
              <th className="px-6 py-4">Data Emissão</th>
              <th className="px-6 py-4 text-right">Valor Total</th>
              <th className="px-6 py-4 text-center">Itens</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-20 text-center text-slate-400 italic font-bold">Nenhuma nota fiscal de entrada processada.</td></tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors text-sm font-medium">
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase rounded-lg">Processada</span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900">{inv.number} / {inv.serie}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{inv.providerName}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(inv.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-right font-black">R$ {inv.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black">{inv.items.length} SKUS</span></td>
                  <td className="px-6 py-4 text-right"><button className="p-2 text-slate-400 hover:text-blue-600"><FileText size={18}/></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE IMPORTAÇÃO E VINCULAÇÃO */}
      {isImportModalOpen && currentInvoice && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                   <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-100"><DownloadCloud size={28} /></div>
                   <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vincular Mercadorias (XML)</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Building size={12} /> {currentInvoice.providerName} • NF: {currentInvoice.number}
                      </p>
                   </div>
                </div>
                <button onClick={() => setIsImportModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={32}/></button>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center gap-4">
                   <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0"><AlertTriangle size={24}/></div>
                   <div>
                      <p className="text-xs font-black text-amber-900 uppercase">Atenção ao Fator de Conversão</p>
                      <p className="text-[10px] text-amber-700 font-bold uppercase">Configure quantas unidades internas (ex: UN) compõem a unidade recebida do fornecedor (ex: SC).</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {currentInvoice.items?.map((item, idx) => (
                      <div key={item.id} className={`p-6 rounded-[32px] border transition-all ${item.internalProductId ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 bg-white shadow-sm'}`}>
                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Dados do XML */}
                            <div className="lg:col-span-5 space-y-4">
                               <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase">Item {idx + 1} XML</span>
                                  <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Cód Ext: {item.externalCode}</span>
                               </div>
                               <h4 className="font-black text-slate-900 leading-tight">{item.description}</h4>
                               <div className="flex items-center gap-4">
                                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                                     <p className="text-[9px] font-black text-slate-400 uppercase">Qtd Recebida</p>
                                     <p className="text-xl font-black text-slate-900">{item.quantityReceived} <span className="text-xs font-bold text-slate-400">{item.unitReceived}</span></p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <X className="text-slate-300" size={14} />
                                     <div className="w-24">
                                        <p className="text-[9px] font-black text-blue-600 uppercase mb-1">Conversor</p>
                                        <input 
                                          type="number" 
                                          className="w-full p-2 bg-blue-50 border border-blue-200 rounded-xl text-center font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-600"
                                          value={item.conversionFactor}
                                          onChange={e => updateItemFactor(item.id, parseFloat(e.target.value) || 1)}
                                        />
                                     </div>
                                     <div className="flex flex-col items-center gap-1">
                                        <ArrowRight className="text-slate-300" size={14} />
                                        <span className="text-[8px] font-black text-slate-400 uppercase">Estoque</span>
                                     </div>
                                     <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                                        <p className="text-[9px] font-black text-emerald-600 uppercase">Saldo Final</p>
                                        <p className="text-xl font-black text-emerald-900">+{item.finalQuantity} <span className="text-xs font-bold text-emerald-400">UN</span></p>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            {/* Vinculo Interno */}
                            <div className="lg:col-span-4 flex flex-col justify-center">
                               <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1"><Database size={10} /> Vincular Produto Interno</p>
                               {!item.internalProductId ? (
                                  <div className="relative">
                                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                     <input 
                                       type="text" 
                                       placeholder="Buscar no estoque..." 
                                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs"
                                       value={productMappingSearch[item.id] || ''}
                                       onChange={e => setProductMappingSearch({...productMappingSearch, [item.id]: e.target.value})}
                                     />
                                     {productMappingSearch[item.id]?.length > 1 && (
                                       <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-48 overflow-y-auto">
                                          {availableProducts.filter(p => p.nome.toLowerCase().includes(productMappingSearch[item.id].toLowerCase())).map(p => (
                                             <button 
                                                key={p.id}
                                                onClick={() => mapItemToProduct(item.id, p.id)}
                                                className="w-full p-3 flex items-center justify-between hover:bg-indigo-50 transition-colors"
                                             >
                                                <div className="text-left">
                                                   <p className="text-xs font-black text-slate-900">{p.nome}</p>
                                                   <p className="text-[10px] text-slate-400 font-bold uppercase">{p.codigo} • Saldo: {p.estoque} {p.unidadeMedida}</p>
                                                </div>
                                                <Plus size={16} className="text-indigo-600" />
                                             </button>
                                          ))}
                                          <button 
                                            onClick={() => setIsProductFormOpen(true)}
                                            className="w-full p-3 bg-slate-50 text-indigo-600 text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-slate-100"
                                          >
                                            <Plus size={14} /> Cadastrar Novo Produto
                                          </button>
                                       </div>
                                     )}
                                  </div>
                               ) : (
                                  <div className="p-4 bg-emerald-100/50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm"><Package size={16} /></div>
                                        <div>
                                           <p className="text-xs font-black text-emerald-900">{availableProducts.find(p => p.id === item.internalProductId)?.nome}</p>
                                           <p className="text-[10px] text-emerald-500 font-bold uppercase">Vinculado Corretamente</p>
                                        </div>
                                     </div>
                                     <button onClick={() => mapItemToProduct(item.id, '')} className="text-[9px] font-black text-emerald-600 hover:underline">Trocar</button>
                                  </div>
                               )}
                            </div>

                            {/* Tributos do Item */}
                            <div className="lg:col-span-3 border-l border-slate-100 pl-8 flex flex-col justify-center space-y-3">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Apropriação Fiscal</p>
                               <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                                     <p className="text-[8px] font-black text-slate-400 uppercase">ICMS</p>
                                     <p className="text-xs font-black text-slate-700">R$ {item.taxData.icms.toFixed(2)}</p>
                                  </div>
                                  <div className="bg-slate-50 p-2 rounded-xl text-center">
                                     <p className="text-[8px] font-black text-slate-400 uppercase">IPI</p>
                                     <p className="text-xs font-black text-slate-700">R$ {item.taxData.ipi.toFixed(2)}</p>
                                  </div>
                               </div>
                               <div className="flex justify-between items-center px-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">Valor do SKU</span>
                                  <span className="text-sm font-black text-slate-900">R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-12">
                   <div className="text-left">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total da Nota</p>
                      <p className="text-3xl font-black text-slate-900">R$ {currentInvoice.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="text-center px-4 border-r border-slate-100">
                         <p className="text-[9px] font-black text-slate-400 uppercase">ICMS Total</p>
                         <p className="text-sm font-bold text-slate-600">R$ 900,00</p>
                      </div>
                      <div className="text-center px-4">
                         <p className="text-[9px] font-black text-slate-400 uppercase">IPI Total</p>
                         <p className="text-sm font-bold text-slate-600">R$ 50,00</p>
                      </div>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setIsImportModalOpen(false)} className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cancelar</button>
                   <button 
                     onClick={processEntry}
                     className="px-12 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2 uppercase tracking-widest"
                   >
                     Confirmar Recebimento <Database size={20} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {isProductFormOpen && (
         <ProductForm 
            onClose={() => setIsProductFormOpen(false)} 
            onSave={() => { setIsProductFormOpen(false); loadData(); }} 
         />
      )}
    </div>
  );
};

export default IncomingInvoices;
