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

  // --- 1.5. HELPER: Submit Button Loading State ---
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn.innerHTML;

  const setButtonLoading = (isLoading) => {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Adding...';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
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

  // --- HELPER: Show Results Modal ---
  const showResultsModal = (results) => {
    const modalBody = document.getElementById("resultsModalBody");
    const modalHeader = document.getElementById("resultsModalHeader");

    const successCount = results.filter((r) => r.status === "success").length;
    const failCount = results.filter((r) => r.status === "failed").length;

    // Header color based on results
    if (failCount === 0) {
      modalHeader.style.background = "linear-gradient(135deg, #198754, #20c997)";
      modalHeader.style.color = "white";
    } else if (successCount === 0) {
      modalHeader.style.background = "linear-gradient(135deg, #dc3545, #e74c3c)";
      modalHeader.style.color = "white";
    } else {
      modalHeader.style.background = "linear-gradient(135deg, #fd7e14, #ffc107)";
      modalHeader.style.color = "#333";
    }

    // Build result items HTML
    let html = `<div class="mb-3 d-flex gap-2 flex-wrap">
      <span class="badge bg-success rounded-pill px-3 py-2">
        <i class="fa-solid fa-check me-1"></i>${successCount} Added
      </span>
      <span class="badge bg-danger rounded-pill px-3 py-2">
        <i class="fa-solid fa-xmark me-1"></i>${failCount} Failed
      </span>
    </div>`;

    results.forEach((r) => {
      const isSuccess = r.status === "success";
      const icon = isSuccess ? "fa-circle-check" : "fa-circle-xmark";
      const color = isSuccess ? "success" : "danger";
      const borderColor = isSuccess ? "#198754" : "#dc3545";

      html += `
        <div class="d-flex align-items-start gap-2 p-2 mb-2" style="border-left: 3px solid ${borderColor}; background: ${isSuccess ? "#f0fdf4" : "#fef2f2"}; border-radius: 6px;">
          <i class="fa-solid ${icon} text-${color} mt-1"></i>
          <div style="flex:1; min-width:0;">
            <strong class="d-block text-truncate" style="font-size:0.9rem;">#${r.index} ${r.name}</strong>
            ${!isSuccess ? `<small class="text-danger">${r.reason}</small>` : ""}
          </div>
        </div>`;
    });

    modalBody.innerHTML = html;

    const modal = new bootstrap.Modal(document.getElementById("resultsModal"));
    modal.show();
  };

  // D. Submit Logic — Per-product tracking with detailed results
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textData = inputField.value.trim();

    // Validation: Check empty input
    if (isEmpty(textData)) {
      showAlert("Please enter valid product details text.", "error");
      return;
    }

    // Show Loader + Disable Button
    loader.style.display = "flex";
    setButtonLoading(true);

    try {
      // 1. Parse Data
      const products = parseBulkProducts(textData);
      console.log("Parsed Data:", products);

      // 2. Validate: Check if any products were parsed
      if (products.length === 0) {
        showAlert("No valid products found. Each product needs at least 9 lines.", "error");
        return;
      }

      // 3. Process each product individually — track results
      const results = [];

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const productLabel = product.name || `Product ${i + 1}`;

        // 3a. Validate this product
        const validation = validateProductForm(product);
        if (!validation.isValid) {
          results.push({
            index: i + 1,
            name: productLabel,
            status: "failed",
            reason: validation.errors.join(", "),
          });
          continue; // Skip to next product
        }

        // 3b. Try adding to Firestore
        try {
          await addProduct(product);
          results.push({
            index: i + 1,
            name: productLabel,
            status: "success",
          });
        } catch (apiError) {
          console.error(`Failed to add "${productLabel}":`, apiError);
          results.push({
            index: i + 1,
            name: productLabel,
            status: "failed",
            reason: apiError.message || "Firestore write failed",
          });
        }
      }

      // 4. Show detailed results modal
      const successCount = results.filter((r) => r.status === "success").length;
      const failCount = results.filter((r) => r.status === "failed").length;

      showResultsModal(results);

      // Also show a quick alert
      if (failCount === 0) {
        showAlert(`All ${successCount} products added successfully!`, "success");
        inputField.value = "";
        updatePreview();
      } else if (successCount === 0) {
        showAlert(`All ${failCount} products failed. See details above.`, "error");
      } else {
        showAlert(`${successCount} added, ${failCount} failed. See details above.`, "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("Unexpected error. Check console for details.", "error");
    } finally {
      // Hide Loader + Re-enable Button
      loader.style.display = "none";
      setButtonLoading(false);
    }
  });
});
