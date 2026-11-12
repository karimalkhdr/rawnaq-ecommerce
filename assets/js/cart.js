
/* =====================================
   RAWNAQ CART SYSTEM
   Shared Shopping Cart Engine
===================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "rawnaq_cart";

  function getCart() {
    try {
      const data = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("RAWNAQ Cart Read Error:", error);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cart)
      );

      window.dispatchEvent(
        new CustomEvent("rawnaq:cart-updated", {
          detail: { cart }
        })
      );

      return true;
    } catch (error) {
      console.error("RAWNAQ Cart Save Error:", error);
      return false;
    }
  }

  function add(product) {
    if (
      !product ||
      !product.id ||
      !product.name ||
      !Number.isFinite(Number(product.price)) ||
      Number(product.price) < 0
    ) {
      throw new Error("بيانات المنتج غير صالحة");
    }

    const cart = getCart();

    const store = product.store || "store";
    const variant = product.variant || "";

    const existing = cart.find(item =>
      String(item.id) === String(product.id) &&
      item.store === store &&
      item.variant === variant
    );

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: String(product.id),
        name: String(product.name),
        price: Number(product.price),
        image: product.image || "",
        store: store,
        variant: variant,
        qty: 1
      });
    }

    return saveCart(cart);
  }

  function remove(id, store) {
    const cart = getCart().filter(item =>
      !(String(item.id) === String(id) &&
        item.store === store)
    );

    return saveCart(cart);
  }

  function updateQuantity(id, store, variant, quantity) {
    const cart = getCart();

    const item = cart.find(item =>
      String(item.id) === String(id) &&
      item.store === store &&
      item.variant === (variant || "")
    );

    if (!item) return false;

    const qty = Math.floor(Number(quantity));

    if (!Number.isFinite(qty) || qty < 1) {
      return false;
    }

    item.qty = qty;

    return saveCart(cart);
  }

  function clear() {
    return saveCart([]);
  }

  function count() {
    return getCart().reduce(
      (total, item) => total + item.qty,
      0
    );
  }

  function subtotal() {
    return getCart().reduce(
      (total, item) =>
        total + Number(item.price) * Number(item.qty),
      0
    );
  }

  function getStoreItems(store) {
    return getCart().filter(
      item => item.store === store
    );
  }

  window.RAWNAQ_CART = Object.freeze({
    get: getCart,
    add: add,
    remove: remove,
    updateQuantity: updateQuantity,
    clear: clear,
    count: count,
    subtotal: subtotal,
    getStoreItems: getStoreItems
  });

  window.addEventListener("storage", function (event) {
    if (event.key === STORAGE_KEY) {
      window.dispatchEvent(
        new CustomEvent("rawnaq:cart-updated", {
          detail: { cart: getCart() }
        })
      );
    }
  });

})();
