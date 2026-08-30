export async function fetchCatalog() {
  const response = await fetch("/products.json");

  if (!response.ok) {
    throw new Error("Não foi possível carregar o catálogo.");
  }

  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error("O catálogo retornou um formato inválido.");
  }

  return products;
}

export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function filterCatalog(products, { search = "", category = "" } = {}) {
  const normalizedSearch = normalizeText(search);
  const normalizedCategory = normalizeText(category);

  return products.filter((product) => {
    const text = normalizeText(
      `${product.name} ${product.description} ${product.category}`,
    );
    return (
      (!normalizedSearch || text.includes(normalizedSearch)) &&
      (!normalizedCategory ||
        normalizeText(product.category) === normalizedCategory)
    );
  });
}

export function attachImageFallback(image, fallbackImage) {
  if (!image || !fallbackImage) return;

  image.addEventListener(
    "error",
    () => {
      image.src = fallbackImage;
    },
    { once: true },
  );
}
