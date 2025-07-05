// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXfzoKD3X9eJqrJiRNU29cR2NJVVuXdLc",
  authDomain: "librarium-js.firebaseapp.com",
  projectId: "librarium-js",
  storageBucket: "librarium-js.firebasestorage.app",
  messagingSenderId: "136196993705",
  appId: "1:136196993705:web:a40bad12df5e229833efb8",
  measurementId: "G-5NF3ZQ4221"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics only on client side
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app; 