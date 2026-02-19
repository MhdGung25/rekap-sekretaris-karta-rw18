import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyDGL2iVMgTTgX9c9sKjbCai2ZBtybpkq7s",
  authDomain: "rekap-karta-rw18.firebaseapp.com",
  projectId: "rekap-karta-rw18",
  storageBucket: "rekap-karta-rw18.firebasestorage.app",
  messagingSenderId: "724072660677",
  appId: "1:724072660677:web:c559e45f1264af0a29baac",
  measurementId: "G-0Y76CV1V0H"
};

// 1. Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// 2. Inisialisasi Firestore (Database) - Ini yang paling penting untuk Rekap
export const db = getFirestore(app);

// 3. Inisialisasi Analytics (Opsional, untuk memantau trafik)
export const analytics = getAnalytics(app);

export default app;