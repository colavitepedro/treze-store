import {
  createOrderDraft,
  OrderError,
  validateCartId,
} from "../models/order.model.js";
import { createOrderRepository } from "../repositories/order.repository.js";

export { OrderError };

export class OrderService {
  constructor(cartService, orderRepository = createOrderRepository()) {
    this.cartService = cartService;
    this.orderRepository = orderRepository;
  }

  create({ cartId, customer } = {}) {
    validateCartId(cartId);
    const cart = this.cartService.get(cartId);
    const draft = createOrderDraft({ cartId, cart, customer });
    const order = this.orderRepository.create(draft);

    this.cartService.clear(cartId);
    return order;
  }

  get(orderId) {
    const order = this.orderRepository.findById(orderId);
    if (!order) throw new OrderError("Pedido não encontrado.", 404);
    return order;
  }
}
