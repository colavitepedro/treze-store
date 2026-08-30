import { attachImageFallback, fetchCatalog } from "./catalog.js";
import { escapeHtml } from "./sanitize.js";
import { addToCart } from "./cart.js";
import { formatCurrency } from "./site.js";

const content = document.querySelector("[data-product-content]");
const status = document.querySelector("[data-product-status]");
const productId = new URLSearchParams(window.location.search).get("id");

function renderProduct(product) {
  document.title = `${product.name} | Trezê`;
  content.innerHTML = `
    <div class="product-detail__media"><img src="${escapeHtml(product.image)}" srcset="${escapeHtml(product.imageSmall)} 320w, ${escapeHtml(product.imageMedium)} 400w, ${escapeHtml(product.image)} 480w" sizes="(max-width: 900px) calc(100vw - 32px), 50vw" alt="${escapeHtml(product.alt)}" decoding="async" width="720" height="720"></div>
    <div class="product-detail__info">
      <span class="eyebrow">${escapeHtml(product.category)} · ${escapeHtml(product.tag)}</span>
      <h1>${escapeHtml(product.name)}</h1>
      <p class="product-detail__description">${escapeHtml(product.description)}</p>
      <strong class="product-detail__price">${formatCurrency(product.price)}</strong>
      <p class="product-detail__note">Produzido sob demanda em nossa oficina. Prazo estimado: 5 a 7 dias úteis.</p>
      <div class="product-detail__actions">
        <button class="button button--primary button--wide" type="button" data-add-product>Adicionar ao carrinho <span aria-hidden="true">↗</span></button>
        <a class="product-detail__continue" href="/#colecao">Continuar comprando <span aria-hidden="true">↗</span></a>
      </div>
      <p class="catalog-status" data-add-feedback role="status" hidden></p>
      <ul class="product-detail__features">
        <li>Produção local e sob demanda</li>
        <li>Material selecionado para maior durabilidade</li>
        <li>Embalagem com menos desperdício</li>
      </ul>
    </div>`;

  attachImageFallback(content.querySelector("img"), product.fallbackImage);

  content
    .querySelector("[data-add-product]")
    .addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const feedback = content.querySelector("[data-add-feedback]");
      button.disabled = true;
      button.textContent = "Adicionando...";

      try {
        await addToCart(product);
        button.textContent = "Adicionado ao carrinho ✓";
      } catch (error) {
        button.disabled = false;
        button.textContent = "Tentar novamente";
        feedback.hidden = false;
        feedback.textContent = error.message;
      }
    });
}

async function init() {
  try {
    const products = await fetchCatalog();
    const product = products.find((item) => item.id === productId);

    if (!product) throw new Error("Peça não encontrada.");
    renderProduct(product);
    status.hidden = true;
  } catch (error) {
    status.textContent = error.message;
  }
}

init();
