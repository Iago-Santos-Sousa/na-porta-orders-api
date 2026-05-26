import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshTokenDto {
  @ApiPropertyOptional({
    example: "Seu refresh token aqui",
    description: "Refresh token enviado no body.",
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}
