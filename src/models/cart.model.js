export const MAX_ITEM_QUANTITY = 99;

export class CartError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "CartError";
    this.statusCode = statusCode;
  }
}

export function createCartModel(id) {
  return { id, items: [] };
}

export function validateQuantity(quantity) {
  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_ITEM_QUANTITY
  ) {
    throw new CartError(
      `A quantidade deve ser um número inteiro entre 1 e ${MAX_ITEM_QUANTITY}.`,
      422,
    );
  }
}

function toCents(value) {
  return Math.round(value * 100);
}

function fromCents(value) {
  return Number((value / 100).toFixed(2));
}

function createCartItem(product, quantity) {
  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    fallbackImage: product.fallbackImage,
    quantity,
  };
}

export function addCartItem(cart, product, quantity = 1) {
  validateQuantity(quantity);
  const existingItem = cart.items.find((item) => item.productId === product.id);
  const nextQuantity = (existingItem?.quantity ?? 0) + quantity;
  validateQuantity(nextQuantity);

  if (existingItem) {
    existingItem.quantity = nextQuantity;
  } else {
    cart.items.push(createCartItem(product, quantity));
  }

  return cart;
}

export function updateCartItem(cart, productId, quantity) {
  validateQuantity(quantity);
  const item = cart.items.find(
    (candidate) => candidate.productId === productId,
  );

  if (!item) {
    throw new CartError("Item não encontrado no carrinho.", 404);
  }

  item.quantity = quantity;
  return cart;
}

export function removeCartItem(cart, productId) {
  const nextItems = cart.items.filter((item) => item.productId !== productId);

  if (nextItems.length === cart.items.length) {
    throw new CartError("Item não encontrado no carrinho.", 404);
  }

  cart.items = nextItems;
  return cart;
}

export function clearCart(cart) {
  cart.items = [];
  return cart;
}

export function summarizeCart(cart) {
  const items = cart.items.map((item) => ({
    ...item,
    lineTotal: fromCents(toCents(item.price) * item.quantity),
  }));
  const subtotalInCents = items.reduce(
    (total, item) => total + toCents(item.price) * item.quantity,
    0,
  );

  return {
    id: cart.id,
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: fromCents(subtotalInCents),
    total: fromCents(subtotalInCents),
    currency: "BRL",
  };
}
