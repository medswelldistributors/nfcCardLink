import { db, auth } from "./firebase.js";
import { collection, getDocs, addDoc, doc, getDoc, updateDoc, deleteDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ======================
   STATE
====================== */
const selectedProducts = new Map();

/* ======================
   AUTH HELPERS
====================== */

// Get current user (returns null if not logged in)
export function getCurrentUser() {
  return auth.currentUser;
}

// Check if user is authenticated (returns Promise)
export function checkAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

// Require authentication - redirects to login if not authenticated
export async function requireAuth(redirectUrl = "index.html") {
  const user = await checkAuth();
  if (!user) {
    window.location.href = redirectUrl;
    return null;
  }
  return user;
}

// Logout user and redirect to login page
export async function logout(redirectUrl = "index.html") {
  try {
    await signOut(auth);
    window.location.href = redirectUrl;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
}

/* ======================
   FETCH PRODUCTS
====================== */
export async function fetchProducts() {
  const snapshot = await getDocs(collection(db, "catlogue"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/* ======================
   WRITE To FIRESTORE
====================== */

export async function addProduct(product) {
  const docRef = doc(collection(db, "catlogue")); // auto-gen ID
  await setDoc(docRef, {
    ...product,
    id: docRef.id, // ✅ store auto ID inside document
    createdAt: serverTimestamp(),
  });
  return docRef;
}

/* ======================
   UPDATE PRODUCT
====================== */

export async function updateProduct(docId, productData) {
  const productRef = doc(db, "catlogue", docId);
  return await updateDoc(productRef, {
    ...productData,
    updatedAt: serverTimestamp(),
  });
}

/* ======================
   DELETE PRODUCT
====================== */

export async function deleteProduct(docId) {
  const productRef = doc(db, "catlogue", docId);
  return await deleteDoc(productRef);
}

/* ======================
   GET SINGLE PRODUCT
====================== */

export async function getProductById(docId) {
  const productRef = doc(db, "catlogue", docId);
  const productSnap = await getDoc(productRef);
  if (productSnap.exists()) {
    return { id: productSnap.id, ...productSnap.data() };
  }
  return null;
}
