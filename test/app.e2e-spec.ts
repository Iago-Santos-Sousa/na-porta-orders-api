import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  createHttpTestApp,
  expectTypedBody,
  type HttpTestAppContext,
  resetHttpMocks,
} from "./http-test-app.helper";

describe("Status HTTP API (e2e)", () => {
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

  it("GET /api/status returns the API status payload", async () => {
    await request(context.httpServer)
      .get("/api/status")
      .expect(200)
      .expect(
        expectTypedBody<{ message: string; status: string; timestamp: string }>((body) => {
          expect(body.message).toBe("Hello World!");
          expect(body.status).toBe("OK");
          expect(typeof body.timestamp).toBe("string");
        }),
      );
  });
});
