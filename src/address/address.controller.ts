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
import { ApiTags } from '@nestjs/swagger';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { AddressDocs } from './address.docs';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../utils/enums';

@ApiTags('addresses')
@Controller('addresses')
@Roles(UserRole.ADMIN)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @AddressDocs.create()
  create(@Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(createAddressDto);
  }

  @Get()
  @AddressDocs.findAll()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.addressService.findAll(pageOptionsDto);
  }

  @Get(':id')
  @AddressDocs.findOne()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.findOne(id);
  }

  @Patch(':id')
  @AddressDocs.update()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressService.update(id, updateAddressDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @AddressDocs.remove()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.addressService.remove(id);
  }
}
