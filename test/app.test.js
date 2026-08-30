import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { existsSync } from "node:fs";
import { createApp } from "../src/app.js";

let server;

test.before(async () => {
  server = createApp().listen(0);
  await once(server, "listening");
});

test.after(() => {
  server.close();
});

test("expõe health check para monitoramento da aplicação", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/api/health`,
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { status: "ok", service: "treze-store" });
});

test("publica uma Content-Security-Policy restritiva", async () => {
  const response = await fetch(`http://127.0.0.1:${server.address().port}/`);
  const policy = response.headers.get("content-security-policy");

  assert.equal(response.status, 200);
  assert.match(policy ?? "", /default-src 'self'/);
  assert.match(policy ?? "", /script-src 'self'/);
  assert.match(policy ?? "", /object-src 'none'/);
  assert.doesNotMatch(policy ?? "", /upgrade-insecure-requests/);
});

test("permite criar, atualizar e remover itens de um carrinho pela API", async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const createResponse = await fetch(`${baseUrl}/api/carts`, {
    method: "POST",
  });
  const createdCart = await createResponse.json();

  assert.equal(createResponse.status, 201);
  assert.equal(createdCart.data.itemCount, 0);
  assert.equal(createdCart.data.currency, "BRL");

  const addResponse = await fetch(
    `${baseUrl}/api/carts/${createdCart.data.id}/items`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "mini-barco-benchy", quantity: 2 }),
    },
  );
  const cartWithItem = await addResponse.json();

  assert.equal(addResponse.status, 201);
  assert.equal(cartWithItem.data.itemCount, 2);
  assert.equal(cartWithItem.data.subtotal, 59.8);

  const updateResponse = await fetch(
    `${baseUrl}/api/carts/${createdCart.data.id}/items/mini-barco-benchy`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ quantity: 3 }),
    },
  );
  const updatedCart = await updateResponse.json();

  assert.equal(updateResponse.status, 200);
  assert.equal(updatedCart.data.itemCount, 3);

  const removeResponse = await fetch(
    `${baseUrl}/api/carts/${createdCart.data.id}/items/mini-barco-benchy`,
    { method: "DELETE" },
  );
  const emptiedCart = await removeResponse.json();

  assert.equal(removeResponse.status, 200);
  assert.equal(emptiedCart.data.items.length, 0);
});

test("retorna erro de validação ao adicionar produto inexistente", async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const createResponse = await fetch(`${baseUrl}/api/carts`, {
    method: "POST",
  });
  const { data: cart } = await createResponse.json();
  const response = await fetch(`${baseUrl}/api/carts/${cart.id}/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId: "nao-existe", quantity: 1 }),
  });
  const body = await response.json();

  assert.equal(response.status, 404);
  assert.equal(body.error, "Produto não encontrado.");
});

test("confirma um pedido, retorna seu número e limpa o carrinho", async () => {
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const createResponse = await fetch(`${baseUrl}/api/carts`, {
    method: "POST",
  });
  const { data: cart } = await createResponse.json();
  await fetch(`${baseUrl}/api/carts/${cart.id}/items`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId: "mini-barco-benchy", quantity: 1 }),
  });

  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      cartId: cart.id,
      customer: {
        name: "Pedro Colavite",
        email: "pedro@example.com",
        phone: "11999999999",
      },
    }),
  });
  const orderBody = await orderResponse.json();
  const cartResponse = await fetch(`${baseUrl}/api/carts/${cart.id}`);
  const cartBody = await cartResponse.json();

  assert.equal(orderResponse.status, 201);
  assert.equal(orderBody.data.status, "received");
  assert.equal(orderBody.data.total, 29.9);
  assert.match(orderBody.data.id, /^[0-9a-f-]{36}$/);
  assert.equal(cartResponse.status, 200);
  assert.equal(cartBody.data.itemCount, 0);
});

test("publica a página dedicada para visualizar um pedido", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/pedido.html`,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /data-order-page/);
  assert.match(html, /assets\/js\/order\.js/);
});

test("publica a página de histórico de pedidos", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/pedidos.html`,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /data-orders-page/);
  assert.match(html, /assets\/js\/orders\.js/);
});

test("mantém navegação e estados visuais padronizados", async () => {
  const [homeResponse, ordersResponse, siteResponse] = await Promise.all([
    fetch(`http://127.0.0.1:${server.address().port}/`),
    fetch(`http://127.0.0.1:${server.address().port}/pedidos.html`),
    fetch(`http://127.0.0.1:${server.address().port}/assets/js/site.js`),
  ]);
  const home = await homeResponse.text();
  const orders = await ordersResponse.text();
  const site = await siteResponse.text();

  assert.doesNotMatch(home, /class="circle-link"/);
  assert.match(home, /header-action--cart[\s\S]*<svg/);
  assert.doesNotMatch(orders, /empty-state__icon/);
  assert.match(site, /updateActiveNavigation/);
});

test("respeita o atributo hidden nos estados condicionais", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/assets/css/styles.css`,
  );
  const css = await response.text();

  assert.match(css, /\[hidden\]\s*\{[\s\S]*display:\s*none\s*!important/);
});

test("mantém a tela de pedidos focada apenas em pedidos confirmados", async () => {
  const [htmlResponse, scriptResponse] = await Promise.all([
    fetch(`http://127.0.0.1:${server.address().port}/pedidos.html`),
    fetch(`http://127.0.0.1:${server.address().port}/assets/js/orders.js`),
  ]);
  const html = await htmlResponse.text();
  const script = await scriptResponse.text();

  assert.doesNotMatch(html, /Sua jornada Trezê|Histórico da sessão/);
  assert.match(script, /validOrders/);
  assert.match(script, /localStorage\.setItem\(ORDER_HISTORY_KEY/);
  assert.doesNotMatch(script, /renderUnavailable/);
});

test("mantém a página Como fiz somente com o vídeo e o carrinho padronizado", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/como-fiz`,
  );
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Por trás da Trezê/);
  assert.match(html, /video-player/);
  assert.match(html, /video\/testeVideo\.mp4/);
  assert.doesNotMatch(
    html,
    /technical-hero|technical-grid|Como a loja funciona/,
  );
  assert.match(html, /header-action--cart[\s\S]*<svg/);
  assert.doesNotMatch(html, /header-action--cart[\s\S]*>↗<span/);
});

test("publica o vídeo da página técnica com suporte a atualização do arquivo", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/video/testeVideo.mp4`,
    { method: "HEAD" },
  );

  const videoExists = existsSync(
    new URL("../video/testeVideo.mp4", import.meta.url),
  );
  assert.equal(response.status, videoExists ? 200 : 404);

  if (videoExists) {
    assert.match(response.headers.get("content-type") ?? "", /video\/mp4/);
    assert.equal(response.headers.get("cache-control"), "no-cache");
  }
});

test("faz o checkout rolar até a confirmação sem reticências ambíguas", async () => {
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/assets/js/checkout.js`,
  );
  const script = await response.text();

  assert.equal(response.status, 200);
  assert.match(script, /scrollIntoView/);
  assert.doesNotMatch(script, /Confirmando\.\.\./);
});
