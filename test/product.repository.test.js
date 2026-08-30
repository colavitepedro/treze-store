import test from "node:test";
import assert from "node:assert/strict";
import { access, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createProductRepository } from "../src/repositories/product.repository.js";

const publicDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public",
);
const repository = createProductRepository();

test("carrega o catálogo publicado a partir do products.json", async () => {
  const products = await repository.findAll();

  assert.ok(Array.isArray(products));
  assert.ok(products.length >= 6);
  assert.ok(
    products.every((product) => product.id && product.name && product.category),
  );
  assert.ok(
    products.every((product) =>
      product.image.startsWith("/assets/images/products/"),
    ),
  );
});

test("garante que as imagens referenciadas pelo catálogo existem", async () => {
  const products = await repository.findAll();

  await Promise.all(
    products
      .flatMap((product) => [
        product.image,
        product.imageSmall,
        product.fallbackImage,
      ])
      .map((assetPath) => access(path.join(publicDir, assetPath))),
  );
});

test("mantém um fallback neutro e consistente para todos os produtos", async () => {
  const products = await repository.findAll();

  assert.ok(
    products.every(
      (product) =>
        product.fallbackImage === "/assets/images/produto-fallback.svg",
    ),
  );
});

test("mantém versões responsivas WebP no catálogo", async () => {
  const products = await repository.findAll();

  assert.ok(
    products.every(
      (product) =>
        product.image.endsWith("-480.webp") &&
        product.imageMedium.endsWith("-400.webp") &&
        product.imageSmall.endsWith("-320.webp"),
    ),
  );
});

test("mantém o cache do catálogo isolado por caminho", async () => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "treze-"));
  const customCatalogPath = path.join(temporaryDirectory, "products.json");
  const customCatalog = [
    {
      id: "catalogo-customizado",
      name: "Produto de teste",
      description: "Produto usado para validar o isolamento do cache.",
      price: 1,
      category: "Teste",
      image: "/assets/images/products/benchy-decorativo-480.webp",
      imageSmall: "/assets/images/products/benchy-decorativo-320.webp",
      fallbackImage: "/assets/images/produto-fallback.svg",
    },
  ];

  try {
    await writeFile(customCatalogPath, JSON.stringify(customCatalog));
    const customRepository = createProductRepository(customCatalogPath);

    assert.equal(
      (await customRepository.findAll())[0].id,
      "catalogo-customizado",
    );
    assert.equal((await repository.findAll())[0].id, "vasos-esculturais");
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
});
