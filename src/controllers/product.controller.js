export function createProductController(productService) {
  return {
    async list(request, response, next) {
      try {
        const products = await productService.list({
          search: request.query.search,
          category: request.query.category,
        });

        response.json({ data: products, total: products.length });
      } catch (error) {
        next(error);
      }
    },

    async findById(request, response, next) {
      try {
        const product = await productService.getById(request.params.id);

        if (!product) {
          return response
            .status(404)
            .json({ error: "Produto não encontrado." });
        }

        return response.json({ data: product });
      } catch (error) {
        return next(error);
      }
    },
  };
}
