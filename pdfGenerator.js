/**
 * [FILE ROLE]
 * - generate pdf from firebase products
 * -
 *
 * [FLOW]
 * fetchAllProducts → generateProductPDF → Result
 *
 * [DEPENDENCIES]
 * - firebase.js (db connection)
 * - other imports...
 */

import { fetchProducts } from "./services.firebase.js";

/* =============================================================================
   CONFIGURATION
   ============================================================================= */

const PDF_CONFIG = {
  companyName: "Medswell Distributors",
  orderUrl: "https://medswelldistributors.in/catlogue",

  // Local assets (relative to HTML file)
  logoPath: "./assets/card.jpg",
  qrPath: "./assets/Medswell_Site_QR.png",

  colors: {
    headerBg: [52, 58, 64],
    headerText: [255, 255, 255],
    urlText: [100, 180, 255],
    rowEven: [255, 255, 255],
    rowOdd: [248, 249, 250],
    text: [52, 58, 64],
    border: [222, 226, 230],
    popularBg: [254, 243, 199], // Amber-100
    popularStripe: [245, 158, 11], // Amber-500
  },

  fonts: {
    header: 16,
    subheader: 9,
    tableHeader: 9,
    tableBody: 10,
    pageNumber: 5,
  },

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

async function fetchAllProducts() {
  try {
    const products = await fetchProducts();
    return products.map((product) => ({
      ...product,
      isPopular: product.isPopular === true,
    }));
  } catch (error) {
    console.error("[PDF] Error fetching products:", error);
    throw new Error("Failed to fetch products from database");
  }
}

/* =============================================================================
   IMAGE LOADING
   ============================================================================= */

async function loadImageAsBase64(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    img.src = path;
  });
}

/* =============================================================================
   PDF GENERATION
   ============================================================================= */

