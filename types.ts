
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
  plano_ativo: string;
  created_at: string;
  endereco?: string;
  mensalidade?: number;
  vencimento_mensalidade?: string;
  status?: 'Ativo' | 'Inativo';
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
  role: MasterRole;
  email?: string;
  lastAccess?: string;
}

// Fix: Exported ProductComponent to satisfy imports in other files
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
  // Fix: Added missing optional properties to satisfy usage in constants and forms
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

// Fix: Added EntityType and OrderStatus types
export type EntityType = 'CLIENTE' | 'FORNECEDOR' | 'TRANSPORTADORA' | 'FABRICA';
export type OrderStatus = 'Pendente' | 'Liberado' | 'Faturado' | 'Cancelado' | 'Sincronizado';

export interface Entity {
  id: string;
  name: string;
  // Fix: Added missing optional properties for Entity
  tradeName?: string;
  document: string;
  type: EntityType;
  status: string;
  address: string;
  sector: Sector;
  email?: string;
  phone?: string;
  createdAt?: string;
  creditLimit?: number;
  rating?: number;
}

// Fix: Added OrderItem interface
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
  // Fix: Updated items type to OrderItem
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

// Fix: Added IncomingInvoice and IncomingInvoiceItem types
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
  taxData: { icms: number; ipi: number; st: number };
  internalProductId?: string;
}

export interface IncomingInvoice {
  id?: string;
  number: string;
  serie: string;
  providerName: string;
  providerId: string;
  accessKey: string;
  date: string;
  total: number;
  status: string;
  items: IncomingInvoiceItem[];
}

export interface UserPermissions {
  [moduleId: string]: {
    access: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
    special?: string[];
    // Fix: Allow extra properties used in permission presets
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
