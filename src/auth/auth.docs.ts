import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignInDto } from './dto/signin.dto';
import { SignInResponseDto } from './dto/signin-response.dto';

export const AuthDocs = {
  signIn: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Autenticar usuário', security: [] }),
      ApiBody({ type: SignInDto }),
      ApiOkResponse({
        description: 'Tokens de autenticação gerados com sucesso',
        type: SignInResponseDto,
      }),
    ),

  refreshToken: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({
        summary: 'Renovar tokens da sessão',
        security: [],
      }),
      ApiBody({ type: RefreshTokenDto }),
      ApiOkResponse({
        description: 'Tokens renovados com sucesso',
        type: SignInResponseDto,
      }),
    ),

  logout: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Encerrar sessão do usuário autenticado' }),
      ApiNoContentResponse({ description: 'Sessão encerrada com sucesso' }),
    ),
};
