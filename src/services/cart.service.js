import {
  CartError,
  MAX_ITEM_QUANTITY,
  addCartItem,
  clearCart,
  removeCartItem,
  summarizeCart,
  updateCartItem,
  validateQuantity,
} from "../models/cart.model.js";
import { createCartRepository } from "../repositories/cart.repository.js";

export { CartError, MAX_ITEM_QUANTITY };

export class CartService {
  constructor(productService, cartRepository = createCartRepository()) {
    this.productService = productService;
    this.cartRepository = cartRepository;
  }

  create() {
    return summarizeCart(this.cartRepository.create());
  }

  get(cartId) {
    return summarizeCart(this.getStoredCart(cartId));
  }

  async addItem(cartId, productId, quantity = 1) {
    validateQuantity(quantity);
    const cart = this.getStoredCart(cartId);
    const product = await this.productService.getById(productId);

    if (!product) {
      throw new CartError("Produto não encontrado.", 404);
    }

    addCartItem(cart, product, quantity);
    return this.saveAndSerialize(cart);
  }

  updateItem(cartId, productId, quantity) {
    validateQuantity(quantity);
    const cart = this.getStoredCart(cartId);
    updateCartItem(cart, productId, quantity);
    return this.saveAndSerialize(cart);
  }

  removeItem(cartId, productId) {
    const cart = this.getStoredCart(cartId);
    removeCartItem(cart, productId);
    return this.saveAndSerialize(cart);
  }

  clear(cartId) {
    const cart = this.getStoredCart(cartId);
    clearCart(cart);
    return this.saveAndSerialize(cart);
  }

  getStoredCart(cartId) {
    const cart = this.cartRepository.findById(cartId);

    if (!cart) {
      throw new CartError("Carrinho não encontrado.", 404);
    }

    return cart;
  }

  saveAndSerialize(cart) {
    return summarizeCart(this.cartRepository.save(cart));
  }
}
