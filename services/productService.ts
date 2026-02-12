
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

export const currentTenantConfig = {
  id: 'tenant_123',
  name: 'Omni S.A.'
};

export const MOCK_USERS: User[] = [
  currentUser,
  { id: 'u2', name: 'João Fiscal', email: 'joao@fiscal.com', role: 'fiscal', status: 'Ativo', permissions: ROLE_PRESETS.fiscal },
  { id: 'u3', name: 'Maria Vendas', email: 'maria@vendas.com', role: 'vendas', status: 'Ativo', permissions: ROLE_PRESETS.vendas },
];

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

export const deleteProduct = async (id: string) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const getUsers = async (): Promise<User[]> => {
  return MOCK_USERS;
};

export const saveUser = async (user: Partial<User>) => {
  console.log('Saving user:', user);
  return user;
};

export const getAuditLogs = async (): Promise<AuditLog[]> => {
  return [
    { id: '1', userId: 'u1', userName: 'Admin Omni', action: 'Login', module: 'Auth', timestamp: new Date().toISOString() },
    { id: '2', userId: 'u1', userName: 'Admin Omni', action: 'Create Product', module: 'Inventory', timestamp: new Date().toISOString() }
  ];
};
