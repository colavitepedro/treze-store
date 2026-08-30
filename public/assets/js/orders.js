import { escapeHtml } from "./sanitize.js";
import { formatCurrency } from "./site.js";

const ORDER_HISTORY_KEY = "treze-order-history";
const LAST_ORDER_KEY = "treze-last-order-id";
const list = document.querySelector("[data-orders-list]");
const empty = document.querySelector("[data-orders-empty]");
const feedback = document.querySelector("[data-orders-feedback]");

function readOrderIds() {
  try {
    const storedIds = JSON.parse(
      localStorage.getItem(ORDER_HISTORY_KEY) ?? "[]",
    );
    const orderIds = Array.isArray(storedIds) ? storedIds : [];
    const lastOrderId = localStorage.getItem(LAST_ORDER_KEY);

    return [
      ...(lastOrderId ? [lastOrderId] : []),
      ...orderIds.filter((id) => id !== lastOrderId),
    ].slice(0, 20);
  } catch {
    return [];
  }
}

async function fetchOrder(id) {
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "Pedido indisponível.");
  return body.data;
}

function renderOrder(order) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const card = document.createElement("article");
  card.className = "order-card";
  card.innerHTML = `
    <div class="order-card__main">
      <span class="eyebrow">Pedido recebido</span>
      <h2>Pedido #${escapeHtml(shortId)}</h2>
      <p>${order.itemCount} ${order.itemCount === 1 ? "item" : "itens"} · ${formatCurrency(order.total)}</p>
    </div>
    <a class="order-card__link" href="/pedido.html?id=${encodeURIComponent(order.id)}">
      Ver detalhes <span aria-hidden="true">↗</span>
    </a>`;
  list.append(card);
}

function saveValidOrderIds(orderIds) {
  try {
    localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(orderIds));
    const lastOrderId = localStorage.getItem(LAST_ORDER_KEY);
    if (lastOrderId && !orderIds.includes(lastOrderId)) {
      localStorage.setItem(LAST_ORDER_KEY, orderIds[0] ?? "");
    }
  } catch {
    // A listagem continua utilizável se o navegador bloquear o storage.
  }
}

async function init() {
  const orderIds = readOrderIds();
  if (orderIds.length === 0) {
    empty.hidden = false;
    return;
  }

  const results = await Promise.all(
    orderIds.map(async (id) => {
      try {
        return { order: await fetchOrder(id), id };
      } catch {
        return { order: null, id };
      }
    }),
  );

  const validOrders = results.filter(({ order }) => order);
  const validOrderIds = validOrders.map(({ order }) => order.id);
  saveValidOrderIds(validOrderIds);

  if (validOrders.length === 0) {
    empty.hidden = false;
    return;
  }

  validOrders.forEach(({ order }) => renderOrder(order));
}

init().catch(() => {
  feedback.textContent = "Não foi possível carregar seus pedidos agora.";
  feedback.hidden = false;
});
