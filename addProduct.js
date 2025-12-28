import { parseBulkProducts } from "./helper.js";
import { addProduct } from "./product.js";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addProductForm");
  const inputField = document.getElementById("productData");
  const clearBtn = document.getElementById("clearBtn");
  const loader = document.getElementById("loader");
  const pasteBtn = document.getElementById("pasteBtn");

  // Alert Elements
  const alertBox = document.getElementById("alert-box");
  const alertMsg = document.getElementById("alert-message");
  const alertIcon = document.getElementById("alert-icon");

  // Helper function to show alerts
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

  // paste button logic
  pasteBtn.addEventListener("click", async () => {
    try {
      // Modern Clipboard API
      const text = await navigator.clipboard.readText();
      if (text) {
        inputField.value = text;
        inputField.focus(); // Focus back to textarea

        // Optional: Visual feedback on button (Quick flash)
        const originalIcon = pasteBtn.innerHTML;
        pasteBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(() => {
          pasteBtn.innerHTML = originalIcon;
        }, 1000);
      } else {
        alert("Clipboard is empty!");
      }
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      alert("Unable to access clipboard. Please paste manually (Ctrl+V).");
    }
  });

  // Clear Button Logic
  clearBtn.addEventListener("click", () => {
    inputField.value = "";
    inputField.focus();
  });

  // Submit Logic
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const textData = inputField.value.trim();

    // Validation: Check if empty
    if (!textData) {
      showAlert("Please enter valid product details text.", "error");
      return;
    }

    // Show Loader
    loader.style.display = "flex";

    // SIMULATION of backend Call (Node/Express ke sath baad me jodenge)
    // Yahan aap apna fetch logic likhenge
    try {
      // Simulate 1 second delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success Scenario
      // TODO: Yaha actual API call aayega
      const response = parseBulkProducts(textData);
      console.log("Data submitted:", response);
      response.forEach(async (product) => {
        const response = await addProduct(product);
        console.log(response);
      });
      showAlert("Product added successfully!", "success");
      inputField.value = ""; // Clear form on success
    } catch (error) {
      console.error(error);
      showAlert("Failed to add product. Please try again.", "error");
    } finally {
      // Hide Loader
      loader.style.display = "none";
    }
  });
});
