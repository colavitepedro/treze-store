import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const server = app.listen(env.port, env.host, () => {
  console.log(`Trezê disponível em http://${env.host}:${env.port}`);
});

function shutdown(signal) {
  console.log(`\n${signal} recebido. Encerrando com segurança...`);
  server.close(() => process.exit(0));
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
