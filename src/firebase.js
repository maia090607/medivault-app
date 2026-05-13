// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCM8c7resQW_6nSgONO1jsII_TdLqw1eQQ",
  authDomain: "medivault-4b962.firebaseapp.com",
  databaseURL: "https://medivault-4b962-default-rtdb.firebaseio.com",
  projectId: "medivault-4b962",
  storageBucket: "medivault-4b962.firebasestorage.app",
  messagingSenderId: "844047616261",
  appId: "1:844047616261:web:5b94bbeb2ef43d14180f6c",
  measurementId: "G-L2RM2DMXLM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);