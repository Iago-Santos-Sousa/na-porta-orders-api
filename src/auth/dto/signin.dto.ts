import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
  @ApiProperty({ example: "jhon.doe@gmail.com" })
  @IsNotEmpty({ message: "Email não pode estar vazio." })
  @IsEmail({}, { message: "O email fornecido não é válido." })
  @Transform(({ value }: { value: string }) => value?.trim())
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsNotEmpty({ message: "Senha não pode estar vazia." })
  @IsString({ message: "Senha deve ser uma string." })
  @Length(6, 50, { message: "Senha deve ter entre 6 e 50 caracteres." })
  @Transform(({ value }: { value: string }) => value?.trim())
  password!: string;
}
