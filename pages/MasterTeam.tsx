
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Key, Power, Mail, ShieldAlert, Trash2, Fingerprint, X, Save, Edit3, Shield, RefreshCcw, WifiOff } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { MasterUser, MasterRole } from '../types';

const MasterTeam: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [editingMember, setEditingMember] = useState<MasterUser | null>(null);
  const [team, setTeam] = useState<MasterUser[]>([]);

  const [formData, setFormData] = useState<Partial<MasterUser>>({
    name: '',
    username: '',
    password: '',
    email: '',
    role: 'master_support'
  });

  const fetchTeam = async () => {
    setLoading(true);
    let dbData: MasterUser[] = [];
    
    // 1. Tentar buscar do Supabase
    try {
      const { data, error } = await supabase
        .from('master_users')
        .select('*')
        .order('name');
      
      if (!error && data) {
        dbData = data;
        setIsOffline(false);
      } else {
        setIsOffline(true);
      }
    } catch (err) {
      setIsOffline(true);
    }

    // 2. Buscar do LocalStorage (Fallback)
    const localData = JSON.parse(localStorage.getItem('omni_hq_team') || '[]');
    
    // 3. Mesclar dados (prioridade para o que for mais recente ou local se DB falhar)
    const merged = [...dbData];
    localData.forEach((lItem: MasterUser) => {
      if (!merged.find(m => m.id === lItem.id || m.username === lItem.username)) {
        merged.push(lItem);
      }
    });

    setTeam(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleOpenModal = (member?: MasterUser) => {
    if (member) {
      setEditingMember(member);
      setFormData(member);
    } else {
      setEditingMember(null);
      setFormData({ name: '', username: '', password: '', email: '', role: 'master_support' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.username || (!editingMember && !formData.password)) {
      alert("Preencha os campos obrigatórios.");
      return;
    }

    const tempId = editingMember?.id || Math.random().toString(36).substr(2, 9);
    const memberToSave = { ...formData, id: tempId } as MasterUser;

    // Persistência Imediata no LocalStorage para evitar "desaparecimento"
    const currentLocal = JSON.parse(localStorage.getItem('omni_hq_team') || '[]');
    let updatedLocal;
    if (editingMember) {
      updatedLocal = currentLocal.map((m: any) => m.id === tempId ? memberToSave : m);
    } else {
      updatedLocal = [memberToSave, ...currentLocal];
    }
    localStorage.setItem('omni_hq_team', JSON.stringify(updatedLocal));

    // Tentativa de persistência no Supabase
    try {
      if (editingMember) {
        await supabase.from('master_users').update(formData).eq('id', tempId);
      } else {
        await supabase.from('master_users').insert([formData]);
      }
    } catch (err) {
      console.warn("Supabase Sync Failed - Saved Locally");
    }

    await fetchTeam();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Deseja realmente remover este membro da equipe HQ?")) {
      // Remover Local
      const currentLocal = JSON.parse(localStorage.getItem('omni_hq_team') || '[]');
      localStorage.setItem('omni_hq_team', JSON.stringify(currentLocal.filter((m: any) => m.id !== id)));
      
      // Tentar remover no DB
      try {
        await supabase.from('master_users').delete().eq('id', id);
      } catch (e) {}
      
      await fetchTeam();
    }
  };

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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Time <span className="text-indigo-600">OmniERP HQ</span></h2>
          <div className="flex items-center gap-2 mt-1">
             <p className="text-slate-500 font-bold text-sm">Controle central de acessos.</p>
             {isOffline && (
               <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded border border-amber-100 animate-pulse">
                 <WifiOff size={10}/> Modo de Persistência Local Ativo
               </span>
             )}
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchTeam} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"><RefreshCcw size={20} className={loading ? 'animate-spin' : ''}/></button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest"
          >
            <UserPlus size={20} /> Novo Membro HQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map(member => (
          <div key={member.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-2xl font-black shadow-lg">
                  {member.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(member)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(member.id)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 border border-slate-100 transition-all"><Trash2 size={18}/></button>
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{member.name}</h4>
                <div className="flex flex-col gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100 w-fit">
                      {getRoleLabel(member.role)}
                  </span>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-2"><Fingerprint size={12}/> ID: {member.username}</p>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1"><Mail size={12}/> {member.email}</p>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 relative z-10">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Shield size={14} className="text-indigo-500" /> Acesso Global Ativo
                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900 uppercase">{editingMember ? 'Editar Membro' : 'Novo Membro do Time'}</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={32} /></button>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Nome Completo</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-600" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Usuário de Login</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Senha de Acesso</label>
                      <input type="password" placeholder={editingMember ? "Manter atual" : "Senha segura"} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">E-mail Corporativo</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Cargo / Nível de Acesso</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as MasterRole})}>
                      <option value="master_support">Suporte Técnico</option>
                      <option value="master_financial">Financeiro HQ</option>
                      <option value="master_admin">Administrador Master</option>
                    </select>
                  </div>

                  <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                     <Save size={20} /> {editingMember ? 'Atualizar Membro' : 'Efetivar Cadastro'}
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MasterTeam;
