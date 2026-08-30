const HTML_ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
};

export function escapeHtml(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (character) => HTML_ENTITIES[character],
  );
}
