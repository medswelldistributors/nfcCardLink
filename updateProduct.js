/**
 * [FILE ROLE]
 * - Search products
 * - Populate edit form
 * - Update / delete product
 */

import { fetchProducts, updateProduct, deleteProduct, getProductById } from "./services.firebase.js";
import { validateProductForm } from "./helper.js";
import { initAdminPage } from "./adminNavbar.js";

// --- GLOBAL STATE ---
let allProducts = [];
let selectedProductId = null;

document.addEventListener("DOMContentLoaded", async () => {
  // --- INIT ADMIN PAGE: Auth check, navbar, logout ---
  const user = await initAdminPage();
  if (!user) return;

  // --- DOM Elements ---
  const searchInput = document.getElementById("search-input");
  const productsList = document.getElementById("products-list");
  const editSection = document.getElementById("edit-section");
  const divider = document.getElementById("divider");
  const form = document.getElementById("updateProductForm");
  const cancelEditBtn = document.getElementById("cancelEditBtn");
  const deleteBtn = document.getElementById("deleteBtn");
  const loader = document.getElementById("loader");

  // Toast Elements
  const toastContainer = document.getElementById("toast-container");
  const toastBox = document.getElementById("toast-box");
  const toastMsg = document.getElementById("toast-message");
  const toastIcon = document.getElementById("toast-icon");
  const toastClose = document.getElementById("toast-close");

  // Form Fields
  const formFields = {
    productId: document.getElementById("productId"),
    name: document.getElementById("name"),
    companyName: document.getElementById("companyName"),
    content: document.getElementById("content"),
    form: document.getElementById("form"),
    mg: document.getElementById("mg"),
    isPopular: document.getElementById("isPopular"),
    mrp: document.getElementById("mrp"),
    rate: document.getElementById("rate"),
    unitOfSale: document.getElementById("unitOfSale"),
    unitName: document.getElementById("unitName"),
    imageUrl: document.getElementById("imageUrl"),
  };

  // --- HELPER: Show Toast ---
  const showToast = (message, type = "info", duration = 4000) => {
    // Clear any existing timeout
    if (toastBox.hideTimeout) {
      clearTimeout(toastBox.hideTimeout);
    }

    // Set message and styling
    toastMsg.textContent = message;
    toastBox.className = "toast-custom p-3";

    switch (type) {
      case "success":
        toastBox.classList.add("toast-success-custom");
        toastIcon.className = "fa-solid fa-circle-check me-2 fs-6";
        break;
      case "error":
        toastBox.classList.add("toast-error-custom");
        toastIcon.className = "fa-solid fa-triangle-exclamation me-2 fs-6";
        break;
      case "warning":
        toastBox.classList.add("toast-warning-custom");
        toastIcon.className = "fa-solid fa-exclamation-triangle me-2 fs-6";
        break;
      case "info":
      default:
        toastBox.classList.add("toast-info-custom");
        toastIcon.className = "fa-solid fa-info-circle me-2 fs-6";
        break;
    }

    // Show toast
    toastBox.style.display = "flex";

    // Auto hide after duration
    toastBox.hideTimeout = setTimeout(() => {
      hideToast();
    }, duration);

    // Close button functionality
    const closeHandler = () => {
      hideToast();
    };
    toastClose.addEventListener("click", closeHandler);

    // Store handler for cleanup
    toastBox.closeHandler = closeHandler;
  };

  // --- HELPER: Hide Toast ---
  const hideToast = () => {
    if (toastBox.hideTimeout) {
      clearTimeout(toastBox.hideTimeout);
    }

    // Remove event listener
    if (toastBox.closeHandler) {
      toastClose.removeEventListener("click", toastBox.closeHandler);
      toastBox.closeHandler = null;
    }

    toastBox.style.animation = "toastSlideOut 0.3s ease-in";
    setTimeout(() => {
      toastBox.style.display = "none";
      toastBox.style.animation = "";
    }, 300);
  };

  // --- HELPER: Render Products List ---
  const renderProductsList = (products) => {
    if (products.length === 0) {
      productsList.innerHTML = '<div class="text-center text-muted small py-3">No products found.</div>';
      return;
    }

    productsList.innerHTML = products
      .map(
        (p) => `
        <div class="product-item ${selectedProductId === p.id ? "selected" : ""}" data-id="${p.id}">
          <div>
            <span class="product-name">${p.name}</span>
            ${p.isPopular ? '<span class="badge-popular ms-2"><i class="fa-solid fa-star me-1"></i>Popular</span>' : ""}
            <small class="d-block text-muted">${p.companyName || "No Company"}</small>
          </div>
          <span class="product-rate">₹${p.rate}</span>
        </div>
      `,
      )
      .join("");
  };

  // --- HELPER: Populate Form ---
  const populateForm = (product) => {
    formFields.productId.value = product.id;
    formFields.name.value = product.name || "";
    formFields.companyName.value = product.companyName || "";
    formFields.content.value = product.content || "";
    formFields.form.value = product.form || "";
    formFields.mg.value = product.mg || "";
    formFields.isPopular.checked = product.isPopular === true;
    formFields.mrp.value = product.mrp || "";
    formFields.rate.value = product.rate || "";
    formFields.unitOfSale.value = product.unitOfSale || "";
    formFields.unitName.value = product.unitName || "";
    formFields.imageUrl.value = product.imageUrl || "";
  };

  // --- HELPER: Clear Form ---
  const clearForm = () => {
    selectedProductId = null;
    formFields.productId.value = "";
    formFields.name.value = "";
    formFields.companyName.value = "";
    formFields.content.value = "";
    formFields.form.value = "";
    formFields.mg.value = "";
    formFields.isPopular.checked = false;
    formFields.mrp.value = "";
    formFields.rate.value = "";
    formFields.unitOfSale.value = "";
    formFields.unitName.value = "";
    formFields.imageUrl.value = "";
  };

  // --- HELPER: Show/Hide Edit Section ---
  const showEditSection = (show) => {
    editSection.style.display = show ? "block" : "none";
    divider.style.display = show ? "block" : "none";
  };

  // --- LOAD PRODUCTS ON PAGE LOAD ---
  try {
    loader.style.display = "flex";
    allProducts = await fetchProducts();
    console.log(allProducts);

    console.log(`[UpdateProduct] Loaded ${allProducts.length} products`);
    showToast(`Loaded ${allProducts.length} products successfully!`, "success", 3000);
  } catch (error) {
    console.error("[UpdateProduct] Error loading products:", error);

    // Handle specific error types
    if (error.code === "permission-denied") {
      showToast("Authentication required. Please log in to view products.", "error");
    } else if (error.code === "unavailable") {
      showToast("Service temporarily unavailable. Please try refreshing the page.", "error");
    } else {
      showToast("Failed to load products. Please check your connection and try again.", "error");
    }
  } finally {
    loader.style.display = "none";
  }

  // --- SEARCH FUNCTIONALITY (Real-time as you type) ---
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();

    if (query === "") {
      productsList.innerHTML = '<div class="text-center text-muted small py-3"><i class="fa-solid fa-arrow-up me-2"></i>Start typing to search products...</div>';
      return;
    }

    const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(query) || (p.companyName && p.companyName.toLowerCase().includes(query)));

    renderProductsList(filtered);
  });

  // --- PRODUCT SELECTION (Click on product item) ---
  productsList.addEventListener("click", (e) => {
    const item = e.target.closest(".product-item");
    if (!item) return;

    const productId = item.dataset.id;
    const product = allProducts.find((p) => p.id === productId);

    if (!product) return;

    // Update selection
    selectedProductId = productId;

    // Highlight selected item
    document.querySelectorAll(".product-item").forEach((el) => el.classList.remove("selected"));
    item.classList.add("selected");

    // Populate form
    populateForm(product);
    showEditSection(true);

    // Scroll to form
    editSection.scrollIntoView({ behavior: "smooth" });
  });

  // --- CANCEL EDIT ---
  cancelEditBtn.addEventListener("click", () => {
    clearForm();
    showEditSection(false);
    document.querySelectorAll(".product-item").forEach((el) => el.classList.remove("selected"));
  });

  // --- UPDATE PRODUCT SUBMIT ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const docId = formFields.productId.value;
    console.log("Documetn Id is: ", docId);

    if (!docId) {
      showToast("Please select a product to update.", "warning");
      return;
    }

    loader.style.display = "flex";

    // Show loading toast
    showToast("Updating product...", "info", 2000);

    try {
      // Check if product exists
      const existingProduct = await getProductById(docId);
      console.log("Existing Product", existingProduct);

      if (!existingProduct) {
        showToast("Product not found. It may have been deleted by another user.", "error");
        return;
      }

      const updatedData = {
        name: formFields.name.value.trim(),
        companyName: formFields.companyName.value.trim(),
        content: formFields.content.value.trim(),
        form: formFields.form.value.trim(),
        mg: formFields.mg.value.trim(),
        isPopular: formFields.isPopular.checked,
        mrp: Number(formFields.mrp.value) || 0,
        rate: Number(formFields.rate.value) || 0,
        unitOfSale: formFields.unitOfSale.value.trim(),
        unitName: formFields.unitName.value.trim(),
        imageUrl: formFields.imageUrl.value.trim() || null,
      };

      // Validate product data
      const validation = validateProductForm(updatedData);
      if (!validation.isValid) {
        showToast(validation.firstError, "error");
        loader.style.display = "none";
        return;
      }

      await updateProduct(docId, updatedData);

      // Update local cache
      const index = allProducts.findIndex((p) => p.id === docId);
      if (index !== -1) {
        allProducts[index] = { ...allProducts[index], ...updatedData };
      }

      showToast("Product updated successfully!", "success");

      // Re-render search results if applicable
      const query = searchInput.value.toLowerCase().trim();
      if (query) {
        const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(query) || (p.companyName && p.companyName.toLowerCase().includes(query)));
        renderProductsList(filtered);
      }
    } catch (error) {
      console.error("[UpdateProduct] Error updating product:", error);

      // Handle specific error types
      if (error.code === "permission-denied") {
        showToast("Authentication required. Please log in and try again.", "error");
      } else if (error.code === "unavailable") {
        showToast("Service temporarily unavailable. Please try again later.", "error");
      } else {
        showToast("Failed to update product. Please check your connection and try again.", "error");
      }
    } finally {
      loader.style.display = "none";
    }
  });

  // --- DELETE PRODUCT ---
  deleteBtn.addEventListener("click", async () => {
    const docId = formFields.productId.value;
    if (!docId) {
      showToast("Please select a product to delete.", "warning");
      return;
    }

    const productName = formFields.name.value;
    const confirmed = confirm(`Are you sure you want to delete "${productName}"?\n\nThis action cannot be undone.`);

    if (!confirmed) return;

    loader.style.display = "flex";

    // Show loading toast
    showToast("Deleting product...", "info", 2000);

    try {
      await deleteProduct(docId);

      // Remove from local cache
      allProducts = allProducts.filter((p) => p.id !== docId);

      showToast("Product deleted successfully!", "success");

      // Clear form and hide edit section
      clearForm();
      showEditSection(false);

      // Re-render search results
      const query = searchInput.value.toLowerCase().trim();
      if (query) {
        const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(query) || (p.companyName && p.companyName.toLowerCase().includes(query)));
        renderProductsList(filtered);
      } else {
        productsList.innerHTML = '<div class="text-center text-muted small py-3"><i class="fa-solid fa-arrow-up me-2"></i>Start typing to search products...</div>';
      }
    } catch (error) {
      console.error("[UpdateProduct] Error deleting product:", error);

      // Handle specific error types
      if (error.code === "permission-denied") {
        showToast("Authentication required. Please log in and try again.", "error");
      } else if (error.code === "unavailable") {
        showToast("Service temporarily unavailable. Please try again later.", "error");
      } else {
        showToast("Failed to delete product. Please check your connection and try again.", "error");
      }
    } finally {
      loader.style.display = "none";
    }
  });
});
