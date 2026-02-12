
import React, { useState } from 'react';
import { ShieldCheck, UserPlus, Key, Power, Mail, ShieldAlert, Trash2, Fingerprint, X } from 'lucide-react';
import { MasterUser, MasterRole } from '../types';

const MasterTeam: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [team, setTeam] = useState<MasterUser[]>([
    { id: 'master-1', name: 'Diretor Omni', username: 'MASTER', role: 'master_admin', email: 'admin@omnierp.hq' },
    { id: 'master-2', name: 'Suporte Técnico', username: 'SUPORTE', role: 'master_support', email: 'suporte@omnierp.hq' },
    { id: 'master-3', name: 'Financeiro HQ', username: 'FINANCEIRO', role: 'master_financial', email: 'financeiro@omnierp.hq' },
  ]);

  const getRoleLabel = (role: MasterRole) => {
    switch (role) {
      case 'master_admin': return 'Administrador HQ';
      case 'master_support': return 'Analista de Suporte';
      case 'master_financial': return 'Gestor Financeiro';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Equipe OmniERP HQ</h2>
          <p className="text-slate-500 font-bold text-sm italic">Gestão do time interno com acesso global às unidades.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest"
        >
          <UserPlus size={20} /> Novo Membro HQ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl hover:shadow-2xl transition-all group">
             <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-2xl font-black shadow-lg shadow-slate-200">
                   {member.name.charAt(0)}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-100"><Key size={18}/></button>
                   <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 border border-slate-100"><Trash2 size={18}/></button>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{member.name}</h4>
                <div className="flex flex-col gap-2">
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100 w-fit">
                      {getRoleLabel(member.role)}
                   </span>
                   <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Fingerprint size={12}/> ID: {member.username}</p>
                   <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Mail size={12}/> {member.email}</p>
                </div>
             </div>

             <div className="mt-8 pt-8 border-t border-slate-50">
                <button className="w-full py-4 bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                   Editar Permissões HQ
                </button>
             </div>
          </div>
        ))}
      </div>

      {isAdding && (
         <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900 uppercase">Novo Membro do Time</h3>
                  <button onClick={() => setIsAdding(false)}><X size={32} /></button>
               </div>
               
               <div className="space-y-6">
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="NOME COMPLETO" />
                  <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm" placeholder="USUÁRIO DE LOGIN" />
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm">
                     <option>master_support</option>
                     <option>master_financial</option>
                     <option>master_admin</option>
                  </select>
                  <button className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest">Criar Credenciais</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MasterTeam;
