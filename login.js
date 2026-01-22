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

    // --- SIMULATED API CALL ---
    try {
      // Simulate network delay (Wait for 1.5 seconds)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // LOGIC FOR DEMO (Remove this when connecting to backend)
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          window.location.href = "/addProduct.html"; // Redirect to Admin Page
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          throw new Error("Invalid email or password.");
        });
    } catch (error) {
      console.error(error);
      showError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  });
});
