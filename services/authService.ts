
import { supabase } from './supabaseClient';
import { StoreUser, UserRole, MasterUser, MasterRole } from '../types';

// In a real scenario, these would be in a "master_users" table in Supabase
// Fix: Added required email property to each HQ team member to satisfy MasterUser interface
const HQ_TEAM: MasterUser[] = [
  { id: 'master-1', name: 'Diretor Omni', username: 'MASTER', role: 'master_admin', email: 'admin@omnierp.hq' },
  { id: 'master-2', name: 'Suporte Técnico', username: 'SUPORTE', role: 'master_support', email: 'suporte@omnierp.hq' },
  { id: 'master-3', name: 'Financeiro HQ', username: 'FINANCEIRO', role: 'master_financial', email: 'financeiro@omnierp.hq' },
];

export const login = async (identifier: string, password: string) => {
  const normalizedId = identifier.trim().toUpperCase();
  
  // Check HQ Internal Team first
  const internalMember = HQ_TEAM.find(m => m.username === normalizedId);
  if (internalMember && password === 'MASTERX95620083') {
    localStorage.setItem('omni_master_session', 'true');
    localStorage.setItem('omni_master_role', internalMember.role);
    localStorage.setItem('omni_master_id', internalMember.id);
    // Masters don't have a fixed store until they "impersonate" one
    return { ...internalMember, role: 'master' as UserRole };
  }

  // Standard Store User Login
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
    const member = HQ_TEAM.find(m => m.id === id) || HQ_TEAM[0];
    return { ...member, role: 'master' };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { ...user, ...profile };
};

export const getUserStores = async (userId: string): Promise<StoreUser[]> => {
  if (isMaster()) {
    // HQ Team sees a "Virtual HQ" entry if they aren't impersonating
    // Fix: Added missing required Store properties (mensalidade, vencimento_mensalidade, status)
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
      stores ( id, nome_fantasia, cnpj, plano_ativo )
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
  if (isMaster()) return true; // Master HQ team has bypass access
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
