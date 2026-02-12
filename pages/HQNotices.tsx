
import React, { useState, useEffect } from 'react';
import { Send, X, Plus, AlertCircle, Info, ShieldAlert, Trash2, LayoutGrid, Megaphone, CheckCircle2, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const HQNotices: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_store_id: 'ALL'
  });

  const fetchNotices = async () => {
    setLoading(true);
    const { data } = await supabase.from('system_notices').select('*').order('created_at', { ascending: false });
    setNotices(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleSend = async () => {
    if (!formData.title || !formData.content) return;
    
    const { error } = await supabase.from('system_notices').insert([formData]);
    if (!error) {
      setIsModalOpen(false);
      setFormData({ title: '', content: '', type: 'info', target_store_id: 'ALL' });
      fetchNotices();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('system_notices').delete().eq('id', id);
    fetchNotices();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Quadro de <span className="text-indigo-600">Avisos Globais</span></h2>
          <p className="text-slate-500 font-bold text-sm">Comunicação persistente com os terminais operacionais.</p>
        </div>
        <div className="flex gap-4">
           <button onClick={fetchNotices} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"><RefreshCw size={20} className={loading ? 'animate-spin' : ''}/></button>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest"
          >
            <Megaphone size={20} /> Novo Comunicado
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
           <div className="bg-white p-20 rounded-[48px] border border-slate-200"></div>
           <div className="bg-white p-20 rounded-[48px] border border-slate-200"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {notices.map(notice => (
            <div key={notice.id} className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${notice.type === 'warning' ? 'bg-amber-50 text-amber-600' : notice.type === 'critical' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                      {notice.type === 'warning' ? <AlertCircle size={28}/> : notice.type === 'critical' ? <ShieldAlert size={28}/> : <Info size={28}/>}
                  </div>
                  <span className="text-[10px] font-black text-slate-300 uppercase">{new Date(notice.created_at).toLocaleDateString()}</span>
                </div>
                
                <div>
                  <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{notice.title}</h4>
                  <p className="text-sm font-bold text-slate-500 mt-2 leading-relaxed italic">"{notice.content}"</p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutGrid size={16} className="text-indigo-500" />
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Target: {notice.target_store_id === 'ALL' ? 'Todos os Clientes' : 'Específico'}</span>
                </div>
                <button onClick={() => handleDelete(notice.id)} className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={20}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-xl rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-slate-900 uppercase">Novo Comunicado Persistente</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={32} /></button>
              </div>
              
              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Título do Aviso</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600" placeholder="Ex: Manutenção Programada" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Mensagem Detalhada</label>
                    <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm h-32 outline-none" placeholder="O que o cliente precisa saber?" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nível de Alerta</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option value="info">Informativo (Azul)</option>
                          <option value="warning">Alerta (Laranja)</option>
                          <option value="critical">Crítico (Vermelho)</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Público Alvo</label>
                       <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={formData.target_store_id} onChange={e => setFormData({...formData, target_store_id: e.target.value})}>
                          <option value="ALL">Todas as Lojas</option>
                          <option value="PREMIUM">Lojas Premium</option>
                       </select>
                    </div>
                 </div>
                 
                 <button onClick={handleSend} className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                    <Send size={20} /> Salvar e Publicar
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HQNotices;
