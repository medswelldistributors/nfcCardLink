/**
 * =============================================================================
 * PDF GENERATOR MODULE - MedsWell Product Catalogue
 * =============================================================================
 * 
 * Purpose: Generates a professional PDF catalogue of all products from Firebase.
 * Author: Added as plug-and-play feature (does not modify existing code)
 * 
 * Dependencies:
 * - jsPDF (loaded via CDN in HTML)
 * - jspdf-autotable plugin (loaded via CDN in HTML)
 * - Firebase config from ./firebase.js
 * 
 * Usage:
 * - Import and call generateProductPDF() to generate and download PDF
 * - Or click the "Download Catalogue PDF" button on the catalogue page
 * 
 * =============================================================================
 */

import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* =============================================================================
   CONFIGURATION - Customize fonts, colors, and spacing here
   ============================================================================= */

const PDF_CONFIG = {
  // Page settings
  pageSize: "a4",
  orientation: "portrait",
  margins: { top: 0, right: 0, bottom: 0, left: 0 },

  // Company info
  companyName: "Medswell Distributors",
  orderUrl: "https://medswelldistributors.in/catlogue",
  logoUrl: "https://res.cloudinary.com/dfvqt9wcy/image/upload/v1761466012/background_Logo_oc9z5i.png",

  // Colors (matching website design)
  colors: {
    primary: [13, 110, 253],      // Bootstrap Blue (#0d6efd)
    headerBg: [52, 58, 64],       // Dark gray (#343a40)
    headerText: [255, 255, 255],  // White
    rowEven: [255, 255, 255],     // White
    rowOdd: [248, 249, 250],      // Light gray (#f8f9fa)
    text: [52, 58, 64],           // Dark gray
    border: [222, 226, 230],      // Light border (#dee2e6)
  },

  // Fonts (using built-in fonts for reliability)
  fonts: {
    header: { size: 16, style: "bold" },
    subheader: { size: 9, style: "normal" },
    tableHeader: { size: 9, style: "bold" },
    tableBody: { size: 10, style: "normal" },
    pageNumber: { size: 5, style: "normal" },
  },

  // Table column widths (percentages of available width)
  columns: {
    no: 5,
    name: 20,
    company: 12,
    content: 50,
    mrp: 7,
    rate: 7,
  },
};

/* =============================================================================
   FETCH PRODUCTS FROM FIREBASE
   ============================================================================= */

/**
 * Fetches all products from the Firebase 'catlogue' collection.
 * This ensures the PDF always contains the latest data.
 * 
 * @returns {Promise<Array>} Array of product objects
 */
async function fetchAllProducts() {
  try {
    const snapshot = await getDocs(collection(db, "catlogue"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("[PDF Generator] Error fetching products:", error);
    throw new Error("Failed to fetch products from database");
  }
}

/* =============================================================================
   QR CODE GENERATOR (Simple implementation using Google Charts API)
   ============================================================================= */

/**
 * Generates a QR code image URL for the given text.
 * Uses Google Charts API for simplicity.
 * 
 * @param {string} text - Text to encode in QR code
 * @param {number} size - Size of QR code in pixels
 * @returns {string} URL of QR code image
 */
function getQRCodeUrl(text, size = 80) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

/**
 * Loads an image and returns it as a base64 data URL.
 * 
 * @param {string} url - Image URL to load
 * @returns {Promise<string>} Base64 data URL of the image
 */
async function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error("Failed to load image: " + url));
    img.src = url;
  });
}

/* =============================================================================
   PDF GENERATION - Main function
   ============================================================================= */

/**
 * Generates and downloads a professional PDF catalogue of all products.
 * This is the main export function - call this to generate the PDF.
 * 
 * @returns {Promise<void>}
 */
