import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshTokenDto {
  @ApiPropertyOptional({
    example: "your refresh token",
    description: "Refresh token enviado no body quando o cookie nao estiver presente",
  })
  @IsOptional()
  @IsString()
  refresh_token?: string;
}
