import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { Address } from "../src/address/entities/address.entity";
import { PageDto } from "../src/common/dtos/page.dto";
import {
  addressServiceMock,
  createHttpTestApp,
  expectTypedBody,
  type HttpTestAppContext,
  resetHttpMocks,
  sampleAddress,
} from "./http-test-app.helper";

describe("Addresses HTTP API (e2e)", () => {
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

  it("Address endpoints validate path params and return mocked responses", async () => {
    await request(context.httpServer)
      .post("/api/addresses")
      .send({
        street: "Rua das Flores",
        number: "100",
        complement: "Apto 2",
        neighborhood: "Centro",
        city: "Sao Paulo",
        state: "SP",
        zip_code: "01310-100",
      })
      .expect(201)
      .expect(
        expectTypedBody<Address>((body) => {
          expect(body).toEqual(expect.objectContaining({ address_id: sampleAddress.address_id }));
        }),
      );

    await request(context.httpServer)
      .get("/api/addresses?page=1&take=10")
      .expect(200)
      .expect(
        expectTypedBody<PageDto<Address>>((body) => {
          expect(Array.isArray(body.data)).toBe(true);
          expect(body.meta.page).toBe(1);
          expect(body.meta.take).toBe(10);
        }),
      );

    expect(addressServiceMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, take: 10 }),
    );

    await request(context.httpServer).get("/api/addresses/not-a-uuid").expect(400);

    await request(context.httpServer)
      .get(`/api/addresses/${sampleAddress.address_id}`)
      .expect(200)
      .expect(
        expectTypedBody<Address>((body) => {
          expect(body).toEqual(expect.objectContaining({ address_id: sampleAddress.address_id }));
        }),
      );

    await request(context.httpServer)
      .patch(`/api/addresses/${sampleAddress.address_id}`)
      .send({ city: "Rio de Janeiro" })
      .expect(200);

    expect(addressServiceMock.update).toHaveBeenCalledWith(
      sampleAddress.address_id,
      expect.objectContaining({ city: "Rio de Janeiro" }),
    );

    await request(context.httpServer)
      .delete(`/api/addresses/${sampleAddress.address_id}`)
      .expect(204);
    expect(addressServiceMock.remove).toHaveBeenCalledWith(sampleAddress.address_id);
  });
});
