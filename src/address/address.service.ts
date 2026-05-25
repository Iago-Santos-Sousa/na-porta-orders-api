import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAddressDto } from "./dto/create-address.dto";
import { UpdateAddressDto } from "./dto/update-address.dto";
import { AddressRepository } from "./repositories/address.repository";
import { PageOptionsDto } from "@/common/dtos/page-options.dto";
import { PageMetaDto } from "@/common/dtos/page-meta.dto";
import { PageDto } from "@/common/dtos/page.dto";
import { Address } from "./entities/address.entity";

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const address = this.addressRepository.create(createAddressDto);
    return this.addressRepository.save(address);
  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Address>> {
    const [data, itemCount] = await this.addressRepository.findAndCount({
      order: { created_at: pageOptionsDto.order },
      skip: pageOptionsDto.skip,
      take: pageOptionsDto.take,
    });

    const meta = new PageMetaDto(pageOptionsDto, itemCount);
    return new PageDto(data, meta);
  }

  async findOne(address_id: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { address_id },
    });

    if (!address) {
      throw new NotFoundException(`Address ${address_id} not found`);
    }

    return address;
  }

  async update(address_id: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    await this.findOne(address_id);
    await this.addressRepository.update({ address_id }, updateAddressDto);
    return this.findOne(address_id);
  }

  async remove(address_id: string): Promise<void> {
    await this.findOne(address_id);
    await this.addressRepository.delete({ address_id });
  }
}
