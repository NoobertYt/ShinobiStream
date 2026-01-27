
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCqu3Y6dci5ghZEbkRHQO54kl7A969C5_E",
  authDomain: "htmlive-a2dec.firebaseapp.com",
  projectId: "htmlive-a2dec",
  storageBucket: "htmlive-a2dec.firebasestorage.app",
  messagingSenderId: "569991957674",
  appId: "1:569991957674:web:7c4fddf55a34e97e8894d3",
  measurementId: "G-94XH6ERC4J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
