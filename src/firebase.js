// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAP9GSwbr86G0YlAE-e-QnLbR72IHpppNw",
  authDomain: "fitnessrpg-3e4f4.firebaseapp.com",
  projectId: "fitnessrpg-3e4f4",
  storageBucket: "fitnessrpg-3e4f4.firebasestorage.app",
  messagingSenderId: "1003200510585",
  appId: "1:1003200510585:web:b687678864877f9a96b2a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Firebase services we'll use
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };