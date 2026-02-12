
import { Sector, Product, Entity, Invoice, Order } from './types';

const COMMON_ADVANCED = {
  pDescontoMax: 10,
  pAcrescimoMax: 5,
  cicloPosVenda: 30,
  podeSerBrinde: false,
  pesoBruto: 1,
  pesoLiquido: 0.9
};

const DEFAULT_TENANT = 'tenant_123';
const NOW = new Date().toISOString();

// Fix: Added missing store_id and created_at properties to match updated Product interface
export const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', 
    store_id: 'store_123',
    tenantId: DEFAULT_TENANT,
    codigo: 'INS-001', 
    ean: '789123456001',
    referencia: 'REF001',
    nome: 'Camisa Branca Base', 
    nomePdv: 'Camisa Branca',
    grupoId: 'Têxtil', 
    unidadeMedida: 'UN',
    preco: 25.00, 
    custo: 12.00, 
    estoque: 500, 
    minStock: 50, 
    maxStock: 2000,
    ativo: true,
    dimensao: false,
    ncm: '6109.10.00',
    origem: '0',
    updatedAt: NOW,
    created_at: NOW,
    enviarMobile: true,
    advanced: { ...COMMON_ADVANCED }
  },
  { 
    id: '2', 
    store_id: 'store_123',
    tenantId: DEFAULT_TENANT,
    codigo: 'INS-002', 
    ean: '789123456002',
    referencia: 'REF002',
    nome: 'Tinta Azul Pigmento', 
    nomePdv: 'Tinta Azul',
    grupoId: 'Químicos', 
    unidadeMedida: 'ML',
    preco: 10.00, 
    custo: 2.50, 
    estoque: 10000, 
    minStock: 1000, 
    maxStock: 50000,
    ativo: true,
    dimensao: false,
    ncm: '3204.11.00',
    origem: '0',
    updatedAt: NOW,
    created_at: NOW,
    enviarMobile: true,
    advanced: { ...COMMON_ADVANCED }
  },
  { 
    id: '3', 
    store_id: 'store_123',
    tenantId: DEFAULT_TENANT,
    codigo: 'PRD-001', 
    ean: '789123456003',
    referencia: 'REF003',
    nome: 'Camisa Azul Finalizada', 
    nomePdv: 'Camisa Azul',
    grupoId: 'Produtos Acabados', 
    unidadeMedida: 'UN',
    preco: 55.00, 
    custo: 14.50, 
    estoque: 20, 
    minStock: 10, 
    maxStock: 100,
    ativo: true,
    dimensao: false,
    ncm: '6109.10.00',
    origem: '0',
    updatedAt: NOW,
    created_at: NOW,
    enviarMobile: true,
    composition: [
      { id: 'bom1', productId: '1', productName: 'Camisa Branca Base', quantity: 1, unit: 'UN', cost: 12.00 },
      { id: 'bom2', productId: '2', productName: 'Tinta Azul Pigmento', quantity: 100, unit: 'ML', cost: 2.50 }
    ],
    advanced: { ...COMMON_ADVANCED }
  },
];

export const MOCK_ENTITIES: Entity[] = [
  { id: 'c1', name: 'Mercado do João', tradeName: 'João Supermercados', document: '12.345.678/0001-90', type: 'CLIENTE', sector: Sector.SUPERMARKET, address: 'Rua das Flores, 123, São Paulo - SP', email: 'joao@mercado.com', phone: '(11) 99999-0001', status: 'Ativo', createdAt: '2023-01-15', creditLimit: 50000 },
];

export const MOCK_CLIENTS = MOCK_ENTITIES.filter(e => e.type === 'CLIENTE');

// Fix: Added missing required dueDate property to satisfy the Invoice interface
export const MOCK_INVOICES: Invoice[] = [
  { id: 'inv1', number: '001045', serie: '001', clientId: 'c1', sector: Sector.DISTRIBUTOR, date: '2024-03-10', dueDate: '2024-04-10', total: 1540.50, tax: 277.29, status: 'Emitida', naturezaOperacao: 'Venda de Mercadoria', items: [] },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ord1', number: 'PED-101', clientId: 'c1', clientName: 'Mercado do João', date: '2024-03-15', items: [{ productId: '1', productName: 'Arroz 5kg Premium', quantity: 10, unitPrice: 29.90, totalPrice: 299.00 }], total: 299.00, status: 'Liberado', sector: Sector.DISTRIBUTOR, origin: 'Interno' },
];

export const CHART_DATA = [
  { name: 'Jan', vendas: 4000, impostos: 2400 },
  { name: 'Fev', vendas: 3000, impostos: 1398 },
  { name: 'Mar', vendas: 2000, impostos: 9800 },
  { name: 'Abr', vendas: 2780, impostos: 3908 },
  { name: 'Mai', vendas: 1890, impostos: 4800 },
  { name: 'Jun', vendas: 2390, impostos: 3800 },
];
