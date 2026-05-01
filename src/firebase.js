import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKbr-DYSWHo0a21MTVX7YHtaN1lfnj1cc",
  authDomain: "frtry2.firebaseapp.com",
  projectId: "frtry2",
  storageBucket: "frtry2.firebasestorage.app",
  messagingSenderId: "766786046338",
  appId: "1:766786046338:web:c4007259a28ed16653a79b"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);