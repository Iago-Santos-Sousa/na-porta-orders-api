import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { SignInResponseDto } from "../src/auth/dto/signin-response.dto";
import {
  authResponse,
  authServiceMock,
  createHttpTestApp,
  currentUser,
  expectTypedBody,
  type HttpTestAppContext,
  resetHttpMocks,
} from "./http-test-app.helper";

describe("Auth HTTP API (e2e)", () => {
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

  it("POST /api/auth/login validates input and returns tokens", async () => {
    await request(context.httpServer)
      .post("/api/auth/login")
      .send({ email: "invalid-email", password: "123456" })
      .expect(400);

    await request(context.httpServer)
      .post("/api/auth/login")
      .send({ email: "admin@na-porta.local", password: "Admin@123456" })
      .expect(200)
      .expect(expectTypedBody<SignInResponseDto>((body) => expect(body).toEqual(authResponse)));

    expect(authServiceMock.signIn).toHaveBeenCalledWith("admin@na-porta.local", "Admin@123456");
  });

  it("POST /api/auth/refresh-token requires a token and returns a refreshed session", async () => {
    await request(context.httpServer).post("/api/auth/refresh-token").send({}).expect(401);

    await request(context.httpServer)
      .post("/api/auth/refresh-token")
      .send({ refresh_token: "refresh-token" })
      .expect(200)
      .expect(expectTypedBody<SignInResponseDto>((body) => expect(body).toEqual(authResponse)));

    expect(authServiceMock.refreshToken).toHaveBeenCalledWith("refresh-token");
  });

  it("POST /api/auth/logout returns 204", async () => {
    await request(context.httpServer).post("/api/auth/logout").expect(204);

    expect(authServiceMock.logout).toHaveBeenCalledWith(currentUser.sub);
  });
});
