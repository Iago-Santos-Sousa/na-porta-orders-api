import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { PageDto } from "../src/common/dtos/page.dto";
import { Order } from "../src/orders/entities/order.entity";
import { OrderStatus } from "../src/utils/enums";
import {
  createHttpTestApp,
  currentUser,
  expectTypedBody,
  type HttpTestAppContext,
  mockForbidden,
  ordersServiceMock,
  resetHttpMocks,
  sampleAddress,
  sampleOrder,
  setCurrentUser,
} from "./http-test-app.helper";

describe("Orders HTTP API (e2e)", () => {
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

  it("Order endpoints validate query and path params and return mocked responses", async () => {
    await request(context.httpServer)
      .post("/api/orders")
      .send({
        customer_name: "Joao da Silva",
        customer_document: "123.456.789-00",
        estimated_delivery_date: "2026-06-15",
        delivery_address_id: sampleAddress.address_id,
        status: OrderStatus.PENDING,
        items: [{ description: "Produto A", price: 49.99 }],
      })
      .expect(201)
      .expect(
        expectTypedBody<Order>((body) => {
          expect(body).toEqual(expect.objectContaining({ order_id: sampleOrder.order_id }));
        }),
      );

    expect(ordersServiceMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer_name: "Joao da Silva", status: OrderStatus.PENDING }),
      currentUser,
    );

    await request(context.httpServer)
      .get("/api/orders?page=1&take=10&status=pending")
      .expect(200)
      .expect(
        expectTypedBody<PageDto<Order>>((body) => {
          expect(Array.isArray(body.data)).toBe(true);
          expect(body.meta.page).toBe(1);
          expect(body.meta.take).toBe(10);
        }),
      );

    expect(ordersServiceMock.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, take: 10, status: OrderStatus.PENDING }),
    );

    await request(context.httpServer).get("/api/orders/not-a-uuid").expect(400);

    await request(context.httpServer)
      .get(`/api/orders/${sampleOrder.order_id}`)
      .expect(200)
      .expect(
        expectTypedBody<Order>((body) => {
          expect(body).toEqual(expect.objectContaining({ order_id: sampleOrder.order_id }));
        }),
      );

    await request(context.httpServer)
      .patch(`/api/orders/${sampleOrder.order_id}`)
      .send({ status: OrderStatus.CONFIRMED })
      .expect(200);

    expect(ordersServiceMock.update).toHaveBeenCalledWith(
      sampleOrder.order_id,
      expect.objectContaining({ status: OrderStatus.CONFIRMED }),
      currentUser,
    );

    await request(context.httpServer).delete(`/api/orders/${sampleOrder.order_id}`).expect(204);
    expect(ordersServiceMock.remove).toHaveBeenCalledWith(sampleOrder.order_id, currentUser);
  });

  it("PATCH and DELETE /api/orders/:id return 403 when a user tries to manage another user's order", async () => {
    setCurrentUser({
      sub: 2,
      username: "Regular User",
      email: "regular.user@example.com",
      roles: ["user"],
      type: "access_token",
    });
    ordersServiceMock.update.mockRejectedValueOnce(mockForbidden());
    ordersServiceMock.remove.mockRejectedValueOnce(mockForbidden());

    await request(context.httpServer)
      .patch(`/api/orders/${sampleOrder.order_id}`)
      .send({ status: OrderStatus.CONFIRMED })
      .expect(403);

    expect(ordersServiceMock.update).toHaveBeenCalledWith(
      sampleOrder.order_id,
      expect.objectContaining({ status: OrderStatus.CONFIRMED }),
      currentUser,
    );

    await request(context.httpServer).delete(`/api/orders/${sampleOrder.order_id}`).expect(403);

    expect(ordersServiceMock.remove).toHaveBeenCalledWith(sampleOrder.order_id, currentUser);
  });
});
