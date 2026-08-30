function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function filterProducts(products, { search = "", category = "" } = {}) {
  const normalizedSearch = normalizeText(search);
  const normalizedCategory = normalizeText(category);

  return products.filter((product) => {
    const matchesCategory =
      !normalizedCategory ||
      normalizeText(product.category) === normalizedCategory;
    const searchableText = normalizeText(
      `${product.name} ${product.description} ${product.category}`,
    );
    const matchesSearch =
      !normalizedSearch || searchableText.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });
}

export function getCategories(products) {
  return [...new Set(products.map((product) => product.category))].sort(
    (first, second) => first.localeCompare(second, "pt-BR"),
  );
}

export class ProductService {
  constructor(repository) {
    this.repository = repository;
  }

  async list({ search, category } = {}) {
    const products = await this.repository.findAll();
    return filterProducts(products, { search, category });
  }

  async getById(id) {
    return this.repository.findById(id);
  }
}
