import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from '../utils/enums';

export const OrdersDocs = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Criar um novo pedido' }),
      ApiBody({ type: CreateOrderDto }),
      ApiCreatedResponse({ description: 'Pedido criado com sucesso' }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({
        summary: 'Listar pedidos com paginação e filtros',
        description:
          'Filtra por número do pedido, período (data inicial/final) e status.',
      }),
      ApiQuery({ name: 'order_number', required: false, type: Number }),
      ApiQuery({
        name: 'start_date',
        required: false,
        type: String,
        example: '22/05/2026',
      }),
      ApiQuery({
        name: 'end_date',
        required: false,
        type: String,
        example: '24/05/2026',
      }),
      ApiQuery({ name: 'status', required: false, enum: OrderStatus }),
      ApiQuery({ name: 'page', required: false, type: Number }),
      ApiQuery({ name: 'take', required: false, type: Number }),
      ApiOkResponse({ description: 'Lista paginada de pedidos' }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: 'Buscar pedido por ID' }),
      ApiParam({ name: 'id', description: 'UUID do pedido' }),
      ApiOkResponse({ description: 'Pedido encontrado' }),
      ApiNotFoundResponse({ description: 'Pedido não encontrado' }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Atualizar pedido' }),
      ApiParam({ name: 'id', description: 'UUID do pedido' }),
      ApiBody({ type: UpdateOrderDto }),
      ApiOkResponse({ description: 'Pedido atualizado com sucesso' }),
      ApiNotFoundResponse({ description: 'Pedido não encontrado' }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Excluir pedido (soft delete)' }),
      ApiParam({ name: 'id', description: 'UUID do pedido' }),
      ApiNoContentResponse({ description: 'Pedido excluído com sucesso' }),
      ApiNotFoundResponse({ description: 'Pedido não encontrado' }),
    ),
};
