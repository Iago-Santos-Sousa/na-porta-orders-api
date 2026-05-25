import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
  @ApiProperty({ example: "jhon.doe@gmail.com" })
  @IsNotEmpty({ message: "Email cannot be empty" })
  @IsEmail({}, { message: "The provided email is not valid" })
  @Transform(({ value }: { value: string }) => value?.trim())
  email!: string;

  @ApiProperty({ example: "123456" })
  @IsNotEmpty()
  @IsString()
  @Length(6, 50, { message: "Password must be between 6 and 50 characters" })
  @Transform(({ value }: { value: string }) => value?.trim())
  password!: string;
}
