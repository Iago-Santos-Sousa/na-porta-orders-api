import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length, Matches } from "class-validator";

export class CreateAddressDto {
  @ApiProperty({ example: "Rua das Flores" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 150)
  street!: string;

  @ApiProperty({ example: "123" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  number!: string;

  @ApiPropertyOptional({ example: "Apto 4" })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  complement?: string;

  @ApiProperty({ example: "Centro" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  neighborhood!: string;

  @ApiProperty({ example: "São Paulo" })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  city!: string;

  @ApiProperty({ example: "SP", minLength: 2, maxLength: 2 })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state!: string;

  @ApiProperty({ example: "01310-100" })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}-?\d{3}$/, { message: "zip_code must be a valid CEP" })
  zip_code!: string;
}
