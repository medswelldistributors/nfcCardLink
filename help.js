/**
 * [FILE ROLE]
 * - Initialize help page with admin navbar and auth
 */
import { initAdminPage } from "./adminNavbar.js";

document.addEventListener("DOMContentLoaded", async () => {
  // --- INIT ADMIN PAGE: Auth check, navbar, logout ---
  const user = await initAdminPage();
  if (!user) return;

  // Help page specific logic (if any) goes here
});
