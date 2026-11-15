// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeCB9z0ThqnOlVyT_pcJbZWEN0YUHBJH8",
  authDomain: "api-yu-gi-oh.firebaseapp.com",
  projectId: "api-yu-gi-oh",
  storageBucket: "api-yu-gi-oh.firebasestorage.app",
  messagingSenderId: "97650012952",
  appId: "1:97650012952:web:4151d3dd001223627da46d",
  measurementId: "G-VE9JPL76GR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // ✅ ¡Esto es necesario!

export { auth, db };