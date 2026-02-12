
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
  Package,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import { MOCK_USERS, currentUser, saveUser, getUsers, ROLE_PRESETS } from '../services/productService';
import { User, UserRole, UserPermissions } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form para Novo Usuário
  const [newUserForm, setNewUserForm] = useState<any>({
    name: '',
    email: '',
    password: '',
    role: 'vendas',
    permissions: ROLE_PRESETS.vendas
  });

  // Estado para Edição de Credenciais do Usuário Selecionado
  const [editCredentials, setEditCredentials] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers([...data]);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setEditCredentials({
        email: selectedUser.email,
        password: '',
        confirmPassword: ''
      });
    }
  }, [selectedUser]);

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
      // Aqui simulamos a persistência de e-mail e senha
      const updatedUser = { 
        ...selectedUser, 
        email: editCredentials.email 
      };
      await saveUser(updatedUser);
      if (editCredentials.password) {
        alert(`Senha do usuário ${selectedUser.name} alterada com sucesso.`);
      }
      setIsEditingPermissions(false);
      loadUsers();
    }
  };

  const handleCreateUser = async () => {
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      alert("Nome, Email e Senha são obrigatórios!");
      return;
    }
    await saveUser(newUserForm);
    setIsAddingUser(false);
    setNewUserForm({ name: '', email: '', password: '', role: 'vendas', permissions: ROLE_PRESETS.vendas });
    loadUsers();
    alert("Usuário criado com sucesso!");
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
          <p className="text-slate-500 text-sm">Gerencie quem pode acessar e operar cada área da unidade.</p>
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

        {/* Form area */}
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
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Defina o acesso e as credenciais de login iniciais.</p>
                     </div>
                  </div>
                  <button onClick={() => setIsAddingUser(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24}/></button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Nome Completo</label>
                        <input 
                           type="text" 
                           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                           placeholder="Ex: Pedro Alvares"
                           value={newUserForm.name}
                           onChange={e => setNewUserForm({...newUserForm, name: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">E-mail de Login</label>
                        <input 
                           type="email" 
                           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                           placeholder="pedro@suapresa.com"
                           value={newUserForm.email}
                           onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Senha Provisória</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                            placeholder="Mínimo 8 caracteres"
                            value={newUserForm.password}
                            onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Perfil de Acesso</label>
                        <select 
                           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm"
                           value={newUserForm.role}
                           onChange={e => handleRoleChange(e.target.value as UserRole)}
                        >
                           <option value="vendas">Vendas / Comercial</option>
                           <option value="estoquista">Estoquista / Logística</option>
                           <option value="fiscal">Fiscal / Contador</option>
                           <option value="admin">Administrador da Unidade</option>
                           <option value="personalizado">Personalizado</option>
                        </select>
                     </div>
                  </div>
               </div>

               <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-4 shrink-0">
                  <button onClick={() => setIsAddingUser(false)} className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase">Descartar</button>
                  <button 
                     onClick={handleCreateUser}
                     className="px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-xl hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95 uppercase"
                  >
                     <Save size={18} /> Criar Usuário
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
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${getRoleBadge(selectedUser.role)}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => isEditingPermissions ? handleSavePermissions() : setIsEditingPermissions(true)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isEditingPermissions ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                   >
                     {isEditingPermissions ? <Save size={18} /> : <Settings size={18} />} 
                     {isEditingPermissions ? 'Salvar Tudo' : 'Gerenciar Acesso'}
                   </button>
                   <button onClick={() => setSelectedUser(null)} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 transition-all"><X size={20}/></button>
                </div>
              </div>

              {/* Conteúdo Dinâmico */}
              <div className="flex-1 overflow-y-auto p-8 scrollbar-hide space-y-10">
                
                {isEditingPermissions && (
                  <div className="bg-slate-900 rounded-[32px] p-8 text-white space-y-6 animate-in slide-in-from-top duration-300 shadow-2xl">
                    <div className="flex items-center gap-2 text-blue-400 mb-2">
                       <Fingerprint size={24} />
                       <h4 className="text-xs font-black uppercase tracking-widest">Segurança da Conta</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">E-mail de Login</label>
                        <input 
                          type="email" 
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={editCredentials.email}
                          onChange={e => setEditCredentials({...editCredentials, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resetar Senha</label>
                        <div className="relative">
                           <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nova senha (opcional)"
                            value={editCredentials.password}
                            onChange={e => setEditCredentials({...editCredentials, password: e.target.value})}
                          />
                          <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 text-blue-300 rounded-xl border border-blue-500/20">
                      <AlertTriangle size={14} />
                      <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">Nota: Alterar estas credenciais forçará o deslogamento do colaborador na próxima sessão.</p>
                    </div>
                  </div>
                )}

                 <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={18} className="text-indigo-600" /> Permissões Operacionais
                    </h4>

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
                                    <p className={`font-black text-sm uppercase tracking-tight ${hasAccess ? 'text-slate-900' : 'text-slate-400'}`}>{mod.label}</p>
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
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center p-12">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm mb-6 border-4 border-slate-100">
                  <UserCheck size={40} />
               </div>
               <h3 className="text-xl font-black text-slate-800 mb-2">Selecione um Usuário</h3>
               <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium font-bold">Gerencie logins, senhas e níveis de acesso de cada colaborador.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
