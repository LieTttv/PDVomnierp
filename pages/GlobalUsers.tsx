
import React, { useState } from 'react';
import { 
  Users as UsersIcon, Shield, Search, Mail, 
  Clock, Power, Key, Building2, AlertTriangle,
  Fingerprint, Settings2, Trash2, ShieldAlert, X, Save, ExternalLink
} from 'lucide-react';
import { impersonateStore } from '../services/authService';

const GlobalUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const [globalAdmins, setGlobalAdmins] = useState([
    { id: '1', storeId: 'store_123', name: 'Ricardo Silva', email: 'ricardo@lojacentral.com', store: 'Mercado Central', status: 'Ativo', lastLogin: '10 min atrás' },
    { id: '2', storeId: 'store_456', name: 'Ana Souza', email: 'ana@farmaciavida.com', store: 'Farmácia Vida Longa', status: 'Ativo', lastLogin: 'Ontem às 14:20' },
    { id: '3', storeId: 'store_789', name: 'Marcos Oliveira', email: 'marcos@distribuidora.com', store: 'Distribuidora Norte', status: 'Bloqueado', lastLogin: 'Há 15 dias' },
    { id: '4', storeId: 'store_000', name: 'Juliana Paes', email: 'juliana@textil.com', store: 'Têxtil Brasil S.A.', status: 'Ativo', lastLogin: '2 horas atrás' },
  ]);

  const handleToggleStatus = (id: string) => {
    setGlobalAdmins(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'Ativo' ? 'Bloqueado' : 'Ativo' } : a
    ));
  };

  const handleOpenReset = (admin: any) => {
    setSelectedAdmin(admin);
    setNewPassword('');
    setIsResetModalOpen(true);
  };

  const handleResetPassword = () => {
    if (!newPassword) return;
    alert(`Senha do admin ${selectedAdmin.name} resetada com sucesso!`);
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Base de Clientes Ativos</h2>
          <p className="text-slate-500 font-bold text-sm italic">Gestão de acessos para administradores das unidades licenciadas.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome, e-mail ou loja..." 
            className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-600 w-96 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {globalAdmins.map(admin => (
          <div key={admin.id} className={`p-8 rounded-[40px] border transition-all flex flex-col justify-between group ${admin.status === 'Bloqueado' ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100 hover:shadow-2xl'}`}>
             <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${admin.status === 'Bloqueado' ? 'bg-rose-600 shadow-rose-100' : 'bg-slate-900 shadow-slate-100'}`}>
                     {admin.name.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${admin.status === 'Bloqueado' ? 'bg-white border-rose-200 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                       {admin.status}
                    </span>
                  </div>
               </div>

               <div>
                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{admin.name}</h4>
                  <p className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-1 uppercase italic tracking-widest"><Building2 size={12}/> {admin.store}</p>
               </div>

               <div className="space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                     <Mail size={14} className="text-slate-300" /> {admin.email}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                     <Clock size={14} className="text-slate-300" /> Visto: {admin.lastLogin}
                  </div>
               </div>
             </div>

             <div className="mt-8 space-y-3">
                <button 
                  onClick={() => impersonateStore(admin.storeId)}
                  className="w-full py-4 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all"
                >
                   Acessar Unidade <ExternalLink size={14}/>
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleOpenReset(admin)} className="py-4 bg-slate-50 border border-slate-100 text-[9px] font-black uppercase text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                     <Key size={14}/> Resetar
                  </button>
                  <button onClick={() => handleToggleStatus(admin.id)} className={`py-4 text-[9px] font-black uppercase rounded-2xl transition-all flex items-center justify-center gap-2 ${admin.status === 'Bloqueado' ? 'bg-emerald-600 text-white' : 'bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white'}`}>
                     <Power size={14}/> {admin.status === 'Bloqueado' ? 'Ativar' : 'Bloquear'}
                  </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {isResetModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-sm rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase">Resetar Senha</h3>
                <button onClick={() => setIsResetModalOpen(false)}><X size={28} /></button>
              </div>
              <p className="text-xs font-bold text-slate-400 mb-6">Defina uma nova chave mestra para <strong>{selectedAdmin?.name}</strong>.</p>
              
              <div className="space-y-6">
                 <input 
                   type="password" 
                   placeholder="NOVA SENHA" 
                   className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-center" 
                   value={newPassword}
                   onChange={e => setNewPassword(e.target.value)}
                 />
                 <button onClick={handleResetPassword} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all">
                    Efetivar Mudança
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GlobalUsers;
