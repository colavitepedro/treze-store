import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  httpsEnabled: process.env.HTTPS_ENABLED === "true",
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3000),
  dataDir: path.resolve(
    process.env.DATA_DIR ?? path.resolve(currentDir, "../../.data"),
  ),
  publicDir: path.resolve(currentDir, "../../public"),
  videoDir: path.resolve(currentDir, "../../video"),
};
