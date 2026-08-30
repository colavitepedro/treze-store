import { getCartCount, initializeCart } from "./cart.js";

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function updateCartIndicators() {
  const count = getCartCount();
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
    element.hidden = count === 0;
  });
}

export function setupMenu() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");

  if (!menuButton || !navigation) return;

  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

export function updateActiveNavigation() {
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  const links = document.querySelectorAll("[data-navigation] a");

  links.forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    const isCollection = url.pathname === "/" && url.hash === "#colecao";
    const isHome = url.pathname === "/" && !url.hash;
    const isCurrent =
      currentPath === "/" && currentHash === "#colecao"
        ? isCollection
        : currentPath === "/"
          ? isHome
          : url.pathname === currentPath;

    link.classList.toggle("is-active", isCurrent);
  });
}

updateActiveNavigation();
window.addEventListener("hashchange", updateActiveNavigation);
updateCartIndicators();
window.addEventListener("cart:updated", updateCartIndicators);
setupMenu();
initializeCart()
  .then(updateCartIndicators)
  .catch(() => {
    // O cache local mantém o indicador utilizável se a API estiver indisponível.
  });
