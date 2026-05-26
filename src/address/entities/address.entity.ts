import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("address")
export class Address {
  @PrimaryGeneratedColumn("uuid", { name: "address_id" })
  address_id!: string;

  @Column("varchar", { name: "street", length: 150 })
  street!: string;

  @Column("varchar", { name: "number", length: 20 })
  number!: string;

  @Column("varchar", { name: "complement", length: 100, nullable: true })
  complement?: string;

  @Column("varchar", { name: "neighborhood", length: 100 })
  neighborhood!: string;

  @Column("varchar", { name: "city", length: 100 })
  city!: string;

  @Column("varchar", { name: "state", length: 2 })
  state!: string;

  @Column("varchar", { name: "zip_code", length: 10 })
  zip_code!: string;

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
}
