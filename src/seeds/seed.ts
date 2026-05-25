import 'reflect-metadata';
import AppDataSource from '../../data-source';
import { Address } from '../address/entities/address.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { OrderStatus } from '../utils/enums';
import { addDays, format } from 'date-fns';

const ADDRESSES: Partial<Address>[] = [
  {
    street: 'Rua das Flores',
    number: '100',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-100',
  },
  {
    street: 'Av. Paulista',
    number: '1578',
    complement: 'Conjunto 12',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-200',
  },
  {
    street: 'Rua dos Pinheiros',
    number: '42',
    neighborhood: 'Pinheiros',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '05422-010',
  },
  {
    street: 'Rua XV de Novembro',
    number: '350',
    neighborhood: 'Centro',
    city: 'Curitiba',
    state: 'PR',
    zip_code: '80020-310',
  },
  {
    street: 'Av. Rio Branco',
    number: '45',
    complement: 'Sala 5',
    neighborhood: 'Centro',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zip_code: '20040-004',
  },
];

const CUSTOMERS = [
  { name: 'João da Silva', document: '123.456.789-00' },
  { name: 'Maria Souza', document: '987.654.321-00' },
  { name: 'Carlos Oliveira', document: '111.222.333-44' },
  { name: 'Ana Lima', document: '555.666.777-88' },
  { name: 'Pedro Costa', document: '999.888.777-66' },
  { name: 'Fernanda Rocha', document: '333.444.555-66' },
  { name: 'Lucas Martins', document: '222.111.000-99' },
  { name: 'Juliana Ferreira', document: '777.888.999-11' },
];

const STATUSES = Object.values(OrderStatus);

const PRODUCTS = [
  { description: 'Notebook Dell Inspiron 15', price: 3499.9 },
  { description: 'Mouse Logitech MX Master 3', price: 349.9 },
  { description: 'Teclado Mecânico Redragon', price: 199.9 },
  { description: 'Monitor LG 24" Full HD', price: 899.0 },
  { description: 'Headset HyperX Cloud II', price: 299.9 },
  { description: 'Webcam Logitech C920', price: 449.9 },
  { description: 'SSD Kingston 480GB', price: 189.9 },
  { description: 'HD Externo Seagate 1TB', price: 259.9 },
  { description: 'Cabo HDMI 2.0 2m', price: 39.9 },
  { description: 'Hub USB-C 7 em 1', price: 129.9 },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomItems(count: number): Partial<OrderItem>[] {
  const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((p) => ({
    description: p.description,
    price: p.price,
  }));
}

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected. Starting seed...');

  const addressRepo = AppDataSource.getRepository(Address);
  const orderRepo = AppDataSource.getRepository(Order);

  // Limpar dados existentes (ordem respeitando FK)
  await orderRepo.query('DELETE FROM order_items');
  await orderRepo.query('DELETE FROM orders');
  await addressRepo.query('DELETE FROM address');

  // Criar endereços
  const savedAddresses = await addressRepo.save(
    ADDRESSES.map((a) => addressRepo.create(a)),
  );
  console.log(`${savedAddresses.length} addresses created.`);

  // Criar 20 pedidos
  const today = new Date();
  const orders: Partial<Order>[] = Array.from({ length: 20 }, (_, i) => {
    const customer = pickRandom(CUSTOMERS);
    const address = pickRandom(savedAddresses);
    const status = pickRandom(STATUSES);
    const deliveryDate = format(addDays(today, 3 + i), 'yyyy-MM-dd');
    const itemCount = Math.floor(Math.random() * 3) + 1;

    return {
      customer_name: customer.name,
      customer_document: customer.document,
      estimated_delivery_date: deliveryDate,
      status,
      delivery_address_id: address.address_id,
      items: pickRandomItems(itemCount) as OrderItem[],
    };
  });

  const savedOrders = await AppDataSource.transaction(async (manager) => {
    const created = orders.map((o) => {
      const items = (o.items ?? []).map((item) =>
        manager.create(OrderItem, item),
      );

      return manager.create(Order, { ...o, items });
    });

    return manager.save(Order, created);
  });

  console.log(`${savedOrders.length} orders created.`);
  console.log('Seed completed successfully!');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
