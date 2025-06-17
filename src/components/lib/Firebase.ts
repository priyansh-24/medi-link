// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBV5y1vplS5vdQFm6eHeaBbh83ShY-GXV0",
  authDomain: "docter-c4e03.firebaseapp.com",
  databaseURL: "https://docter-c4e03-default-rtdb.firebaseio.com",
  projectId: "docter-c4e03",
  storageBucket: "docter-c4e03.firebasestorage.app",
  messagingSenderId: "74921325742",
  appId: "1:74921325742:web:2a2ae0d33cbf16d653e93f",
  measurementId: "G-RTH0DYY1DX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if supported (prevents SSR errors)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Initialize common services
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Export initialized services
export { app, analytics, auth, db, storage };

