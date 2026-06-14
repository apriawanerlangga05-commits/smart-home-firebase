import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBxZXSKQ5fAibifE-ESKtJT9_EEb4Oufd4",
  authDomain: "smart-home-c7386.firebaseapp.com",
  databaseURL: "https://smart-home-c7386-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-home-c7386",
  storageBucket: "smart-home-c7386.firebasestorage.app",
  messagingSenderId: "536884628078",
  appId: "1:536884628078:web:c0c8597a940a06a34bf47f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const db = getDatabase(app);

// Initialize Authentication
const auth = getAuth(app);

export { db, auth };
