
import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Key, Power, Mail, ShieldAlert, Trash2, Fingerprint, X, Save, Edit3, Shield, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { MasterUser, MasterRole } from '../types';

const MasterTeam: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
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
    try {
      const { data, error } = await supabase
        .from('master_users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTeam(data || []);
    } catch (err) {
      console.error("Erro ao carregar time HQ:", err);
    } finally {
      setLoading(false);
    }
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
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      // Limpar o objeto para garantir que NÃO enviamos o campo ID em novos registros
      const payload: any = {
        name: formData.name,
        username: formData.username?.toUpperCase().trim(),
        password: formData.password,
        email: formData.email,
        role: formData.role
      };

      if (editingMember) {
        const { error } = await supabase
          .from('master_users')
          .update(payload)
          .eq('id', editingMember.id);
        if (error) throw error;
      } else {
        // IMPORTANTE: Deixa o Supabase gerar o UUID
        const { error } = await supabase
          .from('master_users')
          .insert([payload]);
        if (error) throw error;
      }
      
      alert("Usuário salvo com sucesso no banco de dados global!");
      await fetchTeam();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      alert("Erro no Banco de Dados: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este acesso permanentemente da nuvem?")) return;
    try {
      const { error } = await supabase.from('master_users').delete().eq('id', id);
      if (error) throw error;
      await fetchTeam();
    } catch (e: any) {
      alert("Erro ao remover: " + e.message);
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Time <span className="text-indigo-600">Omni HQ</span></h2>
          <p className="text-slate-500 font-bold text-sm">Controle de acessos globais para o time Omni.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={fetchTeam} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''}/>
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[28px] font-black text-sm shadow-2xl hover:bg-indigo-600 transition-all uppercase tracking-widest"
          >
            <UserPlus size={20} /> Novo Membro HQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.length === 0 && !loading && (
          <div className="col-span-full p-20 text-center bg-white rounded-[48px] border border-dashed border-slate-300">
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum membro registrado na nuvem.</p>
          </div>
        )}
        
        {team.map(member => (
          <div key={member.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-xl hover:shadow-2xl transition-all">
            <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center text-2xl font-black">
                  {member.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(member)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all"><Edit3 size={18}/></button>
                  <button onClick={() => handleDelete(member.id)} className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-rose-600 border border-slate-100 transition-all"><Trash2 size={18}/></button>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{member.name}</h4>
                <div className="flex flex-col gap-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg border border-indigo-100 w-fit">
                      {getRoleLabel(member.role)}
                  </span>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-2">
                    <Fingerprint size={12} className="text-indigo-400" /> Login: <strong>{member.username}</strong>
                  </p>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Mail size={12} className="text-indigo-400" /> {member.email}
                  </p>
                </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[48px] shadow-2xl p-10 animate-in zoom-in-95">
               <div className="flex justify-between items-center mb-10">
                  <h3 className="text-2xl font-black text-slate-900 uppercase">{editingMember ? 'Editar Acesso' : 'Novo Membro HQ'}</h3>
                  <button onClick={() => setIsModalOpen(false)}><X size={32} /></button>
               </div>
               
               <div className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome Completo</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none" placeholder="Ex: Beto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Username (Login)</label>
                      <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold uppercase" placeholder="BETO" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha</label>
                      <input type="password" placeholder="***" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail</label>
                    <input className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" placeholder="beto@gmail.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Cargo</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as MasterRole})}>
                      <option value="master_admin">Administrador Master</option>
                      <option value="master_support">Analista de Suporte</option>
                      <option value="master_financial">Gestor Financeiro</option>
                    </select>
                  </div>

                  <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white rounded-[32px] font-black uppercase flex items-center justify-center gap-3 shadow-2xl hover:bg-indigo-600 transition-all">
                     <Save size={20} /> Salvar Globalmente
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MasterTeam;
