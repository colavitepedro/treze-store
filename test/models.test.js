import test from "node:test";
import assert from "node:assert/strict";
import {
  addCartItem,
  createCartModel,
  summarizeCart,
} from "../src/models/cart.model.js";
import { createOrderDraft } from "../src/models/order.model.js";
import { validateProduct } from "../src/models/product.model.js";

test("cria um produto somente com preço e campos obrigatórios válidos", () => {
  const product = validateProduct({
    id: "benchy",
    name: "Mini Barco Benchy",
    description: "Uma miniatura.",
    price: 29.9,
    category: "Miniaturas",
    image: "/benchy.jpg",
    fallbackImage: "/benchy.svg",
  });

  assert.equal(product.id, "benchy");
  assert.equal(product.price, 29.9);
});

test("o model de carrinho adiciona itens e calcula o resumo", () => {
  const cart = createCartModel("cart-test");
  addCartItem(cart, {
    id: "benchy",
    name: "Mini Barco Benchy",
    price: 29.9,
    image: "/benchy.jpg",
    fallbackImage: "/benchy.svg",
  });

  const summary = summarizeCart(cart);

  assert.equal(summary.id, "cart-test");
  assert.equal(summary.itemCount, 1);
  assert.equal(summary.subtotal, 29.9);
  assert.equal(summary.items[0].lineTotal, 29.9);
});

test("o model de pedido cria um snapshot normalizado do checkout", () => {
  const cart = {
    items: [{ productId: "benchy", name: "Benchy", price: 29.9, quantity: 1 }],
    itemCount: 1,
    subtotal: 29.9,
    total: 29.9,
    currency: "BRL",
  };
  const draft = createOrderDraft({
    cartId: "cart-test",
    cart,
    customer: {
      name: " Pedro Colavite ",
      email: "PEDRO@EXAMPLE.COM",
      phone: "11999999999",
    },
  });

  assert.equal(draft.status, "received");
  assert.equal(draft.customer.name, "Pedro Colavite");
  assert.equal(draft.customer.email, "pedro@example.com");
  assert.notStrictEqual(draft.items, cart.items);
});
