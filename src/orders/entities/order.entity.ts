import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { ApiHideProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { Address } from "@/address/entities/address.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "@/utils/enums";
import { User } from "@/user/entities/user.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn("uuid", { name: "order_id" })
  order_id!: string;

  @Column({ name: "order_number", type: "int", unique: true })
  @Generated("increment")
  order_number!: number;

  @Column("varchar", { name: "customer_name", length: 150 })
  customer_name!: string;

  @Column("varchar", { name: "customer_document", length: 20 })
  customer_document!: string;

  @Column({
    name: "estimated_delivery_date",
    type: "date",
  })
  estimated_delivery_date!: string;

  @Column({
    name: "status",
    type: "enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @ManyToOne(() => Address, { eager: true, nullable: false })
  @JoinColumn({ name: "delivery_address_id" })
  delivery_address!: Address;

  @Column({ name: "delivery_address_id" })
  delivery_address_id!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "created_by_user_id" })
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  created_by_user!: User;

  @Column({ name: "created_by_user_id", type: "int" })
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  created_by_user_id!: number;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
  })
  created_at!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at!: Date;

  @DeleteDateColumn({ name: "deleted_at", type: "timestamp", nullable: true })
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  deleted_at?: Date;
}
