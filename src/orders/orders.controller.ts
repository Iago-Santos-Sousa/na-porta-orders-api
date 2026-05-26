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
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { FilterOrderDto } from "./dto/filter-order.dto";
import { OrdersDocs } from "./orders.docs";
import { CurrentUser } from "@/auth/current-user.decorator";
import { CurrentUserDto } from "@/auth/dto/current-user.dto";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @OrdersDocs.create()
  create(@Body() createOrderDto: CreateOrderDto, @CurrentUser() currentUser: CurrentUserDto) {
    return this.ordersService.create(createOrderDto, currentUser);
  }

  @Get()
  @OrdersDocs.findAll()
  findAll(@Query() filterOrderDto: FilterOrderDto) {
    return this.ordersService.findAll(filterOrderDto);
  }

  @Get(":id")
  @OrdersDocs.findOne()
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(":id")
  @OrdersDocs.update()
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @CurrentUser() currentUser: CurrentUserDto,
  ) {
    return this.ordersService.update(id, updateOrderDto, currentUser);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @OrdersDocs.remove()
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
