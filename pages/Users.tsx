
import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Mail,
  Clock,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  Settings,
  ChevronRight,
  UserCheck,
  Save,
  X,
  User as UserIcon,
  Fingerprint,
  UserCog,
  Package
} from 'lucide-react';
import { MOCK_USERS, currentUser, saveUser, getUsers, ROLE_PRESETS } from '../services/productService';
import { User, UserRole, UserPermissions } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Form para Novo Usuário
  // Fix: Updated preset role and permissions to lowercase
  const [newUserForm, setNewUserForm] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'vendas',
    permissions: ROLE_PRESETS.vendas
  });

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers([...data]);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Fix: Updated role badge check to lowercase roles
  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'fiscal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'vendas': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'estoquista': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'personalizado': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const modules = [
    { id: 'dashboard', label: 'Dashboard', actions: [] },
    { id: 'pedidos', label: 'Pedidos', actions: ['create', 'edit', 'delete', 'liberar_pedido'] },
    { id: 'estoque', label: 'Estoque', actions: ['create', 'edit', 'delete', 'ficha_tecnica'] },
    { id: 'faturamento', label: 'Faturamento', actions: ['create', 'transmitir_sefaz', 'cancelar_nfe'] },
    { id: 'vendasExternas', label: 'Vendas Externas', actions: ['sincronizar'] },
    { id: 'logistica', label: 'Logística', actions: ['otimizar_rota'] },
    { id: 'entidades', label: 'Entidades', actions: ['create', 'edit'] },
    { id: 'usuarios', label: 'Usuários', actions: ['create', 'edit'] },
    { id: 'relatorios', label: 'Relatórios', actions: [] },
  ];

  const handleSavePermissions = async () => {
    if (selectedUser) {
      await saveUser(selectedUser);
      setIsEditingPermissions(false);
      loadUsers();
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.name || !newUserForm.email) {
      alert("Nome e Email são obrigatórios!");
      return;
    }
    await saveUser(newUserForm);
    setIsAddingUser(false);
    setNewUserForm({ name: '', email: '', role: 'vendas', permissions: ROLE_PRESETS.vendas });
    loadUsers();
  };

  const handleRoleChange = (role: UserRole) => {
    setNewUserForm({
      ...newUserForm,
      role,
      permissions: { ...ROLE_PRESETS[role] }
    });
  };

  const toggleAccess = (target: User | Partial<User>, moduleId: string, isNew: boolean) => {
    const permissions = { ...(target.permissions || {}) };
    if (permissions[moduleId]) {
      permissions[moduleId].access = !permissions[moduleId].access;
    } else {
      permissions[moduleId] = { access: true };
    }

    if (isNew) {
      setNewUserForm({ ...newUserForm, permissions });
    } else if (selectedUser) {
      setSelectedUser({ ...selectedUser, permissions });
    }
  };

  const toggleAction = (target: User | Partial<User>, moduleId: string, action: string, isNew: boolean) => {
    const permissions = { ...(target.permissions || {}) };
    const mod = permissions[moduleId] || { access: true };
    
    if (['create', 'edit', 'delete'].includes(action)) {
      const act = action as 'create' | 'edit' | 'delete';
      mod[act] = !mod[act];
    } else {
      if (!mod.special) mod.special = [];
      if (mod.special.includes(action)) {
        mod.special = mod.special.filter(a => a !== action);
      } else {
        mod.special.push(action);
      }
    }
    permissions[moduleId] = mod;

    if (isNew) {
      setNewUserForm({ ...newUserForm, permissions });
    } else if (selectedUser) {
      setSelectedUser({ ...selectedUser, permissions });
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Usuários e Permissões</h2>
          <p className="text-slate-500 text-sm">Gerencie quem pode acessar cada área do sistema OmniERP.</p>
        </div>
        <button 
          onClick={() => { setIsAddingUser(true); setSelectedUser(null); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all text-sm font-bold shadow-lg shadow-indigo-100"
        >
          <UserPlus size={18} /> Novo Usuário
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0">
        {/* User List */}
        <div className="lg:col-span-1 space-y-4 flex flex-col overflow-hidden">
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar usuários..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100 overflow-y-auto flex-1">
            {filteredUsers.map(user => (
              <button 
                key={user.id}
                onClick={() => { setSelectedUser(user); setIsEditingPermissions(false); setIsAddingUser(false); }}
                className={`w-full p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left ${selectedUser?.id === user.id ? 'bg-indigo-50/50' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 shrink-0 ${selectedUser?.id === user.id ? 'border-indigo-600 bg-white text-indigo-600' : 'bg-slate-100 text-slate-600 border-white'}`}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Permission Details or Add User Form */}
        <div className="lg:col-span-2 overflow-hidden h-full">
          {isAddingUser ? (
            <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-full">
               <div className="p-8 border-b border-slate-100 bg-indigo-50/30 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
                        <UserPlus size={24} />
                     </div>
                     <div>
                        <h3 className="text-xl font-black text-slate-900">Novo Colaborador</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">As permissões serão preenchidas automaticamente conforme o Perfil.</p>
                     </div>
                  </div>
                  <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                        <input 
                           type="text" 
                           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                           placeholder="Ex: Pedro Alvares"
                           value={newUserForm.name}
                           onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">E-mail Institucional</label>
                        <input 
                           type="email" 
                           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                           placeholder="pedro@omnierp.com"
                           value={newUserForm.email}
                           onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Perfil de Acesso (Presets)</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                           {/* Fix: Updated role preset IDs to lowercase identifiers */}
                           {[
                              { id: 'vendas', label: 'Vendas / Comercial', icon: UserCog },
                              { id: 'estoquista', label: 'Estoquista / Logística', icon: Package },
                              { id: 'fiscal', label: 'Fiscal / Contador', icon: ShieldCheck },
                              { id: 'admin', label: 'Administrador', icon: ShieldAlert },
                              { id: 'personalizado', label: 'Personalizado', icon: Settings },
                           ].map(role => (
                              <button 
                                 key={role.id}
                                 onClick={() => handleRoleChange(role.id as UserRole)}
                                 className={`px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tight flex flex-col items-center justify-center gap-2 transition-all ${
                                    newUserForm.role === role.id 
                                       ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105' 
                                       : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                 }`}
                              >
                                 <role.icon size={18} />
                                 {role.label}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  {/* Configuração Detalhada */}
                  <div className="pt-6 border-t border-slate-100">
                     <div className="flex items-center justify-between mb-6">
                        <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                           <ShieldCheck className="text-indigo-600" size={18} /> Configuração de Permissões
                        </h4>
                        {newUserForm.role !== 'personalizado' && (
                           <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Preset Ativo: {newUserForm.role}</span>
                        )}
                     </div>
                     <div className="space-y-4">
                        {modules.map(mod => {
                           const hasAccess = newUserForm.permissions?.[mod.id]?.access;
                           return (
                              <div key={mod.id} className={`border rounded-2xl p-4 transition-all ${hasAccess ? 'border-indigo-200 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/30'}`}>
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${hasAccess ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                          <Shield size={16} />
                                       </div>
                                       <span className={`font-black text-xs uppercase ${hasAccess ? 'text-slate-900' : 'text-slate-400'}`}>{mod.label}</span>
                                    </div>
                                    <button 
                                       onClick={() => toggleAccess(newUserForm, mod.id, true)}
                                       className={`w-10 h-5 rounded-full relative transition-all ${hasAccess ? 'bg-indigo-600' : 'bg-slate-300'}`}
                                    >
                                       <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${hasAccess ? 'left-5.5' : 'left-0.5'}`}></div>
                                    </button>
                                 </div>
                                 {hasAccess && mod.actions.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-indigo-50 flex flex-wrap gap-2">
                                       {mod.actions.map(action => {
                                          const isSpecial = !['create', 'edit', 'delete'].includes(action);
                                          const isActive = isSpecial 
                                             ? newUserForm.permissions?.[mod.id]?.special?.includes(action)
                                             : (newUserForm.permissions?.[mod.id] as any)[action];
                                          return (
                                             <button 
                                                key={action}
                                                onClick={() => toggleAction(newUserForm, mod.id, action, true)}
                                                className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider border transition-all ${
                                                   isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-400'
                                                }`}
                                             >
                                                {action.replace('_', ' ')}
                                             </button>
                                          );
                                       })}
                                    </div>
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4 shrink-0">
                  <button onClick={() => setIsAddingUser(false)} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase">Descartar</button>
                  <button 
                     onClick={handleCreateUser}
                     className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95 uppercase tracking-widest"
                  >
                     <Save size={18} /> Confirmar Cadastro
                  </button>
               </div>
            </div>
          ) : selectedUser ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-right duration-400 flex flex-col h-full">
              {/* Header do Perfil */}
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100 shrink-0">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedUser.name}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Mail size={14}/> {selectedUser.email}</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle2 size={14}/> {selectedUser.status}</span>
                      {selectedUser.lastAccess && <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Clock size={14}/> Acesso: {new Date(selectedUser.lastAccess).toLocaleDateString()}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => isEditingPermissions ? handleSavePermissions() : setIsEditingPermissions(true)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isEditingPermissions ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                   >
                     {isEditingPermissions ? <Save size={18} /> : <Lock size={18} />} 
                     {isEditingPermissions ? 'Salvar Alterações' : 'Editar Acessos'}
                   </button>
                   <button onClick={() => setSelectedUser(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 transition-all"><X size={20}/></button>
                </div>
              </div>

              {/* Grid de Permissões */}
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                 <div className="flex items-center justify-between mb-8">
                   <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Key size={16} className="text-indigo-600" /> Controle de Acesso por Módulo
                   </h4>
                   <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                      <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Ativo</span>
                      <span className="flex items-center gap-1"><XCircle size={12} className="text-slate-300" /> Bloqueado</span>
                   </div>
                 </div>

                 <div className="space-y-4">
                    {modules.map(mod => {
                      const hasAccess = selectedUser.permissions[mod.id]?.access;
                      return (
                        <div key={mod.id} className={`group border rounded-2xl p-4 transition-all ${hasAccess ? 'border-indigo-100 bg-white shadow-sm' : 'border-slate-100 bg-slate-50/50 opacity-70'}`}>
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${hasAccess ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'}`}>
                                    <Shield size={20} />
                                 </div>
                                 <div>
                                    <p className={`font-black text-sm uppercase tracking-tight ${hasAccess ? 'text-slate-900' : 'text-slate-400'}`}>{mod.label}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">Módulo de {mod.label}</p>
                                 </div>
                              </div>
                              <button 
                                disabled={!isEditingPermissions}
                                onClick={() => toggleAccess(selectedUser, mod.id, false)}
                                className={`w-12 h-6 rounded-full relative transition-all ${hasAccess ? 'bg-indigo-600' : 'bg-slate-300'} ${!isEditingPermissions && 'cursor-not-allowed opacity-50'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${hasAccess ? 'left-7' : 'left-1'}`}></div>
                              </button>
                           </div>

                           {hasAccess && mod.actions.length > 0 && (
                             <div className="mt-4 pt-4 border-t border-indigo-50 flex flex-wrap gap-2">
                               {mod.actions.map(action => {
                                 const isSpecial = !['create', 'edit', 'delete'].includes(action);
                                 const isActive = isSpecial 
                                   ? selectedUser.permissions[mod.id]?.special?.includes(action)
                                   : (selectedUser.permissions[mod.id] as any)[action];
                                 
                                 return (
                                   <button 
                                    key={action}
                                    disabled={!isEditingPermissions}
                                    onClick={() => toggleAction(selectedUser, mod.id, action, false)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                      isActive 
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                        : 'bg-white border-slate-200 text-slate-400 hover:border-indigo-200'
                                    }`}
                                   >
                                     {action.replace('_', ' ')}
                                   </button>
                                 );
                               })}
                             </div>
                           )}
                        </div>
                      );
                    })}
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm mb-6 border-4 border-slate-100">
                  <UserCheck size={40} />
               </div>
               <h3 className="text-xl font-black text-slate-800 mb-2">Selecione um Usuário</h3>
               <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">Escolha um colaborador na lista ao lado para gerenciar suas permissões ou clique em "Novo Usuário" para cadastrar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
