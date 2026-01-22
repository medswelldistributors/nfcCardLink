# MedsWell Distributors - Developer Documentation

> **Complete technical documentation for AI agents and developers to add, modify, or remove features with full consistency.**

---

## 🏢 Project Overview

| Attribute      | Value                                                |
| -------------- | ---------------------------------------------------- |
| **Project**    | MedsWell Distributors Product Catalogue              |
| **Type**       | Medical Product Catalogue & Ordering System          |
| **Owner**      | Aniket Parmar                                        |
| **Live URL**   | https://medswelldistributors.in                      |
| **Tech Stack** | HTML5, CSS3, JavaScript (ES6), Bootstrap 5, Firebase |

---

## 🎨 Design System & Brand Colors

### CSS Variables (Root)

```css
:root {
  --brand-primary: #0d2c54; /* Dark Blue - Headers, Navbar, Buttons */
  --brand-secondary: #21b2a6; /* Teal - Accents, Links, Badges */
  --brand-bg: #f8f9fa; /* Light Gray - Page Background */
  --brand-text: #343a40; /* Dark Gray - Body Text */
}
```

### Color Usage Reference

| Color              | Hex       | RGB                  | Usage                                     |
| ------------------ | --------- | -------------------- | ----------------------------------------- |
| **Primary**        | `#0d2c54` | `rgb(13, 44, 84)`    | Navbar brand, button backgrounds, headers |
| **Secondary**      | `#21b2a6` | `rgb(33, 178, 166)`  | Links, active states, badges, checkmarks  |
| **Background**     | `#f8f9fa` | `rgb(248, 249, 250)` | Page background                           |
| **Text**           | `#343a40` | `rgb(52, 58, 64)`    | Body text, paragraphs                     |
| **Popular BG**     | `#FEF3C7` | `rgb(254, 243, 199)` | Popular product card background           |
| **Popular Stripe** | `#F59E0B` | `rgb(245, 158, 11)`  | Popular indicator stripe/badge            |
| **Success**        | `#198754` | `rgb(25, 135, 84)`   | Success toasts, green accents             |
| **Error**          | `#dc3545` | `rgb(220, 53, 69)`   | Error toasts, delete button, warnings     |
| **Warning**        | `#ffc107` | `rgb(255, 193, 7)`   | Warning alerts, popular star              |

### Typography

```css
font-family: "Poppins", sans-serif;
/* Weights used: 400, 500, 600, 700 */
/* Google Fonts Link: https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap */
```

---

## 📁 Complete File Structure

```
catlogue/
├── assets/
│   ├── Card.jpg                 # Company logo for PDF header
│   └── Medswell_Site_QR.png     # QR code for PDF footer
│
├── index.html                   # Landing/Profile page (public)
├── index.js                     # vCard download functionality
│
├── catlogue.html                # Product catalogue display (public)
├── product.js                   # Product rendering, cart, WhatsApp ordering
├── pdfGenerator.js              # PDF catalogue generation with jsPDF
│
├── login.html                   # Admin login page (public)
├── login.js                     # Firebase authentication logic
│
├── addProduct.html              # Bulk add products (auth protected)
├── addProduct.js                # Form submission, preview, product addition
│
├── updateProduct.html           # Search & edit products (auth protected)
├── updateProduct.js             # Update, delete product logic
│
├── help.html                    # Admin help guide (auth protected)
├── help.js                      # Help page auth handler
│
├── firebase.js                  # Firebase config & exports (db, auth)
├── services.firebase.js         # Firestore CRUD + Auth functions
├── helper.js                    # Text parsing utility (parseBulkProducts)
│
└── README.md                    # This documentation
```

---

## 🔧 File Roles & Responsibilities

### Core firebase.js