export async function generateProductPDF() {
  const { jsPDF } = window.jspdf;

  if (!jsPDF) {
    alert("PDF library not loaded. Please refresh the page and try again.");
    return;
  }

  try {
    // Show loading state
    const btn = document.getElementById("generate-pdf-btn");
    const originalContent = btn?.innerHTML || "";
    if (btn) {
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Generating PDF...';
      btn.disabled = true;
    }

    // Fetch products
    console.log("[PDF] Fetching products...");
    const products = await fetchAllProducts();
    console.log(`[PDF] Found ${products.length} products`);

    if (products.length === 0) {
      alert("No products found in the database.");
      if (btn) {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      }
      return;
    }

    // Initialize PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load images from local assets
    let logoBase64 = null;
    let qrBase64 = null;

    try {
      console.log("[PDF] Loading images...");
      [logoBase64, qrBase64] = await Promise.all([loadImageAsBase64(PDF_CONFIG.logoPath), loadImageAsBase64(PDF_CONFIG.qrPath)]);
      console.log("[PDF] Images loaded successfully");
    } catch (imgError) {
      console.warn("[PDF] Could not load images:", imgError);
      alert("Warning: Logo or QR code image not found. PDF will be generated without images.");
    }

    // Draw header
    let startY = drawHeader(doc, logoBase64, qrBase64, pageWidth);

    // Prepare table data
    const tableData = products.map((product, index) => [index + 1, product.name || "-", product.companyName || "-", product.content || "-", product.mrp ? `${product.mrp}` : "-", product.rate ? `${product.rate}` : "-"]);

    // Calculate column widths
    const contentWidth = pageWidth;
    const colWidths = {
      no: (PDF_CONFIG.columns.no / 100) * contentWidth,
      name: (PDF_CONFIG.columns.name / 100) * contentWidth,
      company: (PDF_CONFIG.columns.company / 100) * contentWidth,
      content: (PDF_CONFIG.columns.content / 100) * contentWidth,
      mrp: (PDF_CONFIG.columns.mrp / 100) * contentWidth,
      rate: (PDF_CONFIG.columns.rate / 100) * contentWidth,
    };

    // Generate table
    doc.autoTable({
      startY: startY,
      head: [["NO", "NAME", "COMPANY", "CONTENT", "MRP", "RATE"]],
      body: tableData,
      margin: { left: 0, right: 0 },
      styles: {
        font: "helvetica",
        fontSize: PDF_CONFIG.fonts.tableBody,
        cellPadding: 1,
        textColor: PDF_CONFIG.colors.text,
        lineColor: PDF_CONFIG.colors.border,
        lineWidth: 0,
      },
      headStyles: {
        fillColor: PDF_CONFIG.colors.headerBg,
        textColor: PDF_CONFIG.colors.headerText,
        fontSize: PDF_CONFIG.fonts.tableHeader,
        fontStyle: "bold",
        halign: "center",
      },
      columnStyles: {
        0: { cellWidth: colWidths.no, halign: "center" },
        1: { cellWidth: colWidths.name },
        2: { cellWidth: colWidths.company },
        3: { cellWidth: colWidths.content },
        4: { cellWidth: colWidths.mrp },
        5: { cellWidth: colWidths.rate },
      },
      alternateRowStyles: {
        fillColor: PDF_CONFIG.colors.rowOdd,
      },
      bodyStyles: {
        fillColor: PDF_CONFIG.colors.rowEven,
      },
      didParseCell: (data) => {
        if (data.section !== "body") return;
        const product = products[data.row.index];
        if (!product?.isPopular) return;

        data.cell.styles.fillColor = PDF_CONFIG.colors.popularBg;
        data.cell.styles.fontStyle = "bold";
      },
      didDrawCell: (data) => {
        if (data.section !== "body") return;
        const product = products[data.row.index];
        if (!product?.isPopular) return;

        if (data.column.index === 0) {
          const { x, y, height } = data.cell;
          doc.setFillColor(...PDF_CONFIG.colors.popularStripe);
          doc.rect(x - 1.2, y, 1.2, height, "F");
        }
      },
      didDrawPage: () => {
        const pageNum = doc.internal.getCurrentPageInfo().pageNumber;
        addPageNumber(doc, pageNum, pageHeight, pageWidth);
      },
    });

    // Save PDF
    const fileName = `MedsWell_Catalogue_${formatDate(new Date())}.pdf`;
    doc.save(fileName);
    console.log(`[PDF] Saved as: ${fileName}`);

    // Restore button
    if (btn) {
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  } catch (error) {
    console.error("[PDF] Generation error:", error);
    alert("Failed to generate PDF. Check console for details.");

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

function drawHeader(doc, logoBase64, qrBase64, pageWidth) {
  const headerHeight = 25;
  const y = 0;

  // Black background
  doc.setFillColor(0, 0, 0);
  doc.rect(0, y, pageWidth, headerHeight, "F");

  // Logo (left side) - card.jpg
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "JPEG", 3, y + 2, 35, 20);
    } catch (e) {
      console.warn("[PDF] Could not add logo:", e);
    }
  }

  // Company name and URL (center)
  doc.setTextColor(...PDF_CONFIG.colors.headerText);
  doc.setFontSize(PDF_CONFIG.fonts.header);
  doc.setFont("helvetica", "bold");
  doc.text(PDF_CONFIG.companyName, pageWidth / 2, y + 10, { align: "center" });

  doc.setFontSize(PDF_CONFIG.fonts.subheader);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_CONFIG.colors.urlText);
  doc.text(`Place Order From ${PDF_CONFIG.orderUrl}`, pageWidth / 2, y + 17, { align: "center" });

  // QR Code (right side) - Medswell_Site_QR.png
  if (qrBase64) {
    try {
      doc.addImage(qrBase64, "PNG", pageWidth - 22, y + 2, 20, 20);
    } catch (e) {
      console.warn("[PDF] Could not add QR code:", e);
    }
  }

  // Reset text color
  doc.setTextColor(...PDF_CONFIG.colors.text);

  return y + headerHeight + 5;
}

function addPageNumber(doc, pageNum, pageHeight, pageWidth) {
  doc.setFontSize(PDF_CONFIG.fonts.pageNumber);
  doc.setTextColor(100, 100, 100);
  doc.text(`${pageNum}`, pageWidth / 2, pageHeight - 10, { align: "center" });
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* =============================================================================
   AUTO-INITIALIZATION
   ============================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const pdfBtn = document.getElementById("generate-pdf-btn");
  if (pdfBtn) {
    pdfBtn.addEventListener("click", generateProductPDF);
    console.log("[PDF] Module initialized");
  }
});
