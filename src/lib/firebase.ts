// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "motoassist-bocw8",
  appId: "1:256364058938:web:1e3356ed73f3a84f21d803",
  storageBucket: "motoassist-bocw8.firebasestorage.app",
  apiKey: "AIzaSyCMEHzRUxURj4X5K0vAqCyQPBo0hq-3jrA",
  authDomain: "motoassist-bocw8.firebaseapp.com",
  messagingSenderId: "256364058938",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
