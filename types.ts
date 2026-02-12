
export type UserRole = 'master' | 'admin' | 'user' | 'fiscal' | 'vendas' | 'estoquista' | 'personalizado';
export type MasterRole = 'master_admin' | 'master_support' | 'master_financial';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  updated_at: string;
}

export interface StoreModule {
  store_id: string;
  module_id: string;
  modules?: {
    id: string;
    nome_modulo: string;
  };
}

export interface Store {
  id: string;
  nome_fantasia: string;
  cnpj: string;
  plano_ativo?: string;
  created_at?: string;
  endereco?: string;
  mensalidade?: number;
  vencimento_mensalidade?: string;
  ultimo_pagamento?: string;
  status: 'Ativo' | 'Bloqueado' | 'Inativo';
  store_modules?: StoreModule[];
}

export interface StoreUser {
  id: string;
  store_id: string;
  user_id: string;
  stores?: Store;
}

export interface MasterUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: MasterRole;
  email: string;
  lastAccess?: string;
}

export interface SystemNotice {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical';
  targetStoreId: string | 'ALL';
  createdAt: string;
  active: boolean;
}

export interface ProductComponent {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Product {
  id: string;
  store_id: string;
  tenantId?: string;
  codigo: string;
  ean: string;
  referencia?: string;
  nome: string;
  nomePdv?: string;
  grupoId?: string;
  preco: number;
  custo: number;
  estoque: number;
  minStock: number;
  maxStock?: number;
  ativo: boolean;
  unidadeMedida: string;
  enviarMobile: boolean;
  ncm?: string;
  origem?: string;
  updatedAt?: string;
  created_at: string;
  dimensao?: boolean;
  composition?: ProductComponent[];
  tax?: any;
  cfops?: any;
  advanced: {
    pesoBruto: number;
    pesoLiquido: number;
    [key: string]: any;
  };
}

export enum Sector {
  SUPERMARKET = 'Supermercado',
  PHARMACY = 'Farmácia',
  CARRIER = 'Transportadora',
  DISTRIBUTOR = 'Distribuidora',
  FACTORY = 'Fábrica'
}

export type EntityType = 'CLIENTE' | 'FORNECEDOR' | 'TRANSPORTADORA' | 'FABRICA';
export type OrderStatus = 'Pendente' | 'Liberado' | 'Faturado' | 'Cancelado' | 'Sincronizado';

export interface Entity {
  id: string;
  name: string;
  tradeName?: string;
  document: string;
  type: EntityType;
  status: string;
  address?: string;
  sector?: Sector;
  email?: string;
  phone?: string;
  createdAt?: string;
  creditLimit?: number;
  rating?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  total: number;
  status: OrderStatus;
  origin: 'Interno' | 'Externo';
  sellerName?: string;
  items: OrderItem[];
  sector?: Sector;
}

export interface Invoice {
  id: string;
  number: string;
  total: number;
  status: string;
  date: string;
  dueDate: string;
  clientId: string;
  items: any[];
  serie: string;
  tax: number;
  naturezaOperacao: string;
  paymentDate?: string;
  sector?: Sector;
}

export interface UserPermissions {
  [moduleId: string]: {
    access: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    special?: string[];
    [key: string]: any;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  permissions: UserPermissions;
  tenantId?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  timestamp: string;
}

export interface IncomingInvoiceItem {
  id: string;
  description: string;
  externalCode: string;
  quantityReceived: number;
  unitReceived: string;
  conversionFactor: number;
  finalQuantity: number;
  unitPrice: number;
  totalPrice: number;
  taxData: {
    icms: number;
    ipi: number;
    st: number;
  };
  internalProductId?: string;
}

export interface IncomingInvoice {
  id: string;
  number: string;
  serie: string;
  providerName: string;
  providerId: string;
  accessKey: string;
  date: string;
  total: number;
  status: 'Pendente' | 'Processada';
  items: IncomingInvoiceItem[];
}
