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
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { AddressDocs } from './address.docs';

@ApiTags('address')
@ApiBearerAuth()
@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AddressDocs.create()
  async create(@Body() createAddressDto: CreateAddressDto) {
    const data = await this.addressService.create(createAddressDto);
    return { message: 'Address created successfully', data };
  }

  @Get()
  @AddressDocs.findAll()
  async findAll(@Query() pageOptionsDto: PageOptionsDto) {
    const data = await this.addressService.findAll(pageOptionsDto);
    return { message: 'Addresses retrieved successfully', data };
  }

  @Get(':id')
  @AddressDocs.findOne()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.addressService.findOne(id);
    return { message: 'Address found', data };
  }

  @Patch(':id')
  @AddressDocs.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    const data = await this.addressService.update(id, updateAddressDto);
    return { message: 'Address updated successfully', data };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @AddressDocs.remove()
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.addressService.remove(id);
    return { message: `Address ${id} was successfully removed` };
  }
}
