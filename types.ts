
// Fix: Added missing roles to UserRole and expanded interfaces to match usage
export type UserRole = 'master' | 'admin' | 'user' | 'fiscal' | 'vendas' | 'estoquista' | 'personalizado';

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
  // Fix: Renamed modules to store_modules to match the database schema and queries used in MasterDashboard
  store_modules?: StoreModule[];
}

export interface StoreUser {
  id: string;
  store_id: string;
  user_id: string;
  stores?: Store;
}

// Fix: Expanded Product interface to include all required fields for management and fiscal flows
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
  referencia: string;
  nome: string;
  nomePdv: string;
  grupoId: string;
  unidadeMedida: string;
  preco: number;
  custo: number;
  estoque: number;
  minStock: number;
  maxStock: number;
  ativo: boolean;
  dimensao: boolean;
  ncm: string;
  origem: string;
  updatedAt: string;
  enviarMobile: boolean;
  created_at: string;
  composition?: ProductComponent[];
  advanced: {
    pDescontoMax: number;
    pAcrescimoMax: number;
    cicloPosVenda: number;
    podeSerBrinde: boolean;
    pesoBruto: number;
    pesoLiquido: number;
  };
  tax?: any;
  cfops?: any;
}

export enum Sector {
  SUPERMARKET = 'Supermercado',
  PHARMACY = 'Farmácia',
  CARRIER = 'Transportadora',
  DISTRIBUTOR = 'Distribuidora',
  FACTORY = 'Fábrica'
}

export type EntityType = 'CLIENTE' | 'FORNECEDOR' | 'TRANSPORTADORA' | 'FABRICA';

// Fix: Added missing Entity, Order, Invoice, and AuditLog interfaces
export interface Entity {
  id: string;
  name: string;
  tradeName: string;
  document: string;
  type: EntityType;
  sector: Sector;
  address: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  creditLimit: number;
  rating?: number;
}

export type OrderStatus = 'Pendente' | 'Liberado' | 'Faturado' | 'Cancelado' | 'Sincronizado';

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
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  sector: Sector;
  origin: 'Interno' | 'Externo';
  sellerName?: string;
}

export interface Invoice {
  id: string;
  number: string;
  serie: string;
  clientId: string;
  sector: Sector;
  date: string;
  dueDate: string;
  total: number;
  tax: number;
  status: string;
  naturezaOperacao: string;
  items: OrderItem[];
  paymentDate?: string;
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
  taxData: { icms: number; ipi: number; st: number };
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
  lastAccess?: string;
}
