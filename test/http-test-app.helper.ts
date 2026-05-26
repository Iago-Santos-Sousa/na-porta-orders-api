import {
  ForbiddenException,
  CanActivate,
  ClassSerializerInterceptor,
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { Test, TestingModule } from "@nestjs/testing";
import type { Server } from "http";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { AddressController } from "../src/address/address.controller";
import { AddressService } from "../src/address/address.service";
import { Address } from "../src/address/entities/address.entity";
import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { CurrentUserDto } from "../src/auth/dto/current-user.dto";
import { SignInResponseDto } from "../src/auth/dto/signin-response.dto";
import { PageDto } from "../src/common/dtos/page.dto";
import { PageMetaDto } from "../src/common/dtos/page-meta.dto";
import { OrdersController } from "../src/orders/orders.controller";
import { OrdersService } from "../src/orders/orders.service";
import { Order } from "../src/orders/entities/order.entity";
import { UserController } from "../src/user/user.controller";
import { UserService } from "../src/user/user.service";
import { UserResponseDto, UsersResponseDto } from "../src/user/dto/user-response.dto";
import { UserDto } from "../src/user/dto/user.dto";
import { OrderStatus, UserRole } from "../src/utils/enums";

export interface HttpTestAppContext {
  app: INestApplication;
  httpServer: Server;
}

const DEFAULT_CURRENT_USER: CurrentUserDto = {
  sub: 1,
  username: "Admin User",
  email: "jhon.doe@gmail.com",
  roles: [UserRole.ADMIN],
  type: "access_token",
};

export const currentUser: CurrentUserDto = {
  ...DEFAULT_CURRENT_USER,
  roles: [...DEFAULT_CURRENT_USER.roles],
};

export function setCurrentUser(nextUser: CurrentUserDto): void {
  currentUser.sub = nextUser.sub;
  currentUser.username = nextUser.username;
  currentUser.email = nextUser.email;
  currentUser.roles = [...nextUser.roles];
  currentUser.type = nextUser.type;
}

function resetCurrentUser(): void {
  setCurrentUser(DEFAULT_CURRENT_USER);
}

class TestAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: CurrentUserDto }>();
    request.user = currentUser;
    return true;
  }
}

export type AuthServiceMock = {
  signIn: jest.MockedFunction<AuthService["signIn"]>;
  refreshToken: jest.MockedFunction<AuthService["refreshToken"]>;
  logout: jest.MockedFunction<AuthService["logout"]>;
};

export type UserServiceMock = {
  create: jest.MockedFunction<UserService["create"]>;
  findUsersPaginated: jest.MockedFunction<UserService["findUsersPaginated"]>;
  findAll: jest.MockedFunction<UserService["findAll"]>;
  findOne: jest.MockedFunction<UserService["findOne"]>;
  update: jest.MockedFunction<UserService["update"]>;
  remove: jest.MockedFunction<UserService["remove"]>;
};

export type AddressServiceMock = {
  create: jest.MockedFunction<AddressService["create"]>;
  findAll: jest.MockedFunction<AddressService["findAll"]>;
  findOne: jest.MockedFunction<AddressService["findOne"]>;
  update: jest.MockedFunction<AddressService["update"]>;
  remove: jest.MockedFunction<AddressService["remove"]>;
};

export type OrdersServiceMock = {
  create: jest.MockedFunction<OrdersService["create"]>;
  findAll: jest.MockedFunction<OrdersService["findAll"]>;
  findOne: jest.MockedFunction<OrdersService["findOne"]>;
  update: jest.MockedFunction<OrdersService["update"]>;
  remove: jest.MockedFunction<OrdersService["remove"]>;
};

export const authServiceMock: AuthServiceMock = {
  signIn: jest.fn() as jest.MockedFunction<AuthService["signIn"]>,
  refreshToken: jest.fn() as jest.MockedFunction<AuthService["refreshToken"]>,
  logout: jest.fn() as jest.MockedFunction<AuthService["logout"]>,
};

export const userServiceMock: UserServiceMock = {
  create: jest.fn() as jest.MockedFunction<UserService["create"]>,
  findUsersPaginated: jest.fn() as jest.MockedFunction<UserService["findUsersPaginated"]>,
  findAll: jest.fn() as jest.MockedFunction<UserService["findAll"]>,
  findOne: jest.fn() as jest.MockedFunction<UserService["findOne"]>,
  update: jest.fn() as jest.MockedFunction<UserService["update"]>,
  remove: jest.fn() as jest.MockedFunction<UserService["remove"]>,
};

export const addressServiceMock: AddressServiceMock = {
  create: jest.fn() as jest.MockedFunction<AddressService["create"]>,
  findAll: jest.fn() as jest.MockedFunction<AddressService["findAll"]>,
  findOne: jest.fn() as jest.MockedFunction<AddressService["findOne"]>,
  update: jest.fn() as jest.MockedFunction<AddressService["update"]>,
  remove: jest.fn() as jest.MockedFunction<AddressService["remove"]>,
};

