
import { supabase } from './supabaseClient';
import { Product, User, UserRole, UserPermissions, AuditLog } from '../types';
import { getActiveStoreId } from './authService';

export const ROLE_PRESETS: Record<UserRole, UserPermissions> = {
  admin: {
    dashboard: { access: true },
    pedidos: { access: true, create: true, edit: true, delete: true, special: ['liberar_pedido'] },
    estoque: { access: true, create: true, edit: true, delete: true, ficha_tecnica: true },
    faturamento: { access: true, create: true, transmitir_sefaz: true, cancelar_nfe: true },
    vendasExternas: { access: true, sincronizar: true },
    logistica: { access: true, otimizar_rota: true },
    entidades: { access: true, create: true, edit: true },
    usuarios: { access: true, create: true, edit: true },
    relatorios: { access: true },
  },
  fiscal: {
    dashboard: { access: true },
    faturamento: { access: true, create: true, transmitir_sefaz: true, cancelar_nfe: true },
    relatorios: { access: true },
    entidades: { access: true },
  },
  vendas: {
    dashboard: { access: true },
    pedidos: { access: true, create: true, edit: true },
    vendasExternas: { access: true, sincronizar: true },
    entidades: { access: true, create: true },
  },
  estoquista: {
    dashboard: { access: true },
    estoque: { access: true, edit: true },
    logistica: { access: true },
  },
  master: {
    dashboard: { access: true },
    pedidos: { access: true, create: true, edit: true, delete: true, special: ['liberar_pedido'] },
    estoque: { access: true, create: true, edit: true, delete: true, ficha_tecnica: true },
    faturamento: { access: true, create: true, transmitir_sefaz: true, cancelar_nfe: true },
    vendasExternas: { access: true, sincronizar: true },
    logistica: { access: true, otimizar_rota: true },
    entidades: { access: true, create: true, edit: true },
    usuarios: { access: true, create: true, edit: true },
    relatorios: { access: true },
  },
  personalizado: {
    dashboard: { access: true }
  },
  user: {
    dashboard: { access: true }
  }
};

export const currentUser: User = {
  id: 'u1',
  name: 'Admin Omni',
  email: 'admin@omnierp.com',
  role: 'admin',
  status: 'Ativo',
  permissions: ROLE_PRESETS.admin,
  tenantId: 'tenant_123'
};

export const getProducts = async (): Promise<Product[]> => {
  const storeId = getActiveStoreId();
  if (!storeId) return [];

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
};

export const saveProduct = async (product: Partial<Product>) => {
  const storeId = getActiveStoreId();
  if (!storeId) throw new Error('Nenhuma loja ativa selecionada.');

  const productData = {
    ...product,
    store_id: storeId
  };

  if (product.id) {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', product.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const getUsers = async (): Promise<User[]> => {
  const storeId = getActiveStoreId();
  if (!storeId) return [];

  // Buscamos usuários vinculados à loja ativa na tabela de perfis
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id, name, email, role, 
      store_users!inner(store_id)
    `)
    .eq('store_users.store_id', storeId);

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return (data || []).map(u => ({ ...u, status: 'Ativo', permissions: ROLE_PRESETS[u.role as UserRole] || ROLE_PRESETS.vendas }));
};

export const saveUser = async (user: Partial<User>) => {
  const storeId = getActiveStoreId();
  if (!storeId) throw new Error('Loja não identificada.');

  try {
    if (user.id) {
      const { error } = await supabase.from('profiles').update({
        name: user.name,
        role: user.role,
        email: user.email
      }).eq('id', user.id);
      if (error) throw error;
    } else {
      // Criação de usuário requer Supabase Auth (simulado para o MVP de UI)
      // Em produção, isso chamaria uma Edge Function ou Admin API
      const { data: profile, error: profileErr } = await supabase.from('profiles').insert([{
        name: user.name,
        role: user.role,
        email: user.email
      }]).select().single();
      
      if (profileErr) throw profileErr;

      await supabase.from('store_users').insert([{
        user_id: profile.id,
        store_id: storeId
      }]);
    }
    return user;
  } catch (err) {
    console.error('Error saving user:', err);
    throw err;
  }
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  const { data } = await supabase.from('audit_logs').select('*').limit(50).order('created_at', { ascending: false });
  return data || [];
};
