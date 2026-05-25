import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentUser } from './current-user.decorator';
import { CurrentUserDto } from './current-user.dto';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { IS_PUBLIC_KEY } from '@/common/decorators/skipAuth.decorator';
import { AuthDocs } from './auth.docs';

const ACCESS_TOKEN_COOKIE_MS = 20 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_MS = 7 * 24 * 60 * 60 * 1000;

const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SetMetadata(IS_PUBLIC_KEY, true)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @AuthDocs.signIn()
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    res.cookie('access_token', result.access_token, {
      ...COOKIE_BASE,
      maxAge: ACCESS_TOKEN_COOKIE_MS,
    });

    res.cookie('refresh_token', result.refresh_token, {
      ...COOKIE_BASE,
      maxAge: REFRESH_TOKEN_COOKIE_MS,
    });

    return result;
  }

  @SetMetadata(IS_PUBLIC_KEY, true)
  @HttpCode(HttpStatus.OK)
  @Post('refresh-token')
  @AuthDocs.refreshToken()
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const bodyRefreshToken = (
      req.body as { refresh_token?: string } | undefined
    )?.refresh_token;
    const refreshToken =
      (req.cookies as Record<string, string>)?.['refresh_token'] ??
      bodyRefreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    const result = await this.authService.refreshToken(refreshToken);

    res.cookie('access_token', result.access_token, {
      ...COOKIE_BASE,
      maxAge: ACCESS_TOKEN_COOKIE_MS,
    });

    res.cookie('refresh_token', result.refresh_token, {
      ...COOKIE_BASE,
      maxAge: REFRESH_TOKEN_COOKIE_MS,
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AuthDocs.logout()
  async logout(
    @CurrentUser() user: CurrentUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(user.sub);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
