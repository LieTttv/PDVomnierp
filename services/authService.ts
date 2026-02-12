
import { supabase } from './supabaseClient';
import { StoreUser, UserRole, MasterUser, MasterRole } from '../types';

export const login = async (identifier: string, password: string) => {
  const normalizedId = identifier.trim().toUpperCase();
  
  // Tentar buscar na tabela de Master Users (Equipe HQ)
  const { data: internalMember, error: masterError } = await supabase
    .from('master_users')
    .select('*')
    .eq('username', normalizedId)
    .eq('password', password) // Em prod usar hash
    .single();

  if (internalMember && !masterError) {
    localStorage.setItem('omni_master_session', 'true');
    localStorage.setItem('omni_master_role', internalMember.role);
    localStorage.setItem('omni_master_id', internalMember.id);
    return { ...internalMember, role: 'master' as UserRole };
  }

  // Login Padrão de Usuário de Loja
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });
  if (error) throw error;
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
  localStorage.removeItem('active_store_id');
  localStorage.removeItem('omni_master_session');
  localStorage.removeItem('omni_master_role');
  localStorage.removeItem('omni_master_id');
  window.location.href = '#/login';
};

export const getSessionUser = async (): Promise<any> => {
  if (isMaster()) {
    const id = localStorage.getItem('omni_master_id');
    const { data } = await supabase.from('master_users').select('*').eq('id', id).single();
    return { ...data, role: 'master' };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...user, ...profile };
};

export const getUserStores = async (userId: string): Promise<StoreUser[]> => {
  if (isMaster()) {
    return [{
      id: 'virtual-hq',
      store_id: 'OMNI_HQ',
      user_id: userId,
      stores: {
        id: 'OMNI_HQ',
        nome_fantasia: 'OmniERP Headquarters',
        cnpj: '00.000.000/0000-00',
        plano_ativo: 'PLATFORM_OWNER',
        created_at: new Date().toISOString(),
        mensalidade: 0,
        vencimento_mensalidade: new Date().toISOString(),
        status: 'Ativo'
      }
    }];
  }

  const { data, error } = await supabase
    .from('store_users')
    .select(`
      id, store_id, user_id,
      stores ( id, nome_fantasia, cnpj, plano_ativo, status, mensalidade )
    `)
    .eq('user_id', userId);
  
  if (error) return [];
  return data as any[];
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
