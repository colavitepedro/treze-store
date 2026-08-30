const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class OrderError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "OrderError";
    this.statusCode = statusCode;
  }
}

export function validateCartId(cartId) {
  if (typeof cartId !== "string" || !cartId.trim()) {
    throw new OrderError("Carrinho inválido.", 422);
  }
}

export function normalizeCustomer(customer = {}) {
  const name = String(customer.name ?? "").trim();
  const email = String(customer.email ?? "")
    .trim()
    .toLocaleLowerCase("pt-BR");
  const phone = String(customer.phone ?? "").trim();
  const note = String(customer.note ?? "").trim();

  if (name.length < 3 || name.length > 100) {
    throw new OrderError("Informe seu nome completo.", 422);
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new OrderError("Informe um e-mail válido.", 422);
  }
  if (phone.replace(/\D/g, "").length < 8 || phone.length > 20) {
    throw new OrderError("Informe um telefone válido.", 422);
  }
  if (note.length > 500) {
    throw new OrderError(
      "A observação deve ter no máximo 500 caracteres.",
      422,
    );
  }

  return { name, email, phone, note };
}

export function createOrderDraft({ cartId, cart, customer } = {}) {
  validateCartId(cartId);
  if (!cart || cart.items.length === 0) {
    throw new OrderError("Adicione pelo menos um item ao carrinho.", 422);
  }

  return {
    cartId,
    status: "received",
    customer: normalizeCustomer(customer),
    items: cart.items.map((item) => ({ ...item })),
    itemCount: cart.itemCount,
    subtotal: cart.subtotal,
    total: cart.total,
    currency: cart.currency,
    delivery: "A combinar com você",
  };
}