```javascript
// PURPOSE: Firebase initialization and exports
// EXPORTS: db (Firestore), auth (Firebase Auth)

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  /* ... */
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### services.firebase.js - API Functions

| Function                     | Purpose                   | Parameters       | Returns             |
| ---------------------------- | ------------------------- | ---------------- | ------------------- | ------ |
| `fetchProducts()`            | Get all products          | none             | `Array<Product>`    |
| `addProduct(product)`        | Add new product           | `Product object` | `DocumentReference` |
| `updateProduct(docId, data)` | Update product            | `string, object` | `void`              |
| `deleteProduct(docId)`       | Delete product            | `string`         | `void`              |
| `getProductById(docId)`      | Get single product        | `string`         | `Product            | null`  |
| `checkAuth()`                | Check if user logged in   | none             | `Promise<User       | null>` |
| `requireAuth(redirectUrl)`   | Redirect if not logged in | `string`         | `User               | null`  |
| `logout(redirectUrl)`        | Sign out user             | `string`         | `void`              |
| `getCurrentUser()`           | Get current user sync     | none             | `User               | null`  |

### helper.js - Parsing Functions

| Function                     | Purpose                     | Input             | Output           |
| ---------------------------- | --------------------------- | ----------------- | ---------------- |
| `parseBulkProducts(rawText)` | Parse text to product array | Multi-line string | `Array<Product>` |

---

## 🗃️ Database Schema (Firebase Firestore)

### Collection: `catlogue`

| Field         | Type        | Required | Description          | Example                  |
| ------------- | ----------- | -------- | -------------------- | ------------------------ |
| `name`        | `string`    | ✅       | Product name         | `"Dolo 650"`             |
| `companyName` | `string`    | ✅       | Manufacturer name    | `"Micro Labs"`           |
| `content`     | `string`    | ✅       | Composition          | `"Paracetamol"`          |
| `form`        | `string`    | ✅       | Dosage form          | `"Tablet"` / `"Syrup"`   |
| `mg`          | `string`    | ✅       | Strength/volume      | `"650mg"` / `"100ml"`    |
| `mrp`         | `number`    | ✅       | Maximum retail price | `35`                     |
| `rate`        | `number`    | ✅       | Dealer/selling price | `28`                     |
| `unitOfSale`  | `string`    | ✅       | Selling unit         | `"Box"` / `"Strip"`      |
| `unitName`    | `string`    | ✅       | Individual unit      | `"Tablet"` / `"Capsule"` |
| `imageUrl`    | `string`    | ❌       | Product image URL    | `"https://..."`          |
| `isPopular`   | `boolean`   | ❌       | Popular flag         | `true` / `false`         |
| `createdAt`   | `timestamp` | Auto     | Creation timestamp   | -                        |
| `updatedAt`   | `timestamp` | Auto     | Update timestamp     | -                        |

### Product Object Example

```javascript
{
  id: "abc123xyz",
  name: "Dolo 650",
  companyName: "Micro Labs",
  content: "Paracetamol",
  form: "Tablet",
  mg: "650mg",
  mrp: 35,
  rate: 28,
  unitOfSale: "Strip",
  unitName: "Tablet",
  imageUrl: "https://example.com/dolo.jpg",
  isPopular: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 📄 Page Architecture

### Public Pages (No Auth Required)

| Page      | File            | Script       | Purpose                           |
| --------- | --------------- | ------------ | --------------------------------- |
| Landing   | `index.html`    | `index.js`   | Company profile, contact buttons  |
| Catalogue | `catlogue.html` | `product.js` | Product grid, search, cart, order |
| Login     | `login.html`    | `login.js`   | Admin authentication              |

### Protected Pages (Auth Required)

| Page           | File                 | Script             | Purpose              |
| -------------- | -------------------- | ------------------ | -------------------- |
| Add Product    | `addProduct.html`    | `addProduct.js`    | Bulk product entry   |
| Update Product | `updateProduct.html` | `updateProduct.js` | Edit/delete products |
| Help           | `help.html`          | `help.js`          | Admin usage guide    |

### Auth Flow

```
Page Load → requireAuth() → onAuthStateChanged
    ├── User exists → Continue page execution
    └── No user → Redirect to index.html (login)
```

---

## 🛒 Add Product Input Format

### Text Format (Line by Line)

```
Line 1:  Product Name       (Required)
Line 2:  Company Name       (Required)
Line 3:  Content            (Required)
Line 4:  Form               (Required)
Line 5:  Strength/mg        (Required)
Line 6:  MRP                (Required, Number)
Line 7:  Rate               (Required, Number)
Line 8:  Unit of Sale       (Required)
Line 9:  Unit Name          (Required)
Line 10: Image URL          (Optional)

[Empty Line = Product Separator]
```

### Example Input

```
Dolo 650
Micro Labs
Paracetamol
Tablet
650mg
35
28
Strip
Tablet
https://example.com/dolo.jpg

Crocin Advance
GSK
Paracetamol
Tablet
500mg
25
20
Box
Tablet
```

---

## 🔐 Authentication System

### Firebase Auth Configuration

- **Method**: Email/Password
- **Storage**: IndexedDB (browser)
- **Persistence**: `browserLocalPersistence` (survives browser close)
- **Token Expiry**: Auto-refresh (~1 hour tokens)

### Auth Functions Usage

```javascript
// Check auth on page load
const user = await requireAuth("index.html");
if (!user) return;

// Logout
await logout("index.html");

// Get current user
const currentUser = getCurrentUser();
```

---

## 📄 PDF Generation (pdfGenerator.js)

### PDF Structure

| Section      | Description                                               |
| ------------ | --------------------------------------------------------- |
| Header       | Black background, logo (left), title (center), QR (right) |
| Table        | Columns: NO, NAME, COMPANY, CONTENT, MRP, RATE            |
| Popular Rows | Yellow background (#FEF3C7) + amber left stripe           |
| Footer       | Page numbers centered                                     |

### Generated Filename

```
MedsWell_Catalogue_YYYY-MM-DD.pdf
```

---

## 🧩 Component Patterns

### Admin Navbar HTML Template

```html
<nav class="navbar navbar-expand-lg admin-navbar" id="admin-navbar">
  <div class="container">
    <a class="navbar-brand d-flex align-items-center" href="index.html">
      <i class="fa-solid fa-pills me-2" style="color: var(--brand-secondary)"></i>
      MedsWell Admin
    </a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#adminNavbar">
      <span class="navbar-toggler-icon"><i class="fa-solid fa-bars"></i></span>
    </button>
    <div class="collapse navbar-collapse" id="adminNavbar">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link" href="index.html" data-page="home"><i class="fa-solid fa-home me-2"></i>Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="catlogue.html" data-page="catalogue"><i class="fa-solid fa-list me-2"></i>Catalogue</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="addProduct.html" data-page="addProduct"><i class="fa-solid fa-plus me-2"></i>Add Product</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="updateProduct.html" data-page="updateProduct"><i class="fa-solid fa-edit me-2"></i>Update Product</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="help.html" data-page="help"><i class="fa-solid fa-circle-question me-2"></i>Help</a>
        </li>
        <li class="nav-item">
          <a class="nav-link text-danger" href="#" id="logoutBtn"><i class="fa-solid fa-right-from-bracket me-2"></i>Logout</a>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

### Toast Notification Pattern

```javascript
// Toast types: success, error, warning, info
showToast("Message here", "success", 3000); // duration in ms
```

### Admin Page JS Template

```javascript
import { requireAuth, logout } from "./services.firebase.js";

document.addEventListener("DOMContentLoaded", async () => {
  // Auth check
  const user = await requireAuth("index.html");
  if (!user) return;

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Page logic here...
});
```

---

## 🤖 AI Agent Prompt Templates

### For Adding New Feature

```
PROJECT: MedsWell Distributors Catalogue
TECH: HTML, CSS, JS (ES6), Bootstrap 5, Firebase Firestore
COLORS: Primary=#0d2c54, Secondary=#21b2a6, BG=#f8f9fa

FILES TO MODIFY:
- [list relevant files]

CURRENT STRUCTURE:
- services.firebase.js: All Firestore CRUD operations
- helper.js: Text parsing utilities
- Each page has: HTML file + corresponding JS file

DATABASE: Firebase Firestore, collection "catlogue"
PRODUCT FIELDS: name, companyName, content, form, mg, mrp, rate, unitOfSale, unitName, imageUrl, isPopular

TASK: [Describe feature to add]

REQUIREMENTS:
- Maintain color scheme (use CSS variables)
- Follow existing code patterns
- Add auth check for admin pages
- Use Bootstrap 5 components
```

### For Bug Fixes

```
PROJECT: MedsWell Catalogue
BUG LOCATION: [file name]
CURRENT BEHAVIOR: [what's happening]
EXPECTED BEHAVIOR: [what should happen]

CONTEXT:
- Auth: uses requireAuth() from services.firebase.js
- DB: Firebase Firestore, collection "catlogue"
- UI: Bootstrap 5 + Custom CSS with brand variables
```

### For Removing Feature

```
PROJECT: MedsWell Catalogue

FEATURE TO REMOVE: [feature name]

FILES AFFECTED:
- [list files]

CLEANUP NEEDED:
- Remove imports
- Remove event listeners
- Remove HTML elements
- Remove CSS (if feature-specific)
- Remove navbar links if applicable
```

---

## 📦 Dependencies

### CDN Links (Always Include)

```html
<!-- Bootstrap CSS -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />

<!-- Font Awesome -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />

<!-- Bootstrap JS (before closing body) -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
```

### Firebase Imports (ES Modules)

```javascript
// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// services.firebase.js
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
```

### PDF Generation (for pdfGenerator.js)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js"></script>
```

---

## 📞 Contact

**Developer**: Parmar Aayush  
**WhatsApp**: +91 8154818652  
**Email**: parmaraush1816@gmail.com

---

> 📝 **Last Updated**: January 2026
