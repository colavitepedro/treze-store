import { attachImageFallback } from "./catalog.js";
import { escapeHtml } from "./sanitize.js";
import {
  getCart,
  getCartSummary,
  initializeCart,
  removeFromCart,
  updateCartItem,
} from "./cart.js";
import { formatCurrency } from "./site.js";

const list = document.querySelector("[data-cart-list]");
const layout = document.querySelector(".cart-layout");
const empty = document.querySelector("[data-cart-empty]");
const summary = document.querySelector("[data-cart-summary]");
const totals = document.querySelectorAll("[data-cart-total]");
const itemCount = document.querySelector("[data-cart-item-count]");
const feedback = document.querySelector("[data-cart-feedback]");

function showFeedback(message = "") {
  feedback.textContent = message;
  feedback.hidden = !message;
}

function render() {
  const cart = getCart();
  const cartSummary = getCartSummary();
  const hasItems = cart.length > 0;

  list.replaceChildren();
  empty.hidden = hasItems;
  summary.hidden = !hasItems;
  layout.classList.toggle("is-empty", !hasItems);
  itemCount.textContent = `${cartSummary.itemCount} ${cartSummary.itemCount === 1 ? "item" : "itens"}`;

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" width="120" height="120">
      <div class="cart-item__info">
        <span class="eyebrow">Peça Trezê</span>
        <h2>${escapeHtml(item.name)}</h2>
        <strong>${formatCurrency(item.price)} cada</strong>
        <span class="cart-item__line-total">${formatCurrency(item.lineTotal)}</span>
      </div>
      <div class="quantity-control">
        <span class="quantity-control__label">Quantidade</span>
        <div class="quantity-control__actions">
          <button class="quantity-control__button" type="button" data-decrease="${escapeHtml(item.productId)}" aria-label="Diminuir quantidade de ${escapeHtml(item.name)}" ${item.quantity <= 1 ? "disabled" : ""}>−</button>
          <input class="quantity-control__input" type="number" min="1" max="99" value="${escapeHtml(item.quantity)}" data-quantity="${escapeHtml(item.productId)}" aria-label="Quantidade de ${escapeHtml(item.name)}">
          <button class="quantity-control__button" type="button" data-increase="${escapeHtml(item.productId)}" aria-label="Aumentar quantidade de ${escapeHtml(item.name)}">+</button>
        </div>
      </div>
      <button class="icon-button" type="button" data-remove="${escapeHtml(item.productId)}" aria-label="Remover ${escapeHtml(item.name)}">×</button>`;
    attachImageFallback(row.querySelector("img"), item.fallbackImage);
    list.append(row);
  });

  totals.forEach((element) => {
    element.textContent = formatCurrency(cartSummary.total);
  });
}

async function changeQuantity(id, quantity) {
  showFeedback();
  try {
    await updateCartItem(id, quantity);
  } catch (error) {
    showFeedback(error.message);
  }
  render();
}

list.addEventListener("change", (event) => {
  const input = event.target.closest("[data-quantity]");
  if (input) changeQuantity(input.dataset.quantity, Number(input.value));
});

list.addEventListener("click", async (event) => {
  const removeButton = event.target.closest("[data-remove]");
  const decreaseButton = event.target.closest("[data-decrease]");
  const increaseButton = event.target.closest("[data-increase]");

  if (removeButton) {
    showFeedback();
    try {
      await removeFromCart(removeButton.dataset.remove);
    } catch (error) {
      showFeedback(error.message);
    }
    render();
    return;
  }

  if (decreaseButton || increaseButton) {
    const id =
      decreaseButton?.dataset.decrease ?? increaseButton.dataset.increase;
    const item = getCart().find((candidate) => candidate.productId === id);
    if (!item) return;

    const change = decreaseButton ? -1 : 1;
    await changeQuantity(id, item.quantity + change);
  }
});

window.addEventListener("cart:updated", render);

async function init() {
  render();
  try {
    await initializeCart();
    render();
  } catch (error) {
    showFeedback(error.message);
  }
}

init();
