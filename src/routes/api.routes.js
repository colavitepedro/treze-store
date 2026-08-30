import { Router } from "express";
import { healthController } from "../controllers/health.controller.js";
import { createCartController } from "../controllers/cart.controller.js";
import { createOrderController } from "../controllers/order.controller.js";
import { createProductController } from "../controllers/product.controller.js";

export function createApiRouter(productService, cartService, orderService) {
  const router = Router();
  const productController = createProductController(productService);
  const cartController = createCartController(cartService);
  const orderController = createOrderController(orderService);

  router.get("/health", healthController);
  router.get("/products", productController.list);
  router.get("/products/:id", productController.findById);
  router.post("/carts", cartController.create);
  router.get("/carts/:cartId", cartController.get);
  router.post("/carts/:cartId/items", cartController.addItem);
  router.patch("/carts/:cartId/items/:productId", cartController.updateItem);
  router.delete("/carts/:cartId/items/:productId", cartController.removeItem);
  router.delete("/carts/:cartId", cartController.clear);
  router.post("/orders", orderController.create);
  router.get("/orders/:orderId", orderController.get);

  return router;
}
