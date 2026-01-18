# 🎓 MedsWell Code Study Guide

> **Goal**: Understand every line, gain full control, improve independently

---

## 📅 Day 1–2: Understanding (File Headers & Flow)

### ✅ Task 1: Add File Headers (You Started This!)

Add this template to remaining files:

```javascript
/**
 * [FILE ROLE]
 * - What this file does
 * - What it controls
 *
 * [FLOW]
 * Trigger → Function1 → Function2 → Result
 *
 * [DEPENDENCIES]
 * - firebase.js (db connection)
 * - other imports...
 */
```

**Files to add headers:**

- [ ] `firebase.js` - Database config
- [ ] `helper.js` - Text parsing
- [ ] `pdfGenerator.js` - PDF creation
- [ ] `login.js` - Authentication
- [ ] `index.js` - Landing page vCard

---

### ✅ Task 2: Create Flow Diagrams (Text)

#### A) Catalogue Page Flow

```
[catlogue.html loads]
       ↓
[product.js: DOMContentLoaded]
       ↓
[fetchProducts()] ──→ Firebase Firestore
       ↓
[renderProducts()] ──→ Creates HTML cards
       ↓
[bindEvents()] ──→ Attaches click/search handlers
       ↓
[User clicks product] ──→ [show modal]
[User checks product] ──→ [add to cart Map]
[User clicks "Place Order"] ──→ [WhatsApp redirect]
```

#### B) Add Product Flow

```
[addProduct.html loads]
       ↓
[User types/pastes text]
       ↓
[updatePreview()] ──→ Shows live preview
       ↓
[Submit button clicked]
       ↓
[parseBulkProducts()] in helper.js ──→ Returns array
       ↓
[Loop: addProduct()] ──→ Firebase addDoc
       ↓
[Show success alert]
```

#### C) PDF Generation Flow

```
[User clicks "Download PDF"]
       ↓
[generateProductPDF()]
       ↓
[fetchAllProducts()] from Firebase
       ↓
[loadImageAsBase64()] for logo & QR
       ↓
[drawHeader()] ──→ Black header with logo
       ↓
[doc.autoTable()] ──→ Product table
  ↳ [didParseCell] ──→ Popular row styling
  ↳ [didDrawCell] ──→ Amber stripe
       ↓
[doc.save()] ──→ Download PDF
```

---

### ✅ Task 3: Understand Each Function

Open each file and write notes:

#### `product.js` - Key Functions

| Function                  | Purpose          | Inputs → Outputs   |
| ------------------------- | ---------------- | ------------------ |
| `fetchProducts()`         | Get all products | none → array       |
| `addProduct(data)`        | Add new product  | object → docRef    |
| `updateProduct(id, data)` | Update product   | id, object → void  |
| `deleteProduct(id)`       | Delete product   | id → void          |
| `renderProducts(arr)`     | Create HTML      | array → DOM        |
| `calculateTotalUnits()`   | Count units      | card, qty → number |

#### `helper.js` - Text Parser

```
Input:  "Product1\nContent\nForm...\n\nProduct2..."
        (separated by empty lines)

Output: [{ name, content, form, mg, mrp, rate, unitOfSale, unitName, imageUrl }, ...]
```

**Study Questions to Answer:**

1. `parseBulkProducts()` mein `split(/\n\s*\n/)` kya karta hai?
2. Agar 8 se kam lines ho to kya hota hai?
3. Optional imageUrl ko kaise handle kiya hai?

---

## 📅 Day 3–4: Refinement

### ✅ Task 4: Isolate API Calls

Currently API calls are mixed with UI. Better pattern:

**Before (Mixed):**

```javascript
form.addEventListener("submit", async (e) => {
  // UI code
  loader.style.display = "flex";

  // API call mixed in
  await addDoc(collection(db, "catlogue"), data);

  // More UI code
  showAlert("Success!");
});
```

**After (Isolated):**

```javascript
// api.js - Separate file for API only
export async function addProductAPI(data) {
  return await addDoc(collection(db, "catlogue"), data);
}

// form.js - UI only
form.addEventListener("submit", async (e) => {
  loader.style.display = "flex";
  try {
    await addProductAPI(data); // Clean call
    showAlert("Success!");
  } catch (err) {
    showAlert("Failed!");
  }
});
```

**Exercise:** product.js mein dekho - API aur UI kahan mixed hai?

---

### ✅ Task 5: Explicit Validation

Add validation before Firebase calls:

