
import { supabase } from './supabaseClient';
import { StoreUser, UserRole, MasterUser, MasterRole } from '../types';

export const login = async (identifier: string, password: string) => {
  const normalizedId = identifier.trim().toUpperCase();
  const MASTER_PWD = 'MASTERX95620083';

  // 1. Acesso MASTER de Emergência
  if (normalizedId === 'MASTER' && password === MASTER_PWD) {
    localStorage.setItem('omni_master_session', 'true');
    localStorage.setItem('omni_master_role', 'master_admin');
    localStorage.setItem('omni_master_id', 'master-hq-id');
    return { id: 'master-hq-id', name: 'Diretor Omni', role: 'master' };
  }

  // 2. Verificação de Usuários HQ no Banco de Dados Remoto
  try {
    const { data: internalMember, error: masterError } = await supabase
      .from('master_users')
      .select('*')
      .eq('username', normalizedId)
      .eq('password', password)
      .single();

    if (internalMember && !masterError) {
      localStorage.setItem('omni_master_session', 'true');
      localStorage.setItem('omni_master_role', internalMember.role);
      localStorage.setItem('omni_master_id', internalMember.id);
      return { ...internalMember, role: 'master' as UserRole };
    }
  } catch (e) {
    console.error("Erro ao verificar base Master:", e);
  }

  // 3. Login de Usuário de Unidade (Auth do Supabase)
  // Nota: Para usuários de loja, o e-mail deve estar cadastrado no Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier.toLowerCase(),
    password,
  });
  
  if (error) {
    throw new Error("Credenciais inválidas ou usuário não encontrado na nuvem.");
  }
  
  return data.user;
};

export const isMaster = (): boolean => {
  return localStorage.getItem('omni_master_session') === 'true';
};

export const getMasterRole = (): MasterRole | null => {
  return localStorage.getItem('omni_master_role') as MasterRole;
};

export const impersonateStore = (storeId: string) => {
  if (!isMaster()) return;
  localStorage.setItem('active_store_id', storeId);
  window.location.href = '#/';
};

export const logout = async () => {
  if (!isMaster()) {
    await supabase.auth.signOut();
  }
  localStorage.clear(); // Limpa tudo para evitar sessões fantasmas
  window.location.href = '#/login';
};

export const getSessionUser = async (): Promise<any> => {
  if (isMaster()) {
    const id = localStorage.getItem('omni_master_id');
    try {
      const { data } = await supabase.from('master_users').select('*').eq('id', id).single();
      if (data) return { ...data, role: 'master' };
    } catch (e) {}
    return { name: 'Membro HQ', role: 'master' };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...user, ...profile };
};

export const getUserStores = async (userId: string): Promise<StoreUser[]> => {
  if (isMaster()) {
    return [{
      id: 'hq',
      store_id: 'OMNI_HQ',
      user_id: userId,
      stores: { id: 'OMNI_HQ', nome_fantasia: 'Omni HQ Global', cnpj: '00.000.000/0000-00', status: 'Ativo' }
    }];
  }

  const { data, error } = await supabase
    .from('store_users')
    .select(`id, store_id, user_id, stores (*)`)
    .eq('user_id', userId);
  
  return (data as any[]) || [];
};

export const getActiveStoreId = (): string | null => {
  return localStorage.getItem('active_store_id');
};

export const setActiveStoreId = (storeId: string) => {
  localStorage.setItem('active_store_id', storeId);
};

export const hasModuleAccess = async (moduleId: string): Promise<boolean> => {
  if (isMaster()) return true; 
  const storeId = getActiveStoreId();
  if (!storeId) return false;

  const { data } = await supabase
    .from('store_modules')
    .select('*')
    .eq('store_id', storeId)
    .eq('module_id', moduleId)
    .single();
    
  return !!data;
};
