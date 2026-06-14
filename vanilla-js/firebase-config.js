/**
 * firebase-config.js
 * Konfigurasi Firebase untuk terhubung ke Firebase Realtime Database.
 * Menggunakan Firebase Web Modular SDK v10.12.2 yang diimpor langsung via CDN.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBxZXSKQ5fAibifE-ESKtJT9_EEb4Oufd4",
  authDomain: "smart-home-c7386.firebaseapp.com",
  databaseURL: "https://smart-home-c7386-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-home-c7386",
  storageBucket: "smart-home-c7386.firebasestorage.app",
  messagingSenderId: "536884628078",
  appId: "1:536884628078:web:c0c8597a940a06a34bf47f"
};

// Inisialisasi Aplikasi Firebase
const app = initializeApp(firebaseConfig);

// Inisialisasi Realtime Database
const db = getDatabase(app);

// Ekspor objek db agar bisa digunakan di script.js
export { db };
