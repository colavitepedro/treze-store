import { escapeHtml } from "./sanitize.js";
import { getCartSummary, initializeCart, refreshCart } from "./cart.js";
import { formatCurrency } from "./site.js";

const ORDER_HISTORY_KEY = "treze-order-history";
const content = document.querySelector("[data-checkout-content]");
const form = document.querySelector("[data-checkout-form]");
const itemsList = document.querySelector("[data-checkout-items]");
const totals = document.querySelectorAll("[data-checkout-total]");
const status = document.querySelector("[data-checkout-status]");
const success = document.querySelector("[data-checkout-success]");
const empty = document.querySelector("[data-checkout-empty]");
const orderId = document.querySelector("[data-order-id]");
const orderLink = document.querySelector("[data-order-link]");
const submitButton = form.querySelector("[type=submit]");

function showStatus(message = "") {
  status.textContent = message;
  status.hidden = !message;
}

function rememberOrder(orderId) {
  try {
    const history = JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) ?? "[]");
    const orderIds = Array.isArray(history) ? history : [];
    const nextHistory = [
      orderId,
      ...orderIds.filter((id) => id !== orderId),
    ].slice(0, 20);
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(nextHistory));
    localStorage.setItem("treze-last-order-id", orderId);
  } catch {
    // A confirmação de pedido não depende da persistência do navegador.
  }
}

function renderSummary(cart) {
  itemsList.replaceChildren();
  cart.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "checkout-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span>${item.quantity} ${item.quantity === 1 ? "unidade" : "unidades"}</span>
      </div>
      <strong>${formatCurrency(item.lineTotal)}</strong>`;
    itemsList.append(row);
  });

  totals.forEach((element) => {
    element.textContent = formatCurrency(cart.total);
  });
}

async function createOrder(event) {
  event.preventDefault();
  showStatus();

  if (!form.reportValidity()) return;

  const cart = getCartSummary();
  if (!cart.id || cart.items.length === 0) {
    content.hidden = true;
    empty.hidden = false;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Confirmando pedido";

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cartId: cart.id,
        customer: Object.fromEntries(new FormData(form)),
      }),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(body.error ?? "Não foi possível confirmar o pedido.");
    }

    const order = body.data;
    await refreshCart();
    rememberOrder(order.id);
    orderId.textContent = `#${order.id.slice(0, 8).toUpperCase()}`;
    orderLink.href = `/pedido.html?id=${encodeURIComponent(order.id)}`;
    content.hidden = true;
    success.hidden = false;
    document.title = "Pedido recebido | Trezê";
    requestAnimationFrame(() => {
      success.scrollIntoView({ behavior: "smooth", block: "start" });
      success.focus({ preventScroll: true });
    });
  } catch (error) {
    showStatus(error.message);
    submitButton.disabled = false;
    submitButton.innerHTML =
      'Confirmar pedido <span aria-hidden="true">↗</span>';
  }
}

async function init() {
  try {
    const cart = await initializeCart();
    if (!cart.id || cart.items.length === 0) {
      content.hidden = true;
      empty.hidden = false;
      return;
    }
    renderSummary(cart);
  } catch (error) {
    showStatus(error.message);
    content.hidden = true;
  }
}

form.addEventListener("submit", createOrder);
init();
