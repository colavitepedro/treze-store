export function notFoundHandler(request, response) {
  if (request.path.startsWith("/api/")) {
    return response.status(404).json({ error: "Rota não encontrada." });
  }

  return response
    .status(404)
    .sendFile("404.html", { root: response.locals.publicDir });
}

export function errorHandler(error, request, response, _next) {
  if (response.headersSent) {
    return;
  }

  const statusCode = error.statusCode ?? 500;
  if (statusCode >= 500) console.error(error);
  const message =
    statusCode >= 500 ? "Erro interno do servidor." : error.message;

  if (request.path.startsWith("/api/")) {
    response.status(statusCode).json({ error: message });
    return;
  }

  response
    .status(statusCode)
    .send("Não foi possível concluir sua solicitação.");
}
