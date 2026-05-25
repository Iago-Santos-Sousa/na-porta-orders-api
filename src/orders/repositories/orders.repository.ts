import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { endOfDay, startOfDay } from 'date-fns';
import { Order } from '../entities/order.entity';
import { FilterOrderDto } from '../dto/filter-order.dto';
import { PageMetaDto } from '../../common/dtos/page-meta.dto';
import { PageDto } from '../../common/dtos/page.dto';

@Injectable()
export class OrderRepository extends Repository<Order> {
  constructor(private dataSource: DataSource) {
    super(Order, dataSource.createEntityManager());
  }

  async findWithFilters(dto: FilterOrderDto): Promise<PageDto<Order>> {
    const qb = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.delivery_address', 'delivery_address')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.deleted_at IS NULL');

    if (dto.order_number !== undefined) {
      qb.andWhere('order.order_number = :order_number', {
        order_number: dto.order_number,
      });
    }

    if (dto.status) {
      qb.andWhere('order.status = :status', { status: dto.status });
    }

    if (dto.start_date) {
      qb.andWhere('order.created_at >= :start_date', {
        start_date: startOfDay(new Date(dto.start_date)),
      });
    }

    if (dto.end_date) {
      qb.andWhere('order.created_at <= :end_date', {
        end_date: endOfDay(new Date(dto.end_date)),
      });
    }

    const order = dto.order ?? 'ASC';
    qb.orderBy('order.created_at', order).skip(dto.skip).take(dto.take);

    const [data, itemCount] = await qb.getManyAndCount();

    const meta = new PageMetaDto({
      pageOptionsDto: dto,
      itemCount,
    });

    return new PageDto(data, meta);
  }
}
