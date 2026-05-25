import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from '../../utils/enums';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'Produto A' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  description!: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  customer_name!: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  customer_document!: string;

  @ApiProperty({ example: '2026-06-15' })
  @IsDateString()
  @IsNotEmpty()
  estimated_delivery_date!: string;

  @ApiProperty({ example: 'uuid-do-endereco' })
  @IsUUID()
  @IsNotEmpty()
  delivery_address_id!: string;

  @ApiPropertyOptional({ enum: OrderStatus, default: OrderStatus.PENDING })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
