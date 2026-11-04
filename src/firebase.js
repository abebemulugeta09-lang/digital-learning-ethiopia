
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvvOYu7pq7iNeh1tzoLKU_VAvOfJQMdbc",
  authDomain: "digital-learning-ethiopia.firebaseapp.com",
  projectId: "digital-learning-ethiopia",
  storageBucket: "digital-learning-ethiopia.firebasestorage.app",
  messagingSenderId: "612599786614",
  appId: "1:612599786614:web:619588070d10e5ef334357"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
