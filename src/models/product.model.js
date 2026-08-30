export const PRODUCT_REQUIRED_FIELDS = [
  "id",
  "name",
  "description",
  "price",
  "category",
  "image",
  "fallbackImage",
];

export function validateProduct(product, index = 0) {
  const isValid =
    product &&
    PRODUCT_REQUIRED_FIELDS.every(
      (field) => product[field] !== undefined && product[field] !== null,
    );

  if (!isValid) {
    throw new Error(`Produto inválido na posição ${index} do catálogo.`);
  }

  if (typeof product.price !== "number" || product.price < 0) {
    throw new Error(`Preço inválido para o produto ${product.id}.`);
  }

  return product;
}
