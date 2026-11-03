import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase web configuration for the Digital Learning Ethiopia project.
// Do not place service-account private keys or admin credentials in this file.
const firebaseConfig = {
  apiKey: "AIzaSyDvv0Yu7pq7iNeh1tzoLKU_VAvoFJQMdbc",
  authDomain: "digital-learning-ethiopia.firebaseapp.com",
  projectId: "digital-learning-ethiopia",
  storageBucket: "digital-learning-ethiopia.firebasestorage.app",
  messagingSenderId: "612599786614",
  appId: "1:612599786614:web:619588070d10e5ef334357"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;