export const ordersServiceMock: OrdersServiceMock = {
  create: jest.fn() as jest.MockedFunction<OrdersService["create"]>,
  findAll: jest.fn() as jest.MockedFunction<OrdersService["findAll"]>,
  findOne: jest.fn() as jest.MockedFunction<OrdersService["findOne"]>,
  update: jest.fn() as jest.MockedFunction<OrdersService["update"]>,
  remove: jest.fn() as jest.MockedFunction<OrdersService["remove"]>,
};

export const sampleUser = {
  user_id: 1,
  name: "Admin User",
  email: "jhon.doe@gmail.com",
  role: UserRole.ADMIN,
  created_at: new Date("2026-05-25T00:00:00.000Z"),
  updated_at: new Date("2026-05-25T00:00:00.000Z"),
};

export const sampleAddress = Object.assign(new Address(), {
  address_id: "11111111-1111-4111-8111-111111111111",
  street: "Rua das Flores",
  number: "100",
  complement: "Apto 2",
  neighborhood: "Centro",
  city: "Sao Paulo",
  state: "SP",
  zip_code: "01310-100",
  created_at: new Date("2026-05-25T00:00:00.000Z"),
  updated_at: new Date("2026-05-25T00:00:00.000Z"),
});

export const sampleOrder = {
  order_id: "22222222-2222-4222-8222-222222222222",
  order_number: 123,
  customer_name: "Joao da Silva",
  customer_document: "123.456.789-00",
  estimated_delivery_date: "2026-06-15",
  status: OrderStatus.PENDING,
  delivery_address: sampleAddress,
  delivery_address_id: sampleAddress.address_id,
  created_by_user_id: currentUser.sub,
  items: [
    {
      order_item_id: "33333333-3333-3333-3333-333333333333",
      description: "Produto A",
      price: 49.99,
      created_at: new Date("2026-05-25T00:00:00.000Z"),
      updated_at: new Date("2026-05-25T00:00:00.000Z"),
    },
  ],
  created_at: new Date("2026-05-25T00:00:00.000Z"),
  updated_at: new Date("2026-05-25T00:00:00.000Z"),
} as Order;

export const authResponse: SignInResponseDto = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  payload: {
    sub: currentUser.sub,
    username: currentUser.username,
    email: currentUser.email,
    roles: currentUser.roles,
  },
};

export function createPageDto<T>(data: T[]): PageDto<T> {
  const meta = new PageMetaDto({ page: 1, take: 10, skip: 0 }, data.length);
  return new PageDto(data, meta);
}

export function expectTypedBody<T>(
  assertion: (body: T) => void,
): (response: { body: unknown }) => void {
  return (response: { body: unknown }) => {
    assertion(response.body as T);
  };
}

export function resetHttpMocks(): void {
  jest.clearAllMocks();
  resetCurrentUser();

  authServiceMock.signIn.mockResolvedValue(authResponse);
  authServiceMock.refreshToken.mockResolvedValue(authResponse);
  authServiceMock.logout.mockResolvedValue(undefined);

  userServiceMock.create.mockResolvedValue(new UserResponseDto(sampleUser));
  userServiceMock.findUsersPaginated.mockResolvedValue(createPageDto([new UserDto(sampleUser)]));
  userServiceMock.findAll.mockResolvedValue(new UsersResponseDto([sampleUser]));
  userServiceMock.findOne.mockResolvedValue(new UserResponseDto(sampleUser));
  userServiceMock.update.mockResolvedValue(new UserResponseDto(sampleUser));
  userServiceMock.remove.mockResolvedValue(undefined);

  addressServiceMock.create.mockResolvedValue(sampleAddress);
  addressServiceMock.findAll.mockResolvedValue(createPageDto([sampleAddress]));
  addressServiceMock.findOne.mockResolvedValue(sampleAddress);
  addressServiceMock.update.mockResolvedValue(sampleAddress);
  addressServiceMock.remove.mockResolvedValue(undefined);

  ordersServiceMock.create.mockResolvedValue(sampleOrder);
  ordersServiceMock.findAll.mockResolvedValue(createPageDto([sampleOrder]));
  ordersServiceMock.findOne.mockResolvedValue(sampleOrder);
  ordersServiceMock.update.mockResolvedValue(sampleOrder);
  ordersServiceMock.remove.mockResolvedValue(undefined);
}

export function mockForbidden(): ForbiddenException {
  return new ForbiddenException("Permissões insuficientes para acessar este recurso.");
}

export async function createHttpTestApp(): Promise<HttpTestAppContext> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    controllers: [
      AppController,
      AuthController,
      UserController,
      AddressController,
      OrdersController,
    ],
    providers: [
      AppService,
      { provide: AuthService, useValue: authServiceMock },
      { provide: UserService, useValue: userServiceMock },
      { provide: AddressService, useValue: addressServiceMock },
      { provide: OrdersService, useValue: ordersServiceMock },
      { provide: APP_GUARD, useClass: TestAuthGuard },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.init();

  return {
    app,
    httpServer: app.getHttpServer() as Server,
  };
}
