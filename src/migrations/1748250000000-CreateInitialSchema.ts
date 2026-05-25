import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1748250000000 implements MigrationInterface {
  name = "CreateInitialSchema1748250000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'orders_status_enum') THEN
          CREATE TYPE "public"."orders_status_enum" AS ENUM(
            'pending',
            'confirmed',
            'in_transit',
            'delivered',
            'cancelled'
          );
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "user_id" SERIAL NOT NULL,
        "name" character varying(150) NOT NULL,
        "email" character varying(100) NOT NULL,
        "password" character varying(150) NOT NULL,
        "role" character varying(20) NOT NULL,
        "refresh_token" character varying(255),
        "reset_token" character varying(255),
        "reset_token_expiry" bigint,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        CONSTRAINT "PK_user_user_id" PRIMARY KEY ("user_id"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "UQ_user_reset_token" UNIQUE ("reset_token")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "address" (
        "address_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "street" character varying(150) NOT NULL,
        "number" character varying(20) NOT NULL,
        "complement" character varying(100),
        "neighborhood" character varying(100) NOT NULL,
        "city" character varying(100) NOT NULL,
        "state" character varying(2) NOT NULL,
        "zip_code" character varying(10) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_address_address_id" PRIMARY KEY ("address_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "order_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "order_number" SERIAL NOT NULL,
        "customer_name" character varying(150) NOT NULL,
        "customer_document" character varying(20) NOT NULL,
        "estimated_delivery_date" date NOT NULL,
        "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending',
        "delivery_address_id" uuid NOT NULL,
        "created_by_user_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_orders_order_id" PRIMARY KEY ("order_id"),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "FK_orders_delivery_address" FOREIGN KEY ("delivery_address_id") REFERENCES "address"("address_id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_orders_created_by_user" FOREIGN KEY ("created_by_user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "order_item_id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "description" character varying(255) NOT NULL,
        "price" numeric(10, 2) NOT NULL,
        "order_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_order_items_order_item_id" PRIMARY KEY ("order_item_id"),
        CONSTRAINT "FK_order_items_order" FOREIGN KEY ("order_id") REFERENCES "orders"("order_id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "address"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."orders_status_enum"`);
  }
}
