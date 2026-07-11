// src/firebase/config.js
// -----------------------------------------------------------------------
// Paste the config object from your Firebase Console:
// Firebase Console -> Project Settings -> General -> Your apps -> SDK setup
// -----------------------------------------------------------------------
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAXqdmMyse-96qyxQiZS2Fc-M8tr6xfxaA",
  authDomain: "jp-studio-6281.firebaseapp.com",
  projectId: "jp-studio-6281",
storageBucket: "jp-studio-6281.appspot.com",
  messagingSenderId: "637214014226",
  appId: "1:637214014226:web:2b487cb98e930c9cd851cb"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
