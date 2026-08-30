import test from "node:test";
import assert from "node:assert/strict";
import { createCartRepository } from "../src/repositories/cart.repository.js";
import { CartService } from "../src/services/cart.service.js";

const products = [
  {
    id: "vaso-ninho",
    name: "Vaso Ninho",
    price: 89.9,
    image: "/assets/images/products/vasos-esculturais.jpg",
    fallbackImage: "/assets/images/produto-fallback.svg",
  },
  {
    id: "benchy",
    name: "Mini Barco Benchy",
    price: 29.9,
    image: "/assets/images/products/benchy-decorativo.jpg",
    fallbackImage: "/assets/images/produto-fallback.svg",
  },
];

function createService() {
  return new CartService(
    { getById: async (id) => products.find((product) => product.id === id) },
    createCartRepository({ idFactory: () => "cart-test" }),
  );
}

test("cria um carrinho e soma itens repetidos com valores em centavos", async () => {
  const service = createService();
  const cart = service.create();

  await service.addItem(cart.id, "vaso-ninho", 2);
  const updatedCart = await service.addItem(cart.id, "vaso-ninho", 1);

  assert.equal(updatedCart.itemCount, 3);
  assert.equal(updatedCart.subtotal, 269.7);
  assert.deepEqual(updatedCart.items[0], {
    productId: "vaso-ninho",
    name: "Vaso Ninho",
    price: 89.9,
    image: "/assets/images/products/vasos-esculturais.jpg",
    fallbackImage: "/assets/images/produto-fallback.svg",
    quantity: 3,
    lineTotal: 269.7,
  });
});

test("não permite adicionar produto que não existe no catálogo", async () => {
  const service = createService();
  const cart = service.create();

  await assert.rejects(
    service.addItem(cart.id, "produto-inexistente"),
    (error) => error.statusCode === 404,
  );
});

test("remove um item quando a operação de remoção é solicitada", async () => {
  const service = createService();
  const cart = service.create();

  await service.addItem(cart.id, "benchy");
  const emptiedCart = service.removeItem(cart.id, "benchy");

  assert.equal(emptiedCart.itemCount, 0);
  assert.deepEqual(emptiedCart.items, []);
});

test("rejeita quantidades fracionadas, negativas ou acima do limite", async () => {
  const service = createService();
  const cart = service.create();

  await assert.rejects(service.addItem(cart.id, "benchy", 0), {
    statusCode: 422,
  });
  await assert.rejects(service.addItem(cart.id, "benchy", 1.5), {
    statusCode: 422,
  });
  await assert.rejects(service.addItem(cart.id, "benchy", 100), {
    statusCode: 422,
  });
});
