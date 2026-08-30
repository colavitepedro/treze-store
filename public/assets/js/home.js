import { attachImageFallback, fetchCatalog, filterCatalog } from "./catalog.js";
import { escapeHtml } from "./sanitize.js";
import { formatCurrency } from "./site.js";

const state = { products: [], search: "", category: "" };
const grid = document.querySelector("[data-product-grid]");
const count = document.querySelector("[data-result-count]");
const searchInput = document.querySelector("[data-search]");
const categorySelect = document.querySelector("[data-category]");
const status = document.querySelector("[data-catalog-status]");

function createProductCard(product) {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <a class="product-card__link" href="/produto.html?id=${encodeURIComponent(product.id)}">
      <div class="product-card__media">
        <span class="product-card__tag">${escapeHtml(product.tag)}</span>
        <img src="${escapeHtml(product.image)}" srcset="${escapeHtml(product.imageSmall)} 320w, ${escapeHtml(product.imageMedium)} 400w, ${escapeHtml(product.image)} 480w" sizes="(max-width: 720px) calc((100vw - 46px) / 2), 25vw" alt="${escapeHtml(product.alt)}" loading="lazy" decoding="async" width="480" height="480">
      </div>
      <div class="product-card__body">
        <div>
          <span class="eyebrow">${escapeHtml(product.category)}</span>
          <h3>${escapeHtml(product.name)}</h3>
        </div>
        <strong>${formatCurrency(product.price)}</strong>
      </div>
    </a>`;

  attachImageFallback(article.querySelector("img"), product.fallbackImage);
  return article;
}

function renderProducts() {
  const visibleProducts = filterCatalog(state.products, state);
  grid.replaceChildren();
  visibleProducts.forEach((product) => grid.append(createProductCard(product)));
  count.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? "peça encontrada" : "peças encontradas"}`;
  status.hidden = visibleProducts.length > 0;
  status.textContent =
    "Essa busca voltou de mãos vazias. Tente outro nome ou abra o filtro.";
}

function populateCategories() {
  const categories = [
    ...new Set(state.products.map((product) => product.category)),
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.append(option);
  });
}

async function init() {
  try {
    state.products = await fetchCatalog();
    populateCategories();
    renderProducts();
    document.querySelector("[data-loading]")?.remove();
  } catch (error) {
    status.hidden = false;
    status.textContent = error.message;
    document.querySelector("[data-loading]")?.remove();
  }
}

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

document
  .querySelector("[data-clear-filters]")
  ?.addEventListener("click", () => {
    state.search = "";
    state.category = "";
    searchInput.value = "";
    categorySelect.value = "";
    renderProducts();
  });

init();