```javascript
function validateProduct(data) {
  const errors = [];

  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required");
  }
  if (typeof data.mrp !== "number" || data.mrp < 0) {
    errors.push("MRP must be positive number");
  }
  if (typeof data.rate !== "number" || data.rate < 0) {
    errors.push("Rate must be positive number");
  }

  return { isValid: errors.length === 0, errors };
}

// Before adding:
const validation = validateProduct(productData);
if (!validation.isValid) {
  showAlert(validation.errors.join(", "), "error");
  return;
}
```

**Exercise:** helper.js ka `parseBulkProducts()` kaisi validation karta hai?

---

### ✅ Task 6: Consistent Error Handling

Pattern to follow everywhere:

```javascript
async function safeApiCall(apiFunction, successMsg, errorMsg) {
  try {
    const result = await apiFunction();
    showAlert(successMsg, "success");
    return result;
  } catch (error) {
    console.error(error);
    showAlert(errorMsg, "error");
    return null;
  }
}

// Usage:
await safeApiCall(() => updateProduct(id, data), "Product updated!", "Update failed");
```

---

## 📅 Day 5: Testing

### ✅ Task 7: Firestore Test Cases

Manually test these scenarios:

| Test Case              | Steps                      | Expected                       |
| ---------------------- | -------------------------- | ------------------------------ |
| Add valid product      | Fill all 8 fields → Submit | Success alert, product appears |
| Add incomplete product | Only 4 lines → Submit      | Should skip/warn               |
| Update product         | Change MRP → Update        | New price shows                |
| Delete product         | Click delete → Confirm     | Product gone                   |
| Search empty           | Search "xyz123"            | "No products found"            |
| Popular toggle         | Check isPopular → Update   | Yellow bg in PDF               |

### ✅ Task 8: PDF Edge Cases

| Test Case          | Steps                              | Expected                     |
| ------------------ | ---------------------------------- | ---------------------------- |
| Empty catalogue    | Delete all products → Generate PDF | Alert "No products"          |
| Long product name  | Name 100+ chars                    | Text should wrap             |
| No images          | Remove logo/QR files               | PDF still generates          |
| Many products      | 100+ products                      | Multiple pages, page numbers |
| Special characters | Product with "&", "<"              | Should render correctly      |

---

## 📅 Day 6–7: Confidence Building

### ✅ Task 9: Manual Changes Without AI

Try these yourself:

1. **Change button color** in addProduct.html
2. **Add new field** "Batch Number" to product
3. **Change PDF header** background color
4. **Add "Clear Cart"** button to catalogue
5. **Sort products** by name alphabetically

### ✅ Task 10: Document Your Changes

After each change, write:

```
## Change: Added Batch Number field

### Files Modified:
- addProduct.html (line 45)
- helper.js (line 25)
- product.js (line 60)

### What I Learned:
- Data flows through helper.js parser
- Template literals need exact spacing
```

---

## 📚 Quick Reference

### Firebase Methods

| Method                     | Purpose                |
| -------------------------- | ---------------------- |
| `getDocs(collection)`      | Get all documents      |
| `addDoc(collection, data)` | Add new document       |
| `updateDoc(docRef, data)`  | Update document        |
| `deleteDoc(docRef)`        | Delete document        |
| `doc(db, "catlogue", id)`  | Get document reference |

### jsPDF AutoTable Hooks

| Hook           | When          | Use For                     |
| -------------- | ------------- | --------------------------- |
| `didParseCell` | Before render | Style changes (font, color) |
| `willDrawCell` | Before draw   | Last-minute changes         |
| `didDrawCell`  | After draw    | Custom graphics (stripes)   |
| `didDrawPage`  | After page    | Page numbers, footers       |

---

## 🎯 Self-Check Questions

After 7 days, you should answer:

1. Firebase mein data kaise store hota hai?
2. parseBulkProducts() empty lines ko kaise handle karta hai?
3. Popular products PDF mein kaise highlight hote hain?
4. Cart system kaise kaam karta hai? (Map data structure)
5. WhatsApp order message kaise generate hota hai?
6. addProduct aur updateProduct mein kya difference hai?

---

## 💪 Aapki Progress

- [ ] Day 1: All file headers added
- [ ] Day 2: Flow diagrams understood
- [ ] Day 3: API calls identified
- [ ] Day 4: Validation patterns studied
- [ ] Day 5: Test cases executed
- [ ] Day 6: 3 manual changes done
- [ ] Day 7: Confidence achieved! 🎉

---

**Tip**: Jab bhi koi function samajh na aaye, `console.log()` lagao aur browser DevTools mein dekho!
