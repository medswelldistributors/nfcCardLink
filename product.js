import { db } from "./firebase.js";
import { collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ======================
   FETCH FROM FIRESTORE
====================== */

async function fetchProducts() {
  const snapshot = await getDocs(collection(db, "catlogue"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
/* ======================
   WRITE To FIRESTORE
====================== */

export async function addProduct(product) {
  return await addDoc(collection(db, "products"), product);
}

/* ======================
   RENDER UI
====================== */

function renderProducts(products) {
  const productListContainer = document.getElementById("product-list");
  if (!productListContainer) {
    console.warn("Skipping render: 'product-list' element not found on this page.");
    return;
  }
  productListContainer.innerHTML = "";
  products.forEach((product) => {
    const html = `
      <div class="col"
        data-product-name="${product.name}"
        data-product-content="${product.content || ""}"
        data-product-form="${product.form || ""}"
        data-product-mg="${product.mg || ""}"
        data-product-mrp="${product.mrp}"
        data-product-rate="${product.rate}"
        data-unit-of-sale="${product.unitOfSale}"
        data-unit-name="${product.unitName}"
        ${product.unitsPerStrip ? `data-units-per-strip="${product.unitsPerStrip}"` : ""}
        ${product.stripsPerBox ? `data-strips-per-box="${product.stripsPerBox}"` : ""}
      >
        <div class="card product-card h-100">
          <div class="product-image-container" data-bs-toggle="modal" data-bs-target="#productModal">
            <img src="${product.imageUrl}" class="card-img-top product-image" />
            <input class="form-check-input product-checkbox" type="checkbox" />
          </div>
          <div class="card-body">
            <h5 class="card-title">${product.name}</h5>
            <span class="product-content">${product.content || ""}</span>
            <div class="mt-3">
              <span class="card-price-amount">MRP ₹${product.mrp}</span><br/>
              <span class="card-price">Rate ₹${product.rate}</span>
            </div>
          </div>
        </div>
      </div>
    `;
    productListContainer.insertAdjacentHTML("beforeend", html);
  });
}

/* ======================
   INIT APP
====================== */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const products = await fetchProducts();
    renderProducts(products);
  } catch (err) {
    console.error("❌ Failed to load products:", err);
  }
});
