
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvvOYu7pq7iNeh1tzoLKU_VAvoFJQMdbc",
  authDomain: "digital-learning-ethiopia.firebaseapp.com",
  projectId: "digital-learning-ethiopia",
  storageBucket: "digital-learning-ethiopia.firebasestorage.app",
  messagingSenderId: "612599786614",
  appId: "1:612599786614:web:619588070d10e5ef334357"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
