import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { OrdersDocs } from './orders.docs';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @OrdersDocs.create()
  async create(@Body() createOrderDto: CreateOrderDto) {
    const data = await this.ordersService.create(createOrderDto);
    return { message: 'Order created successfully', data };
  }

  @Get()
  @OrdersDocs.findAll()
  async findAll(@Query() filterOrderDto: FilterOrderDto) {
    const data = await this.ordersService.findAll(filterOrderDto);
    return { message: 'Orders retrieved successfully', data };
  }

  @Get(':id')
  @OrdersDocs.findOne()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.ordersService.findOne(id);
    return { message: 'Order found', data };
  }

  @Patch(':id')
  @OrdersDocs.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    const data = await this.ordersService.update(id, updateOrderDto);
    return { message: 'Order updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @OrdersDocs.remove()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.ordersService.remove(id);
    return { message: `Order ${id} was successfully removed` };
  }
}
