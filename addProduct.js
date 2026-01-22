/**
 * [FILE ROLE]
 * - Parse bulk text input
 * - Preview parsed products
 * - Add products to Firestore
 *
 * [FLOW]
 * Text Input → parseText(helper.js) → preview → addProduct()
 */
import { parseBulkProducts, isEmpty, validateProductForm } from "./helper.js";
import { addProduct } from "./services.firebase.js";
import { initAdminPage } from "./adminNavbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- INIT ADMIN PAGE: Auth check, navbar, logout ---
  const user = await initAdminPage();
  if (!user) return;

  // --- DOM Elements ---
  const form = document.getElementById("addProductForm");
  const inputField = document.getElementById("productData");
  const clearBtn = document.getElementById("clearBtn");
  const loader = document.getElementById("loader");
  const pasteBtn = document.getElementById("pasteBtn");

  // New Elements for Visualizer
  const previewArea = document.getElementById("preview-area");
  const lineCounter = document.getElementById("line-counter");

  // Alert Elements
  const alertBox = document.getElementById("alert-box");
  const alertMsg = document.getElementById("alert-message");
  const alertIcon = document.getElementById("alert-icon");

  // --- 1. HELPER: Show Alerts ---
  const showAlert = (message, type) => {
    alertBox.style.display = "flex";
    alertMsg.textContent = message;

    if (type === "success") {
      alertBox.className = "alert alert-custom alert-success-custom mb-4";
      alertIcon.className = "fa-solid fa-circle-check me-2 fs-5";
    } else {
      alertBox.className = "alert alert-custom alert-error-custom mb-4";
      alertIcon.className = "fa-solid fa-triangle-exclamation me-2 fs-5";
    }

    // Auto hide after 3 seconds
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 3000);
  };

  // --- 2. HELPER: Update Live Preview (Product Logic) ---
  const updatePreview = () => {
    const text = inputField.value;
    const lines = text.split("\n");

    // Clear previous preview
    if (!previewArea) return;
    previewArea.innerHTML = "";

    if (text.trim() === "") {
      previewArea.innerHTML = '<div class="text-center text-muted small py-3">Start typing to see product blocks...</div>';
      if (lineCounter) lineCounter.textContent = `0 Products`;
      return;
    }

    let productCount = 0;
    let isNewBlock = true; // Flag: Kya hum naye product par hain?

    lines.forEach((line, index) => {
      const div = document.createElement("div");
      div.className = "preview-item";

      const trimmedLine = line.trim();

      if (trimmedLine === "") {
        // --- CASE 1: EMPTY LINE (SEPARATOR) ---
        div.classList.add("preview-separator");
        div.innerHTML = `<span><i class="fa-solid fa-arrows-up-down me-1"></i> Separator</span>`;

        // Jaise hi empty line aayi, iska matlab agla text naya product hoga
        isNewBlock = true;
      } else {
        // --- CASE 2: DATA LINE ---

        if (isNewBlock) {
          // Ye naye block ki pehli line hai -> New Product Count
          productCount++;
          div.classList.add("preview-product-head");

          // Show Product Number #1, #2...
          div.innerHTML = `
                    <span class="badge-number">#${productCount}</span>
                    <span>${line.substring(0, 50)}...</span>
                `;

          isNewBlock = false; // Ab agli lines isi product ki details hongi
        } else {
          // Ye purane product ki agli lines hain (No Number)
          div.classList.add("preview-product-detail");
          div.innerHTML = `
                    <i class="fa-solid fa-turn-up fa-rotate-90 me-2 text-muted" style="font-size:0.7rem"></i>
                    <span>${line.substring(0, 50)}...</span>
                `;
        }
      }

      previewArea.appendChild(div);
    });

    // Update Counter with Total Products found
    if (lineCounter) lineCounter.textContent = `${productCount} Products Found`;

    // Scroll to bottom
    previewArea.scrollTop = previewArea.scrollHeight;
  };

  // --- 3. EVENT LISTENERS ---

  // A. Input Typing Listener (Triggers Preview)
  inputField.addEventListener("input", updatePreview);

  // B. Paste Button Logic
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        inputField.value = text;
        inputField.focus();

        // Trigger Visual Update immediately after paste
        updatePreview();

        // Visual feedback (Tick Icon)
        const originalIcon = pasteBtn.innerHTML;
        pasteBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
          pasteBtn.innerHTML = originalIcon;
        }, 1000);
      } else {
        showAlert("Clipboard is empty!", "error");
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      showAlert("Unable to access clipboard. Please paste manually.", "error");
    }
  });

  // C. Clear Button Logic
  clearBtn.addEventListener("click", () => {
    inputField.value = "";
    updatePreview(); // Clear the visualizer too
    inputField.focus();
  });

  // D. Submit Logic (Your existing API logic + Visualizer Reset)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textData = inputField.value.trim();

    // Validation: Check empty input
    if (isEmpty(textData)) {
      showAlert("Please enter valid product details text.", "error");
      return;
    }

    // Show Loader
    loader.style.display = "flex";

    try {
      // 1. Parse Data
      const products = parseBulkProducts(textData);
      console.log("Parsed Data:", products);

      // 2. Validate: Check if any products were parsed
      if (products.length === 0) {
        showAlert("No valid products found. Each product needs at least 9 lines.", "error");
        loader.style.display = "none";
        return;
      }

      // 3. Validate each product
      const invalidProducts = [];
      products.forEach((product, index) => {
        const validation = validateProductForm(product);
        if (!validation.isValid) {
          invalidProducts.push(`Product ${index + 1}: ${validation.firstError}`);
        }
      });

      if (invalidProducts.length > 0) {
        showAlert(invalidProducts[0], "error");
        loader.style.display = "none";
        return;
      }

      // 4. Send to API
      const apiPromises = products.map((product) => addProduct(product));
      await Promise.all(apiPromises);

      // 5. Success
      showAlert(`${products.length} products added successfully!`, "success");

      // Clear Form and Preview
      inputField.value = "";
      updatePreview();
    } catch (error) {
      console.error(error);
      showAlert("Failed to add products. Check console for details.", "error");
    } finally {
      // Hide Loader
      loader.style.display = "none";
    }
  });
});
