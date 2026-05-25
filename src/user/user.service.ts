/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto, UsersResponseDto } from './dto/user-response.dto';
import { PageDto } from '../common/dtos/page.dto';
import type { PageMetaDto } from '../common/dtos/page-meta.dto';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { UserDto } from './dto/user.dto';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { UserRepository } from './repositories/user.repository';
import { Order as SortOrder } from '../common/constants/order.constant';
const scrypt = promisify(_scrypt);

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const existUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existUser) {
        throw new HttpException('Email already exists', HttpStatus.CONFLICT);
      }

      const salt = randomBytes(8).toString('hex'); // unique salt per registration
      const hashPassword = (await scrypt(
        createUserDto.password,
        salt,
        32,
      )) as Buffer;

      const saltAndHashPassword = `${salt}.${hashPassword.toString('hex')}`;
      const createdUser = this.userRepository.create({
        ...createUserDto,
        password: saltAndHashPassword,
      });

      const savedUser = await this.userRepository.save(createdUser);

      return new UserResponseDto(savedUser);
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw error;
    }
  }

  async findAll(): Promise<UsersResponseDto> {
    const users = await this.userRepository.find();
    return new UsersResponseDto(users);
  }

  async findOne(user_id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id },
    });

    if (!user) throw new NotFoundException(`User with ID ${user_id} not found`);

    const {
      password,
      refresh_token,
      reset_token,
      reset_token_expiry,
      ...safeUser
    } = user;

    const userDto = new UserDto(safeUser);

    return {
      message: 'User found',
      user: userDto,
    };
  }

  async findById(user_id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { user_id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(
    user_id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }

    const mergedUser = this.userRepository.merge(user, updateUserDto);
    const updatedUser = await this.userRepository.save(mergedUser);

    const { password, refresh_token, ...safeUser } = updatedUser;
    return {
      user: safeUser,
    };
  }

  async remove(user_id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    await this.userRepository.delete(user_id);
  }

  async findUsersPaginated(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    const rawOrder = (pageOptionsDto as { order?: unknown }).order;

    const page = Number(pageOptionsDto.page);
    const take = Number(pageOptionsDto.take);
    const order: 'ASC' | 'DESC' = rawOrder === SortOrder.DESC ? 'DESC' : 'ASC';
    const skip = (page - 1) * take;

    queryBuilder.skip(skip).take(take).orderBy('user.user_id', order);

    const entities = await queryBuilder.getMany();
    const itemCount = await queryBuilder.getCount();
    const pageCount = Math.ceil(itemCount / take);
    const pageMetaDto: PageMetaDto = {
      page,
      take,
      itemCount,
      pageCount,
      hasPreviousPage: page > 1,
      hasNextPage: page < pageCount,
    };

    return new PageDto(
      entities.map((user) => new UserDto(user)),
      pageMetaDto,
    );
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    await this.userRepository.update(userId, {
      refresh_token: refreshToken,
    });
  }

  async logout(user_id: number): Promise<void> {
    await this.userRepository.update(user_id, {
      refresh_token: '',
    });
  }
}
