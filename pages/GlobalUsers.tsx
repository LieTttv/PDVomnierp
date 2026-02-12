
import React, { useState } from 'react';
import { 
  Users as UsersIcon, Shield, Search, Mail, 
  Clock, Power, Key, Building2, AlertTriangle,
  Fingerprint, Settings2, Trash2, ShieldAlert
} from 'lucide-react';

const GlobalUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock de administradores de lojas para o Master ver
  const globalAdmins = [
    { id: '1', name: 'Ricardo Silva', email: 'ricardo@lojacentral.com', store: 'Mercado Central', status: 'Ativo', lastLogin: '10 min atrás' },
    { id: '2', name: 'Ana Souza', email: 'ana@farmaciavida.com', store: 'Farmácia Vida Longa', status: 'Ativo', lastLogin: 'Ontem às 14:20' },
    { id: '3', name: 'Marcos Oliveira', email: 'marcos@distribuidora.com', store: 'Distribuidora Norte', status: 'Bloqueado', lastLogin: 'Há 15 dias' },
    { id: '4', name: 'Juliana Paes', email: 'juliana@textil.com', store: 'Têxtil Brasil S.A.', status: 'Ativo', lastLogin: '2 horas atrás' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Usuários das Unidades</h2>
          <p className="text-slate-500 font-bold text-sm italic">Painel Global: Administradores e donos de lojas licenciadas.</p>
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

      <div className="bg-white rounded-[48px] border border-slate-200 shadow-xl p-10 space-y-8">
        <div className="flex items-center gap-2 p-4 bg-indigo-50 border border-indigo-100 rounded-3xl text-indigo-700">
           <ShieldAlert size={20} />
           <p className="text-[10px] font-black uppercase tracking-widest">Atenção Master: Você possui privilégios para resetar credenciais de qualquer administrador de loja.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {globalAdmins.map(admin => (
            <div key={admin.id} className={`p-8 rounded-[40px] border transition-all flex flex-col justify-between group ${admin.status === 'Bloqueado' ? 'bg-rose-50 border-rose-100 opacity-80' : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-2xl'}`}>
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${admin.status === 'Bloqueado' ? 'bg-rose-600' : 'bg-slate-900'}`}>
                       {admin.name.charAt(0)}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${admin.status === 'Bloqueado' ? 'bg-white border-rose-200 text-rose-600' : 'bg-white border-emerald-100 text-emerald-600'}`}>
                       {admin.status}
                    </span>
                 </div>

                 <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{admin.name}</h4>
                    <p className="text-xs font-bold text-indigo-600 flex items-center gap-1 mt-1"><Building2 size={12}/> {admin.store}</p>
                 </div>

                 <div className="space-y-3 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 italic">
                       <Mail size={14} /> {admin.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 italic">
                       <Clock size={14} /> Visto por último: {admin.lastLogin}
                    </div>
                 </div>
               </div>

               <div className="mt-8 grid grid-cols-2 gap-3">
                  <button className="py-4 bg-white border border-slate-200 text-[10px] font-black uppercase text-slate-600 rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                     <Key size={14}/> Resetar Senha
                  </button>
                  <button className={`py-4 text-[10px] font-black uppercase rounded-2xl transition-all flex items-center justify-center gap-2 ${admin.status === 'Bloqueado' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white shadow-lg'}`}>
                     <Power size={14}/> {admin.status === 'Bloqueado' ? 'Ativar' : 'Bloquear'}
                  </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalUsers;
