import { CartError } from "../services/cart.service.js";

function getProductId(request) {
  const productId = request.body?.productId;

  if (typeof productId !== "string" || !productId.trim()) {
    throw new CartError("Informe o produto que deseja adicionar.", 422);
  }

  return productId.trim();
}

export function createCartController(cartService) {
  return {
    create(_request, response) {
      return response.status(201).json({ data: cartService.create() });
    },

    get(request, response, next) {
      try {
        return response.json({ data: cartService.get(request.params.cartId) });
      } catch (error) {
        return next(error);
      }
    },

    async addItem(request, response, next) {
      try {
        const cart = await cartService.addItem(
          request.params.cartId,
          getProductId(request),
          request.body?.quantity ?? 1,
        );

        return response.status(201).json({ data: cart });
      } catch (error) {
        return next(error);
      }
    },

    updateItem(request, response, next) {
      try {
        const cart = cartService.updateItem(
          request.params.cartId,
          request.params.productId,
          request.body?.quantity,
        );

        return response.json({ data: cart });
      } catch (error) {
        return next(error);
      }
    },

    removeItem(request, response, next) {
      try {
        const cart = cartService.removeItem(
          request.params.cartId,
          request.params.productId,
        );

        return response.json({ data: cart });
      } catch (error) {
        return next(error);
      }
    },

    clear(request, response, next) {
      try {
        return response.json({
          data: cartService.clear(request.params.cartId),
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}
