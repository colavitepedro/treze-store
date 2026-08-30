import test from "node:test";
import assert from "node:assert/strict";
import {
  filterProducts,
  getCategories,
} from "../src/services/product.service.js";

const products = [
  {
    id: "orbita",
    name: "Castiçal Órbita",
    category: "Decoração",
    description: "Uma peça orbital.",
  },
  {
    id: "ninho",
    name: "Vaso Ninho",
    category: "Vasos",
    description: "Textura orgânica para plantas.",
  },
  {
    id: "cubo",
    name: "Organizador Cubo",
    category: "Organização",
    description: "Organização modular.",
  },
];

test("filtra produtos por categoria sem alterar o catálogo original", () => {
  const result = filterProducts(products, { category: "Vasos" });

  assert.deepEqual(
    result.map((product) => product.id),
    ["ninho"],
  );
  assert.equal(products.length, 3);
});

test("busca produtos por nome e descrição sem diferenciar maiúsculas e acentos", () => {
  const result = filterProducts(products, { search: "castical" });

  assert.deepEqual(
    result.map((product) => product.id),
    ["orbita"],
  );
});

test("retorna todas as categorias ordenadas e sem duplicatas", () => {
  const result = getCategories([
    ...products,
    { id: "orbita-2", name: "Órbita menor", category: "Decoração" },
  ]);

  assert.deepEqual(result, ["Decoração", "Organização", "Vasos"]);
});
