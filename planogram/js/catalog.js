/**
 * Mock fashion catalog — 15 SKUs with cutout placeholders.
 * Works in the browser (global) and in Node tests (module.exports).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.PlanogramCatalog = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  function svgUri(markup) {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
  }

  function hangerHook() {
    return `<path d="M36 8c0-4 4-7 8-7s8 3 8 7c0 3-2 5-4 6v3" fill="none" stroke="#1c1917" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M18 18h44l-4 5H22z" fill="#d6c4a8" stroke="#1c1917" stroke-width="1.2"/>`;
  }

  function cutoutJacket(hex) {
    return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110">
      ${hangerHook()}
      <path d="M22 24l-10 14 8 6 6-8v52l8 6h22l8-6V36l6 8 8-6-10-14-12 4h-22z" fill="${hex}" stroke="#1c1917" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M34 24v38l6 8 6-8V24" fill="none" stroke="#1c1917" stroke-width="1.1"/>
      <circle cx="38" cy="48" r="1.4" fill="#1c1917"/>
      <circle cx="38" cy="56" r="1.4" fill="#1c1917"/>
    </svg>`);
  }

  function cutoutTee(hex) {
    return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110">
      ${hangerHook()}
      <path d="M28 24l-14 10 7 8 7-5v48h24V37l7 5 7-8-14-10-5 3h-10z" fill="${hex}" stroke="#1c1917" stroke-width="1.4" stroke-linejoin="round"/>
    </svg>`);
  }

  function cutoutTrouser(hex) {
    return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110">
      ${hangerHook()}
      <path d="M28 22h24l4 8-8 62h-7l-1-40-2 40h-7l-8-62z" fill="${hex}" stroke="#1c1917" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M40 30v20" stroke="#1c1917" stroke-width="1"/>
    </svg>`);
  }

  function cutoutSkirt(hex) {
    return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110">
      ${hangerHook()}
      <path d="M30 22h20l4 6-10 56H36L26 28z" fill="${hex}" stroke="#1c1917" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M32 30h16" stroke="#1c1917" stroke-width="1"/>
    </svg>`);
  }

  function cutoutBag(hex) {
    return svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 110">
      <path d="M28 36c0-10 6-16 12-16s12 6 12 16" fill="none" stroke="#1c1917" stroke-width="1.8"/>
      <rect x="20" y="36" width="40" height="44" rx="4" fill="${hex}" stroke="#1c1917" stroke-width="1.4"/>
      <rect x="34" y="52" width="12" height="8" rx="1.5" fill="none" stroke="#1c1917" stroke-width="1.1"/>
    </svg>`);
  }

  const CUTTERS = {
    jackets: cutoutJacket,
    tees: cutoutTee,
    trousers: cutoutTrouser,
    skirts: cutoutSkirt,
    bags: cutoutBag,
  };

  const PRODUCTS = [
    { sku: "JKT-0412", name: "Linen Unstructured Blazer", category: "jackets", colorHex: "#F3E6D0", colorFamily: "Ivory", price: 189, defaultFacing: "HANG_FORWARD" },
    { sku: "JKT-0788", name: "Indigo Trucker Jacket", category: "jackets", colorHex: "#2C4A7C", colorFamily: "Indigo", price: 165, defaultFacing: "HANG_FORWARD" },
    { sku: "JKT-1104", name: "Camel Cotton Trench", category: "jackets", colorHex: "#C19A6B", colorFamily: "Camel", price: 245, defaultFacing: "MANNEQUIN" },
    { sku: "TEE-2201", name: "Organic Crew Tee", category: "tees", colorHex: "#F7F4EE", colorFamily: "Ivory", price: 38, defaultFacing: "HANG_FORWARD" },
    { sku: "TEE-2218", name: "Slub Pocket Tee", category: "tees", colorHex: "#D4B896", colorFamily: "Sand", price: 42, defaultFacing: "HANG_FORWARD" },
    { sku: "TEE-2240", name: "Charcoal Graphic Tee", category: "tees", colorHex: "#3A3A3A", colorFamily: "Charcoal", price: 48, defaultFacing: "HANG_FORWARD" },
    { sku: "TEE-2266", name: "Navy Breton Stripe", category: "tees", colorHex: "#1B365D", colorFamily: "Navy", price: 52, defaultFacing: "HANG_FORWARD" },
    { sku: "TRS-3302", name: "Black Wide-Leg Trouser", category: "trousers", colorHex: "#1A1A1A", colorFamily: "Charcoal", price: 128, defaultFacing: "HANG_SIDE" },
    { sku: "TRS-3344", name: "Khaki Stretch Chino", category: "trousers", colorHex: "#C3B091", colorFamily: "Sand", price: 98, defaultFacing: "HANG_SIDE" },
    { sku: "TRS-3371", name: "Olive Pleated Trouser", category: "trousers", colorHex: "#556B2F", colorFamily: "Olive", price: 118, defaultFacing: "HANG_SIDE" },
    { sku: "SKT-4410", name: "Terracotta Midi Wrap", category: "skirts", colorHex: "#C65D3B", colorFamily: "Terracotta", price: 92, defaultFacing: "HANG_FORWARD" },
    { sku: "SKT-4428", name: "Blush A-Line Skirt", category: "skirts", colorHex: "#E8B4B8", colorFamily: "Blush", price: 88, defaultFacing: "HANG_FORWARD" },
    { sku: "BAG-5501", name: "Cognac Structured Tote", category: "bags", colorHex: "#9A5B3C", colorFamily: "Camel", price: 158, defaultFacing: "FOLDED" },
    { sku: "BAG-5520", name: "Black Crossbody Mini", category: "bags", colorHex: "#222222", colorFamily: "Charcoal", price: 96, defaultFacing: "FOLDED" },
    { sku: "BAG-5536", name: "Natural Canvas Shopper", category: "bags", colorHex: "#E8DCC4", colorFamily: "Ivory", price: 72, defaultFacing: "FOLDED" },
  ].map(function (p) {
    var image = CUTTERS[p.category](p.colorHex);
    return Object.assign({}, p, {
      image: image,
      cutout: image,
    });
  });

  var bySku = {};
  PRODUCTS.forEach(function (p) {
    bySku[p.sku] = p;
  });

  return {
    PRODUCTS: PRODUCTS,
    getBySku: function (sku) {
      return bySku[sku] || null;
    },
    isTop: function (p) {
      return p.category === "jackets" || p.category === "tees";
    },
    isBottom: function (p) {
      return p.category === "trousers" || p.category === "skirts";
    },
    isAccessory: function (p) {
      return p.category === "bags";
    },
  };
});
