import { DataSource } from "typeorm";
import { Address } from "@/address/entities/address.entity";
import { Order } from "@/orders/entities/order.entity";
import { OrderItem } from "@/orders/entities/order-item.entity";
import { User } from "@/user/entities/user.entity";
import { createSaltedHash } from "@/utils/auth.utils";
import { OrderStatus, UserRole } from "@/utils/enums";

type AddressSeed = Omit<Address, "address_id" | "created_at" | "updated_at">;
type OrderItemSeed = Pick<OrderItem, "description" | "price">;

interface OrderSeed {
  customer_name: string;
  customer_document: string;
  estimated_delivery_date: string;
  status: OrderStatus;
  address_key: string;
  items: OrderItemSeed[];
}

const ADMIN_SEED = {
  name: "Administrador naPorta",
  email: process.env.ADMIN_EMAIL ?? "admin@na-porta.local",
  password: process.env.ADMIN_PASSWORD ?? "Admin@123456",
  role: UserRole.ADMIN,
};

const ADDRESSES: AddressSeed[] = [
  {
    street: "Rua das Flores",
    number: "100",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zip_code: "01310-100",
  },
  {
    street: "Av. Paulista",
    number: "1578",
    complement: "Conjunto 12",
    neighborhood: "Bela Vista",
    city: "São Paulo",
    state: "SP",
    zip_code: "01310-200",
  },
  {
    street: "Rua dos Pinheiros",
    number: "42",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    zip_code: "05422-010",
  },
  {
    street: "Rua XV de Novembro",
    number: "350",
    neighborhood: "Centro",
    city: "Curitiba",
    state: "PR",
    zip_code: "80020-310",
  },
  {
    street: "Av. Rio Branco",
    number: "45",
    complement: "Sala 5",
    neighborhood: "Centro",
    city: "Rio de Janeiro",
    state: "RJ",
    zip_code: "20040-004",
  },
];

const ORDER_SEEDS: OrderSeed[] = [
  {
    customer_name: "João da Silva",
    customer_document: "123.456.789-00",
    estimated_delivery_date: "2026-06-01",
    status: OrderStatus.PENDING,
    address_key: "Rua das Flores|100|01310-100",
    items: [
      { description: "Notebook Dell Inspiron 15", price: 3499.9 },
      { description: "Mouse Logitech MX Master 3", price: 349.9 },
    ],
  },
  {
    customer_name: "Maria Souza",
    customer_document: "987.654.321-00",
    estimated_delivery_date: "2026-06-02",
    status: OrderStatus.CONFIRMED,
    address_key: "Av. Paulista|1578|01310-200",
    items: [{ description: "Teclado Mecânico Redragon", price: 199.9 }],
  },
  {
    customer_name: "Carlos Oliveira",
    customer_document: "111.222.333-44",
    estimated_delivery_date: "2026-06-03",
    status: OrderStatus.IN_TRANSIT,
    address_key: "Rua dos Pinheiros|42|05422-010",
    items: [
      { description: 'Monitor LG 24" Full HD', price: 899.0 },
      { description: "Cabo HDMI 2.0 2m", price: 39.9 },
    ],
  },
  {
    customer_name: "Ana Lima",
    customer_document: "555.666.777-88",
    estimated_delivery_date: "2026-06-04",
    status: OrderStatus.DELIVERED,
    address_key: "Rua XV de Novembro|350|80020-310",
    items: [{ description: "Headset HyperX Cloud II", price: 299.9 }],
  },
  {
    customer_name: "Pedro Costa",
    customer_document: "999.888.777-66",
    estimated_delivery_date: "2026-06-05",
    status: OrderStatus.CANCELLED,
    address_key: "Av. Rio Branco|45|20040-004",
    items: [{ description: "SSD Kingston 480GB", price: 189.9 }],
  },
  {
    customer_name: "Fernanda Rocha",
    customer_document: "333.444.555-66",
    estimated_delivery_date: "2026-06-06",
    status: OrderStatus.PENDING,
    address_key: "Rua das Flores|100|01310-100",
    items: [{ description: "Hub USB-C 7 em 1", price: 129.9 }],
  },
  {
    customer_name: "Lucas Martins",
    customer_document: "222.111.000-99",
    estimated_delivery_date: "2026-06-07",
    status: OrderStatus.CONFIRMED,
    address_key: "Av. Paulista|1578|01310-200",
    items: [
      { description: "Webcam Logitech C920", price: 449.9 },
      { description: "Mouse Logitech MX Master 3", price: 349.9 },
    ],
  },
  {
    customer_name: "Juliana Ferreira",
    customer_document: "777.888.999-11",
    estimated_delivery_date: "2026-06-08",
    status: OrderStatus.IN_TRANSIT,
    address_key: "Rua dos Pinheiros|42|05422-010",
    items: [{ description: "HD Externo Seagate 1TB", price: 259.9 }],
  },
  {
    customer_name: "Ricardo Mendes",
    customer_document: "444.555.666-77",
    estimated_delivery_date: "2026-06-09",
    status: OrderStatus.DELIVERED,
    address_key: "Rua XV de Novembro|350|80020-310",
    items: [{ description: "Cabo HDMI 2.0 2m", price: 39.9 }],
  },
  {
    customer_name: "Patrícia Alves",
    customer_document: "888.999.000-22",
    estimated_delivery_date: "2026-06-10",
    status: OrderStatus.PENDING,
    address_key: "Av. Rio Branco|45|20040-004",
    items: [
      { description: "Notebook Dell Inspiron 15", price: 3499.9 },
      { description: "Hub USB-C 7 em 1", price: 129.9 },
    ],
  },
];

