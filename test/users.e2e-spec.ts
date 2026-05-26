import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PageDto } from "../src/common/dtos/page.dto";
import { UserDto } from "../src/user/dto/user.dto";
import { UserRole } from "../src/utils/enums";
import {
  createHttpTestApp,
  expectTypedBody,
  type HttpTestAppContext,
  resetHttpMocks,
  sampleUser,
  userServiceMock,
} from "./http-test-app.helper";

describe("Users HTTP API (e2e)", () => {
  let app: INestApplication;
  let context: HttpTestAppContext;

  beforeAll(async () => {
    context = await createHttpTestApp();
    app = context.app;
  });

  beforeEach(() => {
    resetHttpMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it("POST /api/users creates a user", async () => {
    await request(context.httpServer)
      .post("/api/users")
      .send({
        name: "Novo Usuario",
        email: "novo.usuario@example.com",
        password: "Senha@123",
        role: UserRole.USER,
      })
      .expect(201)
      .expect(
        expectTypedBody<UserDto>((body) => {
          expect(body).toEqual(expect.objectContaining({ user_id: 1, email: sampleUser.email }));
        }),
      );

    expect(userServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Novo Usuario",
        email: "novo.usuario@example.com",
        password: "Senha@123",
        role: UserRole.USER,
      }),
    );
  });

  it("GET /api/users returns paginated users with transformed query params", async () => {
    await request(context.httpServer)
      .get("/api/users?page=1&take=10")
      .expect(200)
      .expect(
        expectTypedBody<PageDto<UserDto>>((body) => {
          expect(Array.isArray(body.data)).toBe(true);
          expect(body.meta.page).toBe(1);
          expect(body.meta.take).toBe(10);
        }),
      );

    expect(userServiceMock.findUsersPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, take: 10 }),
    );
  });

  it("GET /api/users/all returns all users", async () => {
    await request(context.httpServer)
      .get("/api/users/all")
      .expect(200)
      .expect(
        expectTypedBody<UserDto[]>((body) => {
          expect(body).toEqual(expect.arrayContaining([expect.objectContaining({ user_id: 1 })]));
        }),
      );

    expect(userServiceMock.findAll).toHaveBeenCalled();
  });

  it("GET /api/users/:id, PATCH /api/users/:id and DELETE /api/users/:id handle user endpoints", async () => {
    await request(context.httpServer)
      .get("/api/users/1")
      .expect(200)
      .expect(
        expectTypedBody<UserDto>((body) => {
          expect(body).toEqual(expect.objectContaining({ user_id: 1, email: sampleUser.email }));
        }),
      );

    await request(context.httpServer)
      .patch("/api/users/1")
      .send({ name: "Usuario Atualizado" })
      .expect(200)
      .expect(
        expectTypedBody<UserDto>((body) => {
          expect(body).toEqual(expect.objectContaining({ user_id: 1 }));
        }),
      );

    expect(userServiceMock.update).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: "Usuario Atualizado" }),
    );

    await request(context.httpServer).delete("/api/users/1").expect(204);
    expect(userServiceMock.remove).toHaveBeenCalledWith(1);
  });
});
