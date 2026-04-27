import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from "firebase/firestore";

// 🔐 YOUR CONFIG
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "XXX",
  appId: "XXX"
};

// 🚀 INIT APP
const app = initializeApp(firebaseConfig);

// ✅ FINAL FIX (NO LOCK, FAST, STABLE)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager() // 🔥 FIX
  })
});