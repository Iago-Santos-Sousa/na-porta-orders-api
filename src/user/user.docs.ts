import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';

export const UserDocs = {
  create: () =>
    applyDecorators(
      ApiOperation({ summary: 'Create a user', security: [] }),
      ApiCreatedResponse({
        description: 'The record has been successfully created.',
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User created successfully',
            },
            data: {
              type: 'object',
              $ref: getSchemaPath(CreateUserDto),
            },
          },
        },
      }),
    ),

  getAll: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get all users' }),
      ApiExtraModels(UsersDto),
      ApiOkResponse({
        schema: {
          allOf: [
            {
              properties: {
                message: {
                  type: 'string',
                  example: 'Users retrieved successfully',
                },
                data: {
                  type: 'array',
                  items: { $ref: getSchemaPath(UsersDto) },
                },
              },
            },
          ],
        },
      }),
    ),

  getById: () =>
    applyDecorators(
      ApiOperation({ summary: 'Get a user' }),
      ApiOkResponse({
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User found',
            },
            data: {
              type: 'object',
              $ref: getSchemaPath(UsersDto),
            },
          },
        },
      }),
    ),

  update: () =>
    applyDecorators(
      ApiOperation({ summary: 'Update a user' }),
      ApiParam({
        name: 'id',
        type: Number,
        description: 'User ID',
      }),
      ApiBody({
        type: UpdateUserDto,
      }),
      ApiOkResponse({
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'User updated successfully',
            },
            data: {
              type: 'object',
              $ref: getSchemaPath(UsersDto),
            },
          },
        },
      }),
    ),

  remove: () =>
    applyDecorators(
      ApiOperation({ summary: 'Remove a user' }),
      ApiOkResponse({
        description: 'User was successfully removed',
        example: { message: 'User with ID 5 was successfully removed' },
      }),
    ),
};
