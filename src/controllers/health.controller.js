export function healthController(_request, response) {
  response.json({ status: "ok", service: "treze-store" });
}
