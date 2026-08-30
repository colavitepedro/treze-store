export function createOrderController(orderService) {
  return {
    create(request, response, next) {
      try {
        const order = orderService.create({
          cartId: request.body?.cartId,
          customer: request.body?.customer,
        });

        return response.status(201).json({ data: order });
      } catch (error) {
        return next(error);
      }
    },

    get(request, response, next) {
      try {
        return response.json({
          data: orderService.get(request.params.orderId),
        });
      } catch (error) {
        return next(error);
      }
    },
  };
}
