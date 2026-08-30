import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../public/assets/js/sanitize.js";

test("escapa conteúdo dinâmico antes de inseri-lo em templates HTML", () => {
  assert.equal(
    escapeHtml(`<script>alert("x")</script>`),
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
});
