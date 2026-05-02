import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCaZhAb3W_EOgltO9C9W5FaNWgCWWCVifA",
  authDomain: "my-english-community.firebaseapp.com",
  projectId: "my-english-community",
  storageBucket: "my-english-community.firebasestorage.app",
  messagingSenderId: "41659771794",
  appId: "1:41659771794:web:bbd997b29621ad5a28af4b",
  measurementId: "G-70XHY22MLS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (Optional)
const analytics = getAnalytics(app);

// Auth Export (Sabse important login ke liye)
export const auth = getAuth(app);