import {
  IsEmail,
  IsNotEmpty,
  IsString,
  // Length,
  MinLength,
  MaxLength,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { UserRole } from "@/utils/enums";

export class CreateUserDto {
  @ApiProperty({ description: "Username", example: "Jhon Doe" })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Transform(({ value }: { value: string }) => value?.trim())
  name!: string;

  @ApiProperty({ description: "User E-mail", example: "jhon.doe@gmail.com" })
  @IsNotEmpty({ message: "Email não pode estar vazio." })
  @IsEmail({}, { message: "O email fornecido não é válido." })
  @Transform(({ value }: { value: string }) => value?.trim())
  email!: string;

  @ApiProperty({ description: "user password", example: "123456" })
  @IsNotEmpty({ message: "Senha não pode estar vazia." })
  @IsString({ message: "Senha deve ser uma string." })
  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres." })
  @MaxLength(50, { message: "Senha deve ter no máximo 50 caracteres." })
  @Transform(({ value }: { value: string }) => value?.trim())
  password!: string;
  @ApiProperty({
    description: "Permissão do usuário",
    type: "string",
    example: "user",
    default: "user",
  })
  @IsNotEmpty({ message: "Role não pode estar vazio." })
  @IsEnum(UserRole, { message: "Role deve ser user ou admin." })
  role!: UserRole;
}
