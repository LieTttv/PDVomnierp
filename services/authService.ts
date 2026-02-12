
import { supabase } from './supabaseClient';
import { Profile, StoreUser, User, UserRole, Store } from '../types';

export const login = async (email: string, password: string) => {
  const normalizedEmail = email.trim().toUpperCase();
  
  // Master Superuser Login Logic
  if ((normalizedEmail === 'MASTER' || normalizedEmail === 'MASTER@GMAIL.COM') && password === 'MASTERX95620083') {
    const masterUser = {
      id: 'master-id',
      email: 'master@system',
      role: 'master' as UserRole,
      name: 'Omni Super Master'
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
  if (!isMaster()) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('active_store_id');
  localStorage.removeItem('omni_master_session');
  window.location.href = '#/login';
};

export const getSessionUser = async (): Promise<any> => {
  if (isMaster()) {
    return { id: 'master-id', email: 'master@system', role: 'master', name: 'Master Admin' };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...user, ...profile };
};

export const getUserStores = async (userId: string): Promise<StoreUser[]> => {
  if (userId === 'master-id') {
    // Return a virtual store for the master so the store selector doesn't block them
    return [{
      id: 'virtual-master',
      store_id: 'MASTER_CONTROLE',
      user_id: 'master-id',
      stores: {
        id: 'MASTER_CONTROLE',
        nome_fantasia: 'Painel Central Omni',
        cnpj: '00.000.000/0000-00',
        plano_ativo: 'SaaS Master',
        created_at: new Date().toISOString()
      }
    }];
  }

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
