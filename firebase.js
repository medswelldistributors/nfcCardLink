/**
 * [FILE ROLE]
 * - provide firebase connection to other files
 *
 * [FLOW]
 * initializeApp → getFirestore → getAuth → Result
 *
 * [DEPENDENCIES]
 * - firebase.js (db connection)
 * - firebase.js (auth connection)
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBityHCGW6rlK1HcqGv0CSrSxzxtiCI1nA",
  authDomain: "medswell-distributors.firebaseapp.com",
  projectId: "medswell-distributors",
  storageBucket: "medswell-distributors.firebasestorage.app",
  messagingSenderId: "207712114844",
  appId: "1:207712114844:web:60c53cb6eb19f988637559",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
