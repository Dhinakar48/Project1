import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCXqcbtPHIVRBk_TcfbrTkNfIiKkHEoDVM",
  authDomain: "electroshop-489ed.firebaseapp.com",
  projectId: "electroshop-489ed",
  storageBucket: "electroshop-489ed.firebasestorage.app",
  messagingSenderId: "869172277808",
  appId: "1:869172277808:web:2e14393b107ac4bfe8b3f5",
  measurementId: "G-ND4X4MC21E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
