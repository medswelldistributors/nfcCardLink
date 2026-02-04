/**
 * [FILE ROLE]
 * - handle login and authentication
 *
 * [FLOW]
 *  submit → signInWithEmailAndPassword → Result
 *
 * [DEPENDENCIES]
 * - firebase.js (auth connection)
 * - other imports...
 */
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { auth } from "./firebase.js";
import { validateLoginForm } from "./helper.js";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginBtn = document.getElementById("loginBtn");
  const btnText = document.getElementById("btn-text");
  const btnLoader = document.getElementById("btn-loader");
  const alertBox = document.getElementById("login-alert");
  const alertText = document.getElementById("alert-text");

  // 1. Toggle Password Visibility (Eye Icon)
  togglePasswordBtn.addEventListener("click", () => {
    const icon = togglePasswordBtn.querySelector("i");

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });

  // 2. Helper: Show/Hide Error
  const showError = (message) => {
    alertText.textContent = message;
    alertBox.style.display = "block";
    // Shake animation effect
    const card = document.querySelector(".login-card");
    card.style.transform = "translateX(5px)";
    setTimeout(() => (card.style.transform = "translateX(-5px)"), 100);
    setTimeout(() => (card.style.transform = "translateX(0)"), 200);
  };

  const hideError = () => {
    alertBox.style.display = "none";
  };

  // 3. Helper: Loading State
  const setLoading = (isLoading) => {
    if (isLoading) {
      loginBtn.disabled = true;
      btnText.textContent = "Verifying...";
      btnLoader.classList.remove("d-none");
    } else {
      loginBtn.disabled = false;
      btnText.textContent = "Sign In";
      btnLoader.classList.add("d-none");
    }
  };

  // 4. Submit Handler
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    // Validate login form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      showError(validation.error);
      return;
    }

    setLoading(true);

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Success - redirect to Admin Page
      window.location.href = "/addProduct.html";
    } catch (error) {
      console.error(error);

      // Handle specific Firebase auth errors
      let errorMessage = "Login failed. Please try again.";
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password" || error.code === "auth/user-not-found") {
        errorMessage = "Invalid email or password.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      }

      showError(errorMessage);
      setLoading(false);
    }
  });
});
