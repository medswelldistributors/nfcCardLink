/**
 * [FILE ROLE]
 * - Fetch products from Firestore
 * - Render catalogue UI
 * - Handle search, cart, WhatsApp order
 *
 * [FLOW]
 * Page Load → fetchProducts → renderProducts
 * User Action → updateCart → generateOrderMessage
 */

import { fetchProducts, addProduct, updateProduct, deleteProduct, getProductById } from "./services.firebase.js";

/* ======================
   CATEGORY FILTER MAP
====================== */
const CATEGORY_MAP = {
  tablet: ["tablet"],
  capsule: ["capsule"],
  liquid: ["syrup", "dry syrup", "suspension", "drops", "solution", "bottol", "nasal spray"],
  "cream-gel": ["cream", "gel", "tube", "soap"],
  injection: ["injection", "infusion", "ampoules", "vaccine", "respules"],
  "powder-sachet": ["powder", "sachet", "pack"],
};
// Flatten all mapped forms for "other" detection
const ALL_MAPPED_FORMS = Object.values(CATEGORY_MAP).flat();

// Category display order (matches filter-pill order in HTML)
const CATEGORY_ORDER = ["tablet", "capsule", "liquid", "cream-gel", "injection", "powder-sachet", "other"];

/**
 * Returns the sort-priority index for a product based on its form.
 * Products whose form doesn't match any known category get the "other" index.
 */
function getCategoryOrder(form) {
  const f = (form || "").toLowerCase();
  for (let i = 0; i < CATEGORY_ORDER.length; i++) {
    const cat = CATEGORY_ORDER[i];
    if (cat === "other") continue;
    if ((CATEGORY_MAP[cat] || []).includes(f)) return i;
  }
  // "other" is last
  return CATEGORY_ORDER.length - 1;
}

let activeCategory = "all";

/* ======================
   RENDER PRODUCTS
====================== */
const selectedProducts = new Map();

