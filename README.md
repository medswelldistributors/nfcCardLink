# MedsWell Distributors - Product Catalogue System

> A complete medical product catalogue and ordering system built for **MedsWell Distributors**, Surkhai, Gujarat.

---

## 📋 Project Overview

| Attribute         | Value                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------------- |
| **Business Name** | MedsWell Distributors                                                                     |
| **Owner**         | Aniket Parmar                                                                             |
| **Location**      | 766/9, J.S.D Complex, Near Bus Stand, SURKHAI, Ta: Chikhli, Di: Navsari, Gujarat - 396560 |
| **Live URL**      | https://medswelldistributors.in                                                           |
| **Contact**       | +91 9904685222 (WhatsApp)                                                                 |

---

## 🎯 Features

### Customer Features

- 📦 **Product Catalogue** - Browse all medical products with images, prices, and details
- 🔍 **Real-time Search** - Filter products by name or content as you type
- 🛒 **Cart System** - Select products with quantity, order via WhatsApp
- 📄 **PDF Download** - Generate complete catalogue PDF with QR code
- ⭐ **Popular Products** - Highlighted products with yellow badge and PDF marking
- 📱 **Responsive Design** - Works on all devices (mobile/tablet/desktop)

### Admin Features

- 🔐 **Admin Login** - Firebase authentication protected admin panel
- ➕ **Add Products** - Bulk add products using text input (notebook-style textarea)
- ✏️ **Update Products** - Search, edit and update existing products
- 🗑️ **Delete Products** - Remove products with confirmation
- ⭐ **Toggle Popular** - Mark/unmark products as popular

---

## 🗂️ File Structure

```
catlogue/
├── assets/
│   ├── Card.jpg                 # Logo image for PDF header
│   └── Medswell_Site_QR.png     # QR code for PDF
│
├── index.html                   # Landing/Profile page
├── index.js                     # Landing page JavaScript (vCard download)
├── catlogue.html                # Main product catalogue page
├── product.js                   # Product rendering & ordering logic
├── login.html                   # Admin login page
├── login.js                     # Firebase auth login logic
├── addProduct.html              # Admin - bulk add products page
├── addProduct.js                # Add product form logic
├── updateProduct.html           # Admin - search & edit products
├── updateProduct.js             # Update/delete product logic
├── helper.js                    # Text parsing utility functions
├── pdfGenerator.js              # PDF catalogue generation
├── firebase.js                  # Firebase configuration & exports
└── README.md                    # This documentation file
```

---

## 🛠️ Tech Stack

| Technology                   | Purpose                     |
| ---------------------------- | --------------------------- |
| **HTML5 / CSS3**             | Structure and styling       |
| **JavaScript (ES6 Modules)** | Application logic           |
| **Bootstrap 5.3**            | Responsive UI components    |
| **Font Awesome 6**           | Icons                       |
| **Google Fonts (Poppins)**   | Typography                  |
| **Firebase Firestore**       | NoSQL database for products |
| **Firebase Auth**            | Admin authentication        |
| **jsPDF + AutoTable**        | PDF generation              |
| **Cloudinary**               | Image hosting               |

---

## 🗃️ Database Structure

### Firebase Firestore Collection: `catlogue`

Each product document has these fields:

| Field         | Type      | Description             | Example                |
| ------------- | --------- | ----------------------- | ---------------------- |
| `name`        | string    | Product name            | "Paracetamol 500mg"    |
| `companyName` | string    | Manufacturer            | "Cipla Ltd"            |
| `content`     | string    | Composition/ingredients | "Paracetamol IP 500mg" |
| `form`        | string    | Dosage form             | "Tablet"               |
| `mg`          | string    | Strength/volume         | "500mg"                |
| `mrp`         | number    | Maximum retail price    | 45.00                  |
| `rate`        | number    | Dealer price            | 35.50                  |
| `unitOfSale`  | string    | Selling unit            | "Box" / "Strip"        |
| `unitName`    | string    | Individual unit name    | "Tablet" / "Capsule"   |
| `imageUrl`    | string    | Product image URL       | "https://..."          |
| `isPopular`   | boolean   | Popular product flag    | true                   |
| `createdAt`   | timestamp | Creation time           | (auto)                 |
| `updatedAt`   | timestamp | Last update time        | (auto)                 |

