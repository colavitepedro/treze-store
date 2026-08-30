import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateProduct } from "../models/product.model.js";

const catalogPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../public/products.json",
);

const catalogPromises = new Map();

export function createProductRepository(filePath = catalogPath) {
  return {
    async findAll() {
      const cachedCatalog = catalogPromises.get(filePath);
      if (cachedCatalog) return cachedCatalog;

      const catalogPromise = readFile(filePath, "utf8")
        .then(JSON.parse)
        .then((products) => {
          if (!Array.isArray(products)) {
            throw new Error("O catálogo precisa ser um array de produtos.");
          }

          return products.map(validateProduct);
        })
        .catch((error) => {
          catalogPromises.delete(filePath);
          throw error;
        });

      catalogPromises.set(filePath, catalogPromise);
      return catalogPromise;
    },

    async findById(id) {
      const products = await this.findAll();
      return products.find((product) => product.id === id) ?? null;
    },
  };
}
