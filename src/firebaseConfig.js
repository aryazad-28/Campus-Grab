import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Paste your actual Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyCEa1IZY0bUi5aEGG6ylq38fVvzFFa1Tjo",
  authDomain: "canteenprototype.firebaseapp.com",
  projectId: "canteenprototype",
  storageBucket: "canteenprototype.firebasestorage.app",
  messagingSenderId: "266779376697",
  appId: "1:266779376697:web:16e3e502f3f0abcd3ce1e8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
export const db = getFirestore(app);
