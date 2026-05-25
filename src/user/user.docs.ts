import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

export const UserDocs = {
  create: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Criar um novo usuário', security: [] }),
      ApiBody({ type: CreateUserDto }),
      ApiCreatedResponse({
        description: 'Usuário criado com sucesso',
        type: UsersDto,
      }),
    ),

  findAll: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Listar usuários com paginação' }),
      ApiOkResponse({ description: 'Lista paginada de usuários' }),
    ),

  findAllRaw: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Listar todos os usuários' }),
      ApiOkResponse({
        description: 'Lista completa de usuários',
        type: UsersDto,
        isArray: true,
      }),
    ),

  findOne: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Buscar usuário por ID' }),
      ApiParam({ name: 'id', type: Number, description: 'ID do usuário' }),
      ApiOkResponse({ description: 'Usuário encontrado', type: UsersDto }),
      ApiNotFoundResponse({ description: 'Usuário não encontrado' }),
    ),

  update: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Atualizar usuário' }),
      ApiParam({ name: 'id', type: Number, description: 'ID do usuário' }),
      ApiBody({ type: UpdateUserDto }),
      ApiOkResponse({
        description: 'Usuário atualizado com sucesso',
        type: UsersDto,
      }),
      ApiNotFoundResponse({ description: 'Usuário não encontrado' }),
    ),

  remove: (): ReturnType<typeof applyDecorators> =>
    applyDecorators(
      ApiOperation({ summary: 'Excluir usuário' }),
      ApiParam({ name: 'id', type: Number, description: 'ID do usuário' }),
      ApiNoContentResponse({ description: 'Usuário excluído com sucesso' }),
      ApiNotFoundResponse({ description: 'Usuário não encontrado' }),
    ),
};
