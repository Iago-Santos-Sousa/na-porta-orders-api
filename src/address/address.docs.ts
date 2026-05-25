import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from "@nestjs/swagger";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";

export const AddressDocs = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: "Criar um novo endereço" }),
      ApiBody({ type: CreateAddressDto }),
      ApiCreatedResponse({ description: "Endereço criado com sucesso" }),
    ),

  findAll: () =>
    applyDecorators(
      ApiOperation({ summary: "Listar endereços com paginação" }),
      ApiOkResponse({ description: "Lista paginada de endereços" }),
    ),

  findOne: () =>
    applyDecorators(
      ApiOperation({ summary: "Buscar endereço por ID" }),
      ApiParam({ name: "id", description: "UUID do endereço" }),
      ApiOkResponse({ description: "Endereço encontrado" }),
      ApiNotFoundResponse({ description: "Endereço não encontrado" }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: "Atualizar endereço" }),
      ApiParam({ name: "id", description: "UUID do endereço" }),
      ApiBody({ type: UpdateAddressDto }),
      ApiOkResponse({ description: "Endereço atualizado com sucesso" }),
      ApiNotFoundResponse({ description: "Endereço não encontrado" }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: "Excluir endereço" }),
      ApiParam({ name: "id", description: "UUID do endereço" }),
      ApiNoContentResponse({ description: "Endereço excluído com sucesso" }),
      ApiNotFoundResponse({ description: "Endereço não encontrado" }),
    ),
};