function getAddressKey(address: Pick<AddressSeed, "street" | "number" | "zip_code">): string {
  return `${address.street}|${address.number}|${address.zip_code}`;
}

async function upsertAdminUser(dataSource: DataSource): Promise<User> {
  const userRepository = dataSource.getRepository(User);
  const existingAdmin = await userRepository.findOne({
    where: { email: ADMIN_SEED.email },
  });

  const hashedPassword = await createSaltedHash(ADMIN_SEED.password);

  if (existingAdmin) {
    existingAdmin.name = ADMIN_SEED.name;
    existingAdmin.role = ADMIN_SEED.role;
    existingAdmin.password = hashedPassword;
    return userRepository.save(existingAdmin);
  }

  const adminUser = userRepository.create({
    name: ADMIN_SEED.name,
    email: ADMIN_SEED.email,
    role: ADMIN_SEED.role,
    password: hashedPassword,
  });

  return userRepository.save(adminUser);
}

async function upsertAddresses(dataSource: DataSource): Promise<Map<string, Address>> {
  const addressRepository = dataSource.getRepository(Address);
  const addressMap = new Map<string, Address>();

  for (const addressSeed of ADDRESSES) {
    const existingAddress = await addressRepository.findOne({
      where: {
        street: addressSeed.street,
        number: addressSeed.number,
        zip_code: addressSeed.zip_code,
      },
    });

    const address = existingAddress
      ? addressRepository.merge(existingAddress, addressSeed)
      : addressRepository.create(addressSeed);

    const savedAddress = await addressRepository.save(address);
    addressMap.set(getAddressKey(addressSeed), savedAddress);
  }

  return addressMap;
}

async function upsertOrders(
  dataSource: DataSource,
  adminUser: User,
  addressMap: Map<string, Address>,
): Promise<void> {
  await dataSource.transaction(async (manager) => {
    for (const orderSeed of ORDER_SEEDS) {
      const address = addressMap.get(orderSeed.address_key);

      if (!address) {
        throw new Error(
          `Endereço ${orderSeed.address_key} não foi encontrado durante a execução da seed.`,
        );
      }

      const existingOrder = await manager.findOne(Order, {
        where: {
          created_by_user_id: adminUser.user_id,
          customer_document: orderSeed.customer_document,
        },
        withDeleted: true,
      });

      const orderPayload: Partial<Order> = {
        customer_name: orderSeed.customer_name,
        customer_document: orderSeed.customer_document,
        estimated_delivery_date: orderSeed.estimated_delivery_date,
        status: orderSeed.status,
        delivery_address_id: address.address_id,
        created_by_user_id: adminUser.user_id,
        deleted_at: null as unknown as undefined,
      };

      let savedOrder: Order;

      if (existingOrder) {
        await manager.update(Order, { order_id: existingOrder.order_id }, orderPayload);
        await manager.delete(OrderItem, { order: { order_id: existingOrder.order_id } });
        savedOrder = await manager.findOneByOrFail(Order, {
          order_id: existingOrder.order_id,
        });
      } else {
        const order = manager.create(Order, orderPayload);
        savedOrder = await manager.save(Order, order);
      }

      const items = orderSeed.items.map((item) =>
        manager.create(OrderItem, {
          ...item,
          order: savedOrder,
        }),
      );

      await manager.save(OrderItem, items);
    }
  });
}

export async function runDemoSeed(dataSource: DataSource): Promise<void> {
  console.log("Executando seed de demonstração...");

  const adminUser = await upsertAdminUser(dataSource);
  const addressMap = await upsertAddresses(dataSource);
  await upsertOrders(dataSource, adminUser, addressMap);

  console.log(
    `Seed de demonstração finalizada. Email do admin: ${ADMIN_SEED.email} | Pedidos vinculados ao user_id ${adminUser.user_id}.`,
  );
}
