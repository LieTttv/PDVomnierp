
import { supabase } from './supabaseClient';
import { StoreUser, UserRole, MasterUser, MasterRole } from '../types';

// UUID fixo para o acesso de emergência (formato válido)
const EMERGENCY_MASTER_ID = '00000000-0000-0000-0000-000000000000';

export const login = async (identifier: string, password: string) => {
  const normalizedId = identifier.trim().toUpperCase();
  const emailLower = identifier.trim().toLowerCase();
  const MASTER_PWD = 'MASTERX95620083';

  // 1. Acesso MASTER de Emergência
  if (normalizedId === 'MASTER' && password === MASTER_PWD) {
    localStorage.setItem('omni_master_session', 'true');
    localStorage.setItem('omni_master_role', 'master_admin');
    localStorage.setItem('omni_master_id', EMERGENCY_MASTER_ID);
    return { id: EMERGENCY_MASTER_ID, name: 'Diretor Omni (Local)', role: 'master' };
  }

  // 2. Verificação de Usuários HQ na Nuvem
  try {
    const { data: internalMember } = await supabase
      .from('master_users')
      .select('*')
      .eq('username', normalizedId)
      .eq('password', password)
      .single();

    if (internalMember) {
      localStorage.setItem('omni_master_session', 'true');
      localStorage.setItem('omni_master_role', internalMember.role);
      localStorage.setItem('omni_master_id', internalMember.id);
      return { ...internalMember, role: 'master' as UserRole };
    }
  } catch (e) {}

  // 3. Verificação de Usuários Admin/Unidade via Tabela Profiles (Login Customizado)
  // Este passo é crucial para os lojistas criados pelo painel Master
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', emailLower)
      .eq('password', password)
      .single();

    if (profile) {
      // Importante: Guardamos o ID do profile para o getUserStores encontrar as lojas
      return profile;
    }
  } catch (e) {}

  // 4. Fallback: Login Padrão Supabase Auth (Para usuários que se cadastraram via convite oficial)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailLower,
    password,
  });
  
  if (error) {
    throw new Error("Credenciais inválidas. Verifique seu login e senha.");
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
  localStorage.clear();
  window.location.href = '#/login';
};

export const getSessionUser = async (): Promise<any> => {
  if (isMaster()) {
    const id = localStorage.getItem('omni_master_id');
    if (id === EMERGENCY_MASTER_ID) {
      return { name: 'Diretor Omni (Emergência)', role: 'master' };
    }
    
    try {
      const { data } = await supabase.from('master_users').select('*').eq('id', id).single();
      if (data) return { ...data, role: 'master' };
    } catch (e) {}
    return { name: 'Membro HQ', role: 'master' };
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return { ...user, ...profile };
  }
  return null;
};

export const getActiveStoreId = (): string | null => {
  return localStorage.getItem('active_store_id');
};

export const setActiveStoreId = (storeId: string) => {
  localStorage.setItem('active_store_id', storeId);
};

export const getUserStores = async (userId: string): Promise<StoreUser[]> => {
  if (isMaster()) {
    return [{
      id: 'hq-link',
      store_id: 'OMNI_HQ',
      user_id: userId,
      stores: { id: 'OMNI_HQ', nome_fantasia: 'Omni HQ Global', cnpj: '00.000.000/0000-00', status: 'Ativo' }
    }];
  }

  const { data } = await supabase
    .from('store_users')
    .select(`id, store_id, user_id, stores (*)`)
    .eq('user_id', userId);
  
  return (data as any[]) || [];
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
