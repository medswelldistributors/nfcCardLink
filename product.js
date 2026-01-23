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
                data-product-mrp="${product.mrp}" 
                data-product-rate="${product.rate}" 
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
                <img src="${product.imageUrl}" class="card-img-top product-image" alt="${product.name}" loading="lazy" />
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
                    <span class="card-price-amount">MRP ${product.mrp} ₹</span><br />
                    <span class="card-price">Rate ${product.rate} ₹</span>
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

  // search
  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    [...list.children].forEach((col) => {
      const name = col.dataset.productName.toLowerCase();
      const content = col.dataset.productContent.toLowerCase();
      col.style.display = name.includes(term) || content.includes(term) ? "" : "none";
    });
  });
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
  const products = await fetchProducts();
  renderProducts(products);
  bindEvents();
  initModals();
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