function renderProducts(products) {
  const container = document.getElementById("product-list");
  if (!container) {
    console.error("Product list container not found");
    return;
  }
  container.innerHTML = "";

  products.forEach((product) => {
    const isPopular = product.isPopular === true;
    const popularClass = isPopular ? " popular-card" : "";
    const popularBadge = isPopular ? '<span class="popular-badge"><i class="fa-solid fa-star"></i> Popular</span>' : "";

    const html = `
          <div class="col" 
                data-product-name="${product.name}" 
                data-product-content="${product.content || ""}" 
                data-product-form="${product.form || ""}" 
                data-product-mg="${product.mg || ""}" 
                data-product-mrp="${product.mrp || ""}" 
                data-product-rate="${product.rate || ""}" 
                data-company-name="${product.companyName || ""}"
                data-unit-of-sale="${product.unitOfSale}"
                data-unit-name="${product.unitName}"
                data-is-popular="${isPopular}"
                ${product.unitsPerStrip ? `data-units-per-strip="${product.unitsPerStrip}"` : ""}
                ${product.stripsPerBox ? `data-strips-per-box="${product.stripsPerBox}"` : ""}
                >
            <div class="card product-card h-100${popularClass}">
              <div class="product-image-container" data-bs-toggle="modal" data-bs-target="#productModal">
                ${popularBadge}
                <img src="${product.imageUrl || ""}" class="card-img-top product-image" alt="${product.name}" loading="lazy" onerror="this.classList.add('error'); this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f8f9fa%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23adb5bd%22 font-size=%2210%22>No Image</text></svg>'" />
                <input class="form-check-input product-checkbox" type="checkbox" />
              </div>
              <div class="card-body">
                <div>
                  <h5 class="card-title">${product.name}</h5>
                  <span class="product-content">${product.content} ${product.form ? `(${product.mg})` : ""}</span>
                  <div class="packing-info-container mt-2"></div>
                </div>
                <div class="mt-3 d-flex justify-content-between align-items-center">
                  <div>
                    ${product.mrp ? `<span class="card-price-amount">MRP ${product.mrp} ₹</span><br />` : ""}
                    ${product.rate ? `<span class="card-price">Rate ${product.rate} ₹</span>` : ""}
                  </div>
                  <div class="quantity-selector input-group input-group-sm" style="display: none">
                    <span class="input-group-text quantity-unit-label">${product.unitOfSale}</span>
                    <input type="number" class="form-control text-center quantity-input" value="1" min="1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
    container.insertAdjacentHTML("beforeend", html);
  });
}

/* ======================
   CATEGORY FILTER
====================== */
function filterProducts() {
  const list = document.getElementById("product-list");
  const searchInput = document.getElementById("search-input");
  const emptyState = document.getElementById("empty-state");
  const term = (searchInput?.value || "").toLowerCase();
  let visibleCount = 0;

  [...list.children].forEach((col) => {
    const name = (col.dataset.productName || "").toLowerCase();
    const content = (col.dataset.productContent || "").toLowerCase();
    const form = (col.dataset.productForm || "").toLowerCase();

    // Category match
    let categoryMatch = true;
    if (activeCategory !== "all") {
      if (activeCategory === "other") {
        categoryMatch = !ALL_MAPPED_FORMS.includes(form);
      } else {
        const forms = CATEGORY_MAP[activeCategory] || [];
        categoryMatch = forms.includes(form);
      }
    }

    // Search match
    const searchMatch = !term || name.includes(term) || content.includes(term);

    const visible = categoryMatch && searchMatch;
    col.style.display = visible ? "" : "none";
    if (visible) visibleCount++;
  });

  // Toggle empty state
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }
}

/* ======================
   HELPERS
====================== */
function calculateTotalUnits(card, qty) {
  const { unitOfSale, unitsPerStrip, stripsPerBox } = card.dataset;

  if (unitOfSale === "Box") {
    return qty * parseInt(stripsPerBox || 1) * parseInt(unitsPerStrip || 1);
  }
  if (unitOfSale === "Strip") {
    return qty * parseInt(unitsPerStrip || 1);
  }
  return qty;
}

function updateFloatingButton() {
  const btn = document.querySelector(".floating-order-btn");
  const badge = document.querySelector(".item-count-badge");
  badge.textContent = selectedProducts.size;
  btn.classList.toggle("visible", selectedProducts.size > 0);
}

/* ======================
   EVENTS
====================== */
function bindEvents() {
  const list = document.getElementById("product-list");
  const searchInput = document.getElementById("search-input");

  // checkbox + quantity
  list.addEventListener("change", (e) => {
    const card = e.target.closest(".col");
    if (!card) return;

    const name = card.dataset.productName;
    const qtyInput = card.querySelector(".quantity-input");
    const qtyBox = card.querySelector(".quantity-selector");

    if (e.target.classList.contains("product-checkbox")) {
      if (e.target.checked) {
        qtyBox.style.display = "flex";
        selectedProducts.set(name, {
          quantity: 1,
          unit: card.dataset.unitOfSale,
          unitName: card.dataset.unitName,
          totalUnits: calculateTotalUnits(card, 1),
        });
      } else {
        qtyBox.style.display = "none";
        selectedProducts.delete(name);
      }
    }

    if (e.target.classList.contains("quantity-input")) {
      const qty = Math.max(1, parseInt(e.target.value || 1));
      const item = selectedProducts.get(name);
      if (item) {
        item.quantity = qty;
        item.totalUnits = calculateTotalUnits(card, qty);
      }
    }

    updateFloatingButton();
  });

  // search — compose with category filter
  searchInput.addEventListener("input", () => {
    filterProducts();
  });

  // category filter pills
  const filterBar = document.getElementById("filter-bar");
  if (filterBar) {
    filterBar.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;
      // Update active pill
      filterBar.querySelector(".filter-pill.active")?.classList.remove("active");
      pill.classList.add("active");
      activeCategory = pill.dataset.category;
      filterProducts();
    });
  }
}

/* ======================
   MODALS
====================== */
function initModals() {
  const productModal = document.getElementById("productModal");
  const orderModal = document.getElementById("orderModal");

  // --- EVENT LISTENER FOR PRODUCT DETAILS MODAL ---
  productModal.addEventListener("show.bs.modal", (event) => {
    const triggerElement = event.relatedTarget;
    const card = triggerElement.closest(".col");
    if (!card) return;

    const { productName, productContent, productForm, productMg, productMrp, productRate, companyName } = card.dataset;

    const imageUrl = card.querySelector(".product-image").src;

    const modalImage = productModal.querySelector("#modal-product-image");
    const modalName = productModal.querySelector("#modal-product-name");
    const modalDetailsContainer = productModal.querySelector("#modal-product-details");

    modalImage.src = imageUrl;
    modalName.textContent = productName;

    let detailsHtml = '<ul class="list-group list-group-flush">';
    if (productContent) detailsHtml += `<li class="list-group-item d-flex justify-content-between"><strong>Content:</strong> <span>${productContent}</span></li>`;
    if (productForm) detailsHtml += `<li class="list-group-item d-flex justify-content-between"><strong>Form:</strong> <span>${productForm}</span></li>`;
    if (companyName) detailsHtml += `<li class="list-group-item d-flex justify-content-between"><strong>Company:</strong> <span>${companyName}</span></li>`;
    if (productMg) detailsHtml += `<li class="list-group-item d-flex justify-content-between"><strong>Strength/Vol:</strong> <span>${productMg}</span></li>`;
    detailsHtml += '</ul><hr class="my-3"/>';
    if (productMrp) detailsHtml += `<div class="d-flex justify-content-between align-items-center mb-2"><span class="text-muted fs-5">MRP:</span><span class="fs-5 text-decoration-line-through">&#8377; ${productMrp}</span></div>`;
    if (productRate) detailsHtml += `<div class="d-flex justify-content-between align-items-center"><span class="text-muted fs-5">Your Rate:</span><span class="h3 fw-bold text-primary mb-0">&#8377; ${productRate}</span></div>`;

    modalDetailsContainer.innerHTML = detailsHtml;
  });

  orderModal.addEventListener("show.bs.modal", () => {
    const modalBody = orderModal.querySelector("#order-modal-body");
    const submitOrderBtn = orderModal.querySelector("#submit-order-btn");

    if (selectedProducts.size === 0) {
      modalBody.innerHTML = '<p class="text-center text-muted">No products selected.</p>';
      submitOrderBtn.disabled = true;
    } else {
      let listHTML = '<h6>Selected Products:</h6><ul class="list-group list-group-flush">';
      for (const [productName, details] of selectedProducts.entries()) {
        let totalText = "";
        if (details.unit.toLowerCase() !== details.unitName.toLowerCase()) {
          totalText = `(${details.totalUnits} ${details.unitName}s total)`;
        }
        listHTML += `<li class="list-group-item d-flex justify-content-between">
                            <span>${productName} <small class="text-muted d-block">${totalText}</small></span> 
                            <strong>${details.quantity} ${details.unit}(s)</strong>
                          </li>`;
      }
      listHTML += "</ul>";
      modalBody.innerHTML = listHTML;
      submitOrderBtn.disabled = false;
    }
  });

  document.getElementById("submit-order-btn").addEventListener("click", () => {
    if (selectedProducts.size === 0) return;

    let message = "Hello MedsWell! I would like to place an order for:\n\n";

    selectedProducts.forEach((details, productName) => {
      let totalText = "";

      // old logic preserved (unit vs unitName comparison)
      if (details.unit && details.unitName && details.unit.toLowerCase() !== details.unitName.toLowerCase()) {
        totalText = ` (${details.totalUnits} ${details.unitName}(s))`;
      }

      message += `- ${productName}: ${details.quantity} ${details.unit}(s)${totalText}\n`;
    });

    const whatsappNumber = "919904685222";
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");
  });
}

