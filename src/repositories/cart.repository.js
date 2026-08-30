import { randomUUID } from "node:crypto";
import { createCartModel } from "../models/cart.model.js";

export function createCartRepository({ idFactory = randomUUID } = {}) {
  const carts = new Map();

  return {
    create() {
      const cart = createCartModel(idFactory());
      carts.set(cart.id, cart);
      return cart;
    },

    findById(id) {
      return carts.get(id) ?? null;
    },

    save(cart) {
      carts.set(cart.id, cart);
      return cart;
    },
  };
}
