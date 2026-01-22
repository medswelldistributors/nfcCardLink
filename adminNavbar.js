/**
 * [FILE ROLE]
 * - Inject admin navbar into pages
 * - Handle auth check and logout
 * - Set active link based on current page
 *
 * [USAGE]
 * import { initAdminPage } from "./adminNavbar.js";
 * await initAdminPage(); // Returns user or redirects to login
 */

import { requireAuth, logout } from "./services.firebase.js";

/* ======================
   NAVBAR HTML TEMPLATE
====================== */
const navbarHTML = `
<nav class="navbar navbar-expand-lg admin-navbar" id="admin-navbar">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center" href="index.html">
      <i class="fa-solid fa-pills me-2" style="color: var(--brand-secondary)"></i>
      MedsWell Admin
    </a>

    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar" aria-controls="adminNavbar" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon">
        <i class="fa-solid fa-bars"></i>
      </span>
    </button>

    <div class="collapse navbar-collapse" id="adminNavbar">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="index.html" data-page="home"> <i class="fa-solid fa-home me-2"></i>Home </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="catlogue.html" data-page="catalogue"> <i class="fa-solid fa-list me-2"></i>Catalogue </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="addProduct.html" data-page="addProduct"> <i class="fa-solid fa-plus me-2"></i>Add Product </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="updateProduct.html" data-page="updateProduct"> <i class="fa-solid fa-edit me-2"></i>Update Product </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="help.html" data-page="help"> <i class="fa-solid fa-circle-question me-2"></i>Help </a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-danger" href="#" id="logoutBtn"> <i class="fa-solid fa-right-from-bracket me-2"></i>Logout </a>
        </li>
      </ul>
    </div>
  </div>
</nav>
`;

/* ======================
   INJECT NAVBAR
====================== */
function injectNavbar(containerId = "navbar-container") {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = navbarHTML;
  } else {
    // If no container, insert at beginning of body
    document.body.insertAdjacentHTML("afterbegin", navbarHTML);
  }
}

/* ======================
   SET ACTIVE LINK
====================== */
function setActiveLink() {
  const currentPath = window.location.pathname;
  let currentPage = "";

  if (currentPath.includes("updateProduct.html")) {
    currentPage = "updateProduct";
  } else if (currentPath.includes("addProduct.html")) {
    currentPage = "addProduct";
  } else if (currentPath.includes("catlogue.html")) {
    currentPage = "catalogue";
  } else if (currentPath.includes("help.html")) {
    currentPage = "help";
  } else if (currentPath.includes("index.html") || currentPath === "/" || currentPath.endsWith("/")) {
    currentPage = "home";
  }

  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  navLinks.forEach((link) => {
    if (link.getAttribute("data-page") === currentPage) {
      link.classList.add("active");
    }
  });
}

/* ======================
   SETUP NAVBAR BEHAVIOR
====================== */
function setupNavbarBehavior() {
  const navbar = document.getElementById("admin-navbar");
  const navbarCollapse = document.getElementById("adminNavbar");
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

  // Sticky navbar on scroll
  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (navbar) {
      if (scrollTop > 50) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
  });

  // Close mobile menu when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 992 && navbarCollapse) {
        const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
          hide: true,
        });
      }
    });
  });

  // Handle keyboard navigation (Escape to close)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && window.innerWidth < 992 && navbarCollapse) {
      const bsCollapse = new bootstrap.Collapse(navbarCollapse, {
        hide: true,
      });
    }
  });
}

/* ======================
   SETUP LOGOUT
====================== */
function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

/* ======================
   MAIN INIT FUNCTION
====================== */
/**
 * Initialize admin page with auth check and navbar
 * @param {string} containerId - Optional ID of navbar container element
 * @returns {Promise<User|null>} - Returns authenticated user or null (redirects if not authenticated)
 */
export async function initAdminPage(containerId = "navbar-container") {
  // 1. Auth check first
  const user = await requireAuth("index.html");
  if (!user) return null;

  // 2. Inject navbar
  injectNavbar(containerId);

  // 3. Set active link
  setActiveLink();

  // 4. Setup behavior
  setupNavbarBehavior();

  // 5. Setup logout
  setupLogout();

  return user;
}

// Export individual functions for flexibility
export { injectNavbar, setActiveLink, setupNavbarBehavior, setupLogout };
