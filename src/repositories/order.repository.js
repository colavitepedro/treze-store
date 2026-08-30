import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

function loadOrders(storagePath) {
  if (!storagePath) return [];

  try {
    const content = readFileSync(storagePath, "utf8");
    const orders = JSON.parse(content);
    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

function saveOrders(storagePath, orders) {
  if (!storagePath) return;

  mkdirSync(path.dirname(storagePath), { recursive: true });
  const temporaryPath = `${storagePath}.${process.pid}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(orders, null, 2));
  renameSync(temporaryPath, storagePath);
}

export function createOrderRepository({
  idFactory = randomUUID,
  now = () => new Date().toISOString(),
  storagePath = null,
} = {}) {
  const orders = new Map(
    loadOrders(storagePath).map((order) => [order.id, order]),
  );

  return {
    create(order) {
      const savedOrder = {
        ...order,
        id: idFactory(),
        createdAt: now(),
      };
      orders.set(savedOrder.id, savedOrder);
      saveOrders(storagePath, [...orders.values()]);
      return savedOrder;
    },

    findById(id) {
      return orders.get(id) ?? null;
    },
  };
}
