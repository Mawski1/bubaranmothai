import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDGw2lJIVYIFxbwB-IskeUzPDzqBDAxrYs",
  authDomain: "bubaranmothaii-14d1d.firebaseapp.com",
  projectId: "bubaranmothaii-14d1d",
  storageBucket: "bubaranmothaii-14d1d.firebasestorage.app",
  messagingSenderId: "572746904502",
  appId: "1:572746904502:web:62b61c9f1abcfa5fec8717"
};

// Mencegah error re-initialization pada Next.js (App Router)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);