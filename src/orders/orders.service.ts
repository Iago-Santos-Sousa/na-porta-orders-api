import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { FilterOrderDto } from "./dto/filter-order.dto";
import { OrderRepository } from "./repositories/orders.repository";
import { AddressRepository } from "@/address/repositories/address.repository";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { PageDto } from "@/common/dtos/page.dto";
import { parseApiEndDate, parseApiStartDate } from "@/common/utils/api-date.util";
import { OrderQueryFilters } from "./types/order-query-filters.type";
import { CurrentUserDto } from "@/auth/dto/current-user.dto";
import { UserRole } from "@/utils/enums";

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly addressRepository: AddressRepository,
    private readonly dataSource: DataSource,
  ) {}

  private normalizeFilters(filterOrderDto: FilterOrderDto): OrderQueryFilters {
    const startDate = filterOrderDto.start_date
      ? parseApiStartDate(filterOrderDto.start_date)
      : undefined;

    const endDate = filterOrderDto.end_date ? parseApiEndDate(filterOrderDto.end_date) : undefined;
    const skip = (filterOrderDto.page - 1) * filterOrderDto.take;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException("start_date must be before or equal to end_date");
    }

    return {
      ...filterOrderDto,
      start_date: startDate,
      end_date: endDate,
      skip,
    };
  }

  private assertCanUpdateOrder(order: Order, currentUser: CurrentUserDto): void {
    const isAdmin = currentUser.roles.includes(UserRole.ADMIN);
    const isOwner = order.created_by_user_id === currentUser.sub;
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException("Você não tem permissão para atualizar este pedido.");
    }
  }

  async create(createOrderDto: CreateOrderDto, currentUser: CurrentUserDto): Promise<Order> {
    const { items, delivery_address_id, ...orderData } = createOrderDto;

    const address = await this.addressRepository.findOne({
      where: { address_id: delivery_address_id },
    });

    if (!address) {
      throw new NotFoundException(`Address ${delivery_address_id} not found`);
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const order = manager.create(Order, {
          ...orderData,
          delivery_address_id,
          created_by_user_id: currentUser.sub,
          items: items.map((item) => manager.create(OrderItem, item)),
        });

        return manager.save(Order, order);
      });
    } catch {
      throw new InternalServerErrorException("Failed to create order");
    }
  }

  async findAll(filterOrderDto: FilterOrderDto): Promise<PageDto<Order>> {
    const normalizedFilters = this.normalizeFilters(filterOrderDto);
    return this.orderRepository.findWithFilters(normalizedFilters);
  }

  async findOne(order_id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { order_id },
      relations: ["delivery_address", "items"],
      withDeleted: false,
    });

    if (!order) {
      throw new NotFoundException(`Order ${order_id} not found`);
    }

    return order;
  }

  async update(
    order_id: string,
    updateOrderDto: UpdateOrderDto,
    currentUser: CurrentUserDto,
  ): Promise<Order> {
    const existingOrder = await this.findOne(order_id);
    this.assertCanUpdateOrder(existingOrder, currentUser);

    const { items, delivery_address_id, ...orderData } = updateOrderDto;

    if (delivery_address_id) {
      const address = await this.addressRepository.findOne({
        where: { address_id: delivery_address_id },
      });

      if (!address) {
        throw new NotFoundException(`Address ${delivery_address_id} not found`);
      }
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        if (items !== undefined) {
          await manager.delete(OrderItem, { order: { order_id } });
        }

        await manager.update(
          Order,
          { order_id },
          {
            ...orderData,
            ...(delivery_address_id ? { delivery_address_id } : {}),
          },
        );

        if (items !== undefined) {
          const newItems = items.map((item) =>
            manager.create(OrderItem, { ...item, order: { order_id } }),
          );

          await manager.save(OrderItem, newItems);
        }

        return this.findOne(order_id);
      });
    } catch {
      throw new InternalServerErrorException("Failed to update order");
    }
  }

  async remove(order_id: string): Promise<void> {
    await this.findOne(order_id);
    await this.orderRepository.softDelete({ order_id });
  }
}
