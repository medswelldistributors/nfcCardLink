import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
