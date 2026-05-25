import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { OrderRepository } from "./repositories/orders.repository";
import { AddressModule } from "@/address/address.module";
import { Address } from "@/address/entities/address.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Address]), AddressModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrderRepository],
})
export class OrdersModule {}
