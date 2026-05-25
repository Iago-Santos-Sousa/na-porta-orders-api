import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  Matches,
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
    example: '22/05/2026',
    description: 'Data inicial no formato DD/MM/YYYY (inclusive, 00:00:00)',
  })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'start_date must be in DD/MM/YYYY format (e.g. 22/05/2026)',
  })
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    example: '31/12/2026',
    description: 'Data final no formato DD/MM/YYYY (inclusive, 23:59:59)',
  })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'end_date must be in DD/MM/YYYY format (e.g. 31/12/2026)',
  })
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