/* ======================
   INIT
====================== */
document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("catalog-loader");
  const productList = document.getElementById("product-list");

  try {
    const products = await fetchProducts();

    // Hide loader and show products
    if (loader) loader.style.display = "none";
    if (productList) productList.style.display = "flex";

    // Sort by category order so "All" view groups products by category
    products.sort((a, b) => getCategoryOrder(a.form) - getCategoryOrder(b.form));

    renderProducts(products);
    bindEvents();
    initModals();
  } catch (error) {
    console.error("Failed to load products:", error);

    // Show error message in loader area
    if (loader) {
      loader.innerHTML = `
        <div class="text-center py-5">
          <i class="fa-solid fa-triangle-exclamation text-danger fs-1 mb-3"></i>
          <p class="text-muted">Failed to load products. Please refresh the page.</p>
          <button class="btn btn-primary btn-sm" onclick="location.reload()">
            <i class="fa-solid fa-rotate-right me-2"></i>Retry
          </button>
        </div>
      `;
    }
  }
});

/*
 * [catlogue.html loads]
 *       ↓
 * [product.js: DOMContentLoaded]
 *       ↓
 * [fetchProducts()] ──→ Firebase Firestore
 *       ↓
 * [renderProducts()] ──→ Creates HTML cards
 *       ↓
 * [bindEvents()] ──→ Attaches click/search handlers
 *       ↓
 * [User clicks product] ──→ [show modal]
 * [User checks product] ──→ [add to cart Map]
 * [User clicks "Place Order"] ──→ [WhatsApp redirect]
 */
