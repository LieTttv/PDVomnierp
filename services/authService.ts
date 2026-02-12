
import { supabase } from './supabaseClient';
import { StoreUser, UserRole, MasterUser, MasterRole } from '../types';

export const login = async (identifier: string, password: string) => {
  const normalizedId = identifier.trim().toUpperCase();
  const MASTER_PWD = 'MASTERX95620083'; // Sua chave mestra configurada

  // 1. Fallback Imediato para Usuário MASTER (Evita erro de API Key no primeiro acesso)
  if (normalizedId === 'MASTER' && password === MASTER_PWD) {
    const defaultMaster = {
      id: 'master-hq-id',
      name: 'Diretor Omni',
      username: 'MASTER',
      role: 'master_admin',
      email: 'admin@omnierp.hq'
    };
    
    localStorage.setItem('omni_master_session', 'true');
    localStorage.setItem('omni_master_role', defaultMaster.role);
    localStorage.setItem('omni_master_id', defaultMaster.id);
    
    // Tenta salvar/atualizar no banco silenciosamente se a conexão estiver ativa
    try {
      await supabase.from('master_users').upsert([defaultMaster]);
    } catch (e) {
      console.warn("Database sync skipped: Using local master session.");
    }
    
    return { ...defaultMaster, role: 'master' as UserRole };
  }

  // 2. Tentar buscar outros membros da equipe HQ no banco
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
    console.error("Master DB check failed", e);
  }

  // 3. Login Padrão de Usuário de Loja (Auth do Supabase)
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  });
  
  if (error) {
    if (error.message.includes("API key")) {
      throw new Error("Configuração de API pendente. Use o acesso MASTER para configurar.");
    }
    throw error;
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
  localStorage.removeItem('active_store_id');
  localStorage.removeItem('omni_master_session');
  localStorage.removeItem('omni_master_role');
  localStorage.removeItem('omni_master_id');
  window.location.href = '#/login';
};

export const getSessionUser = async (): Promise<any> => {
  if (isMaster()) {
    const id = localStorage.getItem('omni_master_id');
    try {
      const { data } = await supabase.from('master_users').select('*').eq('id', id).single();
      if (data) return { ...data, role: 'master' };
    } catch (e) {}
    return { name: 'Diretor Omni', role: 'master' };
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
      stores ( id, nome_fantasia, cnpj, plano_ativo, status, mensalidade, vencimento_mensalidade )
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
