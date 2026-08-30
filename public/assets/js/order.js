import { escapeHtml } from "./sanitize.js";
import { formatCurrency } from "./site.js";

const page = document.querySelector("[data-order-page]");
const content = document.querySelector("[data-order-content]");
const title = document.querySelector("[data-order-title]");
const status = document.querySelector("[data-order-status]");
const feedback = document.querySelector("[data-order-feedback]");
const empty = document.querySelector("[data-order-empty]");
const items = document.querySelector("[data-order-items]");
const itemCount = document.querySelector("[data-order-item-count]");
const customer = document.querySelector("[data-order-customer]");
const email = document.querySelector("[data-order-email]");
const orderId = document.querySelector("[data-order-id]");
const delivery = document.querySelector("[data-order-delivery]");
const totals = document.querySelectorAll("[data-order-total]");

function showError(message) {
  feedback.textContent = message;
  feedback.hidden = false;
  content.hidden = true;
  empty.hidden = false;
  status.textContent = "Indisponível";
}

function renderOrder(order) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  document.title = `Pedido #${shortId} | Trezê`;
  title.textContent = `Pedido #${shortId}`;
  status.textContent = "Pedido recebido";
  itemCount.textContent = `${order.itemCount} ${order.itemCount === 1 ? "item" : "itens"}`;
  customer.textContent = order.customer.name;
  email.textContent = order.customer.email;
  orderId.textContent = order.id;
  orderId.href = `/api/orders/${encodeURIComponent(order.id)}`;
  delivery.textContent = order.delivery;

  items.replaceChildren();
  order.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "order-item";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span>${item.quantity} ${item.quantity === 1 ? "unidade" : "unidades"}</span>
      </div>
      <strong>${formatCurrency(item.lineTotal)}</strong>`;
    items.append(row);
  });

  totals.forEach((element) => {
    element.textContent = formatCurrency(order.total);
  });
  content.hidden = false;
  empty.hidden = true;
}

async function init() {
  const orderId =
    new URLSearchParams(window.location.search).get("id") ??
    localStorage.getItem("treze-last-order-id");

  if (!orderId) {
    showError("Nenhum pedido foi selecionado.");
    return;
  }

  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error ?? "Pedido não encontrado.");
    renderOrder(body.data);
  } catch (error) {
    showError(error.message);
  }
}

init();
