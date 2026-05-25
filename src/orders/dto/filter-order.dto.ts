import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PageOptionsDto } from '../../common/dtos/page-options.dto';
import { OrderStatus } from '../../utils/enums';

export class FilterOrderDto extends PageOptionsDto {
  @ApiPropertyOptional({ example: 10, description: 'Número do pedido' })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  order_number?: number;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Data inicial (inclusive, 00:00:00)',
  })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Data final (inclusive, 23:59:59)',
  })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
