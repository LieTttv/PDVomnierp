
import React, { useState, useMemo } from 'react';
import { 
  Save, X, Info, AlertTriangle, ShieldCheck, 
  Settings, Truck, Database, FileBarChart, History, 
  ChevronRight, Plus, Trash2, Smartphone, FileText, 
  ArrowDownLeft, ArrowUpRight, Layers, Search, 
  Calculator, ArrowRightLeft, Percent, HelpCircle,
  RefreshCw, Briefcase, Hash, MapPin
} from 'lucide-react';
// Fix: Removed currentTenantConfig import as it is not exported by productService
import { currentUser, saveProduct } from '../services/productService';
import { Product, Sector, ProductComponent } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ProductFormProps {
  product?: Partial<Product>;
  onClose: () => void;
  onSave: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product: initialProduct, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('geral');
  const [activeTaxSubTab, setActiveTaxSubTab] = useState('icms');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Product>>(initialProduct || {
    ativo: true,
    enviarMobile: false,
    preco: 0,
    custo: 0,
    estoque: 0,
    unidadeMedida: 'UN',
    composition: [],
    advanced: { pDescontoMax: 0, pAcrescimoMax: 0, cicloPosVenda: 0, podeSerBrinde: false, pesoBruto: 0, pesoLiquido: 0 },
    tax: { 
      icms: { tributacao: '', pIcms: 0, pFcp: 0, pRedIcms: 0, motivoDesoneracao: '' },
      pis: { cst: '', pPis: 0 },
      cofins: { cst: '', pCofins: 0 },
      ipi: { cst: '', pIpi: 0, enquadramento: '999' },
      issqn: { listaServico: '', pIss: 0, cMun: '' },
      ibscbs: { regras: [] } 
    },
    cfops: {
      entrada: { interna: '', externa: '', devolucaoInt: '', devolucaoExt: '', transferenciaInt: '', transferenciaExt: '' },
      saida: { interna: '', externa: '', devolucaoInt: '', devolucaoExt: '', transferenciaInt: '', transferenciaExt: '', naoContribuinte: '', perdas: '' },
      nfce: ''
    }
  });

  // Fix: Updated role comparisons to lowercase to match the UserRole type
  const canEditFiscal = currentUser.role === 'admin' || currentUser.role === 'fiscal';

  const totalProductionCost = useMemo(() => {
    return (formData.composition || []).reduce((acc, item) => acc + (item.cost * item.quantity), 0);
  }, [formData.composition]);

  const handleSave = async () => {
    if (!formData.codigo || !formData.nome) {
      alert("Código e Nome são obrigatórios!");
      return;
    }
    await saveProduct(formData);
    onSave();
  };

  const syncCostWithBOM = () => {
    setFormData({ ...formData, custo: totalProductionCost });
  };

  const addComponent = (product: Product) => {
    if (product.id === formData.id) return;
    const newComponent: ProductComponent = {
      id: Math.random().toString(36).substr(2, 5),
      productId: product.id,
      productName: product.nome,
      quantity: 1,
      unit: product.unidadeMedida,
      cost: product.custo
    };
    setFormData({
      ...formData,
      composition: [...(formData.composition || []), newComponent]
    });
    setSearchTerm('');
  };

  const removeComponent = (id: string) => {
    setFormData({
      ...formData,
      composition: (formData.composition || []).filter(c => c.id !== id)
    });
  };

  const updateComponentQty = (id: string, qty: number) => {
    setFormData({
      ...formData,
      composition: (formData.composition || []).map(c => c.id === id ? { ...c, quantity: qty } : c)
    });
  };

  const InputField = ({ label, name, type = "text", required = false, disabled = false, placeholder = "" }: any) => (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-600 flex items-center gap-1 uppercase tracking-tight">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input 
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400 text-sm transition-all font-medium"
        value={(formData as any)[name] ?? ''}
        onChange={(e) => setFormData({...formData, [name]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value})}
      />
    </div>
  );

  const updateTax = (group: string, field: string, value: any) => {
    setFormData({
      ...formData,
      tax: {
        ...formData.tax,
        [group]: {
          ...(formData.tax?.[group] || {}),
          [field]: value
        }
      }
    });
  };

  const availableInsumos = MOCK_PRODUCTS.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) && 
    searchTerm.length > 1 &&
    !formData.composition?.some(c => c.productId === p.id)
  );

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100">
              <Database size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {formData.id ? 'Produto: ' + formData.nome : 'Novo Cadastro de Produto'}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-200 text-slate-600 rounded">Tenant: {currentUser.tenantId}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-slate-100 px-6 overflow-x-auto shrink-0 scrollbar-hide">
          {[
            { id: 'geral', label: 'Cadastro Base', icon: Settings },
            { id: 'ficha', label: 'Ficha Técnica (BOM)', icon: Layers },
            { id: 'impostos', label: 'Fiscal / Impostos', icon: ShieldCheck },
            { id: 'cfops', label: 'CFOPs de Fluxo', icon: ArrowRightLeft },
            { id: 'estoque', label: 'Logística / Estoque', icon: Truck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
          {activeTab === 'geral' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
              <InputField label="Código Interno" name="codigo" required />
              <InputField label="EAN / GTIN" name="ean" />
              <InputField label="Referência Fabr." name="referencia" />
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Descrição do Produto" name="nome" required />
                <InputField label="Nome p/ Cupom Fiscal (PDV)" name="nomePdv" />
              </div>
              <InputField label="Unidade de Medida" name="unidadeMedida" required placeholder="Ex: UN, KG, LT" />
              <InputField label="Preço de Venda (R$)" name="preco" type="number" required />
              <InputField label="Custo Base de Compra (R$)" name="custo" type="number" />
              
              {/* Sincronização Mobile Toggle */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Smartphone size={10} className="text-blue-600" /> Sincronizar Mobile
                </label>
                <div className="flex gap-2">
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, enviarMobile: true})} 
                     className={`flex-1 p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${formData.enviarMobile ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-emerald-200'}`}
                   >
                     Sim
                   </button>
                   <button 
                     type="button"
                     onClick={() => setFormData({...formData, enviarMobile: false})} 
                     className={`flex-1 p-2 rounded-lg text-[10px] font-black uppercase border transition-all ${!formData.enviarMobile ? 'bg-slate-200 border-slate-300 text-slate-600 shadow-inner' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                   >
                     Não
                   </button>
                </div>
                <p className="text-[9px] text-slate-400 font-medium leading-tight mt-1 italic">
                  * Define se o item será visível para vendedores externos no app mobile.
                </p>
              </div>

              <InputField label="NCM" name="ncm" />
            </div>
          )}

          {activeTab === 'ficha' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Calculator size={24} /></div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custo de Produção (BOM)</p>
                        <p className="text-xl font-black text-slate-900">R$ {totalProductionCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                     </div>
                  </div>
                  <button 
                    onClick={syncCostWithBOM}
                    className="bg-indigo-600 text-white p-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all text-left flex items-center justify-between group active:scale-95"
                  >
                     <div>
                        <p className="text-[10px] font-bold text-white/60 uppercase">Sincronizar Custo</p>
                        <p className="text-xs font-black">Aplicar ao Cadastro</p>
                     </div>
                     <ArrowRightLeft className="group-hover:rotate-180 transition-transform" size={20} />
                  </button>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                     <input 
                        type="text" 
                        placeholder="Pesquisar insumos para adicionar..."
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                     />
                     {availableInsumos.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 overflow-y-auto">
                           {availableInsumos.map(p => (
                              <button 
                                 key={p.id}
                                 onClick={() => addComponent(p)}
                                 className="w-full px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition-colors"
                              >
                                 <span className="font-black text-slate-900">{p.nome}</span>
                                 <span className="font-black text-blue-600 text-xs">+ Adicionar</span>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>

                  <table className="w-full text-left">
                     <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                           <th className="px-4 py-4">Insumo</th>
                           <th className="px-4 py-4 text-center">Quantidade</th>
                           <th className="px-4 py-4 text-right">Subtotal</th>
                           <th className="px-4 py-4 text-center">Ações</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {(formData.composition || []).map(comp => (
                           <tr key={comp.id}>
                              <td className="px-4 py-4 font-black text-slate-700">{comp.productName}</td>
                              <td className="px-4 py-4 text-center">
                                 <input type="number" className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center font-black" value={comp.quantity} onChange={e => updateComponentQty(comp.id, parseFloat(e.target.value))} />
                              </td>
                              <td className="px-4 py-4 text-right font-black text-slate-900">R$ {(comp.cost * comp.quantity).toFixed(2)}</td>
                              <td className="px-4 py-4 text-center">
                                 <button onClick={() => removeComponent(comp.id)} className="p-2 text-rose-300 hover:text-rose-600"><Trash2 size={16} /></button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          )}

          {activeTab === 'impostos' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
               <div className="flex gap-2 border-b border-slate-200">
                  {['icms', 'pis-cofins', 'ipi', 'issqn'].map(sub => (
                    <button
                      key={sub}
                      onClick={() => setActiveTaxSubTab(sub)}
                      className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                        activeTaxSubTab === sub ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {sub === 'pis-cofins' ? 'PIS / COFINS' : sub.toUpperCase()}
                    </button>
                  ))}
               </div>

               {activeTaxSubTab === 'icms' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                     <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black text-slate-600 uppercase tracking-widest">CST / CSOSN ICMS</label>
                        <select 
                           className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold"
                           value={formData.tax?.icms?.tributacao || ''}
                           onChange={e => updateTax('icms', 'tributacao', e.target.value)}
                        >
                           <option value="">Selecione...</option>
                           <option value="101">101 - Tributada com permissão de crédito</option>
                           <option value="102">102 - Tributada sem permissão de crédito</option>
                           <option value="00">00 - Tributada integralmente</option>
                        </select>
                     </div>
                     <InputField label="% Alíquota ICMS" group="tax.icms" name="pIcms" type="number" />
                     <InputField label="% Redução Base" group="tax.icms" name="pRedIcms" type="number" />
                  </div>
               )}

               {activeTaxSubTab === 'pis-cofins' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                     {/* PIS */}
                     <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                           <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Percent size={16}/></div>
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Configuração de PIS</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CST PIS (Saída)</label>
                              <select 
                                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                                 value={formData.tax?.pis?.cst || ''}
                                 onChange={e => updateTax('pis', 'cst', e.target.value)}
                              >
                                 <option value="">Selecione o CST...</option>
                                 <option value="01">01 - Operação Tributável (alíquota básica)</option>
                                 <option value="04">04 - Operação Tributável (monofásico)</option>
                                 <option value="06">06 - Operação Tributável (alíquota zero)</option>
                                 <option value="07">07 - Operação Isenta da Contribuição</option>
                                 <option value="08">08 - Operação Sem Incidência da Contribuição</option>
                                 <option value="09">09 - Operação com Suspensão da Contribuição</option>
                                 <option value="49">49 - Outras Operações de Saída</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% Alíquota PIS</label>
                              <input 
                                 type="number" 
                                 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                                 value={formData.tax?.pis?.pPis || 0}
                                 onChange={e => updateTax('pis', 'pPis', parseFloat(e.target.value))}
                              />
                           </div>
                        </div>
                     </div>

                     {/* COFINS */}
                     <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Percent size={16}/></div>
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Configuração de COFINS</h4>
                        </div>
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CST COFINS (Saída)</label>
                              <select 
                                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                                 value={formData.tax?.cofins?.cst || ''}
                                 onChange={e => updateTax('cofins', 'cst', e.target.value)}
                              >
                                 <option value="">Selecione o CST...</option>
                                 <option value="01">01 - Operação Tributável (alíquota básica)</option>
                                 <option value="04">04 - Operação Tributável (monofásico)</option>
                                 <option value="06">06 - Operação Tributável (alíquota zero)</option>
                                 <option value="07">07 - Operação Isenta da Contribuição</option>
                                 <option value="08">08 - Operação Sem Incidência da Contribuição</option>
                                 <option value="09">09 - Operação com Suspensão da Contribuição</option>
                                 <option value="49">49 - Outras Operações de Saída</option>
                              </select>
                           </div>
                           <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">% Alíquota COFINS</label>
                              <input 
                                 type="number" 
                                 className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none"
                                 value={formData.tax?.cofins?.pCofins || 0}
                                 onChange={e => updateTax('cofins', 'pCofins', parseFloat(e.target.value))}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {activeTaxSubTab === 'ipi' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                     <div className="md:col-span-2 flex items-center gap-2 mb-2 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                        <AlertTriangle size={18} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Atenção: O IPI só deve ser preenchido para produtos de fabricação própria ou importação direta.</p>
                     </div>

                     <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CST IPI (Saída)</label>
                        <select 
                           className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-rose-600 outline-none"
                           value={formData.tax?.ipi?.cst || ''}
                           onChange={e => updateTax('ipi', 'cst', e.target.value)}
                        >
                           <option value="">Selecione o CST IPI...</option>
                           <option value="50">50 - Saída Tributada</option>
                           <option value="51">51 - Saída Tributável com Alíquota Zero</option>
                           <option value="52">52 - Saída Isenta</option>
                           <option value="53">53 - Saída Não-Tributada</option>
                           <option value="54">54 - Saída Imune</option>
                           <option value="55">55 - Saída com Suspensão</option>
                           <option value="99">99 - Outras Saídas</option>
                        </select>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Hash size={12}/> Cód. Enquadramento IPI</label>
                        <input 
                           type="text" 
                           placeholder="999"
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-600 outline-none"
                           value={formData.tax?.ipi?.enquadramento || ''}
                           onChange={e => updateTax('ipi', 'enquadramento', e.target.value)}
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Percent size={12}/> % Alíquota IPI</label>
                        <input 
                           type="number" 
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-rose-600 outline-none"
                           value={formData.tax?.ipi?.pIpi || 0}
                           onChange={e => updateTax('ipi', 'pIpi', parseFloat(e.target.value))}
                        />
                     </div>
                  </div>
               )}

               {activeTaxSubTab === 'issqn' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
                     <div className="md:col-span-2 flex items-center gap-2 mb-2 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                        <Briefcase size={18} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Utilizado para itens de serviço ou faturamento conjugado (ISSQN).</p>
                     </div>

                     <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Item da Lista de Serviço (LC 116/03)</label>
                        <input 
                           type="text" 
                           placeholder="Ex: 01.01"
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                           value={formData.tax?.issqn?.listaServico || ''}
                           onChange={e => updateTax('issqn', 'listaServico', e.target.value)}
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><Percent size={12}/> % Alíquota ISS</label>
                        <input 
                           type="number" 
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                           value={formData.tax?.issqn?.pIss || 0}
                           onChange={e => updateTax('issqn', 'pIss', parseFloat(e.target.value))}
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1"><MapPin size={12}/> Cód. Município Incidência (IBGE)</label>
                        <input 
                           type="text" 
                           placeholder="Ex: 3550308"
                           className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                           value={formData.tax?.issqn?.cMun || ''}
                           onChange={e => updateTax('issqn', 'cMun', e.target.value)}
                        />
                     </div>
                  </div>
               )}
            </div>
          )}

          {activeTab === 'cfops' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
               <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase flex items-center gap-2"><ArrowDownLeft className="text-emerald-600" size={16}/> Entrada</h4>
                  <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                     <InputField label="Estadual" name="cfop_in_int" placeholder="1.102" />
                     <InputField label="Interestadual" name="cfop_in_ext" placeholder="2.102" />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'estoque' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Layers size={18}/></div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Gestão de Quantidades</h4>
                  </div>
                  
                  <InputField label="Estoque Atual Disponível" name="estoque" type="number" required placeholder="0" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <InputField label="Estoque Mínimo" name="minStock" type="number" placeholder="0" />
                    <InputField label="Estoque Máximo" name="maxStock" type="number" placeholder="0" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">
                    * O estoque atual reflete o saldo real disponível para venda nos pedidos internos e externos.
                  </p>
               </div>
               
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={18}/></div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Parâmetros Logísticos</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <InputField label="Peso Bruto (KG)" name="pesoBruto" type="number" />
                    <InputField label="Peso Líquido (KG)" name="pesoLiquido" type="number" />
                    <InputField label="Largura (cm)" name="largura" type="number" />
                    <InputField label="Altura (cm)" name="altura" type="number" />
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
          <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={16} /> Auditoria Ativa: {currentUser.name}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-8 py-3 text-sm font-black text-slate-400 hover:text-slate-900 uppercase">Cancelar</button>
            <button onClick={handleSave} className="px-12 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-indigo-700 shadow-xl active:scale-95 transition-all uppercase">
              <Save size={20} /> Salvar Produto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
