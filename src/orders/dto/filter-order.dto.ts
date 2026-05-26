import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsPositive, Matches } from "class-validator";
import { PageOptionsDto } from "@/common/dtos/page-options.dto";
import { API_DATE_REGEX } from "@/common/utils/api-date.util";
import { OrderStatus } from "@/utils/enums";

export class FilterOrderDto extends PageOptionsDto {
  @ApiPropertyOptional({ example: 10, description: "Número do pedido" })
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  order_number?: number;

  @ApiPropertyOptional({
    example: "22/05/2026",
    description: "Data inicial",
  })
  @Matches(API_DATE_REGEX, {
    message: "start_date must use the format DD/MM/YYYY",
  })
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({
    example: "24/05/2026",
    description: "Data final",
  })
  @Matches(API_DATE_REGEX, {
    message: "end_date must use the format DD/MM/YYYY",
  })
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
