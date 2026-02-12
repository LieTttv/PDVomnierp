
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Download, Upload, 
  MoreVertical, Edit2, Trash2, Smartphone, 
  BarChart3, RefreshCcw, Package
} from 'lucide-react';
import { getProducts } from '../services/productService';
import { Product } from '../types';
import ProductForm from './ProductForm';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(p => 
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.codigo.includes(searchTerm) || 
    p.ean.includes(searchTerm)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Catálogo de Produtos</h2>
          <p className="text-slate-500 text-sm">Gerenciamento centralizado de itens, estoque e parâmetros fiscais.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 shadow-sm">
            <Upload size={16} /> Importar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-bold text-slate-700 shadow-sm">
            <Download size={16} /> Exportar
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-100"
          >
            <Plus size={18} /> Novo Produto
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por Nome, Código, EAN ou NCM..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
             <Filter size={16} /> Filtros Avançados
           </button>
           <button onClick={loadProducts} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
             <RefreshCcw size={18} />
           </button>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Package size={20}/></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Itens</p><p className="text-lg font-black text-slate-800">{products.length}</p></div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Smartphone size={20}/></div>
          <div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sinc. Mobile</p><p className="text-lg font-black text-slate-800">{products.filter(p => p.enviarMobile).length}</p></div>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cód / EAN</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4">Preço (R$)</th>
                <th className="px-6 py-4">Estoque</th>
                <th className="px-6 py-4">NCM</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <BarChart3 size={48} className="mb-4" />
                      <p className="font-bold text-lg">Nenhum produto encontrado</p>
                      <p className="text-sm">Tente mudar os filtros ou cadastrar um novo item.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${product.ativo ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{product.codigo}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{product.ean || 'SEM EAN'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{product.nome}</span>
                        {product.enviarMobile && <span className="text-[9px] font-black text-emerald-600 flex items-center gap-0.5"><Smartphone size={8}/> SYNC MOBILE</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-900">
                      {product.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
                         product.estoque <= product.minStock 
                           ? 'bg-rose-50 text-rose-600 border border-rose-100 shadow-sm shadow-rose-50' 
                           : 'bg-slate-100/60 text-slate-600 border border-slate-100'
                       }`}>
                         {product.estoque} {(product.unidadeMedida || 'un').toLowerCase()}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{product.ncm || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedProduct(product); setIsFormOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={16}/></button>
                        <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16}/></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-all"><MoreVertical size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <ProductForm 
          product={selectedProduct || undefined} 
          onClose={() => { setIsFormOpen(false); setSelectedProduct(null); }} 
          onSave={() => { setIsFormOpen(false); setSelectedProduct(null); loadProducts(); }}
        />
      )}
    </div>
  );
};

export default Inventory;
