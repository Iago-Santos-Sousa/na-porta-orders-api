import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import type { Request, Response } from "express";
import { CurrentUser } from "./current-user.decorator";
import { CurrentUserDto } from "./current-user.dto";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/signin.dto";
import { Public } from "@/common/decorators/skipAuth.decorator";
import { AuthDocs } from "./auth.docs";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  @AuthDocs.signIn()
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("refresh-token")
  @AuthDocs.refreshToken()
  async refreshToken(@Req() req: Request) {
    const bodyRefreshToken = (req.body as { refresh_token?: string } | undefined)?.refresh_token;
    const refreshToken =
      (req.cookies as Record<string, string>)?.["refresh_token"] ?? bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token não encontrado");
    }

    const result = await this.authService.refreshToken(refreshToken);
    return result;
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthDocs.logout()
  async logout(@CurrentUser() user: CurrentUserDto): Promise<void> {
    await this.authService.logout(user.sub);
  }
}
