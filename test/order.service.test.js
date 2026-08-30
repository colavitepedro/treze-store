import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createOrderRepository } from "../src/repositories/order.repository.js";
import { OrderService } from "../src/services/order.service.js";

const cart = {
  id: "cart-test",
  items: [
    {
      productId: "benchy",
      name: "Mini Barco Benchy",
      price: 29.9,
      quantity: 2,
      lineTotal: 59.8,
    },
  ],
  itemCount: 2,
  subtotal: 59.8,
  total: 59.8,
  currency: "BRL",
};

function createService(currentCart = cart) {
  return new OrderService(
    {
      get: () => currentCart,
      clear: () => ({ ...currentCart, items: [], itemCount: 0 }),
    },
    createOrderRepository({ idFactory: () => "order-test" }),
  );
}

test("cria um pedido com snapshot do carrinho e dados do cliente", () => {
  const service = createService();
  const order = service.create({
    cartId: "cart-test",
    customer: {
      name: "Pedro Colavite",
      email: "pedro@example.com",
      phone: "11999999999",
    },
  });

  assert.equal(order.id, "order-test");
  assert.equal(order.status, "received");
  assert.equal(order.total, 59.8);
  assert.equal(order.customer.email, "pedro@example.com");
  assert.equal(order.items[0].quantity, 2);
});

test("não cria pedido sem itens no carrinho", () => {
  const service = createService({ ...cart, items: [], itemCount: 0, total: 0 });

  assert.throws(
    () =>
      service.create({
        cartId: "cart-test",
        customer: {
          name: "Pedro Colavite",
          email: "pedro@example.com",
          phone: "11999999999",
        },
      }),
    (error) => error.statusCode === 422,
  );
});

test("valida os dados mínimos de contato antes de confirmar", () => {
  const service = createService();

  assert.throws(
    () =>
      service.create({
        cartId: "cart-test",
        customer: {
          name: "P",
          email: "email-invalido",
          phone: "",
        },
      }),
    (error) => error.statusCode === 422,
  );
});

test("mantém pedidos depois de recriar o repository", async () => {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "treze-orders-"),
  );
  const storagePath = path.join(temporaryDirectory, "orders.json");

  try {
    const firstRepository = createOrderRepository({
      storagePath,
      idFactory: () => "persisted-order",
    });
    const service = new OrderService(
      { get: () => cart, clear: () => cart },
      firstRepository,
    );

    service.create({
      cartId: "cart-test",
      customer: {
        name: "Pedro Colavite",
        email: "pedro@example.com",
        phone: "11999999999",
      },
    });

    const secondRepository = createOrderRepository({ storagePath });
    assert.equal(secondRepository.findById("persisted-order")?.total, 59.8);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