---

## 📄 Page Descriptions

### 1. Landing Page (`index.html`)

- Company profile card with logo, owner photo
- Contact buttons: Add to Contact, WhatsApp, Email
- Link to product catalogue

### 2. Catalogue Page (`catlogue.html`)

- Grid of product cards with images
- Real-time search filter
- Click card to see product modal
- Checkbox to add to cart with quantity selector
- Floating "Place Order" button → WhatsApp order
- PDF download button

### 3. Login Page (`login.html`)

- Admin authentication using Firebase
- Email/password login
- Redirects to addProduct after login

### 4. Add Product (`addProduct.html`)

- Notebook-style textarea with line numbers
- Live preview visualizer showing parsed products
- Paste button for quick input
- Bulk product addition to Firebase

### 5. Update Product (`updateProduct.html`)

- Real-time search to find products
- Click product to select and edit
- Form with all editable fields
- Update and Delete buttons

---

## 🎨 Design System

### Brand Colors

| Name           | Hex       | Usage                     |
| -------------- | --------- | ------------------------- |
| Primary        | `#0d2c54` | Headers, buttons          |
| Secondary      | `#21b2a6` | Accents, links            |
| Popular Bg     | `#FEF3C7` | Popular product highlight |
| Popular Stripe | `#F59E0B` | Popular indicator stripe  |

### Typography

- **Font**: Poppins (Google Fonts)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 📄 PDF Features

The PDF generator creates a professional catalogue with:

- **Header**: Black background, company logo (left), title (center), QR code (right)
- **Table**: Product list with NO, NAME, COMPANY, CONTENT, MRP, RATE columns
- **Popular Highlighting**: Yellow row background + amber stripe on left
- **Page Numbers**: Centered at bottom
- **File Name**: `MedsWell_Catalogue_YYYY-MM-DD.pdf`

---

## 🔧 Firebase Functions (product.js)

| Function                  | Description                     |
| ------------------------- | ------------------------------- |
| `fetchProducts()`         | Get all products from Firestore |
| `addProduct(data)`        | Add new product document        |
| `updateProduct(id, data)` | Update existing product         |
| `deleteProduct(id)`       | Delete product document         |
| `getProductById(id)`      | Get single product by ID        |

---

## 💡 How to Add New Products

### Bulk Text Format (for addProduct page):

```
Product Name
Content/Composition
Form (Tablet/Syrup/etc)
Strength/MG
MRP
Rate
Unit of Sale (Box/Strip)
Unit Name (Tablet/Capsule)
Image URL (optional)

Next Product Name
...
```

Products are separated by **empty lines**.

---

## 🔐 Admin Access

| Page           | URL                   | Protected        |
| -------------- | --------------------- | ---------------- |
| Add Product    | `/addProduct.html`    | ✅ Firebase Auth |
| Update Product | `/updateProduct.html` | ✅ Firebase Auth |
| Login          | `/login.html`         | Public           |

---

## 🚀 Deployment

The site is hosted at: **https://medswelldistributors.in**

To deploy updates:

1. Make changes to files
2. Commit and push to hosting provider
3. Clear browser cache if needed

---

## 📞 Support & Credits

**Developed by**: Parmar Aayush  
**WhatsApp**: +91 8154818652  
**Email**: parmaraush1816@gmail.com

---

## 📝 AI Agent Prompt Template

When giving prompts to AI agents about this project, use this template:

```
Project: MedsWell Distributors Product Catalogue
Tech Stack: HTML, CSS, JavaScript (ES6), Bootstrap 5, Firebase Firestore, jsPDF
Main Files:
- catlogue.html / product.js - Product display and ordering
- addProduct.html / addProduct.js - Bulk product addition
- updateProduct.html / updateProduct.js - Edit/delete products
- pdfGenerator.js - PDF catalogue generation
- firebase.js - Firebase config

Database: Firebase Firestore, collection "catlogue"
Product fields: name, companyName, content, form, mg, mrp, rate, unitOfSale, unitName, imageUrl, isPopular

Current Task: [describe what you need]
```
