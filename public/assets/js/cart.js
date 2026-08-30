const CART_ID_KEY = "treze-cart-id";
const CART_CACHE_KEY = "treze-cart-cache";

let cartState = readCachedCart();
let initializationPromise;

function emptyCart(id = null) {
  return {
    id,
    items: [],
    itemCount: 0,
    subtotal: 0,
    total: 0,
    currency: "BRL",
  };
}

function readCachedCart() {
  try {
    const cachedCart = JSON.parse(
      localStorage.getItem(CART_CACHE_KEY) ?? "null",
    );
    if (cachedCart && Array.isArray(cachedCart.items)) return cachedCart;

    const legacyItems = JSON.parse(localStorage.getItem("treze-cart") ?? "[]");
    if (!Array.isArray(legacyItems)) return emptyCart();

    return {
      ...emptyCart(),
      items: legacyItems.map((item) => ({
        productId: item.productId ?? item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        fallbackImage: item.fallbackImage,
        quantity: item.quantity,
        lineTotal: item.price * item.quantity,
      })),
      itemCount: legacyItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ),
      subtotal: legacyItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
      total: legacyItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
      ),
    };
  } catch {
    return emptyCart();
  }
}

function saveCart(cart) {
  cartState = cart;
  try {
    if (cart.id) localStorage.setItem(CART_ID_KEY, cart.id);
    localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cart));
    localStorage.removeItem("treze-cart");
  } catch {
    // O carrinho continua funcionando enquanto a aba estiver aberta.
  }
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: cart }));
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.error ?? "Não foi possível atualizar o carrinho.");
  }

  return body.data;
}

async function createRemoteCart() {
  const pendingItems = cartState.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
  let cart = await apiRequest("/api/carts", { method: "POST" });
  saveCart(cart);

  for (const item of pendingItems) {
    cart = await apiRequest(`/api/carts/${encodeURIComponent(cart.id)}/items`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  saveCart(cart);
  return cart;
}

async function getRemoteCart() {
  const cartId = localStorage.getItem(CART_ID_KEY);
  if (!cartId) return cartState;

  try {
    const cart = await apiRequest(`/api/carts/${encodeURIComponent(cartId)}`);
    saveCart(cart);
    return cart;
  } catch (error) {
    if (error.message === "Carrinho não encontrado.") {
      localStorage.removeItem(CART_ID_KEY);
      const cart = emptyCart();
      saveCart(cart);
      return cart;
    }
    throw error;
  }
}

export function initializeCart() {
  initializationPromise ??= getRemoteCart();
  return initializationPromise;
}

export function refreshCart() {
  initializationPromise = getRemoteCart();
  return initializationPromise;
}

export function getCart() {
  return cartState.items;
}

export function getCartSummary() {
  return cartState;
}

async function ensureRemoteCart() {
  await initializeCart();
  return cartState.id ?? (await createRemoteCart()).id;
}

export async function addToCart(product, quantity = 1) {
  const cartId = await ensureRemoteCart();
  const cart = await apiRequest(
    `/api/carts/${encodeURIComponent(cartId)}/items`,
    {
      method: "POST",
      body: JSON.stringify({ productId: product.id, quantity }),
    },
  );

  saveCart(cart);
  return cart;
}

export async function updateCartItem(id, quantity) {
  const cartId = await ensureRemoteCart();
  const cart = await apiRequest(
    `/api/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    },
  );

  saveCart(cart);
  return cart;
}

export async function removeFromCart(id) {
  const cartId = await ensureRemoteCart();
  const cart = await apiRequest(
    `/api/carts/${encodeURIComponent(cartId)}/items/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  saveCart(cart);
  return cart;
}

export async function clearCart() {
  await initializeCart();
  if (!cartState.id) return cartState;

  const cart = await apiRequest(
    `/api/carts/${encodeURIComponent(cartState.id)}`,
    { method: "DELETE" },
  );
  saveCart(cart);
  return cart;
}

export function getCartCount(cart = cartState.items) {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

export function getCartTotal(cart = cartState.items) {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}
