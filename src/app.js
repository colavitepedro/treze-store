import compression from "compression";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { env } from "./config/env.js";
import { createOrderRepository } from "./repositories/order.repository.js";
import { createProductRepository } from "./repositories/product.repository.js";
import { CartService } from "./services/cart.service.js";
import { OrderService } from "./services/order.service.js";
import { ProductService } from "./services/product.service.js";
import { createApiRouter } from "./routes/api.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";

export function createApp() {
  const app = express();
  const productService = new ProductService(createProductRepository());
  const cartService = new CartService(productService);
  const orderService = new OrderService(
    cartService,
    createOrderRepository({
      storagePath:
        env.nodeEnv === "production"
          ? path.join(env.dataDir, "orders.json")
          : null,
    }),
  );

  app.locals.publicDir = env.publicDir;
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          formAction: ["'self'"],
          frameAncestors: ["'self'"],
          imgSrc: ["'self'", "data:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "https://fonts.googleapis.com"],
          upgradeInsecureRequests: env.httpsEnabled ? [] : null,
        },
      },
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", createApiRouter(productService, cartService, orderService));
  app.use(
    "/video",
    express.static(env.videoDir, {
      etag: true,
      maxAge: 0,
      setHeaders(response) {
        response.setHeader("Cache-Control", "no-cache");
      },
    }),
  );
  app.use(
    express.static(env.publicDir, {
      etag: true,
      extensions: ["html"],
      index: "index.html",
      maxAge: env.nodeEnv === "production" ? "7d" : 0,
      setHeaders(response, filePath) {
        if (path.extname(filePath) === ".html") {
          response.setHeader("Cache-Control", "no-cache");
        } else if (path.basename(filePath) === "products.json") {
          response.setHeader(
            "Cache-Control",
            "public, max-age=300, must-revalidate",
          );
        } else if (env.nodeEnv === "production") {
          response.setHeader("Cache-Control", "public, max-age=604800");
        }
      },
    }),
  );

  app.get("/", (_request, response) =>
    response.sendFile("index.html", { root: env.publicDir }),
  );
  app.get(["/como-fiz", "/como-fiz/"], (_request, response) =>
    response.sendFile("como-fiz/index.html", { root: env.publicDir }),
  );
  app.use((request, response, next) => {
    response.locals.publicDir = env.publicDir;
    return notFoundHandler(request, response, next);
  });
  app.use(errorHandler);

  return app;
}
