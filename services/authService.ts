
import { supabase } from './supabaseClient';
import { Profile, StoreUser, User, UserRole } from '../types';

export const login = async (email: string, password: string) => {
  // Novas credenciais MASTER solicitadas
  if (email.toUpperCase() === 'MASTER@GMAIL.COM' && password === 'MASTERX95620083') {
    const masterUser = {
      id: 'master-id',
      email: 'master@gmail.com',
      role: 'master' as UserRole,
      name: 'Omni Master'
    };
    localStorage.setItem('omni_master_session', 'true');
    localStorage.setItem('active_store_id', 'MASTER_CONTROLE');
    return masterUser;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const isMaster = (): boolean => {
  return localStorage.getItem('omni_master_session') === 'true';
};

export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('active_store_id');
  localStorage.removeItem('omni_master_session');
  window.location.href = '/login';
};

export const getSessionUser = async (): Promise<any> => {
  if (isMaster()) {
    return { id: 'master-id', email: 'master@gmail.com', role: 'master', name: 'Master' };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...user, ...profile };
};

export const getUserStores = async (userId: string): Promise<StoreUser[]> => {
  if (userId === 'master-id') return [];

  const { data, error } = await supabase
    .from('store_users')
    .select(`
      id,
      store_id,
      user_id,
      stores (
        id,
        nome_fantasia,
        cnpj,
        plano_ativo
      )
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

// Verifica se a loja atual tem acesso a um módulo específico
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
