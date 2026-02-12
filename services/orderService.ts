
import { Order, OrderStatus } from '../types';
import { MOCK_ORDERS } from '../constants';

let orders: Order[] = [...MOCK_ORDERS];

// Mock de vendas externas iniciais (Sincronizados)
let externalBuffer: Order[] = [
  {
    id: 'ext1',
    number: 'MOB-5001',
    clientId: 'c1',
    clientName: 'Mercado do João',
    date: new Date().toISOString().split('T')[0],
    items: [{ productId: '1', productName: 'Camisa Branca Base', quantity: 50, unitPrice: 25.00, totalPrice: 1250.00 }],
    total: 1250.00,
    status: 'Sincronizado',
    sector: 'Distribuidora' as any,
    origin: 'Externo',
    sellerName: 'André Silva'
  },
  {
    id: 'ext2',
    number: 'MOB-5002',
    clientId: 'c2',
    clientName: 'Farmácia Vida Longa',
    date: new Date().toISOString().split('T')[0],
    items: [{ productId: '2', productName: 'Tinta Azul Pigmento', quantity: 20, unitPrice: 40.00, totalPrice: 800.00 }],
    total: 800.00,
    status: 'Sincronizado',
    sector: 'Farmácia' as any,
    origin: 'Externo',
    sellerName: 'Carla Dias'
  }
];

export const getOrders = () => orders;
export const getExternalBuffer = () => externalBuffer;

export const saveOrder = (order: Order) => {
  const index = orders.findIndex(o => o.id === order.id);
  if (index >= 0) {
    orders[index] = order;
  } else {
    orders.unshift(order);
  }
};

export const approveExternalSale = (id: string) => {
  const order = externalBuffer.find(o => o.id === id);
  if (order) {
    const approvedOrder: Order = {
      ...order,
      status: 'Pendente'
    };
    orders.unshift(approvedOrder);
    externalBuffer = externalBuffer.filter(o => o.id !== id);
    return true;
  }
  return false;
};

export const updateOrderStatus = (id: string, status: OrderStatus) => {
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
  }
};
