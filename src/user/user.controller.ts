import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public } from "@/common/decorators/skipAuth.decorator";
import { Roles } from "@/common/decorators/roles.decorator";
import { UserRole } from "@/utils/enums";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";
import { UserDto } from "./dto/user.dto";
import { PageDto } from "@/common/dtos/page.dto";
import { PageOptionsDto } from "@/common/dtos/page-options.dto";
import { UserDocs } from "./user.docs";

@ApiTags("users")
@Controller("users")
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post()
  @HttpCode(201)
  @UserDocs.create()
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.userService.create(createUserDto);
    return data.user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @Roles(UserRole.ADMIN)
  @ApiPaginatedResponse(UserDto)
  @UserDocs.findAll()
  async findUsersPaginated(@Query() pageOptionsDto: PageOptionsDto): Promise<PageDto<UserDto>> {
    return this.userService.findUsersPaginated(pageOptionsDto);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Roles(UserRole.ADMIN)
  @Get("all")
  @UserDocs.findAllRaw()
  async findAll() {
    const data = await this.userService.findAll();
    return data.users;
  }

  @Get(":id")
  @UserDocs.findOne()
  async findOne(@Param("id", ParseIntPipe) id: number) {
    const data = await this.userService.findOne(id);
    return data.user;
  }

  @Patch(":id")
  @HttpCode(200)
  @UserDocs.update()
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const data = await this.userService.update(id, updateUserDto);
    return data.user;
  }

  @Roles(UserRole.ADMIN)
  @Delete(":id")
  @HttpCode(204)
  @UserDocs.remove()
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