export async function generateProductPDF() {
  // Access jsPDF from the global scope (loaded via CDN)
  const { jsPDF } = window.jspdf;

  if (!jsPDF) {
    console.error("[PDF Generator] jsPDF not loaded. Make sure the CDN script is included.");
    alert("PDF library not loaded. Please refresh the page and try again.");
    return;
  }

  try {
    // Show loading state
    const btn = document.getElementById("generate-pdf-btn");
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Generating...';
    btn.disabled = true;

    // 1. Fetch all products from Firebase
    console.log("[PDF Generator] Fetching products from Firebase...");
    const products = await fetchAllProducts();
    console.log(`[PDF Generator] Found ${products.length} products`);

    if (products.length === 0) {
      alert("No products found in the database.");
      btn.innerHTML = originalContent;
      btn.disabled = false;
      return;
    }

    // 2. Initialize PDF document
    const doc = new jsPDF({
      orientation: PDF_CONFIG.orientation,
      unit: "mm",
      format: PDF_CONFIG.pageSize,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PDF_CONFIG.margins.left - PDF_CONFIG.margins.right;

    // 3. Load images (logo and QR code)
    let logoBase64 = null;
    let qrBase64 = null;

    try {
      [logoBase64, qrBase64] = await Promise.all([
        loadImageAsBase64(PDF_CONFIG.logoUrl),
        loadImageAsBase64(getQRCodeUrl(PDF_CONFIG.orderUrl, 100)),
      ]);
    } catch (imgError) {
      console.warn("[PDF Generator] Could not load images:", imgError);
      // Continue without images
    }

    // 4. Draw header on first page
    let startY = drawHeader(doc, PDF_CONFIG.margins.top, logoBase64, qrBase64, pageWidth, contentWidth);

    // 5. Prepare table data
    const tableData = products.map((product, index) => [
      index + 1,                                    // NO
      product.name || "-",                          // NAME
      product.companyName || "-",                   // COMPANY
      product.content || "-",                       // CONTENT
      product.mrp ? `${product.mrp}` : "-",         // MRP
      product.rate ? `${product.rate}` : "-",       // RATE
    ]);

    // 6. Calculate column widths in mm
    const colWidths = {
      no: (PDF_CONFIG.columns.no / 100) * contentWidth,
      name: (PDF_CONFIG.columns.name / 100) * contentWidth,
      company: (PDF_CONFIG.columns.company / 100) * contentWidth,
      content: (PDF_CONFIG.columns.content / 100) * contentWidth,
      mrp: (PDF_CONFIG.columns.mrp / 100) * contentWidth,
      rate: (PDF_CONFIG.columns.rate / 100) * contentWidth,
    };

    // 7. Generate table using autoTable plugin
    doc.autoTable({
      startY: startY,
      head: [["NO", "NAME", "COMPANY", "CONTENT", "MRP", "RATE"]],
      body: tableData,
      margin: { left: PDF_CONFIG.margins.left, right: PDF_CONFIG.margins.right },
      styles: {
        font: "helvetica",
        fontSize: PDF_CONFIG.fonts.tableBody.size,
        cellPadding: 1,
        textColor: PDF_CONFIG.colors.text,
        lineColor: PDF_CONFIG.colors.border,
        lineWidth: 0,
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.headerBg,
        textColor: PDF_CONFIG.colors.headerText,
        fontSize: PDF_CONFIG.fonts.tableHeader.size,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: colWidths.no, halign: "center" },      // NO
        1: { cellWidth: colWidths.name },                       // NAME
        2: { cellWidth: colWidths.company },                    // COMPANY
        3: { cellWidth: colWidths.content },                    // CONTENT
        4: { cellWidth: colWidths.mrp, halign: "center" },     // MRP
        5: { cellWidth: colWidths.rate, halign: "center" },    // RATE
      },
      alternateRowStyles: {
        fillColor: PDF_CONFIG.colors.rowOdd,
      },
      bodyStyles: {
        fillColor: PDF_CONFIG.colors.rowEven,
      },
      didDrawPage: (data) => {
        // Add page number to each page
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        const totalPages = doc.internal.getNumberOfPages();
        addPageNumber(doc, pageNumber, pageHeight, pageWidth);
      },
    });

    // 8. Save the PDF
    const fileName = `MedsWell_Catalogue_${formatDate(new Date())}.pdf`;
    doc.save(fileName);

    console.log(`[PDF Generator] PDF saved as: ${fileName}`);

    // Restore button state
    btn.innerHTML = originalContent;
    btn.disabled = false;

  } catch (error) {
    console.error("[PDF Generator] Error generating PDF:", error);
    alert("Failed to generate PDF. Please check the console for details.");

    // Restore button state on error
    const btn = document.getElementById("generate-pdf-btn");
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-file-pdf me-2"></i>Download Catalogue PDF';
      btn.disabled = false;
    }
  }
}

/* =============================================================================
   HELPER FUNCTIONS
   ============================================================================= */

/**
 * Draws the PDF header with logo, company name, URL, and QR code.
 * 
 * @param {jsPDF} doc - jsPDF document instance
 * @param {number} y - Starting Y position
 * @param {string|null} logoBase64 - Base64 encoded logo image
 * @param {string|null} qrBase64 - Base64 encoded QR code image
 * @param {number} pageWidth - Page width in mm
 * @param {number} contentWidth - Content width in mm
 * @returns {number} Y position after header (for table start)
 */
function drawHeader(doc, y, logoBase64, qrBase64, pageWidth, contentWidth) {
  const leftMargin = PDF_CONFIG.margins.left;
  const headerHeight = 25;

  // Background for header area
  doc.setFillColor(0, 0, 0);
  doc.rect(leftMargin, y, contentWidth, headerHeight, "F");

  // Logo (left side)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", leftMargin + 3, y + 2, 35, 20);
    } catch (e) {
      console.warn("[PDF Generator] Could not add logo:", e);
    }
  }

  // Company name and URL (center)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(PDF_CONFIG.fonts.header.size);
  doc.setFont("helvetica", "bold");
  doc.text(PDF_CONFIG.companyName, pageWidth / 2, y + 10, { align: "center" });

  doc.setFontSize(PDF_CONFIG.fonts.subheader.size);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 180, 255); // Light blue for URL
  doc.text(`Place Order From ${PDF_CONFIG.orderUrl}`, pageWidth / 2, y + 17, { align: "center" });

  // QR Code (right side)
  if (qrBase64) {
    try {
      doc.addImage(qrBase64, "PNG", pageWidth - PDF_CONFIG.margins.right - 22, y + 2, 20, 20);
    } catch (e) {
      console.warn("[PDF Generator] Could not add QR code:", e);
    }
  }

  // Reset text color for table
  doc.setTextColor(...PDF_CONFIG.colors.text);

  return y + headerHeight + 5; // Return position for table start
}

/**
 * Adds page number at the bottom of the page.
 * 
 * @param {jsPDF} doc - jsPDF document instance
 * @param {number} pageNum - Current page number
 * @param {number} pageHeight - Page height in mm
 * @param {number} pageWidth - Page width in mm
 */
function addPageNumber(doc, pageNum, pageHeight, pageWidth) {
  doc.setFontSize(PDF_CONFIG.fonts.pageNumber.size);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${pageNum}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );
}

/**
 * Formats a date as YYYY-MM-DD for filename.
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* =============================================================================
   AUTO-INITIALIZATION
   ============================================================================= */

/**
 * Automatically attach click handler when DOM is ready.
 * This allows the button to work without any additional setup.
 */
document.addEventListener("DOMContentLoaded", () => {
  const pdfBtn = document.getElementById("generate-pdf-btn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", generateProductPDF);
    console.log("[PDF Generator] Module initialized - button listener attached");
  }
});
